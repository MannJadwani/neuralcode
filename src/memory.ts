import * as fs from 'fs-extra';
import * as path from 'path';

const PREFERENCES_FILE = path.join(process.cwd(), '.neuralcode', 'preferences.json');

export interface UserPreferences {
  preferredLanguage?: string;
  codingStyle?: string;
  apiKey?: string;
  [key: string]: any;
}

export async function loadPreferences(): Promise<UserPreferences> {
  try {
    await fs.ensureDir(path.dirname(PREFERENCES_FILE));
    const data = await fs.readFile(PREFERENCES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

export async function savePreferences(preferences: UserPreferences): Promise<void> {
  await fs.ensureDir(path.dirname(PREFERENCES_FILE));
  await fs.writeFile(PREFERENCES_FILE, JSON.stringify(preferences, null, 2));
}

export async function updatePreference(key: string, value: any): Promise<void> {
  const prefs = await loadPreferences();
  prefs[key] = value;
  await savePreferences(prefs);
}

export async function getPreference(key: string): Promise<any> {
  const prefs = await loadPreferences();
  return prefs[key];
}