import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { getSession } from '@/utils/session';

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tableName, page = 1, limit = 50 } = await request.json();

    if (!tableName) {
      return NextResponse.json({ error: 'Table name is required' }, { status: 400 });
    }

    const tablesResult = await db.execute(sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = ${tableName}
    `);

    if (tablesResult.rows.length === 0) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    const validatedTableName = (tablesResult.rows[0] as any).table_name;
    const offset = (Math.max(1, page) - 1) * limit;

    // Get schema-defined column order
    const colsResult = await db.execute(sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ${validatedTableName}
      ORDER BY ordinal_position
    `);
    const orderedCols = colsResult.rows.map((r: any) => r.column_name as string);

    // Total row count
    const countResult = await db.execute(
      sql.raw(`SELECT COUNT(*) AS count FROM "${validatedTableName}"`),
    );
    const totalCount = parseInt((countResult.rows[0] as any).count, 10);

    // Paginated data
    const result = await db.execute(
      sql.raw(`SELECT * FROM "${validatedTableName}" LIMIT ${limit} OFFSET ${offset}`),
    );

    // Reorder fields to match ordinal_position
    const fieldMap = new Map((result.fields ?? []).map((f: any) => [f.name, f]));
    const orderedFields = orderedCols.map(col => fieldMap.get(col)).filter(Boolean);
    const fields = (orderedFields.length > 0 ? orderedFields : result.fields ?? [])
      .map((f: any) => ({ name: f.name, dataTypeID: f.dataTypeID }));

    return NextResponse.json({
      rows: result.rows,
      rowCount: result.rowCount ?? result.rows.length,
      totalCount,
      page,
      limit,
      fields,
    });
  } catch (error: any) {
    console.error('Table query error:', error);
    return NextResponse.json(
      { error: error.message || 'Query failed' },
      { status: 500 },
    );
  }
}
