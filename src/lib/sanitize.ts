import sanitizeHtml from 'sanitize-html';

// CMS-editable headings (hero/CTA/page titles) are rendered via `set:html` so the
// neon styling spans can be embedded (e.g. <span class="neon">). Because the text
// comes from admin-editable Supabase columns, run it through a strict allowlist
// first: keep only safe inline formatting + the `class` attribute, discard scripts,
// event handlers, and everything else. Defense-in-depth alongside the CSP — admin
// content must not be able to persist active markup onto the public site.
const INLINE_OPTS: sanitizeHtml.IOptions = {
  allowedTags: ['span', 'br', 'strong', 'em', 'b', 'i', 'sup', 'sub'],
  allowedAttributes: { '*': ['class'] },
  disallowedTagsMode: 'discard',
};

export function sanitizeInline(html: string | null | undefined): string {
  return html ? sanitizeHtml(String(html), INLINE_OPTS) : '';
}
