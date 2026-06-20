import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import AppHeader from '../components/AppHeader';
import { Colors } from '../constants/colors';
import { useTastingRoom } from '../context/TastingRoomContext';
import * as roomService from '../services/tastingRoomService';
import { PendingPartyWine } from '../types/room';
import { WineStyle } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const STYLE_OPTIONS: { value: WineStyle; label: string; emoji: string }[] = [
  { value: 'red', label: 'Red', emoji: '🍷' },
  { value: 'white', label: 'White', emoji: '🥂' },
  { value: 'rose', label: 'Rosé', emoji: '🌸' },
  { value: 'sparkling', label: 'Sparkling', emoji: '✨' },
  { value: 'orange', label: 'Orange', emoji: '🍊' },
  { value: 'dessert', label: 'Dessert', emoji: '🍯' },
];

const STYLE_EMOJI: Record<string, string> = {
  red: '🍷', white: '🥂', rose: '🌸', sparkling: '✨', orange: '🍊', dessert: '🍯',
};

function emptyDraft(): Omit<PendingPartyWine, 'id'> {
  return { name: '', producer: '', vintage: '', style: undefined, grapes: [], region: '', country: '', abv: '' };
}

export default function PartyFlightSetupScreen() {
  const navigation = useNavigation<Nav>();
  const { room, startPartyWithCustomWines, leaveRoom } = useTastingRoom();
  const isLeavingRef = useRef(false);

  const [wines, setWines] = useState<PendingPartyWine[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [draft, setDraft] = useState(emptyDraft());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (isLeavingRef.current) return;
      if (e.data.action.type !== 'GO_BACK') return; // only intercept back-button; allow RESET/REPLACE through
      e.preventDefault();
      Alert.alert(
        'Leave Room Setup?',
        'The room code will be cancelled and any guests waiting will be removed.',
        [
          { text: 'Keep Going', style: 'cancel' },
          {
            text: 'Leave Room',
            style: 'destructive',
            onPress: async () => {
              if (room) {
                try { await roomService.scheduleRoomClose(room.id); } catch {}
              }
              isLeavingRef.current = true;
              await leaveRoom();
              navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
            },
          },
        ],
      );
    });
    return unsubscribe;
  }, [navigation, room, leaveRoom]);

  const openAdd = () => {
    setDraft(emptyDraft());
    setShowAddModal(true);
  };

  const handleAddWine = () => {
    if (!draft.name.trim()) return;
    const wine: PendingPartyWine = {
      id: `draft-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: draft.name.trim(),
      producer: draft.producer.trim(),
      vintage: draft.vintage.trim(),
      style: draft.style,
      grapes: draft.grapes,
      region: draft.region.trim(),
      country: draft.country.trim(),
      abv: draft.abv.trim(),
    };
    setWines(prev => [...prev, wine]);
    setShowAddModal(false);
  };

  const handleRemoveWine = (id: string) => {
    setWines(prev => prev.filter(w => w.id !== id));
  };

  const handleStartParty = async () => {
    if (wines.length === 0 || !room) return;
    setSaving(true);
    try {
      await startPartyWithCustomWines(wines);
      isLeavingRef.current = true; // party started — don't prompt on navigation
      navigation.replace('TastingRoom');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not start the party. Check your connection.');
    } finally {
      setSaving(false);
    }
  };

  const handleWineryFlight = () => {
    navigation.navigate('WineryCheckIn');
  };

  const handleCancel = () => navigation.goBack();

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title={`Room ${room?.code ?? ''} — Flight Setup`} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        <View style={styles.codeBadge}>
          <Text style={styles.codeLabel}>SHARE THIS CODE</Text>
          <Text style={styles.code}>{room?.code ?? '····'}</Text>
          <Text style={styles.codeHint}>Others can join now — they'll wait here until you start.</Text>
        </View>

        <Text style={styles.sectionLabel}>Flight Type</Text>
        <TouchableOpacity
          style={styles.wineryOption}
          onPress={handleWineryFlight}
          activeOpacity={0.85}
        >
          <Text style={styles.wineryOptionIcon}>🍷</Text>
          <View style={styles.wineryOptionText}>
            <Text style={styles.wineryOptionTitle}>Use a Winery Flight</Text>
            <Text style={styles.wineryOptionDesc}>Browse and pick from a partner winery</Text>
          </View>
          <Text style={styles.wineryOptionArrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or build a custom flight</Text>
          <View style={styles.divider} />
        </View>

        {wines.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>The Flight ({wines.length} wine{wines.length !== 1 ? 's' : ''})</Text>
            {wines.map((wine, i) => (
              <View key={wine.id} style={styles.wineRow}>
                <View style={styles.winePosition}>
                  <Text style={styles.winePositionText}>{i + 1}</Text>
                </View>
                <View style={styles.wineInfo}>
                  <Text style={styles.wineName}>
                    {STYLE_EMOJI[wine.style ?? ''] ?? '🍾'} {wine.name}{wine.vintage ? ` ${wine.vintage}` : ''}
                  </Text>
                  {wine.producer ? <Text style={styles.wineMeta}>{wine.producer}</Text> : null}
                </View>
                <TouchableOpacity onPress={() => handleRemoveWine(wine.id)} style={styles.removeBtn}>
                  <Text style={styles.removeBtnText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        <TouchableOpacity style={styles.addWineBtn} onPress={openAdd} activeOpacity={0.85}>
          <Text style={styles.addWineBtnText}>+ Add Wine</Text>
        </TouchableOpacity>

        {wines.length >= 1 && (
          <TouchableOpacity
            style={styles.startBtn}
            onPress={handleStartParty}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving
              ? <ActivityIndicator color={Colors.white} />
              : <Text style={styles.startBtnText}>Start Party</Text>
            }
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.cancelLink} onPress={handleCancel}>
          <Text style={styles.cancelLinkText}>Cancel Room</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add wine modal */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <KeyboardAvoidingView style={styles.modalContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowAddModal(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Add Wine</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Wine name (required)"
              placeholderTextColor={Colors.textMuted}
              value={draft.name}
              onChangeText={v => setDraft(d => ({ ...d, name: v }))}
              autoFocus
              returnKeyType="next"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Producer / Winery"
              placeholderTextColor={Colors.textMuted}
              value={draft.producer}
              onChangeText={v => setDraft(d => ({ ...d, producer: v }))}
              returnKeyType="next"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Vintage (year)"
              placeholderTextColor={Colors.textMuted}
              value={draft.vintage}
              onChangeText={v => setDraft(d => ({ ...d, vintage: v }))}
              keyboardType="numeric"
              maxLength={4}
              returnKeyType="done"
            />

            <Text style={styles.modalFieldLabel}>Style (optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={styles.styleRow}>
                {STYLE_OPTIONS.map(opt => {
                  const sel = draft.style === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.styleChip, sel && styles.styleChipActive]}
                      onPress={() => setDraft(d => ({ ...d, style: sel ? undefined : opt.value }))}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.styleChipEmoji}>{opt.emoji}</Text>
                      <Text style={[styles.styleChipText, sel && styles.styleChipTextActive]}>{opt.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.addConfirmBtn, !draft.name.trim() && styles.addConfirmBtnDisabled]}
              onPress={handleAddWine}
              disabled={!draft.name.trim()}
              activeOpacity={0.85}
            >
              <Text style={styles.addConfirmBtnText}>Add to Flight</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancelLink} onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCancelLinkText}>Cancel</Text>
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

  codeBadge: {
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: 14,
    padding: 20,
    marginBottom: 28,
  },
  codeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryDark,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  code: {
    fontSize: 44,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: Colors.primary,
    letterSpacing: 10,
    marginBottom: 8,
  },
  codeHint: {
    fontSize: 12,
    color: Colors.primaryDark,
    textAlign: 'center',
    opacity: 0.75,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  wineryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.btnWinery,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  wineryOptionIcon: { fontSize: 28 },
  wineryOptionText: { flex: 1 },
  wineryOptionTitle: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.white,
    marginBottom: 2,
  },
  wineryOptionDesc: { fontSize: 12, color: Colors.primaryLight },
  wineryOptionArrow: { fontSize: 24, color: Colors.white },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  divider: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: 12, color: Colors.textMuted, fontWeight: '600' },

  wineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  winePosition: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  winePositionText: { color: Colors.white, fontWeight: '800', fontSize: 14 },
  wineInfo: { flex: 1 },
  wineName: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
  },
  wineMeta: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.disliked,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: { color: Colors.white, fontSize: 18, fontWeight: '800', lineHeight: 22 },

  addWineBtn: {
    marginTop: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addWineBtnText: { fontSize: 15, fontWeight: '700', color: Colors.primary },

  startBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 20,
  },
  startBtnText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  cancelLink: { alignItems: 'center', paddingVertical: 16, marginTop: 8 },
  cancelLinkText: { fontSize: 14, color: Colors.disliked, textDecorationLine: 'underline' },

  // Modal
  modalContainer: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
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
  modalInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 13 : 10,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: Colors.white,
  },
  modalFieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: -4,
  },
  styleRow: { flexDirection: 'row', gap: 8 },
  styleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.white,
  },
  styleChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  styleChipEmoji: { fontSize: 16 },
  styleChipText: { fontSize: 13, fontWeight: '700', color: Colors.textMuted },
  styleChipTextActive: { color: Colors.white },
  addConfirmBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  addConfirmBtnDisabled: { opacity: 0.4 },
  addConfirmBtnText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  modalCancelLink: { alignItems: 'center', paddingVertical: 4 },
  modalCancelLinkText: { fontSize: 14, color: Colors.textMuted, textDecorationLine: 'underline' },
});
