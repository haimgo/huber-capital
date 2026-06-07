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

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // --- Locale --- Russian is served under /ru/*, Hebrew (default) at the root.
  // Resolve once; if middleware re-runs after the rewrite below, keep locals.lang.
  const ruPrefixed = pathname === '/ru' || pathname.startsWith('/ru/');
  context.locals.lang = context.locals.lang ?? (ruPrefixed ? 'ru' : 'he');

  // Rewrite /ru/* to the underlying route so one set of pages serves both
  // languages; pages read the language from Astro.locals.lang.
  if (ruPrefixed) {
    const target = (pathname.replace(/^\/ru(?=\/|$)/, '') || '/') + context.url.search;
    return context.rewrite(target);
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
