'use client';

import { useState } from 'react';
import { createEvent } from '@/actions/event-actions';

export default function CreateEventForm({ organizerUid: _ }: { organizerUid: string }) {
  const [raceType, setRaceType] = useState<'custom' | 'hyrox' | 'devilcircuit'>('custom');

  return (
    <form action={createEvent} style={styles.form}>
      <input type="hidden" name="raceType" value={raceType} />

      <div style={styles.field}>
        <label style={styles.label}>Event Name</label>
        <input
          name="name"
          type="text"
          placeholder="e.g. HYROX Bangalore 2026"
          required
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Location</label>
        <input
          name="location"
          type="text"
          placeholder="e.g. BIEC, Tumkur Road, Bangalore"
          required
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Race Date</label>
        <input name="date" type="date" required style={styles.input} />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Description (optional)</label>
        <textarea
          name="description"
          placeholder="A brief description of the event…"
          rows={3}
          style={{ ...styles.input, resize: 'vertical' }}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Race Type</label>
        <div style={styles.raceTypePills}>
          {(['custom', 'hyrox', 'devilcircuit'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setRaceType(t)}
              style={{
                ...styles.pill,
                ...(raceType === t ? styles.pillActive : {}),
              }}
            >
              {t === 'hyrox' ? 'HYROX' : t === 'devilcircuit' ? 'DEVIL CIRCUIT' : 'CUSTOM'}
            </button>
          ))}
        </div>
        {raceType === 'hyrox' && (
          <p style={styles.templateNote}>
            16 milestones auto-created: 8×Run + SkiErg, Sled Push, Sled Pull, Burpee, Row, Farmers Carry, Lunges, Wall Balls. Rep counting enabled for Burpee, Lunges &amp; Wall Balls.
          </p>
        )}
        {raceType === 'devilcircuit' && (
          <p style={styles.templateNote}>
            15 milestones auto-created: 7×Run + Devil Wall, Monkey Bars, Barbed Wire Crawl, Rope Climb, Tyre Drag, Bucket Carry, Mud Pit, Finish Sprint. Categories: Open &amp; Elite (Male/Female).
          </p>
        )}
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
  raceTypePills: { display: 'flex', gap: '8px' },
  pill: {
    background: '#131313',
    border: '1px solid #494847',
    borderRadius: '2px',
    padding: '8px 20px',
    fontSize: '11px',
    fontWeight: 900,
    letterSpacing: '2px',
    color: '#adaaaa',
    cursor: 'pointer',
  },
  pillActive: {
    background: '#cafd00',
    border: '1px solid #cafd00',
    color: '#3a4a00',
  },
  templateNote: {
    fontSize: '11px',
    color: '#cafd00',
    background: 'rgba(202,253,0,0.08)',
    border: '1px solid rgba(202,253,0,0.2)',
    borderRadius: '2px',
    padding: '10px 14px',
    lineHeight: 1.6,
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
