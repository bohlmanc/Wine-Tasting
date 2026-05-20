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
