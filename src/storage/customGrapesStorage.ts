import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@wine_pocket_pal:custom_grapes';

export async function loadCustomGrapes(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveCustomGrape(grape: string): Promise<void> {
  try {
    const current = await loadCustomGrapes();
    if (!current.some(g => g.toLowerCase() === grape.toLowerCase())) {
      await AsyncStorage.setItem(KEY, JSON.stringify([...current, grape]));
    }
  } catch {
    // ignore storage errors
  }
}

export async function deleteCustomGrape(grape: string): Promise<void> {
  try {
    const current = await loadCustomGrapes();
    await AsyncStorage.setItem(KEY, JSON.stringify(current.filter(g => g !== grape)));
  } catch {
    // ignore storage errors
  }
}
