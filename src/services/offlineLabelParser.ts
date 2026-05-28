import TextRecognition from '@react-native-ml-kit/text-recognition';
import { GRAPE_VARIETIES, WINE_COUNTRIES, WINE_REGIONS, US_AVA_TO_STATE } from '../constants/wineData';
import type { ScannedLabelData } from './labelScanService';

export async function scanLabelOffline(
  frontUri: string | null,
  backUri: string | null,
): Promise<ScannedLabelData> {
  const texts: string[] = [];

  if (frontUri) {
    const result = await TextRecognition.recognize(frontUri);
    const text = result.blocks.map(b => b.text).join('\n');
    console.log('[OCR] Front label:\n', text);
    texts.push(text);
  }
  if (backUri) {
    const result = await TextRecognition.recognize(backUri);
    const text = result.blocks.map(b => b.text).join('\n');
    console.log('[OCR] Back label:\n', text);
    texts.push(text);
  }

  const combined = texts.join('\n');
  console.log('[OCR] Combined text:\n', combined);
  return parseWineText(combined);
}

export function extractVintage(text: string): string {
  // Match a 4-digit year in the realistic wine vintage range
  const m = text.match(/\b(19[5-9]\d|20[0-2]\d)\b/);
  return m ? m[1] : '';
}

export function extractAbv(text: string): string {
  // 1. Decimal number immediately followed by % (most reliable signal)
  const p1 = text.match(/(\d{1,2}[.,]\d)\s*%/i);
  if (p1) return `${p1[1].replace(',', '.')}%`;

  // 1b. 3-digit number + % + alc/vol: OCR dropped the decimal (e.g. "125% alc" → "12.5%")
  const p1b = text.match(/\b(\d{3})\s*%\s*(?:alc|vol)/i);
  if (p1b) {
    const reconstructed = parseInt(p1b[1], 10) / 10;
    if (reconstructed >= 7 && reconstructed <= 22) return `${reconstructed}%`;
  }

  // 2. Whole number % followed by alc/vol keyword (\b prevents matching "25" inside "125%")
  const p2 = text.match(/\b(\d{2})\s*%\s*(?:alc|vol)/i);
  if (p2) return `${p2[1]}%`;

  // 3. ABV keyword phrase near a number (keyword-anchored, any order)
  const p3 = text.match(
    /(?:alc(?:ohol)?\.?\s+by\s+vol(?:ume)?|abv)\s*[.:)]*\s*(\d{1,2}[.,]?\d*)\s*%?/i,
  );
  if (p3) {
    const val = p3[1].replace(',', '.');
    return `${val}%`;
  }

  // 4. Scan each line: if the line references alc/vol/abv/%, pull any wine-range number
  for (const line of text.split('\n')) {
    if (/alc|vol|abv|%/i.test(line)) {
      const dec = line.match(/\b(\d{1,2}[.,]\d)\b/);
      if (dec) return `${dec[1].replace(',', '.')}%`;
      // 3-digit repair within a line (OCR dropped decimal, e.g. "ALC 125 VOL" → "12.5%")
      const threeDigit = line.match(/\b(\d{3})\b/);
      if (threeDigit) {
        const reconstructed = parseInt(threeDigit[1], 10) / 10;
        if (reconstructed >= 7 && reconstructed <= 22) return `${reconstructed}%`;
      }
      // Whole-number fallback already limited to realistic wine ABV range (8–19)
      const whole = line.match(/\b(1[0-9]|[89])\b/);
      if (whole) return `${whole[1]}%`;
    }
  }

  // 5. Bare whole-number % as last resort — restricted to wine ABV range to avoid
  // promo text ("25% more"), addresses, and other non-ABV percentages on the label
  const p5 = text.match(/\b([89]|1[0-9]|20)\s*%/);
  if (p5) return `${p5[1]}%`;

  return '';
}

export function extractProducer(text: string): string {
  // Same-line patterns: "Produced [and] [Bottled] by Name"
  const sameLinePatterns: RegExp[] = [
    /(?:grown[, ]+)?(?:produced|crafted|made|estate)\s+(?:(?:and|&)\s+)?(?:bottled|vinified|cellared\s+)?(?:(?:and|&)\s+)?(?:bottled\s+)?by\s*:?\s*([^,\n]{3,60})/i,
    /bottled\s+by\s*:?\s*([^,\n]{3,60})/i,
    /winery\s*:\s*([^,\n]{3,60})/i,
  ];

  for (const pat of sameLinePatterns) {
    const m = text.match(pat);
    if (m) {
      const candidate = m[1].trim();
      if (candidate.length >= 3) return candidate;
    }
  }

  // Multi-line: "Produced and Bottled by\nLOLA Wines St Helena,"
  const mlM = text.match(
    /(?:produced|crafted|made|grown|estate)[^\n]{0,60}by\s*:?\s*\n\s*([^,\n]{3,60})/i,
  );
  if (mlM) {
    const candidate = mlM[1].trim();
    if (candidate.length >= 3) return candidate;
  }

  return '';
}

