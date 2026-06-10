// Normalize a request pathname BEFORE it is used for a security guard decision
// (e.g. `startsWith('/admin/')` in src/middleware.ts).
//
// Why: on some Astro versions the middleware receives the raw, un-decoded
// pathname while the router decodes it for route resolution. That gap lets an
// attacker dodge a prefix check — `/%61dmin/settings` ( %61 = "a" ) does NOT
// start with "/admin/", so the guard is skipped, yet the router still resolves
// it to the admin page. Decoding (repeatedly, to defeat double-encoding) and
// collapsing slash tricks closes the gap. Used ONLY for the boolean guard
// decision — never for routing — so over-normalizing only ever fails safe
// (an odd URL gets redirected to login rather than served).

export function normalizeGuardPath(pathname: string): string {
  let p = pathname;
  // Percent-decode until stable — defeats single, double and triple encoding.
  for (let i = 0; i < 5; i++) {
    let decoded: string;
    try {
      decoded = decodeURIComponent(p);
    } catch {
      break; // malformed sequence — keep the last good value
    }
    if (decoded === p) break;
    p = decoded;
  }
  // Backslashes → forward slashes; collapse duplicate slashes; case-fold.
  // Route paths are lowercase, so folding only widens the guard (fail-safe).
  return p.replace(/\\/g, '/').replace(/\/{2,}/g, '/').toLowerCase();
}
