import { useEffect, useState } from 'preact/hooks';
import { browserClient } from '../../lib/supabase';
import { useStatus, Status, useUnsavedGuard, UnsavedDot, useConfirm, useShowRu, RuToggle, CardsSkeleton } from './ui';
import { fieldsDiffer } from '../../lib/dirty';

type Field = { key: string; label: string; type?: 'text' | 'textarea' };

export default function ListEditor({ table, fields }: { table: string; fields: Field[] }) {
  const sb = browserClient();
  const [rows, setRows] = useState<any[]>([]);
  const [saved, setSaved] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const { status, show } = useStatus();
  const { confirm, confirmElement } = useConfirm();
  const [showRu, toggleRu] = useShowRu();

  async function load() {
    const { data, error } = await sb.from(table).select('*').order('sort', { ascending: true });
    if (error) show('שגיאה בטעינה: ' + error.message, 'err', { sticky: true });
    setRows(data ?? []);
    setSaved(Object.fromEntries((data ?? []).map((r: any) => [r.id, r])));
  }
  useEffect(() => { setLoading(true); load().finally(() => setLoading(false)); }, [table]);

  const setField = (i: number, key: string, val: string) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [key]: val } : row)));

  async function save(row: any) {
    setBusy(true);
    show('שומר…', 'info', { sticky: true });
    const { id, ...rest } = row;
    const { error } = await sb.from(table).update(rest).eq('id', id);
    if (!error) setSaved((s) => ({ ...s, [id]: { ...row } }));
    show(error ? 'שגיאה: ' + error.message : 'נשמר ✓', error ? 'err' : 'ok');
    setBusy(false);
  }
  async function add() {
    setBusy(true);
    const maxSort = rows.reduce((m, r) => Math.max(m, r.sort ?? 0), 0);
    // Insert only `sort`; other (incl. *_ru) columns stay null and are filled via edit.
    const { data, error } = await sb.from(table).insert({ sort: maxSort + 1 }).select().single();
    if (error) show('שגיאה: ' + error.message, 'err');
    else {
      setRows((r) => [...r, data]);
      setSaved((s) => ({ ...s, [data.id]: data }));
      show('נוסף פריט חדש ✓', 'ok');
    }
    setBusy(false);
  }
  async function remove(row: any) {
    if (!(await confirm('למחוק פריט זה?', { title: 'מחיקת פריט', confirmLabel: 'מחיקה', danger: true }))) return;
    setBusy(true);
    const { error } = await sb.from(table).delete().eq('id', row.id);
    if (error) show('שגיאה: ' + error.message, 'err');
    else {
      setRows((r) => r.filter((x) => x.id !== row.id));
      setSaved((s) => { const next = { ...s }; delete next[row.id]; return next; });
      show('נמחק ✓', 'ok');
    }
    setBusy(false);
  }
  async function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    // Reordering reloads the list from the DB, which would drop any unsaved field
    // edits (the beforeunload guard can't catch this in-app reset) — so confirm first.
    const anyDirty = rows.some((r) => fieldsDiffer(fields.map((f) => f.key), r, saved[r.id]));
    if (anyDirty && !(await confirm('סידור מחדש יטען את הרשימה ויבטל שינויים שלא נשמרו. להמשיך?', { title: 'שינויים לא נשמרו', confirmLabel: 'המשך', danger: true }))) return;
    setBusy(true);
    const a = rows[i], b = rows[j];
    const e1 = await sb.from(table).update({ sort: b.sort }).eq('id', a.id);
    const e2 = await sb.from(table).update({ sort: a.sort }).eq('id', b.id);
    if (e1.error || e2.error) show('שגיאה בסידור מחדש', 'err');
    await load();
    setBusy(false);
  }

  const fieldKeys = fields.map((f) => f.key);
  const rowDirty = (row: any) => fieldsDiffer(fieldKeys, row, saved[row.id]);
  const dirtyCount = rows.reduce((n, r) => (rowDirty(r) ? n + 1 : n), 0);
  useUnsavedGuard(dirtyCount > 0);
  const isRuField = (f: Field) => /רוסית/.test(f.label);
  const hasRu = fields.some(isRuField);
  const visibleFields = fields.filter((f) => showRu || !isRuField(f));

  if (loading) return <CardsSkeleton count={3} lines={2} />;
  return (
    <div>
      <div class="flex flex-row-reverse justify-between items-center mb-4 gap-3 min-h-[2.25rem]">
        <div class="flex flex-row-reverse items-center gap-4">
          <button type="button" onClick={add} disabled={busy} class="btn-neon rounded-full px-5 py-2 eyebrow text-[11px] text-fg disabled:opacity-50 disabled:cursor-not-allowed shrink-0">+ הוספה</button>
          {hasRu && <RuToggle show={showRu} onToggle={toggleRu} />}
        </div>
        <div class="flex flex-row-reverse items-center gap-3">
          {dirtyCount > 0 && !status && <UnsavedDot />}
          <Status status={status} />
        </div>
      </div>
      <div class="space-y-4">
        {rows.map((row, i) => (
          <div key={row.id} class={`glass rounded-2xl p-5 text-start ${rowDirty(row) ? 'ring-1 ring-magenta/30' : ''}`}>
            <div class="grid sm:grid-cols-2 gap-3">
              {visibleFields.map((f) => {
                const id = `${table}-${row.id}-${f.key}`;
                return (
                  <div key={f.key} class={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                    <label for={id} class="field-label text-mute block mb-1">{f.label}</label>
                    {f.type === 'textarea' ? (
                      <textarea id={id} value={row[f.key] ?? ''} placeholder={f.label}
                        onInput={(e: any) => setField(i, f.key, e.currentTarget.value)} rows={2}
                        class="w-full input-glass rounded-lg px-3 py-2 text-fg" />
                    ) : (
                      <input id={id} value={row[f.key] ?? ''} placeholder={f.label}
                        onInput={(e: any) => setField(i, f.key, e.currentTarget.value)}
                        class="w-full input-glass rounded-lg px-3 py-2 text-fg" />
                    )}
                  </div>
                );
              })}
            </div>
            <div class="flex flex-row-reverse items-center justify-between gap-2 mt-4 pt-3 border-t border-white/5 text-[11px] eyebrow">
              <div class="flex flex-row-reverse items-center gap-1">
                {rowDirty(row) && <span class="text-magenta px-1" title="שינויים לא נשמרו" aria-hidden="true">●</span>}
                <button type="button" onClick={() => save(row)} disabled={busy} class="rounded-lg px-3 py-2 text-cyan hover:bg-white/5 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent">שמירה</button>
                <button type="button" onClick={() => move(i, -1)} disabled={busy || i === 0} aria-label="הזז למעלה" title="הזז למעלה" class="rounded-lg w-10 h-10 inline-flex items-center justify-center text-mute hover:text-fg hover:bg-white/5 transition disabled:opacity-30 disabled:hover:bg-transparent">↑</button>
                <button type="button" onClick={() => move(i, 1)} disabled={busy || i === rows.length - 1} aria-label="הזז למטה" title="הזז למטה" class="rounded-lg w-10 h-10 inline-flex items-center justify-center text-mute hover:text-fg hover:bg-white/5 transition disabled:opacity-30 disabled:hover:bg-transparent">↓</button>
              </div>
              <button type="button" onClick={() => remove(row)} disabled={busy} class="rounded-lg px-3 py-2 text-magenta hover:bg-magenta/10 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent">מחיקה</button>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p class="text-mute text-sm">אין פריטים עדיין. לחצו "הוספה".</p>}
      </div>
      {confirmElement}
    </div>
  );
}
