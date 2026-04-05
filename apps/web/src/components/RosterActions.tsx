'use client';

import { useTransition } from 'react';
import { setVolunteerActive, removeVolunteerFromRoster } from '@/actions/event-actions';

interface Props {
  eventId: string;
  phone: string;
  active: boolean;
}

export default function RosterActions({ eventId, phone, active }: Props) {
  const [pending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(() => { void setVolunteerActive(eventId, phone, !active); });
  };

  const handleRemove = () => {
    if (!confirm(`Remove ${phone} from the roster? They will no longer be able to log in.`)) return;
    startTransition(() => { void removeVolunteerFromRoster(eventId, phone); });
  };

  return (
    <div style={styles.row}>
      <button
        onClick={handleToggle}
        disabled={pending}
        style={active ? styles.deactivate : styles.activate}
      >
        {active ? 'Deactivate' : 'Activate'}
      </button>
      <button
        onClick={handleRemove}
        disabled={pending}
        style={styles.remove}
      >
        Remove
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  row: { display: 'flex', gap: '8px' },
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
