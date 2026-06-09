import { useEffect, useState } from 'preact/hooks';
import { browserClient } from '../../lib/supabase';
import { useStatus, Status, useUnsavedGuard, UnsavedDot, useConfirm, useShowRu, RuToggle, RowsSkeleton } from './ui';
import { fieldsDiffer } from '../../lib/dirty';

// Fields the editor can change — compared against the snapshot taken when editing began.
const NEWS_FIELDS = ['title', 'title_ru', 'slug', 'date', 'excerpt', 'excerpt_ru', 'body', 'body_ru', 'cover_url', 'published'];

const blank = () => ({
  title: '', slug: '', date: new Date().toISOString().slice(0, 10),
  excerpt: '', body: '', cover_url: '', published: false,
});

export default function NewsEditor() {
  const sb = browserClient();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [original, setOriginal] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState('');
  const { status, show } = useStatus();
  const { confirm, confirmElement } = useConfirm();
  const [showRu, toggleRu] = useShowRu();

  async function load() {
    const { data, error } = await sb.from('news').select('*').order('date', { ascending: false });
    if (error) show('שגיאה בטעינה: ' + error.message, 'err', { sticky: true });
    setItems(data ?? []);
  }
  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const set = (k: string, v: any) => setEditing((e: any) => ({ ...e, [k]: v }));
  const startEdit = (item: any) => { setEditing(item); setOriginal({ ...item }); };

  async function save() {
    const row = { ...editing };
    if (!row.title?.trim()) { show('נא להזין כותרת', 'err'); return; }
    if (!row.slug) {
      row.slug = (row.title || 'post').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w֐-׿-]/g, '');
    }
    setBusy(true);
    show('שומר…', 'info', { sticky: true });
    const res = row.id ? await sb.from('news').update(row).eq('id', row.id) : await sb.from('news').insert(row);
    setBusy(false);
    if (res.error) { show('שגיאה: ' + res.error.message, 'err'); return; }
    show('נשמר ✓', 'ok'); setEditing(null); load();
  }
  async function del(id: number) {
    if (!(await confirm('למחוק כתבה זו?', { title: 'מחיקת כתבה', confirmLabel: 'מחיקה', danger: true }))) return;
    const { error } = await sb.from('news').delete().eq('id', id);
    if (error) { show('שגיאה: ' + error.message, 'err'); return; }
    show('נמחק ✓', 'ok'); load();
  }

  const input = 'w-full input-glass rounded-lg px-3 py-2 text-fg';
  const dirty = !!editing && fieldsDiffer(NEWS_FIELDS, editing, original);
  useUnsavedGuard(dirty);
  const filtered = query
    ? items.filter((n) => `${n.title ?? ''} ${n.slug ?? ''}`.toLowerCase().includes(query.toLowerCase()))
    : items;

  if (editing) {
    return (
      <div class="glass rounded-2xl p-6 max-w-2xl text-start space-y-4">
        <div class="flex flex-row-reverse"><RuToggle show={showRu} onToggle={toggleRu} /></div>
        <div><label for="n-title" class="field-label text-mute block mb-1">כותרת</label><input id="n-title" value={editing.title} onInput={(e: any) => set('title', e.currentTarget.value)} class={input} /></div>
        {showRu && <div><label for="n-title-ru" dir="ltr" class="field-label field-label--ru text-mute/70 block mb-1">RU · Заголовок</label><input id="n-title-ru" dir="ltr" value={editing.title_ru ?? ''} onInput={(e: any) => set('title_ru', e.currentTarget.value)} class={input} /></div>}
        <div class="grid sm:grid-cols-2 gap-4">
          <div><label for="n-slug" class="field-label text-mute block mb-1">Slug (כתובת)</label><input id="n-slug" value={editing.slug} onInput={(e: any) => set('slug', e.currentTarget.value)} dir="ltr" class={input} placeholder="נוצר אוטומטית מהכותרת" /></div>
          <div><label for="n-date" class="field-label text-mute block mb-1">תאריך</label><input id="n-date" type="date" value={editing.date} onInput={(e: any) => set('date', e.currentTarget.value)} dir="ltr" class={input} /></div>
        </div>
        <div><label for="n-excerpt" class="field-label text-mute block mb-1">תקציר</label><textarea id="n-excerpt" value={editing.excerpt} onInput={(e: any) => set('excerpt', e.currentTarget.value)} rows={2} class={input} /></div>
        {showRu && <div><label for="n-excerpt-ru" dir="ltr" class="field-label field-label--ru text-mute/70 block mb-1">RU · Краткое описание</label><textarea id="n-excerpt-ru" dir="ltr" value={editing.excerpt_ru ?? ''} onInput={(e: any) => set('excerpt_ru', e.currentTarget.value)} rows={2} class={input} /></div>}
        <div><label for="n-body" class="field-label text-mute block mb-1">תוכן</label><textarea id="n-body" value={editing.body} onInput={(e: any) => set('body', e.currentTarget.value)} rows={8} class={input} /></div>
        {showRu && <div><label for="n-body-ru" dir="ltr" class="field-label field-label--ru text-mute/70 block mb-1">RU · Текст</label><textarea id="n-body-ru" dir="ltr" value={editing.body_ru ?? ''} onInput={(e: any) => set('body_ru', e.currentTarget.value)} rows={8} class={input} /></div>}
        <div><label for="n-cover" class="field-label text-mute block mb-1">קישור תמונת כיסוי (ממדיה)</label><input id="n-cover" value={editing.cover_url} onInput={(e: any) => set('cover_url', e.currentTarget.value)} dir="ltr" class={input} /></div>
        <button type="button" role="switch" aria-checked={editing.published ? 'true' : 'false'} onClick={() => set('published', !editing.published)} class="inline-flex flex-row-reverse items-center gap-3 w-fit cursor-pointer">
          <span class={`relative h-6 w-11 rounded-full border transition-colors ${editing.published ? 'bg-cyan/25 border-cyan/60' : 'bg-white/5 border-white/15'}`}>
            <span class={`absolute top-1/2 right-1 h-4 w-4 -translate-y-1/2 rounded-full transition-transform duration-200 ${editing.published ? '-translate-x-5 bg-cyan' : 'bg-mute'}`}></span>
          </span>
          <span class="text-sm text-fg select-none">{editing.published ? 'מפורסם' : 'טיוטה'}</span>
        </button>
        <div class="flex flex-row-reverse gap-4 items-center pt-2">
          <button type="button" onClick={save} disabled={busy} class="btn-neon rounded-full px-6 py-2.5 eyebrow text-[11px] text-fg disabled:opacity-50 disabled:cursor-not-allowed">{busy ? 'שומר…' : 'שמירה'}</button>
          <button type="button" onClick={async () => { if (!dirty || (await confirm('לבטל עריכה? שינויים שלא נשמרו יאבדו.', { title: 'שינויים לא נשמרו', confirmLabel: 'בטל עריכה', danger: true }))) setEditing(null); }} disabled={busy} class="eyebrow text-[11px] text-mute hover:text-fg disabled:opacity-50">ביטול</button>
          {dirty && !status && <UnsavedDot />}
          <Status status={status} />
        </div>
        {confirmElement}
      </div>
    );
  }

  if (loading) return <RowsSkeleton count={4} />;

  return (
    <div>
      <div class="flex flex-row-reverse justify-between items-center mb-4 gap-3 min-h-[2.25rem]">
        <button type="button" onClick={() => startEdit(blank())} class="btn-neon rounded-full px-5 py-2 eyebrow text-[11px] text-fg shrink-0">+ כתבה חדשה</button>
        <Status status={status} />
      </div>
      {items.length > 0 && (
        <input type="search" value={query} onInput={(e: any) => setQuery(e.currentTarget.value)} placeholder="חיפוש לפי כותרת…" aria-label="חיפוש כתבות" class="w-full sm:max-w-xs input-glass rounded-lg px-3 py-2 text-fg mb-4" />
      )}
      <div class="space-y-2">
        {filtered.map((n) => (
          <div key={n.id} class="glass rounded-xl px-4 py-3 flex flex-row-reverse items-center justify-between gap-3">
            <div class="text-start min-w-0">
              <span class="text-fg text-sm">{n.title || '(ללא כותרת)'}</span>
              <span class="text-mute text-[11px] mr-3">{n.date} {n.published ? '· מפורסם' : '· טיוטה'}</span>
            </div>
            <div class="flex flex-row-reverse items-center gap-1 text-[11px] eyebrow shrink-0">
              {n.published && n.slug && <a href={`/news/${n.slug}`} target="_blank" rel="noopener" class="rounded-lg px-2.5 py-2 text-mute hover:text-fg hover:bg-white/5 transition">צפייה ↗</a>}
              <button type="button" onClick={() => startEdit(n)} class="rounded-lg px-2.5 py-2 text-cyan hover:bg-white/5 transition">עריכה</button>
              <button type="button" onClick={() => del(n.id)} class="rounded-lg px-2.5 py-2 text-magenta hover:bg-magenta/10 transition">מחיקה</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p class="text-mute text-sm">אין כתבות עדיין.</p>}
        {items.length > 0 && filtered.length === 0 && <p class="text-mute text-sm">לא נמצאו כתבות התואמות לחיפוש.</p>}
      </div>
      {confirmElement}
    </div>
  );
}
