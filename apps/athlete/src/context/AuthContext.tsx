import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth, db, firebaseApp, UserDoc } from '@x-track/firebase';

interface AuthContextValue {
  user: User | null;
  userDoc: UserDoc | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  userDoc: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const ref = doc(db, 'users', firebaseUser.uid);
        const snap = await getDoc(ref);

        const claimBibs = () => {
          if (firebaseUser.phoneNumber) {
            const fns = getFunctions(firebaseApp);
            httpsCallable(fns, 'claimMyBibs')().catch(() => {});
          }
        };

        if (snap.exists()) {
          setUserDoc(snap.data() as UserDoc);
          claimBibs();
        } else {
          // First sign-in: create athlete user doc
          const newDoc: Omit<UserDoc, 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> } = {
            uid: firebaseUser.uid,
            role: 'athlete',
            displayName: firebaseUser.displayName ?? '',
            phone: firebaseUser.phoneNumber ?? null,
            email: firebaseUser.email ?? null,
            photoURL: firebaseUser.photoURL ?? null,
            createdAt: serverTimestamp() as any,
          };
          await setDoc(ref, newDoc);
          const created = await getDoc(ref);
          setUserDoc(created.data() as UserDoc);
          claimBibs();
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
