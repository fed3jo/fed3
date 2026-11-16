import type { Locale } from './config';

// Public contact supplied by the initiative owner, November 16, 2026.
export const initiativeEmail = 'Fed3JoR@proton.me';
export const initiativeMailto = `mailto:${initiativeEmail}`;
export const policyUpdated = '2026-11-16';
export type InfoSection = 'about' | 'privacy' | 'contact';
type PageCopy = { title: string; description: string; lead: string };
export const infoCopy: Record<Locale, Record<InfoSection, PageCopy>> = {
  ar: {
    about: { title: 'عن المبادرة', description: 'تعرّف على Fed3، مبادرة السيادة الرقمية من متطوعي برنامج اليافعين في مؤسسة رواد التنمية في عمّان، ومسارات البدائل والسحابة المحلية ومشاركة المعرفة.', lead: 'نحن متطوعون من برنامج اليافعين في مؤسسة رواد التنمية. نعمل من عمّان لنساعد الناس يفهموا خياراتهم الرقمية ويختاروا كيف يحفظوا بياناتهم ويشاركوها.' },
    privacy: { title: 'خصوصيتك على الموقع', description: 'كيف يستخدم موقع Fed3 تفضيلات اللغة والحركة وحفظ لعبة مكشوف، وما يحدث عند استخدام الاستبيان والروابط الخارجية، وإحصاءات النقر واللعب ومدد الاحتفاظ.', lead: 'هاي الصفحة بتشرح شو بيحفظ الموقع على جهازك، وشو بينتقل عند فتح الروابط أو مراسلتنا. إحصاءات النقر واللعب تُرسل للخادم، والاستبيان لا يُرسل إلا باختيارك وموافقتك.' },
    contact: { title: 'تواصل معنا', description: 'تواصل مع فريق مبادرة Fed3 عبر البريد المعتمد للاستفسارات والملاحظات والتصحيحات، وتعرّف على حالة التسجيل والشهادات والساعات التطوعية.', lead: 'عندك سؤال عن المبادرة، أو ملاحظة على مقارنة، أو مشكلة بالموقع؟ ابعث لنا على البريد المعتمد واذكر الصفحة أو الأداة المعنية.' },
  },
  en: {
    about: { title: 'About the initiative', description: 'Meet Fed3, a Digital Sovereignty Initiative led by youth-program volunteers at Ruwwad Al Tanmeya in Amman, and explore its learning tracks.', lead: 'We are volunteers from the youth program at Ruwwad Al Tanmeya. Working from Amman, we help people understand their digital choices and decide how to store and share their data.' },
    privacy: { title: 'Your privacy on this site', description: 'How Fed3 uses language and motion preferences and Exposed game saves, handles survey submissions and external links, and retains click and game measurements.', lead: 'This page explains what the site stores on your device and what happens when you follow links or email us. Click and game measurements are sent to our server. Survey answers are sent only when you choose to submit and consent.' },
    contact: { title: 'Contact us', description: 'Email the Fed3 initiative team with questions, feedback and corrections, and check the status of registration, certificates and volunteer hours.', lead: 'Have a question about the initiative, a correction to a comparison, or a problem with the site? Email the team and mention the relevant page or tool.' },
  },
};
