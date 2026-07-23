import { describe, it, expect } from 'vitest';
import { GET, GUIDE_PDF } from '../src/pages/guide-emirates';

describe('/guide-emirates', () => {
  it('redirects (302) to the guide PDF', () => {
    const res = (GET as any)({} as any) as Response;
    expect(res.status).toBe(302);
    expect(res.headers.get('Location')).toBe(GUIDE_PDF);
  });

  it('points at a static, same-origin PDF path', () => {
    expect(GUIDE_PDF).toMatch(/^\/assets\/.+\.pdf$/);
  });
});
