# NeuralCode

An AI-powered coding assistant with enhanced context handling and global memory for user preferences.

## Features

- **Enhanced Context**: Maintains conversation history across sessions for better continuity
- **Global Memory**: Stores user preferences like preferred language, coding style, etc.
- **Multi-API Support**: Uses OpenRouter to access models from OpenAI, Anthropic, Google, and more
- **Code Generation**: AI can create, edit, and modify files directly in your project
- **Command Execution**: Safe execution of development commands (build, test, lint, etc.)
- **File Operations**: Read, write, and edit files with AI assistance

## Installation

```bash
npm install -g .
```

## Setup

1. Get an OpenRouter API key from https://openrouter.ai/keys
2. Set your API key:
```bash
neuralcode set apiKey your_openrouter_api_key_here
```

3. Optionally set your preferred model:
```bash
neuralcode set model openai/gpt-4o
# or anthropic/claude-3-haiku, google/gemini-pro, etc.
```

## Usage

Start a chat session:
```bash
neuralcode chat
```

## AI Code Actions

NeuralCode can perform code actions automatically. In chat mode, the AI can:

- **Create files**: Just describe what you want, and the AI will create files using code blocks
- **Edit existing code**: The AI can modify files by specifying changes
- **Run commands**: Execute safe development commands like `npm install`, `git status`, etc.
- **Read files**: Access and analyze your codebase

### Example Commands

```
"Create a React component for a todo list"
"Add error handling to the login function in auth.js"
"Run npm test to check if everything works"
"Show me the contents of package.json"
```

The AI will detect these intentions and execute the appropriate actions with your confirmation.

Set preferences:
```bash
neuralcode set preferredLanguage typescript
neuralcode set codingStyle functional
neuralcode set model anthropic/claude-3-sonnet
```

## How it works

- **Context Handling**: Conversations are stored in `.neuralcode/context.json` and loaded on startup
- **Memory**: User preferences are stored in `.neuralcode/preferences.json`
- **AI**: Uses OpenRouter to access various AI models with system prompts that include your preferences and recent conversation history# neuralcode
