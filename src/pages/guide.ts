import type { APIRoute } from 'astro';

// Short, shareable URL for the Huber Capital Dubai guide.
// `/guide` → the static PDF (served by Vercel from public/). Language-agnostic
// (one file for he + ru). Kept as an endpoint so the pretty URL works the same
// in dev and prod; the browser opens the PDF inline with a download option.
export const GUIDE_PDF = '/assets/Huber-Capital-Dubai-Guide.pdf';

export const GET: APIRoute = () =>
  new Response(null, { status: 302, headers: { Location: GUIDE_PDF } });
