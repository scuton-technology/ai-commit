<div align="center">
  <br>
  <h1>ai-commit</h1>
  <p><strong>AI-powered git commit messages. One command, perfect commits.</strong></p>
  <br>
  <p>
    <a href="https://www.npmjs.com/package/@scuton/ai-commit"><img src="https://img.shields.io/npm/v/@scuton/ai-commit?color=2563eb&label=npm" alt="npm"></a>
    <a href="https://www.npmjs.com/package/@scuton/ai-commit"><img src="https://img.shields.io/npm/dm/@scuton/ai-commit?color=gray&label=downloads" alt="downloads"></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green" alt="license"></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/types-TypeScript-3178c6" alt="typescript"></a>
  </p>
  <br>
  <img src="demo.gif" alt="ai-commit demo" width="800">
  <br><br>
</div>

> Stop writing "fix stuff" and "update things". Let AI analyze your diff and generate meaningful conventional commits.

## Highlights

- Generates **3 commit suggestions** — pick the best one interactively
- Supports **Claude** (Anthropic), **GPT** (OpenAI), and **Ollama** (local, free)
- Interactive selection UI with arrow keys (powered by inquirer.js)
- Auto-detect provider from environment variables
- Emoji support, multiple languages, configurable style
- Install as git hook for fully automatic commits
- Filters lock files and truncates large diffs
- TypeScript, programmatic API available

## Install

```sh
npm install -g @scuton/ai-commit
```

## Setup

Set your API key (one of):

```sh
# Claude (recommended)
export ANTHROPIC_API_KEY=sk-ant-...

# Or OpenAI
export OPENAI_API_KEY=sk-...

# Or use Ollama (local, no API key needed)
# Just make sure Ollama is running: ollama serve
aic --provider ollama
```

## Usage

```sh
# Stage changes and generate commit (3 suggestions)
git add .
aic

# Auto-commit best suggestion without selection
aic --yes

# Preview without committing
aic --dry-run

# Use specific provider
aic --provider openai
aic --provider ollama

# Generate 5 suggestions instead of 3
aic --count 5

# Include emoji
aic --emoji

# Simple style (no conventional commit prefix)
aic --style simple

# Turkish commit messages
aic --language tr
```

## How it works

1. Reads your staged git diff
2. Filters lock files, truncates large diffs
3. Sends diff + file list to AI with commit conventions
4. Generates **3 different suggestions** with different perspectives
5. You pick one with arrow keys, or: **regenerate** / **edit** / **abort**

## Commands

| Command | Description |
|---------|-------------|
| `aic` | Generate and commit (default) |
| `aic config --show` | Show current config |
| `aic config --provider anthropic` | Set default provider |
| `aic config --ollama-model codellama` | Set Ollama model |
| `aic hook` | Install as git hook |
| `aic hook --remove` | Remove git hook |

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `-p, --provider` | AI provider (anthropic/openai/ollama) | auto-detect |
| `-c, --count` | Number of suggestions (1-5) | 3 |
| `-s, --style` | conventional or simple | conventional |
| `-l, --language` | Message language (en, tr, etc.) | en |
| `-e, --emoji` | Include emoji | false |
| `-y, --yes` | Auto-commit, no prompt | false |
| `-n, --dry-run` | Don't commit | false |

## Git Hook

Install as automatic commit message generator:

```sh
aic hook
```

Now every `git commit` will auto-generate a message. Remove with `aic hook --remove`.

## Programmatic API

```ts
import { generateCommitMessages } from '@scuton/ai-commit';

// Get 3 suggestions
const { messages, provider } = await generateCommitMessages({
  provider: 'anthropic',
  style: 'conventional',
  count: 3,
});
console.log(messages);
// [
//   "feat(auth): add JWT refresh token rotation",
//   "refactor(auth): improve token handling with automatic refresh",
//   "feat(security): implement session token rotation"
// ]

// Or get a single message
import { generateCommitMessage } from '@scuton/ai-commit';
const { message } = await generateCommitMessage({ provider: 'openai' });
```

## FAQ

### Which provider should I use?

Claude (Anthropic) generally produces better conventional commit messages. GPT-4o-mini is faster and cheaper for simple commits. Ollama is free and runs locally — great for privacy-sensitive projects.

### Does it send my code to the AI?

It sends the git diff (staged changes only) and file names. Lock files are filtered out. Large diffs are truncated to ~8000 chars. With Ollama, everything stays on your machine.

### Can I use it without an API key?

Yes! Use Ollama for completely free, local commit generation. Just install Ollama and run `aic --provider ollama`.

## Related

- [@scuton/gpulse](https://github.com/scuton-technology/ghx) — GitHub CLI toolkit
- [readme-forge](https://github.com/scuton-technology/readme-forge) — AI README generator

## License

MIT &copy; [Scuton Technology](https://scuton.com)
