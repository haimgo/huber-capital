import { useEffect, useState } from 'preact/hooks';
import { browserClient } from '../../lib/supabase';
import { useStatus, Status, useUnsavedGuard, UnsavedDot, useShowRu, RuToggle, CardsSkeleton } from './ui';
import { fieldsDiffer } from '../../lib/dirty';
import { PAGE_SECTIONS } from '../../lib/pageSections';

const keyOf = (page: string, slot: string) => `${page}:${slot}`;
const ruKeyOf = (page: string, slot: string) => `${page}:${slot}:ru`;

export default function PagesEditor() {
  const sb = browserClient();
  const [vals, setVals] = useState<Record<string, string>>({});
  const [savedVals, setSavedVals] = useState<Record<string, string>>({});
  const [inDb, setInDb] = useState<Record<string, boolean>>({});
  const [dbRu, setDbRu] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const { status, show } = useStatus();
  const [showRu, toggleRu] = useShowRu();

  async function load() {
    // select('*') so this works before the Russian-columns migration is applied.
    const res = await sb.from('page_sections').select('*');
    if (res.error) show('שגיאה בטעינה: ' + res.error.message, 'err', { sticky: true });
    const dbMap: Record<string, string> = {};
    const dbMapRu: Record<string, string> = {};
    const existing: Record<string, boolean> = {};
    const ruExisting: Record<string, boolean> = {};
    for (const r of (res.data ?? []) as any[]) {
      const k = keyOf(r.page, r.slot);
      dbMap[k] = r.value;
      existing[k] = true;
      if (r.value_ru != null) { dbMapRu[k] = r.value_ru; ruExisting[k] = true; }
    }
    const init: Record<string, string> = {};
    for (const p of PAGE_SECTIONS)
      for (const f of p.fields) {
        const k = keyOf(p.page, f.slot);
        init[k] = dbMap[k] ?? f.default;
        init[ruKeyOf(p.page, f.slot)] = dbMapRu[k] ?? '';
      }
    setVals(init);
    setSavedVals(init);
    setInDb(existing);
    setDbRu(ruExisting);
  }
  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const set = (k: string, v: string) => setVals((s) => ({ ...s, [k]: v }));

  async function save() {
    setBusy(true);
    show('שומר…', 'info', { sticky: true });
    const toUpsert: any[] = [];
    const toDelete: { page: string; slot: string }[] = [];
    for (const p of PAGE_SECTIONS)
      for (const f of p.fields) {
        const k = keyOf(p.page, f.slot);
        const heVal = (vals[k] ?? '').trim();
        const ruVal = (vals[ruKeyOf(p.page, f.slot)] ?? '').trim();
        const isHeOv = heVal !== '' && heVal !== f.default;
        const isRuOv = ruVal !== '';
        if (isHeOv || isRuOv) {
          const obj: any = { page: p.page, slot: f.slot, value: isHeOv ? vals[k] : null };
          // Only touch value_ru when there is Russian (or there was — to clear it).
          if (isRuOv) obj.value_ru = vals[ruKeyOf(p.page, f.slot)];
          else if (dbRu[k]) obj.value_ru = null;
          toUpsert.push(obj);
        } else if (inDb[k]) {
          toDelete.push({ page: p.page, slot: f.slot });
        }
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

  const dirty = fieldsDiffer(Object.keys(savedVals), vals, savedVals);
  useUnsavedGuard(dirty);

  if (loading) return <CardsSkeleton count={3} lines={2} />;
  return (
    <div class="space-y-6 max-w-2xl">
      <div class="flex flex-row-reverse items-start justify-between gap-4">
        <RuToggle show={showRu} onToggle={toggleRu} />
        <p class="text-mute text-sm font-light leading-relaxed">
          עריכת הכותרות והפסקאות בעמודי האתר. בעברית — שדה זהה לטקסט המקורי לא נשמר (↩ לחזרה לברירת מחדל). ב־RU — אם יישאר ריק, יוצג הטקסט בעברית.
        </p>
      </div>
      {PAGE_SECTIONS.map((p) => (
        <fieldset key={p.page} class="glass rounded-2xl p-6 text-start space-y-5">
          <legend class="eyebrow text-[11px] text-cyan px-1">{p.title}</legend>
          {p.fields.map((f) => {
            const k = keyOf(p.page, f.slot);
            const rk = ruKeyOf(p.page, f.slot);
            const id = `ps-${p.page}-${f.slot}`;
            const overridden = (vals[k] ?? '') !== f.default;
            return (
              <div key={f.slot} class="space-y-2">
                <div>
                  <div class="flex flex-row-reverse justify-between items-center mb-1 gap-2">
                    <label for={id} class="field-label text-mute">{f.label}</label>
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
                {showRu && (
                  <div>
                    <label for={`${id}-ru`} dir="ltr" class="field-label field-label--ru text-mute/70 block mb-1">RU · Русский</label>
                    {f.type === 'textarea' ? (
                      <textarea id={`${id}-ru`} dir="ltr" value={vals[rk] ?? ''} onInput={(e: any) => set(rk, e.currentTarget.value)} rows={3} class="w-full input-glass rounded-lg px-3 py-2 text-fg" />
                    ) : (
                      <input id={`${id}-ru`} dir="ltr" value={vals[rk] ?? ''} onInput={(e: any) => set(rk, e.currentTarget.value)} class="w-full input-glass rounded-lg px-3 py-2 text-fg" />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </fieldset>
      ))}
      <div class="flex flex-row-reverse items-center gap-4 sticky bottom-4">
        <button type="button" onClick={save} disabled={busy} class="btn-neon rounded-full px-6 py-2.5 eyebrow text-[11px] text-fg bg-space/80 backdrop-blur disabled:opacity-50 disabled:cursor-not-allowed">{busy ? 'שומר…' : 'שמירת כל השינויים'}</button>
        {dirty && !status && <UnsavedDot />}
        <Status status={status} />
      </div>
    </div>
  );
}
