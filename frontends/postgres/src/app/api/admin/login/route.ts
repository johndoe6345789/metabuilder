import { NextResponse } from 'next/server';
import { verifyDbalAdminToken } from '@/utils/dbalAdmin';
import { createSession, setSessionCookie } from '@/utils/session';

/**
 * Bridges a DBAL OIDC access token (obtained client-side via the
 * beginLogin/completeLogin redirect flow) into this app's own httpOnly
 * session cookie -- keeps every existing /api/admin/* route's
 * cookie-based getSession() check unchanged, while the only way to
 * actually mint that cookie is now a DBAL-verified, admin-tier login.
 */
export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'DBAL access token is required' },
        { status: 400 },
      );
    }

    const username = await verifyDbalAdminToken(token);
    if (!username) {
      return NextResponse.json(
        { error: 'Not authorized -- admin role required' },
        { status: 401 },
      );
    }

    const sessionToken = await createSession({ userId: 0, username });
    await setSessionCookie(sessionToken);

    return NextResponse.json({ success: true, username });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
