export const BASE_URL = 'https://arjitnigam.github.io/myDreams/';
export const DREAM_TYPES = ['Good', 'Bad'];
export const EXPECTED_DIARY_ROWS = 10;

// SPECIFICATION VALUES (assignment requirements) - independent source of truth
// HARDCODED INTENTIONALLY - these are the explicit assignment requirements
export const SPEC_COUNTS = { good: 6, bad: 4, total: 10, recurring: 2 };
export const SPEC_RECURRING_NAMES = ['Flying over mountains', 'Lost in maze'].sort();
export const RECURRING_RULE = 'count > 1'; // verified: same name appears >1 in diary

// AI validation (Ollama - open source local LLM)
export const OLLAMA = {
  url: process.env.OLLAMA_URL || 'http://localhost:11434',
  model: process.env.OLLAMA_MODEL || 'llama3.2:3b',
};