import { sql } from 'drizzle-orm';
import { Pool } from 'pg';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { getSession } from '@/utils/session';

// Access the underlying pg Pool for parameterized queries
const pool = (db as unknown as { $client: Pool }).$client;

// Sanitize SQL identifier (double-quote escaping)
const qi = (name: string) => `"${name.replace(/"/g, '""')}"`;

async function validateTable(tableName: string): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = ${tableName}
  `);
  return result.rows.length > 0;
}

// Look up the real column names for a table so identifiers built from
// request data can be checked against a whitelist, not just escaped.
async function getValidColumns(tableName: string): Promise<Set<string>> {
  const result = await db.execute(sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = ${tableName}
  `);
  return new Set(result.rows.map((row: any) => row.column_name as string));
}

function findInvalidColumns(columns: string[], validColumns: Set<string>): string[] {
  return columns.filter((col) => !validColumns.has(col));
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { tableName, data } = await request.json();
    if (!tableName || !data) {
      return NextResponse.json({ error: 'Table name and data are required' }, { status: 400 });
    }
    if (!(await validateTable(tableName))) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    const columns = Object.keys(data);
    const values = Object.values(data);
    if (columns.length === 0) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    const validColumns = await getValidColumns(tableName);
    const invalidColumns = findInvalidColumns(columns, validColumns);
    if (invalidColumns.length > 0) {
      return NextResponse.json({ error: `Unknown column(s): ${invalidColumns.join(', ')}` }, { status: 400 });
    }

    const columnList = columns.map(qi).join(', ');
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    const result = await pool.query(
      `INSERT INTO ${qi(tableName)} (${columnList}) VALUES (${placeholders}) RETURNING *`,
      values,
    );

    return NextResponse.json({ success: true, record: result.rows[0] });
  } catch (error: any) {
    console.error('Insert error:', error);
    return NextResponse.json({ error: error.message || 'Failed to insert record' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { tableName, primaryKey, data } = await request.json();
    if (!tableName || !primaryKey || !data) {
      return NextResponse.json(
        { error: 'Table name, primary key, and data are required' },
        { status: 400 },
      );
    }
    if (!(await validateTable(tableName))) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    const columns = Object.keys(data);
    const values = Object.values(data);
    if (columns.length === 0) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    const pkKeys = Object.keys(primaryKey);
    const pkValues = Object.values(primaryKey);

    const validColumns = await getValidColumns(tableName);
    const invalidColumns = findInvalidColumns([...columns, ...pkKeys], validColumns);
    if (invalidColumns.length > 0) {
      return NextResponse.json({ error: `Unknown column(s): ${invalidColumns.join(', ')}` }, { status: 400 });
    }

    const setClause = columns.map((col, i) => `${qi(col)} = $${i + 1}`).join(', ');
    const whereClause = pkKeys.map((k, i) => `${qi(k)} = $${values.length + i + 1}`).join(' AND ');

    const result = await pool.query(
      `UPDATE ${qi(tableName)} SET ${setClause} WHERE ${whereClause} RETURNING *`,
      [...values, ...pkValues],
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, record: result.rows[0] });
  } catch (error: any) {
    console.error('Update error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update record' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { tableName, primaryKey } = await request.json();
    if (!tableName || !primaryKey) {
      return NextResponse.json({ error: 'Table name and primary key are required' }, { status: 400 });
    }
    if (!(await validateTable(tableName))) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    const pkKeys = Object.keys(primaryKey);
    const pkValues = Object.values(primaryKey);

    const validColumns = await getValidColumns(tableName);
    const invalidColumns = findInvalidColumns(pkKeys, validColumns);
    if (invalidColumns.length > 0) {
      return NextResponse.json({ error: `Unknown column(s): ${invalidColumns.join(', ')}` }, { status: 400 });
    }

    const whereClause = pkKeys.map((k, i) => `${qi(k)} = $${i + 1}`).join(' AND ');

    const result = await pool.query(
      `DELETE FROM ${qi(tableName)} WHERE ${whereClause} RETURNING *`,
      pkValues,
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, deletedRecord: result.rows[0] });
  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete record' }, { status: 500 });
  }
}
