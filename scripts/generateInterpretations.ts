/**
 * One-time script to generate transit interpretation copy for all ~303 combinations.
 * Run: ANTHROPIC_API_KEY=<key> npm run generate:interpretations
 *
 * Idempotent: merges new entries into the existing JSON file if it exists.
 * Batches keys into groups of 50 to keep prompts focused and avoid token limits.
 */

import Anthropic from '@anthropic-ai/sdk';
import { writeFileSync, existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const localeArgIdx = process.argv.indexOf('--locale');
const targetLocale = localeArgIdx >= 0 ? process.argv[localeArgIdx + 1] : 'en';

const OUT_PATH = targetLocale !== 'en'
  ? resolve(process.cwd(), `lib/transitInterpretations.${targetLocale}.json`)
  : resolve(process.cwd(), 'lib/transitInterpretations.json');

// ── Combination definitions ────────────────────────────────────────────────

const OUTER_PLANETS = ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
const INNER_PLANETS = ['Sun', 'Mercury', 'Venus', 'Mars'];
const NATAL_OUTER_TARGETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'];
const ALL_NATAL = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
const OUTER_ASPECTS = ['conjunct', 'sextile', 'square', 'trine', 'opposition'];
const INNER_ASPECTS = ['conjunct', 'opposition'];
const INGRESS_PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const RETROGRADE_PLANETS = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
const LUNAR_PHASES = ['New Moon', 'First Quarter', 'Full Moon', 'Last Quarter'];
const MOON_INGRESS_PHASES = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];

