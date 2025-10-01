import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

// Whitelist of safe commands that are commonly used in development
const SAFE_COMMANDS = [
  'npm', 'yarn', 'pnpm',
  'git',
  'node', 'npx',
  'tsc', 'eslint', 'prettier',
  'jest', 'mocha', 'vitest',
  'python', 'pip', 'python3',
  'go', 'cargo', 'rustc',
  'docker', 'docker-compose',
  'ls', 'cat', 'grep', 'find',
  'mkdir', 'rm', 'cp', 'mv',
  'echo', 'pwd', 'which'
];

export async function executeCommand(command: string, cwd?: string): Promise<CommandResult> {
  if (!command) throw new Error('Command is required');
  // Basic safety check
  const baseCommand = command.trim().split(' ')[0];
  if (!baseCommand || !SAFE_COMMANDS.includes(baseCommand)) {
    throw new Error(`Command '${baseCommand || 'unknown'}' is not in the allowed commands list for security reasons`);
  }

  try {
    const options: any = {};
    if (cwd) options.cwd = cwd;
    const result = await execAsync(command, options);

    return {
      stdout: result.stdout?.toString() || '',
      stderr: result.stderr?.toString() || '',
      exitCode: 0
    };
  } catch (error: any) {
    return {
      stdout: error.stdout?.toString() || '',
      stderr: error.stderr?.toString() || '',
      exitCode: error.code || 1
    };
  }
}

export function isCommandSafe(command: string): boolean {
  const baseCommand = command.trim().split(' ')[0] || '';
  return SAFE_COMMANDS.includes(baseCommand);
}