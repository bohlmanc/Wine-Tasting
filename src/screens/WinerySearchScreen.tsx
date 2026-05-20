import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import AppHeader from '../components/AppHeader';
import { Colors } from '../constants/colors';
import { getAllWineries } from '../services/wineryService';
import { Winery } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function WinerySearchScreen() {
  const navigation = useNavigation<Nav>();
  const [query, setQuery] = useState('');
  const [allWineries, setAllWineries] = useState<Winery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    getAllWineries()
      .then(setAllWineries)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return allWineries;
    const q = query.toLowerCase();
    return allWineries.filter(w =>
      w.name.toLowerCase().includes(q) ||
      (w.region ?? '').toLowerCase().includes(q) ||
      (w.country ?? '').toLowerCase().includes(q)
    );
  }, [allWineries, query]);

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Search Wineries" />
      <View style={styles.container}>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Filter by name, region, or country…"
            placeholderTextColor={Colors.textMuted}
            returnKeyType="search"
            autoFocus
          />
        </View>

        {loading && <ActivityIndicator color={Colors.primary} style={{ marginTop: 32 }} />}

        {!loading && error && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>⚠️</Text>
            <Text style={styles.emptyText}>Couldn't load wineries</Text>
            <Text style={styles.emptySubtext}>Check your connection and try again.</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={load}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && allWineries.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🍷</Text>
            <Text style={styles.emptyText}>No wineries available</Text>
          </View>
        )}

        {!loading && allWineries.length > 0 && filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No results for "{query}"</Text>
            <Text style={styles.emptySubtext}>Try a different name or region.</Text>
          </View>
        )}

        <FlatList
          data={filtered}
          keyExtractor={w => w.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('WineryDetail', { wineryId: item.id })}
            >
              <View style={styles.resultMain}>
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultRegion}>{item.region} · {item.country}</Text>
                {item.description ? (
                  <Text style={styles.resultDesc} numberOfLines={2}>{item.description}</Text>
                ) : null}
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  container: { flex: 1, backgroundColor: Colors.background },
  searchRow: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: Colors.white,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    gap: 8,
  },
  emptyIcon: { fontSize: 48 },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  resultMain: { flex: 1 },
  resultName: {
    fontSize: 17,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
    marginBottom: 2,
  },
  resultRegion: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  resultDesc: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  arrow: {
    fontSize: 28,
    color: Colors.textMuted,
    lineHeight: 32,
  },
});
