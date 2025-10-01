"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeFileOperation = executeFileOperation;
exports.listDirectory = listDirectory;
exports.getFileInfo = getFileInfo;
const fs = require("fs-extra");
const path = require("path");
const os = require("os");
const edit_1 = require("./edit");
async function executeFileOperation(operation) {
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
            return await (0, edit_1.readFile)(absolutePath);
        case 'write':
            if (!operation.content)
                throw new Error('Content required for write operation');
            await (0, edit_1.writeFile)(absolutePath, operation.content);
            return `File ${operation.filePath} created/updated successfully`;
        case 'edit':
            if (!operation.oldString || !operation.newString) {
                throw new Error('oldString and newString required for edit operation');
            }
            await (0, edit_1.editFile)(absolutePath, operation.oldString, operation.newString);
            return `File ${operation.filePath} edited successfully`;
        default:
            throw new Error(`Unknown operation type: ${operation.type}`);
    }
}
async function listDirectory(dirPath = '.') {
    const absolutePath = path.resolve(dirPath);
    const currentDir = process.cwd();
    if (!absolutePath.startsWith(currentDir)) {
        throw new Error('Directory listing is only allowed within the current project directory');
    }
    const items = await fs.readdir(absolutePath);
    return items;
}
async function getFileInfo(filePath) {
    const absolutePath = path.resolve(filePath);
    const currentDir = process.cwd();
    if (!absolutePath.startsWith(currentDir)) {
        throw new Error('File info is only allowed within the current project directory');
    }
    return await fs.stat(absolutePath);
}
//# sourceMappingURL=files.js.map