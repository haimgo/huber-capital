import { useEffect, useState } from 'preact/hooks';
import { browserClient } from '../../lib/supabase';
import { useStatus, Status } from './ui';

export default function AdminsManager() {
  const sb = browserClient();
  const [admins, setAdmins] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const { status, show } = useStatus();

  async function load() {
    const { data, error } = await sb.from('admins').select('user_id, email');
    if (error) show('שגיאה בטעינה: ' + error.message, 'err', { sticky: true });
    setAdmins(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function invite(e: Event) {
    e.preventDefault();
    setBusy(true);
    show('שולח הזמנה…', 'info', { sticky: true });
    const res = await fetch('/api/admins/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const j = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { show('שגיאה: ' + (j.error || res.status), 'err'); return; }
    show('הזמנה נשלחה ✓ — המשתמש יקבל מייל להגדרת סיסמה', 'ok', { sticky: true });
    setEmail('');
    load();
  }

  async function remove(user_id: string) {
    if (!confirm('להסיר מנהל זה?')) return;
    const res = await fetch('/api/admins/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) { show('שגיאה: ' + (j.error || res.status), 'err'); return; }
    show('הוסר ✓', 'ok'); load();
  }

  return (
    <div class="max-w-2xl">
      <form onSubmit={invite} class="glass rounded-2xl p-5 flex flex-row-reverse gap-3 items-end mb-4">
        <div class="flex-1 text-right">
          <label for="admin-email" class="eyebrow text-[10px] text-mute block mb-1">הזמנת מנהל חדש (אימייל)</label>
          <input id="admin-email" type="email" required autocomplete="email" value={email} onInput={(e: any) => setEmail(e.currentTarget.value)} dir="ltr" class="w-full input-glass rounded-lg px-3 py-2 text-fg" />
        </div>
        <button type="submit" disabled={busy} class="btn-neon rounded-full px-5 py-2.5 eyebrow text-[11px] text-fg shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">{busy ? 'שולח…' : 'הזמנה'}</button>
      </form>
      <div class="min-h-[1.5rem] mb-4"><Status status={status} /></div>
      <div class="space-y-2">
        {admins.map((a) => (
          <div key={a.user_id} class="glass rounded-xl px-4 py-3 flex flex-row-reverse items-center justify-between">
            <span class="text-fg text-sm" dir="ltr">{a.email}</span>
            <button type="button" onClick={() => remove(a.user_id)} class="eyebrow text-[10px] text-magenta hover:opacity-80">הסרה</button>
          </div>
        ))}
        {admins.length === 0 && <p class="text-mute text-sm">אין מנהלים עדיין.</p>}
      </div>
    </div>
  );
}
