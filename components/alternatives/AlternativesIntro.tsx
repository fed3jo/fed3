import type { Locale } from '@/lib/fed3/config';
import { messages } from '@/lib/fed3/messages';
import { InitiativeIntro } from '@/components/landing/InitiativeIntro';
import identity from '@/components/landing/identity.module.css';

export function AlternativesIntro({ locale, explore, reduceMotion }: { locale: Locale; explore: () => void; reduceMotion?: boolean }) {
  const ar = locale === 'ar';
  return <InitiativeIntro locale={locale} messages={messages[locale]} ready explore={explore} variant="alternatives" reduceMotion={reduceMotion}
    secondaryAction={{ href: '#game', label: ar ? 'العب مكشوف' : 'Play Exposed' }} identity={
    <div className={identity.identity} data-alternatives-identity>
      <p className={identity.eyebrow}>{ar ? 'المحطة الأولى / اختَر أداتك' : 'STATION ONE / CHOOSE YOUR TOOLS'}</p>
      <h1 id="identity-heading">{ar
        ? <><span className={identity.navy}>البدائل</span>{' '}<span className={identity.orange}>الرقمية</span></>
        : <><span className={identity.navy}>Digital</span>{' '}<span className={identity.orange}>alternatives</span></>}</h1>
      <p className={identity.description}>{ar ? <>
        تجمع هذه الصفحة بدائل للتطبيقات التي تستخدمها في المراسلة والتصفح والبريد والعمل على الملفات.
        {' '}<mark className={identity.focusPhrase}>قارن البديل بتطبيقك الحالي</mark> لتفهم مزاياه وحدوده وطريقة تعامله مع بياناتك، ثم{' '}
        <mark className={identity.focusPhrase}>جرّب ما يناسب احتياجك.</mark><span className={identity.caret} aria-hidden="true" />
      </> : <>
        Explore alternatives for messaging, browsing, email and working with files.
        {' '}<mark className={identity.focusPhrase}>Compare each alternative with your current app</mark> to understand its features, limits and how it handles your data. Then{' '}
        <mark className={identity.focusPhrase}>try what suits your needs.</mark><span className={identity.caret} aria-hidden="true" />
      </>}</p>
    </div>
  } />;
}
