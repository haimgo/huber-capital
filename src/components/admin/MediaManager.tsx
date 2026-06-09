import { useEffect, useState } from 'preact/hooks';
import { browserClient } from '../../lib/supabase';
import { useStatus, Status, useConfirm, GridSkeleton } from './ui';

const PAGE = 100;
// Strip the upload prefix (timestamp, optional index) to show a friendly filename.
const displayName = (name: string) => name.replace(/^\d+-(\d+-)?/, '');

export default function MediaManager() {
  const sb = browserClient();
  const [files, setFiles] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const { status, show } = useStatus();
  const { confirm, confirmElement } = useConfirm();

  async function load(reset = true) {
    const offset = reset ? 0 : files.length;
    const { data, error } = await sb.storage.from('media').list('', { limit: PAGE, offset, sortBy: { column: 'created_at', order: 'desc' } });
    if (error) { show('שגיאה בטעינה: ' + error.message, 'err', { sticky: true }); return; }
    const batch = (data ?? []).filter((f) => f.name !== '.emptyFolderPlaceholder');
    setFiles((prev) => (reset ? batch : [...prev, ...batch]));
    setHasMore((data ?? []).length === PAGE);
  }
  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const publicUrl = (name: string) => sb.storage.from('media').getPublicUrl(name).data.publicUrl;

  async function upload(e: any) {
    const inputEl = e.currentTarget;
    const list = Array.from((inputEl.files ?? []) as FileList);
    if (!list.length) return;
    setBusy(true);
    let ok = 0;
    for (let i = 0; i < list.length; i++) {
      show(`מעלה ${i + 1} מתוך ${list.length}…`, 'info', { sticky: true });
      const file = list[i];
      const path = `${Date.now()}-${i}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const { error } = await sb.storage.from('media').upload(path, file, { upsert: false });
      if (error) {
        inputEl.value = '';
        setBusy(false);
        show(`שגיאה בהעלאת ${file.name}: ${error.message}`, 'err');
        load();
        return;
      }
      ok++;
    }
    inputEl.value = '';
    setBusy(false);
    show(`הועלו ${ok} תמונות ✓`, 'ok');
    load();
  }
  async function del(name: string) {
    if (!(await confirm('למחוק תמונה זו?', { title: 'מחיקת תמונה', confirmLabel: 'מחיקה', danger: true }))) return;
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
          {busy ? 'מעלה…' : '+ העלאת תמונות'}
          <input type="file" accept="image/*" multiple onChange={upload} disabled={busy} class="hidden" />
        </label>
        <Status status={status} />
      </div>
      {loading ? (
        <GridSkeleton count={8} />
      ) : (
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((f) => (
            <div key={f.name} class="glass rounded-xl overflow-hidden">
              <img src={publicUrl(f.name)} alt={displayName(f.name)} loading="lazy" class="w-full h-32 object-cover" />
              <p class="px-2 pt-1.5 text-fg/75 text-[11px] truncate" dir="ltr" title={f.name}>{displayName(f.name)}</p>
              <div class="p-1.5 flex flex-row-reverse justify-between text-[10px] eyebrow">
                <button type="button" onClick={() => copy(f.name)} class="rounded-lg px-2 py-1.5 text-cyan hover:bg-white/5 transition">העתק קישור</button>
                <button type="button" onClick={() => del(f.name)} class="rounded-lg px-2 py-1.5 text-magenta hover:bg-magenta/10 transition">מחק</button>
              </div>
            </div>
          ))}
          {files.length === 0 && <p class="text-mute text-sm col-span-full">אין תמונות עדיין.</p>}
        </div>
      )}
      {hasMore && (
        <div class="text-center mt-6">
          <button type="button" onClick={() => load(false)} disabled={busy} class="btn-neon rounded-full px-6 py-2.5 eyebrow text-[11px] text-fg disabled:opacity-50 disabled:cursor-not-allowed">טען עוד</button>
        </div>
      )}
      {confirmElement}
    </div>
  );
}
