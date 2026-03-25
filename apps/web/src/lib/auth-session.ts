// Helpers for reading/verifying the session cookie in Server Components
import { cookies } from 'next/headers';
import { adminAuth } from './firebase-admin';
import type { UserRecord } from 'firebase-admin/auth';

const SESSION_COOKIE = 'x-track-session';

export async function getSessionUser(): Promise<UserRecord | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return adminAuth.getUser(decoded.uid);
  } catch {
    return null;
  }
}

export async function getUserRole(uid: string): Promise<string | null> {
  const userDoc = await import('./firebase-admin').then(({ adminDb }) =>
    adminDb.doc(`users/${uid}`).get()
  );
  return (userDoc.data()?.role as string) ?? null;
}

export { SESSION_COOKIE };
