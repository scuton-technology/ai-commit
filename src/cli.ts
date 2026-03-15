#!/usr/bin/env node

import { Command } from 'commander';
import { generateCommitMessage } from './core/generate.js';
import { gitCommit, openEditor } from './core/commit.js';
import { isGitRepo, getStagedFiles, getRepoName } from './lib/git.js';
import { loadConfig, saveConfig } from './lib/config.js';
import { addToHistory, getHistory, toggleFavorite, clearHistory, getById } from './lib/history.js';
import { Spinner, box, prompt, red, green, yellow, cyan, bold, gray, dim } from './lib/ui.js';

const program = new Command();

program
  .name('aic')
  .description('AI-powered git commit message generator')
  .version('1.0.0')
  .option('-p, --provider <name>', 'AI provider: anthropic or openai')
  .option('-s, --style <type>', 'Commit style: conventional or simple', 'conventional')
  .option('-l, --language <lang>', 'Message language (en, tr, etc.)', 'en')
  .option('-e, --emoji', 'Include emoji in commit message')
  .option('-y, --yes', 'Auto-commit without confirmation')
  .option('-n, --dry-run', 'Generate message but don\'t commit')
  .option('-r, --regenerate', 'Keep regenerating until satisfied')
  .action(async (options) => {
    if (!isGitRepo()) {
      console.error(red('\n  ✖ Not a git repository\n'));
      process.exit(1);
    }

    const stagedFiles = getStagedFiles();
    if (stagedFiles.length === 0) {
      console.error(yellow('\n  ⚠ No staged changes. Stage your changes first:\n'));
      console.error(gray('    git add .\n'));
      console.error(gray('    git add <file>\n'));
      process.exit(1);
    }

    const config = loadConfig();
    const mergedOptions = {
      provider: options.provider || config.provider,
      style: options.style || config.style || 'conventional',
      language: options.language || config.language || 'en',
      emoji: options.emoji || config.emoji || false,
    };

    console.log('');
    console.log(cyan(`  🔍 Analyzing ${stagedFiles.length} changed file${stagedFiles.length > 1 ? 's' : ''}...`));

    let accepted = false;

    while (!accepted) {
      const spinner = new Spinner();
      spinner.start('Generating commit message...');

      try {
        const { message, provider } = await generateCommitMessage(mergedOptions);
        spinner.stop();

        console.log('');
        console.log(gray(`  Provider: ${provider}`));
        console.log('');
        console.log('  Suggested commit message:');
        console.log(box(message).split('\n').map(l => '  ' + l).join('\n'));
        console.log('');

        if (options.dryRun) {
          console.log(dim('  Dry run — message not committed.\n'));
          process.exit(0);
        }

        if (options.yes) {
          const repo = getRepoName();
          addToHistory(message, provider, mergedOptions.style, mergedOptions.language, repo);
          gitCommit(message);
          console.log(green('  ✓ Committed!\n'));
          accepted = true;
        } else {
          const answer = await prompt(`  ${bold('Use this message?')} ${gray('(Y/n/e)')} `);

          if (answer === '' || answer === 'y' || answer === 'yes') {
            const repo = getRepoName();
            addToHistory(message, provider, mergedOptions.style, mergedOptions.language, repo);
            gitCommit(message);
            console.log(green('\n  ✓ Committed!\n'));
            accepted = true;
          } else if (answer === 'e' || answer === 'edit') {
            const edited = openEditor(message);
            if (edited) {
              const repo = getRepoName();
              addToHistory(edited, provider, mergedOptions.style, mergedOptions.language, repo);
              gitCommit(edited);
              console.log(green('\n  ✓ Committed with edited message!\n'));
            } else {
              console.log(yellow('\n  ⚠ Empty message — commit aborted.\n'));
            }
            accepted = true;
          } else if (answer === 'n' || answer === 'no') {
            console.log(yellow('\n  ↻ Regenerating...\n'));
          } else if (answer === 'q' || answer === 'quit') {
            console.log(dim('\n  Aborted.\n'));
            process.exit(0);
          } else {
            console.log(yellow('\n  ↻ Regenerating...\n'));
          }
        }
      } catch (err: any) {
        spinner.stop();
        console.error(red(`\n  ✖ ${err.message}\n`));
        process.exit(1);
      }
    }
  });

// Config command
program
  .command('config')
  .description('Set default configuration')
  .option('-p, --provider <name>', 'Default AI provider')
  .option('-s, --style <type>', 'Default commit style')
  .option('-l, --language <lang>', 'Default language')
  .option('-e, --emoji', 'Enable emoji by default')
  .option('--show', 'Show current config')
  .action((options) => {
    if (options.show) {
      const config = loadConfig();
      console.log('\n  Current config (~/.ai-commit.json):\n');
      console.log(gray('  ' + JSON.stringify(config, null, 2).split('\n').join('\n  ')));
      console.log('');
      return;
    }

    const config = loadConfig();
    if (options.provider) config.provider = options.provider;
    if (options.style) config.style = options.style;
    if (options.language) config.language = options.language;
    if (options.emoji) config.emoji = true;
    saveConfig(config);
    console.log(green('\n  ✓ Config saved to ~/.ai-commit.json\n'));
  });

