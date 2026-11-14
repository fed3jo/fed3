'use client';
import type { Locale } from '@/lib/fed3/config';
import { Fragment } from 'react';
import { messages } from '@/lib/fed3/messages';
import styles from './identity.module.css';

function HighlightedDefinition({ text, locale }: { text: string; locale: Locale }) {
  const phrases = locale === 'ar'
    ? ['بدائل رقمية تراعي الخصوصية', 'حلول للتخزين السحابي المحلي', 'نقل المعرفة من خلال التدريب والتجربة مع المجتمع.']
    : ['privacy-conscious alternatives', 'local cloud storage', 'sharing knowledge through practical training and community learning.'];
  const passage = locale === 'ar' ? 'تسهيل الانتقال' : 'trying privacy-conscious';
  const passageStart = text.indexOf(passage);
  const highlights = phrases.map(phrase => ({ phrase, start: text.indexOf(phrase) }));
  const caret = <span className={styles.caret} aria-hidden="true" />;
  if (passageStart < 0 || highlights.some(({ start }) => start < passageStart)) return <>{text}{caret}</>;
  const ending = (value: string) => {
    const lastWord = value.lastIndexOf(' ') + 1;
    return <>{value.slice(0, lastWord)}<span className={styles.ending}>{value.slice(lastWord)}{caret}</span></>;
  };
  const last = highlights[highlights.length - 1];
  const tail = text.slice(last.start + last.phrase.length);
  return <>
    {text.slice(0, passageStart)}
    <span className={styles.highlightedPassage}>
      {highlights.map(({ phrase, start }, index) => <Fragment key={phrase}>
        {text.slice(index === 0 ? passageStart : highlights[index - 1].start + highlights[index - 1].phrase.length, start)}
        <mark className={styles.focusPhrase}>{index === highlights.length - 1 && !tail ? ending(phrase) : phrase}</mark>
      </Fragment>)}
      {tail && ending(tail)}
    </span>
  </>;
}

export function InitiativeIdentity({ locale, ready }: { locale: Locale; ready: boolean }) {
  const ar = locale === 'ar';
  const copy = messages[locale].stations.intro;
  const tones = ar ? [styles.navy, styles.purple, styles.orange] : [styles.orange, styles.purple, styles.navy];
  const words = copy.heading.split(' ');
  const word = (index: number) => <span className={tones[index]}>{words[index]}</span>;
  return <div className={styles.identity} aria-labelledby="identity-heading" data-initiative-identity data-ready={ready}>
    <p className={styles.eyebrow}>{ar ? 'عن المبادرة / عمّان، الأردن' : 'ABOUT THE INITIATIVE / AMMAN, JORDAN'}</p>
    <h1 id="identity-heading">{ar
      ? <>{word(0)}{' '}<span className={styles.titleName}>{word(1)}{' '}{word(2)}</span></>
      : words.map((_, index) => <Fragment key={index}>{index > 0 && ' '}{word(index)}</Fragment>)}</h1>
    <p className={styles.description}><HighlightedDefinition text={copy.description} locale={locale} /></p>
  </div>;
}
