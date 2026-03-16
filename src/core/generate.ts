import type { AIProvider, ProviderName } from '../providers/types.js';
import { AnthropicProvider } from '../providers/anthropic.js';
import { OpenAIProvider } from '../providers/openai.js';
import { OllamaProvider } from '../providers/ollama.js';
import { analyzeDiff } from './diff.js';
import { buildPrompt } from './prompt.js';

export interface GenerateOptions {
  provider?: ProviderName;
  style?: 'conventional' | 'simple';
  language?: string;
  emoji?: boolean;
  count?: number;
}

export function getProvider(name?: ProviderName): AIProvider {
  const providerName = name || detectProvider();

  switch (providerName) {
    case 'anthropic': {
      const key = process.env.ANTHROPIC_API_KEY;
      if (!key) throw new Error('ANTHROPIC_API_KEY environment variable required.\nGet a key at: https://console.anthropic.com/settings/keys');
      return new AnthropicProvider(key);
    }
    case 'openai': {
      const key = process.env.OPENAI_API_KEY;
      if (!key) throw new Error('OPENAI_API_KEY environment variable required.\nGet a key at: https://platform.openai.com/api-keys');
      return new OpenAIProvider(key);
    }
    case 'ollama': {
      return new OllamaProvider();
    }
    default:
      throw new Error(`Unknown provider: ${providerName}. Use 'anthropic', 'openai', or 'ollama'.`);
  }
}

function detectProvider(): ProviderName {
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  if (process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.OLLAMA_HOST || process.env.OLLAMA_MODEL) return 'ollama';
  throw new Error(
    'No API key found. Set one of:\n' +
    '  export ANTHROPIC_API_KEY=sk-ant-...\n' +
    '  export OPENAI_API_KEY=sk-...\n' +
    '  Or use Ollama: aic --provider ollama\n\n' +
    'Or specify provider: aic --provider anthropic'
  );
}

export async function generateCommitMessages(options?: GenerateOptions): Promise<{ messages: string[]; provider: string }> {
  const analysis = analyzeDiff();

  if (analysis.files.length === 0) {
    throw new Error('No staged changes. Run "git add" first.');
  }

  const count = options?.count ?? 3;
  const provider = getProvider(options?.provider);
  const prompt = buildPrompt(analysis, { ...options, count });
  const raw = await provider.generate(prompt);

  const messages = parseMessages(raw, count);

  return { messages, provider: provider.name };
}

/** Backward-compatible single message generation */
export async function generateCommitMessage(options?: GenerateOptions): Promise<{ message: string; provider: string }> {
  const result = await generateCommitMessages({ ...options, count: 1 });
  return { message: result.messages[0], provider: result.provider };
}

function parseMessages(raw: string, expectedCount: number): string[] {
  const cleaned = raw
    .replace(/^```\w*\n?/, '')
    .replace(/\n?```$/, '')
    .trim();

  // Try JSON array parse first
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((m: string) => m.trim()).filter(Boolean).slice(0, expectedCount);
    }
  } catch { /* not JSON */ }

  // Try JSON object with numbered keys
  try {
    // Extract JSON from text that might contain it
    const jsonMatch = cleaned.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed)) {
        return parsed.map((m: string) => m.trim()).filter(Boolean).slice(0, expectedCount);
      }
    }
  } catch { /* not JSON */ }

  // Fallback: split by numbered lines (1. ... 2. ... 3. ...)
  const numbered = cleaned.split(/\n?\d+\.\s+/).filter(Boolean);
  if (numbered.length >= expectedCount) {
    return numbered.slice(0, expectedCount).map(m =>
      m.replace(/^["']|["']$/g, '').trim()
    );
  }

  // Last resort: treat as single message
  const single = cleaned.replace(/^["']|["']$/g, '').trim();
  return [single];
}
