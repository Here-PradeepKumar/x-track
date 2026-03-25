import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, EventDoc } from '@x-track/firebase';

export function useActiveEvents() {
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'events'),
      where('status', '==', 'active'),
      orderBy('date', 'asc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() } as EventDoc)));
      setLoading(false);
    });

    return unsub;
  }, []);

  return { events, loading };
}
