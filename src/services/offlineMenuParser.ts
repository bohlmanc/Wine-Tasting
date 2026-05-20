import TextRecognition from '@react-native-ml-kit/text-recognition';
import { GRAPE_VARIETIES, WINE_COUNTRIES, WINE_REGIONS, US_AVA_TO_STATE } from '../constants/wineData';
import { FlightPendingWine } from '../storage/flightPendingWineStorage';

function makeId(): string {
  return `pending-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── Text normalization ────────────────────────────────────────────────────────

function normalizeText(str: string): string {
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// ── Field extractors (same logic as offlineLabelParser) ───────────────────────

function extractVintage(text: string): string {
  const m = text.match(/\b(19[5-9]\d|20[0-2]\d)\b/);
  return m ? m[1] : '';
}

function extractAbv(text: string): string {
  const p1 = text.match(/(\d{1,2}[.,]\d)\s*%/i);
  if (p1) return `${p1[1].replace(',', '.')}%`;
  const p2 = text.match(/\b(\d{2})\s*%\s*(?:alc|vol)/i);
  if (p2) return `${p2[1]}%`;
  const p3 = text.match(/(?:alc(?:ohol)?\.?\s+by\s+vol(?:ume)?|abv)\s*[.:)]*\s*(\d{1,2}[.,]?\d*)\s*%?/i);
  if (p3) return `${p3[1].replace(',', '.')}%`;
  return '';
}

function wordBoundaryMatch(text: string, term: string): boolean {
  const escaped = normalizeText(term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`, 'i').test(normalizeText(text));
}

function extractGrapes(text: string): string[] {
  const normalized = normalizeText(text).toLowerCase();
  const matched = GRAPE_VARIETIES.filter(grape =>
    grape.toLowerCase().split('/').some(v => normalized.includes(normalizeText(v.trim())))
  );
  return matched.filter(grape => {
    const gNorm = normalizeText(grape).toLowerCase();
    return !matched.some(other => {
      const oNorm = normalizeText(other).toLowerCase();
      return oNorm !== gNorm && oNorm.includes(gNorm);
    });
  });
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

function extractPrice(text: string): string {
  // "$12", "$12.50", "€15", "£10", "12/glass", "24/btl"
  const m = text.match(/[$€£]\s*\d+(?:[.,]\d{1,2})?|\d+(?:[.,]\d{1,2})?\s*\/\s*(?:glass|btl|bottle|oz)/i);
  return m ? m[0].trim() : '';
}

// ── Wine-hint detection ───────────────────────────────────────────────────────

function segmentHasWineHint(segment: string): boolean {
  if (/\b(19[5-9]\d|20[0-2]\d)\b/.test(segment)) return true;
  if (/[$€£]\s*\d/.test(segment)) return true;
  const lower = normalizeText(segment).toLowerCase();
  if (GRAPE_VARIETIES.some(g => g.toLowerCase().split('/').some(v => lower.includes(normalizeText(v.trim()))))) return true;
  if (WINE_COUNTRIES.some(c => wordBoundaryMatch(segment, c))) return true;
  return false;
}

// ── Segment splitting strategies ──────────────────────────────────────────────

function splitByNumberedLines(lines: string[]): string[] {
  const numbered = /^[\d]+[.)]\s+/;
  const segments: string[] = [];
  let current: string[] = [];
  for (const line of lines) {
    if (numbered.test(line.trim())) {
      if (current.length > 0) segments.push(current.join('\n'));
      current = [line.replace(numbered, '').trim()];
    } else if (current.length > 0) {
      current.push(line);
    }
  }
  if (current.length > 0) segments.push(current.join('\n'));
  return segments.filter(Boolean);
}

function splitByPriceLines(lines: string[]): string[] {
  // Each line containing a price terminates an entry; preceding lines belong to that entry
  const pricePattern = /[$€£]\s*\d|\d+\s*\/\s*(?:glass|btl|bottle)/i;
  const segments: string[] = [];
  let current: string[] = [];
  for (const line of lines) {
    current.push(line);
    if (pricePattern.test(line)) {
      segments.push(current.join('\n'));
      current = [];
    }
  }
  if (current.length > 0 && current.some(l => l.trim())) {
    segments.push(current.join('\n'));
  }
  return segments.filter(s => s.trim());
}

