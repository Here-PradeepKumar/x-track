'use client';

import { useState, useTransition } from 'react';
import { setVolunteerActive, removeVolunteerFromRoster, updateVolunteerDetails } from '@/actions/event-actions';

interface Props {
  eventId: string;
  phone: string;
  active: boolean;
  displayName: string;
}

export default function RosterActions({ eventId, phone, active, displayName }: Props) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(displayName);
  const [phoneInput, setPhoneInput] = useState(phone);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = () => {
    startTransition(() => { void setVolunteerActive(eventId, phone, !active); });
  };

  const handleRemove = () => {
    if (!confirm(`Remove ${phone} from the roster? They will no longer be able to log in.`)) return;
    startTransition(() => { void removeVolunteerFromRoster(eventId, phone); });
  };

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const result = await updateVolunteerDetails(eventId, phone, phoneInput.trim(), nameInput);
      if (result.error) {
        setError(result.error);
      } else {
        setEditing(false);
      }
    });
  };

  const handleCancel = () => {
    setNameInput(displayName);
    setPhoneInput(phone);
    setError(null);
    setEditing(false);
  };

  if (editing) {
    return (
      <div style={styles.editWrap}>
        <div style={styles.editRow}>
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Name"
            style={styles.input}
            disabled={pending}
          />
          <input
            value={phoneInput}
            onChange={(e) => { setPhoneInput(e.target.value); setError(null); }}
            placeholder="Phone"
            style={{ ...styles.input, fontFamily: 'monospace' }}
            disabled={pending}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel(); }}
          />
          <button onClick={handleSave} disabled={pending || !phoneInput.trim()} style={styles.save}>
            {pending ? '…' : 'Save'}
          </button>
          <button onClick={handleCancel} disabled={pending} style={styles.cancelBtn}>
            Cancel
          </button>
        </div>
        {error && <p style={styles.error}>{error}</p>}
      </div>
    );
  }

  return (
    <div style={styles.row}>
      <button onClick={() => setEditing(true)} disabled={pending} style={styles.edit}>
        Edit
      </button>
      <button
        onClick={handleToggle}
        disabled={pending}
        style={active ? styles.deactivate : styles.activate}
      >
        {active ? 'Deactivate' : 'Activate'}
      </button>
      <button onClick={handleRemove} disabled={pending} style={styles.remove}>
        Remove
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  row: { display: 'flex', gap: '8px' },
  editWrap: { display: 'flex', flexDirection: 'column', gap: '6px' },
  editRow: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' },
  input: {
    background: '#1a1a1a',
    border: '1px solid #494847',
    borderRadius: '2px',
    color: '#fff',
    fontSize: '13px',
    padding: '4px 8px',
    outline: 'none',
    width: '140px',
  },
  error: {
    fontSize: '11px',
    color: '#ff7351',
    margin: 0,
    letterSpacing: '0.3px',
  },
  save: {
    background: '#cafd00',
    color: '#0e0e0f',
    border: 'none',
    borderRadius: '2px',
    padding: '5px 12px',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '1px',
    cursor: 'pointer',
    textTransform: 'uppercase' as const,
  },
  cancelBtn: {
    background: 'transparent',
    color: '#adaaaa',
    border: '1px solid #333',
    borderRadius: '2px',
    padding: '5px 12px',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '1px',
    cursor: 'pointer',
  },
  edit: {
    background: 'transparent',
    color: '#adaaaa',
    border: '1px solid #333',
    borderRadius: '2px',
    padding: '5px 12px',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '1px',
    cursor: 'pointer',
    textTransform: 'uppercase' as const,
  },
  activate: {
    background: 'transparent',
    color: '#cafd00',
    border: '1px solid rgba(202,253,0,0.4)',
    borderRadius: '2px',
    padding: '5px 12px',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '1px',
    cursor: 'pointer',
    textTransform: 'uppercase' as const,
  },
  deactivate: {
    background: 'transparent',
    color: '#adaaaa',
    border: '1px solid #333',
    borderRadius: '2px',
    padding: '5px 12px',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '1px',
    cursor: 'pointer',
    textTransform: 'uppercase' as const,
  },
  remove: {
    background: 'transparent',
    color: '#ff7351',
    border: '1px solid rgba(255,115,81,0.3)',
    borderRadius: '2px',
    padding: '5px 12px',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '1px',
    cursor: 'pointer',
    textTransform: 'uppercase' as const,
  },
};
