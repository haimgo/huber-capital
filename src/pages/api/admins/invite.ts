import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { serverClient } from '../../../lib/supabase';
import { isAdmin } from '../../../lib/admin';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const sb = serverClient(cookies);
  if (!(await isAdmin(sb))) {
    return json({ error: 'אין הרשאה' }, 403);
  }
  let email = '';
  try {
    ({ email } = await request.json());
  } catch {}
  if (!email) return json({ error: 'נא להזין אימייל' }, 400);

  const url = process.env.PUBLIC_SUPABASE_URL ?? import.meta.env.PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return json({ error: 'מפתח service_role לא הוגדר (SUPABASE_SERVICE_ROLE_KEY).' }, 500);
  }

  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email);
  if (error) return json({ error: error.message }, 400);

  const userId = data?.user?.id;
  if (userId) {
    const { error: insErr } = await admin.from('admins').insert({ user_id: userId, email });
    if (insErr && !insErr.message.includes('duplicate')) return json({ error: insErr.message }, 400);
  }
  return json({ ok: true });
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
