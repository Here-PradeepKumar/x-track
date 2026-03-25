import { redirect } from 'next/navigation';
import { getSessionUser, getUserRole } from '@/lib/auth-session';
import { adminDb } from '@/lib/firebase-admin';

export default async function SuperAdminDashboard() {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const role = await getUserRole(user.uid);
  if (role !== 'superadmin') redirect('/login');

  // Aggregate counts
  const [organizersSnap, eventsSnap] = await Promise.all([
    adminDb.collection('users').where('role', '==', 'organizer').count().get(),
    adminDb.collection('events').count().get(),
  ]);

  const stats = {
    organizers: organizersSnap.data().count,
    events: eventsSnap.data().count,
  };

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <span style={styles.brand}>X-TRACK</span>
        <span style={styles.roleChip}>SUPER ADMIN</span>
      </header>

      <h1 style={styles.pageTitle}>Dashboard</h1>

      <div style={styles.statsGrid}>
        <StatCard label="Event Organizers" value={stats.organizers} />
        <StatCard label="Total Events" value={stats.events} />
      </div>

      <div style={styles.navLinks}>
        <a href="/superadmin/organizers" style={styles.navLink}>
          Manage Organizers →
        </a>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={styles.statCard}>
      <p style={styles.statLabel}>{label.toUpperCase()}</p>
      <p style={styles.statValue}>{value}</p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: '960px', margin: '0 auto', padding: '32px 24px' },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '40px',
  },
  brand: {
    fontSize: '22px',
    fontWeight: 900,
    color: '#cafd00',
    letterSpacing: '-1px',
    fontStyle: 'italic',
  },
  roleChip: {
    fontSize: '9px',
    color: '#cafd00',
    letterSpacing: '3px',
    border: '1px solid #cafd00',
    padding: '3px 8px',
    borderRadius: '2px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: 900,
    color: '#fff',
    letterSpacing: '-0.5px',
    marginBottom: '24px',
  },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' },
  statCard: {
    background: '#131313',
    padding: '24px',
    borderRadius: '2px',
    borderLeft: '4px solid #cafd00',
  },
  statLabel: { fontSize: '9px', color: '#adaaaa', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' },
  statValue: { fontSize: '40px', fontWeight: 900, color: '#fff', letterSpacing: '-1px' },
  navLinks: { display: 'flex', flexDirection: 'column', gap: '8px' },
  navLink: { color: '#cafd00', fontSize: '14px', letterSpacing: '1px', textDecoration: 'none' },
};
