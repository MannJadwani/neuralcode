export interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}
export type Context = Message[];
export declare function loadContext(): Promise<Context>;
export declare function saveContext(context: Context): Promise<void>;
export declare function addToContext(context: Context, role: 'user' | 'assistant', content: string): void;
export declare function getRecentContext(context: Context, limit?: number): Message[];
//# sourceMappingURL=context.d.ts.map