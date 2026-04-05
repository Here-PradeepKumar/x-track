'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { importBibs, updateBib, removeBib, setBibActive } from '@/actions/event-actions';

interface Bib {
  bibNumber: string;
  athletePhone: string;
  nfcTagId: string;
  wave: string;
  category: string;
  active: boolean;
}

interface Props {
  eventId: string;
  bibs: Bib[];
}

function parseWorkbook(file: File): Promise<Omit<Bib, 'active'>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        const norm = (k: string) => k.toLowerCase().replace(/[\s_]/g, '');
        resolve(
          rows.map((row) => {
            const get = (...aliases: string[]) => {
              const k = Object.keys(row).find((k) => aliases.includes(norm(k)));
              return k ? String(row[k] ?? '').trim() : '';
            };
            return {
              bibNumber: get('bibnumber', 'bib', 'bibnr', 'number'),
              athletePhone: get('phone', 'athletephone', 'mobile', 'phonenumber'),
              nfcTagId: get('nfctagid', 'nfc', 'nfctag', 'tagid'),
              wave: get('wave'),
              category: get('category', 'cat'),
            };
          }).filter((b) => b.bibNumber.length > 0)
        );
      } catch (err) { reject(err); }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function downloadSample() {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([['bibNumber', 'phone', 'nfcTagId', 'wave', 'category']]);
  ws['!cols'] = [{ wch: 12 }, { wch: 16 }, { wch: 20 }, { wch: 10 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws, 'BIBs');
  XLSX.writeFile(wb, 'bib_import_template.xlsx');
}

export default function BibsTable({ eventId, bibs: initial }: Props) {
  const [bibs, setBibs] = useState(initial);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);

  // Per-row states
  const [editRow, setEditRow] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Bib>>({});
  const [rowBusy, setRowBusy] = useState<Record<string, boolean>>({});

  // Add new row
  const [adding, setAdding] = useState(false);
  const [newRow, setNewRow] = useState<Partial<Bib>>({});
  const [savingNew, setSavingNew] = useState(false);

  const setBusy = (bib: string, v: boolean) =>
    setRowBusy((p) => ({ ...p, [bib]: v }));

  /* ── Import ── */
  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setImportMsg(null);
    try {
      const parsed = await parseWorkbook(file);
      if (parsed.length === 0) { setImportMsg('No valid rows found. Check column headers.'); return; }
      const res = await importBibs(eventId, parsed);
      setImportMsg(`${res.imported} BIBs imported.`);
      setFile(null);
      window.location.reload();
    } catch (err: any) {
      setImportMsg(`Error: ${err?.message ?? 'Import failed'}`);
    } finally { setImporting(false); }
  };

  /* ── Add single ── */
  const handleAddRow = async () => {
    if (!newRow.bibNumber?.trim()) return;
    setSavingNew(true);
    try {
      await importBibs(eventId, [{
        bibNumber: newRow.bibNumber!.trim(),
        athletePhone: newRow.athletePhone?.trim() ?? '',
        nfcTagId: newRow.nfcTagId?.trim() ?? '',
        wave: newRow.wave?.trim() ?? '',
        category: newRow.category?.trim() ?? '',
      }]);
      setBibs((p) => [...p, { ...newRow, active: true } as Bib]);
      setNewRow({});
      setAdding(false);
    } catch (err: any) {
      alert(err.message ?? 'Failed to add BIB.');
    } finally { setSavingNew(false); }
  };

  /* ── Edit ── */
  const startEdit = (bib: Bib) => {
    setEditRow(bib.bibNumber);
    setEditData({ athletePhone: bib.athletePhone, nfcTagId: bib.nfcTagId, wave: bib.wave, category: bib.category });
  };
  const handleSaveEdit = async (bibNumber: string) => {
    setBusy(bibNumber, true);
    try {
      await updateBib(eventId, bibNumber, editData);
      setBibs((p) => p.map((b) => b.bibNumber === bibNumber ? { ...b, ...editData } : b));
      setEditRow(null);
    } catch (err: any) {
      alert(err.message ?? 'Update failed.');
    } finally { setBusy(bibNumber, false); }
  };

  /* ── Activate / Deactivate ── */
  const handleToggleActive = async (bib: Bib) => {
    setBusy(bib.bibNumber, true);
    try {
      await setBibActive(eventId, bib.bibNumber, !bib.active);
      setBibs((p) => p.map((b) => b.bibNumber === bib.bibNumber ? { ...b, active: !b.active } : b));
    } catch (err: any) {
      alert(err.message ?? 'Failed to update.');
    } finally { setBusy(bib.bibNumber, false); }
  };

  /* ── Remove ── */
  const handleRemove = async (bib: Bib) => {
    if (!confirm(`Remove BIB #${bib.bibNumber}? This cannot be undone.`)) return;
    setBusy(bib.bibNumber, true);
    try {
      await removeBib(eventId, bib.bibNumber);
      setBibs((p) => p.filter((b) => b.bibNumber !== bib.bibNumber));
    } catch (err: any) {
      alert(err.message ?? 'Remove failed.');
    } finally { setBusy(bib.bibNumber, false); }
  };

  return (
    <div>
      {/* Import toolbar */}
      <div style={s.toolbar}>
        <input type="file" accept=".csv,.xlsx,.xls"
          onChange={(e) => { setFile(e.target.files?.[0] ?? null); setImportMsg(null); }}
          style={s.fileInput} />
        <button onClick={handleImport} disabled={!file || importing} style={s.importBtn}>
          {importing ? 'Importing…' : 'Import'}
        </button>
        <button onClick={downloadSample} style={s.sampleBtn}>↓ Sample Excel</button>
        {importMsg && (
          <span style={{ ...s.msg, color: importMsg.startsWith('Error') || importMsg.startsWith('No valid') ? '#ff7351' : '#cafd00' }}>
            {importMsg}
          </span>
        )}
        <span style={s.hint}>Accepts .xlsx or .csv — columns: bibNumber, phone, nfcTagId, wave, category</span>
      </div>

      <table style={s.table}>
        <thead>
          <tr>
            {['BIB #', 'Phone', 'NFC Tag ID', 'Wave', 'Category', 'Status', 'Actions'].map((h) => (
              <th key={h} style={s.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bibs.map((bib) => {
            const busy = rowBusy[bib.bibNumber];
            const isEditing = editRow === bib.bibNumber;

            return (
              <tr key={bib.bibNumber} style={s.tr}>
                <td style={{ ...s.td, color: '#cafd00', fontWeight: 700 }}>#{bib.bibNumber}</td>

                {isEditing ? (
                  <>
                    {(['athletePhone', 'nfcTagId', 'wave', 'category'] as const).map((f) => (
                      <td key={f} style={s.td}>
                        <input
                          value={editData[f] ?? ''}
                          onChange={(e) => setEditData((p) => ({ ...p, [f]: e.target.value }))}
                          style={s.inlineInput}
                        />
                      </td>
                    ))}
                  </>
                ) : (
                  <>
                    <td style={s.td}>{bib.athletePhone || '—'}</td>
                    <td style={{ ...s.td, fontFamily: 'monospace', fontSize: '12px' }}>{bib.nfcTagId || '—'}</td>
                    <td style={s.td}>{bib.wave || '—'}</td>
                    <td style={s.td}>{bib.category || '—'}</td>
                  </>
                )}

                <td style={s.td}>
                  {bib.active
                    ? <span style={s.badgeActive}>● Active</span>
                    : <span style={s.badgeInactive}>● Inactive</span>}
                </td>

                <td style={{ ...s.td, whiteSpace: 'nowrap' }}>
                  {isEditing ? (
                    <div style={s.actions}>
                      <button onClick={() => handleSaveEdit(bib.bibNumber)} disabled={busy} style={s.btnSave}>
                        {busy ? '…' : 'Save'}
                      </button>
                      <button onClick={() => setEditRow(null)} style={s.btnCancel}>Cancel</button>
                    </div>
                  ) : (
                    <div style={s.actions}>
                      <button onClick={() => startEdit(bib)} disabled={busy} style={s.btnEdit}>Edit</button>
                      <button onClick={() => handleToggleActive(bib)} disabled={busy} style={bib.active ? s.btnDeactivate : s.btnActivate}>
                        {bib.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => handleRemove(bib)} disabled={busy} style={s.btnRemove}>Remove</button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}

          {/* New row */}
          {adding && (
            <tr style={s.tr}>
              {(['bibNumber', 'athletePhone', 'nfcTagId', 'wave', 'category'] as (keyof Bib)[]).map((f) => (
                <td key={f} style={s.td}>
                  <input
                    value={String(newRow[f] ?? '')}
                    onChange={(e) => setNewRow((p) => ({ ...p, [f]: e.target.value }))}
                    style={s.inlineInput}
                    placeholder={f}
                  />
                </td>
              ))}
              <td style={s.td} />
              <td style={s.td}>
                <div style={s.actions}>
                  <button onClick={handleAddRow} disabled={savingNew} style={s.btnSave}>
                    {savingNew ? '…' : 'Save'}
                  </button>
                  <button onClick={() => setAdding(false)} style={s.btnCancel}>Cancel</button>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {!adding && (
        <button onClick={() => setAdding(true)} style={s.addBtn}>+ Add BIB</button>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  toolbar: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
  fileInput: { background: '#131313', border: '1px solid #494847', borderRadius: '2px', padding: '6px 10px', color: '#adaaaa', fontSize: '13px' },
  importBtn: { background: '#00eefc', color: '#003f43', border: 'none', borderRadius: '2px', padding: '8px 16px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase' as const },
  sampleBtn: { background: 'transparent', color: '#adaaaa', border: '1px solid #333', borderRadius: '2px', padding: '8px 14px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' },
  msg: { fontSize: '12px' },
  hint: { fontSize: '10px', color: '#494847', letterSpacing: '0.5px', width: '100%' },
  table: { width: '100%', borderCollapse: 'collapse', marginBottom: '12px' },
  th: { fontSize: '9px', color: '#adaaaa', letterSpacing: '2px', padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #494847', textTransform: 'uppercase' as const },
  tr: { borderBottom: '1px solid #1e1e1e' },
  td: { padding: '11px 12px', fontSize: '13px', color: '#fff', verticalAlign: 'middle' },
  inlineInput: { background: '#1e1e1e', border: '1px solid #494847', borderRadius: '2px', padding: '5px 8px', color: '#fff', fontSize: '12px', width: '100%', minWidth: '80px' },
  badgeActive: { color: '#cafd00', fontSize: '11px', fontWeight: 700 },
  badgeInactive: { color: '#494847', fontSize: '11px', fontWeight: 700 },
  actions: { display: 'flex', gap: '6px' },
  btnEdit: { background: 'transparent', color: '#adaaaa', border: '1px solid #333', borderRadius: '2px', padding: '4px 10px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.5px' },
  btnActivate: { background: 'transparent', color: '#cafd00', border: '1px solid rgba(202,253,0,0.4)', borderRadius: '2px', padding: '4px 10px', fontSize: '10px', fontWeight: 700, cursor: 'pointer' },
  btnDeactivate: { background: 'transparent', color: '#adaaaa', border: '1px solid #333', borderRadius: '2px', padding: '4px 10px', fontSize: '10px', fontWeight: 700, cursor: 'pointer' },
  btnRemove: { background: 'transparent', color: '#ff7351', border: '1px solid rgba(255,115,81,0.3)', borderRadius: '2px', padding: '4px 10px', fontSize: '10px', fontWeight: 700, cursor: 'pointer' },
  btnSave: { background: '#cafd00', color: '#0e0e0f', border: 'none', borderRadius: '2px', padding: '4px 12px', fontSize: '10px', fontWeight: 700, cursor: 'pointer' },
  btnCancel: { background: 'transparent', color: '#adaaaa', border: '1px solid #333', borderRadius: '2px', padding: '4px 10px', fontSize: '10px', cursor: 'pointer' },
  addBtn: { background: 'transparent', color: '#cafd00', border: '1px dashed #cafd00', borderRadius: '2px', padding: '8px 20px', fontSize: '12px', cursor: 'pointer', letterSpacing: '1px' },
};
