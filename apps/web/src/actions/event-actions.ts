'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Timestamp, WriteBatch } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { getSessionUser, getUserRole } from '@/lib/auth-session';

export async function createEvent(formData: FormData) {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if ((await getUserRole(user.uid)) !== 'organizer') redirect('/login');

  const name = (formData.get('name') as string).trim();
  const location = (formData.get('location') as string).trim();
  const description = (formData.get('description') as string | null)?.trim() ?? '';
  const dateStr = formData.get('date') as string;
  const raceType = (formData.get('raceType') as string) ?? 'custom';

  const ref = await adminDb.collection('events').add({
    organizerId: user.uid,
    name,
    location,
    description,
    date: Timestamp.fromDate(new Date(dateStr)),
    status: 'draft',
    coverImageUrl: null,
    createdAt: Timestamp.now(),
  });

  if (raceType === 'hyrox') {
    await createHyroxMilestones(ref.id);
  }

  redirect(`/organizer/events/${ref.id}`);
}

export async function activateEvent(eventId: string) {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if ((await getUserRole(user.uid)) !== 'organizer') redirect('/login');

  const ref = adminDb.doc(`events/${eventId}`);
  const snap = await ref.get();
  if (!snap.exists || snap.data()?.organizerId !== user.uid) redirect('/organizer');

  await ref.update({ status: 'active' });
  redirect(`/organizer/events/${eventId}`);
}

export async function completeEvent(eventId: string) {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if ((await getUserRole(user.uid)) !== 'organizer') redirect('/login');

  const ref = adminDb.doc(`events/${eventId}`);
  const snap = await ref.get();
  if (!snap.exists || snap.data()?.organizerId !== user.uid) redirect('/organizer');

  await ref.update({ status: 'completed' });
  redirect(`/organizer/events/${eventId}`);
}

export async function discardEvent(eventId: string) {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if ((await getUserRole(user.uid)) !== 'organizer') redirect('/login');

  const ref = adminDb.doc(`events/${eventId}`);
  const snap = await ref.get();
  if (!snap.exists || snap.data()?.organizerId !== user.uid) redirect('/organizer');
  if (snap.data()?.status !== 'draft') throw new Error('Only draft events can be discarded.');

  await ref.delete();
  redirect('/organizer');
}

export async function importBibs(
  eventId: string,
  bibs: Array<{ bibNumber: string; athletePhone: string; nfcTagId: string; wave: string; category: string }>
) {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if ((await getUserRole(user.uid)) !== 'organizer') redirect('/login');

  const eventSnap = await adminDb.doc(`events/${eventId}`).get();
  if (!eventSnap.exists || eventSnap.data()?.organizerId !== user.uid) redirect('/organizer');

  let batch = adminDb.batch();
  let count = 0;
  let total = 0;

  for (const bib of bibs) {
    if (!bib.bibNumber) continue;
    const ref = adminDb.doc(`events/${eventId}/bibs/${bib.bibNumber}`);
    batch.set(ref, {
      bibNumber: bib.bibNumber,
      eventId,
      athleteUid: '',
      athletePhone: bib.athletePhone ?? '',
      nfcTagId: bib.nfcTagId ?? '',
      wave: bib.wave ?? '',
      category: bib.category ?? '',
      registeredAt: Timestamp.now(),
    });
    count++;
    total++;
    if (count === 500) {
      await batch.commit();
      batch = adminDb.batch();
      count = 0;
    }
  }
  if (count > 0) await batch.commit();

  revalidatePath(`/organizer/events/${eventId}/bibs`);
  return { imported: total };
}

export async function importVolunteers(
  eventId: string,
  volunteers: Array<{ displayName: string; phone: string }>
) {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if ((await getUserRole(user.uid)) !== 'organizer') redirect('/login');

  const eventSnap = await adminDb.doc(`events/${eventId}`).get();
  if (!eventSnap.exists || eventSnap.data()?.organizerId !== user.uid) redirect('/organizer');

  const normalizePhone = (raw: string): string => {
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 10) return `91${digits}`;
    if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
    return digits;
  };

  let batch = adminDb.batch();
  let count = 0;
  let total = 0;

  for (const vol of volunteers) {
    const phone = normalizePhone(vol.phone);
    if (!phone) continue;
    const ref = adminDb.doc(`events/${eventId}/roster/${phone}`);
    batch.set(ref, {
      phone,
      displayName: vol.displayName || '',
      eventId,
      active: true,
      importedAt: Timestamp.now(),
    }, { merge: true });
    count++;
    total++;
    if (count === 500) {
      await batch.commit();
      batch = adminDb.batch();
      count = 0;
    }
  }
  if (count > 0) await batch.commit();

  revalidatePath(`/organizer/events/${eventId}/volunteers`);
  return { imported: total };
}

