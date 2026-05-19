import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import AppHeader from '../components/AppHeader';
import { Colors } from '../constants/colors';
import { getFlight, getWinery } from '../services/wineryService';
import {
  createGuidedSession,
  saveGuidedSession,
  saveFlightForSession,
  loadActiveSessionForFlight,
  archiveFlightSession,
  clearGuidedSession,
  saveFlightOverride,
  loadFlightOverride,
} from '../storage/guidedSessionStorage';
import { loadWines } from '../storage/wineStorage';
import { TastingFlight, Winery, FlightWine, GuidedSession, Wine, WineStyle } from '../types';
import { useWineTasting } from '../context/WineTastingContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'TastingFlightDetail'>;

const STYLE_EMOJI: Record<string, string> = {
  red: '🍷',
  white: '🥂',
  rose: '🌸',
  sparkling: '✨',
};

const STYLE_OPTIONS: { value: WineStyle; label: string }[] = [
  { value: 'red', label: 'Red' },
  { value: 'white', label: 'White' },
  { value: 'rose', label: 'Rosé' },
  { value: 'sparkling', label: 'Sparkling' },
];

function WineRow({
  wine,
  index,
  completedWine,
  onPress,
  editMode,
  onRemove,
}: {
  wine: FlightWine;
  index: number;
  completedWine: Wine | null;
  onPress: () => void;
  editMode: boolean;
  onRemove: () => void;
}) {
  const isCompleted = completedWine !== null;

  return (
    <View style={styles.wineRow}>
      <TouchableOpacity
        style={[
          styles.winePosition,
          isCompleted && !editMode && styles.winePositionDone,
          editMode && styles.winePositionRemove,
        ]}
        onPress={editMode ? onRemove : onPress}
        activeOpacity={0.7}
      >
        <Text style={styles.winePositionText}>
          {editMode ? '×' : isCompleted ? '✓' : index + 1}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.wineInfo}
        onPress={editMode ? undefined : onPress}
        activeOpacity={editMode ? 1 : 0.7}
        disabled={editMode}
      >
        <Text style={styles.wineName}>
          {STYLE_EMOJI[wine.style ?? ''] ?? '🍾'} {wine.name} {wine.vintage}
        </Text>
        <Text style={styles.wineProducer}>{wine.producer}</Text>
        {wine.region || wine.country ? (
          <Text style={styles.wineMeta}>
            {[wine.region, wine.country].filter(Boolean).join(', ')}
          </Text>
        ) : null}
        {wine.grapes.length > 0 && (
          <Text style={styles.wineGrapes}>{wine.grapes.join(', ')}</Text>
        )}
        {wine.description ? (
          <Text style={styles.wineDesc}>{wine.description}</Text>
        ) : null}

        {!editMode && isCompleted ? (
          <View style={styles.completionRow}>
            {completedWine.rating !== null && (
              <Text style={styles.completionRating}>★ {completedWine.rating}/10</Text>
            )}
            {completedWine.liked === true && <Text style={styles.completionEmoji}>👍</Text>}
            {completedWine.liked === false && <Text style={styles.completionEmoji}>👎</Text>}
            {completedWine.notes ? (
              <Text style={styles.completionNotes} numberOfLines={1}>
                "{completedWine.notes}"
              </Text>
            ) : null}
          </View>
        ) : !editMode ? (
          <Text style={styles.tapToTaste}>Tap to taste →</Text>
        ) : null}
      </TouchableOpacity>
    </View>
  );
}

