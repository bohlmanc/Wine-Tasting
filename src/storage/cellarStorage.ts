import AsyncStorage from '@react-native-async-storage/async-storage';
import { CellarBottle } from '../types';

const CELLAR_KEY = '@wine_pocket_pal:cellar';

export async function saveCellarBottle(bottle: CellarBottle): Promise<void> {
  const existing = await loadCellarBottles();
  const idx = existing.findIndex(b => b.id === bottle.id);
  if (idx >= 0) {
    existing[idx] = bottle;
  } else {
    existing.unshift(bottle);
  }
  await AsyncStorage.setItem(CELLAR_KEY, JSON.stringify(existing));
}

export async function loadCellarBottles(): Promise<CellarBottle[]> {
  const raw = await AsyncStorage.getItem(CELLAR_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as CellarBottle[];
}

export async function deleteCellarBottle(id: string): Promise<void> {
  const existing = await loadCellarBottles();
  const filtered = existing.filter(b => b.id !== id);
  await AsyncStorage.setItem(CELLAR_KEY, JSON.stringify(filtered));
}

export async function getCellarBottle(id: string): Promise<CellarBottle | null> {
  const bottles = await loadCellarBottles();
  return bottles.find(b => b.id === id) ?? null;
}
