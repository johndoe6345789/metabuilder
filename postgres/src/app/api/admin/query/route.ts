import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { getSession } from '@/utils/session';

// Validate that query is a safe SELECT statement
function validateSelectQuery(query: string): boolean {
  const trimmed = query.trim();

  // Remove leading comments and whitespace
  const noComments = trimmed.replace(/^(?:--[^\n]*\n|\s)+/g, '');

  // Check if it starts with SELECT (case insensitive)
  if (!/^select\s/i.test(noComments)) {
    return false;
  }

  // Check for dangerous keywords (case insensitive)
  // Includes common SQL modification commands and advanced features
  const dangerous = /;\s*(?:drop|delete|update|insert|alter|create|truncate|exec|execute|merge|call|with)\s/i;
  if (dangerous.test(trimmed)) {
    return false;
  }

  return true;
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 },
      );
    }

    // Validate query
    if (!validateSelectQuery(query)) {
      return NextResponse.json(
        { error: 'Only SELECT queries are allowed. No modification queries (INSERT, UPDATE, DELETE, DROP, etc.) permitted.' },
        { status: 400 },
      );
    }

    const result = await db.execute(query);

    return NextResponse.json({
      rows: result.rows,
      rowCount: result.rowCount,
      fields: result.fields.map(field => ({
        name: field.name,
        dataTypeID: field.dataTypeID,
      })),
    });
  } catch (error: any) {
    console.error('Query error:', error);
    return NextResponse.json(
      { error: error.message || 'Query failed' },
      { status: 500 },
    );
  }
}
