'use client';

export default function SignOutButton({ style }: { style?: React.CSSProperties }) {
  const signOut = async () => {
    await fetch('/api/auth/session', { method: 'DELETE' });
    window.location.href = '/login';
  };
  return (
    <button onClick={signOut} style={style}>Sign Out</button>
  );
}
