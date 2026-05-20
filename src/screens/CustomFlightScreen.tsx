import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import AppHeader from '../components/AppHeader';
import { Colors } from '../constants/colors';
import { loadWines } from '../storage/wineStorage';
import { isCustomFlightCompleted, markCustomFlightCompleted } from '../storage/customFlightStorage';
import { Wine } from '../types';
import { useWineTasting } from '../context/WineTastingContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'CustomFlight'>;

const STYLE_EMOJI: Record<string, string> = {
  red: '🍷',
  white: '🥂',
  rose: '🌸',
  sparkling: '✨',
  orange: '🍊',
  dessert: '🍯',
};

function WineCard({ wine, index, onPress }: { wine: Wine; index: number; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.wineRow} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.winePosition}>
        <Text style={styles.winePositionText}>{index + 1}</Text>
      </View>
      <View style={styles.wineInfo}>
        <Text style={styles.wineName}>
          {STYLE_EMOJI[wine.style ?? ''] ?? '🍾'}{wine.vintage ? ` ${wine.vintage}` : ''}{wine.name ? ` ${wine.name}` : ''}
        </Text>
        {wine.producer ? <Text style={styles.wineProducer}>{wine.producer}</Text> : null}
        {wine.region || wine.country ? (
          <Text style={styles.wineMeta}>
            {[wine.region, wine.country].filter(Boolean).join(', ')}
          </Text>
        ) : null}
        {wine.grapes && wine.grapes.length > 0 && (
          <Text style={styles.wineGrapes}>{wine.grapes.join(', ')}</Text>
        )}
        <View style={styles.completionRow}>
          {wine.rating !== null && wine.rating !== undefined && (
            <Text style={styles.completionRating}>★ {wine.rating}/10</Text>
          )}
          {wine.liked === true && <Text style={styles.completionEmoji}>👍</Text>}
          {wine.liked === false && <Text style={styles.completionEmoji}>👎</Text>}
          {wine.notes ? (
            <Text style={styles.completionNotes} numberOfLines={1}>
              "{wine.notes}"
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function CustomFlightScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { setCustomFlight } = useWineTasting();
  const [wines, setWines] = useState<Wine[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  useFocusEffect(
    useCallback(() => {
      Promise.all([
        loadWines(),
        isCustomFlightCompleted(params.flightId),
      ]).then(([all, completed]) => {
        setWines(all.filter(w => w.flightId === params.flightId));
        setIsCompleted(completed);
      });
    }, [params.flightId])
  );

  const handleAddWine = () => {
    navigation.navigate('AddWineType');
  };

  const handleCompleteFlight = () => {
    Alert.alert(
      'Complete Flight?',
      `Your ${wines.length} wine${wines.length !== 1 ? 's' : ''} are saved. No more wines can be added after this.`,
      [
        { text: 'Not Yet', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            await markCustomFlightCompleted(params.flightId);
            setCustomFlight(null, null);
            navigation.reset({ index: 1, routes: [{ name: 'Home' }, { name: 'MyFlights' }] });
          },
        },
      ]
    );
  };

  const handleCancelFlight = () => {
    Alert.alert(
      'Cancel Flight?',
      'Future wines won\'t be added to this flight. Already tasted wines remain in your collection.',
      [
        { text: 'Keep Flight', style: 'cancel' },
        {
          text: 'Cancel Flight',
          style: 'destructive',
          onPress: () => {
            setCustomFlight(null, null);
            navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title={params.flightName} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.flightHeader}>
          <Text style={styles.flightLabel}>Custom Flight</Text>
          <Text style={styles.flightName}>{params.flightName}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>
                {wines.length} wine{wines.length !== 1 ? 's' : ''} tasted
              </Text>
            </View>
            {isCompleted && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedBadgeText}>Completed</Text>
              </View>
            )}
          </View>
        </View>

        {wines.length > 0 ? (
          <>
            <Text style={styles.sectionLabel}>Wines Tasted</Text>
            {wines.map((w, i) => (
              <WineCard key={w.id} wine={w} index={i} onPress={() => navigation.navigate('WineDetail', { wineId: w.id })} />
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🍾</Text>
            <Text style={styles.emptyTitle}>No wines yet</Text>
            <Text style={styles.emptyDesc}>
              Tap "Add Wine" below to start tasting.
            </Text>
          </View>
        )}

        {!isCompleted && (
          <TouchableOpacity style={styles.addWineBtn} onPress={handleAddWine} activeOpacity={0.85}>
            <Text style={styles.addWineBtnText}>+ Add Wine</Text>
          </TouchableOpacity>
        )}

        {!isCompleted && wines.length > 0 && (
          <TouchableOpacity
            style={styles.completeBtn}
            onPress={handleCompleteFlight}
            activeOpacity={0.85}
          >
            <Text style={styles.completeBtnText}>Complete Flight</Text>
          </TouchableOpacity>
        )}

        {!isCompleted && (
          <TouchableOpacity style={styles.cancelLink} onPress={handleCancelFlight}>
            <Text style={styles.cancelLinkText}>Cancel Flight</Text>
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
  flightHeader: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    gap: 6,
  },
  flightLabel: {
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
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    alignItems: 'center',
    justifyContent: 'center',
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
  completedBadge: {
    backgroundColor: '#2e7d32',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  completedBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
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
    backgroundColor: '#2e7d32',
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
  completionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  completionRating: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2e7d32',
  },
  completionEmoji: { fontSize: 14 },
  completionNotes: {
    fontSize: 12,
    color: Colors.textMuted,
    fontStyle: 'italic',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyIcon: { fontSize: 52 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
  },
  emptyDesc: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  addWineBtn: {
    marginTop: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addWineBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  completeBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  completeBtnText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  cancelLink: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  cancelLinkText: {
    fontSize: 14,
    color: Colors.disliked,
    textDecorationLine: 'underline',
  },
});
