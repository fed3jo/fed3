import { notFound } from 'next/navigation';
import { cdnOrigin, isLocale } from '@/lib/fed3/config';
import '../globals.css';

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}><head>{cdnOrigin && <link rel="preconnect" href={cdnOrigin} crossOrigin="anonymous" />}</head><body>{children}</body></html>;
}
