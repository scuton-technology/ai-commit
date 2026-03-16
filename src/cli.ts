#!/usr/bin/env node

import { Command } from 'commander';
import { generateCommitMessages, generateCommitMessage } from './core/generate.js';
import { gitCommit, openEditor } from './core/commit.js';
import { isGitRepo, getStagedFiles } from './lib/git.js';
import { loadConfig, saveConfig, getConfigPath } from './lib/config.js';
import { Spinner, selectCommitMessage, red, green, yellow, cyan, gray, dim } from './lib/ui.js';

const program = new Command();

program
  .name('aic')
  .description('AI-powered git commit message generator')
  .version('1.0.0')
  .option('-p, --provider <name>', 'AI provider: anthropic, openai, or ollama')
  .option('-s, --style <type>', 'Commit style: conventional or simple', 'conventional')
  .option('-l, --language <lang>', 'Message language (en, tr, etc.)', 'en')
  .option('-e, --emoji', 'Include emoji in commit message')
  .option('-y, --yes', 'Auto-commit best suggestion without selection')
  .option('-n, --dry-run', 'Generate messages but don\'t commit')
  .option('-c, --count <number>', 'Number of suggestions (1-5)', '3')
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
    const count = Math.min(5, Math.max(1, parseInt(options.count) || 3));
    const mergedOptions = {
      provider: options.provider || config.provider,
      style: options.style || config.style || 'conventional',
      language: options.language || config.language || 'en',
      emoji: options.emoji || config.emoji || false,
      count,
    };

    console.log('');
    console.log(cyan(`  🔍 Analyzing ${stagedFiles.length} changed file${stagedFiles.length > 1 ? 's' : ''}...`));

    let accepted = false;

    while (!accepted) {
      const spinner = new Spinner();
      spinner.start('Generating commit suggestions...');

      try {
        // Auto-commit mode: single message, no selection
        if (options.yes) {
          const { message, provider } = await generateCommitMessage(mergedOptions);
          spinner.stop();
          console.log('');
          console.log(gray(`  Provider: ${provider}`));
          console.log('');

          if (options.dryRun) {
            console.log(`  ${message}\n`);
            console.log(dim('  Dry run — message not committed.\n'));
            process.exit(0);
          }

          gitCommit(message);
          console.log(green(`  ✓ Committed: ${message.split('\n')[0]}\n`));
          accepted = true;
          continue;
        }

        // Interactive mode: multiple suggestions with inquirer selection
        const { messages, provider } = await generateCommitMessages(mergedOptions);
        spinner.stop();

        console.log('');
        console.log(gray(`  Provider: ${provider} · ${messages.length} suggestion${messages.length > 1 ? 's' : ''}`));
        console.log('');

        if (options.dryRun) {
          messages.forEach((msg, i) => {
            console.log(`  ${i + 1}. ${msg}`);
          });
          console.log('');
          console.log(dim('  Dry run — message not committed.\n'));
          process.exit(0);
        }

        const result = await selectCommitMessage(messages);

        switch (result.action) {
          case 'commit':
            gitCommit(result.message);
            console.log(green(`\n  ✓ Committed: ${result.message.split('\n')[0]}\n`));
            accepted = true;
            break;

          case 'edit': {
            const edited = openEditor(result.message);
            if (edited) {
              gitCommit(edited);
              console.log(green('\n  ✓ Committed with edited message!\n'));
            } else {
              console.log(yellow('\n  ⚠ Empty message — commit aborted.\n'));
            }
            accepted = true;
            break;
          }

          case 'regenerate':
            console.log(yellow('\n  ↻ Regenerating...\n'));
            break;

          case 'abort':
            console.log(dim('\n  Aborted.\n'));
            process.exit(0);
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
  .option('-p, --provider <name>', 'Default AI provider (anthropic, openai, ollama)')
  .option('-s, --style <type>', 'Default commit style')
  .option('-l, --language <lang>', 'Default language')
  .option('-e, --emoji', 'Enable emoji by default')
  .option('--ollama-model <model>', 'Default Ollama model')
  .option('--ollama-host <url>', 'Ollama server URL')
  .option('--show', 'Show current config')
  .action((options) => {
    if (options.show) {
      const config = loadConfig();
      console.log(`\n  Current config (${getConfigPath()}):\n`);
      console.log(gray('  ' + JSON.stringify(config, null, 2).split('\n').join('\n  ')));
      console.log('');
      return;
    }

    const config = loadConfig();
    if (options.provider) config.provider = options.provider;
    if (options.style) config.style = options.style;
    if (options.language) config.language = options.language;
    if (options.emoji) config.emoji = true;
    if (options.ollamaModel) config.ollamaModel = options.ollamaModel;
    if (options.ollamaHost) config.ollamaHost = options.ollamaHost;
    saveConfig(config);
    console.log(green(`\n  ✓ Config saved to ${getConfigPath()}\n`));
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
