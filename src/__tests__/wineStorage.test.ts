import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveWine, loadWines, deleteWine, getWine, clearAllData } from '../storage/wineStorage';
import type { Wine } from '../types';

function makeWine(id: string, name = 'Test Wine'): Wine {
  return {
    id,
    tastingType: 'full',
    createdAt: new Date().toISOString(),
    dateTasted: new Date().toISOString(),
    producer: 'Test Producer',
    name,
    country: 'France',
    region: 'Bordeaux',
    subregion: '',
    vineyard: '',
    grapes: ['Merlot'],
    importer: '',
    vintage: '2019',
    abv: '13.5%',
    photo: null,
    style: 'red',
    color: 'ruby',
    colorIntensity: 'medium',
    clarity: 'clear',
    aromas: [],
    sweetness: 'dry',
    acidity: 'medium',
    tannin: 'medium',
    alcohol: 'medium',
    body: 'medium',
    finish: 'medium',
    liked: true,
    rating: 4,
    notes: '',
  };
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('loadWines', () => {
  it('returns empty array when storage is empty', async () => {
    expect(await loadWines()).toEqual([]);
  });
});

describe('saveWine', () => {
  it('persists a new wine retrievable via loadWines', async () => {
    const wine = makeWine('w1');
    await saveWine(wine);
    expect(await loadWines()).toEqual([wine]);
  });

  it('prepends new wines so the most recent appears first', async () => {
    await saveWine(makeWine('w1'));
    await saveWine(makeWine('w2'));
    const wines = await loadWines();
    expect(wines[0].id).toBe('w2');
    expect(wines[1].id).toBe('w1');
  });

  it('updates an existing wine in place without creating a duplicate', async () => {
    const wine = makeWine('w1', 'Original Name');
    await saveWine(wine);
    await saveWine({ ...wine, name: 'Updated Name' });
    const wines = await loadWines();
    expect(wines).toHaveLength(1);
    expect(wines[0].name).toBe('Updated Name');
  });
});

describe('deleteWine', () => {
  it('removes the wine with the given id', async () => {
    await saveWine(makeWine('w1'));
    await saveWine(makeWine('w2'));
    await deleteWine('w1');
    const wines = await loadWines();
    expect(wines).toHaveLength(1);
    expect(wines[0].id).toBe('w2');
  });

  it('is a no-op for an unknown id', async () => {
    await saveWine(makeWine('w1'));
    await deleteWine('unknown');
    expect(await loadWines()).toHaveLength(1);
  });
});

describe('getWine', () => {
  it('returns a wine by id', async () => {
    const wine = makeWine('w1');
    await saveWine(wine);
    expect(await getWine('w1')).toEqual(wine);
  });

  it('returns null for an unknown id', async () => {
    await saveWine(makeWine('w1'));
    expect(await getWine('unknown')).toBeNull();
  });

  it('returns null from empty storage', async () => {
    expect(await getWine('w1')).toBeNull();
  });
});

describe('clearAllData', () => {
  it('removes all app data so loadWines returns empty', async () => {
    await saveWine(makeWine('w1'));
    await clearAllData();
    expect(await loadWines()).toEqual([]);
  });
});
