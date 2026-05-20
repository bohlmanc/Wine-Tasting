import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loadCompletedCustomFlightIds,
  markCustomFlightCompleted,
  isCustomFlightCompleted,
} from '../storage/customFlightStorage';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('loadCompletedCustomFlightIds', () => {
  it('returns empty array when nothing has been stored', async () => {
    expect(await loadCompletedCustomFlightIds()).toEqual([]);
  });
});

describe('markCustomFlightCompleted', () => {
  it('adds a flight id to the completed list', async () => {
    await markCustomFlightCompleted('flight-1');
    expect(await loadCompletedCustomFlightIds()).toContain('flight-1');
  });

  it('does not add a duplicate id when marked twice', async () => {
    await markCustomFlightCompleted('flight-1');
    await markCustomFlightCompleted('flight-1');
    const ids = await loadCompletedCustomFlightIds();
    expect(ids.filter(id => id === 'flight-1')).toHaveLength(1);
  });

  it('persists multiple distinct flight ids', async () => {
    await markCustomFlightCompleted('flight-1');
    await markCustomFlightCompleted('flight-2');
    const ids = await loadCompletedCustomFlightIds();
    expect(ids).toContain('flight-1');
    expect(ids).toContain('flight-2');
  });
});

describe('isCustomFlightCompleted', () => {
  it('returns false before a flight is marked complete', async () => {
    expect(await isCustomFlightCompleted('flight-1')).toBe(false);
  });

  it('returns true after marking a flight complete', async () => {
    await markCustomFlightCompleted('flight-1');
    expect(await isCustomFlightCompleted('flight-1')).toBe(true);
  });

  it('returns false for a flight id that was not marked', async () => {
    await markCustomFlightCompleted('flight-1');
    expect(await isCustomFlightCompleted('flight-2')).toBe(false);
  });
});
