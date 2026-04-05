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

export async function updateBib(
  eventId: string,
  bibNumber: string,
  updates: { athletePhone?: string; nfcTagId?: string; wave?: string; category?: string }
) {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if ((await getUserRole(user.uid)) !== 'organizer') redirect('/login');
  const eventSnap = await adminDb.doc(`events/${eventId}`).get();
  if (!eventSnap.exists || eventSnap.data()?.organizerId !== user.uid) redirect('/organizer');
  await adminDb.doc(`events/${eventId}/bibs/${bibNumber}`).update(updates);
  revalidatePath(`/organizer/events/${eventId}/bibs`);
}

export async function removeBib(eventId: string, bibNumber: string) {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if ((await getUserRole(user.uid)) !== 'organizer') redirect('/login');
  const eventSnap = await adminDb.doc(`events/${eventId}`).get();
  if (!eventSnap.exists || eventSnap.data()?.organizerId !== user.uid) redirect('/organizer');
  await adminDb.doc(`events/${eventId}/bibs/${bibNumber}`).delete();
  revalidatePath(`/organizer/events/${eventId}/bibs`);
}

export async function setBibActive(eventId: string, bibNumber: string, active: boolean) {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if ((await getUserRole(user.uid)) !== 'organizer') redirect('/login');
  const eventSnap = await adminDb.doc(`events/${eventId}`).get();
  if (!eventSnap.exists || eventSnap.data()?.organizerId !== user.uid) redirect('/organizer');
  await adminDb.doc(`events/${eventId}/bibs/${bibNumber}`).update({ active });
  revalidatePath(`/organizer/events/${eventId}/bibs`);
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

  const existing = await adminDb.collection(`events/${eventId}/milestones`).count().get();
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

  // Pre-generate refs so IDs are known before committing (needed for category weight map)
  const refs = hyroxMilestones.map(() =>
    adminDb.collection(`events/${eventId}/milestones`).doc()
  );
  const nameToId = Object.fromEntries(refs.map((r, i) => [hyroxMilestones[i].name, r.id]));

  const batch: WriteBatch = adminDb.batch();

  for (let i = 0; i < hyroxMilestones.length; i++) {
    batch.set(refs[i], { ...hyroxMilestones[i], eventId, assignedVolunteerUid: null, assignedAt: null });
  }

  // Seed standard Hyrox categories with per-milestone weights
  type WeightMap = Record<string, number>;
  const categoryDefs: Array<{ id: string; name: string; order: number; weights: WeightMap }> = [
    { id: 'man',         name: 'Man',         order: 1, weights: { 'Sled Push': 102, 'Sled Pull': 78,  'Farmers Carry': 24, 'Sandbag Lunges': 20, 'Wall Balls': 9  } },
    { id: 'super_man',   name: 'Super Man',   order: 2, weights: { 'Sled Push': 152, 'Sled Pull': 102, 'Farmers Carry': 32, 'Sandbag Lunges': 30, 'Wall Balls': 11 } },
    { id: 'women',       name: 'Women',       order: 3, weights: { 'Sled Push': 78,  'Sled Pull': 52,  'Farmers Carry': 16, 'Sandbag Lunges': 10, 'Wall Balls': 6  } },
    { id: 'super_women', name: 'Super Women', order: 4, weights: { 'Sled Push': 102, 'Sled Pull': 78,  'Farmers Carry': 24, 'Sandbag Lunges': 20, 'Wall Balls': 9  } },
  ];

  for (const cat of categoryDefs) {
    const milestoneWeights: Record<string, number | null> = {};
    for (const [name, id] of Object.entries(nameToId)) {
      milestoneWeights[id] = cat.weights[name] ?? null;
    }
    batch.set(adminDb.doc(`events/${eventId}/categories/${cat.id}`), {
      id: cat.id, name: cat.name, order: cat.order, milestoneWeights,
    });
  }

  await batch.commit();
}

// ─── Category actions ─────────────────────────────────────────────────────────

async function verifyOrganizerOwnsEvent(eventId: string) {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if ((await getUserRole(user.uid)) !== 'organizer') redirect('/login');
  const snap = await adminDb.doc(`events/${eventId}`).get();
  if (!snap.exists || snap.data()?.organizerId !== user.uid) redirect('/organizer');
  return user;
}

export async function updateCategoryWeight(
  eventId: string,
  categoryId: string,
  milestoneId: string,
  weight: number | null
) {
  await verifyOrganizerOwnsEvent(eventId);
  await adminDb.doc(`events/${eventId}/categories/${categoryId}`).update({
    [`milestoneWeights.${milestoneId}`]: weight,
  });
  revalidatePath(`/organizer/events/${eventId}/milestones`);
}

export async function addCategory(eventId: string, name: string) {
  await verifyOrganizerOwnsEvent(eventId);
  const existing = await adminDb.collection(`events/${eventId}/categories`).orderBy('order', 'desc').limit(1).get();
  const nextOrder = existing.empty ? 1 : (existing.docs[0].data().order as number) + 1;
  const id = name.toLowerCase().replace(/\s+/g, '_');
  await adminDb.doc(`events/${eventId}/categories/${id}`).set({
    id, name, order: nextOrder, milestoneWeights: {},
  });
  revalidatePath(`/organizer/events/${eventId}/milestones`);
}

export async function removeCategory(eventId: string, categoryId: string) {
  await verifyOrganizerOwnsEvent(eventId);
  await adminDb.doc(`events/${eventId}/categories/${categoryId}`).delete();
  revalidatePath(`/organizer/events/${eventId}/milestones`);
}
