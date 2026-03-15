import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../src/lib/git.js', () => ({
  getStagedDiff: vi.fn(() => 'diff --git a/index.ts\n+code'),
  getStagedFiles: vi.fn(() => ['index.ts']),
  getStagedStats: vi.fn(() => ({ files: 1, insertions: 1, deletions: 0 })),
  getRecentCommits: vi.fn(() => []),
}));

vi.mock('../src/providers/anthropic.js', () => ({
  AnthropicProvider: vi.fn().mockImplementation(() => ({
    name: 'anthropic',
    generate: vi.fn().mockResolvedValue('feat(core): add initial setup'),
  })),
}));

vi.mock('../src/providers/openai.js', () => ({
  OpenAIProvider: vi.fn().mockImplementation(() => ({
    name: 'openai',
    generate: vi.fn().mockResolvedValue('feat(core): add initial setup'),
  })),
}));

import { getProvider, generateCommitMessage } from '../src/core/generate.js';

describe('getProvider', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.OPENAI_API_KEY;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('should auto-detect anthropic when ANTHROPIC_API_KEY is set', () => {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test';
    const provider = getProvider();
    expect(provider.name).toBe('anthropic');
  });

  it('should auto-detect openai when OPENAI_API_KEY is set', () => {
    process.env.OPENAI_API_KEY = 'sk-test';
    const provider = getProvider();
    expect(provider.name).toBe('openai');
  });

  it('should prefer anthropic when both keys are set', () => {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test';
    process.env.OPENAI_API_KEY = 'sk-test';
    const provider = getProvider();
    expect(provider.name).toBe('anthropic');
  });

  it('should throw when no API key is found', () => {
    expect(() => getProvider()).toThrow('No API key found');
  });

  it('should throw for unknown provider', () => {
    expect(() => getProvider('gemini' as any)).toThrow('Unknown provider');
  });

  it('should throw when anthropic key is missing', () => {
    expect(() => getProvider('anthropic')).toThrow('ANTHROPIC_API_KEY');
  });

  it('should throw when openai key is missing', () => {
    expect(() => getProvider('openai')).toThrow('OPENAI_API_KEY');
  });
});

describe('generateCommitMessage', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('should generate a commit message', async () => {
    const result = await generateCommitMessage({ provider: 'anthropic' });
    expect(result.message).toBeTruthy();
    expect(result.provider).toBe('anthropic');
  });

  it('should clean markdown code blocks from message', async () => {
    const { AnthropicProvider } = await import('../src/providers/anthropic.js');
    vi.mocked(AnthropicProvider).mockImplementation(() => ({
      name: 'anthropic',
      generate: vi.fn().mockResolvedValue('```\nfeat: test\n```'),
    }));

    const result = await generateCommitMessage({ provider: 'anthropic' });
    expect(result.message).not.toContain('```');
  });

  it('should clean quotes from message', async () => {
    const { AnthropicProvider } = await import('../src/providers/anthropic.js');
    vi.mocked(AnthropicProvider).mockImplementation(() => ({
      name: 'anthropic',
      generate: vi.fn().mockResolvedValue('"feat: test"'),
    }));

    const result = await generateCommitMessage({ provider: 'anthropic' });
    expect(result.message).not.toMatch(/^"/);
  });
});
