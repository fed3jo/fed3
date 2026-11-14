import Link from 'next/link';
import { AlternativesHeader } from '@/components/alternatives/AlternativesHeader';
import { DirectionalArrow } from '@/components/alternatives/DirectionalArrow';
import shared from '@/components/alternatives/alternatives.module.css';
import { StationVideo } from '@/components/landing/StationVideo';
import { FeatureIcon } from '@/components/shared/FeatureIcon';
import { JourneyNavigation } from '@/components/shared/JourneyNavigation';
import { communitiesCopy } from '@/lib/fed3/communities';
import { fed3, type Locale } from '@/lib/fed3/config';
import { stationVideos } from '@/lib/fed3/videos';
import styles from './communities.module.css';

const sections = ['community-tracks', 'community-journey', 'community-participation', 'community-faq'];
const trackIcons = ['platforms', 'control', 'people'];
const stepIcons = ['features', 'platforms', 'people', 'network'];

export function CommunitiesPage({ locale }: { locale: Locale }) {
  const c = communitiesCopy[locale];
  const routes = fed3.routes[locale];
  const other = locale === 'ar' ? 'en' : 'ar';
  const trackLinks = [routes.alternatives, routes['home-cloud'], '#community-journey'];

  return <div className={`${shared.page} ${styles.page}`}>
    <a className={shared.skip} href="#communities-main">{c.skip}</a>
    <AlternativesHeader
      locale={locale}
      languageHref={fed3.routes[other].communities}
      inDirectory
      navItems={sections.map((id, i) => ({ id, label: c.nav[i] }))}
      navigationId="communities-navigation"
      currentStation="communities"
    />
    <main id="communities-main" tabIndex={-1}>
      <section className={styles.hero} aria-labelledby="communities-heading">
        <div className={styles.heroCopy}>
          <p className={styles.kicker}><bdi>03</bdi>{c.name}</p>
          <h1 id="communities-heading">{c.title[0]}<br /><span>{c.title[1]}</span></h1>
          <p className={styles.lead}>{c.lead}</p>
          <div className={styles.actions}>
            <a className={styles.primary} href="#community-individuals">{c.individual}<DirectionalArrow /></a>
            <a className={styles.secondary} href="#community-organizations">{c.organization}<DirectionalArrow /></a>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <StationVideo source={stationVideos.communities} locale={locale} title={c.videoDescription} />
        </div>
      </section>

      <section className={styles.intro} aria-labelledby="community-intro-heading">
        <span className={styles.introIcon}><FeatureIcon name="people" size={32} /></span>
        <h2 id="community-intro-heading">{c.introTitle}</h2>
        <p>{c.intro}</p>
      </section>

      <section id="community-tracks" className={styles.tracks} aria-labelledby="community-tracks-heading">
        <p className={styles.sectionLabel}><bdi>01</bdi>{c.nav[0]}</p>
        <h2 id="community-tracks-heading">{c.tracksTitle}</h2>
        <div className={styles.trackGrid}>
          {c.tracks.map((track, i) => <article className={styles.track} key={track.title}>
            <div className={styles.trackVisual}>
              <span><FeatureIcon name={trackIcons[i]} size={39} /></span>
              <bdi>0{i + 1}</bdi>
            </div>
            <div className={styles.trackCopy}>
              <h3>{track.title}</h3>
              <p>{track.description}</p>
              <p className={styles.practice}><FeatureIcon name="check" size={17} />{track.practice}</p>
              <Link className={styles.trackLink} href={trackLinks[i]}>{track.action}<DirectionalArrow /></Link>
            </div>
          </article>)}
        </div>
      </section>

      <section id="community-journey" className={styles.journey} aria-labelledby="community-journey-heading">
        <p className={styles.sectionLabel}><bdi>02</bdi>{c.nav[1]}</p>
        <h2 id="community-journey-heading">{c.journeyTitle}</h2>
        <ol className={styles.steps}>
          {c.journey.map(([title, body], i) => <li key={title}>
            <div className={styles.stepMarker}><span><FeatureIcon name={stepIcons[i]} size={26} /></span><bdi>0{i + 1}</bdi></div>
            <h3>{title}</h3>
            <p>{body}</p>
          </li>)}
        </ol>
      </section>

      <section id="community-participation" className={styles.participation} aria-labelledby="community-participation-heading">
        <p className={styles.sectionLabel}><bdi>03</bdi>{c.nav[2]}</p>
        <h2 id="community-participation-heading">{c.participationTitle}</h2>
        <aside className={styles.registration}><span><i aria-hidden="true" />{c.registration}</span><p>{c.registrationDetail}</p></aside>
        <div className={styles.participationGrid}>
          <article id="community-individuals" className={styles.participationCard}>
            <span><FeatureIcon name="people" size={26} />{c.individualLabel}</span>
            <h3>{c.individualTitle}</h3>
            <p>{c.individualDetail}</p>
            <a className={styles.primary} href="#community-tracks">{c.individualAction}<DirectionalArrow /></a>
          </article>
          <article id="community-organizations" className={styles.participationCard}>
            <span><FeatureIcon name="network" size={26} />{c.organizationLabel}</span>
            <h3>{c.organizationTitle}</h3>
            <p>{c.organizationDetail}</p>
            <Link className={styles.secondary} href={`${routes['home-cloud']}#cloud-readiness`}>{c.organizationAction}<DirectionalArrow /></Link>
          </article>
        </div>
      </section>

      <section id="community-faq" className={styles.faq} aria-labelledby="community-faq-heading">
        <div>
          <p className={styles.sectionLabel}><bdi>04</bdi>{c.nav[3]}</p>
          <h2 id="community-faq-heading">{c.faqTitle}</h2>
        </div>
        <div className={styles.questions}>
          {c.faqs.map(([question, answer]) => <details key={question}>
            <summary>{question}<span aria-hidden="true" /></summary>
            <p>{answer}</p>
          </details>)}
        </div>
      </section>
      <JourneyNavigation locale={locale} current="communities" currentHref="#communities-main" />
    </main>
  </div>;
}
