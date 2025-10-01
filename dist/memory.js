"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadPreferences = loadPreferences;
exports.savePreferences = savePreferences;
exports.updatePreference = updatePreference;
exports.getPreference = getPreference;
const fs = require("fs-extra");
const path = require("path");
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