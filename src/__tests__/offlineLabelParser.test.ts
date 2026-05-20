jest.mock('@react-native-ml-kit/text-recognition', () => ({
  default: { recognize: jest.fn() },
}));

import {
  extractVintage,
  extractAbv,
  extractGrapes,
  extractCountry,
  extractRegion,
  extractProducer,
  extractImporter,
  parseWineText,
} from '../services/offlineLabelParser';

describe('extractVintage', () => {
  it('extracts a 4-digit year in wine vintage range', () => {
    expect(extractVintage('2019 Chardonnay')).toBe('2019');
  });

  it('extracts vintage from label-style text', () => {
    expect(extractVintage('Vintage 2021\nProduced by Winery')).toBe('2021');
  });

  it('returns empty string when no year present', () => {
    expect(extractVintage('Chardonnay, no year')).toBe('');
  });

  it('rejects years outside the realistic wine range', () => {
    expect(extractVintage('Year 2031')).toBe('');
    expect(extractVintage('Year 1949')).toBe('');
  });

  it('matches boundary years 1950 and 2029', () => {
    expect(extractVintage('1950 wine')).toBe('1950');
    expect(extractVintage('2029 wine')).toBe('2029');
  });
});

describe('extractAbv', () => {
  it('extracts decimal % directly', () => {
    expect(extractAbv('13.5% Alcohol')).toBe('13.5%');
  });

  it('normalizes comma-decimal to dot', () => {
    expect(extractAbv('Alc 13,5%')).toBe('13.5%');
  });

  it('repairs 3-digit OCR (dropped decimal) when followed by alc/vol keyword', () => {
    expect(extractAbv('125% alc/vol')).toBe('12.5%');
  });

  it('extracts whole-number % with alc/vol keyword', () => {
    expect(extractAbv('14% alc by vol')).toBe('14%');
  });

  it('extracts from "Alcohol by Volume" phrase', () => {
    expect(extractAbv('Alcohol by Volume: 14.5%')).toBe('14.5%');
  });

  it('extracts decimal from a line containing alc keyword', () => {
    expect(extractAbv('ALC 13.5 VOL')).toBe('13.5%');
  });

  it('repairs 3-digit number in alc line (dropped decimal)', () => {
    expect(extractAbv('ALC 125 VOL')).toBe('12.5%');
  });

  it('returns empty string when no ABV found', () => {
    expect(extractAbv('Some wine label text')).toBe('');
  });

  it('ignores non-ABV percentages outside wine range', () => {
    expect(extractAbv('25% more flavor')).toBe('');
  });
});

describe('extractGrapes', () => {
  it('matches a single grape variety', () => {
    expect(extractGrapes('100% Cabernet Sauvignon')).toContain('Cabernet Sauvignon');
  });

  it('matches multiple grape varieties', () => {
    const result = extractGrapes('A blend of Cabernet Sauvignon, Merlot, and Malbec');
    expect(result).toContain('Cabernet Sauvignon');
    expect(result).toContain('Merlot');
    expect(result).toContain('Malbec');
  });

  it('matches slash variants — Shiraz matches Syrah/Shiraz entry', () => {
    expect(extractGrapes('100% Shiraz')).toContain('Syrah/Shiraz');
  });

  it('deduplicates: Grenache Blanc match removes the shorter Grenache match', () => {
    const result = extractGrapes('Made with Grenache Blanc');
    expect(result).toContain('Grenache Blanc');
    expect(result).not.toContain('Grenache');
  });

  it('normalizes diacritics so OCR without accents still matches', () => {
    expect(extractGrapes('100% viognier').length).toBeGreaterThan(0);
  });

  it('returns empty array when no grapes found', () => {
    expect(extractGrapes('Generic label text with no grape names')).toEqual([]);
  });
});

describe('extractCountry', () => {
  it('matches a country directly', () => {
    expect(extractCountry('Produced in France')).toBe('France');
  });

  it('infers country from a known region name', () => {
    expect(extractCountry('A wine from Bordeaux')).toBe('France');
    expect(extractCountry('Napa Valley wine')).toBe('United States');
    expect(extractCountry('Marlborough Sauvignon Blanc')).toBe('New Zealand');
  });

  it('returns empty string when nothing matches', () => {
    expect(extractCountry('A mysterious wine label')).toBe('');
  });
});

