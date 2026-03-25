import { redirect } from 'next/navigation';
import { getSessionUser, getUserRole } from '@/lib/auth-session';
import { adminDb } from '@/lib/firebase-admin';
import CreateOrganizerInviteButton from '@/components/CreateOrganizerInviteButton';

export default async function OrganizersPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if ((await getUserRole(user.uid)) !== 'superadmin') redirect('/login');

  const snap = await adminDb
    .collection('users')
    .where('role', '==', 'organizer')
    .orderBy('createdAt', 'desc')
    .get();

  const organizers = snap.docs.map((d) => ({
    uid: d.id,
    displayName: (d.data().displayName as string) || '—',
    email: (d.data().email as string) || '—',
    createdAt: (d.data().createdAt?.toDate() as Date)?.toLocaleDateString('en-IN') ?? '—',
  }));

  return (
    <main style={styles.page}>
      <a href="/superadmin" style={styles.back}>← Dashboard</a>
      <div style={styles.titleRow}>
        <h1 style={styles.title}>Event Organizers</h1>
        <CreateOrganizerInviteButton />
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            {['Name', 'Email', 'Joined'].map((h) => (
              <th key={h} style={styles.th}>{h.toUpperCase()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {organizers.map((o) => (
            <tr key={o.uid} style={styles.tr}>
              <td style={styles.td}>{o.displayName}</td>
              <td style={styles.td}>{o.email}</td>
              <td style={styles.td}>{o.createdAt}</td>
            </tr>
          ))}
          {organizers.length === 0 && (
            <tr>
              <td colSpan={3} style={{ ...styles.td, color: '#adaaaa', textAlign: 'center', padding: '40px' }}>
                No organizers yet. Create an invite to onboard the first one.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: '960px', margin: '0 auto', padding: '32px 24px' },
  back: { color: '#adaaaa', fontSize: '13px', letterSpacing: '1px', textDecoration: 'none', display: 'block', marginBottom: '24px' },
  titleRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' },
  title: { fontSize: '24px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { fontSize: '9px', color: '#adaaaa', letterSpacing: '3px', padding: '10px 16px', textAlign: 'left', borderBottom: '1px solid #494847' },
  tr: { borderBottom: '1px solid #262626' },
  td: { padding: '16px', fontSize: '14px', color: '#fff' },
};
