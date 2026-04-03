import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, UserDoc } from '@x-track/firebase';

interface VolunteerUserDoc extends UserDoc {
  assignedEventId?: string;
  assignedMilestoneId?: string;
}

interface AuthContextValue {
  user: User | null;
  userDoc: VolunteerUserDoc | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  userDoc: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<VolunteerUserDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const ref = doc(db, 'users', firebaseUser.uid);
        let initialised = false;

        const unsubscribeDoc = onSnapshot(ref, async (snap) => {
          if (!snap.exists() && !initialised) {
            // First sign-in — create placeholder doc; Cloud Function will
            // set assignedEventId + assignedMilestoneId on invite acceptance.
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
            setUserDoc(snap.data() as VolunteerUserDoc);
          }
          setLoading(false);
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
    <AuthContext.Provider value={{ user, userDoc, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
