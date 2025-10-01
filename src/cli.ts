import * as readline from 'readline';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { search } from '@inquirer/prompts';
import { getAIResponse } from './ai';
import { loadContext, saveContext, addToContext } from './context';
import { loadPreferences, savePreferences, updatePreference } from './memory';
import { parseCodeActions, executeCodeActions } from './codeActions';
import { parseTodoListFromResponse, createTodoList, addTodoItem, saveTodoLists, loadTodoLists, formatTodoList, getActiveTodoList, updateTodoStatus, setCurrentItem } from './todo';

// Setup keypress handling
const keypress = require('keypress');
if (process.stdin.isTTY) {
  keypress(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.resume();
}



function centerText(text: string): string {
  const columns = process.stdout.columns || 80;
  const padding = Math.max(0, Math.floor((columns - text.length) / 2));
  return ' '.repeat(padding) + text;
}

async function showCommandDropdown(): Promise<string> {
  const commands = [
    { name: '/help - Show available commands', value: '/help' },
    { name: '/model - Set or view AI model', value: '/model' },
    { name: '/todo - Show current active todo list', value: '/todo' },
    { name: '/todos - Show all todo lists', value: '/todos' },
    { name: '/complete - Mark current task as completed', value: '/complete' },
    { name: '/next - Move to next task', value: '/next' },
  ];

  try {
    const selectedCommand = await search({
      message: 'Select a command:',
      source: async (term?: string) => {
        if (!term) return commands;
        return commands.filter(cmd =>
          cmd.name.toLowerCase().includes(term.toLowerCase())
        );
      },
    });
    return selectedCommand;
  } catch (error) {
    // If search fails, return empty string
    return '';
  }
}

export async function runCLI() {
  const models = ['google/gemini-2.5-pro', 'openai/gpt-5', 'anthropic/claude-sonnet-4.5', 'openai/gpt-5-mini', 'openai/gpt-oss-120b', 'openai/gpt-4.1', 'x-ai/grok-code-fast-1', 'x-ai/grok-4-fast', 'z-ai/glm-4.6', 'deepseek/deepseek-v3.2-exp', 'google/gemini-2.5-flash-preview-09-2025', 'deepseek/deepseek-v3.1-terminus', 'moonshotai/kimi-k2-0905', 'openai/gpt-5-nano'];

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log(chalk.blue(centerText('Welcome to NeuralCode!')));
  console.log(chalk.gray(centerText('Type your questions, use "/" for commands, or "exit" to quit.')));
  console.log();

  let context = await loadContext();
  let preferences = await loadPreferences();

  const askQuestion = async () => {
    // Show current active todo list status
    const lists = await loadTodoLists();
    const activeList = getActiveTodoList(lists);
    if (activeList) {
      const currentItem = activeList.items.find(item => item.status === 'in_progress');
      if (currentItem) {
        console.log(chalk.yellow(`🔄 Working on: ${currentItem.content}`));
      } else {
        const pendingItems = activeList.items.filter(item => item.status === 'pending');
        if (pendingItems.length > 0) {
          console.log(chalk.blue(`📋 ${activeList.title}: ${pendingItems.length} tasks remaining`));
        }
      }
    }

    return new Promise<string>((resolve) => {
      let input = '';
      let showingDropdown = false;

      process.stdout.write('> ');

      const onKeypress = async (ch: string, key: any) => {
        // Handle Ctrl+C
        if (key && key.ctrl && key.name === 'c') {
          process.stdin.off('keypress', onKeypress);
          process.stdin.setRawMode(false);
          process.exit(0);
        }

        // Handle Enter
        if (key && key.name === 'return') {
          process.stdin.off('keypress', onKeypress);
          process.stdin.setRawMode(false);
          console.log(); // New line
          resolve(input);
          return;
        }

        // Handle backspace
        if (key && key.name === 'backspace') {
          if (input.length > 0) {
            input = input.slice(0, -1);
            process.stdout.write('\b \b');
          }
          return;
        }

        // Handle slash - show dropdown immediately
        if (ch === '/' && !showingDropdown && input === '') {
          showingDropdown = true;
          process.stdin.off('keypress', onKeypress);
          process.stdin.setRawMode(false);

          try {
            const selectedCommand = await showCommandDropdown();
            resolve(selectedCommand);
          } catch (error) {
            resolve('/');
          }
          return;
        }

        // Normal character input
        if (ch && !showingDropdown) {
          input += ch;
          process.stdout.write(ch);
        }
      };

      process.stdin.on('keypress', onKeypress);
    }).then(async (input: string) => {
      if (!input) {
        await askQuestion();
        return;
      }
      if (input.toLowerCase() === 'exit') {
        await saveContext(context);
        await savePreferences(preferences);
        rl.close();
        return;
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
          console.log(centerText('/todo - Show current active todo list'));
          console.log(centerText('/todos - Show all todo lists'));
          console.log(centerText('/complete - Mark current task as completed'));
          console.log(centerText('/next - Move to next task in todo list'));
          console.log(centerText('/help - Show this help'));
        } else if (command === 'todo') {
          const lists = await loadTodoLists();
          const activeList = getActiveTodoList(lists);
          if (activeList) {
            console.log(formatTodoList(activeList));
          } else {
            console.log(chalk.gray(centerText('No active todo lists found.')));
          }
        } else if (command === 'todos') {
          const lists = await loadTodoLists();
          if (lists.length === 0) {
            console.log(chalk.gray(centerText('No todo lists found.')));
          } else {
            lists.forEach((list, index) => {
              const status = list.items.some(item => item.status === 'pending' || item.status === 'in_progress') ? 'Active' : 'Completed';
              console.log(chalk.blue(`${index + 1}. ${list.title} (${status})`));
            });
          }
        } else if (command === 'complete') {
          const lists = await loadTodoLists();
          const activeList = getActiveTodoList(lists);
          if (activeList) {
            const currentItem = activeList.items.find(item => item.status === 'in_progress');
            if (currentItem) {
              updateTodoStatus(activeList, currentItem.id, 'completed');
              await saveTodoLists(lists);
              console.log(chalk.green(centerText(`✅ Task "${currentItem.content}" marked as completed!`)));

              const nextItem = activeList.items.find(item => item.status === 'pending');
              if (nextItem) {
                console.log(chalk.blue(centerText(`Next task: ${nextItem.content}`)));
              } else {
                console.log(chalk.green(centerText('🎉 All tasks completed!')));
              }
            } else {
              console.log(chalk.yellow(centerText('No task currently in progress.')));
            }
          } else {
            console.log(chalk.gray(centerText('No active todo list.')));
          }
        } else if (command === 'next') {
          const lists = await loadTodoLists();
          const activeList = getActiveTodoList(lists);
          if (activeList) {
            const nextItem = activeList.items.find(item => item.status === 'pending');
            if (nextItem) {
              // Mark current item as completed if exists
              const currentItem = activeList.items.find(item => item.status === 'in_progress');
              if (currentItem) {
                updateTodoStatus(activeList, currentItem.id, 'completed');
              }

              // Set next item as in progress
              setCurrentItem(activeList, nextItem.id);
              await saveTodoLists(lists);
              console.log(chalk.blue(centerText(`🔄 Now working on: ${nextItem.content}`)));
            } else {
              console.log(chalk.green(centerText('🎉 All tasks are completed!')));
            }
          } else {
            console.log(chalk.gray(centerText('No active todo list.')));
          }
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

            // Check if we should mark current todo item as complete
            const lists = await loadTodoLists();
            const activeList = getActiveTodoList(lists);
            if (activeList) {
              const currentItem = activeList.items.find(item => item.status === 'in_progress');
              if (currentItem) {
                console.log(chalk.yellow(centerText(`Task "${currentItem.content}" completed. Mark as done? (y/n)`)));

                const taskConfirmation = await new Promise<string>((resolve) => {
                  rl.question('', (answer) => resolve(answer.toLowerCase()));
                });

                if (taskConfirmation === 'y' || taskConfirmation === 'yes') {
                  updateTodoStatus(activeList, currentItem.id, 'completed');
                  await saveTodoLists(lists);
                  console.log(chalk.green(centerText('✅ Task marked as completed!')));

                  // Check if there are more tasks
                  const nextItem = activeList.items.find(item => item.status === 'pending');
                  if (nextItem) {
                    console.log(chalk.blue(centerText(`Next task: ${nextItem.content}`)));
                  } else {
                    console.log(chalk.green(centerText('🎉 All tasks completed!')));
                  }
                }
              }
            }
          } else {
            console.log(chalk.gray(centerText('Code actions skipped.')));
          }
        }

        // Check for todo lists in the response
        const todoData = parseTodoListFromResponse(response);
        if (todoData) {
          console.log(chalk.yellow(centerText(`📋 I created a todo list: "${todoData.title}"`)));
          console.log(chalk.yellow(centerText(`It has ${todoData.items.length} tasks. Create it? (y/n)`)));

          const confirmation = await new Promise<string>((resolve) => {
            rl.question('', (answer) => resolve(answer.toLowerCase()));
          });

          if (confirmation === 'y' || confirmation === 'yes') {
            const lists = await loadTodoLists();
            const newList = createTodoList(todoData.title);
            todoData.items.forEach(item => addTodoItem(newList, item));
            lists.push(newList);
            await saveTodoLists(lists);

            console.log(chalk.green(centerText('✅ Todo list created!')));
            console.log(formatTodoList(newList));
          } else {
            console.log(chalk.gray(centerText('Todo list creation skipped.')));
          }
        }

        // Add AI response to context
        addToContext(context, 'assistant', response);
      } catch (error) {
        console.error(chalk.red(centerText(`Error: ${(error as Error).message}`)));
      }

      await askQuestion();
    });
  };

  await askQuestion();
}