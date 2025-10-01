"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCLI = runCLI;
const readline = require("readline");
const ai_1 = require("./ai");
const context_1 = require("./context");
const memory_1 = require("./memory");
const codeActions_1 = require("./codeActions");
async function runCLI() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    console.log('Welcome to NeuralCode! Type your questions or "exit" to quit.');
    let context = await (0, context_1.loadContext)();
    let preferences = await (0, memory_1.loadPreferences)();
    const askQuestion = () => {
        rl.question('> ', async (input) => {
            if (input.toLowerCase() === 'exit') {
                await (0, context_1.saveContext)(context);
                await (0, memory_1.savePreferences)(preferences);
                rl.close();
                return;
            }
            // Add user input to context
            (0, context_1.addToContext)(context, 'user', input);
            try {
                const response = await (0, ai_1.getAIResponse)(input, context, preferences);
                console.log(response);
                // Check for code actions in the response
                const actions = (0, codeActions_1.parseCodeActions)(response);
                if (actions.length > 0) {
                    console.log(`\n🤖 I detected ${actions.length} code action(s) in my response. Execute them? (y/n)`);
                    const confirmation = await new Promise((resolve) => {
                        rl.question('', (answer) => resolve(answer.toLowerCase()));
                    });
                    if (confirmation === 'y' || confirmation === 'yes') {
                        console.log('Executing code actions...');
                        const results = await (0, codeActions_1.executeCodeActions)(actions);
                        results.forEach(result => console.log(result));
                    }
                    else {
                        console.log('Code actions skipped.');
                    }
                }
                // Add AI response to context
                (0, context_1.addToContext)(context, 'assistant', response);
            }
            catch (error) {
                console.error('Error:', error.message);
            }
            askQuestion();
        });
    };
    askQuestion();
}
//# sourceMappingURL=cli.js.map