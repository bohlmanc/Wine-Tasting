import AsyncStorage from '@react-native-async-storage/async-storage';

const COMPLETED_FLIGHTS_KEY = '@completed_custom_flights';

export async function loadCompletedCustomFlightIds(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(COMPLETED_FLIGHTS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function markCustomFlightCompleted(flightId: string): Promise<void> {
  const ids = await loadCompletedCustomFlightIds();
  if (!ids.includes(flightId)) {
    ids.push(flightId);
    await AsyncStorage.setItem(COMPLETED_FLIGHTS_KEY, JSON.stringify(ids));
  }
}

export async function isCustomFlightCompleted(flightId: string): Promise<boolean> {
  const ids = await loadCompletedCustomFlightIds();
  return ids.includes(flightId);
}
