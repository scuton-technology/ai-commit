import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, readFileSync, writeFileSync } from 'fs';

vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

import { loadConfig, saveConfig, type Config } from '../src/lib/config.js';

const mockExists = vi.mocked(existsSync);
const mockRead = vi.mocked(readFileSync);
const mockWrite = vi.mocked(writeFileSync);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('loadConfig', () => {
  it('should return empty object when config file does not exist', () => {
    mockExists.mockReturnValue(false);
    expect(loadConfig()).toEqual({});
  });

  it('should parse config file correctly', () => {
    mockExists.mockReturnValue(true);
    mockRead.mockReturnValue(JSON.stringify({ provider: 'anthropic', emoji: true }));

    const config = loadConfig();
    expect(config.provider).toBe('anthropic');
    expect(config.emoji).toBe(true);
  });

  it('should return empty object for invalid JSON', () => {
    mockExists.mockReturnValue(true);
    mockRead.mockReturnValue('invalid json{{{');

    expect(loadConfig()).toEqual({});
  });

  it('should handle all config fields', () => {
    mockExists.mockReturnValue(true);
    const fullConfig: Config = {
      provider: 'openai',
      style: 'simple',
      language: 'tr',
      emoji: true,
      autoCommit: false,
    };
    mockRead.mockReturnValue(JSON.stringify(fullConfig));

    const config = loadConfig();
    expect(config).toEqual(fullConfig);
  });
});

describe('saveConfig', () => {
  it('should write config as formatted JSON', () => {
    const config: Config = { provider: 'anthropic', style: 'conventional' };
    saveConfig(config);

    expect(mockWrite).toHaveBeenCalledTimes(1);
    const [, content] = mockWrite.mock.calls[0];
    expect(JSON.parse(content as string)).toEqual(config);
  });

  it('should write with utf-8 encoding', () => {
    saveConfig({ emoji: true });
    expect(mockWrite).toHaveBeenCalledWith(expect.any(String), expect.any(String), 'utf-8');
  });
});
