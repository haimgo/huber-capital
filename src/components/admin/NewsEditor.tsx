import { useEffect, useState } from 'preact/hooks';
import { browserClient } from '../../lib/supabase';

const blank = () => ({
  title: '', slug: '', date: new Date().toISOString().slice(0, 10),
  excerpt: '', body: '', cover_url: '', published: false,
});

export default function NewsEditor() {
  const sb = browserClient();
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [status, setStatus] = useState('');

  async function load() {
    const { data } = await sb.from('news').select('*').order('date', { ascending: false });
    setItems(data ?? []);
  }
  useEffect(() => { load(); }, []);

  const set = (k: string, v: any) => setEditing((e: any) => ({ ...e, [k]: v }));

  async function save() {
    const row = { ...editing };
    if (!row.slug) row.slug = (row.title || 'post').toLowerCase().replace(/\s+/g, '-').replace(/[^\w֐-׿-]/g, '');
    setStatus('שומר…');
    const res = row.id ? await sb.from('news').update(row).eq('id', row.id) : await sb.from('news').insert(row);
    if (res.error) { setStatus('שגיאה: ' + res.error.message); return; }
    setStatus('נשמר ✓'); setEditing(null); load();
  }
  async function del(id: number) {
    if (!confirm('למחוק כתבה זו?')) return;
    await sb.from('news').delete().eq('id', id);
    load();
  }

  const input = 'w-full input-glass rounded-lg px-3 py-2 text-fg';
  if (editing) {
    return (
      <div class="glass rounded-2xl p-6 max-w-2xl text-right space-y-4">
        <div><label class="eyebrow text-[10px] text-mute block mb-1">כותרת</label><input value={editing.title} onInput={(e: any) => set('title', e.currentTarget.value)} class={input} /></div>
        <div class="grid sm:grid-cols-2 gap-4">
          <div><label class="eyebrow text-[10px] text-mute block mb-1">Slug (כתובת)</label><input value={editing.slug} onInput={(e: any) => set('slug', e.currentTarget.value)} dir="ltr" class={input} placeholder="auto" /></div>
          <div><label class="eyebrow text-[10px] text-mute block mb-1">תאריך</label><input type="date" value={editing.date} onInput={(e: any) => set('date', e.currentTarget.value)} dir="ltr" class={input} /></div>
        </div>
        <div><label class="eyebrow text-[10px] text-mute block mb-1">תקציר</label><textarea value={editing.excerpt} onInput={(e: any) => set('excerpt', e.currentTarget.value)} rows={2} class={input} /></div>
        <div><label class="eyebrow text-[10px] text-mute block mb-1">תוכן</label><textarea value={editing.body} onInput={(e: any) => set('body', e.currentTarget.value)} rows={8} class={input} /></div>
        <div><label class="eyebrow text-[10px] text-mute block mb-1">קישור תמונת כיסוי (ממדיה)</label><input value={editing.cover_url} onInput={(e: any) => set('cover_url', e.currentTarget.value)} dir="ltr" class={input} /></div>
        <label class="flex flex-row-reverse items-center gap-2 text-sm"><input type="checkbox" checked={editing.published} onChange={(e: any) => set('published', e.currentTarget.checked)} /> מפורסם</label>
        <div class="flex flex-row-reverse gap-4 items-center pt-2">
          <button onClick={save} class="btn-neon rounded-full px-6 py-2.5 eyebrow text-[11px] text-fg">שמירה</button>
          <button onClick={() => setEditing(null)} class="eyebrow text-[11px] text-mute hover:text-fg">ביטול</button>
          {status && <span class="text-mute text-sm">{status}</span>}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div class="flex flex-row-reverse justify-between items-center mb-4">
        <button onClick={() => setEditing(blank())} class="btn-neon rounded-full px-5 py-2 eyebrow text-[11px] text-fg">+ כתבה חדשה</button>
        {status && <span class="text-mute text-sm">{status}</span>}
      </div>
      <div class="space-y-2">
        {items.map((n) => (
          <div class="glass rounded-xl px-4 py-3 flex flex-row-reverse items-center justify-between">
            <div class="text-right">
              <span class="text-fg text-sm">{n.title || '(ללא כותרת)'}</span>
              <span class="text-mute text-[11px] mr-3">{n.date} {n.published ? '· מפורסם' : '· טיוטה'}</span>
            </div>
            <div class="flex flex-row-reverse gap-4 text-[11px] eyebrow">
              <button onClick={() => setEditing(n)} class="text-cyan hover:opacity-80">עריכה</button>
              <button onClick={() => del(n.id)} class="text-magenta hover:opacity-80">מחיקה</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p class="text-mute text-sm">אין כתבות עדיין.</p>}
      </div>
    </div>
  );
}
