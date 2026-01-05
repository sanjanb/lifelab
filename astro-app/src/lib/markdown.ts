/**
 * Markdown Support for Entry Notes
 * 
 * Lightweight markdown rendering with safety and simplicity.
 * Uses marked.js for parsing and DOMPurify for XSS protection.
 * 
 * SUPPORTED SYNTAX:
 * - **bold** and *italic*
 * - [links](url)
 * - # Headings
 * - - Lists
 * - `code`
 * - ```code blocks```
 * 
 * NOT SUPPORTED (intentionally simple):
 * - Images
 * - HTML
 * - Tables
 */

import { marked } from 'marked';
import DOMPurify from 'dompurify';

/**
 * Configure marked for safe, simple markdown
 */
marked.setOptions({
  breaks: true, // Convert \n to <br>
  gfm: true, // GitHub Flavored Markdown
  headerIds: false, // No automatic IDs
  mangle: false, // Don't mangle email addresses
});

/**
 * Render markdown to safe HTML
 * 
 * @param markdown - Raw markdown text
 * @returns Safe HTML string
 */
export function renderMarkdown(markdown: string): string {
  if (!markdown || typeof markdown !== 'string') {
    return '';
  }

  try {
    // Parse markdown to HTML
    const rawHTML = marked.parse(markdown) as string;
    
    // Sanitize HTML to prevent XSS
    const cleanHTML = DOMPurify.sanitize(rawHTML, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 'code', 'pre',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'a', 'blockquote'
      ],
      ALLOWED_ATTR: ['href', 'title'],
      ALLOW_DATA_ATTR: false,
    });

    return cleanHTML;
  } catch (error) {
    console.error('Markdown rendering error:', error);
    return escapeHTML(markdown);
  }
}

/**
 * Escape HTML entities (fallback)
 */
function escapeHTML(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Check if text contains markdown syntax
 * 
 * @param text - Text to check
 * @returns True if markdown syntax detected
 */
export function hasMarkdownSyntax(text: string): boolean {
  if (!text) return false;

  const markdownPatterns = [
    /\*\*[^*]+\*\*/,  // Bold
    /\*[^*]+\*/,      // Italic
    /\[[^\]]+\]\([^)]+\)/, // Links
    /^#{1,6}\s/m,     // Headings
    /^[-*+]\s/m,      // Lists
    /`[^`]+`/,        // Code
    /```[\s\S]*```/,  // Code blocks
  ];

  return markdownPatterns.some((pattern) => pattern.test(text));
}

/**
 * Strip markdown formatting (convert to plain text)
 * 
 * @param markdown - Markdown text
 * @returns Plain text
 */
export function stripMarkdown(markdown: string): string {
  if (!markdown) return '';

  return markdown
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
    .replace(/\*([^*]+)\*/g, '$1')     // Italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
    .replace(/^#{1,6}\s+/gm, '')       // Headings
    .replace(/^[-*+]\s+/gm, '')        // Lists
    .replace(/`([^`]+)`/g, '$1')       // Inline code
    .replace(/```[\s\S]*?```/g, '')    // Code blocks
    .trim();
}

/**
 * Get markdown preview (first N characters without formatting)
 * 
 * @param markdown - Markdown text
 * @param length - Max length
 * @returns Preview text
 */
export function getMarkdownPreview(markdown: string, length = 100): string {
  const plain = stripMarkdown(markdown);
  return plain.length > length ? plain.slice(0, length) + '...' : plain;
}

/**
 * Markdown cheat sheet
 */
export const MARKDOWN_HELP = `
**Bold** → \`**text**\`
*Italic* → \`*text*\`
[Link](url) → \`[text](url)\`
# Heading → \`# text\`
- List → \`- item\`
\`Code\` → \`\`code\`\`
`.trim();

/**
 * Validate markdown (check for security issues)
 * 
 * @param markdown - Markdown to validate
 * @returns Validation result
 */
export function validateMarkdown(markdown: string): {
  valid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  // Check length
  if (markdown.length > 10000) {
    warnings.push('Content is very long (>10,000 characters)');
  }

  // Check for suspicious patterns
  if (/<script/i.test(markdown)) {
    warnings.push('Contains <script> tag (will be removed)');
  }

  if (/javascript:/i.test(markdown)) {
    warnings.push('Contains javascript: protocol (will be removed)');
  }

  if (/on\w+=/i.test(markdown)) {
    warnings.push('Contains event handlers (will be removed)');
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}
