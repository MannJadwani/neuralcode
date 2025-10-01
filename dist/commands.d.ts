export interface CommandResult {
    stdout: string;
    stderr: string;
    exitCode: number;
}
export declare function executeCommand(command: string, cwd?: string): Promise<CommandResult>;
export declare function isCommandSafe(command: string): boolean;
//# sourceMappingURL=commands.d.ts.map