function splitIntoSegments(text: string): string[] {
  const lines = text.split('\n');

  // Strategy 1: numbered list ("1. Wine", "2. Wine")
  const numberedCount = lines.filter(l => /^[\d]+[.)]\s+.{3,}/.test(l.trim())).length;
  if (numberedCount >= 2) {
    const segs = splitByNumberedLines(lines);
    if (segs.length >= 2) return segs;
  }

  // Strategy 2: double-newline block separation (from ML Kit block joins)
  const blockSegs = text.split(/\n{2,}/).map(s => s.trim()).filter(Boolean);
  if (blockSegs.length >= 2) {
    const wineCount = blockSegs.filter(segmentHasWineHint).length;
    if (wineCount >= Math.max(2, blockSegs.length * 0.4)) {
      return blockSegs;
    }
  }

  // Strategy 3: each line has a price → price-terminated entries
  const priceLineCount = lines.filter(l => /[$€£]\s*\d|\d+\s*\/\s*(?:glass|btl|bottle)/i.test(l)).length;
  if (priceLineCount >= 2) {
    const segs = splitByPriceLines(lines);
    if (segs.length >= 2) return segs;
  }

  // Strategy 4: pipe-delimited single-line entries ("Wine | 2021 | France | $14")
  const pipeLines = lines.filter(l => l.includes('|') && segmentHasWineHint(l));
  if (pipeLines.length >= 2) return pipeLines;

  // Fallback: each non-empty, non-header line is its own entry
  return lines
    .map(l => l.trim())
    .filter(l => l && !/^(white|red|rose|rosé|sparkling|dessert|wines?|by the glass|by the bottle)$/i.test(l));
}

// ── Name extraction from a segment ───────────────────────────────────────────

const SECTION_HEADER = /^(white|red|rose|rosé|sparkling|dessert|orange|wines?|by the glass|by the bottle|our selection|featured|flights?|bubbles|pours?)$/i;
const PRICE_ONLY = /^[$€£\d]/;
const YEAR_ONLY = /^\d{4}$/;
const ABV_ONLY = /^\d{1,2}[.,]\d\s*%?$/;
const GRAPE_HEADER = /^(cabernet|merlot|chardonnay|pinot|syrah|shiraz|zinfandel|sauvignon|riesling|grenache|viognier)\s*$/i;

function extractNameFromSegment(segment: string): string {
  const lines = segment.split('\n').map(l => l.trim()).filter(Boolean);
  for (const line of lines) {
    if (SECTION_HEADER.test(line)) continue;
    if (YEAR_ONLY.test(line)) continue;
    if (ABV_ONLY.test(line)) continue;
    if (GRAPE_HEADER.test(line)) continue;
    // Skip lines that are only a price
    if (PRICE_ONLY.test(line) && extractPrice(line) && line.replace(/[$€£\d.,\s/a-zA-Z]/g, '').length === 0) continue;

    let name = line
      .replace(/^[\d]+[.)]\s*/, '')                    // numbered prefix
      .replace(/\s*[$€£][\d.,]+[^\w]*$/, '')            // trailing price
      .replace(/\b(19[5-9]\d|20[0-2]\d)\b/g, '')        // all vintage years, anywhere
      .replace(/\s*[|–—]\s*.*$/, '')                    // pipe/dash suffix
      .replace(/\s+/g, ' ')                             // collapse gaps left by year removal
      .trim();

    if (name.length >= 2) return name;
  }
  return '';
}

// ── Full segment parser ───────────────────────────────────────────────────────

function parseSegment(segment: string): Omit<FlightPendingWine, 'id'> {
  const country = extractCountry(segment);
  return {
    name: extractNameFromSegment(segment),
    vintage: extractVintage(segment),
    grapes: extractGrapes(segment),
    country,
    region: extractRegion(segment, country),
    abv: extractAbv(segment),
    price: extractPrice(segment),
  };
}

// Fields a wine entry can have: name, producer (winery), vintage, country, region, grapes, abv, price
function countWineFields(wine: Omit<FlightPendingWine, 'id'>): number {
  return [
    wine.name?.trim(),
    wine.producer?.trim(),
    wine.vintage?.trim(),
    wine.country?.trim(),
    wine.region?.trim(),
    wine.grapes?.length ? 'yes' : '',
    wine.abv?.trim(),
    wine.price?.trim(),
  ].filter(Boolean).length;
}

function hasUsefulContent(wine: Omit<FlightPendingWine, 'id'>): boolean {
  // Vintage and at least one grape are mandatory — menus have plenty of non-wine text
  // that can accidentally accumulate 3 fields without these two essential markers.
  const hasVintage = !!wine.vintage?.trim();
  const hasGrapes = !!(wine.grapes?.length);
  return hasVintage && hasGrapes && countWineFields(wine) >= 3;
}

// ── Public API ────────────────────────────────────────────────────────────────

export function parseMenuText(text: string): FlightPendingWine[] {
  const segments = splitIntoSegments(text);
  const results: FlightPendingWine[] = [];

  for (const segment of segments) {
    if (!segmentHasWineHint(segment) && !segment.match(/[A-Za-z]{3}/)) continue;
    const parsed = parseSegment(segment);
    if (hasUsefulContent(parsed)) {
      results.push({ ...parsed, id: makeId() });
    }
  }

  return results;
}

export async function scanMenuOffline(uri: string): Promise<FlightPendingWine[]> {
  const result = await TextRecognition.recognize(uri);
  // Join blocks with double newline so visual separation becomes a split boundary
  const text = result.blocks.map(b => b.text).join('\n\n');
  console.log('[MenuOCR] Full text:\n', text);
  return parseMenuText(text);
}
