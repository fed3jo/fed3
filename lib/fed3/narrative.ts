import type { Locale } from './config';
import type { Criterion } from './alternatives';

// Editorial basis: week 10, political, economic and social urgency papers.
// Product-specific claims remain in alternatives.ts with publisher references.
export const narrative = {
  ar: {
    eyebrow: 'ليش نحتاج خيارات؟', title: 'كل تطبيق، قرار عن بياناتك.',
    lead: 'موافقتك على استخدام خدمة بترافقك كل يوم. قبل ما تختار، افهم شو بتشارك، ومين بتحكّم فيه، وكيف بتقدر تغيّر قرارك.',
    lenses: [
      { key: 'choice', label: 'استقلال القرار', question: 'لو تغيّرت شروط الخدمة؟', text: 'وجود بديل وطريقة لنقل بياناتك يعطيك خيارًا حين تتغيّر الخدمة التي تعتمد عليها.', action: 'افهم قدرتك على الانتقال' },
      { key: 'data', label: 'قيمة البيانات', question: 'شو بتعرف الخدمة عنك؟', text: 'نشاطك واهتماماتك قد يُستخدمان لتخصيص المحتوى والإعلانات. قارن البيانات التي تعالجها كل خدمة.', action: 'راجع البيانات والتتبع' },
      { key: 'people', label: 'الناس حولك', question: 'كيف بتغيّر بدون ما تنقطع؟', text: 'ابدأ بتجربة صغيرة مع شخص تعرفه. وجود الأهل والأصدقاء على تطبيق معيّن جزء من قرارك.', action: 'جرّب خطوة تناسبك' },
    ],
    closing: 'ابدأ بخيار واحد. جرّبه، ثم قرّر إذا بناسبك.',
  },
  en: {
    eyebrow: 'WHY HAVE ALTERNATIVES?', title: 'Every app is a decision about your data.',
    lead: 'A service becomes part of your daily life. Before choosing, understand what you share, who controls it, and how you can change your mind.',
    lenses: [
      { key: 'choice', label: 'Independent choices', question: 'What if the terms change?', text: 'An alternative and a way to move your data give you options when a service you depend on changes.', action: 'Understand your ability to leave' },
      { key: 'data', label: 'The value of data', question: 'What does the service know?', text: 'Your activity and interests may inform content and advertising. Compare the data each service processes.', action: 'Review data and tracking' },
      { key: 'people', label: 'The people around you', question: 'How do you stay connected?', text: 'Try a small change with someone you know. Where your friends and family are matters to your choice.', action: 'Try a step that fits your life' },
    ],
    closing: 'Start with one option. Try it, then decide if it fits.',
  },
};

export const criterionQuestions: Record<Criterion, Record<Locale, string>> = {
  encryption: { ar: 'مين بقدر يقرأ المحتوى؟', en: 'Who can read the content?' },
  collection: { ar: 'شو بتعرف الخدمة عنك؟', en: 'What does the service know about you?' },
  ads: { ar: 'كيف بتأثر بياناتك على اللي بتشوفه؟', en: 'How does your data shape what you see?' },
  control: { ar: 'وين بياناتك ومين بتحكّم فيها؟', en: 'Where is your data, and who controls it?' },
  account: { ar: 'شو بتشارك حتى تفتح حساب؟', en: 'What do you share to create an account?' },
  features: { ar: 'هل بخدم احتياجك اليومي؟', en: 'Does it meet your everyday needs?' },
  platforms: { ar: 'هل بشتغل على أجهزتك؟', en: 'Will it work on your devices?' },
  cost: { ar: 'شو بتدفع، ولأي خدمة؟', en: 'What do you pay, and what for?' },
  portability: { ar: 'إذا بدك تغيّر، بتقدر تاخد بياناتك؟', en: 'Can you take your data when you leave?' },
  limitations: { ar: 'شو الحدود والمسؤوليات؟', en: 'What are the limits and responsibilities?' },
};
