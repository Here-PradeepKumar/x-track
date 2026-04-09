import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, getUserRole } from '@/lib/auth-session';
import { adminDb, adminStorage } from '@/lib/firebase-admin';

interface Params { params: { eventId: string } }

export async function POST(req: NextRequest, { params }: Params) {
  const { eventId } = params;

  // Verify organizer owns this event
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  if ((await getUserRole(user.uid)) !== 'organizer') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const eventSnap = await adminDb.doc(`events/${eventId}`).get();
  if (!eventSnap.exists || eventSnap.data()?.organizerId !== user.uid) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Read uploaded file
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType = file.type || 'image/jpeg';

  // Upload via Admin SDK — bypasses Storage security rules
  const storagePath = `events/${eventId}/cover`;
  const bucketFile = adminStorage.bucket().file(storagePath);
  const token = crypto.randomUUID();

  await bucketFile.save(buffer, {
    contentType,
    metadata: {
      metadata: { firebaseStorageDownloadTokens: token },  // custom metadata — must be nested
    },
  });

  const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!;
  const encodedPath = encodeURIComponent(storagePath);
  const url = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media&token=${token}`;

  // Persist URL on the event doc
  await adminDb.doc(`events/${eventId}`).update({ coverImageUrl: url });

  return NextResponse.json({ url });
}
