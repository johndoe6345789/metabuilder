import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { getSession } from '@/utils/session';

// Validate identifier (table or column name)
function isValidIdentifier(name: string): boolean {
  return /^[a-z_][a-z0-9_]*$/i.test(name);
}

// Sanitize string value for SQL
function sanitizeValue(value: any): string {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }
  // Escape single quotes for string values
  return `'${String(value).replace(/'/g, '\'\'')}'`;
}

type QueryBuilderParams = {
  table: string;
  columns?: string[];
  where?: Array<{
    column: string;
    operator: string;
    value?: any;
  }>;
  orderBy?: {
    column: string;
    direction: 'ASC' | 'DESC';
  };
  limit?: number;
  offset?: number;
};

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const params: QueryBuilderParams = await request.json();

    // Validate required fields
    if (!params.table) {
      return NextResponse.json(
        { error: 'Table name is required' },
        { status: 400 },
      );
    }

    // Validate table name
    if (!isValidIdentifier(params.table)) {
      return NextResponse.json(
        { error: 'Invalid table name format' },
        { status: 400 },
      );
    }

    // Validate column names if provided
    if (params.columns) {
      for (const col of params.columns) {
        if (!isValidIdentifier(col)) {
          return NextResponse.json(
            { error: `Invalid column name format: ${col}` },
            { status: 400 },
          );
        }
      }
    }

    // Build SELECT clause
    const selectColumns = params.columns && params.columns.length > 0
      ? params.columns.map(col => `"${col}"`).join(', ')
      : '*';

    let query = `SELECT ${selectColumns} FROM "${params.table}"`;

    // Build WHERE clause
    if (params.where && params.where.length > 0) {
      const whereClauses: string[] = [];

      for (const condition of params.where) {
        if (!isValidIdentifier(condition.column)) {
          return NextResponse.json(
            { error: `Invalid column name in WHERE clause: ${condition.column}` },
            { status: 400 },
          );
        }

        const validOperators = ['=', '!=', '>', '<', '>=', '<=', 'LIKE', 'IN', 'IS NULL', 'IS NOT NULL'];
        if (!validOperators.includes(condition.operator)) {
          return NextResponse.json(
            { error: `Invalid operator: ${condition.operator}` },
            { status: 400 },
          );
        }

        const columnName = `"${condition.column}"`;

        if (condition.operator === 'IS NULL' || condition.operator === 'IS NOT NULL') {
          whereClauses.push(`${columnName} ${condition.operator}`);
        } else if (condition.operator === 'IN') {
          if (!Array.isArray(condition.value)) {
            return NextResponse.json(
              { error: 'IN operator requires an array of values' },
              { status: 400 },
            );
          }
          const values = condition.value.map(v => sanitizeValue(v)).join(', ');
          whereClauses.push(`${columnName} IN (${values})`);
        } else {
          if (condition.value === undefined) {
            return NextResponse.json(
              { error: `Value required for operator: ${condition.operator}` },
              { status: 400 },
            );
          }
          whereClauses.push(`${columnName} ${condition.operator} ${sanitizeValue(condition.value)}`);
        }
      }

      if (whereClauses.length > 0) {
        query += ` WHERE ${whereClauses.join(' AND ')}`;
      }
    }

    // Build ORDER BY clause
    if (params.orderBy) {
      if (!isValidIdentifier(params.orderBy.column)) {
        return NextResponse.json(
          { error: `Invalid column name in ORDER BY: ${params.orderBy.column}` },
          { status: 400 },
        );
      }

      const direction = params.orderBy.direction === 'DESC' ? 'DESC' : 'ASC';
      query += ` ORDER BY "${params.orderBy.column}" ${direction}`;
    }

    // Build LIMIT clause
    if (params.limit !== undefined) {
      const limit = Number.parseInt(String(params.limit), 10);
      if (Number.isNaN(limit) || limit < 0) {
        return NextResponse.json(
          { error: 'Invalid LIMIT value' },
          { status: 400 },
        );
      }
      query += ` LIMIT ${limit}`;
    }

    // Build OFFSET clause
    if (params.offset !== undefined) {
      const offset = Number.parseInt(String(params.offset), 10);
      if (Number.isNaN(offset) || offset < 0) {
        return NextResponse.json(
          { error: 'Invalid OFFSET value' },
          { status: 400 },
        );
      }
      query += ` OFFSET ${offset}`;
    }

    // Execute query
    const result = await db.execute(query);

    return NextResponse.json({
      query, // Return the generated query for reference
      rows: result.rows,
      rowCount: result.rowCount,
      fields: result.fields.map(field => ({
        name: field.name,
        dataTypeID: field.dataTypeID,
      })),
    });
  } catch (error: any) {
    console.error('Query builder error:', error);
    return NextResponse.json(
      { error: error.message || 'Query failed' },
      { status: 500 },
    );
  }
}
