import { NextResponse, type NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const preferred = request.cookies.get('fed3-locale')?.value;
  const acceptLang = request.headers.get('accept-language') || '';
  const languages = acceptLang
    .split(',')
    .map((entry, index) => {
      const [language, quality] = entry.trim().split(';q=');
      return { language: language.toLowerCase(), quality: quality ? Number(quality) : 1, index };
    })
    .filter(entry => entry.quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index);

  const topLang = languages[0]?.language || '';
  const detected = topLang.startsWith('ar') ? 'ar' : 'en';
  const locale = preferred === 'ar' || preferred === 'en' ? preferred : detected;
  return NextResponse.redirect(new URL(`/${locale}/`, request.url));
}

export const config = { matcher: '/' };
