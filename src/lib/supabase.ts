import { createServerClient, createBrowserClient } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

const URL = import.meta.env.PUBLIC_SUPABASE_URL as string;
const ANON = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string;

/** Cookie-bound client for SSR pages / middleware / API routes. */
export function serverClient(cookies: AstroCookies) {
  return createServerClient(URL, ANON, {
    cookies: {
      get: (key: string) => cookies.get(key)?.value,
      set: (key: string, value: string, options: any) => cookies.set(key, value, options),
      remove: (key: string, options: any) => cookies.delete(key, options),
    },
  });
}

/** Browser client for admin islands (uses the logged-in session). */
export function browserClient() {
  return createBrowserClient(URL, ANON);
}
