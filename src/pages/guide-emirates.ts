import type { APIRoute } from 'astro';

// Short, shareable URL for the Huber Capital Seven Emirates guide (2026).
// `/guide-emirates` → the static PDF (served by Vercel from public/).
// Language-agnostic (one file for he + ru). Kept as an endpoint so the pretty
// URL works the same in dev and prod; the browser opens the PDF inline with a
// download option. Mirrors `/guide` (the Dubai guide).
export const GUIDE_PDF = '/assets/Huber-Capital-Seven-Emirates-Guide-2026.pdf';

export const GET: APIRoute = () =>
  new Response(null, { status: 302, headers: { Location: GUIDE_PDF } });
