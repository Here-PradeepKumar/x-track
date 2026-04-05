'use client';

import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { importVolunteers } from '@/actions/event-actions';

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
        const wb = XLSX.read(e.target?.result, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (rows.length === 0) { resolve([]); return; }

        const keys = Object.keys(rows[0]);
        const nameKey = keys.find((k) =>
          ['displayname', 'name', 'volunteername', 'volunteer_name'].includes(k.toLowerCase().replace(/\s/g, ''))
        );
        const phoneKey = keys.find((k) =>
          ['phone', 'phonenumber', 'phone_number', 'mobile'].includes(k.toLowerCase().replace(/\s/g, ''))
        );

        if (!phoneKey) { resolve([]); return; }

        resolve(
          rows
            .map((row) => ({
              displayName: nameKey ? String(row[nameKey] ?? '').trim() : '',
              phone: String(row[phoneKey] ?? '').trim(),
            }))
            .filter((v) => v.phone.length > 0)
        );
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

      const res = await importVolunteers(eventId, volunteers);
      setResult(`${res.imported} volunteers imported.`);
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
        <span style={{
          ...styles.result,
          color: result.startsWith('Error') || result.startsWith('No valid') ? '#ff7351' : '#cafd00',
        }}>
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
