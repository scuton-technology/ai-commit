import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export interface Config {
  provider?: 'anthropic' | 'openai';
  style?: 'conventional' | 'simple';
  language?: string;
  emoji?: boolean;
  autoCommit?: boolean;
}

const CONFIG_PATH = join(homedir(), '.ai-commit.json');

export function loadConfig(): Config {
  if (!existsSync(CONFIG_PATH)) return {};
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

export function saveConfig(config: Config): void {
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}
