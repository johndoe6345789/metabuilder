/**
 * HTML Report Header Module
 * Generates the HTML document structure, meta tags, and header section
 */

import { getStyles } from './HtmlStyleSheet.js';

/**
 * Generate the complete HTML head section
 *
 * @param {string} projectName - Name of the project
 * @param {string} timestamp - ISO timestamp of report generation
 * @returns {string} HTML head element with meta tags and styles
 *
 * @description
 * Creates a standards-compliant HTML head with:
 * - Character encoding and viewport meta tags
 * - SEO meta tags
 * - Embedded CSS stylesheet
 * - Document title
 */
export function generateHead(projectName: string, timestamp: string): string {
  const formattedDate = timestamp.substring(0, 10);
  const css = getStyles();

  return `<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Quality validation report for ${projectName}">
  <meta name="generator" content="Quality Validator v1.0.0">
  <meta name="created" content="${timestamp}">
  <title>Quality Validation Report - ${formattedDate}</title>
  <style>${css}</style>
</head>`;
}

/**
 * Generate the HTML header body section
 *
 * @param {string} projectName - Name of the project
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} HTML header element with project info
 *
 * @description
 * Creates the visual header with gradient background containing:
 * - Main title
 * - Project name
 * - Generation timestamp
 */
export function generateHeaderBody(projectName: string, timestamp: string): string {
  return `<header class="header">
  <div class="header-content">
    <h1>Quality Validation Report</h1>
    <p class="project-name">Project: ${projectName}</p>
    <p class="timestamp">Generated: ${timestamp}</p>
  </div>
</header>`;
}

/**
 * Generate the HTML document opening tags and structure
 *
 * @param {string} projectName - Project name for title
 * @param {string} timestamp - Timestamp for generation time
 * @returns {string} Opening HTML and head section
 *
 * @description
 * Creates the complete document header with DOCTYPE and opening body tag
 */
export function generateOpeningTags(projectName: string, timestamp: string): string {
  return `<!DOCTYPE html>
<html lang="en">
${generateHead(projectName, timestamp)}
<body>
  <div class="container">
${generateHeaderBody(projectName, timestamp)}
    <main class="main">`;
}

/**
 * Generate the footer tag and closing HTML
 *
 * @returns {string} Closing HTML tags
 */
export function generateClosingTags(): string {
  return `    </main>
  </div>
</body>
</html>`;
}
