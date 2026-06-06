export interface Settings {
  phone: string;
  whatsapp: string;
  location: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_sub: string;
  manifesto_main: string;
  manifesto_sub: string;
  cta_title: string;
  cta_sub: string;
  gilad_image?: string | null;
}
export interface Stat { id: number; value: string; label: string; sort: number; }
export interface Step { id: number; n: string; title: string; text: string; sort: number; }
export interface Mistake { id: number; n: string; title: string; text: string; sort: number; }
export interface Area { id: number; name: string; he: string; blurb: string; sort: number; }
export interface Press { id: number; outlet: string; title: string; url: string; sort: number; }
export interface NewsItem {
  id: number;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  body: string;
  cover_url: string | null;
  published: boolean;
}
