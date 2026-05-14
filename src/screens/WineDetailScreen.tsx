import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import AppHeader from '../components/AppHeader';
import { Colors } from '../constants/colors';
import { getWine } from '../storage/wineStorage';
import { Wine } from '../types';

type Route = RouteProp<RootStackParamList, 'WineDetail'>;

export default function WineDetailScreen() {
  const route = useRoute<Route>();
  const { wineId } = route.params;
  const [wine, setWine] = useState<Wine | null>(null);

  useEffect(() => {
    getWine(wineId).then(setWine);
  }, [wineId]);

  if (!wine) {
    return (
      <SafeAreaView style={styles.safe}>
        <AppHeader title="Wine Detail" />
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const displayName = [wine.producer, wine.name].filter(Boolean).join(' ') || 'Unnamed Wine';
  const styleBadgeColor =
    wine.style === 'red' ? '#C1121F'
    : wine.style === 'white' ? '#C8A000'
    : wine.style === 'rose' ? '#D06080'
    : wine.style === 'sparkling' ? '#4A8585'
    : Colors.primary;

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Wine Detail" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        {/* Header card */}
        <View style={styles.headerCard}>
          {wine.photo ? (
            <Image source={{ uri: wine.photo }} style={styles.photo} />
          ) : (
            <View style={[styles.photoPlaceholder, { backgroundColor: styleBadgeColor + '22' }]}>
              <Text style={{ fontSize: 48 }}>🍷</Text>
            </View>
          )}
          <Text style={styles.wineName}>{displayName}</Text>
          {wine.style && (
            <View style={[styles.styleBadge, { backgroundColor: styleBadgeColor }]}>
              <Text style={styles.styleBadgeText}>{wine.style.toUpperCase()}</Text>
            </View>
          )}
          <View style={styles.metaRow}>
            {wine.vintage ? <Text style={styles.metaItem}>{wine.vintage}</Text> : null}
            {wine.country ? <Text style={styles.metaItem}>{wine.country}</Text> : null}
            {wine.region ? <Text style={styles.metaItem}>{wine.region}</Text> : null}
          </View>
          {wine.grapes.length > 0 && (
            <Text style={styles.grapes}>{wine.grapes.join(', ')}</Text>
          )}
          {wine.dateTasted ? <Text style={styles.dateTasted}>Tasted: {wine.dateTasted}</Text> : null}

          {/* Rating & Liked */}
          <View style={styles.ratingRow}>
            {wine.liked === true && <Text style={styles.likedBadge}>👍 Liked</Text>}
            {wine.liked === false && <Text style={styles.dislikedBadge}>👎 Didn't Like</Text>}
            {wine.rating != null && (
              <Text style={styles.ratingText}>{wine.rating}/10</Text>
            )}
          </View>
        </View>

        {/* Sight section */}
        {(wine.color || wine.colorIntensity || wine.clarity) && (
          <Section title="SIGHT">
            <TagRow tags={[wine.color, wine.colorIntensity, wine.clarity].filter(Boolean) as string[]} color={Colors.primary} />
          </Section>
        )}

        {/* Aromas section */}
        {wine.aromas?.length > 0 && (
          <Section title="AROMAS">
            <TagRow tags={wine.aromas} color={Colors.fruitColor} />
          </Section>
        )}

        {/* Taste section */}
        {(wine.sweetness || wine.acidity || wine.tannin || wine.alcohol || wine.body || wine.finish) && (
          <Section title="TASTE">
            <View style={styles.tasteGrid}>
              {wine.sweetness && <TasteItem label="Sweetness" value={wine.sweetness} />}
              {wine.acidity && <TasteItem label="Acidity" value={wine.acidity} />}
              {wine.tannin && <TasteItem label="Tannin" value={wine.tannin} />}
              {wine.alcohol && <TasteItem label="Alcohol" value={wine.alcohol} />}
              {wine.body && <TasteItem label="Body" value={wine.body} />}
              {wine.finish && <TasteItem label="Finish" value={wine.finish} />}
            </View>
          </Section>
        )}

        {/* Notes section */}
        {wine.notes ? (
          <Section title="NOTES">
            <Text style={styles.notesText}>{wine.notes}</Text>
          </Section>
        ) : null}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function TagRow({ tags, color }: { tags: string[]; color: string }) {
  return (
    <View style={styles.tagRow}>
      {tags.map(t => (
        <View key={t} style={[styles.tag, { borderColor: color }]}>
          <Text style={[styles.tagText, { color }]}>{t}</Text>
        </View>
      ))}
    </View>
  );
}

function TasteItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.tasteItem}>
      <Text style={styles.tasteLabel}>{label}</Text>
      <Text style={styles.tasteValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  loadingText: { fontSize: 16, color: Colors.textMuted },
  headerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  photo: { width: 140, height: 140, borderRadius: 12, marginBottom: 14 },
  photoPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  wineName: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  styleBadge: {
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 10,
  },
  styleBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.white,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 6,
  },
  metaItem: { fontSize: 13, color: Colors.textMuted },
  grapes: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', marginBottom: 6 },
  dateTasted: { fontSize: 12, color: Colors.textMuted, marginBottom: 10 },
  ratingRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  likedBadge: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.liked,
    backgroundColor: Colors.likedBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dislikedBadge: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.disliked,
    backgroundColor: Colors.dislikedBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: { fontSize: 13, fontWeight: '600' },
  tasteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tasteItem: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    padding: 10,
    minWidth: '45%',
    flex: 1,
  },
  tasteLabel: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, marginBottom: 2 },
  tasteValue: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.primaryDark,
  },
  notesText: { fontSize: 14, color: Colors.text, lineHeight: 20 },
});
