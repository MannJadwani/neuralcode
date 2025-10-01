"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readFile = readFile;
exports.writeFile = writeFile;
exports.editFile = editFile;
const fs = require("fs-extra");
async function readFile(filePath) {
    try {
        return await fs.readFile(filePath, 'utf-8');
    }
    catch (error) {
        throw new Error(`Failed to read file ${filePath}: ${error.message}`);
    }
}
async function writeFile(filePath, content) {
    try {
        await fs.ensureDir(require('path').dirname(filePath));
        await fs.writeFile(filePath, content, 'utf-8');
    }
    catch (error) {
        throw new Error(`Failed to write file ${filePath}: ${error.message}`);
    }
}
async function editFile(filePath, oldString, newString) {
    try {
        const content = await readFile(filePath);
        const newContent = content.replace(oldString, newString);
        if (newContent === content) {
            throw new Error('oldString not found in file content');
        }
        await writeFile(filePath, newContent);
    }
    catch (error) {
        throw new Error(`Failed to edit file ${filePath}: ${error.message}`);
    }
}
//# sourceMappingURL=edit.js.map