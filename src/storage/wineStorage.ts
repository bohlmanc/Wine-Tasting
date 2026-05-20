import AsyncStorage from '@react-native-async-storage/async-storage';
import { Wine } from '../types';

const WINES_KEY = '@wine_pocket_pal:wines';

export async function saveWine(wine: Wine): Promise<void> {
  const existing = await loadWines();
  const idx = existing.findIndex(w => w.id === wine.id);
  if (idx >= 0) {
    existing[idx] = wine;
  } else {
    existing.unshift(wine);
  }
  await AsyncStorage.setItem(WINES_KEY, JSON.stringify(existing));
}

export async function loadWines(): Promise<Wine[]> {
  const raw = await AsyncStorage.getItem(WINES_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as Wine[];
}

export async function deleteWine(id: string): Promise<void> {
  const existing = await loadWines();
  const filtered = existing.filter(w => w.id !== id);
  await AsyncStorage.setItem(WINES_KEY, JSON.stringify(filtered));
}

export async function getWine(id: string): Promise<Wine | null> {
  const wines = await loadWines();
  return wines.find(w => w.id === id) ?? null;
}

export async function clearAllData(): Promise<void> {
  const allKeys = await AsyncStorage.getAllKeys();
  const appKeys = [...allKeys].filter(k =>
    k.startsWith('@wine_pocket_pal') ||
    k === 'completed_flight_sessions' ||
    k === 'guided_session_active' ||
    k === 'guided_session_flight' ||
    k === '@completed_custom_flights' ||
    k.startsWith('flight_pending_wines_') ||
    k.startsWith('flight_original_wines_') ||
    k.startsWith('flight_skipped_wines_') ||
    k.startsWith('flight_override_')
  );
  if (appKeys.length > 0) {
    await AsyncStorage.multiRemove(appKeys);
  }
}
