'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase-client';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';

interface CheckpointEntry {
  id: string;
  bibNumber: string;
  milestoneId: string;
  volunteerUid: string;
  scannedAt: Timestamp | null;
}

export default function LiveFeed({ eventId }: { eventId: string }) {
  const [checkpoints, setCheckpoints] = useState<CheckpointEntry[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'checkpoints'),
      where('eventId', '==', eventId),
      orderBy('scannedAt', 'desc'),
      limit(50)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setConnected(true);
        setCheckpoints(
          snap.docs.map((d) => ({
            id: d.id,
            bibNumber: d.data().bibNumber,
            milestoneId: d.data().milestoneId,
            volunteerUid: d.data().volunteerUid,
            scannedAt: d.data().scannedAt ?? null,
          }))
        );
      },
      () => setConnected(false)
    );

    return unsub;
  }, [eventId]);

  return (
    <div>
      <p style={styles.hint}>Showing last 50 check-ins. Updates in real-time.</p>
      <table style={styles.table}>
        <thead>
          <tr>
            {['Time', 'BIB #', 'Milestone ID', 'Volunteer ID'].map((h) => (
              <th key={h} style={styles.th}>{h.toUpperCase()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {checkpoints.map((cp) => (
            <tr key={cp.id} style={styles.tr}>
              <td style={styles.td}>
                {cp.scannedAt?.toDate?.()?.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                }) ?? '—'}
              </td>
              <td style={{ ...styles.td, color: '#cafd00', fontWeight: 700 }}>#{cp.bibNumber}</td>
              <td style={{ ...styles.td, fontFamily: 'monospace', fontSize: '12px', color: '#adaaaa' }}>
                {cp.milestoneId.slice(0, 12)}…
              </td>
              <td style={{ ...styles.td, fontFamily: 'monospace', fontSize: '12px', color: '#adaaaa' }}>
                {cp.volunteerUid.slice(0, 12)}…
              </td>
            </tr>
          ))}
          {checkpoints.length === 0 && (
            <tr>
              <td colSpan={4} style={{ ...styles.td, textAlign: 'center', color: '#adaaaa', padding: '40px' }}>
                No check-ins yet. Waiting for volunteer scans…
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  hint: { fontSize: '12px', color: '#adaaaa', marginBottom: '16px', letterSpacing: '0.5px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { fontSize: '9px', color: '#adaaaa', letterSpacing: '3px', padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid #494847' },
  tr: { borderBottom: '1px solid #1a1919' },
  td: { padding: '12px 14px', fontSize: '13px', color: '#fff' },
};
