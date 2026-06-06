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
  let user_id = '';
  try {
    ({ user_id } = await request.json());
  } catch {}
  if (!user_id) return json({ error: 'חסר מזהה משתמש' }, 400);

  // Don't allow removing the last admin.
  const { count } = await sb.from('admins').select('user_id', { count: 'exact', head: true });
  if ((count ?? 0) <= 1) return json({ error: 'לא ניתן להסיר את המנהל האחרון' }, 400);

  const url = process.env.PUBLIC_SUPABASE_URL ?? import.meta.env.PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return json({ error: 'מפתח service_role לא הוגדר (SUPABASE_SERVICE_ROLE_KEY).' }, 500);
  }
  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { error } = await admin.from('admins').delete().eq('user_id', user_id);
  if (error) return json({ error: error.message }, 400);
  return json({ ok: true });
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}
