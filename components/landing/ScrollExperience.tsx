'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fed3, type Locale, type Station } from '@/lib/fed3/config';
import type { Messages } from '@/lib/fed3/messages';
import { InitiativeIntro } from './InitiativeIntro';
import { InlineText, StationContent } from './StationContent';
import { StationVideo } from './StationVideo';
import { stationVideos } from '@/lib/fed3/videos';
import { SmoothScrolling } from '@/components/alternatives/SmoothScrolling';
import styles from './landing.module.css';
import videoStyles from './video-stations.module.css';

export function ScrollExperience({ locale, messages }: { locale: Locale; messages: Messages }) {
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 60);
    update(); window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  const navigate = (station: Station) => {
    setMenu(false);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (window.fed3Lenis && !reduce) window.fed3Lenis.scrollTo(`#${station}`, { duration: 1.05 });
    else document.getElementById(station)?.scrollIntoView({ behavior: reduce ? 'instant' : 'smooth' });
  };
  const other = locale === 'ar' ? 'en' : 'ar';
  const switchLocale = () => {
    try { localStorage.setItem('fed3-locale', other); } catch { /* Cookie still works when localStorage is blocked. */ }
    document.cookie = `fed3-locale=${other}; Path=/; Max-Age=31536000; SameSite=Lax`;
  };
  const backTop = () => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (window.fed3Lenis && !reduce) window.fed3Lenis.scrollTo(0, { duration: 1.05 });
    else window.scrollTo({ top: 0, behavior: reduce ? 'instant' : 'smooth' });
  };
  const navStations = ['alternatives', 'home-cloud', 'communities'] as const;
  return <div className={styles.experience} data-mode="video" data-entered="true">
    <SmoothScrolling enabled defer />
    <a href="#main" className={styles.skip}>{messages.skip}</a>
    <header className={`${styles.header} ${styles.homeHeader} ${styles.headerVisible}`} data-floating={scrolled}>
      <Link className={styles.brand} href={fed3.routes[locale].home} aria-label={messages.brand} onClick={event => { event.preventDefault(); backTop(); }}>
        <Image src="/fed3-logo.svg" width={52} height={34} alt="" priority />
        <span className={styles.wordmark} dir="ltr">Fed3<span className={styles.brandDot}>.</span></span>
        <span className={styles.brandCaption}>{messages.initiative}</span>
      </Link>
      <button className={styles.menuToggle} aria-expanded={menu} aria-controls="main-navigation" onClick={() => setMenu(!menu)} aria-label={messages.menu}><span /><span /></button>
      <nav id="main-navigation" className={`${styles.navigation} ${menu ? styles.menuOpen : ''}`} aria-label={messages.menu}>
        {navStations.map((s, i) => <a key={s} href={`#${s}`} className={styles.navItem} onClick={e => { e.preventDefault(); navigate(s); }}>
          <span className={styles.navBadge} aria-hidden="true">0{i + 1}</span>
          <span className={styles.navLabel}><InlineText text={messages.nav[s]} /></span>
        </a>)}
      </nav>
      <div className={styles.headerActions}>
      <Link href={fed3.routes[other].home} scroll={false} className={styles.language} lang={other} dir={other === 'ar' ? 'rtl' : 'ltr'} aria-label={messages.languageLabel} onClick={switchLocale}>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.3" /><path d="M3.7 12h16.6M12 3.7c4 4.3 4 12.3 0 16.6-4-4.3-4-12.3 0-16.6Z" /></svg>{messages.language}
      </Link>
      </div>
    </header>
    <main id="main">
      <InitiativeIntro locale={locale} messages={messages} ready={true} explore={station => navigate(station ?? 'alternatives')} />
      <section className={videoStyles.stations} aria-label={messages.journey}>
        {navStations.map(station => <section key={station} id={station} className={videoStyles.station} aria-labelledby={`${station}-heading`}>
          <StationVideo source={stationVideos[station]} locale={locale} title={messages.nav[station]} />
          <StationContent station={station} locale={locale} messages={messages} />
        </section>)}
        <section id="closing" className={videoStyles.closing} aria-labelledby="closing-heading">
          <StationContent station="closing" locale={locale} messages={messages} />
        </section>
      </section>
    </main>
    <footer className={styles.footer}>
      <div className={styles.footerInvitation}><span>{locale === 'ar' ? 'ابدأ من هون' : 'MAKE IT YOURS'}</span><h2>{locale === 'ar' ? 'خلّي القرار بإيدك.' : 'Keep the choice yours.'}</h2><Link href={fed3.routes[locale].alternatives}>{messages.stations.alternatives.action}<span aria-hidden="true">↗</span></Link></div>
      <div className={styles.footerMain}><div><Link href={fed3.routes[locale].home} className={styles.footerBrand}><Image src="/fed3-logo.svg" width={53} height={34} alt="" /><bdi dir="ltr">Fed3</bdi></Link><p>{messages.initiative}</p></div><p className={styles.footerStatement}>{messages.footer}</p></div>
      <div className={styles.socialLinks}><span>{locale === 'ar' ? 'منصاتنا' : 'FIND OUR COMMUNITY'}</span>{['Instagram', 'Signal', 'Proton Mail'].map(name => <Link key={name} href={fed3.routes[locale].contact}><span dir="ltr">{name}</span><small>{locale === 'ar' ? 'قريبًا' : 'Coming soon'}</small><span aria-hidden="true">↗</span></Link>)}</div>
      <div className={styles.footerBottom}><small><bdi>© {new Date().getFullYear()} Fed3.</bdi> {locale === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</small><nav aria-label={messages.menu}><Link href={fed3.routes[locale].about}>{messages.nav.about}</Link><Link href={fed3.routes[locale].privacy}>{messages.privacy}</Link><Link href={fed3.routes[locale].contact}>{messages.contact}</Link></nav><button onClick={backTop}>{messages.top}<span aria-hidden="true">↑</span></button></div>
    </footer>

  </div>;
}
