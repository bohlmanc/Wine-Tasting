import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import AppHeader from '../components/AppHeader';
import { Colors } from '../constants/colors';
import { loadCellarBottles, deleteCellarBottle } from '../storage/cellarStorage';
import { CellarBottle, WineStyle } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function getDrinkWindowStatus(drinkBy: string): 'good' | 'soon' | 'past' | 'none' {
  if (!drinkBy.trim()) return 'none';
  const year = parseInt(drinkBy.trim(), 10);
  const targetDate = isNaN(year) ? new Date(drinkBy) : new Date(year, 11, 31);
  if (isNaN(targetDate.getTime())) return 'none';
  const now = new Date();
  const diffDays = (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays < 0) return 'past';
  if (diffDays < 365) return 'soon';
  return 'good';
}

const DRINK_STATUS_COLORS = {
  good: '#2E7C2E',
  soon: '#C87828',
  past: '#8B1A1A',
  none: Colors.textMuted,
};

const DRINK_STATUS_LABELS = {
  good: 'In window',
  soon: 'Drink soon',
  past: 'Past peak',
  none: '',
};

const STYLE_BADGE_COLORS: Record<WineStyle, string> = {
  red: '#C1121F',
  white: '#C8A000',
  rose: '#D06080',
  sparkling: '#4A8585',
};

export default function MyCellarScreen() {
  const navigation = useNavigation<Nav>();
  const [bottles, setBottles] = useState<CellarBottle[]>([]);

  const refresh = useCallback(async () => {
    const loaded = await loadCellarBottles();
    setBottles(loaded);
  }, []);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Remove from Cellar',
      `Remove "${name || 'this bottle'}" from your cellar?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await deleteCellarBottle(id);
            refresh();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="My Cellar" />
      <View style={styles.container}>
        {bottles.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🍾</Text>
            <Text style={styles.emptyText}>Your cellar is empty.</Text>
            <Text style={styles.emptySubtext}>Add bottles to track your collection and drink windows.</Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => navigation.navigate('AddCellarBottle', {})}
            >
              <Text style={styles.addBtnText}>ADD A BOTTLE</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={bottles}
            keyExtractor={b => b.id}
            contentContainerStyle={styles.list}
            ListHeaderComponent={
              <View style={styles.listHeader}>
                <Text style={styles.count}>
                  {bottles.length} bottle{bottles.length !== 1 ? 's' : ''}
                </Text>
                <TouchableOpacity
                  style={styles.addBtnSmall}
                  onPress={() => navigation.navigate('AddCellarBottle', {})}
                >
                  <Text style={styles.addBtnSmallText}>+ ADD</Text>
                </TouchableOpacity>
              </View>
            }
            renderItem={({ item }) => (
              <BottleCard
                bottle={item}
                onPress={() => navigation.navigate('CellarBottleDetail', { bottleId: item.id })}
                onDelete={() => handleDelete(item.id, [item.producer, item.name].filter(Boolean).join(' '))}
              />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function BottleCard({
  bottle,
  onPress,
  onDelete,
}: {
  bottle: CellarBottle;
  onPress: () => void;
  onDelete: () => void;
}) {
  const displayName = [bottle.producer, bottle.name].filter(Boolean).join(' ') || 'Unnamed Bottle';
  const drinkStatus = getDrinkWindowStatus(bottle.drinkBy);
  const styleBadgeColor = bottle.style ? STYLE_BADGE_COLORS[bottle.style] : Colors.btnCellar;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardLeft}>
        {bottle.photo ? (
          <Image source={{ uri: bottle.photo }} style={styles.cardPhoto} />
        ) : (
          <View style={[styles.cardPhotoPlaceholder, { backgroundColor: styleBadgeColor + '22' }]}>
            <Text style={{ fontSize: 24 }}>🍾</Text>
          </View>
        )}
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={1}>{displayName}</Text>
        <View style={styles.cardMeta}>
          {bottle.style && (
            <View style={[styles.badge, { backgroundColor: styleBadgeColor }]}>
              <Text style={styles.badgeText}>{bottle.style.toUpperCase()}</Text>
            </View>
          )}
          {bottle.vintage ? <Text style={styles.metaText}>{bottle.vintage}</Text> : null}
          {bottle.country ? <Text style={styles.metaText}>{bottle.country}</Text> : null}
        </View>
        <View style={styles.cardBottomRow}>
          <View style={styles.qtyBadge}>
            <Text style={styles.qtyText}>×{bottle.quantity}</Text>
          </View>
          {bottle.drinkBy ? (
            <Text style={[styles.drinkByText, { color: DRINK_STATUS_COLORS[drinkStatus] }]}>
              {drinkStatus !== 'none' ? `${DRINK_STATUS_LABELS[drinkStatus]} · ` : ''}Drink by {bottle.drinkBy}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.cardRight}>
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.deleteIcon}>✕</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.btnCellar },
  container: { flex: 1, backgroundColor: Colors.background },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtext: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', marginBottom: 28 },
  addBtn: {
    backgroundColor: Colors.btnCellar,
    borderRadius: 10,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  addBtnText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  list: { padding: 16 },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  count: { fontSize: 15, fontWeight: '700', color: Colors.textMuted },
  addBtnSmall: {
    backgroundColor: Colors.btnCellar,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addBtnSmallText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardLeft: { marginRight: 12 },
  cardPhoto: { width: 64, height: 64, borderRadius: 8 },
  cardPhotoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1 },
  cardName: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
    marginBottom: 6,
  },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 6 },
  badge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { fontSize: 10, fontWeight: '800', color: Colors.white },
  metaText: { fontSize: 12, color: Colors.textMuted },
  cardBottomRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  qtyBadge: {
    backgroundColor: Colors.btnCellar + '22',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.btnCellar + '44',
  },
  qtyText: { fontSize: 12, fontWeight: '800', color: Colors.btnCellar },
  drinkByText: { fontSize: 11, fontWeight: '600' },

  cardRight: { alignItems: 'center', justifyContent: 'center', paddingLeft: 8 },
  deleteBtn: { padding: 4 },
  deleteIcon: { fontSize: 14, color: Colors.textMuted },
});
