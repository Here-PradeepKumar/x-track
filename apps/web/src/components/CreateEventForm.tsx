'use client';

import { useRef } from 'react';
import { createEvent } from '@/actions/event-actions';

export default function CreateEventForm({ organizerUid: _ }: { organizerUid: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={createEvent} style={styles.form}>
      <div style={styles.field}>
        <label style={styles.label}>Event Name</label>
        <input
          name="name"
          type="text"
          placeholder="e.g. Mud Warrior Challenge 2025"
          required
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Location</label>
        <input
          name="location"
          type="text"
          placeholder="e.g. Coorg, Karnataka"
          required
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Race Date</label>
        <input
          name="date"
          type="date"
          required
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Description (optional)</label>
        <textarea
          name="description"
          placeholder="A brief description of the event…"
          rows={4}
          style={{ ...styles.input, resize: 'vertical' }}
        />
      </div>

      <div style={styles.actions}>
        <a href="/organizer" style={styles.cancelBtn}>Cancel</a>
        <button type="submit" style={styles.submitBtn}>Create Event</button>
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
