import { describe, it, expect } from 'vitest';
import { normalizeGuardPath } from '../src/lib/pathGuard';

describe('normalizeGuardPath', () => {
  it('passes normal admin/public paths through unchanged', () => {
    expect(normalizeGuardPath('/admin')).toBe('/admin');
    expect(normalizeGuardPath('/admin/settings')).toBe('/admin/settings');
    expect(normalizeGuardPath('/news')).toBe('/news');
    expect(normalizeGuardPath('/api/admins/invite')).toBe('/api/admins/invite');
  });

  it('decodes single percent-encoding — closes the confirmed bypass', () => {
    expect(normalizeGuardPath('/%61dmin')).toBe('/admin'); // %61 = "a"
    expect(normalizeGuardPath('/%61dmin/settings')).toBe('/admin/settings');
  });

  it('decodes encoded slashes and multi-level encoding', () => {
    expect(normalizeGuardPath('/admin%2fsettings')).toBe('/admin/settings');
    expect(normalizeGuardPath('/%2561dmin/settings')).toBe('/admin/settings'); // double-encoded
  });

  it('collapses slash tricks and folds case (fails safe = guarded)', () => {
    expect(normalizeGuardPath('//admin//settings')).toBe('/admin/settings');
    expect(normalizeGuardPath('/ADMIN/Settings')).toBe('/admin/settings');
    expect(normalizeGuardPath('/admin\\settings')).toBe('/admin/settings');
  });

  it('never throws on malformed encoding', () => {
    expect(() => normalizeGuardPath('/%zz')).not.toThrow();
    expect(normalizeGuardPath('/%zz')).toBe('/%zz');
  });

  it('the encoded admin form now matches the guard prefix', () => {
    for (const raw of ['/%61dmin', '/%61dmin/settings', '/%2561dmin/settings', '/admin%2fsettings']) {
      const p = normalizeGuardPath(raw);
      expect(p === '/admin' || p.startsWith('/admin/')).toBe(true);
    }
  });
});
