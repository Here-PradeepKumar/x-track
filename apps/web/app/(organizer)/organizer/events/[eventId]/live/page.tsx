import { redirect } from 'next/navigation';
import { getSessionUser, getUserRole } from '@/lib/auth-session';
import { adminDb } from '@/lib/firebase-admin';
import LiveFeed from '@/components/LiveFeed';

interface Props { params: { eventId: string } }

export default async function LivePage({ params }: Props) {
  const { eventId } = params;
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if ((await getUserRole(user.uid)) !== 'organizer') redirect('/login');

  const eventSnap = await adminDb.doc(`events/${eventId}`).get();
  if (!eventSnap.exists || eventSnap.data()?.organizerId !== user.uid) redirect('/organizer');

  return (
    <main style={styles.page}>
      <a href={`/organizer/events/${eventId}`} style={styles.back}>← {eventSnap.data()?.name}</a>
      <div style={styles.titleRow}>
        <h1 style={styles.title}>Live Feed</h1>
        <div style={styles.liveChip}>
          <div style={styles.liveDot} />
          <span style={styles.liveText}>LIVE</span>
        </div>
      </div>
      <LiveFeed eventId={eventId} />
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: '960px', margin: '0 auto', padding: '32px 24px' },
  back: { color: '#adaaaa', fontSize: '13px', textDecoration: 'none', display: 'block', marginBottom: '24px' },
  titleRow: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' },
  title: { fontSize: '22px', fontWeight: 900, color: '#fff' },
  liveChip: { display: 'flex', alignItems: 'center', gap: '8px', background: '#131313', padding: '6px 12px', borderRadius: '2px', border: '1px solid #ff7351' },
  liveDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#ff7351', animation: 'pulse 1.2s ease-in-out infinite' },
  liveText: { fontSize: '10px', color: '#ff7351', letterSpacing: '3px', fontWeight: 700 },
};
