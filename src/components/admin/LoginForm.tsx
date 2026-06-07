import { useState } from 'preact/hooks';
import { browserClient } from '../../lib/supabase';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

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

  const input = 'w-full input-glass rounded-xl px-4 py-3 text-fg mb-4';
  return (
    <form onSubmit={onSubmit} class="text-right">
      <label for="login-email" class="eyebrow text-[10px] text-mute block mb-2">אימייל</label>
      <input id="login-email" type="email" required autocomplete="email" value={email} onInput={(e: any) => setEmail(e.currentTarget.value)} dir="ltr" class={input} />
      <label for="login-pass" class="eyebrow text-[10px] text-mute block mb-2">סיסמה</label>
      <input id="login-pass" type="password" required autocomplete="current-password" value={password} onInput={(e: any) => setPassword(e.currentTarget.value)} dir="ltr" class={input} />
      {error && <p class="text-magenta text-sm mb-3" role="alert">{error}</p>}
      <button type="submit" disabled={busy} aria-busy={busy} class="btn-neon rounded-full px-8 py-3 eyebrow text-sm text-fg w-full disabled:opacity-60">{busy ? '…' : 'כניסה'}</button>
    </form>
  );
}
