import React, { useState, useCallback } from 'react';
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
import { searchWineries } from '../services/wineryService';
import { Winery } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function WinerySearchScreen() {
  const navigation = useNavigation<Nav>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Winery[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await searchWineries(query.trim());
      setResults(data);
    } finally {
      setLoading(false);
    }
  }, [query]);

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Search Wineries" />
      <View style={styles.container}>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Winery name, region, or country…"
            placeholderTextColor={Colors.textMuted}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            autoFocus
          />
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} activeOpacity={0.85}>
            <Text style={styles.searchBtnText}>Search</Text>
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator color={Colors.primary} style={{ marginTop: 32 }} />}

        {!loading && searched && results.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🍷</Text>
            <Text style={styles.emptyText}>No wineries found for "{query}"</Text>
            <Text style={styles.emptySubtext}>Try a different name or region.</Text>
          </View>
        )}

        <FlatList
          data={results}
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
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: Colors.white,
  },
  searchBtn: {
    backgroundColor: Colors.btnWinery,
    borderRadius: 8,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  searchBtnText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 15,
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
