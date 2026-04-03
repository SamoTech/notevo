/**
 * Markdown Extensions for Notevo
 * Laverna features: Task lists, MathJax, Syntax highlighting helpers
 */

/**
 * Toggle task list checkbox in markdown content
 * Laverna feature: Task/Todo list support
 */
export function toggleTaskItem(content: string, lineIndex: number): string {
  const lines = content.split('\n');
  
  if (lineIndex < 0 || lineIndex >= lines.length) {
    return content;
  }

  const line = lines[lineIndex];
  
  // Check if line is a task item
  const uncheckedRegex = /^(\s*[-*+]\s+)\[\s*\](.*)$/;
  const checkedRegex = /^(\s*[-*+]\s+)\[x\](.*)$/i;

  if (uncheckedRegex.test(line)) {
    // Mark as completed
    lines[lineIndex] = line.replace(uncheckedRegex, '$1[x]$2');
  } else if (checkedRegex.test(line)) {
    // Mark as incomplete
    lines[lineIndex] = line.replace(checkedRegex, '$1[ ]$2');
  } else {
    // Convert regular list item to task item
    const listItemRegex = /^(\s*[-*+]\s+)(.*)$/;
    if (listItemRegex.test(line)) {
      lines[lineIndex] = line.replace(listItemRegex, '$1[ ] $2');
    }
  }

  return lines.join('\n');
}

/**
 * Parse task items from markdown content
 */
export function parseTaskItems(content: string): Array<{
  lineIndex: number;
  completed: boolean;
  text: string;
}> {
  const tasks: Array<{ lineIndex: number; completed: boolean; text: string }> = [];
  const lines = content.split('\n');
  const taskRegex = /^(\s*[-*+]\s+)\[([ x])\]\s*(.*)$/i;

  lines.forEach((line, index) => {
    const match = line.match(taskRegex);
    if (match) {
      tasks.push({
        lineIndex: index,
        completed: match[2].toLowerCase() === 'x',
        text: match[3] || '',
      });
    }
  });

  return tasks;
}

/**
 * Get task completion statistics
 */
export function getTaskStats(content: string): {
  total: number;
  completed: number;
  pending: number;
  percentage: number;
} {
  const tasks = parseTaskItems(content);
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, completed, pending, percentage };
}

/**
 * Wrap code blocks with language identifier for syntax highlighting
 */
export function ensureCodeBlockLanguage(
  content: string,
  defaultLanguage = 'text'
): string {
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;

  return content.replace(codeBlockRegex, (match, lang, code) => {
    if (!lang || lang.trim() === '') {
      return `\`\`\`${defaultLanguage}\n${code}\`\`\``;
    }
    return match;
  });
}

/**
 * Extract code blocks with their languages
 */
