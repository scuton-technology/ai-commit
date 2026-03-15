import type { AIProvider, ProviderName } from '../providers/types.js';
import { AnthropicProvider } from '../providers/anthropic.js';
import { OpenAIProvider } from '../providers/openai.js';
import { analyzeDiff } from './diff.js';
import { buildPrompt } from './prompt.js';

export interface GenerateOptions {
  provider?: ProviderName;
  style?: 'conventional' | 'simple';
  language?: string;
  emoji?: boolean;
  scope?: string;
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
    default:
      throw new Error(`Unknown provider: ${providerName}. Use 'anthropic' or 'openai'.`);
  }
}

function detectProvider(): ProviderName {
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  if (process.env.OPENAI_API_KEY) return 'openai';
  throw new Error(
    'No API key found. Set one of:\n' +
    '  export ANTHROPIC_API_KEY=sk-ant-...\n' +
    '  export OPENAI_API_KEY=sk-...\n\n' +
    'Or specify provider: aic --provider anthropic'
  );
}

export async function generateCommitMessage(options?: GenerateOptions): Promise<{ message: string; provider: string }> {
  const analysis = analyzeDiff();

  if (analysis.files.length === 0) {
    throw new Error('No staged changes. Run "git add" first.');
  }

  const provider = getProvider(options?.provider);
  const prompt = buildPrompt(analysis, options);
  const message = await provider.generate(prompt);

  const cleaned = message
    .replace(/^```\w*\n?/, '')
    .replace(/\n?```$/, '')
    .replace(/^["']|["']$/g, '')
    .trim();

  return { message: cleaned, provider: provider.name };
}
