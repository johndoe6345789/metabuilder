/**
 * PostgreSQL Plugin - Database admin via postgres project
 *
 * Enables workflow nodes to manage PostgreSQL databases.
 * Integrates with the postgres admin dashboard project.
 */

import { execSync } from 'child_process';
import * as path from 'path';

export const POSTGRES_PATH = path.resolve(__dirname, '../../../../postgres');

export interface PostgresConnectionConfig {
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
}

export interface PostgresQueryInput extends PostgresConnectionConfig {
  query: string;
}

export interface PostgresQueryOutput {
  success: boolean;
  rows?: Record<string, unknown>[];
  rowCount?: number;
  error?: string;
}

export interface PostgresTableInfo {
  name: string;
  schema: string;
  rowCount?: number;
  columns?: Array<{
    name: string;
    type: string;
    nullable: boolean;
  }>;
}

/**
 * Build connection string from config
 */
function buildConnectionString(config: PostgresConnectionConfig): string {
  const {
    host = 'localhost',
    port = 5432,
    database = 'postgres',
    user = 'postgres',
    password,
  } = config;

  if (password) {
    return `postgresql://${user}:${password}@${host}:${port}/${database}`;
  }
  return `postgresql://${user}@${host}:${port}/${database}`;
}

/**
 * Execute a SQL query
 */
export async function postgresQuery(input: PostgresQueryInput): Promise<PostgresQueryOutput> {
  const { query, ...config } = input;
  const connStr = buildConnectionString(config);

  try {
    // Use psql with JSON output
    const cmd = `psql "${connStr}" -t -A -c "SELECT json_agg(t) FROM (${query.replace(/"/g, '\\"')}) t"`;
    const output = execSync(cmd, { encoding: 'utf-8' }).trim();

    if (!output || output === 'null') {
      return { success: true, rows: [], rowCount: 0 };
    }

    const rows = JSON.parse(output);
    return {
      success: true,
      rows,
      rowCount: rows.length,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Execute a SQL command (INSERT, UPDATE, DELETE, etc.)
 */
export async function postgresExecute(input: PostgresQueryInput): Promise<{
  success: boolean;
  affectedRows?: number;
  error?: string;
}> {
  const { query, ...config } = input;
  const connStr = buildConnectionString(config);

  try {
    const output = execSync(`psql "${connStr}" -c "${query.replace(/"/g, '\\"')}"`, {
      encoding: 'utf-8',
    });

    // Parse affected rows from output like "UPDATE 5"
    const match = output.match(/(\d+)$/m);
    const affectedRows = match ? parseInt(match[1], 10) : 0;

    return { success: true, affectedRows };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * List all tables in the database
 */
export async function postgresListTables(
  config: PostgresConnectionConfig
): Promise<{ success: boolean; tables?: PostgresTableInfo[]; error?: string }> {
  const result = await postgresQuery({
    ...config,
    query: `
      SELECT
        table_schema as schema,
        table_name as name
      FROM information_schema.tables
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY table_schema, table_name
    `,
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  const tables = (result.rows || []).map((row) => ({
    name: row.name as string,
    schema: row.schema as string,
  }));

  return { success: true, tables };
}

/**
 * Get table schema/columns
 */
export async function postgresDescribeTable(
  input: PostgresConnectionConfig & { table: string; schema?: string }
): Promise<{ success: boolean; columns?: Array<{ name: string; type: string; nullable: boolean }>; error?: string }> {
  const { table, schema = 'public', ...config } = input;

  const result = await postgresQuery({
    ...config,
    query: `
      SELECT
        column_name as name,
        data_type as type,
        is_nullable = 'YES' as nullable
      FROM information_schema.columns
      WHERE table_schema = '${schema}' AND table_name = '${table}'
      ORDER BY ordinal_position
    `,
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  const columns = (result.rows || []).map((row) => ({
    name: row.name as string,
    type: row.type as string,
    nullable: row.nullable as boolean,
  }));

  return { success: true, columns };
}

/**
 * Check database connection
 */
export async function postgresCheckConnection(
  config: PostgresConnectionConfig
): Promise<{ success: boolean; version?: string; error?: string }> {
  const result = await postgresQuery({
    ...config,
    query: 'SELECT version()',
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  const version = result.rows?.[0]?.version as string;
  return { success: true, version };
}

/**
 * Create a database backup
 */
export async function postgresBackup(
  input: PostgresConnectionConfig & { outputPath: string }
): Promise<{ success: boolean; backupPath?: string; error?: string }> {
  const { outputPath, ...config } = input;
  const connStr = buildConnectionString(config);

  try {
    execSync(`pg_dump "${connStr}" > "${outputPath}"`, { encoding: 'utf-8' });
    return { success: true, backupPath: outputPath };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Node definitions for workflow engine
export const postgresNodes = {
  'postgres.query': {
    description: 'Execute a SQL query and return results',
    inputs: ['query', 'host', 'port', 'database', 'user', 'password'],
    outputs: ['success', 'rows', 'rowCount', 'error'],
    execute: postgresQuery,
  },
  'postgres.execute': {
    description: 'Execute a SQL command (INSERT, UPDATE, DELETE)',
    inputs: ['query', 'host', 'port', 'database', 'user', 'password'],
    outputs: ['success', 'affectedRows', 'error'],
    execute: postgresExecute,
  },
  'postgres.listTables': {
    description: 'List all tables in the database',
    inputs: ['host', 'port', 'database', 'user', 'password'],
    outputs: ['success', 'tables', 'error'],
    execute: postgresListTables,
  },
  'postgres.describeTable': {
    description: 'Get table schema/columns',
    inputs: ['table', 'schema', 'host', 'port', 'database', 'user', 'password'],
    outputs: ['success', 'columns', 'error'],
    execute: postgresDescribeTable,
  },
  'postgres.checkConnection': {
    description: 'Check database connection',
    inputs: ['host', 'port', 'database', 'user', 'password'],
    outputs: ['success', 'version', 'error'],
    execute: postgresCheckConnection,
  },
  'postgres.backup': {
    description: 'Create a database backup',
    inputs: ['outputPath', 'host', 'port', 'database', 'user', 'password'],
    outputs: ['success', 'backupPath', 'error'],
    execute: postgresBackup,
  },
};
