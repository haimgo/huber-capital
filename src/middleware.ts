import { defineMiddleware } from 'astro:middleware';
import WebSocketImpl from 'ws';
import { serverClient } from './lib/supabase';
import { isAdmin } from './lib/admin';
import { securityHeaders } from './lib/security';
import { normalizeGuardPath } from './lib/pathGuard';

const SECURITY_HEADERS = securityHeaders(import.meta.env.DEV);

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

  // Locale: Russian is served under /ru/* (see src/pages/ru/[...slug].astro, which
  // rewrites to the Hebrew page). Expose the language to pages; the `??` guard keeps
  // it correct if the middleware re-runs after that rewrite.
  context.locals.lang = context.locals.lang ?? (pathname === '/ru' || pathname.startsWith('/ru/') ? 'ru' : 'he');

  // Match the guard on a normalized path (decoded + slash-collapsed + case-folded)
  // so an encoded form like /%61dmin can't dodge the prefix check while the router
  // still resolves it to the admin page. See src/lib/pathGuard.ts.
  const guardPath = normalizeGuardPath(pathname);
  const isAdminArea = guardPath === '/admin' || guardPath.startsWith('/admin/');
  const isApi = guardPath.startsWith('/api/');
  const isLogin = guardPath.startsWith('/admin/login');
  // /admin/reset is opened from a password-recovery email link, before any server
  // session cookie exists, so it must bypass the guard like the login page does.
  const isReset = guardPath.startsWith('/admin/reset');

  // Guard the admin area (login + password-reset pages excepted). Admin is Hebrew-only.
  if (isAdminArea && !isLogin && !isReset) {
    const sb = serverClient(context.cookies);
    if (!(await isAdmin(sb))) {
      return context.redirect('/admin/login');
    }
  }

  const res = await next();

  // Security headers (CSP, anti-clickjacking, hardening) on every response.
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) res.headers.set(key, value);

  // Cache public content briefly at the CDN; never cache admin or API.
  if (!isAdminArea && !isApi && context.request.method === 'GET') {
    res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=86400');
  } else if (isAdminArea || isApi) {
    // Authenticated admin HTML / API JSON must never be cached by a shared cache.
    res.headers.set('Cache-Control', 'private, no-store');
  }
  return res;
});
