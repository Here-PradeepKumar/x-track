import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  Unsubscribe,
  doc,
} from 'firebase/firestore';
import { db, AthleteRaceDoc } from '@x-track/firebase';
import { useAuth } from '../context/AuthContext';

export function useActiveRace() {
  const { user } = useAuth();
  const [raceDoc, setRaceDoc] = useState<AthleteRaceDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRaceDoc(null);
      setLoading(false);
      return;
    }

    // Query for the athlete's most recent race that isn't completed
    const q = query(
      collection(db, 'athleteRaces'),
      where('athleteUid', '==', user.uid),
      where('finishedAt', '==', null),
      orderBy('startedAt', 'desc'),
      limit(1)
    );

    const unsub: Unsubscribe = onSnapshot(
      q,
      (snap) => {
        if (!snap.empty) {
          setRaceDoc({ id: snap.docs[0].id, ...snap.docs[0].data() } as AthleteRaceDoc);
        } else {
          setRaceDoc(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('[useActiveRace] query failed:', err.code, err.message);
        setRaceDoc(null);
        setLoading(false);
      }
    );

    return unsub;
  }, [user]);

  return { raceDoc, loading };
}

export function useCompletedRaces() {
  const { user } = useAuth();
  const [races, setRaces] = useState<AthleteRaceDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRaces([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'athleteRaces'),
      where('athleteUid', '==', user.uid),
      where('finishedAt', '!=', null),
      orderBy('finishedAt', 'desc')
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setRaces(snap.docs.map((d) => ({ id: d.id, ...d.data() } as AthleteRaceDoc)));
        setLoading(false);
      },
      () => { setRaces([]); setLoading(false); }
    );

    return unsub;
  }, [user]);

  return { races, loading };
}