// History command
program
  .command('history')
  .description('View commit message history')
  .option('-l, --limit <number>', 'Number of entries to show', '10')
  .option('-f, --favorites', 'Show only favorites')
  .option('--clear', 'Clear history (keeps favorites)')
  .option('--clear-all', 'Clear all history including favorites')
  .option('--favorite <id>', 'Toggle favorite status for an entry')
  .option('--use <id>', 'Use a message from history')
  .action((options) => {
    if (options.clearAll) {
      clearHistory(false);
      console.log(green('\n  ✓ All history cleared\n'));
      return;
    }

    if (options.clear) {
      clearHistory(true);
      console.log(green('\n  ✓ History cleared (favorites kept)\n'));
      return;
    }

    if (options.favorite) {
      const isFavorite = toggleFavorite(options.favorite);
      console.log(green(`\n  ✓ ${isFavorite ? 'Added to' : 'Removed from'} favorites\n`));
      return;
    }

    if (options.use) {
      const entry = getById(options.use);
      if (!entry) {
        console.error(red('\n  ✖ Entry not found\n'));
        process.exit(1);
      }
      if (!isGitRepo()) {
        console.error(red('\n  ✖ Not a git repository\n'));
        process.exit(1);
      }
      const stagedFiles = getStagedFiles();
      if (stagedFiles.length === 0) {
        console.error(yellow('\n  ⚠ No staged changes\n'));
        process.exit(1);
      }
      gitCommit(entry.message);
      console.log(green('\n  ✓ Committed with message from history!\n'));
      return;
    }

    const limit = parseInt(options.limit);
    const entries = getHistory(limit, options.favorites);

    if (entries.length === 0) {
      console.log(gray('\n  No history entries\n'));
      return;
    }

    console.log('');
    console.log(bold(`  Commit Message History ${options.favorites ? '(Favorites)' : ''}`));
    console.log(gray(`  ~/.ai-commit-history.json`));
    console.log('');

    entries.forEach((entry, index) => {
      const date = new Date(entry.timestamp).toLocaleString();
      const star = entry.favorite ? yellow('★') : gray('☆');
      console.log(`  ${star} ${cyan(entry.id.substring(0, 8))} ${dim(date)}`);
      if (entry.repo) console.log(gray(`    Repo: ${entry.repo}`));
      console.log(gray(`    Provider: ${entry.provider} | Style: ${entry.style} | Lang: ${entry.language}`));
      console.log(`    ${entry.message.split('\n')[0]}`);
      if (entry.message.split('\n').length > 1) {
        console.log(dim(`    ... (${entry.message.split('\n').length} lines)`));
      }
      console.log('');
    });

    console.log(dim(`  Use: aic history --use <id>`));
    console.log(dim(`  Favorite: aic history --favorite <id>`));
    console.log('');
  });

// Hook command
program
  .command('hook')
  .description('Install as prepare-commit-msg git hook')
  .option('--remove', 'Remove the hook')
  .action((options) => {
    const { writeFileSync, unlinkSync, existsSync, chmodSync, mkdirSync } = require('fs');
    const hookPath = '.git/hooks/prepare-commit-msg';

    if (options.remove) {
      if (existsSync(hookPath)) {
        unlinkSync(hookPath);
        console.log(green('\n  ✓ Hook removed\n'));
      } else {
        console.log(gray('\n  No hook installed\n'));
      }
      return;
    }

    mkdirSync('.git/hooks', { recursive: true });
    const hookScript = `#!/bin/sh
# ai-commit hook — auto-generate commit message
# Remove with: aic hook --remove

COMMIT_MSG_FILE=$1
COMMIT_SOURCE=$2

# Only run for regular commits (not merge, squash, etc.)
if [ -z "$COMMIT_SOURCE" ]; then
  MSG=$(npx @scuton/ai-commit --yes --dry-run 2>/dev/null | grep -A 100 "Suggested" | tail -n +2 | head -20)
  if [ -n "$MSG" ]; then
    echo "$MSG" > "$COMMIT_MSG_FILE"
  fi
fi
`;
    writeFileSync(hookPath, hookScript, 'utf-8');
    chmodSync(hookPath, '755');
    console.log(green('\n  ✓ Hook installed at .git/hooks/prepare-commit-msg'));
    console.log(gray('  Every git commit will auto-generate a message.\n'));
    console.log(dim('  Remove with: aic hook --remove\n'));
  });

program.parse();
