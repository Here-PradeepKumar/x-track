import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
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
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setUserDoc(snap.data() as VolunteerUserDoc);
        } else {
          // New device sign-in — volunteer doc created after invite acceptance.
          // Create a placeholder; role will be set to 'volunteer' by Cloud Function
          // when they accept their invite.
          const newDoc = {
            uid: firebaseUser.uid,
            role: 'volunteer' as const,
            displayName: '',
            phone: firebaseUser.phoneNumber ?? null,
            email: null,
            photoURL: null,
            createdAt: serverTimestamp(),
          };
          await setDoc(ref, newDoc);
          const created = await getDoc(ref);
          setUserDoc(created.data() as VolunteerUserDoc);
        }
      } else {
        setUserDoc(null);
      }

      setLoading(false);
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
