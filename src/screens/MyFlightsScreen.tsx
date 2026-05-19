import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import AppHeader from '../components/AppHeader';
import { Colors } from '../constants/colors';
import { loadCompletedFlightSessions } from '../storage/guidedSessionStorage';
import { CompletedFlightSession } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function MyFlightsScreen() {
  const navigation = useNavigation<Nav>();
  const [sessions, setSessions] = useState<CompletedFlightSession[]>([]);

  useFocusEffect(useCallback(() => {
    loadCompletedFlightSessions().then(setSessions);
  }, []));

  const tastedCount = (cs: CompletedFlightSession) =>
    Object.values(cs.session.completedWineIds).filter(Boolean).length;

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="My Flights" />
      {sessions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🍾</Text>
          <Text style={styles.emptyTitle}>No flights yet</Text>
          <Text style={styles.emptyDesc}>
            Complete a guided tasting at a winery to see your flight history here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={cs => cs.session.id}
          contentContainerStyle={styles.list}
          renderItem={({ item: cs }) => {
            const tasted = tastedCount(cs);
            const total = cs.flight.wines.length;
            return (
              <TouchableOpacity
                style={styles.row}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate('CompletedFlightDetail', { sessionId: cs.session.id })
                }
              >
                <View style={styles.rowLeft}>
                  <Text style={styles.rowWinery}>{cs.session.wineryName}</Text>
                  <Text style={styles.rowFlight}>{cs.session.flightName}</Text>
                  <Text style={styles.rowMeta}>
                    {formatDate(cs.session.startedAt)} · {tasted}/{total} wine{total !== 1 ? 's' : ''} tasted
                  </Text>
                </View>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: Colors.background,
  },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  list: { padding: 16, gap: 12, backgroundColor: Colors.background },
  row: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rowLeft: { flex: 1, gap: 2 },
  rowWinery: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.btnWinery,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rowFlight: {
    fontSize: 17,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
  },
  rowMeta: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  arrow: { fontSize: 24, color: Colors.textMuted, marginLeft: 8 },
});
