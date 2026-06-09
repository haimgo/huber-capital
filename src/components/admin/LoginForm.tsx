import { useState } from 'preact/hooks';
import { browserClient } from '../../lib/supabase';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function onSubmit(e: Event) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const sb = browserClient();
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      setError('אימייל או סיסמה שגויים.');
      setBusy(false);
      return;
    }
    window.location.href = '/admin';
  }

  async function resetPw() {
    if (!email) { setError('הזינו את כתובת האימייל ואז לחצו "שכחתי סיסמה".'); return; }
    setBusy(true);
    setError('');
    setResetSent(false);
    const sb = browserClient();
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/admin/reset',
    });
    setBusy(false);
    if (error) { setError('שגיאה בשליחת קישור האיפוס. נסו שוב.'); return; }
    setResetSent(true);
  }

  const input = 'w-full input-glass rounded-xl px-4 py-3 text-fg mb-4';
  return (
    <form onSubmit={onSubmit} class="text-start">
      <label for="login-email" class="field-label text-mute block mb-2">אימייל</label>
      <input id="login-email" type="email" required autocomplete="email" value={email} onInput={(e: any) => setEmail(e.currentTarget.value)} dir="ltr" class={input} />
      <label for="login-pass" class="field-label text-mute block mb-2">סיסמה</label>
      <div class="relative mb-4">
        <input id="login-pass" type={showPw ? 'text' : 'password'} required autocomplete="current-password" value={password} onInput={(e: any) => setPassword(e.currentTarget.value)} dir="ltr" class="w-full input-glass rounded-xl px-4 py-3 pl-11 text-fg" />
        <button type="button" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? 'הסתר סיסמה' : 'הצג סיסמה'} aria-pressed={showPw ? 'true' : 'false'} class="absolute inset-y-0 left-0 flex items-center px-3.5 text-mute hover:text-cyan transition">
          {showPw ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          )}
        </button>
      </div>
      {error && <p class="text-magenta text-sm mb-3" role="alert">{error}</p>}
      <button type="submit" disabled={busy} aria-busy={busy} class="btn-neon rounded-full px-8 py-3 eyebrow text-sm text-fg w-full disabled:opacity-60">{busy ? '…' : 'כניסה'}</button>
      {resetSent && <p class="text-cyan text-sm mt-4 text-center" role="status">אם האימייל רשום במערכת, יישלח אליו קישור לאיפוס סיסמה.</p>}
      <button type="button" onClick={resetPw} disabled={busy} class="block w-full text-center mt-4 eyebrow text-[10px] text-mute hover:text-cyan transition disabled:opacity-50">שכחתי סיסמה</button>
    </form>
  );
}
