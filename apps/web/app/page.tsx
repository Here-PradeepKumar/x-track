import { redirect } from 'next/navigation';
import { getSessionUser, getUserRole } from '@/lib/auth-session';

export default async function RootPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login');
  }

  const role = await getUserRole(user.uid);

  if (role === 'superadmin') redirect('/superadmin');
  if (role === 'organizer') redirect('/organizer');

  // Unknown role — go to login
  redirect('/login');
}
