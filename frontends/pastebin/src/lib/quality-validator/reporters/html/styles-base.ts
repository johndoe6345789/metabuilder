/**
 * Base, layout and typography CSS styles for HTML reports
 */

import { COLOR_SCHEME } from '../../utils/constants.js';

export function getResetStyles(): string {
  return `
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    Oxygen, Ubuntu, Cantarell, sans-serif;
  background: #f5f5f5; color: #333; line-height: 1.6;
}
html { scroll-behavior: smooth; }`;
}

export function getLayoutStyles(): string {
  return `
.container { max-width: 1200px; margin: 0 auto; }
.main { padding: 20px; }
.section { margin-bottom: 40px; }
.section h2 {
  margin-bottom: 20px; font-size: 1.5em; color: #333;
  border-bottom: 2px solid ${COLOR_SCHEME.PRIMARY};
  padding-bottom: 10px;
}
.section h3 { margin-bottom: 15px; font-size: 1.2em; color: #555; }`;
}

export function getTypographyStyles(): string {
  return `
h1 { font-size: 2em; margin-bottom: 10px; }
h2 { font-size: 1.5em; margin-bottom: 15px; }
h3 { font-size: 1.2em; margin-bottom: 10px; }
h4 { font-size: 1.05em; margin-bottom: 8px; }
p { margin-bottom: 10px; }
strong { font-weight: 600; }
code {
  background: #f4f4f4; padding: 2px 6px; border-radius: 3px;
  font-family: 'Courier New', monospace; font-size: 0.95em;
}
pre {
  background: #f4f4f4; padding: 12px; border-radius: 4px;
  overflow-x: auto; margin-bottom: 15px;
}
pre code { background: none; padding: 0; }
a { color: ${COLOR_SCHEME.PRIMARY}; text-decoration: none; }
a:hover { text-decoration: underline; }`;
}

export function getHeaderStyles(): string {
  return `
.header {
  background: linear-gradient(135deg,
    ${COLOR_SCHEME.PRIMARY} 0%, ${COLOR_SCHEME.SECONDARY} 100%);
  color: white; padding: 40px 20px; margin-bottom: 30px;
}
.header-content h1 { font-size: 2em; margin-bottom: 10px; }
.project-name, .timestamp {
  opacity: 0.9; font-size: 0.95em; margin: 5px 0;
}`;
}

export function getFooterStyles(): string {
  return `
.footer {
  background: #f5f5f5; padding: 20px; text-align: center;
  color: #666; border-top: 1px solid #ddd; margin-top: 40px;
}
.footer-meta { font-size: 0.9em; color: #999; margin-top: 10px; }`;
}
