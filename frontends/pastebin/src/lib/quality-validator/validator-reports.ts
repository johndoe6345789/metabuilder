/**
 * Report generation for QualityValidator
 */

import { CommandLineOptions, Configuration } from './types/index.js';
import { logger } from './utils/logger.js';
import { writeFile, ensureDirectory } from './utils/fileSystem.js';
import { consoleReporter } from './reporters/ConsoleReporter.js';
import { jsonReporter } from './reporters/JsonReporter.js';
import { htmlReporter } from './reporters/HtmlReporter.js';
import { csvReporter } from './reporters/CsvReporter.js';

export async function generateReports(
  scoringResult: unknown,
  options: CommandLineOptions,
  config: Configuration | null,
): Promise<void> {
  const format =
    options.format || config?.reporting.defaultFormat || 'console';
  const outputPath = options.output;

  if (!options.output || format === 'console') {
    const report = consoleReporter.generate(
      scoringResult as Parameters<typeof consoleReporter.generate>[0],
      !options.noColor,
    );
    console.log(report);
  }

  switch (format) {
    case 'json': {
      const report = jsonReporter.generate(
        scoringResult as Parameters<typeof jsonReporter.generate>[0],
      );
      if (outputPath) {
        writeFile(outputPath, report);
        logger.info(`JSON report written to: ${outputPath}`);
      } else {
        console.log(report);
      }
      break;
    }

    case 'html': {
      const report = htmlReporter.generate(
        scoringResult as Parameters<typeof htmlReporter.generate>[0],
      );
      const p = outputPath || '.quality/report.html';
      ensureDirectory('.quality');
      writeFile(p, report);
      logger.info(`HTML report written to: ${p}`);
      break;
    }

    case 'csv': {
      const report = csvReporter.generate(
        scoringResult as Parameters<typeof csvReporter.generate>[0],
      );
      const p = outputPath || '.quality/report.csv';
      ensureDirectory('.quality');
      writeFile(p, report);
      logger.info(`CSV report written to: ${p}`);
      break;
    }
  }
}
