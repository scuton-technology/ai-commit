// ANSI color codes — zero dependency (no chalk)
const isColor = process.env.NO_COLOR === undefined && process.stdout.isTTY;
const w = (c: number, r: number) => (s: string) => isColor ? `\x1b[${c}m${s}\x1b[${r}m` : s;

export const red = w(31, 39);
export const green = w(32, 39);
export const yellow = w(33, 39);
export const blue = w(34, 39);
export const cyan = w(36, 39);
export const gray = w(90, 39);
export const bold = w(1, 22);
export const dim = w(2, 22);

// Spinner
export class Spinner {
  private frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  private interval: NodeJS.Timeout | null = null;
  private i = 0;

  start(msg: string) {
    this.i = 0;
    this.interval = setInterval(() => {
      process.stdout.write(`\r${cyan(this.frames[this.i++ % this.frames.length])} ${msg}`);
    }, 80);
  }

  stop(msg?: string) {
    if (this.interval) clearInterval(this.interval);
    process.stdout.write('\r' + ' '.repeat(60) + '\r');
    if (msg) console.log(msg);
  }
}

// Display commit message in a box
export function box(message: string): string {
  const lines = message.split('\n');
  const maxLen = Math.max(...lines.map(l => l.length));
  const top = '┌' + '─'.repeat(maxLen + 2) + '┐';
  const bottom = '└' + '─'.repeat(maxLen + 2) + '┘';
  const content = lines.map(l => '│ ' + l.padEnd(maxLen) + ' │').join('\n');
  return `${gray(top)}\n${content}\n${gray(bottom)}`;
}

// Prompt user for Y/n/e input
export async function prompt(question: string): Promise<string> {
  const { createInterface } = await import('readline');
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}
