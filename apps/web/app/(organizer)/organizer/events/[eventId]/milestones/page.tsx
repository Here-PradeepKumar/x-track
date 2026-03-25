import { redirect } from 'next/navigation';
import { getSessionUser, getUserRole } from '@/lib/auth-session';
import { adminDb } from '@/lib/firebase-admin';
import AddMilestoneForm from '@/components/AddMilestoneForm';

interface Props { params: { eventId: string } }

export default async function MilestonesPage({ params }: Props) {
  const { eventId } = params;
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if ((await getUserRole(user.uid)) !== 'organizer') redirect('/login');

  const eventSnap = await adminDb.doc(`events/${eventId}`).get();
  if (!eventSnap.exists || eventSnap.data()?.organizerId !== user.uid) redirect('/organizer');

  const snap = await adminDb
    .collection(`events/${eventId}/milestones`)
    .orderBy('order', 'asc')
    .get();

  const milestones = snap.docs.map((d) => ({
    id: d.id,
    name: d.data().name as string,
    order: d.data().order as number,
    distanceMark: d.data().distanceMark as string,
    assignedVolunteerUid: (d.data().assignedVolunteerUid as string) || null,
  }));

  return (
    <main style={styles.page}>
      <a href={`/organizer/events/${eventId}`} style={styles.back}>← {eventSnap.data()?.name}</a>
      <div style={styles.titleRow}>
        <h1 style={styles.title}>Milestones</h1>
        <AddMilestoneForm eventId={eventId} nextOrder={milestones.length + 1} />
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            {['#', 'Name', 'Distance', 'Volunteer'].map((h) => (
              <th key={h} style={styles.th}>{h.toUpperCase()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {milestones.map((m) => (
            <tr key={m.id} style={styles.tr}>
              <td style={styles.td}>{m.order}</td>
              <td style={styles.td}>{m.name}</td>
              <td style={styles.td}>{m.distanceMark}</td>
              <td style={styles.td}>
                {m.assignedVolunteerUid
                  ? <span style={styles.assigned}>● Assigned</span>
                  : <span style={styles.unassigned}>Unassigned</span>}
              </td>
            </tr>
          ))}
          {milestones.length === 0 && (
            <tr><td colSpan={4} style={styles.empty}>No milestones yet.</td></tr>
          )}
        </tbody>
      </table>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: '960px', margin: '0 auto', padding: '32px 24px' },
  back: { color: '#adaaaa', fontSize: '13px', textDecoration: 'none', display: 'block', marginBottom: '24px' },
  titleRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' },
  title: { fontSize: '22px', fontWeight: 900, color: '#fff' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { fontSize: '9px', color: '#adaaaa', letterSpacing: '3px', padding: '10px 16px', textAlign: 'left', borderBottom: '1px solid #494847' },
  tr: { borderBottom: '1px solid #262626' },
  td: { padding: '14px 16px', fontSize: '14px', color: '#fff' },
  assigned: { color: '#cafd00', fontSize: '12px', letterSpacing: '1px' },
  unassigned: { color: '#adaaaa', fontSize: '12px', letterSpacing: '1px' },
  empty: { padding: '40px', textAlign: 'center', color: '#adaaaa', fontSize: '13px' },
};
