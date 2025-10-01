import * as fs from 'fs-extra';

export async function readFile(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to read file ${filePath}: ${(error as Error).message}`);
  }
}

export async function writeFile(filePath: string, content: string): Promise<void> {
  try {
    await fs.ensureDir(require('path').dirname(filePath));
    await fs.writeFile(filePath, content, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to write file ${filePath}: ${(error as Error).message}`);
  }
}

export async function editFile(filePath: string, oldString: string, newString: string): Promise<void> {
  try {
    const content = await readFile(filePath);
    const newContent = content.replace(oldString, newString);

    if (newContent === content) {
      throw new Error('oldString not found in file content');
    }

    await writeFile(filePath, newContent);
  } catch (error) {
    throw new Error(`Failed to edit file ${filePath}: ${(error as Error).message}`);
  }
}