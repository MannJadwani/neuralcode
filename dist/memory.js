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
exports.loadPreferences = loadPreferences;
exports.savePreferences = savePreferences;
exports.updatePreference = updatePreference;
exports.getPreference = getPreference;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const PREFERENCES_FILE = path.join(process.cwd(), '.neuralcode', 'preferences.json');
async function loadPreferences() {
    try {
        await fs.ensureDir(path.dirname(PREFERENCES_FILE));
        const data = await fs.readFile(PREFERENCES_FILE, 'utf-8');
        return JSON.parse(data);
    }
    catch {
        return {};
    }
}
async function savePreferences(preferences) {
    await fs.ensureDir(path.dirname(PREFERENCES_FILE));
    await fs.writeFile(PREFERENCES_FILE, JSON.stringify(preferences, null, 2));
}
async function updatePreference(key, value) {
    const prefs = await loadPreferences();
    prefs[key] = value;
    await savePreferences(prefs);
}
async function getPreference(key) {
    const prefs = await loadPreferences();
    return prefs[key];
}
//# sourceMappingURL=memory.js.map