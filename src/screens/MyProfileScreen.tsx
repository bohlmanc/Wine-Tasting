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

  const likedCount = wines.filter(w => w.liked === true).length;

  const countryBreakdown = wines.reduce<Record<string, number>>((acc, w) => {
    if (w.country) acc[w.country] = (acc[w.country] ?? 0) + 1;
    return acc;
  }, {});
  const topCountries = Object.entries(countryBreakdown)
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
          <TouchableOpacity
            style={[styles.calendarBtn, { backgroundColor: Colors.btnCalendar }]}
            onPress={() => navigation.navigate('TastingCalendar')}
            activeOpacity={0.85}
          >
            <Text style={styles.calendarBtnText}>Tasting Calendar</Text>
          </TouchableOpacity>

        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatBox label="Total Wines" value={String(wines.length)} onPress={() => navigation.navigate('MyTastings')} />
          <StatBox label="Liked" value={String(likedCount)} color={Colors.liked} />
          <StatBox label="Flights" value={String(flightCount)} onPress={() => navigation.navigate('MyFlights')} />
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
                  : '#4A8585';
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

        {/* Danger zone */}
        {wines.length > 0 && (
          <Section title="Data">
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
  calendarBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 22,
    marginTop: 12,
    alignSelf: 'stretch',
  },
  calendarBtnText: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.white,
  },
});
