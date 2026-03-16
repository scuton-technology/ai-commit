import type { AIProvider } from './types.js';

export class OllamaProvider implements AIProvider {
  name = 'ollama';
  private baseUrl: string;
  private model: string;

  constructor(model?: string, baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.OLLAMA_HOST || 'http://localhost:11434';
    this.model = model || process.env.OLLAMA_MODEL || 'llama3.1';
  }

  async generate(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt,
        stream: false,
        options: { temperature: 0.7, num_predict: 300 },
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(
        `Ollama request failed (${response.status}): ${text || response.statusText}\n` +
        `Make sure Ollama is running: ollama serve`
      );
    }

    const data = (await response.json()) as { response: string };
    return data.response.trim();
  }
}
