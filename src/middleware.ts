import { defineMiddleware } from 'astro:middleware';
import { serverClient } from './lib/supabase';
import { isAdmin } from './lib/admin';

// Guard every /admin page except the login screen.
export const onRequest = defineMiddleware(async (context, next) => {
  const path = context.url.pathname;
  const isAdminArea = path === '/admin' || path.startsWith('/admin/');
  const isLogin = path === '/admin/login' || path.startsWith('/admin/login');

  if (isAdminArea && !isLogin) {
    const sb = serverClient(context.cookies);
    if (!(await isAdmin(sb))) {
      return context.redirect('/admin/login');
    }
  }
  return next();
});
