import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

async function openInstagram() {
  const appUrl = 'instagram://user?username=corkandfizz';
  const webUrl = 'https://www.instagram.com/corkandfizz';
  try {
    if (await Linking.canOpenURL(appUrl)) {
      Linking.openURL(appUrl);
    } else {
      Linking.openURL(webUrl);
    }
  } catch {
    Linking.openURL(webUrl);
  }
}
import AppHeader from '../components/AppHeader';
import { Colors } from '../constants/colors';
import { loadWines, deleteWine } from '../storage/wineStorage';
import { loadCompletedFlightSessions } from '../storage/guidedSessionStorage';
import { Wine } from '../types';

export default function MyProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [wines, setWines] = useState<Wine[]>([]);
  const [flightCount, setFlightCount] = useState(0);
  useEffect(() => {
    loadWines().then(loaded => {
      setWines(loaded);
      const customFlightIds = new Set(
        loaded.filter(w => w.flightId && !w.guidedSessionId).map(w => w.flightId!)
      );
      loadCompletedFlightSessions().then(sessions => {
        setFlightCount(sessions.length + customFlightIds.size);
      });
    });
  }, []);

  const countryBreakdown = wines.reduce<Record<string, number>>((acc, w) => {
    if (w.country) acc[w.country] = (acc[w.country] ?? 0) + 1;
    return acc;
  }, {});
  const topCountries = Object.entries(countryBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const grapeBreakdown = wines.reduce<Record<string, number>>((acc, w) => {
    (w.grapes ?? []).forEach(g => { acc[g] = (acc[g] ?? 0) + 1; });
    return acc;
  }, {});
  const topGrapes = Object.entries(grapeBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const styleBreakdown = wines.reduce<Record<string, number>>((acc, w) => {
    if (w.style) acc[w.style] = (acc[w.style] ?? 0) + 1;
    return acc;
  }, {});

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Wines',
      'This will permanently delete all your saved wines. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            for (const wine of wines) {
              await deleteWine(wine.id);
            }
            setWines([]);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="My Profile" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.avatarArea}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>🍷</Text>
          </View>
          <Text style={styles.appTitle}>Wine Pocket Pal</Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://www.corkandfizz.com')}>
            <Text style={[styles.appSubtitle, styles.link]}>Created by Cork & Fizz, LLC</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatBox label="Total Wines" value={String(wines.length)} onPress={() => navigation.navigate('MyTastings')} />
          <StatBox label="Flights" value={String(flightCount)} onPress={() => navigation.navigate('MyFlights')} />
          <StatBox label="Calendar" value="📅" onPress={() => navigation.navigate('TastingCalendar')} />
        </View>
        {/* Style breakdown */}
        {Object.keys(styleBreakdown).length > 0 && (
          <Section title="By Style">
            <View style={styles.breakdownRow}>
              {Object.entries(styleBreakdown).map(([style, count]) => {
                const color =
                  style === 'red' ? '#C1121F'
                  : style === 'white' ? '#C8A000'
                  : style === 'rose' ? '#D06080'
                  : style === 'sparkling' ? '#4A8585'
                  : style === 'orange' ? '#C07020'
                  : '#8B5E28';
                return (
                  <View key={style} style={[styles.breakdownBadge, { borderColor: color }]}>
                    <Text style={[styles.breakdownBadgeText, { color }]}>
                      {style.toUpperCase()}: {count}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Section>
        )}

        {/* Top countries */}
        {topCountries.length > 0 && (
          <Section title="Top Countries">
            {topCountries.map(([country, count]) => (
              <View key={country} style={styles.countryRow}>
                <Text style={styles.countryName}>{country}</Text>
                <Text style={styles.countryCount}>{count} wine{count !== 1 ? 's' : ''}</Text>
              </View>
            ))}
          </Section>
        )}

        {/* Top grapes */}
        {topGrapes.length > 0 && (
          <Section title="Top Grapes">
            {topGrapes.map(([grape, count]) => (
              <View key={grape} style={styles.countryRow}>
                <Text style={styles.countryName}>{grape}</Text>
                <Text style={styles.countryCount}>{count} wine{count !== 1 ? 's' : ''}</Text>
              </View>
            ))}
          </Section>
        )}

        {/* TODO: Remove "Clear All Wines" before launch — dev/testing tool only */}
        {__DEV__ && wines.length > 0 && (
          <Section title="Data">
            <Text style={styles.devOnlyLabel}>DEV BUILD ONLY — not in release</Text>
            <TouchableOpacity style={styles.dangerBtn} onPress={handleClearAll}>
              <Text style={styles.dangerBtnText}>Clear All Wines</Text>
            </TouchableOpacity>
          </Section>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Wine Pocket Pal v1.0</Text>
          <View style={styles.footerRow}>
            <TouchableOpacity onPress={() => Linking.openURL('https://www.corkandfizz.com')}>
              <Text style={[styles.footerText, styles.link]}>© Cork & Fizz, LLC</Text>
            </TouchableOpacity>
            <Text style={styles.footerText}> · </Text>
            <TouchableOpacity onPress={openInstagram}>
              <Text style={[styles.footerText, styles.link]}>Instagram</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ label, value, color, onPress }: { label: string; value: string; color?: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.statBox} onPress={onPress} disabled={!onPress}>
      <Text style={[styles.statValue, color ? { color } : undefined]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20 },
  avatarArea: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarEmoji: { fontSize: 44 },
  appTitle: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
    marginBottom: 4,
  },
  appSubtitle: { fontSize: 13, color: Colors.textMuted },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '600', textAlign: 'center' },
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
    marginBottom: 12,
  },
  breakdownRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  breakdownBadge: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  breakdownBadgeText: { fontSize: 13, fontWeight: '700' },
  countryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  countryName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  countryCount: { fontSize: 13, color: Colors.textMuted },
  devOnlyLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.disliked,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  dangerBtn: {
    borderWidth: 1.5,
    borderColor: Colors.disliked,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dangerBtnText: { fontSize: 14, fontWeight: '700', color: Colors.disliked },
  footer: { alignItems: 'center', marginTop: 16, gap: 4 },
  footerText: { fontSize: 12, color: Colors.textMuted },
  footerRow: { flexDirection: 'row', alignItems: 'center' },
  link: { textDecorationLine: 'underline' },
});
