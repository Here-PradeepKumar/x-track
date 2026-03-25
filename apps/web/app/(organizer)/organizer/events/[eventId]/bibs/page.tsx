import { redirect } from 'next/navigation';
import { getSessionUser, getUserRole } from '@/lib/auth-session';
import { adminDb } from '@/lib/firebase-admin';
import BibsTable from '@/components/BibsTable';

interface Props { params: { eventId: string } }

export default async function BibsPage({ params }: Props) {
  const { eventId } = params;
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if ((await getUserRole(user.uid)) !== 'organizer') redirect('/login');

  const eventSnap = await adminDb.doc(`events/${eventId}`).get();
  if (!eventSnap.exists || eventSnap.data()?.organizerId !== user.uid) redirect('/organizer');

  const snap = await adminDb
    .collection(`events/${eventId}/bibs`)
    .orderBy('registeredAt', 'asc')
    .limit(200)
    .get();

  const bibs = snap.docs.map((d) => ({
    bibNumber: d.id,
    athletePhone: d.data().athletePhone as string,
    nfcTagId: d.data().nfcTagId as string,
    wave: d.data().wave as string,
    category: d.data().category as string,
  }));

  return (
    <main style={styles.page}>
      <a href={`/organizer/events/${eventId}`} style={styles.back}>← {eventSnap.data()?.name}</a>
      <h1 style={styles.title}>BIB Management</h1>
      <BibsTable eventId={eventId} bibs={bibs} />
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: '960px', margin: '0 auto', padding: '32px 24px' },
  back: { color: '#adaaaa', fontSize: '13px', textDecoration: 'none', display: 'block', marginBottom: '24px' },
  title: { fontSize: '22px', fontWeight: 900, color: '#fff', marginBottom: '24px' },
};
