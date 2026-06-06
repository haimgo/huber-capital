import { useEffect, useState } from 'preact/hooks';
import { browserClient } from '../../lib/supabase';

export default function AdminsManager() {
  const sb = browserClient();
  const [admins, setAdmins] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data } = await sb.from('admins').select('user_id, email');
    setAdmins(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function invite(e: Event) {
    e.preventDefault();
    setBusy(true);
    setStatus('שולח הזמנה…');
    const res = await fetch('/api/admins/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const j = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setStatus('שגיאה: ' + (j.error || res.status)); return; }
    setStatus('הזמנה נשלחה ✓ (המשתמש יקבל מייל להגדרת סיסמה)');
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
    if (!res.ok) { setStatus('שגיאה: ' + (j.error || res.status)); return; }
    load();
  }

  return (
    <div class="max-w-2xl">
      <form onSubmit={invite} class="glass rounded-2xl p-5 flex flex-row-reverse gap-3 items-end mb-6">
        <div class="flex-1 text-right">
          <label class="eyebrow text-[10px] text-mute block mb-1">הזמנת מנהל חדש (אימייל)</label>
          <input type="email" required value={email} onInput={(e: any) => setEmail(e.currentTarget.value)} dir="ltr" class="w-full input-glass rounded-lg px-3 py-2 text-fg" />
        </div>
        <button type="submit" disabled={busy} class="btn-neon rounded-full px-5 py-2.5 eyebrow text-[11px] text-fg shrink-0">הזמנה</button>
      </form>
      {status && <p class="text-mute text-sm mb-4">{status}</p>}
      <div class="space-y-2">
        {admins.map((a) => (
          <div class="glass rounded-xl px-4 py-3 flex flex-row-reverse items-center justify-between">
            <span class="text-fg text-sm" dir="ltr">{a.email}</span>
            <button onClick={() => remove(a.user_id)} class="eyebrow text-[10px] text-magenta hover:opacity-80">הסרה</button>
          </div>
        ))}
      </div>
    </div>
  );
}
