import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const HISTORY_PATH = join(homedir(), '.ai-commit-history.json');
const MAX_HISTORY = 100;

export interface HistoryEntry {
  id: string;
  message: string;
  timestamp: string;
  provider: string;
  style: string;
  language: string;
  favorite: boolean;
  repo?: string;
}

export interface History {
  entries: HistoryEntry[];
}

export function loadHistory(): History {
  if (!existsSync(HISTORY_PATH)) {
    return { entries: [] };
  }
  try {
    const content = readFileSync(HISTORY_PATH, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { entries: [] };
  }
}

export function saveHistory(history: History): void {
  writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2), 'utf-8');
}

export function addToHistory(
  message: string,
  provider: string,
  style: string,
  language: string,
  repo?: string
): string {
  const history = loadHistory();
  const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
  
  const entry: HistoryEntry = {
    id,
    message,
    timestamp: new Date().toISOString(),
    provider,
    style,
    language,
    favorite: false,
    repo,
  };

  history.entries.unshift(entry);

  // Keep only MAX_HISTORY entries (but preserve favorites)
  const favorites = history.entries.filter(e => e.favorite);
  const nonFavorites = history.entries.filter(e => !e.favorite).slice(0, MAX_HISTORY);
  history.entries = [...favorites, ...nonFavorites];

  saveHistory(history);
  return id;
}

export function toggleFavorite(id: string): boolean {
  const history = loadHistory();
  const entry = history.entries.find(e => e.id === id);
  
  if (!entry) {
    return false;
  }

  entry.favorite = !entry.favorite;
  saveHistory(history);
  return entry.favorite;
}

export function getHistory(limit?: number, favoritesOnly?: boolean): HistoryEntry[] {
  const history = loadHistory();
  let entries = history.entries;

  if (favoritesOnly) {
    entries = entries.filter(e => e.favorite);
  }

  if (limit) {
    entries = entries.slice(0, limit);
  }

  return entries;
}

export function clearHistory(keepFavorites: boolean = true): void {
  const history = loadHistory();
  
  if (keepFavorites) {
    history.entries = history.entries.filter(e => e.favorite);
  } else {
    history.entries = [];
  }

  saveHistory(history);
}

export function getById(id: string): HistoryEntry | undefined {
  const history = loadHistory();
  return history.entries.find(e => e.id === id);
}
