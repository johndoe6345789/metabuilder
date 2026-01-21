import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { getSession } from '@/utils/session';
import { isValidIdentifier } from '@/validations/DatabaseIdentifierValidation';

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

// LIST CONSTRAINTS
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

    // Validate identifier
    if (!isValidIdentifier(tableName)) {
      return NextResponse.json(
        { error: 'Invalid table name format' },
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

    // Get all constraints for the table
    const constraints = await db.execute(sql`
      SELECT
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        cc.check_clause
      FROM information_schema.table_constraints tc
      LEFT JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
        AND tc.table_name = kcu.table_name
      LEFT JOIN information_schema.check_constraints cc
        ON tc.constraint_name = cc.constraint_name
      WHERE tc.table_schema = 'public'
        AND tc.table_name = ${tableName}
        AND tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE', 'CHECK')
      ORDER BY tc.constraint_name
    `);

    return NextResponse.json({
      success: true,
      constraints: constraints.rows,
    });
  } catch (error: any) {
    console.error('List constraints error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list constraints' },
      { status: 500 },
    );
  }
}

// ADD CONSTRAINT
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const { tableName, constraintName, constraintType, columnName, checkExpression } = await request.json();

    if (!tableName || !constraintName || !constraintType) {
      return NextResponse.json(
        { error: 'Table name, constraint name, and constraint type are required' },
        { status: 400 },
      );
    }

    // Validate identifiers
    if (!isValidIdentifier(tableName) || !isValidIdentifier(constraintName)) {
      return NextResponse.json(
        { error: 'Invalid table or constraint name format' },
        { status: 400 },
      );
    }

    // Validate column name if provided
    if (columnName && !isValidIdentifier(columnName)) {
      return NextResponse.json(
        { error: 'Invalid column name format' },
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

    let alterQuery = '';

    if (constraintType === 'PRIMARY KEY') {
      if (!columnName) {
        return NextResponse.json(
          { error: 'Column name is required for PRIMARY KEY constraint' },
          { status: 400 },
        );
      }
      alterQuery = `ALTER TABLE "${tableName}" ADD CONSTRAINT "${constraintName}" PRIMARY KEY ("${columnName}")`;
    } else if (constraintType === 'UNIQUE') {
      if (!columnName) {
        return NextResponse.json(
          { error: 'Column name is required for UNIQUE constraint' },
          { status: 400 },
        );
      }
      alterQuery = `ALTER TABLE "${tableName}" ADD CONSTRAINT "${constraintName}" UNIQUE ("${columnName}")`;
    } else if (constraintType === 'CHECK') {
      if (!checkExpression) {
        return NextResponse.json(
          { error: 'Check expression is required for CHECK constraint' },
          { status: 400 },
        );
      }
      // Validate check expression - prevent SQL injection attempts
      // We check for common dangerous patterns but allow valid SQL operators
      const dangerousPatterns = [
        /;\s*DROP/i,
        /;\s*DELETE/i,
        /;\s*UPDATE/i,
        /;\s*INSERT/i,
        /;\s*ALTER/i,
        /;\s*CREATE/i,
        /--/, // SQL comments
        /\/\*/, // Block comments
      ];

      if (dangerousPatterns.some(pattern => pattern.test(checkExpression))) {
        return NextResponse.json(
          { error: 'Invalid check expression: contains potentially dangerous SQL' },
          { status: 400 },
        );
      }
      alterQuery = `ALTER TABLE "${tableName}" ADD CONSTRAINT "${constraintName}" CHECK (${checkExpression})`;
    } else {
      return NextResponse.json(
        { error: 'Unsupported constraint type. Supported types: PRIMARY KEY, UNIQUE, CHECK' },
        { status: 400 },
      );
    }

    // NOTE: We must use sql.raw() for DDL statements (ALTER TABLE) because PostgreSQL
    // does not support binding identifiers (table names, column names, constraint names)
    // as parameters. The identifiers are validated with isValidIdentifier() which ensures
    // they only contain safe characters (letters, numbers, underscores) and match
    // PostgreSQL naming conventions, preventing SQL injection.
    await db.execute(sql.raw(alterQuery));

    return NextResponse.json({
      success: true,
      message: `Constraint '${constraintName}' added successfully`,
    });
  } catch (error: any) {
    console.error('Add constraint error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add constraint' },
      { status: 500 },
    );
  }
}

// DROP CONSTRAINT
export async function DELETE(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const { tableName, constraintName } = await request.json();

    if (!tableName || !constraintName) {
      return NextResponse.json(
        { error: 'Table name and constraint name are required' },
        { status: 400 },
      );
    }

    // Validate identifiers
    if (!isValidIdentifier(tableName) || !isValidIdentifier(constraintName)) {
      return NextResponse.json(
        { error: 'Invalid table or constraint name format' },
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

    // NOTE: We must use sql.raw() for DDL statements (ALTER TABLE) because PostgreSQL
    // does not support binding identifiers (table names, constraint names) as parameters.
    // All identifiers are validated with isValidIdentifier() to prevent SQL injection.
    const alterQuery = `ALTER TABLE "${tableName}" DROP CONSTRAINT "${constraintName}"`;
    await db.execute(sql.raw(alterQuery));

    return NextResponse.json({
      success: true,
      message: `Constraint '${constraintName}' dropped successfully`,
    });
  } catch (error: any) {
    console.error('Drop constraint error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to drop constraint' },
      { status: 500 },
    );
  }
}
