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
exports.loadContext = loadContext;
exports.saveContext = saveContext;
exports.addToContext = addToContext;
exports.getRecentContext = getRecentContext;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
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