export default function TastingFlightDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const [flight, setFlight] = useState<TastingFlight | null>(null);
  const [winery, setWinery] = useState<Winery | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<GuidedSession | null>(null);
  const [completedWines, setCompletedWines] = useState<Record<string, Wine>>({});
  const [isLocalOverride, setIsLocalOverride] = useState(false);

  // Edit mode
  const [editMode, setEditMode] = useState(false);

  // Add wine modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState('');
  const [addProducer, setAddProducer] = useState('');
  const [addVintage, setAddVintage] = useState('');
  const [addStyle, setAddStyle] = useState<WineStyle | null>(null);

  const { reset, update, setGuidedSessionId, setTastingType } = useWineTasting();

  useEffect(() => {
    (async () => {
      try {
        const [f, w] = await Promise.all([
          getFlight(params.flightId, params.wineryId),
          getWinery(params.wineryId),
        ]);
        // Prefer local override if one exists
        const override = await loadFlightOverride(params.flightId);
        if (override) {
          setFlight(override);
          setIsLocalOverride(true);
        } else {
          setFlight(f);
          setIsLocalOverride(false);
        }
        setWinery(w);
      } finally {
        setLoading(false);
      }
    })();
  }, [params.flightId, params.wineryId]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const s = await loadActiveSessionForFlight(params.flightId);
        setSession(s);
        if (s) {
          const allWines = await loadWines();
          const map: Record<string, Wine> = {};
          Object.entries(s.completedWineIds).forEach(([flightWineId, savedWineId]) => {
            if (savedWineId) {
              const found = allWines.find(w => w.id === savedWineId);
              if (found) map[flightWineId] = found;
            }
          });
          setCompletedWines(map);
        } else {
          setCompletedWines({});
        }
      })();
    }, [params.flightId])
  );

  const handleRemoveWine = (wineId: string) => {
    if (!flight) return;
    const isCompleted = completedWines[wineId] != null;
    if (isCompleted) {
      Alert.alert(
        'Remove Tasted Wine?',
        'This wine has already been tasted. Removing it from the flight won\'t delete the saved tasting.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', style: 'destructive', onPress: () => commitRemove(wineId) },
        ]
      );
    } else {
      commitRemove(wineId);
    }
  };

  const commitRemove = async (wineId: string) => {
    if (!flight) return;
    const updated: TastingFlight = {
      ...flight,
      wines: flight.wines.filter(w => w.id !== wineId),
    };
    await saveFlightOverride(updated);
    setFlight(updated);
    setIsLocalOverride(true);
  };

  const handleAddWine = async () => {
    if (!flight || !addName.trim()) return;
    const newWine: FlightWine = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      position: flight.wines.length > 0
        ? Math.max(...flight.wines.map(w => w.position)) + 1
        : 1,
      name: addName.trim(),
      producer: addProducer.trim(),
      vintage: addVintage.trim(),
      style: addStyle,
      grapes: [],
      region: '',
      country: '',
      abv: '',
      description: '',
      imageUrl: null,
    };
    const updated: TastingFlight = {
      ...flight,
      wines: [...flight.wines, newWine],
    };
    await saveFlightOverride(updated);
    setFlight(updated);
    setIsLocalOverride(true);
    closeAddModal();
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setAddName('');
    setAddProducer('');
    setAddVintage('');
    setAddStyle(null);
  };

  const handleWineTap = async (wine: FlightWine, sortedIndex: number) => {
    if (!flight || !winery) return;

    let activeSession = session;
    if (!activeSession) {
      activeSession = createGuidedSession({
        wineryId: winery.id,
        flightId: flight.id,
        flightName: flight.name,
        wineryName: winery.name,
      });
      await saveFlightForSession(flight);
    }

    const updatedSession = { ...activeSession, currentIndex: sortedIndex, currentWineId: wine.id };
    await saveGuidedSession(updatedSession);
    setSession(updatedSession);

    reset();
    setTastingType('full');
    setGuidedSessionId(activeSession.id);
    update({
      name: wine.name,
      producer: wine.producer,
      vintage: wine.vintage,
      style: wine.style ?? undefined,
      grapes: wine.grapes,
      country: wine.country ?? '',
      region: wine.region ?? '',
      abv: wine.abv ?? '',
    });

    navigation.navigate('BasicInfo', { guidedSessionId: activeSession.id });
  };

  const handleCompleteTasting = async () => {
    if (session && flight) {
      await archiveFlightSession(session, flight);
      await clearGuidedSession();
    }
    navigation.reset({
      index: 2,
      routes: [
        { name: 'Home' },
        { name: 'WineryCheckIn' },
        { name: 'WineryDetail', params: { wineryId: params.wineryId } },
      ],
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <AppHeader title="Tasting Flight" />
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  if (!flight || !winery) {
    return (
      <SafeAreaView style={styles.safe}>
        <AppHeader title="Tasting Flight" />
        <View style={styles.errorState}>
          <Text style={styles.errorText}>Couldn't load this flight. Please try again.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const sortedWines = flight.wines.slice().sort((a, b) => a.position - b.position);
  const completedCount = Object.keys(completedWines).length;

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title={flight.name} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.flightHeader}>
          <Text style={styles.wineryName}>{winery.name}</Text>
          <Text style={styles.flightName}>{flight.name}</Text>
          {flight.description ? (
            <Text style={styles.flightDesc}>{flight.description}</Text>
          ) : null}
          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>
                {flight.wines.length} wine{flight.wines.length !== 1 ? 's' : ''}
              </Text>
            </View>
            {completedCount > 0 && (
              <View style={styles.progressBadge}>
                <Text style={styles.progressBadgeText}>
                  {completedCount}/{flight.wines.length} tasted
                </Text>
              </View>
            )}
            {isLocalOverride && (
              <View style={styles.modifiedBadge}>
                <Text style={styles.modifiedBadgeText}>modified</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.editFlightBtn}
            onPress={() => setEditMode(e => !e)}
            activeOpacity={0.7}
          >
            <Text style={styles.editFlightBtnText}>
              {editMode ? 'Done' : '✎ Edit Flight'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>The Flight</Text>
        {sortedWines.map((wine, i) => (
          <WineRow
            key={wine.id}
            wine={wine}
            index={i}
            completedWine={completedWines[wine.id] ?? null}
            onPress={() => handleWineTap(wine, i)}
            editMode={editMode}
            onRemove={() => handleRemoveWine(wine.id)}
          />
        ))}

        {editMode && (
          <TouchableOpacity
            style={styles.addWineBtn}
            onPress={() => setShowAddModal(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.addWineBtnText}>+ Add Wine</Text>
          </TouchableOpacity>
        )}

        {!editMode && session !== null && (
          <TouchableOpacity style={styles.completeBtn} onPress={handleCompleteTasting} activeOpacity={0.85}>
            <Text style={styles.completeBtnText}>Complete Tasting</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add Wine Modal */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={closeAddModal}>
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeAddModal} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Add Wine to Flight</Text>

            <TextInput
              style={styles.input}
              placeholder="Wine name (required)"
              placeholderTextColor={Colors.textMuted}
              value={addName}
              onChangeText={setAddName}
              returnKeyType="next"
            />
            <TextInput
              style={styles.input}
              placeholder="Producer"
              placeholderTextColor={Colors.textMuted}
              value={addProducer}
              onChangeText={setAddProducer}
              returnKeyType="next"
            />
            <TextInput
              style={styles.input}
              placeholder="Vintage"
              placeholderTextColor={Colors.textMuted}
              value={addVintage}
              onChangeText={setAddVintage}
              keyboardType="numeric"
              returnKeyType="done"
            />

            <Text style={styles.inputLabel}>Style</Text>
            <View style={styles.styleRow}>
              {STYLE_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.styleChip, addStyle === opt.value && styles.styleChipActive]}
                  onPress={() => setAddStyle(s => s === opt.value ? null : opt.value)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.styleChipText, addStyle === opt.value && styles.styleChipTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.addConfirmBtn, !addName.trim() && styles.addConfirmBtnDisabled]}
              onPress={handleAddWine}
              disabled={!addName.trim()}
              activeOpacity={0.85}
            >
              <Text style={styles.addConfirmBtnText}>Add to Flight</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelLink} onPress={closeAddModal}>
              <Text style={styles.cancelLinkText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20 },
  errorState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  errorText: { fontSize: 15, color: Colors.textMuted, textAlign: 'center' },
  flightHeader: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    gap: 6,
  },
  wineryName: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  flightName: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
    textAlign: 'center',
  },
  flightDesc: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  metaBadge: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  metaBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  progressBadge: {
    backgroundColor: '#e8f5e9',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  progressBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2e7d32',
  },
  modifiedBadge: {
    backgroundColor: '#fff3e0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  modifiedBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#e65100',
  },
  editFlightBtn: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 20,
  },
  editFlightBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    textDecorationLine: 'underline',
    marginBottom: 12,
  },
  wineRow: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  winePosition: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.btnWinery,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  winePositionDone: {
    backgroundColor: '#2e7d32',
  },
  winePositionRemove: {
    backgroundColor: Colors.disliked,
  },
  winePositionText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 15,
  },
  wineInfo: { flex: 1, gap: 3 },
  wineName: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
  },
  wineProducer: { fontSize: 13, color: Colors.textMuted },
  wineMeta: { fontSize: 12, color: Colors.textMuted },
  wineGrapes: { fontSize: 12, color: Colors.textMuted, fontStyle: 'italic' },
  wineDesc: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
    marginTop: 4,
    backgroundColor: Colors.surface,
    borderRadius: 6,
    padding: 8,
  },
  tapToTaste: {
    fontSize: 12,
    color: Colors.primaryDark,
    fontWeight: '600',
    marginTop: 6,
  },
  completionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  completionRating: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2e7d32',
  },
  completionEmoji: {
    fontSize: 14,
  },
  completionNotes: {
    fontSize: 12,
    color: Colors.textMuted,
    fontStyle: 'italic',
    flex: 1,
  },
  addWineBtn: {
    marginTop: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addWineBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  completeBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  completeBtnText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  // Add wine modal
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    gap: 12,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 13 : 10,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: Colors.white,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: -4,
  },
  styleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  styleChip: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  styleChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  styleChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  styleChipTextActive: {
    color: Colors.white,
  },
  addConfirmBtn: {
    backgroundColor: Colors.btnWinery,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  addConfirmBtnDisabled: {
    opacity: 0.4,
  },
  addConfirmBtnText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  cancelLink: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  cancelLinkText: {
    fontSize: 14,
    color: Colors.textMuted,
    textDecorationLine: 'underline',
  },
});
