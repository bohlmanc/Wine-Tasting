import React, { useCallback, useState } from 'react';
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

const STYLE_EMOJI: Record<string, string> = {
  red: '🍷', white: '🥂', rose: '🌸', sparkling: '✨', orange: '🍊', dessert: '🍯',
};

// ── Tasted wine row (completion screen) ──────────────────────────────────────

function TastedRow({
  index, wine, onPress,
}: { index: number; wine: Wine; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.completedRow} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.completedNum}>{index + 1}</Text>
      <View style={styles.completedInfo}>
        <Text style={styles.completedName}>
          {STYLE_EMOJI[wine.style ?? ''] ?? '🍾'} {[wine.vintage, wine.producer, wine.name].filter(Boolean).join(' ')}
        </Text>
        <Text style={styles.completedStatus}>Saved · tap to view</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

// ── Skipped wine row (completion screen) ─────────────────────────────────────

function SkippedRow({ index, wine }: { index: number; wine: FlightPendingWine }) {
  return (
    <View style={[styles.completedRow, styles.completedRowSkipped]}>
      <Text style={styles.completedNum}>{index + 1}</Text>
      <View style={styles.completedInfo}>
        <Text style={styles.completedName}>
          🍾 {[wine.vintage, wine.producer, wine.name].filter(Boolean).join(' ') || 'Wine'}
        </Text>
        <Text style={styles.completedSkipped}>Skipped</Text>
      </View>
    </View>
  );
}

// ── Manual-flight tasted wine row (list view) ─────────────────────────────────

