import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, MilestoneDoc } from '@x-track/firebase';

export function useMilestones(eventId: string | null) {
  const [milestones, setMilestones] = useState<MilestoneDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) { setMilestones([]); setLoading(false); return; }
    const q = query(
      collection(db, `events/${eventId}/milestones`),
      orderBy('order', 'asc')
    );
    return onSnapshot(
      q,
      (snap) => {
        setMilestones(snap.docs.map((d) => ({ id: d.id, ...d.data() } as MilestoneDoc)));
        setLoading(false);
      },
      () => { setMilestones([]); setLoading(false); }
    );
  }, [eventId]);

  return { milestones, loading };
}
