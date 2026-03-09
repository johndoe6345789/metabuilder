import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { getSession } from '@/utils/session';

// Validate table name format (prevent SQL injection)
function isValidIdentifier(name: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
}

// CREATE TABLE
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const { tableName, columns } = await request.json();

    if (!tableName || !columns || !Array.isArray(columns) || columns.length === 0) {
      return NextResponse.json(
        { error: 'Table name and columns are required' },
        { status: 400 },
      );
    }

    // Validate table name
    if (!isValidIdentifier(tableName)) {
      return NextResponse.json(
        { error: 'Invalid table name format' },
        { status: 400 },
      );
    }

    // Build column definitions
    const columnDefs = columns.map((col: any) => {
      if (!col.name || !col.type) {
        throw new Error('Each column must have a name and type');
      }

      if (!isValidIdentifier(col.name)) {
        throw new Error(`Invalid column name: ${col.name}`);
      }

      let def = `"${col.name}" ${col.type}`;

      if (col.length && (col.type === 'VARCHAR' || col.type === 'CHARACTER VARYING')) {
        def += `(${col.length})`;
      }

      if (col.primaryKey) {
        def += ' PRIMARY KEY';
      }

      if (col.unique) {
        def += ' UNIQUE';
      }

      if (!col.nullable) {
        def += ' NOT NULL';
      }

      if (col.default !== undefined && col.default !== null) {
        if (typeof col.default === 'string') {
          def += ` DEFAULT '${col.default}'`;
        } else {
          def += ` DEFAULT ${col.default}`;
        }
      }

      return def;
    }).join(', ');

    const createQuery = `CREATE TABLE "${tableName}" (${columnDefs})`;
    
    await db.execute(sql.raw(createQuery));

    return NextResponse.json({
      success: true,
      message: `Table '${tableName}' created successfully`,
    });
  } catch (error: any) {
    console.error('Create table error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create table' },
      { status: 500 },
    );
  }
}

// DROP TABLE
export async function DELETE(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const { tableName } = await request.json();

    if (!tableName) {
      return NextResponse.json(
        { error: 'Table name is required' },
        { status: 400 },
      );
    }

    // Validate table name
    if (!isValidIdentifier(tableName)) {
      return NextResponse.json(
        { error: 'Invalid table name format' },
        { status: 400 },
      );
    }

    // Verify table exists
    const tablesResult = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name = ${tableName}
    `);

    if (tablesResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 },
      );
    }

    const dropQuery = `DROP TABLE "${tableName}"`;
    await db.execute(sql.raw(dropQuery));

    return NextResponse.json({
      success: true,
      message: `Table '${tableName}' dropped successfully`,
    });
  } catch (error: any) {
    console.error('Drop table error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to drop table' },
      { status: 500 },
    );
  }
}
