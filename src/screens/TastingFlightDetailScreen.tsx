import React, { useEffect, useState } from 'react';
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import AppHeader from '../components/AppHeader';
import { Colors } from '../constants/colors';
import { getFlight, getWinery } from '../services/wineryService';
import { createGuidedSession, saveGuidedSession, saveFlightForSession } from '../storage/guidedSessionStorage';
import { TastingFlight, Winery, FlightWine } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'TastingFlightDetail'>;

const STYLE_EMOJI: Record<string, string> = {
  red: '🍷',
  white: '🥂',
  rose: '🌸',
  sparkling: '✨',
};

function WineRow({ wine, index }: { wine: FlightWine; index: number }) {
  return (
    <View style={styles.wineRow}>
      <View style={styles.winePosition}>
        <Text style={styles.winePositionText}>{index + 1}</Text>
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
      </View>
    </View>
  );
}

export default function TastingFlightDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const [flight, setFlight] = useState<TastingFlight | null>(null);
  const [winery, setWinery] = useState<Winery | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

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

  const handleBeginTasting = async () => {
    if (!flight || !winery) return;
    setStarting(true);
    try {
      const session = createGuidedSession({
        wineryId: winery.id,
        flightId: flight.id,
        flightName: flight.name,
        wineryName: winery.name,
        wineCount: flight.wines.length,
      });
      await Promise.all([
        saveGuidedSession(session),
        saveFlightForSession(flight),
      ]);
      navigation.navigate('GuidedSession', { sessionId: session.id });
    } catch {
      Alert.alert('Error', 'Could not start the tasting session. Please try again.');
    } finally {
      setStarting(false);
    }
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

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title={flight.name} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Flight header */}
        <View style={styles.flightHeader}>
          <Text style={styles.wineryName}>{winery.name}</Text>
          <Text style={styles.flightName}>{flight.name}</Text>
          {flight.description ? (
            <Text style={styles.flightDesc}>{flight.description}</Text>
          ) : null}
          <View style={styles.metaBadge}>
            <Text style={styles.metaBadgeText}>
              {flight.wines.length} wine{flight.wines.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {/* Wine list */}
        <Text style={styles.sectionLabel}>The Flight</Text>
        {flight.wines
          .slice()
          .sort((a, b) => a.position - b.position)
          .map((wine, i) => (
            <WineRow key={wine.id} wine={wine} index={i} />
          ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.beginBtn, starting && { opacity: 0.6 }]}
          onPress={handleBeginTasting}
          disabled={starting}
          activeOpacity={0.85}
        >
          <Text style={styles.beginBtnText}>
            {starting ? 'Starting…' : 'Begin Tasting'}
          </Text>
        </TouchableOpacity>
      </View>
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
  metaBadge: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 6,
  },
  metaBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primaryDark,
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
  footer: {
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  beginBtn: {
    backgroundColor: Colors.btnWinery,
    borderRadius: 10,
    paddingVertical: 18,
    alignItems: 'center',
  },
  beginBtnText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
});
