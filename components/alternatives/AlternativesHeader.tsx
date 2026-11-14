'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fed3, type Locale } from '@/lib/fed3/config';
import { messages } from '@/lib/fed3/messages';
import landing from '@/components/landing/landing.module.css';
import styles from './alternatives.module.css';
import menuStyles from './station-menu.module.css';
import { DirectionalArrow } from './DirectionalArrow';
import { InlineText } from '@/components/landing/StationContent';

export type SectionNavItem = { id: string; label: string; soon?: boolean };
type StationId = 'alternatives' | 'home-cloud' | 'communities';
const stations: StationId[] = ['alternatives', 'home-cloud', 'communities'];
export function AlternativesHeader({ locale, languageHref, inDirectory = false, navItems, navigationId = 'alternatives-navigation', currentStation = 'alternatives', homeStyle = false }: { locale: Locale; languageHref: string; inDirectory?: boolean; navItems?: SectionNavItem[]; navigationId?: string; currentStation?: StationId; homeStyle?: boolean }) {
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('');
  const other = locale === 'ar' ? 'en' : 'ar';
  const m = messages[locale];
  const labels = locale === 'ar' ? ['دليل البدائل', 'المقارنة', 'اللعبة'] : ['Alternatives', 'Compare', 'The game'];
  const sections: SectionNavItem[] = navItems || ['catalog', 'comparison', 'game'].map((id, index) => ({ id, label: labels[index] }));
  const sectionIds = sections.map(item => item.id).join(',');
  const toggleId = `${navigationId}-toggle`;
  const ar = locale === 'ar';
  const stationDescriptions = ar
    ? ['التطبيقات والمقارنة واللعبة', 'تخزين الملفات ومشاركتها محليًا', 'تعلّم وشارك المعرفة']
    : ['Apps, comparisons and the game', 'Store and share files locally', 'Learn and share knowledge'];

  useEffect(() => {
    if (!inDirectory) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        let current = '';
        for (const id of sectionIds.split(',')) if ((document.getElementById(id)?.getBoundingClientRect().top ?? Infinity) <= 170) current = id;
        setActive(current);
        setScrolled(window.scrollY > 60);
      });
    };
    update(); window.addEventListener('scroll', update, { passive: true }); window.addEventListener('resize', update);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [inDirectory, sectionIds]);

  useEffect(() => {
    if (!menu) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') { setMenu(false); document.getElementById(toggleId)?.focus(); } };
    const outside = (event: PointerEvent) => { if (!(event.target as Element).closest('header')) setMenu(false); };
    document.addEventListener('keydown', close); document.addEventListener('pointerdown', outside);
    return () => { document.removeEventListener('keydown', close); document.removeEventListener('pointerdown', outside); };
  }, [menu, toggleId]);

  const switchLanguage = () => {
    setMenu(false);
    try { localStorage.setItem('fed3-locale', other); } catch { /* The route still controls language. */ }
    document.cookie = `fed3-locale=${other}; Path=/; Max-Age=31536000; SameSite=Lax`;
  };

  return <header className={`${landing.header} ${landing.headerVisible} ${styles.floatingHeader} ${homeStyle ? landing.homeHeader : ''}`} data-floating={homeStyle ? scrolled : undefined}>
    <Link href={fed3.routes[locale].home} className={landing.brand} aria-label={`Fed3 / ${m.home}`}><Image src="/fed3-logo.svg" alt="" width={52} height={34} priority /><span className={landing.wordmark} dir="ltr">Fed3<span className={landing.brandDot}>.</span></span></Link>
    <button id={toggleId} className={`${landing.menuToggle} ${menuStyles.toggle}`} aria-expanded={menu} aria-controls={navigationId} aria-label={m.menu} onClick={() => setMenu(!menu)}><span /><span /></button>
    <nav id={navigationId} className={`${landing.navigation} ${menuStyles.panel} ${menu ? landing.menuOpen : ''}`} aria-label={m.menu}>
      <div className={menuStyles.stations}>
        <p id={`${navigationId}-stations`} className={menuStyles.heading}>{ar ? 'محطات المبادرة' : 'Initiative stations'}<span dir="ltr">0{stations.indexOf(currentStation) + 1} / 03</span></p>
        <div className={menuStyles.stationList} role="group" aria-labelledby={`${navigationId}-stations`}>
          {stations.map((station, index) => <Link key={station} href={fed3.routes[locale][station]} className={menuStyles.station} aria-current={currentStation === station ? 'page' : undefined} onClick={() => setMenu(false)}>
            <span className={menuStyles.number} aria-hidden="true">0{index + 1}</span>
            <span className={menuStyles.stationCopy}><span><InlineText text={m.nav[station]} /></span><small>{stationDescriptions[index]}</small></span>
            {currentStation === station ? <span className={menuStyles.here}>{ar ? 'أنت هنا' : 'You are here'}</span> : <DirectionalArrow />}
          </Link>)}
        </div>
      </div>
      <div className={menuStyles.sections}>
        <p className={`${menuStyles.heading} ${menuStyles.sectionHeading}`}>{ar ? 'في هذه الصفحة' : 'On this page'}</p>
        {sections.map(section => <a key={section.id} href={`${inDirectory ? '' : fed3.routes[locale].alternatives}#${section.id}`} className={landing.navItem} aria-current={active === section.id ? 'location' : undefined} onClick={() => setMenu(false)}><span className={landing.navLabel}>{section.label}</span>{section.soon && <span className={styles.headerSoon}>{ar ? 'قريبًا' : 'Soon'}</span>}</a>)}
      </div>
    </nav>
    <Link className={landing.language} href={languageHref} scroll={false} onClick={switchLanguage} aria-label={m.languageLabel} lang={other} dir={other === 'ar' ? 'rtl' : 'ltr'}><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.3" /><path d="M3.7 12h16.6M12 3.7c4 4.3 4 12.3 0 16.6-4-4.3-4-12.3 0-16.6Z" /></svg>{m.language}</Link>
  </header>;
}
