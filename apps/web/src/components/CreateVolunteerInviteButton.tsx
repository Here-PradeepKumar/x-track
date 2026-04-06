'use client';

import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/lib/firebase-client';

interface Milestone {
  id: string;
  name: string;
  order: number;
}

interface Props {
  eventId: string;
  milestones: Milestone[];
}

export default function CreateVolunteerInviteButton({ eventId, milestones }: Props) {
  const [selectedMilestoneId, setSelectedMilestoneId] = useState('');
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const createInvite = async () => {
    if (!selectedMilestoneId) {
      alert('Select a milestone first.');
      return;
    }
    setLoading(true);
    try {
      const functions = getFunctions(app);
      const fn = httpsCallable<
        { eventId: string; milestoneId: string },
        { inviteId: string }
      >(functions, 'createVolunteerInvite');
      const result = await fn({ eventId, milestoneId: selectedMilestoneId });
      const link = `${window.location.origin}/accept-invite?id=${result.data.inviteId}&type=volunteer`;
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

  if (milestones.length === 0) {
    return (
      <span style={styles.noMilestones}>All milestones are assigned</span>
    );
  }

  return (
    <div style={styles.wrapper}>
      {inviteLink && (
        <div style={styles.linkBox}>
          <span style={styles.linkText}>{inviteLink.slice(0, 50)}…</span>
          <button onClick={copyLink} style={styles.copyBtn}>COPY</button>
        </div>
      )}
      <select
        value={selectedMilestoneId}
        onChange={(e) => { setSelectedMilestoneId(e.target.value); setInviteLink(null); }}
        style={styles.select}
      >
        <option value="">Select milestone…</option>
        {milestones.map((m) => (
          <option key={m.id} value={m.id}>#{m.order} — {m.name}</option>
        ))}
      </select>
      <button onClick={createInvite} disabled={loading || !selectedMilestoneId} style={styles.btn}>
        {loading ? 'Creating…' : '+ Invite Volunteer'}
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  noMilestones: { fontSize: '12px', color: '#adaaaa', letterSpacing: '1px' },
  select: {
    background: '#131313',
    color: '#fff',
    border: '1px solid #494847',
    borderRadius: '2px',
    padding: '8px 12px',
    fontSize: '13px',
    cursor: 'pointer',
  },
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
