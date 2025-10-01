export interface CodeAction {
    type: 'create_file' | 'edit_file' | 'run_command' | 'read_file';
    filePath?: string;
    content?: string;
    oldString?: string;
    newString?: string;
    command?: string;
}
export declare function parseCodeActions(response: string): CodeAction[];
export declare function executeCodeActions(actions: CodeAction[]): Promise<string[]>;
//# sourceMappingURL=codeActions.d.ts.map