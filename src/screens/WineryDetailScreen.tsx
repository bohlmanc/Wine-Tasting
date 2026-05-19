import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
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
import { loadActiveSessionForFlight, clearGuidedSession, clearFlightOverride } from '../storage/guidedSessionStorage';
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
  const [modalFlight, setModalFlight] = useState<TastingFlight | null>(null);
  const [flightHasSession, setFlightHasSession] = useState(false);

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

  const handleFlightTap = async (flight: TastingFlight) => {
    const session = await loadActiveSessionForFlight(flight.id);
    setFlightHasSession(!!session);
    setModalFlight(flight);
  };

  const handleStartFlight = () => {
    if (!modalFlight || !winery) return;
    const flight = modalFlight;
    setModalFlight(null);
    navigation.navigate('TastingFlightDetail', { flightId: flight.id, wineryId: winery.id });
  };

  const handleStartFresh = async () => {
    if (!modalFlight || !winery) return;
    const flight = modalFlight;
    setModalFlight(null);
    await Promise.all([
      clearGuidedSession(),
      clearFlightOverride(flight.id),
    ]);
    navigation.navigate('TastingFlightDetail', { flightId: flight.id, wineryId: winery.id });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title={winery.name} />
      <Modal
        visible={modalFlight !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setModalFlight(null)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalFlight(null)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{modalFlight?.name}</Text>
            <Text style={styles.modalMeta}>
              {modalFlight?.wines.length ?? 0} wine{(modalFlight?.wines.length ?? 0) !== 1 ? 's' : ''}
            </Text>
            {flightHasSession ? (
              <>
                <Text style={styles.modalHint}>You have an in-progress tasting for this flight.</Text>
                <TouchableOpacity style={styles.modalPrimaryBtn} onPress={handleStartFlight} activeOpacity={0.85}>
                  <Text style={styles.modalPrimaryBtnText}>Resume Tasting</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSecondaryBtn} onPress={handleStartFresh} activeOpacity={0.85}>
                  <Text style={styles.modalSecondaryBtnText}>Start Fresh</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.modalPrimaryBtn} onPress={handleStartFlight} activeOpacity={0.85}>
                <Text style={styles.modalPrimaryBtnText}>Start Tasting</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModalFlight(null)} activeOpacity={0.7}>
              <Text style={styles.modalCancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
            onPress={() => handleFlightTap(item)}
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
    textAlign: 'center',
  },
  modalMeta: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  modalHint: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalPrimaryBtn: {
    backgroundColor: Colors.btnWinery,
    borderRadius: 10,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
  },
  modalPrimaryBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  modalSecondaryBtn: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  modalSecondaryBtnText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  modalCancelBtn: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  modalCancelBtnText: {
    fontSize: 14,
    color: Colors.textMuted,
    textDecorationLine: 'underline',
  },
});
