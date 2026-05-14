import React, { useEffect, useState, useCallback } from 'react';
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
import { loadWines, deleteWine } from '../storage/wineStorage';
import { Wine } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function MyWinesScreen() {
  const navigation = useNavigation<Nav>();
  const [wines, setWines] = useState<Wine[]>([]);

  const refresh = useCallback(async () => {
    const loaded = await loadWines();
    setWines(loaded);
  }, []);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Wine',
      `Remove "${name || 'this wine'}" from your collection?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteWine(id);
            refresh();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="My Wines" />
      <View style={styles.container}>
        {wines.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🍷</Text>
            <Text style={styles.emptyText}>No wines saved yet.</Text>
            <Text style={styles.emptySubtext}>Start a tasting to add your first wine!</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddWineType')}>
              <Text style={styles.addBtnText}>ADD A WINE</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={wines}
            keyExtractor={w => w.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <WineCard
                wine={item}
                onPress={() => navigation.navigate('WineDetail', { wineId: item.id })}
                onDelete={() => handleDelete(item.id, item.name)}
              />
            )}
            ListHeaderComponent={
              <View style={styles.listHeader}>
                <Text style={styles.count}>{wines.length} wine{wines.length !== 1 ? 's' : ''}</Text>
                <TouchableOpacity style={styles.addBtnSmall} onPress={() => navigation.navigate('AddWineType')}>
                  <Text style={styles.addBtnSmallText}>+ ADD</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function WineCard({
  wine,
  onPress,
  onDelete,
}: {
  wine: Wine;
  onPress: () => void;
  onDelete: () => void;
}) {
  const displayName = [wine.producer, wine.name].filter(Boolean).join(' ') || 'Unnamed Wine';
  const styleBadgeColor =
    wine.style === 'red' ? '#C1121F'
    : wine.style === 'white' ? '#C8A000'
    : wine.style === 'rose' ? '#D06080'
    : wine.style === 'sparkling' ? '#4A8585'
    : Colors.primary;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardLeft}>
        {wine.photo ? (
          <Image source={{ uri: wine.photo }} style={styles.cardPhoto} />
        ) : (
          <View style={[styles.cardPhotoPlaceholder, { backgroundColor: styleBadgeColor + '22' }]}>
            <Text style={{ fontSize: 24 }}>🍷</Text>
          </View>
        )}
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={1}>{displayName}</Text>
        <View style={styles.cardMeta}>
          {wine.style && (
            <View style={[styles.badge, { backgroundColor: styleBadgeColor }]}>
              <Text style={styles.badgeText}>{wine.style.toUpperCase()}</Text>
            </View>
          )}
          {wine.vintage ? <Text style={styles.metaText}>{wine.vintage}</Text> : null}
          {wine.country ? <Text style={styles.metaText}>{wine.country}</Text> : null}
        </View>
        {wine.rating != null && (
          <Text style={styles.cardRating}>{'★'.repeat(Math.round(wine.rating / 2))}{'☆'.repeat(5 - Math.round(wine.rating / 2))} {wine.rating}/10</Text>
        )}
        {wine.dateTasted ? <Text style={styles.cardDate}>{wine.dateTasted}</Text> : null}
      </View>

      <View style={styles.cardRight}>
        {wine.liked === true && <Text style={styles.likedIcon}>👍</Text>}
        {wine.liked === false && <Text style={styles.likedIcon}>👎</Text>}
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.deleteIcon}>✕</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
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
    backgroundColor: Colors.primary,
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
    backgroundColor: Colors.primary,
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
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 },
  badge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 10, fontWeight: '800', color: Colors.white },
  metaText: { fontSize: 12, color: Colors.textMuted },
  cardRating: { fontSize: 12, color: Colors.textMuted, marginBottom: 2 },
  cardDate: { fontSize: 11, color: Colors.textMuted },
  cardRight: { alignItems: 'center', justifyContent: 'space-between', paddingLeft: 8 },
  likedIcon: { fontSize: 20 },
  deleteBtn: { padding: 4 },
  deleteIcon: { fontSize: 14, color: Colors.textMuted },
});
