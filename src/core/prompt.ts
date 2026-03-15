import type { DiffAnalysis } from './diff.js';
import { getRecentCommits } from '../lib/git.js';

export function buildPrompt(analysis: DiffAnalysis, options?: { style?: string; language?: string; emoji?: boolean }): string {
  const recentCommits = getRecentCommits(5);
  const style = options?.style || 'conventional';
  const language = options?.language || 'en';
  const emoji = options?.emoji ?? false;

  return `You are a git commit message generator. Analyze the diff and generate a professional commit message.

RULES:
- Format: ${style === 'conventional' ? 'Conventional Commits (type(scope): description)' : 'Simple (short description)'}
- Language: ${language === 'en' ? 'English' : language}
- First line: max 72 characters, imperative mood ("add" not "added")
- ${emoji ? 'Include a relevant emoji at the start of the description' : 'No emojis'}
- If multiple changes, add bullet points in the body
- Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore
- Scope: infer from file paths (e.g., auth, api, ui, config)
- Do NOT include the diff in the message
- Do NOT explain what a commit message is
- Output ONLY the commit message, nothing else

RECENT COMMITS (for style reference):
${recentCommits.map(c => `  ${c}`).join('\n')}

CHANGED FILES:
${analysis.files.join('\n')}

STATS:
${analysis.summary}

DIFF:
${analysis.diff}

Generate the commit message:`;
}
