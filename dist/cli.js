"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCLI = runCLI;
const readline = __importStar(require("readline"));
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = __importDefault(require("inquirer"));
const ai_1 = require("./ai");
const context_1 = require("./context");
const memory_1 = require("./memory");
const codeActions_1 = require("./codeActions");
function centerText(text) {
    const columns = process.stdout.columns || 80;
    const padding = Math.max(0, Math.floor((columns - text.length) / 2));
    return ' '.repeat(padding) + text;
}
async function runCLI() {
    const models = ['google/gemini-2.5-pro', 'openai/gpt-5', 'anthropic/claude-sonnet-4.5', 'openai/gpt-5-mini', 'openai/gpt-oss-120b', 'openai/gpt-4.1', 'x-ai/grok-code-fast-1', 'x-ai/grok-4-fast', 'z-ai/glm-4.6', 'deepseek/deepseek-v3.2-exp', 'google/gemini-2.5-flash-preview-09-2025', 'deepseek/deepseek-v3.1-terminus', 'moonshotai/kimi-k2-0905', 'openai/gpt-5-nano'];
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        completer: (line) => {
            const commands = ['/help', '/model'];
            let candidates = [];
            if (line.startsWith('/model ')) {
                candidates = models.map(m => '/model ' + m);
            }
            else if (line.startsWith('/')) {
                candidates = commands;
            }
            else {
                candidates = commands;
            }
            const hits = candidates.filter(c => c.startsWith(line));
            return [hits.length ? hits : candidates, line];
        }
    });
    console.log(chalk_1.default.blue(centerText('Welcome to NeuralCode!')));
    console.log(chalk_1.default.gray(centerText('Type your questions, use /commands, or "exit" to quit.')));
    console.log();
    let context = await (0, context_1.loadContext)();
    let preferences = await (0, memory_1.loadPreferences)();
    const askQuestion = () => {
        rl.question('> ', async (input) => {
            if (!input) {
                askQuestion();
                return;
            }
            if (input.toLowerCase() === 'exit') {
                await (0, context_1.saveContext)(context);
                await (0, memory_1.savePreferences)(preferences);
                rl.close();
                return;
            }
            // Handle dropdown for /
            if (input === '/') {
                const { selectedCommand } = await inquirer_1.default.prompt([
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
                        const { selectedModel } = await inquirer_1.default.prompt([
                            {
                                type: 'list',
                                name: 'selectedModel',
                                message: 'Select a model:',
                                choices: models,
                            },
                        ]);
                        await (0, memory_1.updatePreference)('model', selectedModel);
                        preferences = await (0, memory_1.loadPreferences)();
                        console.log(chalk_1.default.green(centerText(`Model set to: ${selectedModel}`)));
                    }
                    else {
                        const model = args.join(' ');
                        await (0, memory_1.updatePreference)('model', model);
                        preferences = await (0, memory_1.loadPreferences)();
                        console.log(chalk_1.default.green(centerText(`Model set to: ${model}`)));
                    }
                }
                else if (command === 'help') {
                    console.log(chalk_1.default.cyan(centerText('Available commands:')));
                    console.log(centerText('/model [model_name] - Set or view the AI model'));
                    console.log(centerText('/help - Show this help'));
                }
                else {
                    console.log(chalk_1.default.red(centerText(`Unknown command: /${command}`)));
                }
                askQuestion();
                return;
            }
            // Add user input to context
            (0, context_1.addToContext)(context, 'user', input);
            try {
                const response = await (0, ai_1.getAIResponse)(input, context, preferences);
                console.log(chalk_1.default.white(response));
                // Check for code actions in the response
                const actions = (0, codeActions_1.parseCodeActions)(response);
                if (actions.length > 0) {
                    console.log(chalk_1.default.yellow(centerText(`🤖 I detected ${actions.length} code action(s) in my response. Execute them? (y/n)`)));
                    const confirmation = await new Promise((resolve) => {
                        rl.question('', (answer) => resolve(answer.toLowerCase()));
                    });
                    if (confirmation === 'y' || confirmation === 'yes') {
                        console.log(chalk_1.default.blue(centerText('Executing code actions...')));
                        const results = await (0, codeActions_1.executeCodeActions)(actions);
                        results.forEach(result => console.log(chalk_1.default.gray(centerText(result))));
                    }
                    else {
                        console.log(chalk_1.default.gray(centerText('Code actions skipped.')));
                    }
                }
                // Add AI response to context
                (0, context_1.addToContext)(context, 'assistant', response);
            }
            catch (error) {
                console.error(chalk_1.default.red(centerText(`Error: ${error.message}`)));
            }
            askQuestion();
        });
    };
    askQuestion();
}
//# sourceMappingURL=cli.js.map