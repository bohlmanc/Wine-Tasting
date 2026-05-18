import AsyncStorage from '@react-native-async-storage/async-storage';
import { CompletedFlightSession, GuidedSession, TastingFlight } from '../types';

const SESSION_KEY = 'guided_session_active';
const FLIGHT_KEY = 'guided_session_flight';
const COMPLETED_KEY = 'completed_flight_sessions';

export async function saveGuidedSession(session: GuidedSession): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function loadGuidedSession(sessionId: string): Promise<GuidedSession | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  const session: GuidedSession = JSON.parse(raw);
  return session.id === sessionId ? session : null;
}

export async function saveFlightForSession(flight: TastingFlight): Promise<void> {
  await AsyncStorage.setItem(FLIGHT_KEY, JSON.stringify(flight));
}

export async function loadFlightForSession(flightId: string): Promise<TastingFlight | null> {
  const raw = await AsyncStorage.getItem(FLIGHT_KEY);
  if (!raw) return null;
  const flight: TastingFlight = JSON.parse(raw);
  return flight.id === flightId ? flight : null;
}

export async function clearGuidedSession(): Promise<void> {
  await Promise.all([
    AsyncStorage.removeItem(SESSION_KEY),
    AsyncStorage.removeItem(FLIGHT_KEY),
  ]);
}

export async function archiveFlightSession(session: GuidedSession, flight: TastingFlight): Promise<void> {
  const existing = await loadCompletedFlightSessions();
  const filtered = existing.filter(cs => cs.session.id !== session.id);
  await AsyncStorage.setItem(COMPLETED_KEY, JSON.stringify([{ session, flight }, ...filtered]));
}

export async function loadCompletedFlightSessions(): Promise<CompletedFlightSession[]> {
  const raw = await AsyncStorage.getItem(COMPLETED_KEY);
  if (!raw) return [];
  return JSON.parse(raw);
}

export async function loadActiveSessionForFlight(flightId: string): Promise<GuidedSession | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  const session: GuidedSession = JSON.parse(raw);
  return session.flightId === flightId ? session : null;
}

export function createGuidedSession(params: {
  wineryId: string;
  flightId: string;
  flightName: string;
  wineryName: string;
  wineCount: number;
}): GuidedSession {
  return {
    id: `session-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    wineryId: params.wineryId,
    flightId: params.flightId,
    flightName: params.flightName,
    wineryName: params.wineryName,
    startedAt: new Date().toISOString(),
    currentIndex: 0,
    completedWineIds: Array(params.wineCount).fill(null),
  };
}
