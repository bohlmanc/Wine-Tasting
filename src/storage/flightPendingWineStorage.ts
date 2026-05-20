import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FlightPendingWine {
  id: string;
  name?: string;
  producer?: string;
  vintage?: string;
  country?: string;
  region?: string;
  grapes?: string[];
  abv?: string;
  price?: string;
}

const key = (flightId: string) => `flight-pending-wines-${flightId}`;

export async function savePendingWines(flightId: string, wines: FlightPendingWine[]): Promise<void> {
  await AsyncStorage.setItem(key(flightId), JSON.stringify(wines));
}

export async function getPendingWines(flightId: string): Promise<FlightPendingWine[]> {
  const raw = await AsyncStorage.getItem(key(flightId));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as FlightPendingWine[];
  } catch {
    return [];
  }
}

export async function removePendingWine(flightId: string, wineId: string): Promise<void> {
  const wines = await getPendingWines(flightId);
  await savePendingWines(flightId, wines.filter(w => w.id !== wineId));
}

export async function clearPendingWines(flightId: string): Promise<void> {
  await AsyncStorage.removeItem(key(flightId));
}

const originalKey = (flightId: string) => `flight-original-wines-${flightId}`;
const skippedKey = (flightId: string) => `flight-skipped-ids-${flightId}`;

export async function saveOriginalWines(flightId: string, wines: FlightPendingWine[]): Promise<void> {
  await AsyncStorage.setItem(originalKey(flightId), JSON.stringify(wines));
}

export async function getOriginalWines(flightId: string): Promise<FlightPendingWine[]> {
  const raw = await AsyncStorage.getItem(originalKey(flightId));
  if (!raw) return [];
  try { return JSON.parse(raw) as FlightPendingWine[]; } catch { return []; }
}

export async function addSkippedWineId(flightId: string, wineId: string): Promise<void> {
  const existing = await getSkippedWineIds(flightId);
  if (!existing.includes(wineId)) {
    await AsyncStorage.setItem(skippedKey(flightId), JSON.stringify([...existing, wineId]));
  }
}

export async function getSkippedWineIds(flightId: string): Promise<string[]> {
  const raw = await AsyncStorage.getItem(skippedKey(flightId));
  if (!raw) return [];
  try { return JSON.parse(raw) as string[]; } catch { return []; }
}