function buildAllKeys(): string[] {
  const keys: string[] = [];

  // Outer transits: 5 × 5 × 5 = 125
  for (const planet of OUTER_PLANETS)
    for (const aspect of OUTER_ASPECTS)
      for (const natal of NATAL_OUTER_TARGETS)
        keys.push(`${planet}|${aspect}|${natal}`);

  // Inner transits: 4 × 2 × 10 = 80
  for (const planet of INNER_PLANETS)
    for (const aspect of INNER_ASPECTS)
      for (const natal of ALL_NATAL)
        keys.push(`${planet}|${aspect}|${natal}`);

  // Ingresses: 7 × 12 = 84
  for (const planet of INGRESS_PLANETS)
    for (const sign of SIGNS)
      keys.push(`${planet}|ingress|${sign}`);

  // Moon ingress × phase: 12 × 8 = 96
  for (const sign of SIGNS)
    for (const phase of MOON_INGRESS_PHASES)
      keys.push(`Moon|ingress|${sign}|${phase}`);

  // Retrograde/direct: 5 × 2 = 10
  for (const planet of RETROGRADE_PLANETS) {
    keys.push(`${planet}|retrograde`);
    keys.push(`${planet}|direct`);
  }

  // Lunar: 4
  for (const phase of LUNAR_PHASES)
    keys.push(phase);

  // Eclipses: 6
  keys.push('Solar Eclipse|total', 'Solar Eclipse|annular', 'Solar Eclipse|partial');
  keys.push('Lunar Eclipse|total', 'Lunar Eclipse|partial', 'Lunar Eclipse|penumbral');

  return keys;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

// ── Generation ─────────────────────────────────────────────────────────────

const LOCALE_INSTRUCTIONS: Record<string, string> = {
  'pt-BR': 'Write all interpretations in Brazilian Portuguese (pt-BR). Do not translate from English — write them natively as an astrologer would speak to a Brazilian audience. Keep technical terms like planet and sign names in Portuguese where conventional (e.g. Saturno, Áries, Mercúrio).',
};

const BASE_SYSTEM_PROMPT = `You are writing concise astrological transit interpretations for a personal calendar app called cicatriz.digital.

Guidelines:
- Write exactly 2–3 sentences per entry. No more, no less.
- Be warm, grounded, and practical — not vague or overly mystical.
- Use "you" and second person throughout.
- Do NOT use the word "energy."
- Avoid clichés like "the universe is telling you" or "the stars align."
- For transit keys ("Planet|aspect|natalPlanet"): describe what this transit typically brings for a person with that natal placement.
- For ingress keys ("Planet|ingress|Sign"): describe the general atmosphere while this planet is in that sign.
- For Moon ingress+phase keys ("Moon|ingress|Sign|Phase"): describe what it feels like when the Moon moves into that sign specifically during that lunar phase. The phase shapes the quality — initiating (New), building (Waxing Crescent, First Quarter, Waxing Gibbous), peak/release (Full), releasing/integrating (Waning Gibbous, Last Quarter, Waning Crescent). Be specific about how the phase modifies the sign's expression.
- For retrograde/direct keys ("Planet|retrograde" or "Planet|direct"): describe the station event and what to expect.
- For lunar keys ("New Moon", "Full Moon", etc.): describe the general quality of that phase.
- For eclipse keys ("Solar Eclipse|total", "Lunar Eclipse|partial", etc.): describe the felt quality of that specific eclipse type — what it tends to bring up, how total vs partial vs annular/penumbral differs in intensity.

Return ONLY a valid JSON object where each provided key maps to its interpretation string. No markdown, no explanation, no surrounding text — just the raw JSON object.`;

const localeInstruction = LOCALE_INSTRUCTIONS[targetLocale];
const SYSTEM_PROMPT = localeInstruction
  ? `${BASE_SYSTEM_PROMPT}\n\n${localeInstruction}`
  : BASE_SYSTEM_PROMPT;

async function generateBatch(client: Anthropic, keys: string[]): Promise<Record<string, string>> {
  const localeNote = localeInstruction ? `\n\nRemember: ${localeInstruction}` : '';
  const prompt = `Keys to interpret:\n${JSON.stringify(keys, null, 2)}${localeNote}`;

  const message = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : '';

  // Strip markdown code fences if present
  const cleaned = raw.startsWith('```') ? raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim() : raw;

  try {
    return JSON.parse(cleaned) as Record<string, string>;
  } catch {
    console.error('Failed to parse batch response. Raw output:');
    console.error(raw);
    throw new Error('JSON parse failure — see raw output above');
  }
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY is not set.');
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });

  const allKeys = buildAllKeys();
  console.log(`Total keys to generate: ${allKeys.length}`);

  // Load existing if present (idempotent merge)
  const existing: Record<string, string> = existsSync(OUT_PATH)
    ? (JSON.parse(readFileSync(OUT_PATH, 'utf-8')) as Record<string, string>)
    : {};

  const missingKeys = allKeys.filter(k => !(k in existing));
  if (missingKeys.length === 0) {
    console.log('All entries already present. Nothing to generate.');
    return;
  }
  console.log(`Generating ${missingKeys.length} missing entries (${allKeys.length - missingKeys.length} already cached)...`);

  const batches = chunk(missingKeys, 50);
  const merged: Record<string, string> = { ...existing };

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`Batch ${i + 1}/${batches.length} (${batch.length} keys)...`);
    const result = await generateBatch(client, batch);
    const returned = Object.keys(result).length;
    if (returned !== batch.length) {
      console.warn(`  Warning: expected ${batch.length} entries, got ${returned}`);
    }
    Object.assign(merged, result);
    console.log(`  Done. Running total: ${Object.keys(merged).length} entries.`);
  }

  const finalCount = Object.keys(merged).length;
  console.log(`\nGenerated ${finalCount} total entries (expected ${allKeys.length})`);
  if (finalCount < allKeys.length) {
    console.warn(`Warning: ${allKeys.length - finalCount} keys are missing from output — re-run to fill gaps.`);
  }

  writeFileSync(OUT_PATH, JSON.stringify(merged, null, 2) + '\n', 'utf-8');
  console.log(`Written to ${OUT_PATH}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
