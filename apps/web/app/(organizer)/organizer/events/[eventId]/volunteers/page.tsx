import { redirect } from 'next/navigation';
import { getSessionUser, getUserRole } from '@/lib/auth-session';
import { adminDb } from '@/lib/firebase-admin';
import CreateVolunteerInviteButton from '@/components/CreateVolunteerInviteButton';
import VolunteersImportButton from '@/components/VolunteersImportButton';

interface Props { params: { eventId: string } }

export default async function VolunteersPage({ params }: Props) {
  const { eventId } = params;
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if ((await getUserRole(user.uid)) !== 'organizer') redirect('/login');

  const eventSnap = await adminDb.doc(`events/${eventId}`).get();
  if (!eventSnap.exists || eventSnap.data()?.organizerId !== user.uid) redirect('/organizer');

  const eventName = eventSnap.data()?.name as string;

  // Fetch milestones to show assignment status
  const milestonesSnap = await adminDb
    .collection(`events/${eventId}/milestones`)
    .orderBy('order', 'asc')
    .get();

  const milestones = milestonesSnap.docs.map((d) => ({
    id: d.id,
    name: d.data().name as string,
    order: d.data().order as number,
    distanceMark: d.data().distanceMark as string,
    assignedVolunteerUid: (d.data().assignedVolunteerUid as string) || null,
  }));

  // Fetch volunteers assigned to this event
  const volunteersSnap = await adminDb
    .collection('users')
    .where('role', '==', 'volunteer')
    .where('assignedEventId', '==', eventId)
    .get();

  const volunteers = volunteersSnap.docs.map((d) => ({
    uid: d.id,
    displayName: (d.data().displayName as string) || 'Unknown',
    phone: (d.data().phone as string) || '—',
    assignedMilestoneId: (d.data().assignedMilestoneId as string) || null,
  }));

  // Fetch imported volunteer roster
  const rosterSnap = await adminDb
    .collection(`events/${eventId}/roster`)
    .orderBy('importedAt', 'desc')
    .limit(200)
    .get();

  const roster = rosterSnap.docs.map((d) => ({
    phone: d.data().phone as string,
    displayName: (d.data().displayName as string) || '—',
  }));

  // Build milestone map for lookup
  const milestoneMap = Object.fromEntries(milestones.map((m) => [m.id, m]));

  const unassignedMilestones = milestones.filter((m) => !m.assignedVolunteerUid);

  return (
    <main style={styles.page}>
      <a href={`/organizer/events/${eventId}`} style={styles.back}>← {eventName}</a>

      <div style={styles.titleRow}>
        <h1 style={styles.title}>Volunteers</h1>
        <div style={styles.titleActions}>
          <VolunteersImportButton eventId={eventId} />
          <CreateVolunteerInviteButton
            eventId={eventId}
            milestones={unassignedMilestones.map((m) => ({ id: m.id, name: m.name, order: m.order }))}
          />
        </div>
      </div>

      {/* Roster — imported phone numbers */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Imported Roster ({roster.length})</h2>
        {roster.length === 0 ? (
          <p style={styles.emptyHint}>
            No volunteers imported yet. Upload a CSV with columns <code style={styles.code}>displayName</code> and <code style={styles.code}>phone</code>.
          </p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                {['Name', 'Phone'].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roster.map((r) => (
                <tr key={r.phone} style={styles.tr}>
                  <td style={styles.td}>{r.displayName}</td>
                  <td style={styles.td}>{r.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Milestone assignment overview */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Milestone Assignment Status</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              {['#', 'Milestone', 'Distance', 'Status'].map((h) => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {milestones.map((m) => {
              const vol = volunteers.find((v) => v.assignedMilestoneId === m.id);
              return (
                <tr key={m.id} style={styles.tr}>
                  <td style={styles.td}>{m.order}</td>
                  <td style={styles.td}>{m.name}</td>
                  <td style={styles.td}>{m.distanceMark}</td>
                  <td style={styles.td}>
                    {vol ? (
                      <span style={styles.assigned}>
                        ● {vol.displayName} ({vol.phone})
                      </span>
                    ) : (
                      <span style={styles.unassigned}>Unassigned</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {milestones.length === 0 && (
              <tr>
                <td colSpan={4} style={styles.empty}>
                  No milestones yet. Add milestones first.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Volunteer list */}
      {volunteers.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Registered Volunteers ({volunteers.length})</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                {['Name', 'Phone', 'Assigned Milestone'].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {volunteers.map((v) => {
                const milestone = v.assignedMilestoneId
                  ? milestoneMap[v.assignedMilestoneId]
                  : null;
                return (
                  <tr key={v.uid} style={styles.tr}>
                    <td style={styles.td}>{v.displayName}</td>
                    <td style={styles.td}>{v.phone}</td>
                    <td style={styles.td}>
                      {milestone ? (
                        <span>
                          #{milestone.order} — {milestone.name}{' '}
                          <span style={styles.lock}>🔒</span>
                        </span>
                      ) : (
                        <span style={styles.unassigned}>Pending assignment</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: '960px', margin: '0 auto', padding: '32px 24px' },
  back: { color: '#adaaaa', fontSize: '13px', textDecoration: 'none', display: 'block', marginBottom: '24px' },
  titleRow: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', gap: '16px', flexWrap: 'wrap' },
  titleActions: { display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' },
  emptyHint: { fontSize: '13px', color: '#494847', letterSpacing: '0.3px' },
  code: { fontFamily: 'monospace', background: '#1a1a1a', padding: '1px 5px', borderRadius: '2px', fontSize: '12px' },
  title: { fontSize: '22px', fontWeight: 900, color: '#fff' },
  section: { marginBottom: '40px' },
  sectionTitle: { fontSize: '11px', color: '#adaaaa', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { fontSize: '9px', color: '#adaaaa', letterSpacing: '3px', padding: '10px 16px', textAlign: 'left', borderBottom: '1px solid #494847' },
  tr: { borderBottom: '1px solid #262626' },
  td: { padding: '14px 16px', fontSize: '14px', color: '#fff' },
  assigned: { color: '#cafd00', fontSize: '12px', letterSpacing: '0.5px' },
  unassigned: { color: '#494847', fontSize: '12px', letterSpacing: '1px' },
  lock: { fontSize: '11px' },
  empty: { padding: '40px', textAlign: 'center', color: '#adaaaa', fontSize: '13px' },
};
