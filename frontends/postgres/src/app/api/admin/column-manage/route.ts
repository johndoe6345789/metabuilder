import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { getSession } from '@/utils/session';

// Validate identifier format (prevent SQL injection)
function isValidIdentifier(name: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
}

// Validate table exists
async function validateTable(tableName: string): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = ${tableName}
  `);
  return result.rows.length > 0;
}

// ADD COLUMN
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const { tableName, columnName, dataType, nullable, defaultValue } = await request.json();

    if (!tableName || !columnName || !dataType) {
      return NextResponse.json(
        { error: 'Table name, column name, and data type are required' },
        { status: 400 },
      );
    }

    // Validate identifiers
    if (!isValidIdentifier(tableName) || !isValidIdentifier(columnName)) {
      return NextResponse.json(
        { error: 'Invalid table or column name format' },
        { status: 400 },
      );
    }

    // Validate table exists
    if (!(await validateTable(tableName))) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 },
      );
    }

    let alterQuery = `ALTER TABLE "${tableName}" ADD COLUMN "${columnName}" ${dataType}`;

    if (!nullable) {
      alterQuery += ' NOT NULL';
    }

    if (defaultValue !== undefined && defaultValue !== null) {
      if (typeof defaultValue === 'string') {
        alterQuery += ` DEFAULT '${defaultValue}'`;
      } else {
        alterQuery += ` DEFAULT ${defaultValue}`;
      }
    }

    await db.execute(sql.raw(alterQuery));

    return NextResponse.json({
      success: true,
      message: `Column '${columnName}' added successfully`,
    });
  } catch (error: any) {
    console.error('Add column error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add column' },
      { status: 500 },
    );
  }
}

// DROP COLUMN
export async function DELETE(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const { tableName, columnName } = await request.json();

    if (!tableName || !columnName) {
      return NextResponse.json(
        { error: 'Table name and column name are required' },
        { status: 400 },
      );
    }

    // Validate identifiers
    if (!isValidIdentifier(tableName) || !isValidIdentifier(columnName)) {
      return NextResponse.json(
        { error: 'Invalid table or column name format' },
        { status: 400 },
      );
    }

    // Validate table exists
    if (!(await validateTable(tableName))) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 },
      );
    }

    const alterQuery = `ALTER TABLE "${tableName}" DROP COLUMN "${columnName}"`;
    await db.execute(sql.raw(alterQuery));

    return NextResponse.json({
      success: true,
      message: `Column '${columnName}' dropped successfully`,
    });
  } catch (error: any) {
    console.error('Drop column error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to drop column' },
      { status: 500 },
    );
  }
}

// MODIFY COLUMN
export async function PUT(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const { tableName, columnName, newType, nullable } = await request.json();

    if (!tableName || !columnName) {
      return NextResponse.json(
        { error: 'Table name and column name are required' },
        { status: 400 },
      );
    }

    // Validate identifiers
    if (!isValidIdentifier(tableName) || !isValidIdentifier(columnName)) {
      return NextResponse.json(
        { error: 'Invalid table or column name format' },
        { status: 400 },
      );
    }

    // Validate table exists
    if (!(await validateTable(tableName))) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 },
      );
    }

    const alterQueries = [];

    if (newType) {
      alterQueries.push(`ALTER TABLE "${tableName}" ALTER COLUMN "${columnName}" TYPE ${newType}`);
    }

    if (nullable !== undefined) {
      if (nullable) {
        alterQueries.push(`ALTER TABLE "${tableName}" ALTER COLUMN "${columnName}" DROP NOT NULL`);
      } else {
        alterQueries.push(`ALTER TABLE "${tableName}" ALTER COLUMN "${columnName}" SET NOT NULL`);
      }
    }

    if (alterQueries.length === 0) {
      return NextResponse.json(
        { error: 'No modifications specified' },
        { status: 400 },
      );
    }

    for (const query of alterQueries) {
      await db.execute(sql.raw(query));
    }

    return NextResponse.json({
      success: true,
      message: `Column '${columnName}' modified successfully`,
    });
  } catch (error: any) {
    console.error('Modify column error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to modify column' },
      { status: 500 },
    );
  }
}
