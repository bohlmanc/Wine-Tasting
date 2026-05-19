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
} from '../storage/guidedSessionStorage';
import { loadWines } from '../storage/wineStorage';
import { TastingFlight, Winery, FlightWine, GuidedSession, Wine } from '../types';
import { useWineTasting } from '../context/WineTastingContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'TastingFlightDetail'>;

const STYLE_EMOJI: Record<string, string> = {
  red: '🍷',
  white: '🥂',
  rose: '🌸',
  sparkling: '✨',
};

function WineRow({
  wine,
  index,
  completedWine,
  onPress,
}: {
  wine: FlightWine;
  index: number;
  completedWine: Wine | null;
  onPress: () => void;
}) {
  const isCompleted = completedWine !== null;

  return (
    <TouchableOpacity style={styles.wineRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.winePosition, isCompleted && styles.winePositionDone]}>
        <Text style={styles.winePositionText}>{isCompleted ? '✓' : index + 1}</Text>
      </View>
      <View style={styles.wineInfo}>
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

        {isCompleted ? (
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
        ) : (
          <Text style={styles.tapToTaste}>Tap to taste →</Text>
        )}
      </View>
    </TouchableOpacity>
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

  const { reset, update, setGuidedSessionId, setTastingType } = useWineTasting();

  useEffect(() => {
    (async () => {
      try {
        const [f, w] = await Promise.all([
          getFlight(params.flightId, params.wineryId),
          getWinery(params.wineryId),
        ]);
        setFlight(f);
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
          </View>
        </View>

        <Text style={styles.sectionLabel}>The Flight</Text>
        {sortedWines.map((wine, i) => (
          <WineRow
            key={wine.id}
            wine={wine}
            index={i}
            completedWine={completedWines[wine.id] ?? null}
            onPress={() => handleWineTap(wine, i)}
          />
        ))}

        {session !== null && (
          <TouchableOpacity style={styles.completeBtn} onPress={handleCompleteTasting} activeOpacity={0.85}>
            <Text style={styles.completeBtnText}>Complete Tasting</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
});
