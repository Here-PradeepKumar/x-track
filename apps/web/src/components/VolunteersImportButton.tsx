'use client';

import { useState, useRef } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { initializeApp, getApps, getApp } from 'firebase/app';
import * as XLSX from 'xlsx';

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

function parseWorkbook(file: File): Promise<ParsedVolunteer[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const wb = XLSX.read(data, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (rows.length === 0) { resolve([]); return; }

        // Find columns case-insensitively
        const sample = rows[0];
        const keys = Object.keys(sample);
        const nameKey = keys.find((k) =>
          ['displayname', 'name', 'volunteername', 'volunteer_name'].includes(k.toLowerCase().replace(/\s/g, ''))
        );
        const phoneKey = keys.find((k) =>
          ['phone', 'phonenumber', 'phone_number', 'mobile'].includes(k.toLowerCase().replace(/\s/g, ''))
        );

        if (!phoneKey) { resolve([]); return; }

        const volunteers: ParsedVolunteer[] = rows
          .map((row) => ({
            displayName: nameKey ? String(row[nameKey] ?? '').trim() : '',
            phone: String(row[phoneKey] ?? '').trim(),
          }))
          .filter((v) => v.phone.length > 0);

        resolve(volunteers);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export default function VolunteersImportButton({ eventId }: Props) {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) { setResult('Please select a file first.'); return; }

    setImporting(true);
    setResult(null);

    try {
      const volunteers = await parseWorkbook(file);

      if (volunteers.length === 0) {
        setResult('No valid rows found. Make sure columns are named "displayName" and "phone".');
        return;
      }

      const app = getFirebaseApp();
      const functions = getFunctions(app, 'us-central1');
      const importFn = httpsCallable(functions, 'importVolunteersCSV');
      const res = await importFn({ eventId, volunteers }) as any;

      setResult(`${res.data.imported} volunteers imported.`);
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
        accept=".csv,.xlsx,.xls"
        style={styles.fileInput}
        onChange={() => setResult(null)}
      />
      <button onClick={handleImport} disabled={importing} style={styles.btn}>
        {importing ? 'Importing…' : 'Import'}
      </button>
      {result && (
        <span style={{ ...styles.result, color: result.startsWith('Error') || result.startsWith('No valid') ? '#ff7351' : '#cafd00' }}>
          {result}
        </span>
      )}
      <span style={styles.hint}>Accepts .xlsx or .csv — columns: displayName, phone</span>
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
    background: '#cafd00',
    color: '#0e0e0f',
    border: 'none',
    borderRadius: '2px',
    padding: '8px 20px',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '1px',
    cursor: 'pointer',
    textTransform: 'uppercase' as const,
  },
  result: { fontSize: '12px', letterSpacing: '0.3px' },
  hint: { fontSize: '10px', color: '#494847', letterSpacing: '0.5px', width: '100%' },
};
