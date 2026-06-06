import { useEffect, useState } from 'preact/hooks';
import { browserClient } from '../../lib/supabase';

const FIELDS: { key: string; label: string; type?: 'text' | 'textarea' }[] = [
  { key: 'hero_eyebrow', label: 'הירו — תווית עליונה' },
  { key: 'hero_title', label: 'הירו — כותרת ראשית' },
  { key: 'hero_sub', label: 'הירו — תת-כותרת', type: 'textarea' },
  { key: 'manifesto_main', label: 'מנשר — שורה ראשית', type: 'textarea' },
  { key: 'manifesto_sub', label: 'מנשר — שורת משנה', type: 'textarea' },
  { key: 'cta_title', label: 'קריאה לפעולה — כותרת' },
  { key: 'cta_sub', label: 'קריאה לפעולה — תת-כותרת', type: 'textarea' },
];

export default function SettingsForm() {
  const sb = browserClient();
  const [row, setRow] = useState<any>(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await sb.from('site_settings').select('*').eq('id', 1).single();
      setRow(data ?? { id: 1 });
    })();
  }, []);

  const set = (k: string, v: string) => setRow((r: any) => ({ ...r, [k]: v }));

  async function save() {
    setStatus('שומר…');
    const { error } = await sb.from('site_settings').upsert({ ...row, id: 1 });
    setStatus(error ? 'שגיאה: ' + error.message : 'נשמר ✓');
  }

  if (!row) return <p class="text-mute">טוען…</p>;
  return (
    <div class="glass rounded-2xl p-6 text-right space-y-4 max-w-2xl">
      {FIELDS.map((f) => (
        <div>
          <label class="eyebrow text-[10px] text-mute block mb-1">{f.label}</label>
          {f.type === 'textarea' ? (
            <textarea value={row[f.key] ?? ''} onInput={(e: any) => set(f.key, e.currentTarget.value)} rows={2} class="w-full input-glass rounded-lg px-3 py-2 text-fg" />
          ) : (
            <input value={row[f.key] ?? ''} onInput={(e: any) => set(f.key, e.currentTarget.value)} class="w-full input-glass rounded-lg px-3 py-2 text-fg" />
          )}
        </div>
      ))}
      <div class="flex flex-row-reverse items-center gap-4 pt-2">
        <button onClick={save} class="btn-neon rounded-full px-6 py-2.5 eyebrow text-[11px] text-fg">שמירה</button>
        {status && <span class="text-mute text-sm">{status}</span>}
      </div>
    </div>
  );
}
