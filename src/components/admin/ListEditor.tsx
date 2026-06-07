import { useEffect, useState } from 'preact/hooks';
import { browserClient } from '../../lib/supabase';
import { useStatus, Status } from './ui';

type Field = { key: string; label: string; type?: 'text' | 'textarea' };

export default function ListEditor({ table, fields }: { table: string; fields: Field[] }) {
  const sb = browserClient();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const { status, show } = useStatus();

  async function load() {
    setLoading(true);
    const { data, error } = await sb.from(table).select('*').order('sort', { ascending: true });
    if (error) show('שגיאה בטעינה: ' + error.message, 'err', { sticky: true });
    setRows(data ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, [table]);

  const setField = (i: number, key: string, val: string) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [key]: val } : row)));

  async function save(row: any) {
    setBusy(true);
    show('שומר…', 'info', { sticky: true });
    const { id, ...rest } = row;
    const { error } = await sb.from(table).update(rest).eq('id', id);
    show(error ? 'שגיאה: ' + error.message : 'נשמר ✓', error ? 'err' : 'ok');
    setBusy(false);
  }
  async function add() {
    setBusy(true);
    const maxSort = rows.reduce((m, r) => Math.max(m, r.sort ?? 0), 0);
    // Insert only `sort`; other (incl. *_ru) columns stay null and are filled via edit.
    const { data, error } = await sb.from(table).insert({ sort: maxSort + 1 }).select().single();
    if (error) show('שגיאה: ' + error.message, 'err');
    else { setRows((r) => [...r, data]); show('נוסף פריט חדש ✓', 'ok'); }
    setBusy(false);
  }
  async function remove(row: any) {
    if (!confirm('למחוק פריט זה?')) return;
    setBusy(true);
    const { error } = await sb.from(table).delete().eq('id', row.id);
    if (error) show('שגיאה: ' + error.message, 'err');
    else { setRows((r) => r.filter((x) => x.id !== row.id)); show('נמחק ✓', 'ok'); }
    setBusy(false);
  }
  async function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    setBusy(true);
    const a = rows[i], b = rows[j];
    const e1 = await sb.from(table).update({ sort: b.sort }).eq('id', a.id);
    const e2 = await sb.from(table).update({ sort: a.sort }).eq('id', b.id);
    if (e1.error || e2.error) show('שגיאה בסידור מחדש', 'err');
    await load();
    setBusy(false);
  }

  if (loading) return <p class="text-mute">טוען…</p>;
  return (
    <div>
      <div class="flex flex-row-reverse justify-between items-center mb-4 gap-3 min-h-[2.25rem]">
        <button type="button" onClick={add} disabled={busy} class="btn-neon rounded-full px-5 py-2 eyebrow text-[11px] text-fg disabled:opacity-50 disabled:cursor-not-allowed shrink-0">+ הוספה</button>
        <Status status={status} />
      </div>
      <div class="space-y-4">
        {rows.map((row, i) => (
          <div key={row.id} class="glass rounded-2xl p-5 text-start">
            <div class="grid sm:grid-cols-2 gap-3">
              {fields.map((f) => {
                const id = `${table}-${row.id}-${f.key}`;
                return (
                  <div key={f.key} class={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                    <label for={id} class="eyebrow text-[10px] text-mute block mb-1">{f.label}</label>
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
            <div class="flex flex-row-reverse gap-4 mt-3 text-[11px] eyebrow items-center">
              <button type="button" onClick={() => save(row)} disabled={busy} class="text-cyan hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed">שמירה</button>
              <button type="button" onClick={() => move(i, -1)} disabled={busy || i === 0} aria-label="הזז למעלה" title="הזז למעלה" class="text-mute hover:text-fg disabled:opacity-30">↑</button>
              <button type="button" onClick={() => move(i, 1)} disabled={busy || i === rows.length - 1} aria-label="הזז למטה" title="הזז למטה" class="text-mute hover:text-fg disabled:opacity-30">↓</button>
              <button type="button" onClick={() => remove(row)} disabled={busy} class="text-magenta hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed">מחיקה</button>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p class="text-mute text-sm">אין פריטים עדיין. לחצו "הוספה".</p>}
      </div>
    </div>
  );
}
