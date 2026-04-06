'use client';

import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/lib/firebase-client';

export default function CreateOrganizerInviteButton() {
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const createInvite = async () => {
    setLoading(true);
    try {
      const functions = getFunctions(app);
      const fn = httpsCallable<void, { inviteId: string }>(functions, 'createOrganizerInvite');
      const result = await fn();
      const link = `${window.location.origin}/accept-invite?id=${result.data.inviteId}&type=organizer`;
      setInviteLink(link);
    } catch (e: any) {
      alert(e.message ?? 'Failed to create invite.');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      alert('Invite link copied!');
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      {inviteLink && (
        <div style={styles.linkBox}>
          <span style={styles.linkText}>{inviteLink.slice(0, 48)}…</span>
          <button onClick={copyLink} style={styles.copyBtn}>COPY</button>
        </div>
      )}
      <button onClick={createInvite} disabled={loading} style={styles.btn}>
        {loading ? 'Creating...' : '+ New Invite'}
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  btn: {
    background: '#cafd00',
    color: '#3a4a00',
    border: 'none',
    borderRadius: '2px',
    padding: '10px 20px',
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '1px',
    cursor: 'pointer',
  },
  linkBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#131313',
    border: '1px solid #494847',
    borderRadius: '2px',
    padding: '8px 12px',
  },
  linkText: { fontSize: '12px', color: '#adaaaa', fontFamily: 'monospace' },
  copyBtn: {
    background: 'transparent',
    color: '#cafd00',
    border: '1px solid #cafd00',
    borderRadius: '2px',
    padding: '4px 10px',
    fontSize: '9px',
    letterSpacing: '2px',
    cursor: 'pointer',
  },
};
