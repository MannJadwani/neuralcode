import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { readFile, writeFile, editFile } from './edit';

export interface FileOperation {
  type: 'read' | 'write' | 'edit';
  filePath: string;
  content?: string;
  oldString?: string;
  newString?: string;
}

export async function executeFileOperation(operation: FileOperation): Promise<string> {
  let filePath = operation.filePath;
  if (filePath.startsWith('~')) {
    filePath = filePath.replace(/^~/, os.homedir());
  }
  const absolutePath = path.resolve(filePath);

  // Safety check: don't allow operations outside current directory
  const currentDir = process.cwd();
  if (!absolutePath.startsWith(currentDir)) {
    throw new Error('File operations are only allowed within the current project directory');
  }

  // Additional safety check: don't allow operations on .nvm directories
  if (absolutePath.includes('/.nvm/') || absolutePath.includes('/.nvm')) {
    throw new Error('File operations on .nvm directories are not allowed for security reasons');
  }

  switch (operation.type) {
    case 'read':
      return await readFile(absolutePath);

    case 'write':
      if (!operation.content) throw new Error('Content required for write operation');
      await writeFile(absolutePath, operation.content);
      return `File ${operation.filePath} created/updated successfully`;

    case 'edit':
      if (!operation.oldString || !operation.newString) {
        throw new Error('oldString and newString required for edit operation');
      }
      await editFile(absolutePath, operation.oldString, operation.newString);
      return `File ${operation.filePath} edited successfully`;

    default:
      throw new Error(`Unknown operation type: ${(operation as any).type}`);
  }
}

export async function listDirectory(dirPath: string = '.'): Promise<string[]> {
  const absolutePath = path.resolve(dirPath);
  const currentDir = process.cwd();

  if (!absolutePath.startsWith(currentDir)) {
    throw new Error('Directory listing is only allowed within the current project directory');
  }

  const items = await fs.readdir(absolutePath);
  return items;
}

export async function getFileInfo(filePath: string): Promise<fs.Stats> {
  const absolutePath = path.resolve(filePath);
  const currentDir = process.cwd();

  if (!absolutePath.startsWith(currentDir)) {
    throw new Error('File info is only allowed within the current project directory');
  }

  return await fs.stat(absolutePath);
}