// Strip diacritics so OCR without special chars still matches canonical spellings
function normalizeText(str: string): string {
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function extractGrapes(text: string): string[] {
  const normalized = normalizeText(text).toLowerCase();
  const matched = GRAPE_VARIETIES.filter(grape =>
    // Handle slash variants like "Syrah/Shiraz" — either side counts as a match
    grape.toLowerCase().split('/').some(v => normalized.includes(normalizeText(v.trim())))
  );
  // Remove any grape whose name is a substring of another matched grape
  // e.g. if "Grenache Blanc" matched, drop "Grenache"
  return matched.filter(grape => {
    const gNorm = normalizeText(grape).toLowerCase();
    return !matched.some(other => {
      const oNorm = normalizeText(other).toLowerCase();
      return oNorm !== gNorm && oNorm.includes(gNorm);
    });
  });
}

function wordBoundaryMatch(text: string, term: string): boolean {
  const normText = normalizeText(text);
  const normTerm = normalizeText(term);
  const escaped = normTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`, 'i').test(normText);
}

export function extractCountry(text: string): string {
  const direct = WINE_COUNTRIES.find(c => wordBoundaryMatch(text, c));
  if (direct) return direct;
  for (const [country, regions] of Object.entries(WINE_REGIONS)) {
    if (regions.some(r => wordBoundaryMatch(text, r))) return country;
  }
  return '';
}

export function extractRegion(text: string, country: string): string {
  const regions = WINE_REGIONS[country];
  if (!regions) return '';
  // Only match a region when it appears on a relatively isolated line —
  // no more than 3 words beyond the region itself. This prevents region names
  // embedded in long sentences (descriptions, producer addresses, etc.) from
  // triggering a false match.
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const matches = regions.filter(r => {
    if (r.length <= 2) return false;
    return lines.some(line => {
      if (!wordBoundaryMatch(line, r)) return false;
      const regionWordCount = r.split(/\s+/).length;
      const lineWordCount = line.split(/\s+/).filter(Boolean).length;
      return lineWordCount <= regionWordCount + 3;
    });
  });
  if (!matches.length) return '';
  // Prefer most specific: rank by word count desc, then length desc
  const best = matches.reduce((a, r) => {
    const aWords = a.split(/\s+/).length;
    const rWords = r.split(/\s+/).length;
    if (rWords !== aWords) return rWords > aWords ? r : a;
    return r.length > a.length ? r : a;
  });
  if (country === 'United States') {
    const state = US_AVA_TO_STATE[best];
    if (state && state !== best) return `${best}, ${state}`;
  }
  return best;
}

export function extractImporter(text: string): string {
  // Prefix-based patterns (most reliable)
  const prefixPatterns: RegExp[] = [
    // "Imported by ..." / "Imported and distributed by ..." / "Imported & bottled by ..."
    /imported\s+(?:(?:and|&)\s+)?(?:distributed|marketed|bottled\s+)?by\s*:?\s*([^\n,]{3,60})/i,
    // "Sole Importer: ..." / "Importer: ..." / "Importer of Record: ..."
    /(?:sole\s+)?importer(?:\s+of\s+record)?\s*:?\s*([^\n,]{3,60})/i,
    // "Distributed by ..."
    /distributed\s+by\s*:?\s*([^\n,]{3,60})/i,
  ];

  for (const pat of prefixPatterns) {
    const m = text.match(pat);
    if (m) return m[1].trim();
  }

  // Suffix-based: "Acme Imports", "Acme Wine Imports", "Acme Importing Co."
  const suffixM = text.match(
    /\b([A-Z][A-Za-z &'.]{1,40}\s+(?:Imports?|Importing(?:\s+Co\.?)?|Wine\s+Imports?))\b/,
  );
  if (suffixM) return suffixM[0].trim();

  return '';
}

export function parseWineText(text: string): ScannedLabelData {
  const country = extractCountry(text);
  return {
    vintage: extractVintage(text),
    abv: extractAbv(text),
    grapes: extractGrapes(text),
    country,
    region: extractRegion(text, country),
    name: '',
    producer: extractProducer(text),
    importer: extractImporter(text),
  };
}
