import * as readline from 'readline';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { getAIResponse } from './ai';
import { loadContext, saveContext, addToContext } from './context';
import { loadPreferences, savePreferences, updatePreference } from './memory';
import { parseCodeActions, executeCodeActions } from './codeActions';

function centerText(text: string): string {
  const columns = process.stdout.columns || 80;
  const padding = Math.max(0, Math.floor((columns - text.length) / 2));
  return ' '.repeat(padding) + text;
}

export async function runCLI() {
  const models = ['google/gemini-2.5-pro', 'openai/gpt-5', 'anthropic/claude-sonnet-4.5', 'openai/gpt-5-mini', 'openai/gpt-oss-120b', 'openai/gpt-4.1', 'x-ai/grok-code-fast-1', 'x-ai/grok-4-fast', 'z-ai/glm-4.6', 'deepseek/deepseek-v3.2-exp', 'google/gemini-2.5-flash-preview-09-2025', 'deepseek/deepseek-v3.1-terminus', 'moonshotai/kimi-k2-0905', 'openai/gpt-5-nano'];

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    completer: (line: string) => {
      const commands = ['/help', '/model'];
      let candidates: string[] = [];

      if (line.startsWith('/model ')) {
        candidates = models.map(m => '/model ' + m);
      } else if (line.startsWith('/')) {
        candidates = commands;
      } else {
        candidates = commands;
      }

      const hits = candidates.filter(c => c.startsWith(line));
      return [hits.length ? hits : candidates, line];
    }
  });

  console.log(chalk.blue(centerText('Welcome to NeuralCode!')));
  console.log(chalk.gray(centerText('Type your questions, use /commands, or "exit" to quit.')));
  console.log();

  let context = await loadContext();
  let preferences = await loadPreferences();

  const askQuestion = () => {
    rl.question('> ', async (input: string) => {
      if (!input) {
        askQuestion();
        return;
      }
      if (input.toLowerCase() === 'exit') {
        await saveContext(context);
        await savePreferences(preferences);
        rl.close();
        return;
      }

      // Handle dropdown for /
      if (input === '/') {
        const { selectedCommand } = await inquirer.prompt([
          {
            type: 'list',
            name: 'selectedCommand',
            message: 'Select a command:',
            choices: ['/help', '/model'],
          },
        ]);
        input = selectedCommand;
      }

      // Handle slash commands
      if (input.startsWith('/')) {
        const parts = input.slice(1).split(' ');
        const command = (parts[0] || '').toLowerCase();
        const args = parts.slice(1);

        if (command === 'model') {
          if (args.length === 0) {
            const { selectedModel } = await inquirer.prompt([
              {
                type: 'list',
                name: 'selectedModel',
                message: 'Select a model:',
                choices: models,
              },
            ]);
            await updatePreference('model', selectedModel);
            preferences = await loadPreferences();
            console.log(chalk.green(centerText(`Model set to: ${selectedModel}`)));
          } else {
            const model = args.join(' ');
            await updatePreference('model', model);
            preferences = await loadPreferences();
            console.log(chalk.green(centerText(`Model set to: ${model}`)));
          }
        } else if (command === 'help') {
          console.log(chalk.cyan(centerText('Available commands:')));
          console.log(centerText('/model [model_name] - Set or view the AI model'));
          console.log(centerText('/help - Show this help'));
        } else {
          console.log(chalk.red(centerText(`Unknown command: /${command}`)));
        }

        askQuestion();
        return;
      }

      // Add user input to context
      addToContext(context, 'user', input);

      try {
        const response = await getAIResponse(input, context, preferences);
        console.log(chalk.white(response));

        // Check for code actions in the response
        const actions = parseCodeActions(response);
        if (actions.length > 0) {
          console.log(chalk.yellow(centerText(`🤖 I detected ${actions.length} code action(s) in my response. Execute them? (y/n)`)));

          const confirmation = await new Promise<string>((resolve) => {
            rl.question('', (answer) => resolve(answer.toLowerCase()));
          });

          if (confirmation === 'y' || confirmation === 'yes') {
            console.log(chalk.blue(centerText('Executing code actions...')));
            const results = await executeCodeActions(actions);
            results.forEach(result => console.log(chalk.gray(centerText(result))));
          } else {
            console.log(chalk.gray(centerText('Code actions skipped.')));
          }
        }

        // Add AI response to context
        addToContext(context, 'assistant', response);
      } catch (error) {
        console.error(chalk.red(centerText(`Error: ${(error as Error).message}`)));
      }

      askQuestion();
    });
  };

  askQuestion();
}