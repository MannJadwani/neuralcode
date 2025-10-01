import * as readline from 'readline';
import { getAIResponse } from './ai';
import { loadContext, saveContext, addToContext } from './context';
import { loadPreferences, savePreferences } from './memory';
import { parseCodeActions, executeCodeActions } from './codeActions';

export async function runCLI() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('Welcome to NeuralCode! Type your questions or "exit" to quit.');

  let context = await loadContext();
  let preferences = await loadPreferences();

  const askQuestion = () => {
    rl.question('> ', async (input) => {
      if (input.toLowerCase() === 'exit') {
        await saveContext(context);
        await savePreferences(preferences);
        rl.close();
        return;
      }

      // Add user input to context
      addToContext(context, 'user', input);

      try {
        const response = await getAIResponse(input, context, preferences);
        console.log(response);

        // Check for code actions in the response
        const actions = parseCodeActions(response);
        if (actions.length > 0) {
          console.log(`\n🤖 I detected ${actions.length} code action(s) in my response. Execute them? (y/n)`);

          const confirmation = await new Promise<string>((resolve) => {
            rl.question('', (answer) => resolve(answer.toLowerCase()));
          });

          if (confirmation === 'y' || confirmation === 'yes') {
            console.log('Executing code actions...');
            const results = await executeCodeActions(actions);
            results.forEach(result => console.log(result));
          } else {
            console.log('Code actions skipped.');
          }
        }

        // Add AI response to context
        addToContext(context, 'assistant', response);
      } catch (error) {
        console.error('Error:', (error as Error).message);
      }

      askQuestion();
    });
  };

  askQuestion();
}