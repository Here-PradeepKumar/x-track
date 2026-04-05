import { redirect } from 'next/navigation';
import { getSessionUser, getUserRole } from '@/lib/auth-session';
import { adminDb } from '@/lib/firebase-admin';
import AddMilestoneForm from '@/components/AddMilestoneForm';
import CategoryWeightsEditor from '@/components/CategoryWeightsEditor';

interface Props { params: { eventId: string } }

export default async function MilestonesPage({ params }: Props) {
  const { eventId } = params;
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if ((await getUserRole(user.uid)) !== 'organizer') redirect('/login');

  const eventSnap = await adminDb.doc(`events/${eventId}`).get();
  if (!eventSnap.exists || eventSnap.data()?.organizerId !== user.uid) redirect('/organizer');

  const [milestonesSnap, categoriesSnap] = await Promise.all([
    adminDb.collection(`events/${eventId}/milestones`).orderBy('order', 'asc').get(),
    adminDb.collection(`events/${eventId}/categories`).orderBy('order', 'asc').get(),
  ]);

  const milestones = milestonesSnap.docs.map((d) => ({
    id: d.id,
    name: d.data().name as string,
    order: d.data().order as number,
    distanceMark: d.data().distanceMark as string,
    stationType: (d.data().stationType as string) ?? 'station',
    assignedVolunteerUid: (d.data().assignedVolunteerUid as string) || null,
  }));

  const categories = categoriesSnap.docs.map((d) => ({
    id: d.id,
    name: d.data().name as string,
    order: d.data().order as number,
    milestoneWeights: (d.data().milestoneWeights ?? {}) as Record<string, number | null>,
  }));

  // Only station-type milestones are shown in the weight matrix (runs have no weight)
  const stationMilestones = milestones.filter((m) => m.stationType === 'station');

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
            {['#', 'Name', 'Target', 'Type', 'Volunteer'].map((h) => (
              <th key={h} style={styles.th}>{h.toUpperCase()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {milestones.map((m) => (
            <tr key={m.id} style={styles.tr}>
              <td style={styles.td}>{m.order}</td>
              <td style={styles.td}>{m.name}</td>
              <td style={{ ...styles.td, color: '#adaaaa', fontSize: '12px', fontFamily: 'monospace' }}>{m.distanceMark}</td>
              <td style={styles.td}>
                {m.stationType === 'run'
                  ? <span style={styles.typeRun}>RUN</span>
                  : <span style={styles.typeStation}>STATION</span>}
              </td>
              <td style={styles.td}>
                {m.assignedVolunteerUid
                  ? <span style={styles.assigned}>● Assigned</span>
                  : <span style={styles.unassigned}>Unassigned</span>}
              </td>
            </tr>
          ))}
          {milestones.length === 0 && (
            <tr><td colSpan={5} style={styles.empty}>No milestones yet.</td></tr>
          )}
        </tbody>
      </table>

      {/* Category weight matrix — only shown when milestones exist */}
      {milestones.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Categories &amp; Weights</h2>
          <p style={styles.sectionHint}>
            Weights (kg) per station per category. Shown to volunteers during entry.
            Run segments are excluded — they carry no weight.
          </p>
          <CategoryWeightsEditor
            eventId={eventId}
            stations={stationMilestones}
            categories={categories}
          />
        </div>
      )}
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: '960px', margin: '0 auto', padding: '32px 24px' },
  back: { color: '#adaaaa', fontSize: '13px', textDecoration: 'none', display: 'block', marginBottom: '24px' },
  titleRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' },
  title: { fontSize: '22px', fontWeight: 900, color: '#fff' },
  table: { width: '100%', borderCollapse: 'collapse', marginBottom: '40px' },
  th: { fontSize: '9px', color: '#adaaaa', letterSpacing: '3px', padding: '10px 16px', textAlign: 'left', borderBottom: '1px solid #494847', textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid #1e1e1e' },
  td: { padding: '12px 16px', fontSize: '14px', color: '#fff' },
  typeRun: { fontSize: '9px', color: '#adaaaa', letterSpacing: '2px', fontWeight: 700 },
  typeStation: { fontSize: '9px', color: '#cafd00', letterSpacing: '2px', fontWeight: 700 },
  assigned: { color: '#cafd00', fontSize: '12px', letterSpacing: '1px' },
  unassigned: { color: '#494847', fontSize: '12px', letterSpacing: '1px' },
  empty: { padding: '40px', textAlign: 'center', color: '#adaaaa', fontSize: '13px' },
  section: { marginTop: '8px' },
  sectionTitle: { fontSize: '11px', color: '#adaaaa', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' },
  sectionHint: { fontSize: '12px', color: '#494847', marginBottom: '20px', lineHeight: '1.5' },
};