describe('extractRegion', () => {
  it('returns a matching region for a known country', () => {
    expect(extractRegion('A fine Bordeaux wine', 'France')).toBe('Bordeaux');
  });

  it('prefers the most specific region when multiple match', () => {
    // Both "Burgundy" and "Gevrey-Chambertin" appear; longer name wins
    expect(extractRegion('Gevrey-Chambertin, Burgundy', 'France')).toBe('Gevrey-Chambertin');
  });

  it('appends state for US AVAs — California', () => {
    expect(extractRegion('Napa Valley Cabernet Sauvignon', 'United States')).toBe(
      'Napa Valley, California',
    );
  });

  it('appends state for US AVAs — Oregon', () => {
    expect(extractRegion('Willamette Valley Pinot Noir', 'United States')).toBe(
      'Willamette Valley, Oregon',
    );
  });

  it('returns empty string for an unrecognized country', () => {
    expect(extractRegion('some text', 'Atlantis')).toBe('');
  });

  it('returns empty string when no region found in known country', () => {
    expect(extractRegion('Generic label text', 'France')).toBe('');
  });
});

describe('extractProducer', () => {
  it('matches "Produced by Name" on same line', () => {
    expect(extractProducer('Produced by LOLA Wines')).toBe('LOLA Wines');
  });

  it('matches "Bottled by Name"', () => {
    expect(extractProducer('Bottled by Ridge Vineyards')).toBe('Ridge Vineyards');
  });

  it('matches "Produced and Bottled by Name" (falls through to bottled-by pattern)', () => {
    expect(extractProducer('Produced and Bottled by Jordan Winery')).toBe('Jordan Winery');
  });

  it('matches multi-line "Produced and Bottled by\\nName"', () => {
    expect(extractProducer('Produced and Bottled by\nLOLA Wines St Helena,')).toBe(
      'LOLA Wines St Helena',
    );
  });

  it('returns empty string when no producer found', () => {
    expect(extractProducer('A generic wine label')).toBe('');
  });
});

describe('extractImporter', () => {
  it('matches "Imported by Name"', () => {
    expect(extractImporter('Imported by Wine World LLC')).toBe('Wine World LLC');
  });

  it('matches "Importer: Name"', () => {
    expect(extractImporter('Importer: Acme Wine Company')).toBe('Acme Wine Company');
  });

  it('matches "Sole Importer: Name"', () => {
    expect(extractImporter('Sole Importer: Fine Wine Merchants')).toBe('Fine Wine Merchants');
  });

  it('matches "Distributed by Name"', () => {
    expect(extractImporter('Distributed by Great Wines Inc')).toBe('Great Wines Inc');
  });

  it('matches importer suffix pattern (e.g. "Wilson Daniels Imports")', () => {
    expect(extractImporter('Wilson Daniels Imports')).toBe('Wilson Daniels Imports');
  });

  it('returns empty string when no importer found', () => {
    expect(extractImporter('Produced and bottled by Local Winery')).toBe('');
  });
});

describe('parseWineText (integration)', () => {
  it('parses a realistic back-label text', () => {
    const text = [
      'LOLA Wines',
      '2019 Chardonnay',
      'Napa Valley',
      'Alcohol 13.5% by Volume',
      'Produced and Bottled by LOLA Wines, St. Helena, CA',
      'Imported by Wilson Daniels Ltd.',
    ].join('\n');

    const result = parseWineText(text);
    expect(result.vintage).toBe('2019');
    expect(result.abv).toBe('13.5%');
    expect(result.country).toBe('United States');
    expect(result.region).toContain('Napa Valley');
    expect(result.producer).toBeTruthy();
  });

  it('returns empty values for blank input', () => {
    const result = parseWineText('');
    expect(result.vintage).toBe('');
    expect(result.abv).toBe('');
    expect(result.grapes).toEqual([]);
    expect(result.country).toBe('');
    expect(result.region).toBe('');
    expect(result.producer).toBe('');
    expect(result.importer).toBe('');
    expect(result.name).toBe('');
  });
});
