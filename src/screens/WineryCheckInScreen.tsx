import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import AppHeader from '../components/AppHeader';
import { Colors } from '../constants/colors';
import { getAllWineries } from '../services/wineryService';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function WineryCheckInScreen() {
  const navigation = useNavigation<Nav>();

  useEffect(() => {
    getAllWineries().catch(() => {});
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Visit a Winery" />
      <View style={styles.container}>
        <Text style={styles.subtitle}>
          Check in at a partner winery to start a guided tasting flight.
        </Text>

        {/* QR scan — use native camera */}
        <View style={[styles.card, styles.cardPrimary]}>
          <Text style={styles.cardIcon}>📷</Text>
          <Text style={styles.cardTitle}>Scan QR Code</Text>
          <Text style={styles.cardDesc}>
            Open your phone's camera app and point it at the winery's QR code — it'll open right here.
          </Text>
        </View>

        {/* Search */}
        <TouchableOpacity
          style={[styles.card, styles.cardSecondary]}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('WinerySearch')}
        >
          <Text style={styles.cardIcon}>🔍</Text>
          <Text style={[styles.cardTitle, styles.cardTitleLight]}>Search Wineries</Text>
          <Text style={[styles.cardDesc, styles.cardDescLight]}>
            Find a partner winery by name, region, or country.
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
    gap: 16,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  card: {
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    position: 'relative',
  },
  cardPrimary: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  cardSecondary: {
    backgroundColor: Colors.btnWinery,
  },
  cardIcon: { fontSize: 40 },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: Colors.text,
  },
  cardDesc: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  cardTitleLight: {
    color: Colors.white,
  },
  cardDescLight: {
    color: Colors.white,
    opacity: 0.85,
  },
});
