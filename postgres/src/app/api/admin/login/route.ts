import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { verifyPassword } from '@/utils/auth';
import { adminUserSchema, db } from '@/utils/db';
import { createSession, setSessionCookie } from '@/utils/session';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 },
      );
    }

    // Find user
    const users = await db
      .select()
      .from(adminUserSchema)
      .where(eq(adminUserSchema.username, username))
      .limit(1);

    const user = users[0];

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 },
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 },
      );
    }

    // Create session
    const token = await createSession({
      userId: user.id,
      username: user.username,
    });

    await setSessionCookie(token);

    return NextResponse.json({ success: true, username: user.username });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
