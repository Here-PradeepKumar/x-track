import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth, db, firebaseApp, UserDoc } from '@x-track/firebase';

interface VolunteerUserDoc extends UserDoc {
  assignedEventId?: string;
  assignedMilestoneId?: string;
}

export interface RegisteredEvent {
  eventId: string;
  eventName: string;
}

interface AuthContextValue {
  user: User | null;
  userDoc: VolunteerUserDoc | null;
  loading: boolean;
  notRegistered: boolean;
  registeredEvents: RegisteredEvent[];
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  userDoc: null,
  loading: true,
  notRegistered: false,
  registeredEvents: [],
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<VolunteerUserDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [notRegistered, setNotRegistered] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState<RegisteredEvent[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setNotRegistered(false);
      setRegisteredEvents([]);

      if (firebaseUser) {
        const ref = doc(db, 'users', firebaseUser.uid);
        let initialised = false;

        const unsubscribeDoc = onSnapshot(ref, async (snap) => {
          if (!snap.exists() && !initialised) {
            initialised = true;
            await setDoc(ref, {
              uid: firebaseUser.uid,
              role: 'volunteer' as const,
              displayName: '',
              phone: firebaseUser.phoneNumber ?? null,
              email: null,
              photoURL: null,
              createdAt: serverTimestamp(),
            });
          } else if (snap.exists()) {
            const data = snap.data() as VolunteerUserDoc;
            setUserDoc(data);

            // Auth gate: if no event assigned yet, check roster
            if (!data.assignedEventId) {
              try {
                const functions = getFunctions(firebaseApp);
                const getMyEvents = httpsCallable<void, { events: RegisteredEvent[] }>(
                  functions,
                  'getMyEvents'
                );
                const result = await getMyEvents();
                const events = result.data.events;

                if (events.length === 0) {
                  setNotRegistered(true);
                } else if (events.length === 1) {
                  // Auto-assign to the single event
                  await updateDoc(ref, { assignedEventId: events[0].eventId });
                  // onSnapshot will fire again and data.assignedEventId will be set
                } else {
                  setRegisteredEvents(events);
                }
              } catch {
                setNotRegistered(true);
              }
            }

            setLoading(false);
          }
        });

        return unsubscribeDoc;
      } else {
        setUserDoc(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, userDoc, loading, notRegistered, registeredEvents }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
