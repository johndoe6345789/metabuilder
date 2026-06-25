/**
 * CLI and command line option types for the Quality Validation tool
 */

// ============================================================================
// COMMAND LINE OPTIONS
// ============================================================================

export interface CommandLineOptions {
  format?: 'console' | 'json' | 'html' | 'csv'
  output?: string
  config?: string
  profile?: string
  verbose?: boolean
  incremental?: boolean
  skipCoverage?: boolean
  skipSecurity?: boolean
  skipArchitecture?: boolean
  skipComplexity?: boolean
  resetHistory?: boolean
  help?: boolean
  version?: boolean
  stdin?: boolean
  noColor?: boolean
  listProfiles?: boolean
  showProfile?: string
  createProfile?: string
}

export interface ParsedCliArgs {
  command: string
  options: CommandLineOptions
  configPath: string
}

export enum ExitCode {
  SUCCESS = 0,
  QUALITY_FAILURE = 1,
  CONFIGURATION_ERROR = 2,
  EXECUTION_ERROR = 3,
  KEYBOARD_INTERRUPT = 130,
}
