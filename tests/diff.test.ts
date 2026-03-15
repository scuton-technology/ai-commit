import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock git module
vi.mock('../src/lib/git.js', () => ({
  getStagedDiff: vi.fn(),
  getStagedFiles: vi.fn(),
  getStagedStats: vi.fn(),
  getRecentCommits: vi.fn(() => []),
}));

import { analyzeDiff } from '../src/core/diff.js';
import { getStagedDiff, getStagedFiles, getStagedStats } from '../src/lib/git.js';

const mockDiff = vi.mocked(getStagedDiff);
const mockFiles = vi.mocked(getStagedFiles);
const mockStats = vi.mocked(getStagedStats);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('analyzeDiff', () => {
  it('should return correct analysis for staged changes', () => {
    mockDiff.mockReturnValue('diff --git a/src/index.ts b/src/index.ts\n+console.log("hello")');
    mockFiles.mockReturnValue(['src/index.ts']);
    mockStats.mockReturnValue({ files: 1, insertions: 1, deletions: 0 });

    const result = analyzeDiff();

    expect(result.files).toEqual(['src/index.ts']);
    expect(result.stats.files).toBe(1);
    expect(result.stats.insertions).toBe(1);
    expect(result.truncated).toBe(false);
  });

  it('should filter out package-lock.json from diff', () => {
    const diff = 'diff --git a/package-lock.json b/package-lock.json\n+lots of lock stuff\ndiff --git a/src/index.ts b/src/index.ts\n+real code';
    mockDiff.mockReturnValue(diff);
    mockFiles.mockReturnValue(['package-lock.json', 'src/index.ts']);
    mockStats.mockReturnValue({ files: 2, insertions: 10, deletions: 0 });

    const result = analyzeDiff();

    expect(result.diff).not.toContain('package-lock.json');
    expect(result.diff).toContain('src/index.ts');
  });

  it('should filter out yarn.lock from diff', () => {
    const diff = 'diff --git a/yarn.lock b/yarn.lock\n+lock data\ndiff --git a/app.ts b/app.ts\n+code';
    mockDiff.mockReturnValue(diff);
    mockFiles.mockReturnValue(['yarn.lock', 'app.ts']);
    mockStats.mockReturnValue({ files: 2, insertions: 5, deletions: 0 });

    const result = analyzeDiff();

    expect(result.diff).not.toContain('yarn.lock');
  });

  it('should filter out pnpm-lock.yaml from diff', () => {
    const diff = 'diff --git a/pnpm-lock.yaml b/pnpm-lock.yaml\n+lock data\ndiff --git a/app.ts b/app.ts\n+code';
    mockDiff.mockReturnValue(diff);
    mockFiles.mockReturnValue(['pnpm-lock.yaml', 'app.ts']);
    mockStats.mockReturnValue({ files: 2, insertions: 5, deletions: 0 });

    const result = analyzeDiff();

    expect(result.diff).not.toContain('pnpm-lock.yaml');
  });

  it('should truncate large diffs', () => {
    const largeDiff = 'a'.repeat(10000);
    mockDiff.mockReturnValue(largeDiff);
    mockFiles.mockReturnValue(['big-file.ts']);
    mockStats.mockReturnValue({ files: 1, insertions: 500, deletions: 0 });

    const result = analyzeDiff();

    expect(result.truncated).toBe(true);
    expect(result.diff).toContain('(diff truncated)');
    expect(result.diff.length).toBeLessThan(largeDiff.length);
  });

  it('should handle empty diff', () => {
    mockDiff.mockReturnValue('');
    mockFiles.mockReturnValue([]);
    mockStats.mockReturnValue({ files: 0, insertions: 0, deletions: 0 });

    const result = analyzeDiff();

    expect(result.files).toEqual([]);
    expect(result.stats.files).toBe(0);
  });

  it('should build correct summary', () => {
    mockDiff.mockReturnValue('diff content');
    mockFiles.mockReturnValue(['a.ts', 'b.ts']);
    mockStats.mockReturnValue({ files: 2, insertions: 10, deletions: 3 });

    const result = analyzeDiff();

    expect(result.summary).toContain('2 file(s) changed');
    expect(result.summary).toContain('+10');
    expect(result.summary).toContain('-3');
    expect(result.summary).toContain('a.ts, b.ts');
  });
});
