import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveGuidedSession,
  loadGuidedSession,
  saveFlightForSession,
  loadFlightForSession,
  clearGuidedSession,
  archiveFlightSession,
  loadCompletedFlightSessions,
  loadActiveSessionForFlight,
  createGuidedSession,
} from '../storage/guidedSessionStorage';
import type { GuidedSession, TastingFlight } from '../types';

function makeSession(overrides: Partial<GuidedSession> = {}): GuidedSession {
  return {
    id: 'session-1',
    wineryId: 'winery-1',
    flightId: 'flight-1',
    flightName: 'Test Flight',
    wineryName: 'Test Winery',
    startedAt: '2024-01-01T00:00:00Z',
    currentIndex: 0,
    currentWineId: null,
    completedWineIds: {},
    ...overrides,
  };
}

function makeFlight(overrides: Partial<TastingFlight> = {}): TastingFlight {
  return {
    id: 'flight-1',
    wineryId: 'winery-1',
    name: 'Test Flight',
    description: '',
    isActive: true,
    sortOrder: 0,
    wines: [],
    ...overrides,
  };
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('saveGuidedSession / loadGuidedSession', () => {
  it('returns the saved session when the id matches', async () => {
    const session = makeSession();
    await saveGuidedSession(session);
    expect(await loadGuidedSession('session-1')).toEqual(session);
  });

  it('returns null when the requested id does not match the stored session', async () => {
    await saveGuidedSession(makeSession({ id: 'session-1' }));
    expect(await loadGuidedSession('other-session')).toBeNull();
  });

  it('returns null when no session is stored', async () => {
    expect(await loadGuidedSession('session-1')).toBeNull();
  });
});

describe('saveFlightForSession / loadFlightForSession', () => {
  it('returns the saved flight when the id matches', async () => {
    const flight = makeFlight();
    await saveFlightForSession(flight);
    expect(await loadFlightForSession('flight-1')).toEqual(flight);
  });

  it('returns null when the requested id does not match the stored flight', async () => {
    await saveFlightForSession(makeFlight({ id: 'flight-1' }));
    expect(await loadFlightForSession('other-flight')).toBeNull();
  });

  it('returns null when no flight is stored', async () => {
    expect(await loadFlightForSession('flight-1')).toBeNull();
  });
});

describe('clearGuidedSession', () => {
  it('removes both the active session and flight from storage', async () => {
    await saveGuidedSession(makeSession());
    await saveFlightForSession(makeFlight());
    await clearGuidedSession();
    expect(await loadGuidedSession('session-1')).toBeNull();
    expect(await loadFlightForSession('flight-1')).toBeNull();
  });
});

describe('archiveFlightSession / loadCompletedFlightSessions', () => {
  it('stores a completed session and retrieves it', async () => {
    const session = makeSession();
    const flight = makeFlight();
    await archiveFlightSession(session, flight);
    const completed = await loadCompletedFlightSessions();
    expect(completed).toHaveLength(1);
    expect(completed[0].session).toEqual(session);
    expect(completed[0].flight).toEqual(flight);
  });

  it('prepends new archives so the most recent is first', async () => {
    await archiveFlightSession(makeSession({ id: 's1' }), makeFlight({ id: 'f1' }));
    await archiveFlightSession(makeSession({ id: 's2' }), makeFlight({ id: 'f2' }));
    const completed = await loadCompletedFlightSessions();
    expect(completed[0].session.id).toBe('s2');
  });

  it('replaces an existing entry when a session with the same id is archived again', async () => {
    const session = makeSession({ id: 's1', currentIndex: 0 });
    await archiveFlightSession(session, makeFlight());
    await archiveFlightSession({ ...session, currentIndex: 3 }, makeFlight());
    const completed = await loadCompletedFlightSessions();
    expect(completed).toHaveLength(1);
    expect(completed[0].session.currentIndex).toBe(3);
  });

  it('returns empty array from empty storage', async () => {
    expect(await loadCompletedFlightSessions()).toEqual([]);
  });
});

describe('loadActiveSessionForFlight', () => {
  it('returns the session when flightId matches', async () => {
    const session = makeSession({ flightId: 'flight-1' });
    await saveGuidedSession(session);
    expect(await loadActiveSessionForFlight('flight-1')).toEqual(session);
  });

  it('returns null when flightId does not match', async () => {
    await saveGuidedSession(makeSession({ flightId: 'flight-1' }));
    expect(await loadActiveSessionForFlight('flight-2')).toBeNull();
  });

  it('returns null when no session is stored', async () => {
    expect(await loadActiveSessionForFlight('flight-1')).toBeNull();
  });
});

describe('createGuidedSession', () => {
  it('creates a session with the correct shape and initial state', () => {
    const session = createGuidedSession({
      wineryId: 'w1',
      flightId: 'f1',
      flightName: 'My Flight',
      wineryName: 'My Winery',
    });
    expect(session.wineryId).toBe('w1');
    expect(session.flightId).toBe('f1');
    expect(session.flightName).toBe('My Flight');
    expect(session.wineryName).toBe('My Winery');
    expect(session.currentIndex).toBe(0);
    expect(session.currentWineId).toBeNull();
    expect(session.completedWineIds).toEqual({});
    expect(session.id).toMatch(/^session-/);
    expect(session.startedAt).toBeTruthy();
  });
});
