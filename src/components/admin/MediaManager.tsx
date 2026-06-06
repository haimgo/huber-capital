import { useEffect, useState } from 'preact/hooks';
import { browserClient } from '../../lib/supabase';

export default function MediaManager() {
  const sb = browserClient();
  const [files, setFiles] = useState<any[]>([]);
  const [status, setStatus] = useState('');

  async function load() {
    const { data } = await sb.storage.from('media').list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
    setFiles((data ?? []).filter((f) => f.name !== '.emptyFolderPlaceholder'));
  }
  useEffect(() => { load(); }, []);

  const publicUrl = (name: string) => sb.storage.from('media').getPublicUrl(name).data.publicUrl;

  async function upload(e: any) {
    const file = e.currentTarget.files?.[0];
    if (!file) return;
    setStatus('מעלה…');
    const path = Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const { error } = await sb.storage.from('media').upload(path, file, { upsert: false });
    setStatus(error ? 'שגיאה: ' + error.message : 'הועלה ✓');
    e.currentTarget.value = '';
    load();
  }
  async function del(name: string) {
    if (!confirm('למחוק תמונה זו?')) return;
    await sb.storage.from('media').remove([name]);
    load();
  }
  async function copy(name: string) {
    await navigator.clipboard.writeText(publicUrl(name));
    setStatus('הקישור הועתק ✓');
  }

  return (
    <div>
      <div class="flex flex-row-reverse items-center gap-4 mb-6">
        <label class="btn-neon rounded-full px-5 py-2.5 eyebrow text-[11px] text-fg cursor-pointer">
          + העלאת תמונה
          <input type="file" accept="image/*" onChange={upload} class="hidden" />
        </label>
        {status && <span class="text-mute text-sm">{status}</span>}
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {files.map((f) => (
          <div class="glass rounded-xl overflow-hidden">
            <img src={publicUrl(f.name)} alt={f.name} class="w-full h-32 object-cover" />
            <div class="p-2 flex flex-row-reverse justify-between text-[10px] eyebrow">
              <button onClick={() => copy(f.name)} class="text-cyan hover:opacity-80">העתק קישור</button>
              <button onClick={() => del(f.name)} class="text-magenta hover:opacity-80">מחק</button>
            </div>
          </div>
        ))}
        {files.length === 0 && <p class="text-mute text-sm col-span-full">אין תמונות עדיין.</p>}
      </div>
    </div>
  );
}
