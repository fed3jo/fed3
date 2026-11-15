import Link from 'next/link';
import { fed3, type Locale } from '@/lib/fed3/config';
import { messages } from '@/lib/fed3/messages';
import styles from './site-links.module.css';

export function SiteLinks({ locale }: { locale: Locale }) {
  const m = messages[locale];
  return <nav className={styles.links} aria-label={locale === 'ar' ? 'عن الموقع والتواصل' : 'About the site and contact'}>
    <Link href={fed3.routes[locale].about}>{m.nav.about}</Link>
    <Link href={fed3.routes[locale].privacy}>{m.privacy}</Link>
    <Link href={fed3.routes[locale].contact}>{m.contact}</Link>
  </nav>;
}
