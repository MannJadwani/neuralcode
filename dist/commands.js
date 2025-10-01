"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeCommand = executeCommand;
exports.isCommandSafe = isCommandSafe;
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
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
async function executeCommand(command, cwd) {
    if (!command)
        throw new Error('Command is required');
    // Basic safety check
    const baseCommand = command.trim().split(' ')[0];
    if (!baseCommand || !SAFE_COMMANDS.includes(baseCommand)) {
        throw new Error(`Command '${baseCommand || 'unknown'}' is not in the allowed commands list for security reasons`);
    }
    try {
        const options = {};
        if (cwd)
            options.cwd = cwd;
        const result = await execAsync(command, options);
        return {
            stdout: result.stdout?.toString() || '',
            stderr: result.stderr?.toString() || '',
            exitCode: 0
        };
    }
    catch (error) {
        return {
            stdout: error.stdout?.toString() || '',
            stderr: error.stderr?.toString() || '',
            exitCode: error.code || 1
        };
    }
}
function isCommandSafe(command) {
    const baseCommand = command.trim().split(' ')[0] || '';
    return SAFE_COMMANDS.includes(baseCommand);
}
//# sourceMappingURL=commands.js.map