export function extractCodeBlocks(content: string): Array<{
  language: string;
  code: string;
  startIndex: number;
  endIndex: number;
}> {
  const blocks: Array<{
    language: string;
    code: string;
    startIndex: number;
    endIndex: number;
  }> = [];
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    blocks.push({
      language: match[1] || 'text',
      code: match[2],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  return blocks;
}

/**
 * Detect MathJax/LaTeX expressions in content
 */
export function hasMathExpressions(content: string): boolean {
  // Inline math: $...$ or \(...\)
  const inlineMathRegex = /\$[^$]+\$|\\\([^\\]+\\\)/;
  
  // Display math: $$...$$ or \[...\]
  const displayMathRegex = /\$\$[\s\S]*?\$\$|\\\[ [\s\S]*?\\\]/;

  return inlineMathRegex.test(content) || displayMathRegex.test(content);
}

/**
 * Extract MathJax expressions from content
 */
export function extractMathExpressions(content: string): Array<{
  expression: string;
  type: 'inline' | 'display';
  startIndex: number;
}> {
  const expressions: Array<{
    expression: string;
    type: 'inline' | 'display';
    startIndex: number;
  }> = [];

  // Display math first ($$...$$)
  const displayRegex = /\$\$([\s\S]*?)\$\$/g;
  let match;

  while ((match = displayRegex.exec(content)) !== null) {
    expressions.push({
      expression: match[1],
      type: 'display',
      startIndex: match.index,
    });
  }

  // Inline math ($...$) - avoid matching display math
  const inlineRegex = /(?<!\$)\$([^$]+)\$(?!\$)/g;
  while ((match = inlineRegex.exec(content)) !== null) {
    expressions.push({
      expression: match[1],
      type: 'inline',
      startIndex: match.index,
    });
  }

  // LaTeX style \[...\] and \(...\)
  const latexDisplayRegex = /\\\[ ([\s\S]*?)\\\]/g;
  while ((match = latexDisplayRegex.exec(content)) !== null) {
    expressions.push({
      expression: match[1],
      type: 'display',
      startIndex: match.index,
    });
  }

  const latexInlineRegex = /\\\(([^\\]+)\\\)/g;
  while ((match = latexInlineRegex.exec(content)) !== null) {
    expressions.push({
      expression: match[1],
      type: 'inline',
      startIndex: match.index,
    });
  }

  return expressions.sort((a, b) => a.startIndex - b.startIndex);
}

/**
 * Insert markdown formatting at cursor position
 */
export function insertFormatting(
  content: string,
  selectionStart: number,
  selectionEnd: number,
  before: string,
  after: string = ''
): { newContent: string; newSelectionStart: number; newSelectionEnd: number } {
  const selectedText = content.slice(selectionStart, selectionEnd);
  const closeAfter = after || before;

  const newContent =
    content.slice(0, selectionStart) +
    before +
    selectedText +
    closeAfter +
    content.slice(selectionEnd);

  const offset = before.length;
  const newSelectionStart = selectionStart + offset;
  const newSelectionEnd = selectionEnd + offset;

  return {
    newContent,
    newSelectionStart,
    newSelectionEnd,
  };
}

/**
 * Apply heading formatting
 */
export function applyHeading(
  content: string,
  selectionStart: number,
  selectionEnd: number,
  level: 1 | 2 | 3 | 4 | 5 | 6
): { newContent: string; newSelectionStart: number; newSelectionEnd: number } {
  const lines = content.split('\n');
  let charCount = 0;
  let targetLineIndex = -1;

  // Find the line containing the selection
  for (let i = 0; i < lines.length; i++) {
    const lineEnd = charCount + lines[i].length;
    if (selectionStart <= lineEnd) {
      targetLineIndex = i;
      break;
    }
    charCount = lineEnd + 1; // +1 for newline
  }

  if (targetLineIndex === -1) return { newContent: content, newSelectionStart: selectionStart, newSelectionEnd: selectionEnd };

  const line = lines[targetLineIndex];
  const headingPrefix = '#'.repeat(level) + ' ';

  // Remove existing heading prefixes
  const withoutHeading = line.replace(/^#+\s*/, '');
  
  // Add new heading prefix
  lines[targetLineIndex] = headingPrefix + withoutHeading;

  const newContent = lines.join('\n');
  const addedChars = headingPrefix.length - (line.match(/^#+\s*/)?.[0].length || 0);

  return {
    newContent,
    newSelectionStart: selectionStart + addedChars,
    newSelectionEnd: selectionEnd + addedChars,
  };
}

/**
 * Count words in markdown content (excluding code blocks)
 */
export function countWords(content: string): number {
  // Remove code blocks
  const withoutCode = content.replace(/```[\s\S]*?```/g, '');
  
  // Remove inline code
  const withoutInlineCode = withoutCode.replace(/`[^`]+`/g, '');
  
  // Remove URLs
  const withoutUrls = withoutInlineCode.replace(/https?:\/\/\S+/g, '');
  
  // Split by whitespace and filter empty strings
  const words = withoutUrls.split(/\s+/).filter(w => w.length > 0);
  
  return words.length;
}

/**
 * Estimate reading time (assuming 200 words per minute)
 */
export function estimateReadingTime(content: string): number {
  const words = countWords(content);
  return Math.ceil(words / 200);
}
