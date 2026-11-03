'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fed3, type Locale } from '@/lib/fed3/config';
import { messages } from '@/lib/fed3/messages';
import landing from '@/components/landing/landing.module.css';
import styles from './alternatives.module.css';

export type SectionNavItem = { id: string; label: string; soon?: boolean };
export function AlternativesHeader({ locale, languageHref, inDirectory = false, navItems, navigationId = 'alternatives-navigation' }: { locale: Locale; languageHref: string; inDirectory?: boolean; navItems?: SectionNavItem[]; navigationId?: string }) {
  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState('');
  const other = locale === 'ar' ? 'en' : 'ar';
  const m = messages[locale];
  const labels = locale === 'ar' ? ['دليل البدائل', 'المقارنة', 'اللعبة'] : ['Alternatives', 'Compare', 'The game'];
  const sections: SectionNavItem[] = navItems || ['catalog', 'comparison', 'game'].map((id, index) => ({ id, label: labels[index] }));
  const sectionIds = sections.map(item => item.id).join(',');
  const toggleId = `${navigationId}-toggle`;

  useEffect(() => {
    if (!inDirectory) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        let current = '';
        for (const id of sectionIds.split(',')) if ((document.getElementById(id)?.getBoundingClientRect().top ?? Infinity) <= 170) current = id;
        setActive(current);
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

  return <header className={`${landing.header} ${landing.headerVisible} ${styles.floatingHeader}`}>
    <Link href={fed3.routes[locale].home} className={landing.brand} aria-label={`Fed3 / ${m.home}`}><Image src="/fed3-logo.svg" alt="" width={52} height={34} priority /><span className={landing.wordmark} dir="ltr">Fed3<span className={landing.brandDot}>.</span></span></Link>
    <button id={toggleId} className={landing.menuToggle} aria-expanded={menu} aria-controls={navigationId} aria-label={m.menu} onClick={() => setMenu(!menu)}><span /><span /></button>
    <nav id={navigationId} className={`${landing.navigation} ${menu ? landing.menuOpen : ''}`} aria-label={m.menu}>
      {sections.map(section => <a key={section.id} href={`${inDirectory ? '' : fed3.routes[locale].alternatives}#${section.id}`} className={landing.navItem} aria-current={active === section.id ? 'location' : undefined} onClick={() => setMenu(false)}><span className={landing.navLabel}>{section.label}</span>{section.soon && <span className={styles.headerSoon}>{locale === 'ar' ? 'قريبًا' : 'Soon'}</span>}</a>)}
    </nav>
    <Link className={landing.language} href={languageHref} scroll={false} onClick={switchLanguage} aria-label={m.languageLabel} lang={other} dir={other === 'ar' ? 'rtl' : 'ltr'}><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.3" /><path d="M3.7 12h16.6M12 3.7c4 4.3 4 12.3 0 16.6-4-4.3-4-12.3 0-16.6Z" /></svg>{m.language}</Link>
  </header>;
}
