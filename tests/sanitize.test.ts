import { describe, it, expect } from 'vitest';
import { sanitizeInline } from '../src/lib/sanitize';

describe('sanitizeInline', () => {
  it('preserves the neon styling spans used by hero/CTA headings', () => {
    const out = sanitizeInline('עד <span class="neon font-bold whitespace-nowrap">10%</span> בשנה');
    expect(out).toContain('<span class="neon font-bold whitespace-nowrap">10%</span>');
  });

  it('keeps basic inline formatting + <br>', () => {
    const out = sanitizeInline('a<br>b <strong>c</strong> <em>d</em>');
    expect(out).toContain('<br');
    expect(out).toContain('<strong>c</strong>');
    expect(out).toContain('<em>d</em>');
  });

  it('strips <script> tags', () => {
    expect(sanitizeInline('hi<script>alert(1)</script>')).not.toContain('<script');
  });

  it('strips dangerous tags and inline event handlers', () => {
    expect(sanitizeInline('<img src=x onerror="alert(1)">')).not.toMatch(/<img|onerror/i);
    expect(sanitizeInline('<a href="javascript:alert(1)">x</a>')).not.toMatch(/href|javascript/i);
    expect(sanitizeInline('<iframe src="//evil"></iframe>')).not.toContain('<iframe');
    expect(sanitizeInline('<svg onload="alert(1)"></svg>')).not.toMatch(/<svg|onload/i);
  });

  it('returns an empty string for nullish input', () => {
    expect(sanitizeInline(null)).toBe('');
    expect(sanitizeInline(undefined)).toBe('');
    expect(sanitizeInline('')).toBe('');
  });
});
