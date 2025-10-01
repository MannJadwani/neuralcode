import OpenAI from 'openai';
import { Context, getRecentContext } from './context';
import type { UserPreferences } from './memory';

let openai: OpenAI | null = null;

function getOpenAIClient(apiKey?: string): OpenAI {
  if (!openai) {
    const key = apiKey || process.env.OPENROUTER_API_KEY;
    if (!key) {
      throw new Error('OpenRouter API key not found. Set OPENROUTER_API_KEY environment variable or configure in preferences.');
    }
    openai = new OpenAI({
      apiKey: key,
      baseURL: 'https://openrouter.ai/api/v1'
    });
  }
  return openai;
}

export async function getAIResponse(userInput: string, context: Context, preferences: UserPreferences): Promise<string> {
  const client = getOpenAIClient(preferences.apiKey);

  const recentContext = getRecentContext(context, 10);

   const systemPrompt = `You are NeuralCode, an AI-powered coding assistant with enhanced context awareness and memory of user preferences.

User preferences:
${Object.entries(preferences).filter(([key]) => key !== 'apiKey').map(([key, value]) => `- ${key}: ${value}`).join('\n')}

Recent conversation context:
${recentContext.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

You can perform code actions by using special syntax in your responses:
- To create/modify files: Use \`\`\`filename.ext\ncode content\n\`\`\`
- To edit existing code: Use EDIT filename.ext: \`old code\` -> \`new code\`
- To run commands: Use RUN command
- To read files: Use READ filename.ext

Important guidelines:
- Only suggest editing files within the current project directory. Do not suggest editing system files, configuration files outside the project (like ~/.nvmrc, ~/.bashrc), or any .nvm directories.
- Use relative paths for file operations within the project.
- Do not suggest actions that could harm the system or edit sensitive files.

These actions will be automatically detected and executed with user confirmation.

Provide helpful, accurate coding assistance. Remember user preferences and maintain context from previous interactions.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...recentContext.map(msg => ({ role: msg.role, content: msg.content })),
    { role: 'user', content: userInput }
  ];

  const model = preferences.model || 'xai/grok-2'; // Default to Grok for fast coding

  try {
    const response = await client.chat.completions.create({
      model: model,
      messages: messages as any,
      max_tokens: 1000,
      temperature: 0.7
    });

    return response.choices[0]?.message?.content || 'No response generated.';
  } catch (error) {
    throw new Error(`AI request failed: ${(error as Error).message}`);
  }
}