export async function setVolunteerActive(eventId: string, phone: string, active: boolean) {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if ((await getUserRole(user.uid)) !== 'organizer') redirect('/login');

  const eventSnap = await adminDb.doc(`events/${eventId}`).get();
  if (!eventSnap.exists || eventSnap.data()?.organizerId !== user.uid) redirect('/organizer');

  await adminDb.doc(`events/${eventId}/roster/${phone}`).update({ active });
  revalidatePath(`/organizer/events/${eventId}/volunteers`);
}

export async function removeVolunteerFromRoster(eventId: string, phone: string) {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if ((await getUserRole(user.uid)) !== 'organizer') redirect('/login');

  const eventSnap = await adminDb.doc(`events/${eventId}`).get();
  if (!eventSnap.exists || eventSnap.data()?.organizerId !== user.uid) redirect('/organizer');

  await adminDb.doc(`events/${eventId}/roster/${phone}`).delete();
  revalidatePath(`/organizer/events/${eventId}/volunteers`);
}

export async function createHyroxMilestones(eventId: string) {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if ((await getUserRole(user.uid)) !== 'organizer') redirect('/login');

  // Guard: don't overwrite existing milestones
  const existing = await adminDb
    .collection(`events/${eventId}/milestones`)
    .count()
    .get();
  if (existing.data().count > 0) {
    throw new Error('This event already has milestones. Clear them first.');
  }

  const hyroxMilestones = [
    { order: 1,  name: 'Run 1',             distanceMark: '1 KM RUN',        stationType: 'run',     requiresRepCount: false, repTarget: null },
    { order: 2,  name: 'SkiErg',            distanceMark: '1000m SKIERG',    stationType: 'station', requiresRepCount: false, repTarget: null },
    { order: 3,  name: 'Run 2',             distanceMark: '1 KM RUN',        stationType: 'run',     requiresRepCount: false, repTarget: null },
    { order: 4,  name: 'Sled Push',         distanceMark: '50m SLED PUSH',   stationType: 'station', requiresRepCount: false, repTarget: null },
    { order: 5,  name: 'Run 3',             distanceMark: '1 KM RUN',        stationType: 'run',     requiresRepCount: false, repTarget: null },
    { order: 6,  name: 'Sled Pull',         distanceMark: '50m SLED PULL',   stationType: 'station', requiresRepCount: false, repTarget: null },
    { order: 7,  name: 'Run 4',             distanceMark: '1 KM RUN',        stationType: 'run',     requiresRepCount: false, repTarget: null },
    { order: 8,  name: 'Burpee Broad Jump', distanceMark: '80m / 80 REPS',   stationType: 'station', requiresRepCount: true,  repTarget: 80  },
    { order: 9,  name: 'Run 5',             distanceMark: '1 KM RUN',        stationType: 'run',     requiresRepCount: false, repTarget: null },
    { order: 10, name: 'Rowing',            distanceMark: '1000m ROW',       stationType: 'station', requiresRepCount: false, repTarget: null },
    { order: 11, name: 'Run 6',             distanceMark: '1 KM RUN',        stationType: 'run',     requiresRepCount: false, repTarget: null },
    { order: 12, name: 'Farmers Carry',     distanceMark: '200m CARRY',      stationType: 'station', requiresRepCount: false, repTarget: null },
    { order: 13, name: 'Run 7',             distanceMark: '1 KM RUN',        stationType: 'run',     requiresRepCount: false, repTarget: null },
    { order: 14, name: 'Sandbag Lunges',    distanceMark: '100m / 100 REPS', stationType: 'station', requiresRepCount: true,  repTarget: 100 },
    { order: 15, name: 'Run 8',             distanceMark: '1 KM RUN',        stationType: 'run',     requiresRepCount: false, repTarget: null },
    { order: 16, name: 'Wall Balls',        distanceMark: '100 REPS',        stationType: 'station', requiresRepCount: true,  repTarget: 100 },
  ];

  const batch: WriteBatch = adminDb.batch();
  for (const m of hyroxMilestones) {
    const ref = adminDb.collection(`events/${eventId}/milestones`).doc();
    batch.set(ref, {
      ...m,
      eventId,
      assignedVolunteerUid: null,
      assignedAt: null,
    });
  }
  await batch.commit();
}
