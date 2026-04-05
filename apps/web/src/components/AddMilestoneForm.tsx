'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase-client';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface Props {
  eventId: string;
  nextOrder: number;
}

export default function AddMilestoneForm({ eventId, nextOrder }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [distance, setDistance] = useState('');
  const [stationType, setStationType] = useState<'station' | 'run'>('station');
  const [saving, setSaving] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await addDoc(collection(db, `events/${eventId}/milestones`), {
        name: name.trim(),
        order: nextOrder,
        distanceMark: distance.trim(),
        stationType,
        assignedVolunteerUid: null,
        assignedAt: null,
      });
      setName('');
      setDistance('');
      setStationType('station');
      setOpen(false);
      window.location.reload();
    } catch (e: any) {
      alert(e.message ?? 'Failed to add milestone.');
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={styles.btn}>+ Add Milestone</button>
    );
  }

  return (
    <form onSubmit={handleAdd} style={styles.form}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Milestone name (e.g. The Mud Pit)"
        required
        autoFocus
        style={styles.input}
      />
      <input
        value={distance}
        onChange={(e) => setDistance(e.target.value)}
        placeholder="Distance (e.g. 0.8 MILE)"
        style={styles.input}
      />
      <div style={styles.toggle}>
        {(['station', 'run'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setStationType(t)}
            style={stationType === t ? styles.toggleActive : styles.toggleInactive}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button type="submit" disabled={saving} style={styles.btn}>
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button type="button" onClick={() => setOpen(false)} style={styles.cancelBtn}>Cancel</button>
      </div>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' },
  input: {
    background: '#201f1f',
    border: '1px solid #494847',
    borderRadius: '2px',
    padding: '8px 12px',
    color: '#fff',
    fontSize: '13px',
    outline: 'none',
  },
  btn: { background: '#cafd00', color: '#3a4a00', border: 'none', borderRadius: '2px', padding: '9px 18px', fontSize: '12px', fontWeight: 900, letterSpacing: '1px', cursor: 'pointer' },
  cancelBtn: { background: 'transparent', color: '#adaaaa', border: '1px solid #494847', borderRadius: '2px', padding: '9px 18px', fontSize: '12px', cursor: 'pointer' },
  toggle: { display: 'flex', borderRadius: '2px', overflow: 'hidden', border: '1px solid #494847' },
  toggleActive: { background: '#cafd00', color: '#3a4a00', border: 'none', padding: '8px 14px', fontSize: '11px', fontWeight: 900, letterSpacing: '1px', cursor: 'pointer' },
  toggleInactive: { background: 'transparent', color: '#adaaaa', border: 'none', padding: '8px 14px', fontSize: '11px', letterSpacing: '1px', cursor: 'pointer' },
};
