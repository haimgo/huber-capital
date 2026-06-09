import { useState } from 'preact/hooks';
import { browserClient } from '../../lib/supabase';

// Reached via the password-recovery email link. @supabase/ssr's browser client
// (detectSessionInUrl) establishes the recovery session from the URL on load, so
// updateUser() below can set a new password. If the link is missing/expired,
// updateUser returns an error and we point the user back to the login screen.
export default function ResetForm() {
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function onSubmit(e: Event) {
    e.preventDefault();
    setError('');
    if (pw.length < 8) { setError('הסיסמה חייבת להכיל לפחות 8 תווים.'); return; }
    if (pw !== pw2) { setError('הסיסמאות אינן תואמות.'); return; }
    setBusy(true);
    const sb = browserClient();
    const { error } = await sb.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) {
      setError('לא ניתן לעדכן את הסיסמה — ייתכן שקישור האיפוס פג תוקף. בקשו קישור חדש ממסך הכניסה.');
      return;
    }
    setDone(true);
    setTimeout(() => { window.location.href = '/admin'; }, 1500);
  }

  if (done) {
    return (
      <p class="text-cyan text-center" role="status">הסיסמה עודכנה ✓ — מעבירים אתכם לניהול…</p>
    );
  }

  return (
    <form onSubmit={onSubmit} class="text-start">
      <label for="reset-pw" class="field-label text-mute block mb-2">סיסמה חדשה</label>
      <div class="relative mb-4">
        <input id="reset-pw" type={showPw ? 'text' : 'password'} required autocomplete="new-password" value={pw} onInput={(e: any) => setPw(e.currentTarget.value)} dir="ltr" class="w-full input-glass rounded-xl px-4 py-3 pl-11 text-fg" />
        <button type="button" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? 'הסתר סיסמה' : 'הצג סיסמה'} aria-pressed={showPw ? 'true' : 'false'} class="absolute inset-y-0 left-0 flex items-center px-3.5 text-mute hover:text-cyan transition">
          {showPw ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          )}
        </button>
      </div>
      <label for="reset-pw2" class="field-label text-mute block mb-2">אימות סיסמה</label>
      <input id="reset-pw2" type={showPw ? 'text' : 'password'} required autocomplete="new-password" value={pw2} onInput={(e: any) => setPw2(e.currentTarget.value)} dir="ltr" class="w-full input-glass rounded-xl px-4 py-3 text-fg mb-4" />
      {error && <p class="text-magenta text-sm mb-3" role="alert">{error}</p>}
      <button type="submit" disabled={busy} aria-busy={busy} class="btn-neon rounded-full px-8 py-3 eyebrow text-sm text-fg w-full disabled:opacity-60">{busy ? '…' : 'עדכון סיסמה'}</button>
    </form>
  );
}
