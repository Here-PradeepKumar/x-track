import { redirect } from 'next/navigation';
import { getSessionUser, getUserRole } from '@/lib/auth-session';
import { adminDb } from '@/lib/firebase-admin';
import Link from 'next/link';
import EventActions from '@/components/EventActions';

interface Props { params: { eventId: string } }

export default async function EventDetailPage({ params }: Props) {
  const { eventId } = params;
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if ((await getUserRole(user.uid)) !== 'organizer') redirect('/login');

  const eventSnap = await adminDb.doc(`events/${eventId}`).get();
  if (!eventSnap.exists || eventSnap.data()?.organizerId !== user.uid) {
    redirect('/organizer');
  }

  const event = { id: eventSnap.id, ...eventSnap.data() } as any;

  // Count sub-collections
  const [milestonesCount, rosterCount, bibsCount, checkpointsCount] = await Promise.all([
    adminDb.collection(`events/${eventId}/milestones`).count().get(),
    adminDb.collection(`events/${eventId}/roster`).count().get(),
    adminDb.collection(`events/${eventId}/bibs`).count().get(),
    adminDb.collection('checkpoints').where('eventId', '==', eventId).count().get(),
  ]);

  const tabs = [
    { label: 'Milestones', href: `/organizer/events/${eventId}/milestones`, count: milestonesCount.data().count },
    { label: 'Volunteers', href: `/organizer/events/${eventId}/volunteers`, count: rosterCount.data().count },
    { label: 'BIBs', href: `/organizer/events/${eventId}/bibs`, count: bibsCount.data().count },
    { label: 'Live Feed', href: `/organizer/events/${eventId}/live`, count: checkpointsCount.data().count },
  ];

  return (
    <main style={styles.page}>
      <a href="/organizer" style={styles.back}>← My Events</a>

      {/* Event Header */}
      <div style={styles.eventHeader}>
        <div style={styles.statusRow}>
          <span style={styles.status(event.status)}>{event.status?.toUpperCase()}</span>
          <span style={styles.date}>
            {event.date?.toDate?.()?.toLocaleDateString('en-IN') ?? '—'}
          </span>
        </div>
        <h1 style={styles.eventName}>{event.name}</h1>
        <p style={styles.location}>{event.location}</p>
        <EventActions eventId={eventId} status={event.status} />
      </div>

      {/* Navigation tiles */}
      <div style={styles.tileGrid}>
        {tabs.map((tab) => (
          <Link key={tab.label} href={tab.href} style={styles.tile}>
            {tab.count !== null && <p style={styles.tileCount}>{tab.count}</p>}
            <p style={styles.tileLabel}>{tab.label}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}

const styles: Record<string, any> = {
  page: { maxWidth: '960px', margin: '0 auto', padding: '32px 24px' },
  back: { color: '#adaaaa', fontSize: '13px', textDecoration: 'none', display: 'block', marginBottom: '24px', letterSpacing: '0.5px' },
  eventHeader: { marginBottom: '32px' },
  statusRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' },
  status: (s: string) => ({
    fontSize: '9px',
    color: s === 'active' ? '#cafd00' : s === 'completed' ? '#00eefc' : '#adaaaa',
    border: `1px solid ${s === 'active' ? '#cafd00' : s === 'completed' ? '#00eefc' : '#494847'}`,
    padding: '3px 8px',
    borderRadius: '2px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
  }),
  date: { fontSize: '12px', color: '#adaaaa', letterSpacing: '1px' },
  eventName: { fontSize: '32px', fontWeight: 900, color: '#fff', letterSpacing: '-1px', marginBottom: '4px' },
  location: { fontSize: '14px', color: '#adaaaa', letterSpacing: '0.5px' },
  tileGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' },
  tile: {
    background: '#131313',
    padding: '28px',
    borderRadius: '2px',
    borderLeft: '4px solid #cafd00',
    textDecoration: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  tileCount: { fontSize: '40px', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px' },
  tileLabel: { fontSize: '11px', color: '#adaaaa', letterSpacing: '3px', textTransform: 'uppercase' },
};
