import Link from 'next/link';
import { fed3, type Locale } from '@/lib/fed3/config';
import { messages } from '@/lib/fed3/messages';
import { InlineText } from '@/components/landing/StationContent';
import { DirectionalArrow } from '@/components/alternatives/DirectionalArrow';
import styles from '@/components/alternatives/alternatives.module.css';

type JourneyStation = 'alternatives' | 'home-cloud' | 'communities';

export function JourneyNavigation({ locale, current, currentHref }: { locale: Locale; current: JourneyStation; currentHref: string }) {
  const ar = locale === 'ar';
  const labels = messages[locale].nav;
  const title = ar ? 'كمّل رحلتك مع Fed3.' : 'Continue your Fed3 journey.';
  const stationsLabel = ar ? 'محطات المبادرة' : 'Initiative stations';
  const lead = current === 'home-cloud'
    ? ar ? 'استكشف البدائل الرقمية والمجتمعات، أو ارجع إلى بداية الرحلة.' : 'Explore digital alternatives and communities, or return to the start of the journey.'
    : ar ? 'استكشف السحابة المحلية والمجتمعات، أو ارجع إلى بداية الرحلة.' : 'Explore local storage and communities, or return to the start of the journey.';
  return <section id="journey" className={styles.journey} aria-labelledby="journey-heading">
    <div className={styles.journeyIntro}><div><p className={styles.eyebrow}><bdi>Fed3</bdi> / {stationsLabel}</p><h2 id="journey-heading"><InlineText text={title} /></h2><p>{lead}</p></div><Link className={styles.homeButton} href={fed3.routes[locale].home}>{ar ? 'العودة إلى الرئيسية' : 'Back to home'}<DirectionalArrow /></Link></div>
    <nav className={styles.stationCards} aria-label={stationsLabel}>{(['alternatives', 'home-cloud', 'communities'] as const).map((station, index) => {
      const Card = station === current ? 'a' : Link;
      return <Card key={station} href={station === current ? currentHref : fed3.routes[locale][station]} data-station={station} aria-current={station === current ? 'location' : undefined}>
      <span className={styles.stationNumber}>0{index + 1}</span><h3><InlineText text={labels[station]} /></h3><span className={styles.stationAction}>{station === current ? ar ? 'أنت هنا' : 'You are here' : ar ? 'استكشف المحطة' : 'Explore station'}<DirectionalArrow /></span>
      </Card>;
    })}</nav>
  </section>;
}
