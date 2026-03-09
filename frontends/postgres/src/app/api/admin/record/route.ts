import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { getSession } from '@/utils/session';

// Validate table name exists in schema
async function validateTable(tableName: string): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = ${tableName}
  `);
  return result.rows.length > 0;
}

// CREATE - Insert a new record
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const { tableName, data } = await request.json();

    if (!tableName || !data) {
      return NextResponse.json(
        { error: 'Table name and data are required' },
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

    const columns = Object.keys(data);
    const values = Object.values(data);

    if (columns.length === 0) {
      return NextResponse.json(
        { error: 'No data provided' },
        { status: 400 },
      );
    }

    // Build parameterized insert query
    const columnList = columns.map(col => `"${col}"`).join(', ');
    const placeholders = values.map((_, idx) => `$${idx + 1}`).join(', ');
    
    const query = `INSERT INTO "${tableName}" (${columnList}) VALUES (${placeholders}) RETURNING *`;
    
    const result = await db.execute(sql.raw(query));

    return NextResponse.json({
      success: true,
      record: result.rows[0],
    });
  } catch (error: any) {
    console.error('Insert error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to insert record' },
      { status: 500 },
    );
  }
}

// UPDATE - Update an existing record
export async function PUT(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const { tableName, primaryKey, data } = await request.json();

    if (!tableName || !primaryKey || !data) {
      return NextResponse.json(
        { error: 'Table name, primary key, and data are required' },
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

    const columns = Object.keys(data);
    const values = Object.values(data);

    if (columns.length === 0) {
      return NextResponse.json(
        { error: 'No data provided' },
        { status: 400 },
      );
    }

    // Build parameterized update query
    const setClause = columns.map((col, idx) => `"${col}" = $${idx + 1}`).join(', ');
    const whereClause = Object.keys(primaryKey)
      .map((key, idx) => `"${key}" = $${values.length + idx + 1}`)
      .join(' AND ');
    
    const query = `UPDATE "${tableName}" SET ${setClause} WHERE ${whereClause} RETURNING *`;
    
    const result = await db.execute(sql.raw(query));

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      record: result.rows[0],
    });
  } catch (error: any) {
    console.error('Update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update record' },
      { status: 500 },
    );
  }
}

// DELETE - Delete a record
export async function DELETE(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const { tableName, primaryKey } = await request.json();

    if (!tableName || !primaryKey) {
      return NextResponse.json(
        { error: 'Table name and primary key are required' },
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

    // Build parameterized delete query
    const whereClause = Object.keys(primaryKey)
      .map((key, idx) => `"${key}" = $${idx + 1}`)
      .join(' AND ');
    
    const query = `DELETE FROM "${tableName}" WHERE ${whereClause} RETURNING *`;
    
    const result = await db.execute(sql.raw(query));

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      deletedRecord: result.rows[0],
    });
  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete record' },
      { status: 500 },
    );
  }
}
