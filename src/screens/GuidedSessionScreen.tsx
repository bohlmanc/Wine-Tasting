import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import AppHeader from '../components/AppHeader';
import { Colors } from '../constants/colors';
import {
  loadGuidedSession,
  loadFlightForSession,
  saveGuidedSession,
  clearGuidedSession,
  archiveFlightSession,
} from '../storage/guidedSessionStorage';
import { GuidedSession, TastingFlight, FlightWine } from '../types';
import { useWineTasting } from '../context/WineTastingContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'GuidedSession'>;

const STYLE_EMOJI: Record<string, string> = {
  red: '🍷',
  white: '🥂',
  rose: '🌸',
  sparkling: '✨',
};

export default function GuidedSessionScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { setTastingType, update, reset } = useWineTasting();

  const [session, setSession] = useState<GuidedSession | null>(null);
  const [flight, setFlight] = useState<TastingFlight | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const s = await loadGuidedSession(params.sessionId);
      if (!s) { setLoading(false); return; }
      const f = await loadFlightForSession(s.flightId);
      setSession(s);
      setFlight(f);
    } finally {
      setLoading(false);
    }
  }, [params.sessionId]);

  // Re-load session each time we return to this screen (tasting flow may have completed a wine)
  useFocusEffect(useCallback(() => {
    reload();
  }, [reload]));

  const sortedWines = flight?.wines.slice().sort((a, b) => a.position - b.position) ?? [];
  const isComplete = session != null && session.currentIndex >= sortedWines.length;
  const currentWine: FlightWine | undefined = sortedWines[session?.currentIndex ?? 0];

  const handleStartTasting = async () => {
    if (!currentWine || !session) return;

    const updatedSession = { ...session, currentWineId: currentWine.id };
    await saveGuidedSession(updatedSession);
    setSession(updatedSession);

    reset();
    setTastingType('full');
    update({
      name: currentWine.name,
      producer: currentWine.producer,
      vintage: currentWine.vintage,
      style: currentWine.style,
      grapes: currentWine.grapes,
      region: currentWine.region,
      country: currentWine.country,
      abv: currentWine.abv,
      dateTasted: new Date().toLocaleDateString('en-US'),
    });

    navigation.navigate('BasicInfo', { guidedSessionId: session.id });
  };

  const handleFinish = async () => {
    Alert.alert(
      'End Session',
      'This will close the guided tasting session. Your completed tastings are saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: async () => {
            if (session && flight) await archiveFlightSession(session, flight);
            await clearGuidedSession();
            navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <AppHeader title="Guided Tasting" />
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  if (!session || !flight) {
    return (
      <SafeAreaView style={styles.safe}>
        <AppHeader title="Guided Tasting" />
        <View style={styles.errorState}>
          <Text style={styles.errorText}>Session not found. Please start a new tasting.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isComplete) {
    return (
      <SafeAreaView style={styles.safe}>
        <AppHeader title="Flight Complete!" />
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <View style={styles.completeHeader}>
            <Text style={styles.completeIcon}>🎉</Text>
            <Text style={styles.completeTitle}>Flight Complete!</Text>
            <Text style={styles.completeSubtitle}>
              {session.wineryName} · {session.flightName}
            </Text>
            <Text style={styles.completeDesc}>
              You've tasted all {sortedWines.length} wine{sortedWines.length !== 1 ? 's' : ''}. Your notes are saved in My Tastings.
            </Text>
          </View>

          <Text style={styles.sectionLabel}>Your Tastings</Text>
          {sortedWines.map((wine, i) => {
            const savedId = session.completedWineIds[wine.id];
            return (
              <TouchableOpacity
                key={wine.id}
                style={[styles.completedWineRow, !savedId && styles.completedWineRowSkipped]}
                activeOpacity={savedId ? 0.85 : 1}
                onPress={() => {
                  if (savedId) navigation.navigate('WineDetail', { wineId: savedId });
                }}
              >
                <Text style={styles.completedWineNum}>{i + 1}</Text>
                <View style={styles.completedWineInfo}>
                  <Text style={styles.completedWineName}>
                    {STYLE_EMOJI[wine.style ?? ''] ?? '🍾'} {wine.name} {wine.vintage}
                  </Text>
                  {savedId ? (
                    <Text style={styles.completedWineStatus}>Saved · tap to view</Text>
                  ) : (
                    <Text style={styles.completedWineSkipped}>Skipped</Text>
                  )}
                </View>
                {savedId && <Text style={styles.arrow}>›</Text>}
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity style={styles.doneBtn} onPress={async () => {
            if (session && flight) await archiveFlightSession(session, flight);
            await clearGuidedSession();
            navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
          }}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const progress = session.currentIndex / sortedWines.length;

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title={`${session.wineryName} — ${session.flightName}`} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            Wine {session.currentIndex + 1} of {sortedWines.length}
          </Text>
        </View>

        {/* Current wine card */}
        {currentWine && (
          <View style={styles.wineCard}>
            <Text style={styles.wineCardLabel}>Next Up</Text>
            <Text style={styles.wineCardName}>
              {STYLE_EMOJI[currentWine.style ?? ''] ?? '🍾'} {currentWine.name}
            </Text>
            {currentWine.vintage ? (
              <Text style={styles.wineCardVintage}>{currentWine.vintage}</Text>
            ) : null}
            <Text style={styles.wineCardProducer}>{currentWine.producer}</Text>
            {currentWine.region || currentWine.country ? (
              <Text style={styles.wineCardMeta}>
                {[currentWine.region, currentWine.country].filter(Boolean).join(', ')}
              </Text>
            ) : null}
            {currentWine.grapes.length > 0 && (
              <Text style={styles.wineCardGrapes}>{currentWine.grapes.join(', ')}</Text>
            )}
            {currentWine.abv ? (
              <Text style={styles.wineCardAbv}>ABV: {currentWine.abv}%</Text>
            ) : null}

            {currentWine.description ? (
              <View style={styles.wineCardDescBox}>
                <Text style={styles.wineCardDescLabel}>Winery Notes</Text>
                <Text style={styles.wineCardDesc}>{currentWine.description}</Text>
              </View>
            ) : null}
          </View>
        )}

        {/* Actions */}
        <TouchableOpacity style={styles.startBtn} onPress={handleStartTasting} activeOpacity={0.85}>
          <Text style={styles.startBtnText}>Start Tasting This Wine</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipBtn}
          activeOpacity={0.85}
          onPress={async () => {
            const nextIndex = session.currentIndex + 1;
            const updated: GuidedSession = {
              ...session,
              currentIndex: nextIndex,
              currentWineId: sortedWines[nextIndex]?.id ?? null,
            };
            await saveGuidedSession(updated);
            setSession(updated);
          }}
        >
          <Text style={styles.skipBtnText}>Skip This Wine</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.endBtn} onPress={handleFinish} activeOpacity={0.85}>
          <Text style={styles.endBtnText}>End Session</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, gap: 16 },
  errorState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  errorText: { fontSize: 15, color: Colors.textMuted, textAlign: 'center' },

  // Progress
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

  // Wine card
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
  wineCardDescBox: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    gap: 4,
  },
  wineCardDescLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  wineCardDesc: { fontSize: 14, color: Colors.text, lineHeight: 20 },

  // Buttons
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
  skipBtnText: {
    color: Colors.textMuted,
    fontSize: 16,
    fontWeight: '700',
  },
  endBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  endBtnText: {
    color: Colors.textMuted,
    fontSize: 14,
    textDecorationLine: 'underline',
  },

  // Completion
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
  completeSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  completeDesc: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    textDecorationLine: 'underline',
    marginBottom: 4,
  },
  completedWineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  completedWineRowSkipped: { opacity: 0.5 },
  completedWineNum: {
    width: 28,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textMuted,
    textAlign: 'center',
  },
  completedWineInfo: { flex: 1 },
  completedWineName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  completedWineStatus: { fontSize: 12, color: Colors.liked },
  completedWineSkipped: { fontSize: 12, color: Colors.textMuted },
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
});
