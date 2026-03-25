'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';

interface Props { organizerUid: string }

export default function CreateEventForm({ organizerUid }: Props) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const docRef = await addDoc(collection(db, 'events'), {
        organizerId: organizerUid,
        name: name.trim(),
        location: location.trim(),
        description: description.trim(),
        date: Timestamp.fromDate(new Date(date)),
        status: 'draft',
        coverImageUrl: null,
        createdAt: Timestamp.now(),
      });
      router.push(`/organizer/events/${docRef.id}`);
    } catch (err: any) {
      setError(err.message ?? 'Failed to create event.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.field}>
        <label style={styles.label}>Event Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Mud Warrior Challenge 2025"
          required
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Location</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Coorg, Karnataka"
          required
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Race Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Description (optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A brief description of the event…"
          rows={4}
          style={{ ...styles.input, resize: 'vertical' }}
        />
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.actions}>
        <a href="/organizer" style={styles.cancelBtn}>Cancel</a>
        <button type="submit" disabled={loading} style={styles.submitBtn}>
          {loading ? 'Creating…' : 'Create Event'}
        </button>
      </div>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: { display: 'flex', flexDirection: 'column', gap: '24px' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '9px', color: '#adaaaa', letterSpacing: '3px', textTransform: 'uppercase' },
  input: {
    background: '#131313',
    border: '1px solid #494847',
    borderRadius: '2px',
    padding: '12px 14px',
    fontSize: '15px',
    color: '#fff',
    outline: 'none',
    fontFamily: 'inherit',
  },
  error: { fontSize: '13px', color: '#ff7351' },
  actions: { display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '8px' },
  cancelBtn: {
    padding: '12px 24px',
    fontSize: '12px',
    color: '#adaaaa',
    textDecoration: 'none',
    letterSpacing: '1px',
  },
  submitBtn: {
    background: '#cafd00',
    color: '#3a4a00',
    border: 'none',
    borderRadius: '2px',
    padding: '12px 28px',
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '1px',
    cursor: 'pointer',
  },
};
