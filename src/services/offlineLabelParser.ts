import TextRecognition from '@react-native-ml-kit/text-recognition';
import { GRAPE_VARIETIES, WINE_COUNTRIES } from '../constants/wineData';
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

function extractCountry(text: string): string {
  const lower = text.toLowerCase();
  return WINE_COUNTRIES.find(c => lower.includes(c.toLowerCase())) ?? '';
}

function parseWineText(text: string): ScannedLabelData {
  return {
    vintage: extractVintage(text),
    abv: extractAbv(text),
    grapes: extractGrapes(text),
    country: extractCountry(text),
    // Name and producer require AI interpretation — left blank for manual entry
    name: '',
    producer: '',
    importer: '',
  };
}
