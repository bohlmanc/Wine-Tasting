const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '';

export interface ScannedLabelData {
  name?: string;
  producer?: string;
  vintage?: string;
  country?: string;
  grapes?: string[];
  abv?: string;
  importer?: string;
}

interface ClaudeImageSource {
  type: 'base64';
  media_type: 'image/jpeg' | 'image/png' | 'image/webp';
  data: string;
}

interface ClaudeContentBlock {
  type: 'image' | 'text';
  source?: ClaudeImageSource;
  text?: string;
}

async function callClaude(content: ClaudeContentBlock[]): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error ${response.status}: ${err}`);
  }

  const json = await response.json();
  return json.content[0]?.text ?? '';
}

function buildPrompt(hasFront: boolean, hasBack: boolean): string {
  const parts: string[] = [];
  if (hasFront) parts.push('front label');
  if (hasBack) parts.push('back label');
  const labels = parts.join(' and ');

  return (
    `You are a wine label reading assistant. I am showing you the ${labels} of a wine bottle. ` +
    `Extract the following fields and respond ONLY with a JSON object — no markdown, no explanation:\n\n` +
    `{\n` +
    `  "name": "<wine name or cuvée>",\n` +
    `  "producer": "<winery or estate name>",\n` +
    `  "vintage": "<4-digit year or empty string>",\n` +
    `  "country": "<country of origin>",\n` +
    `  "grapes": ["<variety1>", "<variety2>"],\n` +
    `  "abv": "<alcohol percentage, e.g. 13.5%>",\n` +
    `  "importer": "<importer name or empty string>"\n` +
    `}\n\n` +
    `If a field cannot be determined from the labels, use an empty string (or empty array for grapes). ` +
    `Do not guess. Return only the JSON.`
  );
}

export async function scanWineLabel(
  frontBase64: string | null,
  backBase64: string | null,
): Promise<ScannedLabelData> {
  const content: ClaudeContentBlock[] = [];

  if (frontBase64) {
    content.push({
      type: 'image',
      source: { type: 'base64', media_type: 'image/jpeg', data: frontBase64 },
    });
  }
  if (backBase64) {
    content.push({
      type: 'image',
      source: { type: 'base64', media_type: 'image/jpeg', data: backBase64 },
    });
  }

  content.push({ type: 'text', text: buildPrompt(!!frontBase64, !!backBase64) });

  const raw = await callClaude(content);

  // Strip any accidental markdown fences
  const cleaned = raw.replace(/```[a-z]*\n?/g, '').trim();
  const parsed: ScannedLabelData = JSON.parse(cleaned);

  // Normalize grapes — ensure it's always an array of strings
  if (!Array.isArray(parsed.grapes)) {
    parsed.grapes = parsed.grapes ? [String(parsed.grapes)] : [];
  }

  return parsed;
}
