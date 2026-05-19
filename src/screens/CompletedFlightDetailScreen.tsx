import React, { useCallback, useState } from 'react';
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
import { loadCompletedFlightSessions } from '../storage/guidedSessionStorage';
import { CompletedFlightSession, FlightWine } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'CompletedFlightDetail'>;

const STYLE_EMOJI: Record<string, string> = {
  red: '🍷',
  white: '🥂',
  rose: '🌸',
  sparkling: '✨',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function CompletedFlightDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const [cs, setCs] = useState<CompletedFlightSession | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    loadCompletedFlightSessions().then(all => {
      setCs(all.find(s => s.session.id === params.sessionId) ?? null);
      setLoading(false);
    });
  }, [params.sessionId]));

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <AppHeader title="Flight Detail" />
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  if (!cs) {
    return (
      <SafeAreaView style={styles.safe}>
        <AppHeader title="Flight Detail" />
        <View style={styles.errorState}>
          <Text style={styles.errorText}>Flight not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const sortedWines: FlightWine[] = cs.flight.wines.slice().sort((a, b) => a.position - b.position);
  const tasted = Object.values(cs.session.completedWineIds).filter(Boolean).length;

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title={cs.session.flightName} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        <View style={styles.headerCard}>
          <Text style={styles.wineryName}>{cs.session.wineryName}</Text>
          <Text style={styles.flightName}>{cs.session.flightName}</Text>
          <Text style={styles.meta}>
            {formatDate(cs.session.startedAt)} · {tasted}/{sortedWines.length} wine{sortedWines.length !== 1 ? 's' : ''} tasted
          </Text>
          {cs.flight.description ? (
            <Text style={styles.description}>{cs.flight.description}</Text>
          ) : null}
        </View>

        <Text style={styles.sectionLabel}>Wines</Text>
        {sortedWines.map((wine, i) => {
          const savedId = cs.session.completedWineIds[wine.id];
          return (
            <TouchableOpacity
              key={wine.id}
              style={[styles.wineRow, !savedId && styles.wineRowSkipped]}
              activeOpacity={savedId ? 0.85 : 1}
              onPress={() => {
                if (savedId) navigation.navigate('WineDetail', { wineId: savedId });
              }}
            >
              <Text style={styles.wineNum}>{i + 1}</Text>
              <View style={styles.wineInfo}>
                <Text style={styles.wineName}>
                  {STYLE_EMOJI[wine.style ?? ''] ?? '🍾'} {wine.name}
                  {wine.vintage ? ` ${wine.vintage}` : ''}
                </Text>
                {wine.producer ? (
                  <Text style={styles.wineProducer}>{wine.producer}</Text>
                ) : null}
                {savedId ? (
                  <Text style={styles.wineStatus}>Saved · tap to view</Text>
                ) : (
                  <Text style={styles.wineSkipped}>Skipped</Text>
                )}
              </View>
              {savedId && <Text style={styles.arrow}>›</Text>}
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16 },
  errorState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  errorText: { fontSize: 15, color: Colors.textMuted, textAlign: 'center' },

  headerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  wineryName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.btnWinery,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  flightName: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
  },
  meta: { fontSize: 13, color: Colors.textMuted },
  description: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 20,
    marginTop: 6,
  },

  sectionLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    textDecorationLine: 'underline',
    marginBottom: 8,
  },
  wineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  wineRowSkipped: { opacity: 0.5 },
  wineNum: {
    width: 28,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textMuted,
    textAlign: 'center',
  },
  wineInfo: { flex: 1, gap: 2 },
  wineName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  wineProducer: { fontSize: 13, color: Colors.textMuted },
  wineStatus: { fontSize: 12, color: Colors.liked },
  wineSkipped: { fontSize: 12, color: Colors.textMuted },
  arrow: { fontSize: 24, color: Colors.textMuted },
});
