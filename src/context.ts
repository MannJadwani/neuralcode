import * as fs from 'fs-extra';
import * as path from 'path';

const CONTEXT_FILE = path.join(process.cwd(), '.neuralcode', 'context.json');

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export type Context = Message[];

export async function loadContext(): Promise<Context> {
  try {
    await fs.ensureDir(path.dirname(CONTEXT_FILE));
    const data = await fs.readFile(CONTEXT_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function saveContext(context: Context): Promise<void> {
  await fs.ensureDir(path.dirname(CONTEXT_FILE));
  await fs.writeFile(CONTEXT_FILE, JSON.stringify(context, null, 2));
}

export function addToContext(context: Context, role: 'user' | 'assistant', content: string): void {
  context.push({
    role,
    content,
    timestamp: Date.now()
  });

  // Keep only last 50 messages to prevent context from growing too large
  if (context.length > 50) {
    context.splice(0, context.length - 50);
  }
}

export function getRecentContext(context: Context, limit: number = 10): Message[] {
  return context.slice(-limit);
}