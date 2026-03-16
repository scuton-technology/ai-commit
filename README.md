<div align="center">

<br>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/%E2%9C%A8_ai--commit-white?style=for-the-badge&labelColor=000000&color=ffffff">
  <img alt="ai-commit" src="https://img.shields.io/badge/%E2%9C%A8_ai--commit-black?style=for-the-badge&labelColor=ffffff&color=000000">
</picture>

<br><br>

<p><strong>Stop writing <code>"fix stuff"</code>. Let AI write your commits.</strong></p>

<p>
  <a href="https://www.npmjs.com/package/@scuton/ai-commit"><img src="https://img.shields.io/npm/v/@scuton/ai-commit?style=flat-square&color=cb3837&label=npm" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@scuton/ai-commit"><img src="https://img.shields.io/npm/dm/@scuton/ai-commit?style=flat-square&color=gray&label=downloads" alt="downloads"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D18-339933?style=flat-square&logo=node.js&logoColor=white" alt="node"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.6-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="typescript"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-22c55e?style=flat-square" alt="license"></a>
</p>

<br>

<img src="demo.gif" alt="ai-commit demo" width="720">

<br><br>

<p>
  <a href="#-quick-start">Quick Start</a>&nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="#-providers">Providers</a>&nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="#%EF%B8%8F-usage">Usage</a>&nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="#-configuration">Configuration</a>&nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="#-git-hook">Git Hook</a>&nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="#-api">API</a>
</p>

<br>

</div>

---

<br>

