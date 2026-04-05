'use client';

import { useState, useTransition } from 'react';
import { updateMilestone, toggleMilestoneActive, deleteMilestone } from '@/actions/event-actions';

interface Milestone {
  id: string;
  order: number;
  name: string;
  distanceMark: string;
  stationType: string;
  assignedVolunteerUid: string | null;
  active: boolean;
}

interface EditState {
  name: string;
  distanceMark: string;
  stationType: 'station' | 'run';
}

export default function MilestonesTable({ eventId, milestones: initial }: { eventId: string; milestones: Milestone[] }) {
  const [milestones, setMilestones] = useState(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({ name: '', distanceMark: '', stationType: 'station' });
  const [pending, startTransition] = useTransition();

  const startEdit = (m: Milestone) => {
    setEditingId(m.id);
    setEditState({ name: m.name, distanceMark: m.distanceMark, stationType: m.stationType as 'station' | 'run' });
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = (id: string) => {
    const { name, distanceMark, stationType } = editState;
    if (!name.trim()) return;
    startTransition(() => { void updateMilestone(eventId, id, { name: name.trim(), distanceMark: distanceMark.trim(), stationType }); });
    setMilestones((prev) => prev.map((m) => m.id === id ? { ...m, name: name.trim(), distanceMark: distanceMark.trim(), stationType } : m));
    setEditingId(null);
  };

  const toggleActive = (id: string, current: boolean) => {
    startTransition(() => { void toggleMilestoneActive(eventId, id, !current); });
    setMilestones((prev) => prev.map((m) => m.id === id ? { ...m, active: !current } : m));
  };

  const remove = (id: string, name: string) => {
    if (!confirm(`Remove milestone "${name}"? This cannot be undone.`)) return;
    startTransition(() => { void deleteMilestone(eventId, id); });
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  if (milestones.length === 0) {
    return <tr><td colSpan={6} style={s.empty}>No milestones yet.</td></tr>;
  }

  return (
    <>
      {milestones.map((m) => {
        const isEditing = editingId === m.id;
        const dim = !m.active;
        return (
          <tr key={m.id} style={{ ...s.tr, opacity: dim ? 0.4 : 1 }}>
            <td style={s.td}>{m.order}</td>

            {/* Name */}
            <td style={s.td}>
              {isEditing
                ? <input value={editState.name} onChange={(e) => setEditState((p) => ({ ...p, name: e.target.value }))} style={s.input} autoFocus />
                : m.name}
            </td>

            {/* Distance */}
            <td style={{ ...s.td, color: '#adaaaa', fontSize: '12px', fontFamily: 'monospace' }}>
              {isEditing
                ? <input value={editState.distanceMark} onChange={(e) => setEditState((p) => ({ ...p, distanceMark: e.target.value }))} style={s.input} placeholder="e.g. 0.8 MILE" />
                : m.distanceMark}
            </td>

            {/* Type */}
            <td style={s.td}>
              {isEditing ? (
                <div style={s.toggle}>
                  {(['station', 'run'] as const).map((t) => (
                    <button key={t} type="button" onClick={() => setEditState((p) => ({ ...p, stationType: t }))}
                      style={editState.stationType === t ? s.toggleOn : s.toggleOff}>
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>
              ) : (
                m.stationType === 'run'
                  ? <span style={s.typeRun}>RUN</span>
                  : <span style={s.typeStation}>STATION</span>
              )}
            </td>

            {/* Volunteer */}
            <td style={s.td}>
              {m.assignedVolunteerUid
                ? <span style={s.assigned}>● Assigned</span>
                : <span style={s.unassigned}>Unassigned</span>}
            </td>

            {/* Actions */}
            <td style={s.actions}>
              {isEditing ? (
                <>
                  <button onClick={() => saveEdit(m.id)} disabled={pending} style={s.btnSave}>Save</button>
                  <button onClick={cancelEdit} style={s.btnCancel}>Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={() => startEdit(m)} style={s.btnAction}>Edit</button>
                  <button onClick={() => toggleActive(m.id, m.active)} style={s.btnAction}>
                    {m.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => remove(m.id, m.name)} style={s.btnDanger}>Remove</button>
                </>
              )}
            </td>
          </tr>
        );
      })}
    </>
  );
}

const s: Record<string, React.CSSProperties> = {
  tr: { borderBottom: '1px solid #1e1e1e', transition: 'opacity 0.2s' },
  td: { padding: '12px 16px', fontSize: '14px', color: '#fff' },
  actions: { padding: '8px 16px', whiteSpace: 'nowrap', display: 'flex', gap: '6px', alignItems: 'center' },
  input: { background: '#1a1a1a', border: '1px solid #494847', borderRadius: '2px', padding: '5px 8px', color: '#fff', fontSize: '13px', outline: 'none', width: '140px' },
  toggle: { display: 'flex', borderRadius: '2px', overflow: 'hidden', border: '1px solid #494847' },
  toggleOn: { background: '#cafd00', color: '#3a4a00', border: 'none', padding: '4px 10px', fontSize: '10px', fontWeight: 900, letterSpacing: '1px', cursor: 'pointer' },
  toggleOff: { background: 'transparent', color: '#adaaaa', border: 'none', padding: '4px 10px', fontSize: '10px', letterSpacing: '1px', cursor: 'pointer' },
  typeRun: { fontSize: '9px', color: '#adaaaa', letterSpacing: '2px', fontWeight: 700 },
  typeStation: { fontSize: '9px', color: '#cafd00', letterSpacing: '2px', fontWeight: 700 },
  assigned: { color: '#cafd00', fontSize: '12px', letterSpacing: '1px' },
  unassigned: { color: '#494847', fontSize: '12px', letterSpacing: '1px' },
  btnAction: { background: 'transparent', color: '#adaaaa', border: '1px solid #333', borderRadius: '2px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', letterSpacing: '0.5px' },
  btnSave: { background: '#cafd00', color: '#3a4a00', border: 'none', borderRadius: '2px', padding: '5px 12px', fontSize: '11px', fontWeight: 900, cursor: 'pointer' },
  btnCancel: { background: 'transparent', color: '#adaaaa', border: '1px solid #333', borderRadius: '2px', padding: '5px 10px', fontSize: '11px', cursor: 'pointer' },
  btnDanger: { background: 'transparent', color: '#ff4444', border: '1px solid #331111', borderRadius: '2px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer' },
  empty: { padding: '40px', textAlign: 'center', color: '#adaaaa', fontSize: '13px' },
};
