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

    // Validate table name against schema to prevent SQL injection
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

    // Table name is validated against schema - safe to use the validated name
    // The validation query above ensures the table exists in the public schema
    const validatedTableName = (tablesResult.rows[0] as any).table_name;
    const result = await db.execute(sql.raw(`SELECT * FROM "${validatedTableName}" LIMIT 100`));

    return NextResponse.json({
      rows: result.rows,
      rowCount: result.rowCount,
      fields: result.fields?.map(field => ({
        name: field.name,
        dataTypeID: field.dataTypeID,
      })) || [],
    });
  } catch (error: any) {
    console.error('Table query error:', error);
    return NextResponse.json(
      { error: error.message || 'Query failed' },
      { status: 500 },
    );
  }
}
