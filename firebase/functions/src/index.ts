import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

admin.initializeApp();
const db = admin.firestore();

// ─── Types (mirrors packages/firebase/src/types.ts) ──────────────────────────

interface CheckpointDoc {
  eventId: string;
  milestoneId: string;
  bibNumber: string;
  athleteUid: string;
  volunteerUid: string;
  nfcTagId: string;
  scannedAt: admin.firestore.Timestamp;
}

interface MilestoneDoc {
  name: string;
  order: number;
  distanceMark: string;
}

// ─── onCheckpointCreated ─────────────────────────────────────────────────────
// Fires whenever a volunteer writes a new checkpoint document.
// Updates the denormalised athleteRaces/{athleteUid}_{eventId} document.

export const onCheckpointCreated = functions.firestore
  .document('checkpoints/{checkpointId}')
  .onCreate(async (snap) => {
    const data = snap.data() as CheckpointDoc;
    const { eventId, milestoneId, bibNumber, athleteUid, scannedAt } = data;

    // Fetch milestone metadata for display in the athlete app
    const milestoneSnap = await db
      .doc(`events/${eventId}/milestones/${milestoneId}`)
      .get();

    if (!milestoneSnap.exists) {
      functions.logger.error('Milestone not found', { eventId, milestoneId });
      return;
    }

    const milestone = milestoneSnap.data() as MilestoneDoc;

    // Fetch event name
    const eventSnap = await db.doc(`events/${eventId}`).get();
    const eventName = (eventSnap.data()?.name as string) ?? '';

    // Fetch total milestone count for this event
    const milestonesSnap = await db
      .collection(`events/${eventId}/milestones`)
      .get();
    const totalMilestones = milestonesSnap.size;

    const raceDocId = `${athleteUid}_${eventId}`;
    const raceRef = db.doc(`athleteRaces/${raceDocId}`);
    const raceSnap = await raceRef.get();

    const checkpointEntry = {
      milestoneId,
      milestoneName: milestone.name,
      milestoneOrder: milestone.order,
      distanceMark: milestone.distanceMark,
      scannedAt,
      volunteerUid: data.volunteerUid,
    };

    if (!raceSnap.exists) {
      // First checkpoint → create the race doc
      await raceRef.set({
        id: raceDocId,
        athleteUid,
        eventId,
        eventName,
        bibNumber,
        currentMilestoneOrder: milestone.order,
        totalMilestones,
        checkpoints: [checkpointEntry],
        startedAt: scannedAt,
        finishedAt: null,
        totalTimeMs: null,
      });
    } else {
      const existing = raceSnap.data()!;
      const checkpoints = [
        ...(existing.checkpoints ?? []),
        checkpointEntry,
      ];

      const isFinished = milestone.order >= totalMilestones;
      const startedAt: admin.firestore.Timestamp = existing.startedAt;
      const totalTimeMs = isFinished
        ? scannedAt.toMillis() - startedAt.toMillis()
        : null;

      await raceRef.update({
        currentMilestoneOrder: Math.max(existing.currentMilestoneOrder, milestone.order),
        checkpoints,
        ...(isFinished
          ? { finishedAt: scannedAt, totalTimeMs }
          : {}),
      });
    }

    functions.logger.info('athleteRaces updated', { raceDocId, milestoneOrder: milestone.order });
  });

// ─── createOrganizerInvite ────────────────────────────────────────────────────
// Called by SuperAdmin. Creates a short-lived invitation token.

export const createOrganizerInvite = functions.https.onCall(async (_data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');

  const callerDoc = await db.doc(`users/${context.auth.uid}`).get();
  if (callerDoc.data()?.role !== 'superadmin') {
    throw new functions.https.HttpsError('permission-denied', 'SuperAdmin only.');
  }

  const ref = db.collection('invitations').doc();
  const expiresAt = admin.firestore.Timestamp.fromDate(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  );

  await ref.set({
    id: ref.id,
    type: 'organizer',
    targetEventId: null,
    targetMilestoneId: null,
    createdBy: context.auth.uid,
    expiresAt,
    usedAt: null,
    usedByUid: null,
  });

  return { inviteId: ref.id, expiresAt: expiresAt.toDate().toISOString() };
});

