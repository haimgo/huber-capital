import { useEffect, useState } from 'preact/hooks';
import { browserClient } from '../../lib/supabase';
import { useStatus, Status } from './ui';

export default function MediaManager() {
  const sb = browserClient();
  const [files, setFiles] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const { status, show } = useStatus();

  async function load() {
    const { data, error } = await sb.storage.from('media').list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
    if (error) show('שגיאה בטעינה: ' + error.message, 'err', { sticky: true });
    setFiles((data ?? []).filter((f) => f.name !== '.emptyFolderPlaceholder'));
  }
  useEffect(() => { load(); }, []);

  const publicUrl = (name: string) => sb.storage.from('media').getPublicUrl(name).data.publicUrl;

  async function upload(e: any) {
    const inputEl = e.currentTarget;
    const file = inputEl.files?.[0];
    if (!file) return;
    setBusy(true);
    show('מעלה…', 'info', { sticky: true });
    const path = Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const { error } = await sb.storage.from('media').upload(path, file, { upsert: false });
    inputEl.value = '';
    setBusy(false);
    if (error) { show('שגיאה: ' + error.message, 'err'); return; }
    show('הועלה ✓', 'ok');
    load();
  }
  async function del(name: string) {
    if (!confirm('למחוק תמונה זו?')) return;
    const { error } = await sb.storage.from('media').remove([name]);
    if (error) { show('שגיאה: ' + error.message, 'err'); return; }
    show('נמחק ✓', 'ok'); load();
  }
  async function copy(name: string) {
    try {
      await navigator.clipboard.writeText(publicUrl(name));
      show('הקישור הועתק ✓', 'ok');
    } catch {
      show('לא ניתן להעתיק אוטומטית — פתחו את התמונה והעתיקו ידנית', 'err');
    }
  }

  return (
    <div>
      <div class="flex flex-row-reverse items-center gap-4 mb-6 min-h-[2.5rem]">
        <label class={`btn-neon rounded-full px-5 py-2.5 eyebrow text-[11px] text-fg ${busy ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
          {busy ? 'מעלה…' : '+ העלאת תמונה'}
          <input type="file" accept="image/*" onChange={upload} disabled={busy} class="hidden" />
        </label>
        <Status status={status} />
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {files.map((f) => (
          <div key={f.name} class="glass rounded-xl overflow-hidden">
            <img src={publicUrl(f.name)} alt={f.name} loading="lazy" class="w-full h-32 object-cover" />
            <div class="p-2 flex flex-row-reverse justify-between text-[10px] eyebrow">
              <button type="button" onClick={() => copy(f.name)} class="text-cyan hover:opacity-80">העתק קישור</button>
              <button type="button" onClick={() => del(f.name)} class="text-magenta hover:opacity-80">מחק</button>
            </div>
          </div>
        ))}
        {files.length === 0 && <p class="text-mute text-sm col-span-full">אין תמונות עדיין.</p>}
      </div>
    </div>
  );
}
