import { redirect } from 'next/navigation';
import { getSessionUser, getUserRole } from '@/lib/auth-session';
import { adminDb } from '@/lib/firebase-admin';
import Link from 'next/link';

export default async function OrganizerDashboard() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if ((await getUserRole(user.uid)) !== 'organizer') redirect('/login');

  const snap = await adminDb
    .collection('events')
    .where('organizerId', '==', user.uid)
    .orderBy('createdAt', 'desc')
    .get();

  const events = snap.docs.map((d) => ({
    id: d.id,
    name: d.data().name as string,
    date: (d.data().date?.toDate() as Date)?.toLocaleDateString('en-IN') ?? '—',
    location: d.data().location as string,
    status: d.data().status as string,
  }));

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <span style={styles.brand}>X-TRACK</span>
        <span style={styles.chip}>ORGANIZER</span>
        <a href="/api/auth/session" onClick={async (e) => {
          e.preventDefault();
          await fetch('/api/auth/session', { method: 'DELETE' });
          window.location.href = '/login';
        }} style={styles.signOut}>Sign Out</a>
      </header>

      <div style={styles.titleRow}>
        <h1 style={styles.title}>My Events</h1>
        <a href="/organizer/events/new" style={styles.btn}>+ New Event</a>
      </div>

      <div style={styles.eventGrid}>
        {events.map((ev) => (
          <Link key={ev.id} href={`/organizer/events/${ev.id}`} style={styles.eventCard}>
            <div style={styles.eventTop}>
              <span style={styles.eventStatus(ev.status)}>{ev.status.toUpperCase()}</span>
              <span style={styles.eventDate}>{ev.date}</span>
            </div>
            <p style={styles.eventName}>{ev.name}</p>
            <p style={styles.eventLocation}>{ev.location}</p>
          </Link>
        ))}
        {events.length === 0 && (
          <p style={styles.empty}>No events yet. Create your first event to get started.</p>
        )}
      </div>
    </main>
  );
}

function eventStatusColor(status: string) {
  if (status === 'active') return '#cafd00';
  if (status === 'completed') return '#00eefc';
  return '#adaaaa';
}

const styles: Record<string, any> = {
  page: { maxWidth: '960px', margin: '0 auto', padding: '32px 24px' },
  header: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' },
  brand: { fontSize: '20px', fontWeight: 900, color: '#cafd00', fontStyle: 'italic', letterSpacing: '-0.5px', marginRight: 'auto' },
  chip: { fontSize: '9px', color: '#cafd00', border: '1px solid #cafd00', padding: '3px 8px', borderRadius: '2px', letterSpacing: '2px' },
  signOut: { fontSize: '12px', color: '#adaaaa', textDecoration: 'none', letterSpacing: '1px' },
  titleRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' },
  title: { fontSize: '24px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' },
  btn: { background: '#cafd00', color: '#3a4a00', padding: '10px 20px', borderRadius: '2px', fontSize: '12px', fontWeight: 900, letterSpacing: '1px', textDecoration: 'none' },
  eventGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' },
  eventCard: {
    background: '#131313',
    padding: '20px',
    borderRadius: '2px',
    display: 'block',
    textDecoration: 'none',
    borderLeft: '4px solid #cafd00',
    transition: 'background 0.15s',
  },
  eventTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' },
  eventStatus: (status: string) => ({
    fontSize: '9px',
    color: eventStatusColor(status),
    letterSpacing: '2px',
    textTransform: 'uppercase',
    border: `1px solid ${eventStatusColor(status)}`,
    padding: '2px 7px',
    borderRadius: '2px',
  }),
  eventDate: { fontSize: '11px', color: '#adaaaa', letterSpacing: '1px' },
  eventName: { fontSize: '18px', fontWeight: 900, color: '#fff', letterSpacing: '-0.3px', marginBottom: '4px' },
  eventLocation: { fontSize: '12px', color: '#adaaaa', letterSpacing: '1px' },
  empty: { color: '#adaaaa', fontSize: '14px', padding: '40px 0' },
};
