#!/usr/bin/env node

import { Command } from 'commander';
import { runCLI } from './cli';

const program = new Command();

program
  .name('neuralcode')
  .description('AI-powered coding assistant with enhanced context and memory')
  .version('1.0.0');

program
  .command('chat')
  .description('Start an interactive chat session')
  .action(() => {
    runCLI();
  });

program
  .command('set <key> <value>')
  .description('Set a user preference')
  .action(async (key: string, value: string) => {
    const { updatePreference } = await import('./memory');
    await updatePreference(key, value);
    console.log(`Preference ${key} set to ${value}`);
  });

program.parse();