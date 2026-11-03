import Link from 'next/link';
import { fed3, type Locale, type Station } from '@/lib/fed3/config';
import type { Messages } from '@/lib/fed3/messages';
import styles from './landing.module.css';

export function InlineText({ text }: { text: string }) {
  return text.split(/(\(Home-Cloud\)|Home-Cloud|Fed3)/g).map((part, i) => /^(\(Home-Cloud\)|Home-Cloud|Fed3)$/.test(part) ? <bdi key={i} dir="ltr">{part}</bdi> : part);
}
export function Arrow({ down = false }: { down?: boolean }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={down ? styles.down : styles.arrow}><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
export function StationContent({ station, locale, messages, onExplore, onLeave, idPrefix = '' }: {
  station: Station; locale: Locale; messages: Messages; onExplore?: () => void; onLeave?: () => void; idPrefix?: string;
}) {
  const content = messages.stations[station];
  const Heading = station === 'intro' ? 'h1' : 'h2';
  const route = station !== 'intro' && station !== 'closing' ? fed3.routes[locale][station] : null;
  return <div className={`${styles.copy} ${station === 'intro' ? styles.introCopy : ''}`}>
    <p className={styles.eyebrow}><span className={styles.eyebrowMark} aria-hidden="true" /><InlineText text={content.eyebrow} /></p>
    <Heading id={`${idPrefix}${station}-heading`} tabIndex={-1}>{content.heading}</Heading>
    <p className={styles.description}><InlineText text={content.description} /></p>
    {content.note && <p className={styles.ownership}>{content.note}</p>}
    {content.tags && <ul className={styles.tags}>{content.tags.map(tag => <li key={tag}>{tag}</li>)}</ul>}
    {station === 'intro' && <a className={styles.primary} href="#alternatives" onClick={onExplore ? event => { event.preventDefault(); onExplore(); } : undefined}>{content.action}<Arrow /></a>}
    {route && <Link className={styles.primary} href={route} onClick={onLeave}><InlineText text={content.action!} /><Arrow /></Link>}
    {station === 'closing' && <Link className={styles.primary} href={fed3.routes[locale].alternatives} onClick={onLeave}>{messages.stations.alternatives.action}<Arrow /></Link>}
  </div>;
}
