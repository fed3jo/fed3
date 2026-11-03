export type Locale = 'ar' | 'en';
export type Station = 'intro' | 'alternatives' | 'home-cloud' | 'communities' | 'closing';
const base = (process.env.NEXT_PUBLIC_FED3_FRAME_BASE_URL || '/Fed3_Frame_240/').replace(/\/?$/, '/');
if (!base.startsWith('/') && !base.startsWith('https://')) throw new Error('Fed3 frame base must be root-relative or HTTPS.');

export const fed3 = {
  FRAME_BASE_URL: base,
  MANIFEST_URL: `${base}sequence.json`,
  FRAME_COUNT: 240,
  PAD_LENGTH: 5,
  defaultLocale: 'ar' as Locale,
  assetVersion: process.env.NEXT_PUBLIC_FED3_ASSET_VERSION || '1.1.0',
  source: { width: 1600, height: 900 },
  desktop: { downloads: 6, frames: 16, bytes: 80 * 1024 * 1024, width: 1600, dpr: 1.5 },
  mobile: { downloads: 4, frames: 10, bytes: 24 * 1024 * 1024, width: 960, dpr: 1.5 },
  decodeConcurrency: 2,
  scrollViewports: { desktop: 6, mobile: 7 },
  routes: {
    ar: { home: '/ar/', alternatives: '/ar/alternatives/', 'home-cloud': '/ar/home-cloud/', communities: '/ar/communities/', about: '/ar/about/', privacy: '/ar/privacy/', contact: '/ar/contact/' },
    en: { home: '/en/', alternatives: '/en/alternatives/', 'home-cloud': '/en/home-cloud/', communities: '/en/communities/', about: '/en/about/', privacy: '/en/privacy/', contact: '/en/contact/' },
  },
} as const;
export const anchors = [1, 60, 120, 180, 240] as const;
export const stations: Station[] = ['intro', 'alternatives', 'home-cloud', 'communities', 'closing'];
export const holds: Record<Station, number> = { intro: 0, alternatives: .27, 'home-cloud': .53, communities: .79, closing: .98 };
export function frameUrl(frame: number) {
  return `${fed3.FRAME_BASE_URL}frame_${String(Math.max(1, Math.min(240, Math.round(frame)))).padStart(fed3.PAD_LENGTH, '0')}.png`;
}
export const cdnOrigin = base.startsWith('https://') ? new URL(base).origin : null;
export function isLocale(value: string): value is Locale { return value === 'ar' || value === 'en'; }
