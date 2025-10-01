"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadContext = loadContext;
exports.saveContext = saveContext;
exports.addToContext = addToContext;
exports.getRecentContext = getRecentContext;
const fs = require("fs-extra");
const path = require("path");
const CONTEXT_FILE = path.join(process.cwd(), '.neuralcode', 'context.json');
async function loadContext() {
    try {
        await fs.ensureDir(path.dirname(CONTEXT_FILE));
        const data = await fs.readFile(CONTEXT_FILE, 'utf-8');
        return JSON.parse(data);
    }
    catch {
        return [];
    }
}
async function saveContext(context) {
    await fs.ensureDir(path.dirname(CONTEXT_FILE));
    await fs.writeFile(CONTEXT_FILE, JSON.stringify(context, null, 2));
}
function addToContext(context, role, content) {
    context.push({
        role,
        content,
        timestamp: Date.now()
    });
    // Keep only last 50 messages to prevent context from growing too large
    if (context.length > 50) {
        context.splice(0, context.length - 50);
    }
}
function getRecentContext(context, limit = 10) {
    return context.slice(-limit);
}
//# sourceMappingURL=context.js.map