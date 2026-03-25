import { Suspense } from 'react';
import AcceptInviteForm from '@/components/AcceptInviteForm';

export default function AcceptInvitePage() {
  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <div style={styles.brand}>
          <span style={styles.brandName}>X-TRACK</span>
          <span style={styles.brandTagline}>PRECISION GRIT</span>
        </div>
        <Suspense fallback={<p style={styles.loading}>Loading…</p>}>
          <AcceptInviteForm />
        </Suspense>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#0e0e0f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    background: '#131313',
    borderRadius: '2px',
    padding: '40px',
    borderTop: '4px solid #cafd00',
  },
  brand: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '32px',
  },
  brandName: {
    fontSize: '24px',
    fontWeight: 900,
    color: '#cafd00',
    letterSpacing: '-0.5px',
    fontStyle: 'italic',
  },
  brandTagline: {
    fontSize: '9px',
    color: '#494847',
    letterSpacing: '3px',
    textTransform: 'uppercase',
  },
  loading: { color: '#adaaaa', fontSize: '14px' },
};
