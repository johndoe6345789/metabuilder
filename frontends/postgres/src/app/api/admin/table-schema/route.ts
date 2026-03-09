import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { getSession } from '@/utils/session';

export async function POST(request: Request) {
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

    // Validate table exists
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

    // Get column information
    const columnsResult = await db.execute(sql`
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = ${tableName}
      ORDER BY ordinal_position
    `);

    // Get primary key information
    const pkResult = await db.execute(sql`
      SELECT kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name = ${tableName}
    `);

    // Get foreign key information
    const fkResult = await db.execute(sql`
      SELECT
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name = ${tableName}
    `);

    const primaryKeys = pkResult.rows.map((row: any) => row.column_name);
    const foreignKeys = fkResult.rows.map((row: any) => ({
      column: row.column_name,
      foreignTable: row.foreign_table_name,
      foreignColumn: row.foreign_column_name,
    }));

    return NextResponse.json({
      columns: columnsResult.rows,
      primaryKeys,
      foreignKeys,
    });
  } catch (error: any) {
    console.error('Schema query error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch schema' },
      { status: 500 },
    );
  }
}
