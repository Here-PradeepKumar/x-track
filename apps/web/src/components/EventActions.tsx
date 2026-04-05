'use client';

import { useTransition, useState } from 'react';
import { activateEvent, completeEvent, discardEvent } from '@/actions/event-actions';

interface Props {
  eventId: string;
  status: string;
}

export default function EventActions({ eventId, status }: Props) {
  const [isPending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState<'discard' | 'complete' | null>(null);

  if (status === 'completed') return null;

  if (confirm) {
    return (
      <div style={styles.row}>
        <span style={styles.confirmText}>
          {confirm === 'discard'
            ? 'Delete this event permanently?'
            : 'Mark as completed? This cannot be undone.'}
        </span>
        <button
          onClick={() => {
            const fn =
              confirm === 'discard'
                ? () => { void discardEvent(eventId); }
                : () => { void completeEvent(eventId); };
            setConfirm(null);
            startTransition(fn);
          }}
          style={confirm === 'discard' ? styles.confirmDelete : styles.confirmComplete}
        >
          {confirm === 'discard' ? 'Delete' : 'Complete'}
        </button>
        <button onClick={() => setConfirm(null)} style={styles.cancelBtn}>
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div style={styles.row}>
      {status === 'draft' && (
        <>
          <button
            onClick={() => startTransition(() => { void activateEvent(eventId); })}
            disabled={isPending}
            style={styles.publishBtn}
          >
            PUBLISH
          </button>
          <button
            onClick={() => setConfirm('discard')}
            disabled={isPending}
            style={styles.discardBtn}
          >
            DISCARD
          </button>
        </>
      )}
      {status === 'active' && (
        <button
          onClick={() => setConfirm('complete')}
          disabled={isPending}
          style={styles.completeBtn}
        >
          MARK COMPLETE
        </button>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  row: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '16px' },
  publishBtn: {
    background: '#cafd00',
    color: '#3a4a00',
    border: 'none',
    borderRadius: '2px',
    padding: '10px 22px',
    fontSize: '11px',
    fontWeight: 900,
    letterSpacing: '1.5px',
    cursor: 'pointer',
  },
  discardBtn: {
    background: 'none',
    color: '#ff7351',
    border: '1px solid rgba(255,115,81,0.4)',
    borderRadius: '2px',
    padding: '10px 22px',
    fontSize: '11px',
    fontWeight: 900,
    letterSpacing: '1.5px',
    cursor: 'pointer',
  },
  completeBtn: {
    background: 'rgba(0,238,252,0.08)',
    color: '#00eefc',
    border: '1px solid rgba(0,238,252,0.35)',
    borderRadius: '2px',
    padding: '10px 22px',
    fontSize: '11px',
    fontWeight: 900,
    letterSpacing: '1.5px',
    cursor: 'pointer',
  },
  confirmText: { fontSize: '12px', color: '#adaaaa', letterSpacing: '0.3px' },
  confirmDelete: {
    background: '#ff7351',
    color: '#fff',
    border: 'none',
    borderRadius: '2px',
    padding: '10px 22px',
    fontSize: '11px',
    fontWeight: 900,
    letterSpacing: '1.5px',
    cursor: 'pointer',
  },
  confirmComplete: {
    background: '#00eefc',
    color: '#001a1e',
    border: 'none',
    borderRadius: '2px',
    padding: '10px 22px',
    fontSize: '11px',
    fontWeight: 900,
    letterSpacing: '1.5px',
    cursor: 'pointer',
  },
  cancelBtn: {
    background: 'none',
    color: '#adaaaa',
    border: '1px solid #333',
    borderRadius: '2px',
    padding: '10px 18px',
    fontSize: '11px',
    cursor: 'pointer',
  },
};
