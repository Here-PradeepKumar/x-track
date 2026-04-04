'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';
import { auth } from '@/lib/firebase-client';

type InviteType = 'organizer' | 'volunteer';

export default function AcceptInviteForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const inviteId = searchParams?.get('id') ?? '';
  const inviteType = (searchParams?.get('type') ?? 'organizer') as InviteType;

  const [step, setStep] = useState<'form' | 'done'>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!inviteId) setError('Invalid invite link — missing invite ID.');
  }, [inviteId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteId) return;
    setLoading(true);
    setError(null);

    try {
      const functions = getFunctions(getApp());

      // Create or sign in to Firebase Auth account
      let idToken: string;
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        idToken = await cred.user.getIdToken();
      } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
          const cred = await signInWithEmailAndPassword(auth, email, password);
          idToken = await cred.user.getIdToken();
        } else {
          throw err;
        }
      }

      // Call the appropriate Cloud Function to accept the invite
      const fnName =
        inviteType === 'organizer' ? 'acceptOrganizerInvite' : 'acceptVolunteerInvite';
      const fn = httpsCallable<{ inviteId: string; displayName: string }, { success: boolean }>(
        functions,
        fnName
      );
      await fn({ inviteId, displayName });

      setStep('done');
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!inviteId) {
    return (
      <div>
        <p style={styles.errorMsg}>Invalid invite link. Please request a new one.</p>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div style={styles.successBox}>
        <span style={styles.successIcon}>✓</span>
        <h2 style={styles.successTitle}>Welcome to X-TRACK</h2>
        <p style={styles.successText}>
          {inviteType === 'organizer'
            ? 'Your organizer account is ready. You can now sign in to the dashboard.'
            : 'Your volunteer account is set up. Sign in with the Volunteer app using your phone number.'}
        </p>
        {inviteType === 'organizer' && (
          <button onClick={() => router.push('/login')} style={styles.goBtn}>
            Go to Login
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h1 style={styles.title}>
        {inviteType === 'organizer' ? 'Create Organizer Account' : 'Accept Volunteer Invite'}
      </h1>
      <p style={styles.subtitle}>
        {inviteType === 'organizer'
          ? 'Set up your account to manage events on X-TRACK.'
          : 'Complete your account setup to get started.'}
      </p>

      <div style={styles.field}>
        <label style={styles.label}>Display Name</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your full name"
          required
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min 8 characters"
          minLength={8}
          required
          style={styles.input}
        />
      </div>

      {error && <p style={styles.errorMsg}>{error}</p>}

      <button type="submit" disabled={loading} style={styles.submitBtn}>
        {loading ? 'Setting up…' : 'Accept Invite'}
      </button>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  title: { fontSize: '20px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', marginBottom: '4px' },
  subtitle: { fontSize: '13px', color: '#adaaaa', lineHeight: '1.5' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '9px', color: '#adaaaa', letterSpacing: '3px', textTransform: 'uppercase' },
  input: {
    background: '#0e0e0f',
    border: '1px solid #494847',
    borderRadius: '2px',
    padding: '12px 14px',
    fontSize: '15px',
    color: '#fff',
    outline: 'none',
  },
  errorMsg: { fontSize: '13px', color: '#ff6b6b', letterSpacing: '0.3px' },
  submitBtn: {
    background: '#cafd00',
    color: '#3a4a00',
    border: 'none',
    borderRadius: '2px',
    padding: '14px',
    fontSize: '13px',
    fontWeight: 900,
    letterSpacing: '2px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    marginTop: '4px',
  },
  successBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' },
  successIcon: { fontSize: '48px', color: '#cafd00', lineHeight: 1 },
  successTitle: { fontSize: '20px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' },
  successText: { fontSize: '14px', color: '#adaaaa', lineHeight: '1.6' },
  goBtn: {
    background: '#cafd00',
    color: '#3a4a00',
    border: 'none',
    borderRadius: '2px',
    padding: '12px 28px',
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '2px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    marginTop: '8px',
  },
};
