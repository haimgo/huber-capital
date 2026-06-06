import { createServerClient, createBrowserClient } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

// Read env at runtime on the server (Vercel injects process.env into functions);
// fall back to import.meta.env (build-inlined, e.g. local dev). The `typeof process`
// guard keeps this safe if the module is ever evaluated on the client.
function env(key: string): string | undefined {
  const fromImport = (import.meta.env as any)[key];
  if (fromImport) return fromImport;
  if (typeof process !== 'undefined' && process.env) return process.env[key];
  return undefined;
}

/** Cookie-bound client for SSR pages / middleware / API routes. */
export function serverClient(cookies: AstroCookies) {
  const url = env('PUBLIC_SUPABASE_URL');
  const anon = env('PUBLIC_SUPABASE_ANON_KEY');
  if (!url || !anon) {
    throw new Error(
      'Missing Supabase env: set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY in the host (Vercel → Settings → Environment Variables, Production) and redeploy.'
    );
  }
  return createServerClient(url, anon, {
    cookies: {
      get: (key: string) => cookies.get(key)?.value,
      set: (key: string, value: string, options: any) => cookies.set(key, value, options),
      remove: (key: string, options: any) => cookies.delete(key, options),
    },
  });
}

/** Browser client for admin islands (PUBLIC vars are inlined into the client bundle at build). */
export function browserClient() {
  return createBrowserClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY
  );
}
