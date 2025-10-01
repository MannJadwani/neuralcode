"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCodeActions = parseCodeActions;
exports.executeCodeActions = executeCodeActions;
const files_1 = require("./files");
const commands_1 = require("./commands");
function parseCodeActions(response) {
    const actions = [];
    // Parse file creation: ```filename.ext\ncontent\n```
    const fileCreationRegex = /```([\w\.\-\/]+)\n([\s\S]*?)```/g;
    let match;
    while ((match = fileCreationRegex.exec(response)) !== null) {
        const [, filePath, content] = match;
        if (filePath && content) {
            actions.push({
                type: 'create_file',
                filePath,
                content: content.trim()
            });
        }
    }
    // Parse file editing: EDIT filename.ext: old_string -> new_string
    const editRegex = /EDIT\s+([\w\.\-\/]+):\s*`([^`]*)`\s*->\s*`([^`]*)`/g;
    while ((match = editRegex.exec(response)) !== null) {
        const [, filePath, oldString, newString] = match;
        if (filePath && oldString && newString) {
            actions.push({
                type: 'edit_file',
                filePath,
                oldString,
                newString
            });
        }
    }
    // Parse commands: RUN command
    const commandRegex = /RUN\s+(.+)/g;
    while ((match = commandRegex.exec(response)) !== null) {
        const [, command] = match;
        if (command) {
            actions.push({
                type: 'run_command',
                command: command.trim()
            });
        }
    }
    // Parse file reading: READ filename.ext
    const readRegex = /READ\s+([\w\.\-\/]+)/g;
    while ((match = readRegex.exec(response)) !== null) {
        const [, filePath] = match;
        if (filePath) {
            actions.push({
                type: 'read_file',
                filePath
            });
        }
    }
    return actions;
}
async function executeCodeActions(actions) {
    const results = [];
    for (const action of actions) {
        try {
            switch (action.type) {
                case 'create_file':
                    if (!action.filePath || !action.content) {
                        results.push('ERROR: Missing filePath or content for create_file');
                        continue;
                    }
                    const result = await (0, files_1.executeFileOperation)({
                        type: 'write',
                        filePath: action.filePath,
                        content: action.content
                    });
                    results.push(`✅ ${result}`);
                    break;
                case 'edit_file':
                    if (!action.filePath || !action.oldString || !action.newString) {
                        results.push('ERROR: Missing parameters for edit_file');
                        continue;
                    }
                    const editResult = await (0, files_1.executeFileOperation)({
                        type: 'edit',
                        filePath: action.filePath,
                        oldString: action.oldString,
                        newString: action.newString
                    });
                    results.push(`✅ ${editResult}`);
                    break;
                case 'run_command':
                    if (!action.command) {
                        results.push('ERROR: Missing command for run_command');
                        continue;
                    }
                    const cmdResult = await (0, commands_1.executeCommand)(action.command);
                    results.push(`✅ Command executed: ${action.command}`);
                    if (cmdResult.stdout)
                        results.push(`Output:\n${cmdResult.stdout}`);
                    if (cmdResult.stderr)
                        results.push(`Errors:\n${cmdResult.stderr}`);
                    break;
                case 'read_file':
                    if (!action.filePath) {
                        results.push('ERROR: Missing filePath for read_file');
                        continue;
                    }
                    const content = await (0, files_1.executeFileOperation)({
                        type: 'read',
                        filePath: action.filePath
                    });
                    results.push(`📄 Content of ${action.filePath}:\n${content}`);
                    break;
                default:
                    results.push(`ERROR: Unknown action type: ${action.type}`);
            }
        }
        catch (error) {
            results.push(`❌ Error executing ${action.type}: ${error.message}`);
        }
    }
    return results;
}
//# sourceMappingURL=codeActions.js.map