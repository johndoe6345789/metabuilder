import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { getSession } from '@/utils/session';

// Validate identifier (table, column, or index name)
function isValidIdentifier(name: string): boolean {
  return /^[a-z_][a-z0-9_]*$/i.test(name);
}

// GET - List indexes for a table
export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get('tableName');

    if (!tableName) {
      return NextResponse.json(
        { error: 'Table name is required' },
        { status: 400 },
      );
    }

    if (!isValidIdentifier(tableName)) {
      return NextResponse.json(
        { error: 'Invalid table name format' },
        { status: 400 },
      );
    }

    // Query PostgreSQL system catalogs for indexes
    const result = await db.execute(`
      SELECT
        i.relname AS index_name,
        a.attname AS column_name,
        am.amname AS index_type,
        ix.indisunique AS is_unique,
        ix.indisprimary AS is_primary,
        pg_get_indexdef(ix.indexrelid) AS index_definition
      FROM pg_index ix
      JOIN pg_class t ON t.oid = ix.indrelid
      JOIN pg_class i ON i.oid = ix.indexrelid
      JOIN pg_am am ON i.relam = am.oid
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
      WHERE t.relname = '${tableName}'
        AND t.relkind = 'r'
        AND t.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      ORDER BY i.relname, a.attnum
    `);

    // Group by index name to handle multi-column indexes
    const indexesMap = new Map();
    for (const row of result.rows) {
      const indexName = row.index_name;
      if (!indexesMap.has(indexName)) {
        indexesMap.set(indexName, {
          index_name: row.index_name,
          columns: [],
          index_type: row.index_type,
          is_unique: row.is_unique,
          is_primary: row.is_primary,
          definition: row.index_definition,
        });
      }
      indexesMap.get(indexName).columns.push(row.column_name);
    }

    const indexes = Array.from(indexesMap.values());

    return NextResponse.json({ indexes });
  } catch (error: any) {
    console.error('List indexes error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list indexes' },
      { status: 500 },
    );
  }
}

// POST - Create a new index
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const { tableName, indexName, columns, indexType, unique } = await request.json();

    // Validation
    if (!tableName || !indexName || !columns || columns.length === 0) {
      return NextResponse.json(
        { error: 'Table name, index name, and at least one column are required' },
        { status: 400 },
      );
    }

    if (!isValidIdentifier(tableName)) {
      return NextResponse.json(
        { error: 'Invalid table name format' },
        { status: 400 },
      );
    }

    if (!isValidIdentifier(indexName)) {
      return NextResponse.json(
        { error: 'Invalid index name format' },
        { status: 400 },
      );
    }

    // Validate all column names
    for (const col of columns) {
      if (!isValidIdentifier(col)) {
        return NextResponse.json(
          { error: `Invalid column name format: ${col}` },
          { status: 400 },
        );
      }
    }

    // Validate index type
    const validIndexTypes = ['BTREE', 'HASH', 'GIN', 'GIST', 'BRIN'];
    const type = (indexType || 'BTREE').toUpperCase();
    if (!validIndexTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid index type. Must be one of: ${validIndexTypes.join(', ')}` },
        { status: 400 },
      );
    }

    // Build CREATE INDEX statement
    const uniqueClause = unique ? 'UNIQUE ' : '';
    const columnList = columns.map((col: string) => `"${col}"`).join(', ');
    const createIndexQuery = `CREATE ${uniqueClause}INDEX "${indexName}" ON "${tableName}" USING ${type} (${columnList})`;

    await db.execute(createIndexQuery);

    return NextResponse.json({
      success: true,
      message: `Index "${indexName}" created successfully`,
    });
  } catch (error: any) {
    console.error('Create index error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create index' },
      { status: 500 },
    );
  }
}

// DELETE - Drop an index
export async function DELETE(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const { indexName } = await request.json();

    if (!indexName) {
      return NextResponse.json(
        { error: 'Index name is required' },
        { status: 400 },
      );
    }

    if (!isValidIdentifier(indexName)) {
      return NextResponse.json(
        { error: 'Invalid index name format' },
        { status: 400 },
      );
    }

    // Drop the index
    const dropIndexQuery = `DROP INDEX IF EXISTS "${indexName}"`;
    await db.execute(dropIndexQuery);

    return NextResponse.json({
      success: true,
      message: `Index "${indexName}" dropped successfully`,
    });
  } catch (error: any) {
    console.error('Drop index error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to drop index' },
      { status: 500 },
    );
  }
}
