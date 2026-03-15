import { execSync } from 'child_process';

export function isGitRepo(): boolean {
  try {
    execSync('git rev-parse --is-inside-work-tree', { encoding: 'utf-8', stdio: 'pipe' });
    return true;
  } catch { return false; }
}

export function getStagedDiff(): string {
  return execSync('git diff --cached --no-color', { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
}

export function getUnstagedDiff(): string {
  return execSync('git diff --no-color', { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
}

export function getStagedFiles(): string[] {
  const output = execSync('git diff --cached --name-only', { encoding: 'utf-8' });
  return output.trim().split('\n').filter(Boolean);
}

export function getStagedStats(): { files: number; insertions: number; deletions: number } {
  const output = execSync('git diff --cached --stat', { encoding: 'utf-8' });
  const match = output.match(/(\d+) files? changed(?:, (\d+) insertions?)?(?:, (\d+) deletions?)?/);
  return {
    files: parseInt(match?.[1] || '0'),
    insertions: parseInt(match?.[2] || '0'),
    deletions: parseInt(match?.[3] || '0'),
  };
}

export function commit(message: string): void {
  execSync(`git commit -m ${JSON.stringify(message)}`, { encoding: 'utf-8', stdio: 'inherit' });
}

export function getRecentCommits(count: number = 5): string[] {
  try {
    const output = execSync(`git log --oneline -${count}`, { encoding: 'utf-8', stdio: 'pipe' });
    return output.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}
