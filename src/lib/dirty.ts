// Pure helpers for detecting unsaved edits in the admin editors. Kept free of any
// Preact/DOM imports so they can be unit-tested in plain Node (see tests/dirty.test.ts).

/**
 * Compare two field values the way a user perceives them:
 * - null / undefined / '' all count as "empty" (clearing a field back to blank
 *   should not read as a change when the stored value was null), and
 * - numbers / booleans are compared by their string form, so a value typed into a
 *   text input ("3") matches the same value loaded from the DB as a number (3).
 */
export function valEq(a: unknown, b: unknown): boolean {
  return String(a ?? '') === String(b ?? '');
}

/**
 * True if any of `keys` differs between the working copy `a` and the saved
 * snapshot `b` (using {@link valEq}). Keys not listed are ignored, so server-only
 * columns (timestamps, ids) never trigger a false "unsaved" state.
 */
export function fieldsDiffer(
  keys: string[],
  a: Record<string, unknown> | null | undefined,
  b: Record<string, unknown> | null | undefined
): boolean {
  return keys.some((k) => !valEq(a?.[k], b?.[k]));
}
