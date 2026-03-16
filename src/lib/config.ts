import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';

export interface Config {
  provider?: 'anthropic' | 'openai' | 'ollama';
  style?: 'conventional' | 'simple';
  language?: string;
  emoji?: boolean;
  autoCommit?: boolean;
  ollamaModel?: string;
  ollamaHost?: string;
}

const CONFIG_DIR = join(homedir(), '.config', 'ai-commit');
const CONFIG_PATH = join(CONFIG_DIR, 'config.json');

export function loadConfig(): Config {
  if (!existsSync(CONFIG_PATH)) return {};
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

export function saveConfig(config: Config): void {
  mkdirSync(dirname(CONFIG_PATH), { recursive: true });
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

export function getConfigPath(): string {
  return CONFIG_PATH;
}
