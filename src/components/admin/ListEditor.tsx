import { useEffect, useState } from 'preact/hooks';
import { browserClient } from '../../lib/supabase';

type Field = { key: string; label: string; type?: 'text' | 'textarea' };

export default function ListEditor({ table, fields }: { table: string; fields: Field[] }) {
  const sb = browserClient();
  const [rows, setRows] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data, error } = await sb.from(table).select('*').order('sort', { ascending: true });
    if (error) setStatus('שגיאה בטעינה: ' + error.message);
    setRows(data ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, [table]);

  const setField = (i: number, key: string, val: string) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [key]: val } : row)));

  async function save(row: any) {
    setStatus('שומר…');
    const { id, ...rest } = row;
    const { error } = await sb.from(table).update(rest).eq('id', id);
    setStatus(error ? 'שגיאה: ' + error.message : 'נשמר ✓');
  }
  async function add() {
    const maxSort = rows.reduce((m, r) => Math.max(m, r.sort ?? 0), 0);
    const blank: any = { sort: maxSort + 1 };
    fields.forEach((f) => (blank[f.key] = ''));
    const { data, error } = await sb.from(table).insert(blank).select().single();
    if (error) { setStatus('שגיאה: ' + error.message); return; }
    setRows((r) => [...r, data]);
  }
  async function remove(row: any) {
    if (!confirm('למחוק פריט זה?')) return;
    const { error } = await sb.from(table).delete().eq('id', row.id);
    if (error) { setStatus('שגיאה: ' + error.message); return; }
    setRows((r) => r.filter((x) => x.id !== row.id));
  }
  async function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    const a = rows[i], b = rows[j];
    await sb.from(table).update({ sort: b.sort }).eq('id', a.id);
    await sb.from(table).update({ sort: a.sort }).eq('id', b.id);
    load();
  }

  if (loading) return <p class="text-mute">טוען…</p>;
  return (
    <div>
      <div class="flex flex-row-reverse justify-between items-center mb-4">
        <button onClick={add} class="btn-neon rounded-full px-5 py-2 eyebrow text-[11px] text-fg">+ הוספה</button>
        {status && <span class="text-mute text-sm">{status}</span>}
      </div>
      <div class="space-y-4">
        {rows.map((row, i) => (
          <div class="glass rounded-2xl p-5 text-right">
            <div class="grid sm:grid-cols-2 gap-3">
              {fields.map((f) =>
                f.type === 'textarea' ? (
                  <textarea
                    value={row[f.key] ?? ''}
                    placeholder={f.label}
                    onInput={(e: any) => setField(i, f.key, e.currentTarget.value)}
                    rows={2}
                    class="input-glass rounded-lg px-3 py-2 text-fg sm:col-span-2"
                  />
                ) : (
                  <input
                    value={row[f.key] ?? ''}
                    placeholder={f.label}
                    onInput={(e: any) => setField(i, f.key, e.currentTarget.value)}
                    class="input-glass rounded-lg px-3 py-2 text-fg"
                  />
                )
              )}
            </div>
            <div class="flex flex-row-reverse gap-4 mt-3 text-[11px] eyebrow">
              <button onClick={() => save(row)} class="text-cyan hover:opacity-80">שמירה</button>
              <button onClick={() => move(i, -1)} class="text-mute hover:text-fg" title="הזז למעלה">↑</button>
              <button onClick={() => move(i, 1)} class="text-mute hover:text-fg" title="הזז למטה">↓</button>
              <button onClick={() => remove(row)} class="text-magenta hover:opacity-80">מחיקה</button>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p class="text-mute text-sm">אין פריטים עדיין. לחצו "הוספה".</p>}
      </div>
    </div>
  );
}
