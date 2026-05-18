import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import AppHeader from '../components/AppHeader';
import { Colors } from '../constants/colors';
import { getWinery, getActiveFlights } from '../services/wineryService';
import { Winery, TastingFlight } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'WineryDetail'>;

export default function WineryDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const [winery, setWinery] = useState<Winery | null>(null);
  const [flights, setFlights] = useState<TastingFlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [w, f] = await Promise.all([
          getWinery(params.wineryId),
          getActiveFlights(params.wineryId),
        ]);
        if (!w) { setError(true); return; }
        setWinery(w);
        setFlights(f);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [params.wineryId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <AppHeader title="Winery" />
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  if (error || !winery) {
    return (
      <SafeAreaView style={styles.safe}>
        <AppHeader title="Winery" />
        <View style={styles.errorState}>
          <Text style={styles.errorText}>Couldn't load this winery. Please try again.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title={winery.name} />
      <FlatList
        data={flights}
        keyExtractor={f => f.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>🍷</Text>
            </View>
            <Text style={styles.wineryName}>{winery.name}</Text>
            <Text style={styles.wineryRegion}>{winery.region} · {winery.country}</Text>
            {winery.description ? (
              <Text style={styles.wineryDesc}>{winery.description}</Text>
            ) : null}
            <View style={styles.divider} />
            <Text style={styles.flightsLabel}>Tasting Flights</Text>
            {flights.length === 0 && (
              <Text style={styles.noFlights}>No active tasting flights right now.</Text>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.flightCard}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('TastingFlightDetail', {
              flightId: item.id,
              wineryId: winery.id,
            })}
          >
            <View style={styles.flightInfo}>
              <Text style={styles.flightName}>{item.name}</Text>
              <Text style={styles.flightMeta}>{item.wines.length} wine{item.wines.length !== 1 ? 's' : ''}</Text>
              {item.description ? (
                <Text style={styles.flightDesc} numberOfLines={2}>{item.description}</Text>
              ) : null}
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  content: { paddingBottom: 40 },
  errorState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  errorText: { fontSize: 15, color: Colors.textMuted, textAlign: 'center' },
  header: {
    backgroundColor: Colors.surface,
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 8,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoText: { fontSize: 40 },
  wineryName: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  wineryRegion: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 12,
  },
  wineryDesc: {
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    width: '100%',
    marginVertical: 16,
  },
  flightsLabel: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
    alignSelf: 'flex-start',
  },
  noFlights: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 8,
  },
  flightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  flightInfo: { flex: 1 },
  flightName: {
    fontSize: 17,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
    marginBottom: 2,
  },
  flightMeta: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  flightDesc: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  arrow: { fontSize: 28, color: Colors.textMuted, lineHeight: 32 },
});
