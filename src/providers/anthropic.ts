import Anthropic from '@anthropic-ai/sdk';
import type { AIProvider } from './types.js';

export class AnthropicProvider implements AIProvider {
  name = 'anthropic';
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async generate(prompt: string): Promise<string> {
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });

    return response.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('')
      .trim();
  }
}