**ai-commit** analyzes your staged `git diff` and generates **3 professional commit messages** in [Conventional Commits](https://www.conventionalcommits.org/) format. Pick the best one with arrow keys, edit it, or regenerate — then it commits for you.

<br>

### Why ai-commit?

| | Before | After |
|---|---|---|
| **Your commits** | `fix stuff` `update things` `wip` | `feat(auth): add JWT refresh token rotation` |
| **Time spent** | Thinking about what to write | Zero — just pick one |
| **Consistency** | Random format every time | Conventional Commits, always |

<br>

## Features

<table>
<tr>
<td width="50%">

**3 AI Suggestions**
<br>Get 3 different commit messages with different perspectives. Pick the best one with arrow keys.

</td>
<td width="50%">

**3 Providers**
<br>Claude (Anthropic), GPT (OpenAI), or Ollama (local, free, private). Auto-detects from env vars.

</td>
</tr>
<tr>
<td>

**Conventional Commits**
<br><code>type(scope): description</code> — feat, fix, refactor, docs, test, chore, perf, ci, build, style.

</td>
<td>

**Smart Diff Analysis**
<br>Filters lock files, truncates large diffs (~8KB), infers scope from file paths.

</td>
</tr>
<tr>
<td>

**Interactive UI**
<br>Arrow key selection, inline editing with $EDITOR, regenerate until satisfied, or abort.

</td>
<td>

**Git Hook**
<br>Install as <code>prepare-commit-msg</code> hook — every <code>git commit</code> auto-generates a message.

</td>
</tr>
<tr>
<td>

**Multi-language**
<br>Generate commits in any language: English, Turkish, German, Spanish, Japanese...

</td>
<td>

**Programmatic API**
<br>Use as a library in your Node.js scripts, CI pipelines, or custom tools.

</td>
</tr>
</table>

<br>

## Quick Start

### 1. Install

```sh
# Global install (recommended)
npm install -g @scuton/ai-commit

# Or use directly with npx
npx @scuton/ai-commit
```

> **Aliases:** After install, both `aic` and `ai-commit` commands are available.

### 2. Set up a provider

<details>
<summary><strong>Option A: Claude (Anthropic) — Recommended</strong></summary>
<br>

Best quality commit messages. Uses `claude-sonnet-4-20250514`.

```sh
export ANTHROPIC_API_KEY=sk-ant-api03-...
```

Get your key at [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)

Cost: ~$0.001 per commit

</details>

<details>
<summary><strong>Option B: GPT (OpenAI)</strong></summary>
<br>

Fast and cheap. Uses `gpt-4o-mini`.

```sh
export OPENAI_API_KEY=sk-...
```

Get your key at [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

Cost: ~$0.0005 per commit

</details>

<details open>
<summary><strong>Option C: Ollama — Free & Local</strong></summary>
<br>

Completely free, runs on your machine, no data leaves your network. Uses `llama3.1` by default.

```sh
# 1. Install Ollama: https://ollama.com
# 2. Pull a model
ollama pull llama3.1

# 3. Start the server (if not already running)
ollama serve

# 4. Use it
aic --provider ollama
```

> **Tip:** For best results with Ollama, use `codellama` or `llama3.1`. Configure with `aic config --ollama-model codellama`.

</details>

### 3. Use it

```sh
git add .
aic
```

That's it. You'll see 3 suggestions, pick one, done.

<br>

## Providers

| Provider | Model | Speed | Quality | Cost | Privacy |
|----------|-------|-------|---------|------|---------|
| **Anthropic** | claude-sonnet-4-20250514 | Fast | Best | ~$0.001/commit | Cloud |
| **OpenAI** | gpt-4o-mini | Fastest | Good | ~$0.0005/commit | Cloud |
| **Ollama** | llama3.1 (configurable) | Varies | Good | Free | 100% Local |

**Auto-detection order:** If no `--provider` flag is given, ai-commit checks for API keys in this order:
1. `ANTHROPIC_API_KEY` → uses Anthropic
2. `OPENAI_API_KEY` → uses OpenAI
3. `OLLAMA_HOST` or `OLLAMA_MODEL` env var → uses Ollama

<br>

## Usage

### Basic workflow

```sh
# Stage your changes
git add src/auth.ts src/middleware/jwt.ts

# Generate 3 suggestions and pick one
aic
```

**Output:**
```
  Provider: anthropic · 3 suggestions

  ? Pick a commit message:
  > 1. feat(auth): add JWT refresh token rotation with automatic renewal
    2. refactor(middleware): improve token handling with expiry-based refresh
    3. feat(security): implement session token rotation for enhanced auth
    ~  Regenerate
    ~  Edit manually
    ~  Abort
```

### All options

```sh
# Pick a specific provider
aic --provider anthropic
aic --provider openai
aic --provider ollama

# Generate 5 suggestions instead of default 3
aic --count 5

# Auto-commit the best suggestion (no interactive selection)
aic --yes

# Preview suggestions without committing
aic --dry-run

# Add emoji to commit messages
aic --emoji
# Output: "feat(auth): add JWT refresh token rotation"

# Use simple style (no type/scope prefix)
aic --style simple
# Output: "Add JWT refresh token rotation"

# Generate commits in Turkish
aic --language tr
# Output: "feat(auth): JWT yenileme token rotasyonu ekle"

# Combine flags
aic -p anthropic -c 5 -e -l tr
```

### Interactive actions

When suggestions are shown, you can:

| Action | What it does |
|--------|-------------|
| **Select (Enter)** | Commits with the selected message |
| **Regenerate** | Calls AI again with fresh suggestions |
| **Edit manually** | Opens your `$EDITOR` (vim, nano, code, etc.) to modify the message before committing |
| **Abort** | Exits without committing |

<br>

## Configuration

Config is stored at `~/.config/ai-commit/config.json`. Set defaults so you don't need flags every time.

### Set defaults

```sh
# Set default provider
aic config --provider anthropic

# Set default language
aic config --language tr

# Enable emoji by default
aic config --emoji

# Set default commit style
aic config --style conventional

# Configure Ollama model
aic config --ollama-model codellama

# Configure Ollama server URL (if not localhost)
aic config --ollama-host http://192.168.1.100:11434

# View current config
aic config --show
```

### Config file format

```json
{
  "provider": "anthropic",
  "style": "conventional",
  "language": "en",
  "emoji": false,
  "ollamaModel": "llama3.1",
  "ollamaHost": "http://localhost:11434"
}
```

### Environment variables

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Anthropic API key (enables Claude provider) |
| `OPENAI_API_KEY` | OpenAI API key (enables GPT provider) |
| `OLLAMA_HOST` | Ollama server URL (default: `http://localhost:11434`) |
| `OLLAMA_MODEL` | Ollama model name (default: `llama3.1`) |
| `EDITOR` / `VISUAL` | Editor for "Edit manually" action (default: `vi`) |
| `NO_COLOR` | Disable colored output |

<br>

## Git Hook

Install ai-commit as a `prepare-commit-msg` git hook to auto-generate messages on every `git commit`:

```sh
# Install the hook
aic hook

# Now just use git normally — message is auto-generated
git add .
git commit
# > AI generates the commit message automatically

# Remove the hook when you want
aic hook --remove
```

> **Note:** The hook only runs for regular commits. Merge commits, squash commits, and amends are not affected.

<br>

## Command Reference

| Command | Description |
|---------|-------------|
| `aic` | Generate suggestions and commit interactively |
| `aic --yes` | Auto-commit best suggestion |
| `aic --dry-run` | Preview suggestions without committing |
| `aic config --show` | Display current configuration |
| `aic config [options]` | Set default configuration |
| `aic hook` | Install as git hook |
| `aic hook --remove` | Remove git hook |
| `aic --help` | Show help |
| `aic --version` | Show version |

### Flags

| Flag | Short | Description | Default |
|------|-------|-------------|---------|
| `--provider <name>` | `-p` | AI provider: `anthropic`, `openai`, `ollama` | auto-detect |
| `--count <n>` | `-c` | Number of suggestions (1-5) | `3` |
| `--style <type>` | `-s` | `conventional` or `simple` | `conventional` |
| `--language <lang>` | `-l` | Message language (`en`, `tr`, `de`, etc.) | `en` |
| `--emoji` | `-e` | Include relevant emoji | `false` |
| `--yes` | `-y` | Skip selection, auto-commit | `false` |
| `--dry-run` | `-n` | Don't commit, just show suggestions | `false` |

<br>

## API

Use ai-commit as a library in your Node.js/TypeScript projects:

### Generate multiple suggestions

```ts
import { generateCommitMessages } from '@scuton/ai-commit';

const { messages, provider } = await generateCommitMessages({
  provider: 'anthropic',  // 'anthropic' | 'openai' | 'ollama'
  style: 'conventional',  // 'conventional' | 'simple'
  language: 'en',
  emoji: false,
  count: 3,               // 1-5
});

console.log(messages);
// [
//   "feat(auth): add JWT refresh token rotation",
//   "refactor(auth): improve token handling with automatic refresh",
//   "feat(security): implement session token rotation"
// ]
```

### Generate a single message

```ts
import { generateCommitMessage } from '@scuton/ai-commit';

const { message, provider } = await generateCommitMessage({
  provider: 'openai',
  style: 'conventional',
});

console.log(message);
// "feat(auth): add JWT refresh token rotation"
```

### Analyze diff without generating

```ts
import { analyzeDiff } from '@scuton/ai-commit';

const analysis = analyzeDiff();
console.log(analysis.files);      // ["src/auth.ts", "src/middleware/jwt.ts"]
console.log(analysis.stats);      // { files: 2, insertions: 45, deletions: 12 }
console.log(analysis.truncated);  // false
console.log(analysis.summary);    // "2 file(s) changed: +45 -12"
```

### Build prompt manually

```ts
import { analyzeDiff, buildPrompt } from '@scuton/ai-commit';

const analysis = analyzeDiff();
const prompt = buildPrompt(analysis, {
  style: 'conventional',
  language: 'tr',
  count: 3,
});
// Use with your own LLM client
```

### Manage config

```ts
import { loadConfig, saveConfig } from '@scuton/ai-commit';

const config = loadConfig();
config.provider = 'ollama';
config.ollamaModel = 'codellama';
saveConfig(config);
```

<br>

## Conventional Commits Cheat Sheet

ai-commit generates messages following the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]
```

| Type | When to use |
|------|------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, semicolons, etc. (no code change) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or fixing tests |
| `build` | Build system or dependencies |
| `ci` | CI/CD configuration |
| `chore` | Maintenance tasks |

**Scope** is automatically inferred from changed file paths (e.g., `auth`, `api`, `ui`, `config`).

<br>

## FAQ

<details>
<summary><strong>Which provider should I use?</strong></summary>
<br>

- **Claude (Anthropic):** Best quality, understands code context deeply. Recommended for professional projects.
- **GPT (OpenAI):** Fastest, cheapest. Good enough for simple commits.
- **Ollama:** Free, local, private. Best for privacy-sensitive projects or when you don't want API costs.

</details>

<details>
<summary><strong>Does it send my code to the AI?</strong></summary>
<br>

It sends **only** the staged diff (`git diff --cached`) and file names. Lock files (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`) are automatically filtered out. Large diffs are truncated to ~8000 characters.