function WineCard({ wine, index, onPress }: { wine: Wine; index: number; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.wineRow} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.winePosition}>
        <Text style={styles.winePositionText}>{index + 1}</Text>
      </View>
      <View style={styles.wineInfo}>
        <Text style={styles.wineName}>
          {[wine.vintage, wine.producer, wine.name].filter(Boolean).join(' ')}
        </Text>
        {(wine.region || wine.country) ? (
          <Text style={styles.wineMeta}>{[wine.region, wine.country].filter(Boolean).join(', ')}</Text>
        ) : null}
        {wine.grapes && wine.grapes.length > 0 && (
          <Text style={styles.wineGrapes}>{wine.grapes.join(', ')}</Text>
        )}
        <View style={styles.completionRow}>
          {wine.rating !== null && wine.rating !== undefined && (
            <Text style={styles.completionRating}>★ {wine.rating}/10</Text>
          )}
          {wine.liked === true && <Text style={styles.completionEmoji}>👍</Text>}
          {wine.liked === false && <Text style={styles.completionEmoji}>👎</Text>}
          {wine.notes ? (
            <Text style={styles.completionNotes} numberOfLines={1}>"{wine.notes}"</Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function CustomFlightScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { setCustomFlight, setTastingType, update, reset, setScanApplied } = useWineTasting();

  const [wines, setWines] = useState<Wine[]>([]);
  const [pendingWines, setPendingWines] = useState<FlightPendingWine[]>([]);
  const [originalWines, setOriginalWines] = useState<FlightPendingWine[]>([]);
  const [skippedWineIds, setSkippedWineIds] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

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

  // Sequential flight (from menu scan): has original wine list
  const isSequentialFlight = originalWines.length > 0;
  const currentWine = pendingWines[0] ?? null;

  // Progress
  const tastedCount = wines.filter(w => w.flightWineId).length;
  const skippedCount = skippedWineIds.length;
  const total = originalWines.length;
  const doneCount = tastedCount + skippedCount;
  const progress = total > 0 ? doneCount / total : 0;

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleStartTasting = async () => {
    if (!currentWine) return;
    setCustomFlight(params.flightId, params.flightName);
    reset();
    setTastingType('full');
    update({
      name: currentWine.name ?? '',
      producer: currentWine.producer ?? '',
      vintage: currentWine.vintage ?? '',
      country: currentWine.country ?? '',
      region: currentWine.region ?? '',
      grapes: currentWine.grapes ?? [],
      abv: currentWine.abv ?? '',
      price: currentWine.price ?? '',
      flightWineId: currentWine.id,
    });
    setScanApplied(true);
    await removePendingWine(params.flightId, currentWine.id);
    setPendingWines(prev => prev.slice(1));
    navigation.navigate('BasicInfo');
  };

  const handleSkipWine = async () => {
    if (!currentWine) return;
    await addSkippedWineId(params.flightId, currentWine.id);
    await removePendingWine(params.flightId, currentWine.id);
    setSkippedWineIds(prev => [...prev, currentWine.id]);
    setPendingWines(prev => prev.slice(1));
  };

  const handleEndSession = () => {
    const remaining = pendingWines.length;
    Alert.alert(
      'End Session?',
      remaining > 0
        ? `${remaining} wine${remaining !== 1 ? 's' : ''} remaining. Your completed tastings are saved.`
        : 'Your completed tastings are saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: async () => {
            // Skip all remaining wines
            for (const w of pendingWines) {
              await addSkippedWineId(params.flightId, w.id);
            }
            await clearPendingWines(params.flightId);
            await markCustomFlightCompleted(params.flightId);
            setCustomFlight(null, null);
            setPendingWines([]);
            setSkippedWineIds(prev => [...prev, ...pendingWines.map(w => w.id)]);
            setIsCompleted(true);
          },
        },
      ],
    );
  };

  // ── Manual-flight handlers ───────────────────────────────────────────────────

  const handleTastePendingWineManual = (wine: FlightPendingWine, type: 'quick' | 'full') => {
    setCustomFlight(params.flightId, params.flightName);
    setTastingType(type);
    update({
      name: wine.name ?? '',
      producer: wine.producer ?? '',
      vintage: wine.vintage ?? '',
      country: wine.country ?? '',
      region: wine.region ?? '',
      grapes: wine.grapes ?? [],
      abv: wine.abv ?? '',
      price: wine.price ?? '',
    });
    setScanApplied(true);
    removePendingWine(params.flightId, wine.id);
    setPendingWines(prev => prev.filter(w => w.id !== wine.id));
    navigation.navigate('BasicInfo');
  };

  const handleStartTastingManual = (wine: FlightPendingWine) => {
    Alert.alert(
      wine.name || wine.producer || 'Start Tasting',
      'Choose your tasting style:',
      [
        { text: 'Quick Sip', onPress: () => handleTastePendingWineManual(wine, 'quick') },
        { text: 'Guided Tasting', onPress: () => handleTastePendingWineManual(wine, 'full') },
        { text: 'Cancel', style: 'cancel' },
      ],
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
            await markCustomFlightCompleted(params.flightId);
            setCustomFlight(null, null);
            navigation.reset({ index: 1, routes: [{ name: 'Home' }, { name: 'MyFlights' }] });
          },
        },
      ]
    );
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

  // ── Sequential flight — completion screen ────────────────────────────────────

  if (isSequentialFlight && pendingWines.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <AppHeader title="Flight Complete!" />
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <View style={styles.completeHeader}>
            <Text style={styles.completeIcon}>🎉</Text>
            <Text style={styles.completeTitle}>Flight Complete!</Text>
            <Text style={styles.completeSubtitle}>{params.flightName}</Text>
            <Text style={styles.completeDesc}>
              Your notes are saved in My Tastings.
            </Text>
          </View>

          <Text style={styles.sectionLabel}>Your Tastings</Text>
          {originalWines.map((orig, i) => {
            const saved = wines.find(w => w.flightWineId === orig.id);
            const wasSkipped = skippedWineIds.includes(orig.id);
            if (saved) {
              return (
                <TastedRow
                  key={orig.id}
                  index={i}
                  wine={saved}
                  onPress={() => navigation.navigate('WineDetail', { wineId: saved.id })}
                />
              );
            }
            if (wasSkipped) {
              return <SkippedRow key={orig.id} index={i} wine={orig} />;
            }
            // Tasted without flightWineId set (edge case)
            return <SkippedRow key={orig.id} index={i} wine={orig} />;
          })}

          <TouchableOpacity
            style={styles.doneBtn}
            onPress={async () => {
              await markCustomFlightCompleted(params.flightId);
              setCustomFlight(null, null);
              navigation.reset({ index: 1, routes: [{ name: 'Home' }, { name: 'MyFlights' }] });
            }}
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Sequential flight — in-progress screen ───────────────────────────────────

  if (isSequentialFlight && pendingWines.length > 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <AppHeader title={params.flightName} />
        <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { gap: 16 }]}>
          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>
              Wine {doneCount + 1} of {total}
            </Text>
          </View>

          {/* Current wine card */}
          {currentWine && (
            <View style={styles.wineCard}>
              <Text style={styles.wineCardLabel}>Next Up</Text>
              <Text style={styles.wineCardName}>
                🍾 {currentWine.name || currentWine.producer || 'Wine'}
              </Text>
              {currentWine.vintage ? (
                <Text style={styles.wineCardVintage}>{currentWine.vintage}</Text>
              ) : null}
              {currentWine.producer ? (
                <Text style={styles.wineCardProducer}>{currentWine.producer}</Text>
              ) : null}
              {(currentWine.region || currentWine.country) ? (
                <Text style={styles.wineCardMeta}>
                  {[currentWine.region, currentWine.country].filter(Boolean).join(', ')}
                </Text>
              ) : null}
              {currentWine.grapes && currentWine.grapes.length > 0 && (
                <Text style={styles.wineCardGrapes}>{currentWine.grapes.join(', ')}</Text>
              )}
              {currentWine.abv ? (
                <Text style={styles.wineCardAbv}>ABV: {currentWine.abv}</Text>
              ) : null}
              {currentWine.price ? (
                <Text style={styles.wineCardPrice}>{currentWine.price}</Text>
              ) : null}
            </View>
          )}

          {/* Actions */}
          <TouchableOpacity style={styles.startBtn} onPress={handleStartTasting} activeOpacity={0.85}>
            <Text style={styles.startBtnText}>Start Tasting This Wine</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipBtn} onPress={handleSkipWine} activeOpacity={0.85}>
            <Text style={styles.skipBtnText}>Skip This Wine</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.endBtn} onPress={handleEndSession} activeOpacity={0.85}>
            <Text style={styles.endBtnText}>End Session</Text>
          </TouchableOpacity>

          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Manual flight — original list-based UI ───────────────────────────────────

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
                {wines.length} wine{wines.length !== 1 ? 's' : ''} tasted
              </Text>
            </View>
            {pendingWines.length > 0 && (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>{pendingWines.length} to taste</Text>
              </View>
            )}
            {isCompleted && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedBadgeText}>Completed</Text>
              </View>
            )}
          </View>
        </View>

        {!isCompleted && pendingWines.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Wines to Taste</Text>
            {pendingWines.map((w, i) => (
              <View key={w.id} style={styles.pendingRow}>
                <View style={styles.pendingPosition}>
                  <Text style={styles.pendingPositionText}>{i + 1}</Text>
                </View>
                <View style={styles.wineInfo}>
                  <Text style={styles.wineName}>
                    {[w.vintage, w.producer, w.name].filter(Boolean).join(' ') || 'Unknown Wine'}
                  </Text>
                  {(w.region || w.country) ? (
                    <Text style={styles.wineMeta}>{[w.region, w.country].filter(Boolean).join(', ')}</Text>
                  ) : null}
                  {w.grapes && w.grapes.length > 0 && (
                    <Text style={styles.wineGrapes}>{w.grapes.join(', ')}</Text>
                  )}
                  {w.price ? <Text style={styles.pendingPrice}>{w.price}</Text> : null}
                </View>
                <TouchableOpacity
                  style={styles.tasteBtn}
                  onPress={() => handleStartTastingManual(w)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.tasteBtnText}>Taste</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {wines.length > 0 ? (
          <>
            <Text style={[styles.sectionLabel, pendingWines.length > 0 && { marginTop: 24 }]}>
              Wines Tasted
            </Text>
            {wines.map((w, i) => (
              <WineCard key={w.id} wine={w} index={i} onPress={() => navigation.navigate('WineDetail', { wineId: w.id })} />
            ))}
          </>
        ) : pendingWines.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🍾</Text>
            <Text style={styles.emptyTitle}>No wines yet</Text>
            <Text style={styles.emptyDesc}>Tap "Add Wine" below to start tasting.</Text>
          </View>
        ) : null}

        {!isCompleted && (
          <TouchableOpacity style={styles.addWineBtn} onPress={handleAddWine} activeOpacity={0.85}>
            <Text style={styles.addWineBtnText}>+ Add Wine</Text>
          </TouchableOpacity>
        )}

        {!isCompleted && wines.length > 0 && (
          <TouchableOpacity style={styles.completeBtn} onPress={handleCompleteFlight} activeOpacity={0.85}>
            <Text style={styles.completeBtnText}>Complete Flight</Text>
          </TouchableOpacity>
        )}

        {!isCompleted && (
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

  // ── Sequential: progress ──
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

  // ── Sequential: wine card ──
  wineCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 20,
    gap: 4,
  },
  wineCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.btnWinery,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  wineCardName: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
  },
  wineCardVintage: { fontSize: 16, color: Colors.textMuted, fontWeight: '600' },
  wineCardProducer: { fontSize: 14, color: Colors.textMuted },
  wineCardMeta: { fontSize: 13, color: Colors.textMuted },
  wineCardGrapes: { fontSize: 13, color: Colors.textMuted, fontStyle: 'italic' },
  wineCardAbv: { fontSize: 13, color: Colors.textMuted },
  wineCardPrice: { fontSize: 13, color: Colors.primaryDark, fontWeight: '600', marginTop: 4 },

  // ── Sequential: action buttons ──
  startBtn: {
    backgroundColor: Colors.btnWinery,
    borderRadius: 10,
    paddingVertical: 18,
    alignItems: 'center',
  },
  startBtnText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  skipBtn: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  skipBtnText: { color: Colors.textMuted, fontSize: 16, fontWeight: '700' },
  endBtn: { paddingVertical: 12, alignItems: 'center' },
  endBtnText: { color: Colors.textMuted, fontSize: 14, textDecorationLine: 'underline' },

  // ── Sequential: completion ──
  completeHeader: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  completeIcon: { fontSize: 56 },
  completeTitle: {
    fontSize: 26,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
  },
  completeSubtitle: { fontSize: 14, color: Colors.textMuted, textAlign: 'center' },
  completeDesc: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 20, marginTop: 4 },
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  completedRowSkipped: { opacity: 0.5 },
  completedNum: { width: 28, fontSize: 15, fontWeight: '700', color: Colors.textMuted, textAlign: 'center' },
  completedInfo: { flex: 1 },
  completedName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  completedStatus: { fontSize: 12, color: Colors.liked },
  completedSkipped: { fontSize: 12, color: Colors.textMuted },
  arrow: { fontSize: 24, color: Colors.textMuted },
  doneBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 24,
  },
  doneBtnText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  // ── Manual flight header ──
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
  completedBadge: { backgroundColor: '#2e7d32', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  completedBadgeText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  pendingBadge: { backgroundColor: Colors.infoBlueLight, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  pendingBadgeText: { fontSize: 13, fontWeight: '700', color: Colors.infoBlue },

  // ── Shared list styles ──
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
    backgroundColor: '#2e7d32',
    alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  winePositionText: { color: Colors.white, fontWeight: '800', fontSize: 15 },
  pendingRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: 'center',
  },
  pendingPosition: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.infoBlueLight,
    alignItems: 'center', justifyContent: 'center', marginTop: 2, flexShrink: 0,
  },
  pendingPositionText: { color: Colors.infoBlue, fontWeight: '800', fontSize: 15 },
  pendingPrice: { fontSize: 12, color: Colors.primaryDark, fontWeight: '600', marginTop: 2 },
  tasteBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexShrink: 0,
  },
  tasteBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  wineInfo: { flex: 1, gap: 3 },
  wineName: {
    fontSize: 16, fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
  },
  wineMeta: { fontSize: 12, color: Colors.textMuted },
  wineGrapes: { fontSize: 12, color: Colors.textMuted, fontStyle: 'italic' },
  completionRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  completionRating: { fontSize: 13, fontWeight: '700', color: '#2e7d32' },
  completionEmoji: { fontSize: 14 },
  completionNotes: { fontSize: 12, color: Colors.textMuted, fontStyle: 'italic', flex: 1 },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyIcon: { fontSize: 52 },
  emptyTitle: {
    fontSize: 18, fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
  },
  emptyDesc: { fontSize: 14, color: Colors.textMuted, textAlign: 'center' },
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