// ─── acceptOrganizerInvite ────────────────────────────────────────────────────
// Called by the new organizer from the web invitation link.

export const acceptOrganizerInvite = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');

  const { inviteId, displayName } = data as { inviteId: string; displayName?: string };
  const inviteRef = db.doc(`invitations/${inviteId}`);
  const inviteSnap = await inviteRef.get();

  if (!inviteSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Invitation not found.');
  }

  const invite = inviteSnap.data()!;

  if (invite.usedAt !== null) {
    throw new functions.https.HttpsError('already-exists', 'Invitation already used.');
  }
  if (invite.expiresAt.toDate() < new Date()) {
    throw new functions.https.HttpsError('deadline-exceeded', 'Invitation expired.');
  }
  if (invite.type !== 'organizer') {
    throw new functions.https.HttpsError('invalid-argument', 'Wrong invitation type.');
  }

  const uid = context.auth.uid;

  // Set role via Admin SDK (client cannot write role field directly)
  await db.doc(`users/${uid}`).set(
    {
      role: 'organizer',
      ...(displayName ? { displayName } : {}),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  await inviteRef.update({
    usedAt: admin.firestore.FieldValue.serverTimestamp(),
    usedByUid: uid,
  });

  return { success: true };
});

// ─── createVolunteerInvite ────────────────────────────────────────────────────
// Called by an Event Organizer. Ties the invite to a specific event + milestone.

export const createVolunteerInvite = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');

  const callerDoc = await db.doc(`users/${context.auth.uid}`).get();
  if (callerDoc.data()?.role !== 'organizer') {
    throw new functions.https.HttpsError('permission-denied', 'Organizer only.');
  }

  const { eventId, milestoneId } = data as { eventId: string; milestoneId: string };

  // Verify caller owns this event
  const eventSnap = await db.doc(`events/${eventId}`).get();
  if (!eventSnap.exists || eventSnap.data()?.organizerId !== context.auth.uid) {
    throw new functions.https.HttpsError('permission-denied', 'Not your event.');
  }

  const ref = db.collection('invitations').doc();
  const expiresAt = admin.firestore.Timestamp.fromDate(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  );

  await ref.set({
    id: ref.id,
    type: 'volunteer',
    targetEventId: eventId,
    targetMilestoneId: milestoneId,
    createdBy: context.auth.uid,
    expiresAt,
    usedAt: null,
    usedByUid: null,
  });

  return { inviteId: ref.id, expiresAt: expiresAt.toDate().toISOString() };
});

// ─── acceptVolunteerInvite ────────────────────────────────────────────────────
// Called by the volunteer from the mobile app after phone OTP sign-in.

export const acceptVolunteerInvite = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');

  const { inviteId, displayName } = data as { inviteId: string; displayName?: string };
  const inviteRef = db.doc(`invitations/${inviteId}`);
  const inviteSnap = await inviteRef.get();

  if (!inviteSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Invitation not found.');
  }

  const invite = inviteSnap.data()!;

  if (invite.usedAt !== null) {
    throw new functions.https.HttpsError('already-exists', 'Invitation already used.');
  }
  if (invite.expiresAt.toDate() < new Date()) {
    throw new functions.https.HttpsError('deadline-exceeded', 'Invitation expired.');
  }
  if (invite.type !== 'volunteer') {
    throw new functions.https.HttpsError('invalid-argument', 'Wrong invitation type.');
  }

  const uid = context.auth.uid;

  // Set role + bind to event/milestone via Admin SDK
  await db.doc(`users/${uid}`).set(
    {
      role: 'volunteer',
      assignedEventId: invite.targetEventId,
      assignedMilestoneId: invite.targetMilestoneId,
      ...(displayName ? { displayName } : {}),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  await inviteRef.update({
    usedAt: admin.firestore.FieldValue.serverTimestamp(),
    usedByUid: uid,
  });

  return { success: true, eventId: invite.targetEventId, milestoneId: invite.targetMilestoneId };
});

