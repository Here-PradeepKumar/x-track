import { Timestamp } from 'firebase/firestore';

// ─── User Roles ───────────────────────────────────────────────────────────────

export type UserRole = 'superadmin' | 'organizer' | 'volunteer' | 'athlete';

export interface UserDoc {
  uid: string;
  role: UserRole;
  displayName: string;
  phone: string | null;       // volunteers + athletes
  email: string | null;       // admins + organizers
  photoURL: string | null;
  createdAt: Timestamp;
}

// ─── Invitations ─────────────────────────────────────────────────────────────

export type InvitationType = 'organizer' | 'volunteer';

export interface InvitationDoc {
  id: string;
  type: InvitationType;
  targetEventId: string | null;       // null for organizer invites
  targetMilestoneId: string | null;   // null for zone coordinators
  createdBy: string;                  // superadmin uid
  expiresAt: Timestamp;
  usedAt: Timestamp | null;
  usedByUid: string | null;
}

// ─── Events ──────────────────────────────────────────────────────────────────

export type EventStatus = 'draft' | 'active' | 'completed';

export interface EventDoc {
  id: string;
  organizerId: string;
  name: string;
  date: Timestamp;
  location: string;
  description: string;
  coverImageUrl: string | null;
  status: EventStatus;
  createdAt: Timestamp;
}

// ─── Milestones (sub-collection of events) ───────────────────────────────────

export type StationType = 'run' | 'station';

export interface MilestoneDoc {
  id: string;
  eventId: string;
  name: string;               // e.g. "Wall Balls"
  order: number;              // 1, 2, 3 …
  distanceMark: string;       // e.g. "100 REPS"
  stationType: StationType;   // 'run' | 'station'
  requiresRepCount: boolean;  // true for Burpee, Lunges, Wall Balls
  repTarget: number | null;   // e.g. 100 for Wall Balls, null for runs
  assignedVolunteerUid: string | null;
  assignedAt: Timestamp | null;
}

// ─── BIBs (sub-collection of events) ─────────────────────────────────────────

export interface BibDoc {
  bibNumber: string;          // doc ID
  eventId: string;
  athleteUid: string;
  athletePhone: string;
  nfcTagId: string | null;    // null for events without NFC wristbands (e.g. Hyrox)
  wave: string;
  category: string;
  registeredAt: Timestamp;
}

// ─── Checkpoints (top-level, high-write) ─────────────────────────────────────

export type CheckpointEntryMethod = 'nfc' | 'manual';

export interface CheckpointDoc {
  id: string;
  eventId: string;
  milestoneId: string;
  bibNumber: string;
  athleteUid: string;
  volunteerUid: string;
  nfcTagId: string | null;          // null for manual-entry events
  repCount: number | null;          // for rep-count stations (Wall Balls, etc.)
  entryMethod: CheckpointEntryMethod;
  scannedAt: Timestamp;
}

// ─── Athlete Races (denormalised, updated by Cloud Function) ─────────────────

export interface CheckpointEntry {
  milestoneId: string;
  milestoneName: string;
  milestoneOrder: number;
  distanceMark: string;
  repCount: number | null;
  scannedAt: Timestamp;
  volunteerUid: string;
}

export interface AthleteRaceDoc {
  id: string;                 // "{athleteUid}_{eventId}"
  athleteUid: string;
  eventId: string;
  eventName: string;
  bibNumber: string;
  currentMilestoneOrder: number;
  totalMilestones: number;
  checkpoints: CheckpointEntry[];
  startedAt: Timestamp | null;
  finishedAt: Timestamp | null;
  totalTimeMs: number | null;
}
