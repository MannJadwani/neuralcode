#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const cli_1 = require("./cli");
const program = new commander_1.Command();
program
    .name('neuralcode')
    .description('AI-powered coding assistant with enhanced context and memory')
    .version('1.0.0');
program
    .command('chat')
    .description('Start an interactive chat session')
    .action(() => {
    (0, cli_1.runCLI)();
});
program
    .command('set <key> <value>')
    .description('Set a user preference')
    .action(async (key, value) => {
    const { updatePreference } = await Promise.resolve().then(() => require('./memory'));
    await updatePreference(key, value);
    console.log(`Preference ${key} set to ${value}`);
});
program.parse();
//# sourceMappingURL=index.js.map