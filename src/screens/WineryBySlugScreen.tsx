import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { getWineryBySlug } from '../services/wineryService';
import { Colors } from '../constants/colors';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'WineryBySlug'>;

/**
 * Deep-link resolver: wpp://winery/{slug} → WineryDetail
 *
 * The native camera / QR code scan lands here with just the winery slug.
 * We resolve slug → UUID via Supabase and immediately replace this screen
 * with WineryDetail. If resolution fails we pop back to Home.
 */
export default function WineryBySlugScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const didNavigate = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      try {
        const winery = await getWineryBySlug(params.slug);
        if (cancelled || didNavigate.current) return;
        didNavigate.current = true;

        if (winery) {
          navigation.replace('WineryDetail', { wineryId: winery.id });
        } else {
          // Slug not found — go home with a brief message
          navigation.replace('Home');
        }
      } catch {
        if (cancelled || didNavigate.current) return;
        didNavigate.current = true;
        navigation.replace('Home');
      }
    }

    resolve();
    return () => { cancelled = true; };
  }, [params.slug]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.label}>Opening winery…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  label: {
    fontSize: 15,
    color: Colors.textMuted,
  },
});
