import { useEffect, useState } from 'preact/hooks';
import { browserClient } from '../../lib/supabase';
import { useStatus, Status } from './ui';
import { PAGE_SECTIONS } from '../../lib/pageSections';

const keyOf = (page: string, slot: string) => `${page}:${slot}`;

export default function PagesEditor() {
  const sb = browserClient();
  const [vals, setVals] = useState<Record<string, string>>({});
  const [inDb, setInDb] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const { status, show } = useStatus();

  async function load() {
    setLoading(true);
    const { data, error } = await sb.from('page_sections').select('page, slot, value');
    if (error) show('שגיאה בטעינה: ' + error.message, 'err', { sticky: true });
    const dbMap: Record<string, string> = {};
    const existing: Record<string, boolean> = {};
    for (const r of (data ?? []) as any[]) {
      dbMap[keyOf(r.page, r.slot)] = r.value;
      existing[keyOf(r.page, r.slot)] = true;
    }
    const init: Record<string, string> = {};
    for (const p of PAGE_SECTIONS)
      for (const f of p.fields) {
        const k = keyOf(p.page, f.slot);
        init[k] = dbMap[k] ?? f.default;
      }
    setVals(init);
    setInDb(existing);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const set = (k: string, v: string) => setVals((s) => ({ ...s, [k]: v }));

  async function save() {
    setBusy(true);
    show('שומר…', 'info', { sticky: true });
    const toUpsert: { page: string; slot: string; value: string }[] = [];
    const toDelete: { page: string; slot: string }[] = [];
    for (const p of PAGE_SECTIONS)
      for (const f of p.fields) {
        const k = keyOf(p.page, f.slot);
        const v = (vals[k] ?? '').trim();
        if (v && v !== f.default) toUpsert.push({ page: p.page, slot: f.slot, value: vals[k] });
        else if (inDb[k]) toDelete.push({ page: p.page, slot: f.slot }); // revert to default
      }

    let err: any = null;
    if (toUpsert.length) {
      const { error } = await sb.from('page_sections').upsert(toUpsert, { onConflict: 'page,slot' });
      err = error;
    }
    for (const d of toDelete) {
      if (err) break;
      const { error } = await sb.from('page_sections').delete().eq('page', d.page).eq('slot', d.slot);
      err = error;
    }
    setBusy(false);
    if (err) { show('שגיאה: ' + err.message, 'err'); return; }
    show(`נשמר ✓ (${toUpsert.length} שינויים)`, 'ok');
    load();
  }

  if (loading) return <p class="text-mute">טוען…</p>;
  return (
    <div class="space-y-6 max-w-2xl">
      <p class="text-mute text-sm font-light leading-relaxed">
        עריכת הכותרות והפסקאות בעמודי האתר. שדה שזהה לטקסט המקורי לא נשמר — אפשר תמיד לחזור לברירת המחדל עם הכפתור ↩.
      </p>
      {PAGE_SECTIONS.map((p) => (
        <fieldset key={p.page} class="glass rounded-2xl p-6 text-right space-y-4">
          <legend class="eyebrow text-[11px] text-cyan px-1">{p.title}</legend>
          {p.fields.map((f) => {
            const k = keyOf(p.page, f.slot);
            const id = `ps-${p.page}-${f.slot}`;
            const overridden = (vals[k] ?? '') !== f.default;
            return (
              <div key={f.slot}>
                <div class="flex flex-row-reverse justify-between items-center mb-1 gap-2">
                  <label for={id} class="eyebrow text-[10px] text-mute">{f.label}</label>
                  {overridden && (
                    <button type="button" onClick={() => set(k, f.default)} title="חזרה לברירת המחדל" class="eyebrow text-[9px] text-mute hover:text-cyan shrink-0">↩ ברירת מחדל</button>
                  )}
                </div>
                {f.type === 'textarea' ? (
                  <textarea id={id} value={vals[k] ?? ''} onInput={(e: any) => set(k, e.currentTarget.value)} rows={3} class="w-full input-glass rounded-lg px-3 py-2 text-fg" />
                ) : (
                  <input id={id} value={vals[k] ?? ''} onInput={(e: any) => set(k, e.currentTarget.value)} class="w-full input-glass rounded-lg px-3 py-2 text-fg" />
                )}
              </div>
            );
          })}
        </fieldset>
      ))}
      <div class="flex flex-row-reverse items-center gap-4 sticky bottom-4">
        <button type="button" onClick={save} disabled={busy} class="btn-neon rounded-full px-6 py-2.5 eyebrow text-[11px] text-fg bg-space/80 backdrop-blur disabled:opacity-50 disabled:cursor-not-allowed">{busy ? 'שומר…' : 'שמירת כל השינויים'}</button>
        <Status status={status} />
      </div>
    </div>
  );
}
