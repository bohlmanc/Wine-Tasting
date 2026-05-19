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
import { loadWines } from '../storage/wineStorage';
import { CompletedFlightSession, Wine } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface CustomFlightGroup {
  flightId: string;
  flightName: string;
  wines: Wine[];
  startedAt: string;
}

type FlightItem =
  | { kind: 'guided'; data: CompletedFlightSession }
  | { kind: 'custom'; data: CustomFlightGroup };

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function MyFlightsScreen() {
  const navigation = useNavigation<Nav>();
  const [items, setItems] = useState<FlightItem[]>([]);

  useFocusEffect(useCallback(() => {
    (async () => {
      const [sessions, allWines] = await Promise.all([
        loadCompletedFlightSessions(),
        loadWines(),
      ]);

      const customWines = allWines.filter(w => w.flightId && !w.guidedSessionId);
      const groupMap = new Map<string, CustomFlightGroup>();
      for (const wine of customWines) {
        const id = wine.flightId!;
        if (!groupMap.has(id)) {
          groupMap.set(id, {
            flightId: id,
            flightName: wine.flightName ?? 'Custom Flight',
            wines: [],
            startedAt: wine.createdAt,
          });
        }
        const group = groupMap.get(id)!;
        group.wines.push(wine);
        if (wine.createdAt < group.startedAt) group.startedAt = wine.createdAt;
      }

      const guidedItems: FlightItem[] = sessions.map(s => ({ kind: 'guided', data: s }));
      const customItems: FlightItem[] = Array.from(groupMap.values()).map(g => ({ kind: 'custom', data: g }));

      // Merge and sort by date descending
      const merged = [...guidedItems, ...customItems].sort((a, b) => {
        const dateA = a.kind === 'guided' ? a.data.session.startedAt : a.data.startedAt;
        const dateB = b.kind === 'guided' ? b.data.session.startedAt : b.data.startedAt;
        return dateB.localeCompare(dateA);
      });

      setItems(merged);
    })();
  }, []));

  const tastedCount = (cs: CompletedFlightSession) =>
    Object.values(cs.session.completedWineIds).filter(Boolean).length;

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="My Flights" />
      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🍾</Text>
          <Text style={styles.emptyTitle}>No flights yet</Text>
          <Text style={styles.emptyDesc}>
            Complete a guided tasting at a winery or start a custom flight to see your history here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item =>
            item.kind === 'guided' ? item.data.session.id : item.data.flightId
          }
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            if (item.kind === 'guided') {
              const cs = item.data;
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
            }

            const group = item.data;
            const count = group.wines.length;
            return (
              <TouchableOpacity
                style={styles.row}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate('CustomFlight', {
                    flightId: group.flightId,
                    flightName: group.flightName,
                  })
                }
              >
                <View style={styles.rowLeft}>
                  <Text style={styles.rowCustomLabel}>Custom Flight</Text>
                  <Text style={styles.rowFlight}>{group.flightName}</Text>
                  <Text style={styles.rowMeta}>
                    {formatDate(group.startedAt)} · {count} wine{count !== 1 ? 's' : ''} tasted
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
  rowCustomLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5B6E5B',
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
