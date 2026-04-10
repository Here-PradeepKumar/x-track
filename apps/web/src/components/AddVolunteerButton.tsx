'use client';

import { useState } from 'react';
import { importVolunteers } from '@/actions/event-actions';

interface Props {
  eventId: string;
}

export default function AddVolunteerButton({ eventId }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!phone.trim()) return;
    setError(null);
    setSaving(true);
    try {
      await importVolunteers(eventId, [{ displayName: name.trim(), phone: phone.trim() }]);
      setName('');
      setPhone('');
      setOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add volunteer.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setName('');
    setPhone('');
    setError(null);
    setOpen(false);
  };

  return (
    <>
      <button onClick={() => setOpen(true)} style={styles.btn}>
        + Add Volunteer
      </button>

      {open && (
        <div style={styles.overlay} onClick={handleClose}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.title}>Add Volunteer</h2>

            <label style={styles.label}>Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Display name (optional)"
              style={styles.input}
              disabled={saving}
              autoFocus
            />

            <label style={styles.label}>Phone <span style={styles.required}>*</span></label>
            <input
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setError(null); }}
              placeholder="e.g. 9876543210"
              style={styles.input}
              disabled={saving}
              onKeyDown={(e) => { if (e.key === 'Enter') void handleSave(); if (e.key === 'Escape') handleClose(); }}
            />

            {error && <p style={styles.error}>{error}</p>}

            <div style={styles.actions}>
              <button
                onClick={() => void handleSave()}
                disabled={saving || !phone.trim()}
                style={styles.save}
              >
                {saving ? 'Adding…' : 'Add'}
              </button>
              <button onClick={handleClose} disabled={saving} style={styles.cancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  btn: {
    background: 'transparent',
    color: '#cafd00',
    border: '1px solid rgba(202,253,0,0.4)',
    borderRadius: '2px',
    padding: '8px 16px',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '1px',
    cursor: 'pointer',
    textTransform: 'uppercase' as const,
    whiteSpace: 'nowrap',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  modal: {
    background: '#141414',
    border: '1px solid #2a2a2a',
    borderRadius: '4px',
    padding: '28px 32px',
    width: '100%',
    maxWidth: '380px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  title: {
    fontSize: '16px',
    fontWeight: 900,
    color: '#fff',
    marginBottom: '12px',
  },
  label: {
    fontSize: '10px',
    color: '#adaaaa',
    letterSpacing: '2px',
    textTransform: 'uppercase' as const,
    marginTop: '4px',
  },
  required: { color: '#ff7351' },
  input: {
    background: '#1a1a1a',
    border: '1px solid #494847',
    borderRadius: '2px',
    color: '#fff',
    fontSize: '14px',
    padding: '8px 10px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
    marginBottom: '4px',
  },
  error: {
    fontSize: '11px',
    color: '#ff7351',
    margin: '4px 0 0',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    marginTop: '16px',
  },
  save: {
    background: '#cafd00',
    color: '#0e0e0f',
    border: 'none',
    borderRadius: '2px',
    padding: '9px 24px',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '1px',
    cursor: 'pointer',
    textTransform: 'uppercase' as const,
  },
  cancel: {
    background: 'transparent',
    color: '#adaaaa',
    border: '1px solid #333',
    borderRadius: '2px',
    padding: '9px 16px',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '1px',
    cursor: 'pointer',
  },
};
