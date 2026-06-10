// Security response headers (CSP + hardening), applied to every SSR response in
// src/middleware.ts. Kept here — not inline in the middleware — so the policy is
// unit-testable (see tests/security.test.ts).
//
// Remediates the external DevSecOps scan findings: missing CSP (ZAP 10038),
// missing anti-clickjacking header (10020), and missing hardening headers —
// X-Content-Type-Options / Referrer-Policy / Permissions-Policy / COOP/CORP
// (10021, 10063, 90004). The site has exactly one inline script (the reveal/menu
// helper in BaseLayout, now bundled as a module), so production can run a strict
// `script-src 'self'` with no nonce/hash. Dev relaxes script/connect for Vite HMR.

/**
 * Supabase project origin (REST + Auth) the admin browser islands talk to.
 * PUBLIC_* vars are inlined at build; fall back to the `*.supabase.co` wildcard
 * so the policy stays valid even if the var is unset when the bundle is built.
 */
function supabaseOrigin(): string {
  const raw =
    (import.meta.env as any).PUBLIC_SUPABASE_URL ??
    (typeof process !== 'undefined' ? process.env?.PUBLIC_SUPABASE_URL : undefined);
  try {
    return raw ? new URL(raw).origin : 'https://*.supabase.co';
  } catch {
    return 'https://*.supabase.co';
  }
}

/** Build the Content-Security-Policy header value. */
export function buildCsp(isDev: boolean): string {
  const supabase = supabaseOrigin();

  // Vite/Preact HMR injects eval'd + inline helpers and talks over a websocket —
  // dev only. Production serves every script as a bundled, same-origin module.
  const scriptSrc = isDev ? ["'self'", "'unsafe-inline'", "'unsafe-eval'"] : ["'self'"];
  const connectSrc = isDev
    ? ["'self'", 'ws:', 'wss:', supabase, 'https://formspree.io']
    : ["'self'", supabase, 'https://formspree.io'];

  const directives: [string, string[]][] = [
    ['default-src', ["'self'"]],
    ['base-uri', ["'self'"]],
    ['script-src', scriptSrc],
    // Inline style attributes are used throughout (z-index, gradients, <option>
    // backgrounds), so style-src must allow inline styles. Fonts are self-hosted
    // (Fontsource, bundled same-origin), so no third-party font/style host is needed.
    ['style-src', ["'self'", "'unsafe-inline'"]],
    ['font-src', ["'self'"]],
    // Admin-pasted news/cover images and Supabase Storage public URLs may live on
    // any https host, so allow https images broadly (content is admin-controlled).
    ['img-src', ["'self'", 'data:', 'https:']],
    ['connect-src', connectSrc],
    // Contact form's no-JS fallback posts to Formspree; admin forms post same-origin.
    ['form-action', ["'self'", 'https://formspree.io']],
    ['frame-ancestors', ["'none'"]],
    ['frame-src', ["'none'"]],
    ['object-src', ["'none'"]],
    ['worker-src', ["'self'"]],
    ['manifest-src', ["'self'"]],
  ];

  const policy = directives.map(([name, values]) => `${name} ${values.join(' ')}`);
  if (!isDev) policy.push('upgrade-insecure-requests'); // would break http://localhost in dev
  return policy.join('; ');
}

/** Full set of security headers to apply to every response. */
export function securityHeaders(isDev: boolean): Record<string, string> {
  return {
    'Content-Security-Policy': buildCsp(isDev),
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy':
      'accelerometer=(), autoplay=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), browsing-topics=()',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    // HSTS only has meaning over HTTPS (production). 2 years, include subdomains.
    ...(isDev ? {} : { 'Strict-Transport-Security': 'max-age=63072000; includeSubDomains' }),
  };
}
