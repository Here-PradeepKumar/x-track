import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { SESSION_COOKIE } from '@/lib/auth-session';

// POST /api/auth/session — exchange Firebase ID token for a session cookie
export async function POST(req: NextRequest) {
  const { idToken } = await req.json();

  if (!idToken) {
    return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
  }

  // 14-day session
  const expiresIn = 60 * 60 * 24 * 14 * 1000;

  try {
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });
    return res;
  } catch (err: any) {
    console.error('[session] createSessionCookie failed:', err?.message ?? err);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

// DELETE /api/auth/session — sign out
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
