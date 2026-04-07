import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, CategoryDoc } from '@x-track/firebase';

export function useCategoryWeights(eventId: string | null, category: string | null) {
  const [weights, setWeights] = useState<Record<string, number | null>>({});

  useEffect(() => {
    if (!eventId || !category) { setWeights({}); return; }
    const ref = doc(db, `events/${eventId}/categories/${category}`);
    return onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setWeights((snap.data() as CategoryDoc).milestoneWeights ?? {});
        } else {
          setWeights({});
        }
      },
      () => setWeights({})
    );
  }, [eventId, category]);

  return weights;
}
