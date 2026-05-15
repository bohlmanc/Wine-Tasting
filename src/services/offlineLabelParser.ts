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

function extractVintage(text: string): string {
  // Match a 4-digit year in the realistic wine vintage range
  const m = text.match(/\b(19[5-9]\d|20[0-2]\d)\b/);
  return m ? m[1] : '';
}

function extractAbv(text: string): string {
  // Handles: "13.5%", "13,5% alc", "14% vol", "Alc. 13.5% by vol"
  const m = text.match(/(?:alc\.?\s*)?(\d{1,2}[.,]\d)\s*%|(\d{2})\s*%\s*(?:alc|vol)/i);
  if (!m) return '';
  return `${(m[1] ?? m[2]).replace(',', '.')}%`;
}

function extractGrapes(text: string): string[] {
  const lower = text.toLowerCase();
  return GRAPE_VARIETIES.filter(grape =>
    // Handle slash variants like "Syrah/Shiraz" — either side counts as a match
    grape.toLowerCase().split('/').some(v => lower.includes(v.trim()))
  );
}

function wordBoundaryMatch(text: string, term: string): boolean {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
}

function extractCountry(text: string): string {
  const direct = WINE_COUNTRIES.find(c => wordBoundaryMatch(text, c));
  if (direct) return direct;
  for (const [country, regions] of Object.entries(WINE_REGIONS)) {
    if (regions.some(r => wordBoundaryMatch(text, r))) return country;
  }
  return '';
}

function extractRegion(text: string, country: string): string {
  const regions = WINE_REGIONS[country];
  if (!regions) return '';
  const matches = regions.filter(r => wordBoundaryMatch(text, r));
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

function extractImporter(text: string): string {
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

function parseWineText(text: string): ScannedLabelData {
  const country = extractCountry(text);
  return {
    vintage: extractVintage(text),
    abv: extractAbv(text),
    grapes: extractGrapes(text),
    country,
    region: extractRegion(text, country),
    // Name and producer require AI interpretation — left blank for manual entry
    name: '',
    producer: '',
    importer: extractImporter(text),
  };
}
