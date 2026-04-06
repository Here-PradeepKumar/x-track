import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, limit } from 'firebase/firestore';
import { db } from '@x-track/firebase';
import { useAuth } from '../context/AuthContext';

export interface BibInfo {
  bibNumber: string;
  wave: string;
  category: string;
  active: boolean;
}

export function useMyBib(eventId: string | null) {
  const { user } = useAuth();
  const [bib, setBib] = useState<BibInfo | null>(null);

  useEffect(() => {
    if (!user || !eventId) { setBib(null); return; }
    const q = query(
      collection(db, `events/${eventId}/bibs`),
      where('athleteUid', '==', user.uid),
      limit(1)
    );
    return onSnapshot(
      q,
      (snap) => {
        if (!snap.empty) {
          const d = snap.docs[0].data();
          setBib({
            bibNumber: snap.docs[0].id,
            wave: d.wave ?? '—',
            category: d.category ?? '—',
            active: d.active ?? false,
          });
        } else {
          setBib(null);
        }
      },
      () => setBib(null)
    );
  }, [user, eventId]);

  return bib;
}
