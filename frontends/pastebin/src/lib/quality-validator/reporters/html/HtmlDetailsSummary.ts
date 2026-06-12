/**
 * HTML findings summary table and styles
 */

import { Finding } from '../../types/index.js'
import { escapeHtml } from '../../utils/formatters.js'

export function generateFindingsSummaryTable(findings: Finding[]): string {
  const byCategory: Record<string, Record<string, number>> = {}

  for (const finding of findings) {
    if (!byCategory[finding.category]) {
      byCategory[finding.category] = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0,
      }
    }
    byCategory[finding.category][finding.severity]++
  }

  let html = `<section class="section">
  <h2>Findings Summary</h2>
  <table class="findings-table">
    <thead>
      <tr>
        <th>Category</th>
        <th>Critical</th>
        <th>High</th>
        <th>Medium</th>
        <th>Low</th>
        <th>Info</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>`

  for (const [category, counts] of Object.entries(byCategory)) {
    const total =
      counts.critical + counts.high + counts.medium + counts.low + counts.info
    html += `
      <tr>
        <td>${escapeHtml(category)}</td>
        <td>${counts.critical}</td>
        <td>${counts.high}</td>
        <td>${counts.medium}</td>
        <td>${counts.low}</td>
        <td>${counts.info}</td>
        <td><strong>${total}</strong></td>
      </tr>`
  }

  html += `
    </tbody>
  </table>
</section>`

  return html
}

export function getTableStyles(): string {
  return `
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}
table thead {
  background: #f5f5f5;
}
table th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #ddd;
}
table td {
  padding: 10px 12px;
  border-bottom: 1px solid #eee;
}
table tbody tr:hover {
  background: #f9f9f9;
}
  `
}
