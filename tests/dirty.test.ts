import { describe, it, expect } from 'vitest';
import { valEq, fieldsDiffer } from '../src/lib/dirty';

describe('valEq', () => {
  it('treats null, undefined and empty string as equal', () => {
    expect(valEq(null, '')).toBe(true);
    expect(valEq(undefined, '')).toBe(true);
    expect(valEq(null, undefined)).toBe(true);
  });
  it('compares a number against its string form as equal', () => {
    expect(valEq(3, '3')).toBe(true);
    expect(valEq(0, '0')).toBe(true);
  });
  it('compares booleans', () => {
    expect(valEq(false, false)).toBe(true);
    expect(valEq(true, false)).toBe(false);
  });
  it('detects real differences', () => {
    expect(valEq('a', 'b')).toBe(false);
    expect(valEq('', 'x')).toBe(false);
  });
});

describe('fieldsDiffer', () => {
  const a = { title: 'Hello', n: 1, published: true, extra: 'x' };

  it('is false when listed fields match (number vs string form tolerated)', () => {
    const b = { title: 'Hello', n: '1', published: true, extra: 'DIFFERENT' };
    expect(fieldsDiffer(['title', 'n', 'published'], a, b)).toBe(false);
  });
  it('is true when a listed field changed', () => {
    const b = { title: 'Changed', n: 1, published: true };
    expect(fieldsDiffer(['title', 'n', 'published'], a, b)).toBe(true);
  });
  it('ignores keys that are not in the list', () => {
    const b = { title: 'Hello', n: 1, published: true, extra: 'DIFFERENT' };
    expect(fieldsDiffer(['title'], a, b)).toBe(false);
  });
  it('handles a missing snapshot (treats it as all-empty)', () => {
    expect(fieldsDiffer(['title'], { title: 'x' }, undefined)).toBe(true);
    expect(fieldsDiffer(['title'], { title: '' }, undefined)).toBe(false);
  });
});
