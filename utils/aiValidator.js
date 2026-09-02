// Ollama local LLM validator — no API key required
require('dotenv').config();

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b';

/**
 * Classify dream names as Good or Bad using Ollama.
 * @param {string[]} names - array of 10 dream names (duplicates allowed)
 * @returns {Promise<Array<{dream: string, type: string}>>}
 */
async function classifyDreams(names) {
  if (!Array.isArray(names) || names.length === 0) {
    throw new Error('classifyDreams: names must be a non-empty array');
  }

  const prompt = `Classify each dream as Good or Bad based on whether the dream experience is pleasant/positive (Good) or unpleasant/negative (Bad).\nDreams: ${names.map((n) => `"${n}"`).join(', ')}\nReturn JSON: {"results": [{"dream":"<exact dream name>","type":"Good|Bad"}, ...]} — one entry per input dream in same order, type must be exactly Good or Bad.`;

  const body = JSON.stringify({
    model: OLLAMA_MODEL,
    messages: [{ role: 'user', content: prompt }],
    format: 'json',
    stream: false,
    options: { temperature: 0 },
  });

  let res;
  try {
    res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
  } catch (e) {
    throw new Error(`Ollama fetch failed at ${OLLAMA_URL}: ${e.message}. Is Ollama running? (ollama serve)`);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Ollama API error ${res.status}: ${text.slice(0, 500)}`);
  }

  const data = await res.json();
  const content = data?.message?.content;
  if (!content) throw new Error(`Ollama response missing message.content: ${JSON.stringify(data).slice(0, 500)}`);

  // Parse JSON — Ollama with format:json returns strict JSON, but be defensive
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    // try to extract JSON object from markdown fences
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`Ollama returned non-JSON: ${content.slice(0, 500)}`);
    parsed = JSON.parse(match[0]);
  }

  if (!parsed || !Array.isArray(parsed.results)) {
    throw new Error(`Ollama response missing results array: ${content.slice(0, 500)}`);
  }

  if (parsed.results.length !== names.length) {
    throw new Error(`Ollama returned ${parsed.results.length} results, expected ${names.length}: ${content.slice(0, 500)}`);
  }

  const seen = new Set();
  for (const entry of parsed.results) {
    if (!entry || typeof entry.dream !== 'string' || typeof entry.type !== 'string') {
      throw new Error(`Invalid entry shape: ${JSON.stringify(entry)}`);
    }
    const type = entry.type.trim();
    if (type !== 'Good' && type !== 'Bad') {
      throw new Error(`Invalid type "${entry.type}" for dream "${entry.dream}" — must be Good or Bad`);
    }
    entry.type = type;
    entry.dream = entry.dream.trim();
    const norm = entry.dream.toLowerCase();
    // allow duplicate dream names in input; duplicates should map to same type
    // but Ollama should return one entry per input occurrence (position match)
  }

  // Validate no missing/extra dream names (by normalized name + count)
  // For duplicate inputs we check multiset equality by sorting normalized names
  const inputNorm = names.map((n) => n.trim().toLowerCase()).sort();
  const outputNorm = parsed.results.map((r) => r.dream.trim().toLowerCase()).sort();
  if (JSON.stringify(inputNorm) !== JSON.stringify(outputNorm)) {
    throw new Error(`Ollama dream names mismatch.\nInput:  ${JSON.stringify(names)}\nOutput: ${JSON.stringify(parsed.results.map((r) => r.dream))}`);
  }

  return parsed.results;
}

/**
 * Check if Ollama is reachable.
 * @returns {Promise<boolean>}
 */
async function isOllamaAvailable() {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { signal: controller.signal });
    clearTimeout(t);
    return res.ok;
  } catch {
    return false;
  }
}

module.exports = { classifyDreams, isOllamaAvailable, OLLAMA_URL, OLLAMA_MODEL };
