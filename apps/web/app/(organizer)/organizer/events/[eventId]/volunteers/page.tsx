import { redirect } from 'next/navigation';
import { getSessionUser, getUserRole } from '@/lib/auth-session';
import { adminDb } from '@/lib/firebase-admin';
import VolunteersImportButton from '@/components/VolunteersImportButton';
import RosterActions from '@/components/RosterActions';

interface Props { params: { eventId: string } }

export default async function VolunteersPage({ params }: Props) {
  const { eventId } = params;
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if ((await getUserRole(user.uid)) !== 'organizer') redirect('/login');

  const eventSnap = await adminDb.doc(`events/${eventId}`).get();
  if (!eventSnap.exists || eventSnap.data()?.organizerId !== user.uid) redirect('/organizer');

  const eventName = eventSnap.data()?.name as string;

  const rosterSnap = await adminDb
    .collection(`events/${eventId}/roster`)
    .orderBy('importedAt', 'desc')
    .limit(200)
    .get();

  const roster = rosterSnap.docs.map((d) => ({
    phone: d.data().phone as string,
    displayName: (d.data().displayName as string) || '—',
    active: (d.data().active as boolean) ?? true,
  }));

  const activeCount = roster.filter((r) => r.active).length;
  const inactiveCount = roster.length - activeCount;

  return (
    <main style={styles.page}>
      <a href={`/organizer/events/${eventId}`} style={styles.back}>← {eventName}</a>

      <div style={styles.titleRow}>
        <div>
          <h1 style={styles.title}>Volunteers</h1>
          {roster.length > 0 && (
            <p style={styles.subtitle}>
              {activeCount} active{inactiveCount > 0 ? ` · ${inactiveCount} inactive` : ''}
            </p>
          )}
        </div>
        <VolunteersImportButton eventId={eventId} />
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Roster ({roster.length})</h2>

        {roster.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyTitle}>No volunteers imported yet.</p>
            <p style={styles.emptyHint}>
              Upload a CSV with columns <code style={styles.code}>displayName</code> and{' '}
              <code style={styles.code}>phone</code>. Imported volunteers are active by default
              and can log in to the volunteer app.
            </p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                {['Name', 'Phone', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roster.map((r) => (
                <tr key={r.phone} style={styles.tr}>
                  <td style={styles.td}>{r.displayName}</td>
                  <td style={{ ...styles.td, fontFamily: 'monospace', fontSize: '13px', color: '#adaaaa' }}>
                    {r.phone}
                  </td>
                  <td style={styles.td}>
                    {r.active ? (
                      <span style={styles.badgeActive}>● Active</span>
                    ) : (
                      <span style={styles.badgeInactive}>● Inactive</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    <RosterActions eventId={eventId} phone={r.phone} active={r.active} displayName={r.displayName === '—' ? '' : r.displayName} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: '960px', margin: '0 auto', padding: '32px 24px' },
  back: { color: '#adaaaa', fontSize: '13px', textDecoration: 'none', display: 'block', marginBottom: '24px' },
  titleRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '32px',
    gap: '16px',
    flexWrap: 'wrap',
  },
  title: { fontSize: '22px', fontWeight: 900, color: '#fff', marginBottom: '4px' },
  subtitle: { fontSize: '12px', color: '#adaaaa', letterSpacing: '0.5px' },
  section: { marginBottom: '40px' },
  sectionTitle: {
    fontSize: '11px',
    color: '#adaaaa',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    marginBottom: '16px',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    fontSize: '9px',
    color: '#adaaaa',
    letterSpacing: '3px',
    padding: '10px 16px',
    textAlign: 'left',
    borderBottom: '1px solid #494847',
    textTransform: 'uppercase',
  },
  tr: { borderBottom: '1px solid #1e1e1e' },
  td: { padding: '14px 16px', fontSize: '14px', color: '#fff', verticalAlign: 'middle' },
  badgeActive: {
    color: '#cafd00',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.5px',
  },
  badgeInactive: {
    color: '#494847',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.5px',
  },
  emptyState: {
    border: '1px dashed #333',
    borderRadius: '4px',
    padding: '40px 32px',
  },
  emptyTitle: { fontSize: '14px', color: '#adaaaa', marginBottom: '8px' },
  emptyHint: { fontSize: '12px', color: '#494847', lineHeight: '1.6' },
  code: {
    fontFamily: 'monospace',
    background: '#1a1a1a',
    padding: '1px 5px',
    borderRadius: '2px',
    fontSize: '12px',
  },
};
