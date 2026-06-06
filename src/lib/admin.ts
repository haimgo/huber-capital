import type { SupabaseClient } from '@supabase/supabase-js';

/** True if the current session belongs to a user listed in `admins`. */
export async function isAdmin(sb: SupabaseClient): Promise<boolean> {
  const { data } = await sb.auth.getUser();
  const user = data?.user;
  if (!user) return false;
  const { count } = await sb
    .from('admins')
    .select('user_id', { count: 'exact', head: true })
    .eq('user_id', user.id);
  return (count ?? 0) > 0;
}
