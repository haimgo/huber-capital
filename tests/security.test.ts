import { describe, it, expect } from 'vitest';
import { buildCsp, securityHeaders } from '../src/lib/security';

/** Pull a single directive's value out of a CSP string. */
function directive(csp: string, name: string): string | undefined {
  return csp
    .split(';')
    .map((s) => s.trim())
    .find((s) => s === name || s.startsWith(name + ' '))
    ?.slice(name.length)
    .trim();
}

describe('buildCsp', () => {
  it('locks scripts to same-origin in production (no unsafe-inline / unsafe-eval)', () => {
    const csp = buildCsp(false);
    expect(directive(csp, 'script-src')).toBe("'self'");
    expect(csp).not.toContain("'unsafe-eval'");
  });

  it('relaxes scripts only in dev for Vite/HMR', () => {
    const script = directive(buildCsp(true), 'script-src') ?? '';
    expect(script).toContain("'self'");
    expect(script).toContain("'unsafe-inline'");
    expect(script).toContain("'unsafe-eval'");
  });

  it('forbids framing (clickjacking) and plugins/objects', () => {
    const csp = buildCsp(false);
    expect(directive(csp, 'frame-ancestors')).toBe("'none'");
    expect(directive(csp, 'object-src')).toBe("'none'");
    expect(directive(csp, 'base-uri')).toBe("'self'");
  });

  it('allows the app’s real connect origins (Supabase + Formspree)', () => {
    const connect = directive(buildCsp(false), 'connect-src') ?? '';
    expect(connect).toContain('https://formspree.io');
    expect(connect).toContain('supabase');
  });

  it('self-hosts fonts: no third-party font/style hosts in the policy', () => {
    const csp = buildCsp(false);
    expect(directive(csp, 'font-src')).toBe("'self'");
    expect(directive(csp, 'style-src')).toBe("'self' 'unsafe-inline'");
    expect(csp).not.toContain('fonts.googleapis.com');
    expect(csp).not.toContain('fonts.gstatic.com');
  });

  it('upgrades insecure requests in prod but not in dev', () => {
    expect(buildCsp(false)).toContain('upgrade-insecure-requests');
    expect(buildCsp(true)).not.toContain('upgrade-insecure-requests');
  });
});

describe('securityHeaders', () => {
  it('sets the core hardening headers', () => {
    const h = securityHeaders(false);
    expect(h['X-Frame-Options']).toBe('DENY');
    expect(h['X-Content-Type-Options']).toBe('nosniff');
    expect(h['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    expect(h['Cross-Origin-Opener-Policy']).toBe('same-origin');
    expect(h['Cross-Origin-Resource-Policy']).toBe('same-origin');
    expect(h['Permissions-Policy']).toContain('camera=()');
    expect(h['Content-Security-Policy']).toBeTruthy();
  });

  it('sends HSTS in production only', () => {
    expect(securityHeaders(false)['Strict-Transport-Security']).toContain('max-age=63072000');
    expect(securityHeaders(true)['Strict-Transport-Security']).toBeUndefined();
  });
});
