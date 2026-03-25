'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase-client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await cred.user.getIdToken();

      // Exchange ID token for a session cookie via Route Handler
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) throw new Error('Session creation failed.');

      router.push('/');
      router.refresh();
    } catch (e: any) {
      setError(e.message ?? 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Brand */}
        <div style={styles.brand}>
          <span style={styles.brandName}>X-TRACK</span>
          <span style={styles.brandTagline}>ADMIN DASHBOARD</span>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              style={styles.input}
              placeholder="admin@xtrack.app"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="••••••••"
            />
          </div>

          {error && <p style={styles.errorText}>{error}</p>}

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
    padding: '24px',
  },
  card: {
    background: 'var(--surface-low)',
    padding: '40px',
    borderRadius: '4px',
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  brand: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  brandName: {
    fontFamily: 'system-ui',
    fontSize: '28px',
    fontWeight: 900,
    color: 'var(--lime)',
    letterSpacing: '-1px',
    fontStyle: 'italic',
  },
  brandTagline: {
    fontSize: '9px',
    color: 'var(--on-surface-variant)',
    letterSpacing: '4px',
    textTransform: 'uppercase',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '9px',
    color: 'var(--on-surface-variant)',
    letterSpacing: '3px',
    textTransform: 'uppercase',
  },
  input: {
    background: 'var(--surface-high)',
    border: 'none',
    borderRadius: '2px',
    padding: '14px 16px',
    color: 'var(--on-surface)',
    fontSize: '15px',
    outline: 'none',
  },
  errorText: {
    color: 'var(--error)',
    fontSize: '12px',
    letterSpacing: '0.5px',
  },
  btn: {
    background: 'var(--lime)',
    color: '#3a4a00',
    border: 'none',
    borderRadius: '2px',
    padding: '16px',
    fontSize: '13px',
    fontWeight: 900,
    letterSpacing: '2px',
    cursor: 'pointer',
    marginTop: '8px',
  },
};
