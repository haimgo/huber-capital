import { defineMiddleware } from 'astro:middleware';
import WebSocketImpl from 'ws';
import { serverClient } from './lib/supabase';
import { isAdmin } from './lib/admin';

// @supabase/realtime-js (pulled in by supabase-js) throws at client construction
// when there is no global WebSocket — which is the case on Vercel's serverless
// runtime (Node < 22). Provide one. We only use Supabase for REST + Auth and never
// open a Realtime channel, so no socket is actually opened. Server-only: this module
// is never bundled to the client (browsers already have WebSocket).
if (typeof (globalThis as any).WebSocket === 'undefined') {
  (globalThis as any).WebSocket = WebSocketImpl;
}

// Known public routes — used to restore a 200 status after a /ru rewrite (a rewrite
// from a path with no route of its own yields a 404 status even when the target
// rendered correctly). Keep in sync when adding public pages.
const PUBLIC_PATHS = new Set([
  '/', '/about', '/process', '/projects', '/investment', '/press',
  '/contact', '/news', '/thank-you',
  '/legal/privacy', '/legal/terms', '/legal/accessibility',
]);
function isKnownPath(p: string): boolean {
  const clean = p.replace(/\/+$/, '') || '/';
  return PUBLIC_PATHS.has(clean) || clean.startsWith('/news/');
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // --- Locale --- Russian is served under /ru/*, Hebrew (default) at the root.
  // Resolve once; if middleware re-runs after the rewrite below, keep locals.lang.
  const ruPrefixed = pathname === '/ru' || pathname.startsWith('/ru/');
  context.locals.lang = context.locals.lang ?? (ruPrefixed ? 'ru' : 'he');

  // Rewrite /ru/* to the underlying route so one set of pages serves both
  // languages; pages read the language from Astro.locals.lang.
  if (ruPrefixed) {
    const targetPath = pathname.replace(/^\/ru(?=\/|$)/, '') || '/';
    const res = await context.rewrite(targetPath + context.url.search);
    // The rewrite renders the right page but inherits a 404 status (the /ru/* URL has
    // no route). Restore 200 for known routes; leave genuine misses as 404.
    if (res.status === 404 && isKnownPath(targetPath)) {
      const headers = new Headers(res.headers);
      if (context.request.method === 'GET') {
        headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=86400');
      }
      return new Response(res.body, { status: 200, statusText: 'OK', headers });
    }
    return res;
  }

  const path = pathname;
  const isAdminArea = path === '/admin' || path.startsWith('/admin/');
  const isApi = path.startsWith('/api/');
  const isLogin = path.startsWith('/admin/login');

  // Guard the admin area (login page excepted). Admin is Hebrew-only.
  if (isAdminArea && !isLogin) {
    const sb = serverClient(context.cookies);
    if (!(await isAdmin(sb))) {
      return context.redirect('/admin/login');
    }
  }

  const res = await next();

  // Cache public content briefly at the CDN; never cache admin or API.
  if (!isAdminArea && !isApi && context.request.method === 'GET') {
    res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=86400');
  }
  return res;
});
