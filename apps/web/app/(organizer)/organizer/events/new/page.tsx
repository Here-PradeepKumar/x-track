import { redirect } from 'next/navigation';
import { getSessionUser, getUserRole } from '@/lib/auth-session';
import CreateEventForm from '@/components/CreateEventForm';

export default async function NewEventPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if ((await getUserRole(user.uid)) !== 'organizer') redirect('/login');

  return (
    <main style={styles.page}>
      <a href="/organizer" style={styles.back}>← My Events</a>
      <h1 style={styles.title}>Create New Event</h1>
      <CreateEventForm organizerUid={user.uid} />
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: '640px', margin: '0 auto', padding: '32px 24px' },
  back: { color: '#adaaaa', fontSize: '13px', textDecoration: 'none', display: 'block', marginBottom: '24px' },
  title: { fontSize: '22px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', marginBottom: '32px' },
};
