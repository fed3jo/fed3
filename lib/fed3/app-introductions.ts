import { t, type Copy } from './alternatives';

// Concise editorial summaries of publisher product pages, reviewed 2026-11-15.
export const appIntroductions: Record<string, { source: string; description: Copy; features: Copy[] }> = {
  signal: {
    source: 'https://signal.org/',
    description: t('تطبيق للمراسلة والمكالمات الصوتية والمرئية. يدعم المحادثات الجماعية ومشاركة الصور والملفات، مع تشفير طرفي للرسائل والمكالمات.', 'A messaging app with voice and video calls, group chats, and photo and file sharing. Messages and calls use end-to-end encryption.'),
    features: [t('رسائل ومكالمات', 'Messages & calls'), t('محادثات جماعية', 'Group chats'), t('تشفير طرفي', 'End-to-end encryption')],
  },
  brave: {
    source: 'https://brave.com/',
    description: t('متصفح مبني على Chromium، مع حماية Shields المدمجة لحظر الإعلانات والمتعقبات. يمكنك تعديل الحماية حسب الموقع الذي تزوره.', 'A Chromium-based browser with built-in Shields to block ads and trackers. Protection can be adjusted for individual websites.'),
    features: [t('حماية Shields', 'Shields protection'), t('حظر المتعقبات', 'Tracker blocking'), t('للأجهزة المختلفة', 'Desktop & mobile')],
  },
  'proton-mail': {
    source: 'https://proton.me/mail',
    description: t('خدمة بريد إلكتروني تستخدم تشفيرًا يمنع الخدمة من قراءة محتوى الرسائل المخزنة. تدعم استيراد البريد، وتختلف خصائصها وحدودها بحسب الخطة.', 'An email service with zero-access encryption for stored message content and tools to import existing mail. Features and limits depend on the plan.'),
    features: [t('بريد إلكتروني', 'Email'), t('تشفير المحتوى المخزن', 'Encrypted stored content'), t('استيراد البريد', 'Mail import')],
  },
  nextcloud: {
    source: 'https://nextcloud.com/files/',
    description: t('برنامج لمزامنة الملفات ومشاركتها والتعاون عليها عبر الويب والهاتف والحاسوب. يمكن تشغيله على خادم تختاره، مع إدارة الوصول إلى الملفات.', 'Software to sync, share and collaborate on files across web, mobile and desktop. It can run on a server you choose, with file access controls.'),
    features: [t('مزامنة الملفات', 'File sync'), t('المشاركة والتعاون', 'Sharing & collaboration'), t('استضافة تختارها', 'Choose your hosting')],
  },
  onlyoffice: {
    source: 'https://www.onlyoffice.com/desktop',
    description: t('مجموعة محررات للمستندات والجداول والعروض وملفات PDF. تعمل على جهازك دون إنترنت، ويمكن ربطها بخدمات سحابية للتعاون مع الآخرين.', 'Editors for documents, spreadsheets, presentations and PDFs. Work offline on your computer or connect to a cloud service for collaboration.'),
    features: [t('مستندات وجداول وعروض', 'Docs, sheets & slides'), t('عمل دون إنترنت', 'Offline editing'), t('ربط بالسحابة', 'Cloud connections')],
  },
};