With **Ollama**, everything stays on your machine — zero data leaves your network.

</details>

<details>
<summary><strong>Can I use it without an API key?</strong></summary>
<br>

Yes! Use Ollama for completely free, local commit generation:

```sh
ollama pull llama3.1
aic --provider ollama
```

</details>

<details>
<summary><strong>Can I use it in CI/CD?</strong></summary>
<br>

Yes. Use the `--yes` flag for non-interactive mode:

```sh
aic --yes --provider anthropic
```

Or use the programmatic API in your scripts.

</details>

<details>
<summary><strong>What if I don't like any suggestion?</strong></summary>
<br>

You have 3 options:
1. **Regenerate** — get 3 fresh suggestions
2. **Edit manually** — opens your `$EDITOR` with the first suggestion as a starting point
3. **Abort** — exit without committing

</details>

<details>
<summary><strong>How do I add it to my shell permanently?</strong></summary>
<br>

Add your API key to your shell profile:

```sh
# ~/.bashrc or ~/.zshrc
export ANTHROPIC_API_KEY=sk-ant-api03-...
```

Then `aic` will work from any directory.

</details>

<br>

## Requirements

- **Node.js** >= 18
- **Git** (must be inside a git repository)
- One of: Anthropic API key, OpenAI API key, or Ollama running locally

<br>

## Related

- [@scuton/gpulse](https://github.com/scuton-technology/ghx) — GitHub CLI toolkit
- [readme-forge](https://github.com/scuton-technology/readme-forge) — AI README generator

<br>

<div align="center">
  <br>
  <p>
    <sub>Built with care by <a href="https://scuton.com"><strong>Scuton Technology</strong></a></sub>
  </p>
  <p>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-22c55e?style=flat-square" alt="MIT License"></a>
  </p>
  <br>
</div>
