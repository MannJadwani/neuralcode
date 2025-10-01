import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';

export interface TodoItem {
  id: string;
  content: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  completedAt?: Date;
  codeActions?: any[]; // Store code actions for this todo
}

export interface TodoList {
  id: string;
  title: string;
  description?: string | undefined;
  items: TodoItem[];
  createdAt: Date;
  currentItemId?: string | undefined;
}

const TODO_DIR = '.neuralcode';
const TODO_FILE = path.join(TODO_DIR, 'todos.json');

export async function loadTodoLists(): Promise<TodoList[]> {
  try {
    await fs.ensureDir(TODO_DIR);
    if (await fs.pathExists(TODO_FILE)) {
      const data = await fs.readJson(TODO_FILE);
      // Convert date strings back to Date objects
      return data.map((list: any) => ({
        ...list,
        createdAt: new Date(list.createdAt),
        items: list.items.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          completedAt: item.completedAt ? new Date(item.completedAt) : undefined
        }))
      }));
    }
  } catch (error) {
    console.error('Error loading todo lists:', error);
  }
  return [];
}

export async function saveTodoLists(lists: TodoList[]): Promise<void> {
  try {
    await fs.ensureDir(TODO_DIR);
    await fs.writeJson(TODO_FILE, lists, { spaces: 2 });
  } catch (error) {
    console.error('Error saving todo lists:', error);
  }
}

export function createTodoList(title: string, description?: string): TodoList {
  return {
    id: generateId(),
    title,
    description,
    items: [],
    createdAt: new Date()
  };
}

export function addTodoItem(list: TodoList, content: string, priority: 'low' | 'medium' | 'high' = 'medium'): TodoItem {
  const item: TodoItem = {
    id: generateId(),
    content,
    status: 'pending',
    priority,
    createdAt: new Date()
  };
  list.items.push(item);
  return item;
}

export function updateTodoStatus(list: TodoList, itemId: string, status: TodoItem['status']): boolean {
  const item = list.items.find(i => i.id === itemId);
  if (item) {
    item.status = status;
    if (status === 'completed') {
      item.completedAt = new Date();
    }
    return true;
  }
  return false;
}

export function getCurrentItem(list: TodoList): TodoItem | undefined {
  return list.items.find(item => item.status === 'in_progress') ||
         list.items.find(item => item.status === 'pending');
}

export function setCurrentItem(list: TodoList, itemId: string): boolean {
  // Mark all items as pending first
  list.items.forEach(item => {
    if (item.status === 'in_progress') {
      item.status = 'pending';
    }
  });

  const item = list.items.find(i => i.id === itemId);
  if (item && item.status === 'pending') {
    item.status = 'in_progress';
    list.currentItemId = itemId;
    return true;
  }
  return false;
}

export function getActiveTodoList(lists: TodoList[]): TodoList | undefined {
  // Return the most recently created list that has pending or in-progress items
  const activeLists = lists.filter(list =>
    list.items.some(item => item.status === 'pending' || item.status === 'in_progress')
  );

  if (activeLists.length === 0) return undefined;

  // Sort by creation date, most recent first
  activeLists.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return activeLists[0];
}

export function parseTodoListFromResponse(response: string): { title: string; items: string[] } | null {
  // Look for todo list format in AI response
  const todoRegex = /TODO(?:LIST)?:?\s*([^\n]+)(?:\n(?:-|\d+\.)\s*(.+))+/gi;
  const match = todoRegex.exec(response);

  if (!match) return null;

  const title = match[1]?.trim() || 'Todo List';
  const items: string[] = [];

  // Extract items from the response
  const lines = response.split('\n');
  let inTodoSection = false;

  for (const line of lines) {
    if (line.toUpperCase().includes('TODO') && line.includes(title)) {
      inTodoSection = true;
      continue;
    }

    if (inTodoSection) {
      const itemMatch = line.match(/^(?:-|\d+\.)\s*(.+)$/);
      if (itemMatch && itemMatch[1]) {
        items.push(itemMatch[1].trim());
      } else if (line.trim() === '' && items.length > 0) {
        // Empty line after items, end of todo section
        break;
      }
    }
  }

  return items.length > 0 ? { title, items } : null;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function formatTodoList(list: TodoList): string {
  let output = chalk.bold.blue(`📋 ${list.title}\n`);
  if (list.description) {
    output += chalk.gray(`${list.description}\n`);
  }
  output += '\n';

  list.items.forEach((item, index) => {
    const statusIcon = getStatusIcon(item.status);
    const priorityColor = getPriorityColor(item.priority);
    const itemNumber = (index + 1).toString().padStart(2, ' ');

    output += `${itemNumber}. ${statusIcon} ${priorityColor(item.content)}\n`;
  });

  const completed = list.items.filter(i => i.status === 'completed').length;
  const total = list.items.length;
  output += chalk.gray(`\nProgress: ${completed}/${total} completed`);

  return output;
}

function getStatusIcon(status: TodoItem['status']): string {
  switch (status) {
    case 'completed': return chalk.green('✅');
    case 'in_progress': return chalk.yellow('🔄');
    case 'cancelled': return chalk.red('❌');
    default: return chalk.gray('⏳');
  }
}

function getPriorityColor(priority: TodoItem['priority']): (text: string) => string {
  switch (priority) {
    case 'high': return chalk.red;
    case 'medium': return chalk.yellow;
    case 'low': return chalk.gray;
    default: return (text: string) => text;
  }
}