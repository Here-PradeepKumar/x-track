import { getFirestore } from 'firebase/firestore';
import { firebaseApp } from './config';

export const db = getFirestore(firebaseApp);

// ─── Collection path constants ────────────────────────────────────────────────

export const COLLECTIONS = {
  users: 'users',
  invitations: 'invitations',
  events: 'events',
  checkpoints: 'checkpoints',
  athleteRaces: 'athleteRaces',
} as const;

export const SUBCOLLECTIONS = {
  milestones: 'milestones',
  bibs: 'bibs',
} as const;

// ─── Path helpers ─────────────────────────────────────────────────────────────

export const paths = {
  user: (uid: string) => `${COLLECTIONS.users}/${uid}`,
  invitation: (id: string) => `${COLLECTIONS.invitations}/${id}`,
  event: (id: string) => `${COLLECTIONS.events}/${id}`,
  milestone: (eventId: string, milestoneId: string) =>
    `${COLLECTIONS.events}/${eventId}/${SUBCOLLECTIONS.milestones}/${milestoneId}`,
  bib: (eventId: string, bibNumber: string) =>
    `${COLLECTIONS.events}/${eventId}/${SUBCOLLECTIONS.bibs}/${bibNumber}`,
  checkpoint: (id: string) => `${COLLECTIONS.checkpoints}/${id}`,
  athleteRace: (athleteUid: string, eventId: string) =>
    `${COLLECTIONS.athleteRaces}/${athleteUid}_${eventId}`,
};
