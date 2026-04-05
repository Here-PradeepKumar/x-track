"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyEvents = exports.importVolunteersCSV = exports.importBibsCSV = exports.assignVolunteerToMilestone = exports.acceptVolunteerInvite = exports.createVolunteerInvite = exports.acceptOrganizerInvite = exports.createOrganizerInvite = exports.onCheckpointCreated = void 0;
const admin = require("firebase-admin");
const functions = require("firebase-functions");
admin.initializeApp();
const db = admin.firestore();
// ─── onCheckpointCreated ─────────────────────────────────────────────────────
// Fires whenever a volunteer writes a new checkpoint document.
// Updates the denormalised athleteRaces/{athleteUid}_{eventId} document.
exports.onCheckpointCreated = functions.firestore
    .document('checkpoints/{checkpointId}')
    .onCreate(async (snap) => {
    var _a, _b, _c, _d;
    const data = snap.data();
    const { eventId, milestoneId, bibNumber, athleteUid, scannedAt } = data;
    // Fetch milestone metadata for display in the athlete app
    const milestoneSnap = await db
        .doc(`events/${eventId}/milestones/${milestoneId}`)
        .get();
    if (!milestoneSnap.exists) {
        functions.logger.error('Milestone not found', { eventId, milestoneId });
        return;
    }
    const milestone = milestoneSnap.data();
    // Fetch event name
    const eventSnap = await db.doc(`events/${eventId}`).get();
    const eventName = (_b = (_a = eventSnap.data()) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : '';
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
        repCount: (_c = data.repCount) !== null && _c !== void 0 ? _c : null,
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
    }
    else {
        const existing = raceSnap.data();
        const checkpoints = [
            ...((_d = existing.checkpoints) !== null && _d !== void 0 ? _d : []),
            checkpointEntry,
        ];
        const isFinished = milestone.order >= totalMilestones;
        const startedAt = existing.startedAt;
        const totalTimeMs = isFinished
            ? scannedAt.toMillis() - startedAt.toMillis()
            : null;
        await raceRef.update(Object.assign({ currentMilestoneOrder: Math.max(existing.currentMilestoneOrder, milestone.order), checkpoints }, (isFinished
            ? { finishedAt: scannedAt, totalTimeMs }
            : {})));
    }
    functions.logger.info('athleteRaces updated', { raceDocId, milestoneOrder: milestone.order });
});
// ─── createOrganizerInvite ────────────────────────────────────────────────────
// Called by SuperAdmin. Creates a short-lived invitation token.
exports.createOrganizerInvite = functions.https.onCall(async (_data, context) => {
    var _a;
    if (!context.auth)
        throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');
    const callerDoc = await db.doc(`users/${context.auth.uid}`).get();
    if (((_a = callerDoc.data()) === null || _a === void 0 ? void 0 : _a.role) !== 'superadmin') {
        throw new functions.https.HttpsError('permission-denied', 'SuperAdmin only.');
    }
    const ref = db.collection('invitations').doc();
    const expiresAt = admin.firestore.Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
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
exports.acceptOrganizerInvite = functions.https.onCall(async (data, context) => {
    if (!context.auth)
        throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');
    const { inviteId, displayName } = data;
    const inviteRef = db.doc(`invitations/${inviteId}`);
    const inviteSnap = await inviteRef.get();
    if (!inviteSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Invitation not found.');
    }
    const invite = inviteSnap.data();
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
    await db.doc(`users/${uid}`).set(Object.assign(Object.assign({ role: 'organizer' }, (displayName ? { displayName } : {})), { createdAt: admin.firestore.FieldValue.serverTimestamp() }), { merge: true });
    await inviteRef.update({
        usedAt: admin.firestore.FieldValue.serverTimestamp(),
        usedByUid: uid,
    });
    return { success: true };
});
// ─── createVolunteerInvite ────────────────────────────────────────────────────
// Called by an Event Organizer. Ties the invite to a specific event + milestone.
exports.createVolunteerInvite = functions.https.onCall(async (data, context) => {
    var _a, _b;
    if (!context.auth)
        throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');
    const callerDoc = await db.doc(`users/${context.auth.uid}`).get();
    if (((_a = callerDoc.data()) === null || _a === void 0 ? void 0 : _a.role) !== 'organizer') {
        throw new functions.https.HttpsError('permission-denied', 'Organizer only.');
    }
    const { eventId, milestoneId } = data;
    // Verify caller owns this event
    const eventSnap = await db.doc(`events/${eventId}`).get();
    if (!eventSnap.exists || ((_b = eventSnap.data()) === null || _b === void 0 ? void 0 : _b.organizerId) !== context.auth.uid) {
        throw new functions.https.HttpsError('permission-denied', 'Not your event.');
    }
    const ref = db.collection('invitations').doc();
    const expiresAt = admin.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
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
exports.acceptVolunteerInvite = functions.https.onCall(async (data, context) => {
    if (!context.auth)
        throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');
    const { inviteId, displayName } = data;
    const inviteRef = db.doc(`invitations/${inviteId}`);
    const inviteSnap = await inviteRef.get();
    if (!inviteSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Invitation not found.');
    }
    const invite = inviteSnap.data();
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
    await db.doc(`users/${uid}`).set(Object.assign(Object.assign({ role: 'volunteer', assignedEventId: invite.targetEventId, assignedMilestoneId: invite.targetMilestoneId }, (displayName ? { displayName } : {})), { createdAt: admin.firestore.FieldValue.serverTimestamp() }), { merge: true });
    await inviteRef.update({
        usedAt: admin.firestore.FieldValue.serverTimestamp(),
        usedByUid: uid,
    });
    return { success: true, eventId: invite.targetEventId, milestoneId: invite.targetMilestoneId };
});
// ─── assignVolunteerToMilestone ───────────────────────────────────────────────
// Called by Organizer from web. Assigns an existing volunteer user to a milestone.
// Once assigned, the milestone's assignedVolunteerUid cannot be changed.
exports.assignVolunteerToMilestone = functions.https.onCall(async (data, context) => {
    var _a, _b, _c, _d;
    if (!context.auth)
        throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');
    const callerDoc = await db.doc(`users/${context.auth.uid}`).get();
    if (((_a = callerDoc.data()) === null || _a === void 0 ? void 0 : _a.role) !== 'organizer') {
        throw new functions.https.HttpsError('permission-denied', 'Organizer only.');
    }
    const { eventId, milestoneId, volunteerUid } = data;
    const eventSnap = await db.doc(`events/${eventId}`).get();
    if (!eventSnap.exists || ((_b = eventSnap.data()) === null || _b === void 0 ? void 0 : _b.organizerId) !== context.auth.uid) {
        throw new functions.https.HttpsError('permission-denied', 'Not your event.');
    }
    const milestoneRef = db.doc(`events/${eventId}/milestones/${milestoneId}`);
    const milestoneSnap = await milestoneRef.get();
    if (!milestoneSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Milestone not found.');
    }
    // Once assigned, unalterable
    if (((_c = milestoneSnap.data()) === null || _c === void 0 ? void 0 : _c.assignedVolunteerUid) !== null &&
        ((_d = milestoneSnap.data()) === null || _d === void 0 ? void 0 : _d.assignedVolunteerUid) !== undefined) {
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
exports.importBibsCSV = functions.https.onCall(async (data, context) => {
    var _a, _b;
    if (!context.auth)
        throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');
    const callerDoc = await db.doc(`users/${context.auth.uid}`).get();
    if (((_a = callerDoc.data()) === null || _a === void 0 ? void 0 : _a.role) !== 'organizer') {
        throw new functions.https.HttpsError('permission-denied', 'Organizer only.');
    }
    const { eventId, bibs } = data;
    const eventSnap = await db.doc(`events/${eventId}`).get();
    if (!eventSnap.exists || ((_b = eventSnap.data()) === null || _b === void 0 ? void 0 : _b.organizerId) !== context.auth.uid) {
        throw new functions.https.HttpsError('permission-denied', 'Not your event.');
    }
    // Write in batches of 500 (Firestore limit)
    const batches = [];
    let batch = db.batch();
    let count = 0;
    for (const bib of bibs) {
        const ref = db.doc(`events/${eventId}/bibs/${bib.bibNumber}`);
        batch.set(ref, {
            bibNumber: bib.bibNumber,
            eventId,
            athleteUid: '', // linked when athlete signs in and claims their bib
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
    if (count > 0)
        batches.push(batch);
    await Promise.all(batches.map((b) => b.commit()));
    return { imported: bibs.length };
});
// ─── importVolunteersCSV ──────────────────────────────────────────────────────
// Called by Organizer from web. Bulk-writes volunteer roster entries so only
// pre-registered phone numbers can access the volunteer app.
exports.importVolunteersCSV = functions.https.onCall(async (data, context) => {
    var _a, _b;
    if (!context.auth)
        throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');
    const callerDoc = await db.doc(`users/${context.auth.uid}`).get();
    if (((_a = callerDoc.data()) === null || _a === void 0 ? void 0 : _a.role) !== 'organizer') {
        throw new functions.https.HttpsError('permission-denied', 'Organizer only.');
    }
    const { eventId, volunteers } = data;
    const eventSnap = await db.doc(`events/${eventId}`).get();
    if (!eventSnap.exists || ((_b = eventSnap.data()) === null || _b === void 0 ? void 0 : _b.organizerId) !== context.auth.uid) {
        throw new functions.https.HttpsError('permission-denied', 'Not your event.');
    }
    // Normalize phone to E.164 digits only (no leading +)
    const normalizePhone = (raw) => {
        const digits = raw.replace(/\D/g, '');
        if (digits.length === 10)
            return `91${digits}`; // 10-digit Indian
        if (digits.length === 11 && digits.startsWith('0'))
            return `91${digits.slice(1)}`; // 011-digit
        return digits; // already fully qualified or international
    };
    const batches = [];
    let batch = db.batch();
    let count = 0;
    for (const vol of volunteers) {
        const phone = normalizePhone(vol.phone);
        if (!phone)
            continue;
        const ref = db.doc(`events/${eventId}/roster/${phone}`);
        batch.set(ref, {
            phone,
            displayName: vol.displayName || '',
            eventId,
            active: true,
            importedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        count++;
        if (count === 500) {
            batches.push(batch);
            batch = db.batch();
            count = 0;
        }
    }
    if (count > 0)
        batches.push(batch);
    await Promise.all(batches.map((b) => b.commit()));
    return { imported: volunteers.length };
});
// ─── getMyEvents ──────────────────────────────────────────────────────────────
// Called by volunteer app after phone OTP sign-in.
// Returns the list of active events this phone number is registered for.
// Empty result means the phone is not in any roster — app should block access.
exports.getMyEvents = functions.https.onCall(async (_data, context) => {
    if (!context.auth)
        throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');
    const phone = context.auth.token.phone_number;
    if (!phone)
        throw new functions.https.HttpsError('failed-precondition', 'Phone auth required.');
    // Normalize: strip leading +
    const normalizedPhone = phone.replace(/^\+/, '');
    const rosterSnap = await db
        .collectionGroup('roster')
        .where('phone', '==', normalizedPhone)
        .where('active', '==', true)
        .get();
    if (rosterSnap.empty)
        return { events: [] };
    const eventIds = [...new Set(rosterSnap.docs.map((d) => d.data().eventId))];
    const eventSnaps = await Promise.all(eventIds.map((id) => db.doc(`events/${id}`).get()));
    const events = eventSnaps
        .filter((snap) => { var _a; return snap.exists && ((_a = snap.data()) === null || _a === void 0 ? void 0 : _a.status) === 'active'; })
        .map((snap) => {
        var _a, _b;
        return ({
            eventId: snap.id,
            eventName: (_b = (_a = snap.data()) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : '',
        });
    });
    return { events };
});
//# sourceMappingURL=index.js.map