'use client';

import { useState, useTransition } from 'react';
import { updateCategoryWeight, addCategory, removeCategory } from '@/actions/event-actions';

interface Station {
  id: string;
  name: string;
  distanceMark: string;
}

interface Category {
  id: string;
  name: string;
  order: number;
  milestoneWeights: Record<string, number | null>;
}

interface Props {
  eventId: string;
  stations: Station[];
  categories: Category[];
}

interface EditingCell {
  categoryId: string;
  milestoneId: string;
  value: string;
}

export default function CategoryWeightsEditor({ eventId, stations, categories: initialCategories }: Props) {
  const [categories, setCategories] = useState(initialCategories);
  const [editing, setEditing] = useState<EditingCell | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [addingCat, setAddingCat] = useState(false);
  const [pending, startTransition] = useTransition();

  const startEdit = (categoryId: string, milestoneId: string, current: number | null) => {
    setEditing({ categoryId, milestoneId, value: current != null ? String(current) : '' });
  };

  const commitEdit = () => {
    if (!editing) return;
    const { categoryId, milestoneId, value } = editing;
    const parsed = value.trim() === '' ? null : Number(value);
    if (value.trim() !== '' && (isNaN(parsed as number) || (parsed as number) < 0)) {
      setEditing(null);
      return;
    }
    startTransition(() => {
      void updateCategoryWeight(eventId, categoryId, milestoneId, parsed);
    });
    setCategories((prev) =>
      prev.map((c) =>
        c.id === categoryId
          ? { ...c, milestoneWeights: { ...c.milestoneWeights, [milestoneId]: parsed } }
          : c
      )
    );
    setEditing(null);
  };

  const handleAddCategory = () => {
    const name = newCatName.trim();
    if (!name) return;
    startTransition(() => { void addCategory(eventId, name); });
    const id = name.toLowerCase().replace(/\s+/g, '_');
    setCategories((prev) => [...prev, { id, name, order: prev.length + 1, milestoneWeights: {} }]);
    setNewCatName('');
    setAddingCat(false);
  };

  const handleRemoveCategory = (categoryId: string) => {
    if (!confirm('Remove this category? Athlete BIBs with this category will show no weight.')) return;
    startTransition(() => { void removeCategory(eventId, categoryId); });
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
  };

  if (stations.length === 0) {
    return <p style={s.empty}>No stations yet — add milestones first.</p>;
  }

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Station</th>
              <th style={{ ...s.th, color: '#494847', fontSize: '9px' }}>Target</th>
              {categories.map((cat) => (
                <th key={cat.id} style={s.th}>
                  <div style={s.catHeader}>
                    <span>{cat.name}</span>
                    <button onClick={() => handleRemoveCategory(cat.id)} style={s.removeBtn} title="Remove category">×</button>
                  </div>
                </th>
              ))}
              <th style={s.th}>
                {addingCat ? (
                  <div style={s.addCatRow}>
                    <input
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddCategory(); if (e.key === 'Escape') setAddingCat(false); }}
                      placeholder="Category name"
                      style={s.catInput}
                      autoFocus
                    />
                    <button onClick={handleAddCategory} style={s.addConfirmBtn}>+</button>
                  </div>
                ) : (
                  <button onClick={() => setAddingCat(true)} style={s.addCatBtn}>+ Add</button>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {stations.map((station) => (
              <tr key={station.id} style={s.tr}>
                <td style={s.tdName}>{station.name}</td>
                <td style={s.tdTarget}>{station.distanceMark}</td>
                {categories.map((cat) => {
                  const weight = cat.milestoneWeights[station.id] ?? null;
                  const isEditing = editing?.categoryId === cat.id && editing?.milestoneId === station.id;
                  return (
                    <td key={cat.id} style={s.tdWeight}>
                      {isEditing ? (
                        <input
                          value={editing.value}
                          onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                          onBlur={commitEdit}
                          onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(null); }}
                          style={s.weightInput}
                          autoFocus
                          placeholder="kg"
                        />
                      ) : (
                        <button onClick={() => startEdit(cat.id, station.id, weight)} style={s.weightCell}>
                          {weight != null ? `${weight} kg` : <span style={{ color: '#333' }}>—</span>}
                        </button>
                      )}
                    </td>
                  );
                })}
                <td style={s.tdWeight} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pending && <p style={s.saving}>Saving…</p>}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '500px' },
  th: { fontSize: '10px', color: '#adaaaa', letterSpacing: '2px', padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid #333', textTransform: 'uppercase', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid #1e1e1e' },
  tdName: { padding: '12px 14px', fontSize: '13px', color: '#fff', fontWeight: 700, whiteSpace: 'nowrap' },
  tdTarget: { padding: '12px 14px', fontSize: '11px', color: '#494847', fontFamily: 'monospace', whiteSpace: 'nowrap' },
  tdWeight: { padding: '8px 14px', textAlign: 'center' },
  weightCell: { background: 'transparent', border: '1px solid #262626', borderRadius: '2px', padding: '5px 12px', color: '#cafd00', fontSize: '12px', fontWeight: 700, cursor: 'pointer', minWidth: '64px', textAlign: 'center' },
  weightInput: { background: '#1e1e1e', border: '1px solid #cafd00', borderRadius: '2px', padding: '5px 8px', color: '#cafd00', fontSize: '12px', width: '64px', textAlign: 'center' },
  catHeader: { display: 'flex', alignItems: 'center', gap: '6px' },
  removeBtn: { background: 'transparent', border: 'none', color: '#494847', fontSize: '14px', cursor: 'pointer', lineHeight: 1, padding: '0 2px' },
  addCatBtn: { background: 'transparent', color: '#cafd00', border: '1px dashed rgba(202,253,0,0.4)', borderRadius: '2px', padding: '4px 10px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', letterSpacing: '1px', whiteSpace: 'nowrap' },
  addCatRow: { display: 'flex', gap: '4px', alignItems: 'center' },
  catInput: { background: '#1e1e1e', border: '1px solid #333', borderRadius: '2px', padding: '4px 8px', color: '#fff', fontSize: '11px', width: '100px' },
  addConfirmBtn: { background: '#cafd00', color: '#0e0e0f', border: 'none', borderRadius: '2px', padding: '4px 8px', fontWeight: 700, cursor: 'pointer', fontSize: '12px' },
  empty: { color: '#494847', fontSize: '13px' },
  saving: { color: '#adaaaa', fontSize: '11px', marginTop: '8px' },
};
