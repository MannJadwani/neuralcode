import * as fs from 'fs-extra';
export interface FileOperation {
    type: 'read' | 'write' | 'edit';
    filePath: string;
    content?: string;
    oldString?: string;
    newString?: string;
}
export declare function executeFileOperation(operation: FileOperation): Promise<string>;
export declare function listDirectory(dirPath?: string): Promise<string[]>;
export declare function getFileInfo(filePath: string): Promise<fs.Stats>;
//# sourceMappingURL=files.d.ts.map