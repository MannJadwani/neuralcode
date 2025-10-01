export interface UserPreferences {
    preferredLanguage?: string;
    codingStyle?: string;
    apiKey?: string;
    model?: string;
    [key: string]: any;
}
export declare function loadPreferences(): Promise<UserPreferences>;
export declare function savePreferences(preferences: UserPreferences): Promise<void>;
export declare function updatePreference(key: string, value: any): Promise<void>;
export declare function getPreference(key: string): Promise<any>;
//# sourceMappingURL=memory.d.ts.map