// ─── assignVolunteerToMilestone ───────────────────────────────────────────────
// Called by Organizer from web. Assigns an existing volunteer user to a milestone.
// Once assigned, the milestone's assignedVolunteerUid cannot be changed.

export const assignVolunteerToMilestone = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');

  const callerDoc = await db.doc(`users/${context.auth.uid}`).get();
  if (callerDoc.data()?.role !== 'organizer') {
    throw new functions.https.HttpsError('permission-denied', 'Organizer only.');
  }

  const { eventId, milestoneId, volunteerUid } = data as {
    eventId: string;
    milestoneId: string;
    volunteerUid: string;
  };

  const eventSnap = await db.doc(`events/${eventId}`).get();
  if (!eventSnap.exists || eventSnap.data()?.organizerId !== context.auth.uid) {
    throw new functions.https.HttpsError('permission-denied', 'Not your event.');
  }

  const milestoneRef = db.doc(`events/${eventId}/milestones/${milestoneId}`);
  const milestoneSnap = await milestoneRef.get();

  if (!milestoneSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Milestone not found.');
  }

  // Once assigned, unalterable
  if (milestoneSnap.data()?.assignedVolunteerUid !== null &&
      milestoneSnap.data()?.assignedVolunteerUid !== undefined) {
    throw new functions.https.HttpsError('failed-precondition', 'Milestone already assigned.');
  }

  await milestoneRef.update({
    assignedVolunteerUid: volunteerUid,
    assignedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Mirror assignment on the volunteer's user doc
  await db.doc(`users/${volunteerUid}`).update({
    assignedEventId: eventId,
    assignedMilestoneId: milestoneId,
  });

  return { success: true };
});

// ─── importBibsCSV ────────────────────────────────────────────────────────────
// Called by Organizer from web with a parsed array of bib records.
// Bulk-writes to events/{eventId}/bibs/ collection.

export const importBibsCSV = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');

  const callerDoc = await db.doc(`users/${context.auth.uid}`).get();
  if (callerDoc.data()?.role !== 'organizer') {
    throw new functions.https.HttpsError('permission-denied', 'Organizer only.');
  }

  const { eventId, bibs } = data as {
    eventId: string;
    bibs: Array<{
      bibNumber: string;
      athletePhone: string;
      nfcTagId: string;
      wave: string;
      category: string;
    }>;
  };

  const eventSnap = await db.doc(`events/${eventId}`).get();
  if (!eventSnap.exists || eventSnap.data()?.organizerId !== context.auth.uid) {
    throw new functions.https.HttpsError('permission-denied', 'Not your event.');
  }

  // Write in batches of 500 (Firestore limit)
  const batches: ReturnType<typeof db.batch>[] = [];
  let batch = db.batch();
  let count = 0;

  for (const bib of bibs) {
    const ref = db.doc(`events/${eventId}/bibs/${bib.bibNumber}`);
    batch.set(ref, {
      bibNumber: bib.bibNumber,
      eventId,
      athleteUid: '',  // linked when athlete signs in and claims their bib
      athletePhone: bib.athletePhone,
      nfcTagId: bib.nfcTagId,
      wave: bib.wave,
      category: bib.category,
      registeredAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    count++;

    if (count === 500) {
      batches.push(batch);
      batch = db.batch();
      count = 0;
    }
  }

  if (count > 0) batches.push(batch);

  await Promise.all(batches.map((b) => b.commit()));

  return { imported: bibs.length };
});
