import { FlightPendingWine } from '../storage/flightPendingWineStorage';

const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '';

const MENU_PROMPT =
  `You are analyzing a wine menu or tasting sheet. Extract ALL wines listed on this page.\n` +
  `For each wine, extract every field you can find. Return ONLY a JSON array — no markdown, no explanation:\n\n` +
  `[\n` +
  `  {\n` +
  `    "name": "<wine name or cuvée, empty string if unknown>",\n` +
  `    "producer": "<winery or estate name, empty string if unknown>",\n` +
  `    "vintage": "<4-digit year, empty string if unknown>",\n` +
  `    "country": "<country of origin, empty string if unknown>",\n` +
  `    "region": "<appellation or region e.g. Napa Valley, Burgundy, empty string if unknown>",\n` +
  `    "grapes": ["<variety1>", "<variety2>"],\n` +
  `    "abv": "<alcohol percentage e.g. 13.5%, empty string if unknown>",\n` +
  `    "price": "<price per glass or bottle, empty string if unknown>"\n` +
  `  }\n` +
  `]\n\n` +
  `If no wines are found, return []. Return only the JSON array.`;

function makeId(): string {
  return `pending-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function scanWineMenuOnline(imageBase64: string): Promise<FlightPendingWine[]> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 },
          },
          { type: 'text', text: MENU_PROMPT },
        ],
      }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error ${response.status}: ${err}`);
  }

  const json = await response.json();
  const raw: string = json.content[0]?.text ?? '[]';
  const cleaned = raw.replace(/```[a-z]*\n?/g, '').trim();
  const parsed: Omit<FlightPendingWine, 'id'>[] = JSON.parse(cleaned);

  return parsed.map(w => ({
    ...w,
    id: makeId(),
    grapes: Array.isArray(w.grapes) ? w.grapes.filter(Boolean) : [],
  }));
}
