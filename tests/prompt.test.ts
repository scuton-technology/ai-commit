import { describe, it, expect, vi } from 'vitest';

vi.mock('../src/lib/git.js', () => ({
  getRecentCommits: vi.fn(() => ['abc1234 feat: add login', 'def5678 fix: typo']),
}));

import { buildPrompt } from '../src/core/prompt.js';
import type { DiffAnalysis } from '../src/core/diff.js';

const mockAnalysis: DiffAnalysis = {
  diff: 'diff --git a/src/auth.ts\n+export function login() {}',
  files: ['src/auth.ts', 'src/middleware.ts'],
  stats: { files: 2, insertions: 15, deletions: 3 },
  truncated: false,
  summary: '2 file(s) changed: +15 -3\nFiles: src/auth.ts, src/middleware.ts',
};

describe('buildPrompt', () => {
  it('should include conventional commit format by default', () => {
    const result = buildPrompt(mockAnalysis);
    expect(result).toContain('Conventional Commits');
  });

  it('should include simple format when specified', () => {
    const result = buildPrompt(mockAnalysis, { style: 'simple' });
    expect(result).toContain('Simple (short description)');
  });

  it('should include emoji instruction when enabled', () => {
    const result = buildPrompt(mockAnalysis, { emoji: true });
    expect(result).toContain('Include a relevant emoji');
  });

  it('should exclude emoji by default', () => {
    const result = buildPrompt(mockAnalysis);
    expect(result).toContain('No emojis');
  });

  it('should include language setting', () => {
    const result = buildPrompt(mockAnalysis, { language: 'tr' });
    expect(result).toContain('Language: tr');
  });

  it('should include recent commits', () => {
    const result = buildPrompt(mockAnalysis);
    expect(result).toContain('feat: add login');
    expect(result).toContain('fix: typo');
  });

  it('should include file list', () => {
    const result = buildPrompt(mockAnalysis);
    expect(result).toContain('src/auth.ts');
    expect(result).toContain('src/middleware.ts');
  });

  it('should include diff content', () => {
    const result = buildPrompt(mockAnalysis);
    expect(result).toContain('export function login()');
  });

  it('should include stats summary', () => {
    const result = buildPrompt(mockAnalysis);
    expect(result).toContain('+15 -3');
  });
});
