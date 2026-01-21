/**
 * CSV Reporter
 * Generates CSV export for spreadsheet analysis
 */
/**
 * CSV Reporter
 */
export class CsvReporter {
    /**
     * Generate CSV report
     */
    generate(result) {
        const lines = [];
        // Summary section
        lines.push('# Quality Validation Report Summary');
        lines.push(`"Timestamp","${result.metadata.timestamp}"`);
        lines.push(`"Overall Score","${result.overall.score.toFixed(1)}%"`);
        lines.push(`"Grade","${result.overall.grade}"`);
        lines.push(`"Status","${result.overall.status.toUpperCase()}"`);
        lines.push('');
        // Component scores
        lines.push('# Component Scores');
        lines.push('"Component","Score","Weight","Weighted Score"');
        const scores = [
            {
                name: 'Code Quality',
                score: result.componentScores.codeQuality.score,
                weight: result.componentScores.codeQuality.weight,
                weighted: result.componentScores.codeQuality.weightedScore,
            },
            {
                name: 'Test Coverage',
                score: result.componentScores.testCoverage.score,
                weight: result.componentScores.testCoverage.weight,
                weighted: result.componentScores.testCoverage.weightedScore,
            },
            {
                name: 'Architecture',
                score: result.componentScores.architecture.score,
                weight: result.componentScores.architecture.weight,
                weighted: result.componentScores.architecture.weightedScore,
            },
            {
                name: 'Security',
                score: result.componentScores.security.score,
                weight: result.componentScores.security.weight,
                weighted: result.componentScores.security.weightedScore,
            },
        ];
        for (const score of scores) {
            lines.push(`"${score.name}","${score.score.toFixed(1)}%","${(score.weight * 100).toFixed(0)}%","${score.weighted.toFixed(1)}%"`);
        }
        lines.push('');
        // Findings
        lines.push('# Findings');
        lines.push('"Severity","Category","Title","File","Line","Description","Remediation"');
        for (const finding of result.findings) {
            const file = finding.location?.file || '';
            const line = finding.location?.line ? finding.location.line.toString() : '';
            lines.push(`"${finding.severity}","${finding.category}","${this.escapeCsv(finding.title)}","${file}","${line}","${this.escapeCsv(finding.description)}","${this.escapeCsv(finding.remediation)}"`);
        }
        lines.push('');
        // Recommendations
        if (result.recommendations.length > 0) {
            lines.push('# Recommendations');
            lines.push('"Priority","Category","Issue","Remediation","Effort","Impact"');
            for (const rec of result.recommendations) {
                lines.push(`"${rec.priority}","${rec.category}","${this.escapeCsv(rec.issue)}","${this.escapeCsv(rec.remediation)}","${rec.estimatedEffort}","${this.escapeCsv(rec.expectedImpact)}"`);
            }
            lines.push('');
        }
        // Trend
        if (result.trend) {
            lines.push('# Trend');
            lines.push('"Metric","Value"');
            lines.push(`"Current Score","${result.trend.currentScore.toFixed(1)}%"`);
            if (result.trend.previousScore !== undefined) {
                lines.push(`"Previous Score","${result.trend.previousScore.toFixed(1)}%"`);
                const change = result.trend.currentScore - result.trend.previousScore;
                lines.push(`"Change","${change >= 0 ? '+' : ''}${change.toFixed(1)}%"`);
            }
            if (result.trend.direction) {
                lines.push(`"Direction","${result.trend.direction}"`);
            }
        }
        return lines.join('\n');
    }
    /**
     * Escape CSV field
     */
    escapeCsv(field) {
        if (!field)
            return '';
        // Escape quotes and wrap in quotes if needed
        return field.replace(/"/g, '""');
    }
}
export const csvReporter = new CsvReporter();
