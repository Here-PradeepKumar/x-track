'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase-client';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';

interface Bib {
  bibNumber: string;
  athletePhone: string;
  nfcTagId: string;
  wave: string;
  category: string;
}

interface Props {
  eventId: string;
  bibs: Bib[];
}

export default function BibsTable({ eventId, bibs: initialBibs }: Props) {
  const [bibs, setBibs] = useState(initialBibs);
  const [newRow, setNewRow] = useState<Partial<Bib>>({});
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const handleAddRow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRow.bibNumber?.trim()) return;
    setSaving(true);
    try {
      await setDoc(doc(db, `events/${eventId}/bibs/${newRow.bibNumber!.trim()}`), {
        bibNumber: newRow.bibNumber!.trim(),
        eventId,
        athleteUid: '',
        athletePhone: newRow.athletePhone?.trim() ?? '',
        nfcTagId: newRow.nfcTagId?.trim() ?? '',
        wave: newRow.wave?.trim() ?? '',
        category: newRow.category?.trim() ?? '',
        registeredAt: serverTimestamp(),
      });
      setBibs([...bibs, { ...newRow } as Bib]);
      setNewRow({});
      setAdding(false);
    } catch (e: any) {
      alert(e.message ?? 'Failed to add BIB.');
    } finally {
      setSaving(false);
    }
  };

  const handleCsvImport = async () => {
    if (!csvFile) return;
    setImporting(true);
    try {
      const text = await csvFile.text();
      const lines = text.split('\n').filter(Boolean);
      const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const rows = lines.slice(1).map((line) => {
        const values = line.split(',');
        return Object.fromEntries(header.map((h, i) => [h, values[i]?.trim() ?? '']));
      });

      const bibsPayload = rows.map((r) => ({
        bibNumber: r['bibnumber'] ?? r['bib'] ?? r['bib_number'] ?? '',
        athletePhone: r['phone'] ?? r['athlete_phone'] ?? '',
        nfcTagId: r['nfctagid'] ?? r['nfc_tag_id'] ?? r['nfc'] ?? '',
        wave: r['wave'] ?? '',
        category: r['category'] ?? '',
      })).filter((b) => b.bibNumber);

      const functions = getFunctions(getApp());
      const importFn = httpsCallable(functions, 'importBibsCSV');
      const result: any = await importFn({ eventId, bibs: bibsPayload });

      alert(`Imported ${result.data.imported} BIBs successfully.`);
      window.location.reload();
    } catch (e: any) {
      alert(e.message ?? 'Import failed.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      {/* CSV Import */}
      <div style={styles.csvRow}>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
          style={styles.fileInput}
        />
        <button onClick={handleCsvImport} disabled={!csvFile || importing} style={styles.importBtn}>
          {importing ? 'Importing...' : 'Import CSV'}
        </button>
        <span style={styles.csvHint}>CSV columns: bibNumber, phone, nfcTagId, wave, category</span>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            {['BIB #', 'Phone', 'NFC Tag ID', 'Wave', 'Category'].map((h) => (
              <th key={h} style={styles.th}>{h.toUpperCase()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bibs.map((b) => (
            <tr key={b.bibNumber} style={styles.tr}>
              <td style={{ ...styles.td, color: '#cafd00', fontWeight: 700 }}>#{b.bibNumber}</td>
              <td style={styles.td}>{b.athletePhone || '—'}</td>
              <td style={{ ...styles.td, fontFamily: 'monospace', fontSize: '12px' }}>{b.nfcTagId || '—'}</td>
              <td style={styles.td}>{b.wave || '—'}</td>
              <td style={styles.td}>{b.category || '—'}</td>
            </tr>
          ))}

          {/* New row form */}
          {adding ? (
            <tr style={styles.tr}>
              {(['bibNumber', 'athletePhone', 'nfcTagId', 'wave', 'category'] as (keyof Bib)[]).map((f) => (
                <td key={f} style={styles.td}>
                  <input
                    value={newRow[f] ?? ''}
                    onChange={(e) => setNewRow((p) => ({ ...p, [f]: e.target.value }))}
                    style={styles.inlineInput}
                    placeholder={f}
                  />
                </td>
              ))}
              <td style={styles.td}>
                <button onClick={handleAddRow as any} disabled={saving} style={styles.saveRowBtn}>
                  {saving ? '…' : '✓'}
                </button>
                <button onClick={() => setAdding(false)} style={styles.cancelRowBtn}>✕</button>
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>

      {!adding && (
        <button onClick={() => setAdding(true)} style={styles.addRowBtn}>+ Add BIB</button>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  csvRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' },
  fileInput: { background: '#131313', border: '1px solid #494847', borderRadius: '2px', padding: '6px 10px', color: '#adaaaa', fontSize: '13px' },
  importBtn: { background: '#00eefc', color: '#003f43', border: 'none', borderRadius: '2px', padding: '8px 16px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', letterSpacing: '1px' },
  csvHint: { fontSize: '11px', color: '#adaaaa', fontFamily: 'monospace' },
  table: { width: '100%', borderCollapse: 'collapse', marginBottom: '12px' },
  th: { fontSize: '9px', color: '#adaaaa', letterSpacing: '3px', padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid #494847' },
  tr: { borderBottom: '1px solid #262626' },
  td: { padding: '12px 14px', fontSize: '13px', color: '#fff' },
  inlineInput: { background: '#262626', border: '1px solid #494847', borderRadius: '2px', padding: '6px 8px', color: '#fff', fontSize: '12px', width: '100%' },
  saveRowBtn: { background: '#cafd00', color: '#3a4a00', border: 'none', borderRadius: '2px', padding: '5px 10px', fontWeight: 700, cursor: 'pointer', marginRight: '4px' },
  cancelRowBtn: { background: 'transparent', color: '#adaaaa', border: '1px solid #494847', borderRadius: '2px', padding: '5px 10px', cursor: 'pointer' },
  addRowBtn: { background: 'transparent', color: '#cafd00', border: '1px dashed #cafd00', borderRadius: '2px', padding: '8px 20px', fontSize: '12px', cursor: 'pointer', letterSpacing: '1px' },
};
