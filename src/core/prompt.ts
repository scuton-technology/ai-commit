import type { DiffAnalysis } from './diff.js';
import { getRecentCommits } from '../lib/git.js';

export function buildPrompt(analysis: DiffAnalysis, options?: { style?: string; language?: string; emoji?: boolean; count?: number }): string {
  const recentCommits = getRecentCommits(5);
  const style = options?.style || 'conventional';
  const language = options?.language || 'en';
  const emoji = options?.emoji ?? false;
  const count = options?.count ?? 3;

  return `You are a git commit message generator. Analyze the diff and generate ${count} different commit message suggestion${count > 1 ? 's' : ''}.

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
- Each suggestion should have a different perspective (e.g., focus on different aspects of the change)

OUTPUT FORMAT:
Return ONLY a JSON array of ${count} strings. Example:
["feat(auth): add JWT refresh token rotation", "refactor(auth): improve token handling with automatic refresh", "feat(security): implement refresh token rotation for sessions"]

RECENT COMMITS (for style reference):
${recentCommits.map(c => `  ${c}`).join('\n')}

CHANGED FILES:
${analysis.files.join('\n')}

STATS:
${analysis.summary}

DIFF:
${analysis.diff}

Generate ${count} commit message suggestions as a JSON array:`;
}
