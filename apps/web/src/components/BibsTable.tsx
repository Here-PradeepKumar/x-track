'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { importBibs } from '@/actions/event-actions';

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

function parseWorkbook(file: File): Promise<Bib[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        const normalize = (key: string) => key.toLowerCase().replace(/[\s_]/g, '');

        resolve(
          rows
            .map((row) => {
              const get = (...aliases: string[]) => {
                const k = Object.keys(row).find((k) => aliases.includes(normalize(k)));
                return k ? String(row[k] ?? '').trim() : '';
              };
              return {
                bibNumber: get('bibnumber', 'bib', 'bibnr', 'number'),
                athletePhone: get('phone', 'athletephone', 'mobile', 'phonenumber'),
                nfcTagId: get('nfctagid', 'nfc', 'nfctag', 'tagid'),
                wave: get('wave'),
                category: get('category', 'cat'),
              };
            })
            .filter((b) => b.bibNumber.length > 0)
        );
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function downloadSampleBibs() {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([['bibNumber', 'phone', 'nfcTagId', 'wave', 'category']]);
  ws['!cols'] = [{ wch: 12 }, { wch: 16 }, { wch: 20 }, { wch: 10 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws, 'BIBs');
  XLSX.writeFile(wb, 'bib_import_template.xlsx');
}

export default function BibsTable({ eventId, bibs: initialBibs }: Props) {
  const [bibs, setBibs] = useState(initialBibs);
  const [newRow, setNewRow] = useState<Partial<Bib>>({});
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);

  const handleAddRow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRow.bibNumber?.trim()) return;
    setSaving(true);
    try {
      await importBibs(eventId, [{
        bibNumber: newRow.bibNumber!.trim(),
        athletePhone: newRow.athletePhone?.trim() ?? '',
        nfcTagId: newRow.nfcTagId?.trim() ?? '',
        wave: newRow.wave?.trim() ?? '',
        category: newRow.category?.trim() ?? '',
      }]);
      setBibs([...bibs, { ...newRow } as Bib]);
      setNewRow({});
      setAdding(false);
    } catch (err: any) {
      alert(err.message ?? 'Failed to add BIB.');
    } finally {
      setSaving(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    try {
      const parsed = await parseWorkbook(file);
      if (parsed.length === 0) {
        setImportResult('No valid rows found. Check that columns are: bibNumber, phone, wave, category.');
        return;
      }
      const res = await importBibs(eventId, parsed);
      setImportResult(`${res.imported} BIBs imported.`);
      setFile(null);
      // Refresh bib list
      window.location.reload();
    } catch (err: any) {
      setImportResult(`Error: ${err?.message ?? 'Import failed'}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      {/* Import row */}
      <div style={styles.importRow}>
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => { setFile(e.target.files?.[0] ?? null); setImportResult(null); }}
          style={styles.fileInput}
        />
        <button onClick={handleImport} disabled={!file || importing} style={styles.importBtn}>
          {importing ? 'Importing…' : 'Import'}
        </button>
        <button onClick={downloadSampleBibs} style={styles.sampleBtn}>
          ↓ Sample Excel
        </button>
        {importResult && (
          <span style={{
            ...styles.importResult,
            color: importResult.startsWith('Error') || importResult.startsWith('No valid') ? '#ff7351' : '#cafd00',
          }}>
            {importResult}
          </span>
        )}
        <span style={styles.hint}>Accepts .xlsx or .csv — columns: bibNumber, phone, nfcTagId, wave, category</span>
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

          {adding && (
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
          )}
        </tbody>
      </table>

      {!adding && (
        <button onClick={() => setAdding(true)} style={styles.addRowBtn}>+ Add BIB</button>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  importRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' },
  fileInput: { background: '#131313', border: '1px solid #494847', borderRadius: '2px', padding: '6px 10px', color: '#adaaaa', fontSize: '13px' },
  importBtn: { background: '#00eefc', color: '#003f43', border: 'none', borderRadius: '2px', padding: '8px 16px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase' as const },
  sampleBtn: { background: 'transparent', color: '#adaaaa', border: '1px solid #333', borderRadius: '2px', padding: '8px 14px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.5px' },
  importResult: { fontSize: '12px', letterSpacing: '0.3px' },
  hint: { fontSize: '10px', color: '#494847', letterSpacing: '0.5px', width: '100%' },
  table: { width: '100%', borderCollapse: 'collapse', marginBottom: '12px' },
  th: { fontSize: '9px', color: '#adaaaa', letterSpacing: '3px', padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid #494847' },
  tr: { borderBottom: '1px solid #262626' },
  td: { padding: '12px 14px', fontSize: '13px', color: '#fff' },
  inlineInput: { background: '#262626', border: '1px solid #494847', borderRadius: '2px', padding: '6px 8px', color: '#fff', fontSize: '12px', width: '100%' },
  saveRowBtn: { background: '#cafd00', color: '#3a4a00', border: 'none', borderRadius: '2px', padding: '5px 10px', fontWeight: 700, cursor: 'pointer', marginRight: '4px' },
  cancelRowBtn: { background: 'transparent', color: '#adaaaa', border: '1px solid #494847', borderRadius: '2px', padding: '5px 10px', cursor: 'pointer' },
  addRowBtn: { background: 'transparent', color: '#cafd00', border: '1px dashed #cafd00', borderRadius: '2px', padding: '8px 20px', fontSize: '12px', cursor: 'pointer', letterSpacing: '1px' },
};
