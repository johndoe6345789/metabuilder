import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { getSession } from '@/utils/session';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const result = await db.execute(`
      SELECT t.table_name,
             COALESCE(s.n_live_tup, 0)::bigint AS row_count
      FROM information_schema.tables t
      LEFT JOIN pg_stat_user_tables s
        ON s.relname = t.table_name AND s.schemaname = 'public'
      WHERE t.table_schema = 'public'
      ORDER BY t.table_name
    `);

    return NextResponse.json({ tables: result.rows });
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tables' },
      { status: 500 },
    );
  }
}
