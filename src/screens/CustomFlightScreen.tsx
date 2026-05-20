import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import AppHeader from '../components/AppHeader';
import { Colors } from '../constants/colors';
import { loadWines } from '../storage/wineStorage';
import { isCustomFlightCompleted, markCustomFlightCompleted } from '../storage/customFlightStorage';
import {
  getPendingWines,
  removePendingWine,
  clearPendingWines,
  getOriginalWines,
  addSkippedWineId,
  getSkippedWineIds,
  FlightPendingWine,
} from '../storage/flightPendingWineStorage';
import { Wine } from '../types';
import { useWineTasting } from '../context/WineTastingContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'CustomFlight'>;

type FlightWineItem =
  | { kind: 'pending'; wine: FlightPendingWine; index: number }
  | { kind: 'tasted'; wine: Wine; index: number }
  | { kind: 'skipped'; wine: FlightPendingWine; index: number };

const STYLE_EMOJI: Record<string, string> = {
  red: '🍷', white: '🥂', rose: '🌸', sparkling: '✨', orange: '🍊', dessert: '🍯',
};

// ── Wine row ──────────────────────────────────────────────────────────────────

function ManualWineRow({
  name, producer, vintage, style, region, country, grapes,
  index, isTasted, isSkipped, tastedWine, editMode, canRemove, onPress, onRemove,
}: {
  name: string;
  producer?: string;
  vintage?: string;
  style?: string;
  region?: string;
  country?: string;
  grapes?: string[];
  index: number;
  isTasted: boolean;
  isSkipped?: boolean;
  tastedWine?: Wine | null;
  editMode: boolean;
  canRemove: boolean;
  onPress: () => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.wineRow}>
      <TouchableOpacity
        style={[
          styles.winePosition,
          isTasted && !editMode && styles.winePositionDone,
          isSkipped && styles.winePositionSkipped,
          editMode && canRemove && styles.winePositionRemove,
        ]}
        onPress={editMode && canRemove ? onRemove : (!isSkipped ? onPress : undefined)}
        activeOpacity={0.7}
      >
        <Text style={styles.winePositionText}>
          {editMode && canRemove ? '×' : isTasted ? '✓' : isSkipped ? '–' : index + 1}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.wineInfo, isSkipped && styles.wineInfoSkipped]}
        onPress={editMode || isSkipped ? undefined : onPress}
        activeOpacity={editMode || isSkipped ? 1 : 0.7}
        disabled={editMode || isSkipped}
      >
        <Text style={styles.wineName}>
          {STYLE_EMOJI[style ?? ''] ?? '🍾'} {[name, vintage].filter(Boolean).join(' ') || 'Unknown Wine'}
        </Text>
        {producer ? <Text style={styles.wineProducer}>{producer}</Text> : null}
        {(region || country) ? (
          <Text style={styles.wineMeta}>{[region, country].filter(Boolean).join(', ')}</Text>
        ) : null}
        {grapes && grapes.length > 0 && (
          <Text style={styles.wineGrapes}>{grapes.join(', ')}</Text>
        )}
        {!editMode && isTasted && tastedWine ? (
          <View style={styles.completionRow}>
            {tastedWine.rating != null && (
              <Text style={styles.completionRating}>★ {tastedWine.rating}/10</Text>
            )}
            {tastedWine.liked === true && <Text style={styles.completionEmoji}>👍</Text>}
            {tastedWine.liked === false && <Text style={styles.completionEmoji}>👎</Text>}
            {tastedWine.notes ? (
              <Text style={styles.completionNotes} numberOfLines={1}>"{tastedWine.notes}"</Text>
            ) : null}
          </View>
        ) : !editMode && isSkipped ? (
          <Text style={styles.skippedText}>Skipped</Text>
        ) : !editMode && !isTasted && !isSkipped ? (
          <Text style={styles.tapToTaste}>Tap to taste →</Text>
        ) : null}
      </TouchableOpacity>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function CustomFlightScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { setCustomFlight, setTastingType, update, setScanApplied } = useWineTasting();

  const [wines, setWines] = useState<Wine[]>([]);
  const [pendingWines, setPendingWines] = useState<FlightPendingWine[]>([]);
  const [originalWines, setOriginalWines] = useState<FlightPendingWine[]>([]);
  const [skippedWineIds, setSkippedWineIds] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useFocusEffect(
    useCallback(() => {
      Promise.all([
        loadWines(),
        isCustomFlightCompleted(params.flightId),
        getPendingWines(params.flightId),
        getOriginalWines(params.flightId),
        getSkippedWineIds(params.flightId),
      ]).then(([all, completed, pending, original, skipped]) => {
        setWines(all.filter(w => w.flightId === params.flightId));
        setIsCompleted(completed);
        setPendingWines(pending);
        setOriginalWines(original);
        setSkippedWineIds(skipped);
      });
    }, [params.flightId])
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (isCompleted || e.data.action.type !== 'GO_BACK') return;
      e.preventDefault();
      Alert.alert(
        'Cancel Flight?',
        "Future wines won't be added to this flight. Already tasted wines remain in your collection.",
        [
          { text: 'Keep Flight', style: 'cancel' },
          {
            text: 'Cancel Flight',
            style: 'destructive',
            onPress: () => {
              setCustomFlight(null, null);
              navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
            },
          },
        ]
      );
    });
    return unsubscribe;
  }, [navigation, isCompleted, setCustomFlight]);

  const isSequentialFlight = originalWines.length > 0;

  // Progress (sequential flights only)
  const tastedCount = wines.filter(w => w.flightWineId).length;
  const skippedCount = skippedWineIds.length;
  const total = originalWines.length;
  const doneCount = tastedCount + skippedCount;
  const progress = total > 0 ? doneCount / total : 0;

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleTastePendingWine = (wine: FlightPendingWine, type: 'quick' | 'full') => {
    setTastingType(type);
    setCustomFlight(params.flightId, params.flightName);
    update({
      name: wine.name ?? '',
      producer: wine.producer ?? '',
      vintage: wine.vintage ?? '',
      country: wine.country ?? '',
      region: wine.region ?? '',
      grapes: wine.grapes ?? [],
      abv: wine.abv ?? '',
      price: wine.price ?? '',
      flightWineId: wine.id,
    });
    setScanApplied(true);
    removePendingWine(params.flightId, wine.id);
    setPendingWines(prev => prev.filter(w => w.id !== wine.id));
    navigation.navigate('BasicInfo');
  };

  const handleSkipWine = async (wine: FlightPendingWine) => {
    await addSkippedWineId(params.flightId, wine.id);
    await removePendingWine(params.flightId, wine.id);
    setSkippedWineIds(prev => [...prev, wine.id]);
    setPendingWines(prev => prev.filter(w => w.id !== wine.id));
  };

  const handleStartTasting = (wine: FlightPendingWine) => {
    const buttons: any[] = [
      { text: 'Quick Sip', onPress: () => handleTastePendingWine(wine, 'quick') },
      { text: 'Guided Tasting', onPress: () => handleTastePendingWine(wine, 'full') },
    ];
    if (isSequentialFlight) {
      buttons.push({ text: 'Skip Wine', onPress: () => handleSkipWine(wine) });
    }
    buttons.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert(
      wine.name || wine.producer || 'Start Tasting',
      'Choose your tasting style:',
      buttons,
    );
  };

  const handleAddWine = () => {
    navigation.navigate('BasicInfo', { addToFlightId: params.flightId, addToFlightName: params.flightName });
  };

  const handleCompleteFlight = () => {
    Alert.alert(
      'Complete Flight?',
      `Your ${wines.length} wine${wines.length !== 1 ? 's' : ''} are saved. No more wines can be added after this.`,
      [
        { text: 'Not Yet', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            if (isSequentialFlight) {
              for (const w of pendingWines) {
                await addSkippedWineId(params.flightId, w.id);
              }
              await clearPendingWines(params.flightId);
            }
            await markCustomFlightCompleted(params.flightId);
            setCustomFlight(null, null);
            navigation.reset({ index: 1, routes: [{ name: 'Home' }, { name: 'MyFlights' }] });
          },
        },
      ]
    );
  };

  const handleRemovePendingWine = async (wineId: string) => {
    await removePendingWine(params.flightId, wineId);
    setPendingWines(prev => prev.filter(w => w.id !== wineId));
  };

  const handleCancelFlight = () => {
    Alert.alert(
      'Cancel Flight?',
      "Future wines won't be added to this flight. Already tasted wines remain in your collection.",
      [
        { text: 'Keep Flight', style: 'cancel' },
        {
          text: 'Cancel Flight',
          style: 'destructive',
          onPress: () => {
            setCustomFlight(null, null);
            navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
          },
        },
      ]
    );
  };

  // ── Build unified wine list ──────────────────────────────────────────────────

  const allFlightWines: FlightWineItem[] = isSequentialFlight
    ? originalWines.map((w, i) => {
        const tasted = wines.find(saved => saved.flightWineId === w.id);
        if (tasted) return { kind: 'tasted', wine: tasted, index: i };
        if (skippedWineIds.includes(w.id)) return { kind: 'skipped', wine: w, index: i };
        return { kind: 'pending', wine: w, index: i };
      })
    : [
        ...pendingWines.map((w, i) => ({ kind: 'pending' as const, wine: w, index: i })),
        ...wines.map((w, i) => ({ kind: 'tasted' as const, wine: w, index: pendingWines.length + i })),
      ];

  const totalCount = allFlightWines.length;
  const allDone = isSequentialFlight
    ? pendingWines.length === 0 && originalWines.length > 0
    : wines.length > 0;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title={params.flightName} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.flightHeader}>
          <Text style={styles.flightLabel}>Custom Flight</Text>
          <Text style={styles.flightName}>{params.flightName}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>
                {totalCount} wine{totalCount !== 1 ? 's' : ''}
              </Text>
            </View>
            {wines.length > 0 && totalCount > 0 && (
              <View style={styles.progressBadge}>
                <Text style={styles.progressBadgeText}>{wines.length}/{totalCount} tasted</Text>
              </View>
            )}
            {isCompleted && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedBadgeText}>Completed</Text>
              </View>
            )}
          </View>
          {!isSequentialFlight && (
            <TouchableOpacity
              style={styles.editFlightBtn}
              onPress={() => setEditMode(e => !e)}
              activeOpacity={0.7}
            >
              <Text style={styles.editFlightBtnText}>{editMode ? 'Done' : '✎ Edit Flight'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {isSequentialFlight && originalWines.length > 0 && (
          <View style={[styles.progressContainer, { marginBottom: 16 }]}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {doneCount} of {total} wines done
            </Text>
          </View>
        )}

        {totalCount > 0 ? (
          <>
            <Text style={styles.sectionLabel}>The Flight</Text>
            {allFlightWines.map((item) => {
              if (item.kind === 'pending') {
                return (
                  <ManualWineRow
                    key={item.wine.id}
                    name={item.wine.name ?? ''}
                    producer={item.wine.producer}
                    vintage={item.wine.vintage}
                    region={item.wine.region}
                    country={item.wine.country}
                    grapes={item.wine.grapes}
                    index={item.index}
                    isTasted={false}
                    editMode={editMode}
                    canRemove={!isSequentialFlight}
                    onPress={() => handleStartTasting(item.wine)}
                    onRemove={() => handleRemovePendingWine(item.wine.id)}
                  />
                );
              }
              if (item.kind === 'skipped') {
                return (
                  <ManualWineRow
                    key={item.wine.id}
                    name={item.wine.name ?? ''}
                    producer={item.wine.producer}
                    vintage={item.wine.vintage}
                    region={item.wine.region}
                    country={item.wine.country}
                    grapes={item.wine.grapes}
                    index={item.index}
                    isTasted={false}
                    isSkipped={true}
                    editMode={false}
                    canRemove={false}
                    onPress={() => {}}
                    onRemove={() => {}}
                  />
                );
              }
              return (
                <ManualWineRow
                  key={item.wine.id}
                  name={item.wine.name}
                  producer={item.wine.producer}
                  vintage={item.wine.vintage}
                  style={item.wine.style ?? undefined}
                  region={item.wine.region}
                  country={item.wine.country}
                  grapes={item.wine.grapes}
                  index={item.index}
                  isTasted={true}
                  tastedWine={item.wine}
                  editMode={editMode}
                  canRemove={false}
                  onPress={() => navigation.navigate('WineDetail', { wineId: item.wine.id })}
                  onRemove={() => {}}
                />
              );
            })}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🍾</Text>
            <Text style={styles.emptyTitle}>No wines yet</Text>
            <Text style={styles.emptyDesc}>Tap "+ Add Wine" below to start tasting.</Text>
          </View>
        )}

        {!isCompleted && (
          <TouchableOpacity style={styles.addWineBtn} onPress={handleAddWine} activeOpacity={0.85}>
            <Text style={styles.addWineBtnText}>+ Add Wine</Text>
          </TouchableOpacity>
        )}

        {!editMode && !isCompleted && allDone && (
          <TouchableOpacity style={styles.completeBtn} onPress={handleCompleteFlight} activeOpacity={0.85}>
            <Text style={styles.completeBtnText}>Complete Flight</Text>
          </TouchableOpacity>
        )}

        {!editMode && !isCompleted && (
          <TouchableOpacity style={styles.cancelLink} onPress={handleCancelFlight}>
            <Text style={styles.cancelLinkText}>Cancel Flight</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20 },

  // ── Progress bar ──
  progressContainer: { gap: 6 },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.btnWinery,
    borderRadius: 4,
  },
  progressText: { fontSize: 13, color: Colors.textMuted, textAlign: 'right' },

  // ── Flight header ──
  flightHeader: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    gap: 6,
  },
  flightLabel: {
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
  metaRow: { flexDirection: 'row', gap: 8, marginTop: 6, alignItems: 'center', justifyContent: 'center' },
  metaBadge: { backgroundColor: Colors.primaryLight, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  metaBadgeText: { fontSize: 13, fontWeight: '700', color: Colors.primaryDark },
  progressBadge: { backgroundColor: '#e8f5e9', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  progressBadgeText: { fontSize: 13, fontWeight: '700', color: '#2e7d32' },
  completedBadge: { backgroundColor: '#2e7d32', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  completedBadgeText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  editFlightBtn: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 20,
  },
  editFlightBtnText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  // ── Wine list ──
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
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.btnWinery,
    alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  winePositionDone: { backgroundColor: '#2e7d32' },
  winePositionSkipped: { backgroundColor: Colors.border },
  winePositionRemove: { backgroundColor: Colors.disliked },
  winePositionText: { color: Colors.white, fontWeight: '800', fontSize: 15 },
  wineInfo: { flex: 1, gap: 3 },
  wineInfoSkipped: { opacity: 0.5 },
  wineName: {
    fontSize: 16, fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
  },
  wineProducer: { fontSize: 13, color: Colors.textMuted },
  wineMeta: { fontSize: 12, color: Colors.textMuted },
  wineGrapes: { fontSize: 12, color: Colors.textMuted, fontStyle: 'italic' },
  tapToTaste: { fontSize: 12, color: Colors.primaryDark, fontWeight: '600', marginTop: 6 },
  skippedText: { fontSize: 12, color: Colors.textMuted, fontStyle: 'italic', marginTop: 4 },
  completionRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  completionRating: { fontSize: 13, fontWeight: '700', color: '#2e7d32' },
  completionEmoji: { fontSize: 14 },
  completionNotes: { fontSize: 12, color: Colors.textMuted, fontStyle: 'italic', flex: 1 },

  // ── Empty state ──
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyIcon: { fontSize: 52 },
  emptyTitle: {
    fontSize: 18, fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
  },
  emptyDesc: { fontSize: 14, color: Colors.textMuted, textAlign: 'center' },

  // ── Action buttons ──
  addWineBtn: {
    marginTop: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addWineBtnText: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  completeBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  completeBtnText: {
    color: Colors.white, fontSize: 17, fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  cancelLink: { alignItems: 'center', paddingVertical: 16, marginTop: 8 },
  cancelLinkText: { fontSize: 14, color: Colors.disliked, textDecorationLine: 'underline' },
});
