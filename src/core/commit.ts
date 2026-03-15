import { execSync } from 'child_process';
import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

export function gitCommit(message: string): void {
  execSync(`git commit -m ${JSON.stringify(message)}`, {
    encoding: 'utf-8',
    stdio: 'inherit',
  });
}

export function openEditor(initialMessage: string): string {
  const tmpFile = join(tmpdir(), '.ai-commit-msg');
  writeFileSync(tmpFile, initialMessage, 'utf-8');

  const editor = process.env.EDITOR || process.env.VISUAL || 'vi';
  execSync(`${editor} ${tmpFile}`, { stdio: 'inherit' });

  const edited = readFileSync(tmpFile, 'utf-8').trim();
  unlinkSync(tmpFile);

  return edited;
}
