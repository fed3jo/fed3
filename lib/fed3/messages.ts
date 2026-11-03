import type { Locale, Station } from './config';

export type StationCopy = { eyebrow: string; heading: string; description: string; tags?: string[]; action?: string; note?: string; image: string };
export type Messages = {
  initiative: string; brand: string; nav: { alternatives: string; 'home-cloud': string; communities: string; about: string };
  language: string; languageLabel: string; skip: string; menu: string; journey: string; scroll: string; stage: string;
  simplified: string; animated: string; loading: string; preparing: string; loadingCount: string; retry: string; loadError: string; stall: string; scriptError: string;
  footer: string; privacy: string; contact: string; top: string; home: string; pending: string; unavailable: string;
  stations: Record<Station, StationCopy>;
};
export const messages: Record<Locale, Messages> = {
  ar: {
    initiative: 'من مبادرة السيادة الرقمية', brand: 'Fed3 — مبادرة السيادة الرقمية',
    nav: { alternatives: 'البدائل الرقمية', 'home-cloud': 'السحابة المحلية (Home-Cloud)', communities: 'المجتمعات الرقمية', about: 'عن المبادرة' },
    language: 'English', languageLabel: 'Switch to English', skip: 'انتقل إلى المحتوى', menu: 'التنقّل', journey: 'رحلتك الرقمية',
    scroll: 'مرّر لتكتشف', stage: 'مشاهد الرحلة الرقمية', simplified: 'عرض الصفحة المبسّطة', animated: 'عرض الرحلة المتحركة',
    loading: 'نجهّز رحلتك الرقمية…', preparing: 'جارٍ تجهيز المشهد', loadingCount: 'صورة جاهزة', retry: 'إعادة المحاولة',
    loadError: 'تعذّر تحميل بعض الصور. يمكنك إعادة المحاولة أو متابعة الصفحة المبسّطة.',
    stall: 'التحميل يستغرق وقتًا أطول. يمكنك إعادة المحاولة أو متابعة الصفحة المبسّطة.',
    scriptError: 'الرحلة المتحركة غير متاحة الآن. يمكنك قراءة كل المحتوى أدناه.',
    footer: 'أدوات أوضح. تحكّم أكبر. معرفة نتشاركها.', privacy: 'الخصوصية', contact: 'تواصل معنا', top: 'العودة إلى الأعلى', home: 'الصفحة الرئيسية',
    pending: 'نعمل على تجهيز هذه الصفحة. يمكنك العودة لاستكشاف المبادرة.', unavailable: 'لم تتوفر الصورة. يمكنك متابعة قراءة المحتوى.',
    stations: {
      intro: { eyebrow: 'مبادرة السيادة الرقمية', heading: 'بياناتك. قرارك.', description: 'بدائل رقمية، سحابة محلية، ومجتمعات تساعدك تستعيد التحكّم ببياناتك.', action: 'ابدأ الرحلة', image: 'شعار Fed3 الكامل بأجزائه الأزرق والبرتقالي والبنفسجي' },
      alternatives: { eyebrow: 'المحطة 01 / اختَر أداتك', heading: 'غيّر أداتك، ووسّع خياراتك.', description: 'شو بتشارك مع تطبيقك، ومين بقدر يقرأه؟ قارن خمسة بدائل بخصوصيتها ومزاياها وحدودها، وجرّب أثر قراراتك بلعبة بكرا الافتتاح.', tags: ['خمسة بدائل', 'مقارنات موثقة', 'لعبة بكرا الافتتاح'], action: 'استكشف منصة البدائل', image: 'مفتاح أزرق مع بطاقات تمثّل خيارات التطبيقات' },
      'home-cloud': { eyebrow: 'المحطة 02 / امتلك مساحتك', heading: 'سحابتكم، على جهازكم.', description: 'نساعد مؤسستكم تجهّز سحابة على جهاز داخلها، لتنظيم الملفات ومشاركتها، مع صلاحيات واضحة وتدريب على الاستخدام والإدارة.', tags: ['تخزين محلي', 'مشاركة ملفات', 'تحكّم بالصلاحيات'], action: 'تعرّف على Home-Cloud', note: 'كل مؤسسة تشغّل جهازها المستقل.', image: 'خادم بنفسجي محلي متصل بحاسوب وهاتف' },
      communities: { eyebrow: 'المحطة 03 / شارك المعرفة', heading: 'تعلّمها، جرّبها، وانقلها لغيرك.', description: 'الانتقال أسهل لما تتعلّم وتجرّب مع ناس بتعرفهم. انضم لمجتمعات تتبادل المعرفة والتدريب، أو تعلّم كيف تبدأ مجتمعًا يساعد الناس على استخدام البدائل.', tags: ['مجتمعات رقمية', 'تدريب عملي', 'سفراء التحوّل'], action: 'اكتشف المجتمعات', image: 'أشخاص يتشاركون مسارًا على سهم برتقالي صاعد' },
      closing: { eyebrow: 'والخطوة الجاية إلك', heading: 'ابدأ بخطوة. وخلي القرار بإيدك.', description: 'اختَر بديلًا، اكتشف السحابة المحلية، أو شارك المعرفة مع مجتمعك.', image: 'شعار Fed3 بعد عودة أجزائه معًا' },
    },
  },
  en: {
    initiative: 'A Digital Sovereignty Initiative', brand: 'Fed3 — Digital Sovereignty Initiative',
    nav: { alternatives: 'Digital Alternatives', 'home-cloud': 'Local Cloud (Home-Cloud)', communities: 'Digital Communities', about: 'About' },
    language: 'العربية', languageLabel: 'التبديل إلى العربية', skip: 'Skip to content', menu: 'Navigation', journey: 'Your digital journey',
    scroll: 'Scroll to explore', stage: 'Digital journey scenes', simplified: 'View simplified page', animated: 'View animated journey',
    loading: 'Preparing your digital journey…', preparing: 'Preparing the scene', loadingCount: 'images ready', retry: 'Retry',
    loadError: 'Some images could not be loaded. Retry or continue with the simplified page.',
    stall: 'Loading is taking longer than expected. Retry or continue with the simplified page.',
    scriptError: 'The animated journey is unavailable right now. All content is available below.',
    footer: 'Clearer choices. More control. Knowledge to share.', privacy: 'Privacy', contact: 'Contact', top: 'Back to top', home: 'Home',
    pending: 'This page is being prepared. Return to explore the initiative.', unavailable: 'The image is unavailable. You can continue reading.',
    stations: {
      intro: { eyebrow: 'Digital Sovereignty Initiative', heading: 'Your data. Your decision.', description: 'Explore digital alternatives, local cloud storage, and communities that help you take control of your data.', action: 'Start exploring', image: 'The complete Fed3 symbol in navy, orange and purple' },
      alternatives: { eyebrow: 'CHAPTER 01 / CHOOSE YOUR TOOLS', heading: 'Change your tools. Expand your options.', description: 'What do you share with your app, and who can read it? Compare five alternatives for privacy, features and limits, then explore your decisions in Opening Tomorrow.', tags: ['Five alternatives', 'Sourced comparisons', 'Opening Tomorrow game'], action: 'Explore alternatives', image: 'A navy toggle with cards representing alternative apps' },
      'home-cloud': { eyebrow: 'CHAPTER 02 / OWN YOUR SPACE', heading: 'Your cloud. On your hardware.', description: 'We help your organization set up local file storage and sharing on its own hardware, with access controls and practical training.', tags: ['Local storage', 'File sharing', 'Access control'], action: 'Discover Home Cloud', note: 'Each institution operates its own independent device.', image: 'A purple local server connected to a laptop and phone' },
      communities: { eyebrow: 'CHAPTER 03 / SHARE KNOWLEDGE', heading: 'Learn it. Try it. Pass it on.', description: 'Try a change with people you know. Join communities that share knowledge and practical training, or learn how to start one of your own.', tags: ['Digital communities', 'Practical training', 'Community ambassadors'], action: 'Explore communities', image: 'People sharing a path along an ascending orange arrow' },
      closing: { eyebrow: 'Your next step', heading: 'Take a step. Take control.', description: 'Choose an alternative, explore local storage, or share what you learn with your community.', image: 'The reassembled Fed3 symbol' },
    },
  },
};
