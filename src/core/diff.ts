import { getStagedDiff, getStagedFiles, getStagedStats } from '../lib/git.js';

export interface DiffAnalysis {
  diff: string;
  files: string[];
  stats: { files: number; insertions: number; deletions: number };
  truncated: boolean;
  summary: string;
}

const MAX_DIFF_LENGTH = 8000;

export function analyzeDiff(): DiffAnalysis {
  const diff = getStagedDiff();
  const files = getStagedFiles();
  const stats = getStagedStats();

  let truncated = false;
  let processedDiff = diff;

  if (diff.length > MAX_DIFF_LENGTH) {
    processedDiff = diff.slice(0, MAX_DIFF_LENGTH) + '\n... (diff truncated)';
    truncated = true;
  }

  processedDiff = filterLockFiles(processedDiff);

  const summary = buildSummary(files, stats);

  return { diff: processedDiff, files, stats, truncated, summary };
}

function filterLockFiles(diff: string): string {
  const lockPatterns = [
    /diff --git a\/package-lock\.json.*?(?=diff --git|$)/gs,
    /diff --git a\/yarn\.lock.*?(?=diff --git|$)/gs,
    /diff --git a\/pnpm-lock\.yaml.*?(?=diff --git|$)/gs,
  ];
  let filtered = diff;
  for (const pattern of lockPatterns) {
    filtered = filtered.replace(pattern, '');
  }
  return filtered.trim();
}

function buildSummary(files: string[], stats: { files: number; insertions: number; deletions: number }): string {
  return `${stats.files} file(s) changed: +${stats.insertions} -${stats.deletions}\nFiles: ${files.join(', ')}`;
}
