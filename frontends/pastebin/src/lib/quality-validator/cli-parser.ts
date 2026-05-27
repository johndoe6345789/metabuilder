import { CommandLineOptions } from './types/index.js';

export function parseCliArgs(args: string[]): CommandLineOptions {
  const options: CommandLineOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--format' && i + 1 < args.length) {
      options.format = args[++i] as any;
    } else if (arg === '--output' && i + 1 < args.length) {
      options.output = args[++i];
    } else if (arg === '--config' && i + 1 < args.length) {
      options.config = args[++i];
    } else if (arg === '--profile' && i + 1 < args.length) {
      options.profile = args[++i];
    } else if (arg === '--list-profiles') {
      options.listProfiles = true;
    } else if (arg === '--show-profile' && i + 1 < args.length) {
      options.showProfile = args[++i];
    } else if (arg === '--create-profile' && i + 1 < args.length) {
      options.createProfile = args[++i];
    } else if (arg === '--verbose') {
      options.verbose = true;
    } else if (arg === '--no-color') {
      options.noColor = true;
    } else if (arg === '--skip-coverage') {
      options.skipCoverage = true;
    } else if (arg === '--skip-security') {
      options.skipSecurity = true;
    } else if (arg === '--skip-architecture') {
      options.skipArchitecture = true;
    } else if (arg === '--skip-complexity') {
      options.skipComplexity = true;
    } else if (arg === '--help') {
      options.help = true;
    } else if (arg === '--version') {
      options.version = true;
    }
  }

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  if (options.version) {
    console.log('Quality Validator v1.0.0');
    process.exit(0);
  }

  return options;
}

export function printHelp(): void {
  console.log(`
Quality Validation CLI Tool v1.0.0

Usage: quality-validator [options]

Options:
  --format <format>        Output format: console, json, html, csv
  --output <file>          Output file path
  --config <file>          Configuration file path (.qualityrc.json)
  --profile <name>         Quality profile: strict, moderate, lenient
  --verbose                Enable verbose logging
  --no-color               Disable colored output
  --skip-coverage          Skip test coverage analysis
  --skip-security          Skip security analysis
  --skip-architecture      Skip architecture analysis
  --skip-complexity        Skip complexity analysis

Profile Management:
  --list-profiles          List all available profiles
  --show-profile <name>    Show details of a specific profile
  --create-profile <name>  Create a new custom profile

General:
  --help                   Display this help message
  --version                Display version number

Examples:
  quality-validator
  quality-validator --profile strict
  quality-validator --profile lenient --format json --output report.json
  quality-validator --list-profiles
  quality-validator --show-profile moderate
  quality-validator --format html --output coverage/report.html

Environment Variables:
  QUALITY_PROFILE=moderate     Set default profile
  NODE_ENV=production          Use environment-specific profiles
  `);
}
