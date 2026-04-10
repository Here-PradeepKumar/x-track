'use client';

import { useState, useTransition } from 'react';
import { setVolunteerActive, removeVolunteerFromRoster, updateVolunteer } from '@/actions/event-actions';

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

  const handleToggle = () => {
    startTransition(() => { void setVolunteerActive(eventId, phone, !active); });
  };

  const handleRemove = () => {
    if (!confirm(`Remove ${phone} from the roster? They will no longer be able to log in.`)) return;
    startTransition(() => { void removeVolunteerFromRoster(eventId, phone); });
  };

  const handleSave = () => {
    startTransition(() => {
      void updateVolunteer(eventId, phone, nameInput).then(() => setEditing(false));
    });
  };

  const handleCancel = () => {
    setNameInput(displayName);
    setEditing(false);
  };

  if (editing) {
    return (
      <div style={styles.editRow}>
        <input
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          style={styles.input}
          autoFocus
          disabled={pending}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel(); }}
        />
        <button onClick={handleSave} disabled={pending || !nameInput.trim()} style={styles.save}>
          {pending ? '…' : 'Save'}
        </button>
        <button onClick={handleCancel} disabled={pending} style={styles.cancelBtn}>
          Cancel
        </button>
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
  editRow: { display: 'flex', gap: '8px', alignItems: 'center' },
  input: {
    background: '#1a1a1a',
    border: '1px solid #494847',
    borderRadius: '2px',
    color: '#fff',
    fontSize: '13px',
    padding: '4px 8px',
    outline: 'none',
    width: '160px',
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
