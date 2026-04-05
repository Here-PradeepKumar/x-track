'use client';

import { useState, useRef } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { initializeApp, getApps, getApp } from 'firebase/app';

// Initialise (or reuse) Firebase app on client
function getFirebaseApp() {
  if (getApps().length > 0) return getApp();
  return initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  });
}

interface Props {
  eventId: string;
}

interface ParsedVolunteer {
  displayName: string;
  phone: string;
}

export default function VolunteersImportButton({ eventId }: Props) {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): ParsedVolunteer[] => {
    const lines = text.split('\n').filter((l) => l.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/\s+/g, ''));

    const nameIdx = headers.findIndex((h) => ['displayname', 'name', 'volunteerName', 'volunteer_name'].includes(h));
    const phoneIdx = headers.findIndex((h) => ['phone', 'phonenumber', 'phone_number', 'mobile'].includes(h));

    if (phoneIdx === -1) return [];

    return lines
      .slice(1)
      .map((line) => {
        const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
        return {
          displayName: nameIdx >= 0 ? (cols[nameIdx] ?? '') : '',
          phone: cols[phoneIdx] ?? '',
        };
      })
      .filter((v) => v.phone.length > 0);
  };

  const handleImport = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    setImporting(true);
    setResult(null);

    try {
      const text = await file.text();
      const volunteers = parseCSV(text);

      if (volunteers.length === 0) {
        setResult('No valid rows found. Check CSV format.');
        return;
      }

      const app = getFirebaseApp();
      const functions = getFunctions(app, 'us-central1');
      const importFn = httpsCallable(functions, 'importVolunteersCSV');
      const res = await importFn({ eventId, volunteers }) as any;

      setResult(`${res.data.imported} volunteers imported successfully.`);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err: any) {
      setResult(`Error: ${err?.message ?? 'Import failed'}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <input
        ref={fileRef}
        type="file"
        accept=".csv"
        style={styles.fileInput}
        onChange={() => setResult(null)}
      />
      <button
        onClick={handleImport}
        disabled={importing}
        style={styles.btn}
      >
        {importing ? 'Importing…' : 'Import CSV'}
      </button>
      {result && (
        <span style={{ ...styles.result, color: result.startsWith('Error') ? '#ff7351' : '#cafd00' }}>
          {result}
        </span>
      )}
      <span style={styles.hint}>CSV columns: displayName, phone (10-digit or +91 format)</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  fileInput: {
    fontSize: '12px',
    color: '#adaaaa',
    background: 'none',
    border: '1px solid #494847',
    borderRadius: '2px',
    padding: '6px 10px',
    cursor: 'pointer',
  },
  btn: {
    background: '#1a1a1a',
    color: '#cafd00',
    border: '1px solid rgba(202,253,0,0.4)',
    borderRadius: '2px',
    padding: '8px 18px',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '1px',
    cursor: 'pointer',
  },
  result: { fontSize: '12px', letterSpacing: '0.3px' },
  hint: { fontSize: '10px', color: '#494847', letterSpacing: '0.5px', width: '100%' },
};
