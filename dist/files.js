"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeFileOperation = executeFileOperation;
exports.listDirectory = listDirectory;
exports.getFileInfo = getFileInfo;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
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