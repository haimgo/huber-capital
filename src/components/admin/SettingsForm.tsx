import { useEffect, useState } from 'preact/hooks';
import { browserClient } from '../../lib/supabase';
import { useStatus, Status, useUnsavedGuard, UnsavedDot, useShowRu, RuToggle, CardsSkeleton } from './ui';
import { fieldsDiffer } from '../../lib/dirty';

type Field = { key: string; label: string; type?: 'text' | 'textarea'; noRu?: boolean };
const GROUPS: { title: string; fields: Field[] }[] = [
  {
    title: 'הירו — ראש העמוד',
    fields: [
      { key: 'hero_eyebrow', label: 'תווית עליונה' },
      { key: 'hero_title', label: 'כותרת ראשית' },
      { key: 'hero_sub', label: 'תת-כותרת', type: 'textarea' },
    ],
  },
  // 'מנשר' (manifesto) hidden — the home manifesto section was removed; the
  // approach banner is edited under טקסטים → בית. Columns remain in the DB.
  {
    title: 'קריאה לפעולה',
    fields: [
      { key: 'cta_title', label: 'כותרת' },
      { key: 'cta_sub', label: 'תת-כותרת', type: 'textarea' },
    ],
  },
  {
    title: 'תמונת גלעד',
    fields: [{ key: 'gilad_image', label: 'קישור תמונה (העלו ב"מדיה" והעתיקו את הקישור לכאן)', noRu: true }],
  },
  {
    title: 'רשתות חברתיות (אייקונים בתחתית האתר)',
    fields: [
      { key: 'social_facebook', label: 'פייסבוק — קישור מלא לעמוד (ריק = מוסתר)', noRu: true },
      { key: 'social_instagram', label: 'אינסטגרם — קישור מלא לעמוד (ריק = מוסתר)', noRu: true },
      { key: 'social_youtube', label: 'יוטיוב — קישור מלא לערוץ (ריק = מוסתר)', noRu: true },
      { key: 'social_tiktok', label: 'טיקטוק — קישור מלא לעמוד (ריק = מוסתר)', noRu: true },
    ],
  },
];

// All user-editable keys (incl. the parallel *_ru columns) — used to compare the
// working copy against the last-saved snapshot for the unsaved-changes guard.
const KEYS = GROUPS.flatMap((g) =>
  g.fields.flatMap((f) => (f.noRu ? [f.key] : [f.key, `${f.key}_ru`]))
);

export default function SettingsForm() {
  const sb = browserClient();
  const [row, setRow] = useState<any>(null);
  const [saved, setSaved] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const { status, show } = useStatus();
  const [showRu, toggleRu] = useShowRu();

  useEffect(() => {
    (async () => {
      const { data, error } = await sb.from('site_settings').select('*').eq('id', 1).single();
      if (error) show('שגיאה בטעינה: ' + error.message, 'err', { sticky: true });
      setRow(data ?? { id: 1 });
      setSaved(data ?? { id: 1 });
    })();
  }, []);

  const set = (k: string, v: string) => setRow((r: any) => ({ ...r, [k]: v }));
  const inputCls = 'w-full input-glass rounded-lg px-3 py-2 text-fg';

  async function save() {
    setBusy(true);
    show('שומר…', 'info', { sticky: true });
    const { error } = await sb.from('site_settings').upsert({ ...row, id: 1 });
    if (!error) setSaved({ ...row, id: 1 });
    show(error ? 'שגיאה: ' + error.message : 'נשמר ✓', error ? 'err' : 'ok');
    setBusy(false);
  }

  const dirty = !!row && !!saved && fieldsDiffer(KEYS, row, saved);
  useUnsavedGuard(dirty);

  if (!row) return <CardsSkeleton count={3} lines={2} />;
  return (
    <div class="max-w-2xl space-y-6">
      <div class="flex flex-row-reverse items-start justify-between gap-4">
        <RuToggle show={showRu} onToggle={toggleRu} />
        <p class="text-mute text-sm font-light">מלאו את שדות ה־RU כדי להציג טקסט ברוסית; אם יישארו ריקים — יוצג הטקסט בעברית.</p>
      </div>
      {GROUPS.map((g) => (
        <fieldset key={g.title} class="glass rounded-2xl p-6 text-start space-y-5">
          <legend class="eyebrow text-[11px] text-cyan px-1">{g.title}</legend>
          {g.fields.map((f) => (
            <div key={f.key} class="space-y-2">
              <div>
                <label for={`s-${f.key}`} class="field-label text-mute block mb-1">{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea id={`s-${f.key}`} value={row[f.key] ?? ''} onInput={(e: any) => set(f.key, e.currentTarget.value)} rows={2} class={inputCls} />
                ) : (
                  <input id={`s-${f.key}`} value={row[f.key] ?? ''} onInput={(e: any) => set(f.key, e.currentTarget.value)} class={inputCls} />
                )}
              </div>
              {showRu && !f.noRu && (
                <div>
                  <label for={`s-${f.key}-ru`} dir="ltr" class="field-label field-label--ru text-mute/70 block mb-1">RU · Русский</label>
                  {f.type === 'textarea' ? (
                    <textarea id={`s-${f.key}-ru`} dir="ltr" value={row[`${f.key}_ru`] ?? ''} onInput={(e: any) => set(`${f.key}_ru`, e.currentTarget.value)} rows={2} class={inputCls} />
                  ) : (
                    <input id={`s-${f.key}-ru`} dir="ltr" value={row[`${f.key}_ru`] ?? ''} onInput={(e: any) => set(`${f.key}_ru`, e.currentTarget.value)} class={inputCls} />
                  )}
                </div>
              )}
            </div>
          ))}
        </fieldset>
      ))}
      <div class="flex flex-row-reverse items-center gap-4 sticky bottom-4">
        <button type="button" onClick={save} disabled={busy} class="btn-neon rounded-full px-6 py-2.5 eyebrow text-[11px] text-fg bg-space/80 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed">{busy ? 'שומר…' : 'שמירה'}</button>
        {dirty && !status && <UnsavedDot />}
        <Status status={status} />
      </div>
    </div>
  );
}
