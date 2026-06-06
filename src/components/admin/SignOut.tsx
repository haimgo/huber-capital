import { browserClient } from '../../lib/supabase';

export default function SignOut() {
  async function go() {
    await browserClient().auth.signOut();
    window.location.href = '/admin/login';
  }
  return (
    <button onClick={go} class="eyebrow text-[11px] text-mute hover:text-cyan transition">
      יציאה
    </button>
  );
}
