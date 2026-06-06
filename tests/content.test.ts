import { describe, it, expect } from 'vitest';
import { getStats } from '../src/lib/content';

// Minimal mock of the supabase query chain: from().select().order() -> { data, error }
const mock = (result: { data: any; error: any }) =>
  ({ from: () => ({ select: () => ({ order: async () => result }) }) }) as any;

describe('content data layer', () => {
  it('returns [] when Supabase errors (fail soft)', async () => {
    const sb = mock({ data: null, error: new Error('boom') });
    expect(await getStats(sb)).toEqual([]);
  });

  it('returns rows on success', async () => {
    const rows = [{ id: 1, value: '+17%', label: 'עליית מחירי דירות בשנה', sort: 1 }];
    const sb = mock({ data: rows, error: null });
    expect(await getStats(sb)).toEqual(rows);
  });
});
