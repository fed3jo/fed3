import type { Copy, Criterion } from './alternatives';

export const comparisonGroups = [
  { id: 'privacy', title: { ar: 'الخصوصية والبيانات', en: 'Privacy & data' }, criteria: ['encryption', 'collection', 'ads', 'control', 'account'] },
  { id: 'features', title: { ar: 'المزايا والأجهزة', en: 'Features & devices' }, criteria: ['features', 'platforms'] },
  { id: 'cost', title: { ar: 'التكلفة', en: 'Cost' }, criteria: ['cost'] },
  { id: 'migration', title: { ar: 'الانتقال والقيود', en: 'Migration & limits' }, criteria: ['portability', 'limitations'] },
] as const satisfies readonly { id: string; title: Copy; criteria: readonly Criterion[] }[];

export type ComparisonGroupId = typeof comparisonGroups[number]['id'];

// Exact excerpts from the comparison copy. Emphasis preserves the surrounding conditions.
export const comparisonEmphasis: Record<string, { ar: readonly string[]; en: readonly string[] }> = {
  signal: {
    ar: ['مشفرة طرفًا لطرف افتراضيًا', 'لا تقرأ الخدمة محتواها', 'المراسلة مجانية', 'لا توجد أداة لاستيراد محادثات WhatsApp مباشرة', 'التشفير لا يمنع المستلم من نسخ الرسالة', 'يلزم انضمام الطرف الآخر'],
    en: ['E2EE by default', 'the service cannot read their content', 'Messaging is free', 'no direct WhatsApp chat importer', 'Encryption cannot stop recipients copying messages', 'both parties need the app'],
  },
  brave: {
    ar: ['حظر التتبع لا يحوّل التصفح إلى اتصال مجهول', 'مزامنة مشفرة اختيارية', 'المتصفح مجاني', 'بعض الخدمات الإضافية مدفوعة', 'لا يخفي النشاط عن الموقع أو مزود الشبكة', 'قد يتعطل جزء من موقع بسبب الحظر'],
    en: ['tracker blocking does not make browsing anonymous', 'optional encrypted device sync', 'The browser is free', 'some additional services are paid', 'Incognito does not hide activity from websites or your network provider', 'Blocking can break site features'],
  },
  'proton-mail': {
    ar: ['طرفي بين حسابات Proton', 'البريد الخارجي يحتاج PGP أو رسالة محمية بكلمة مرور', 'خطة مجانية بحدود', 'لا يغيّر عنوانك القديم لدى الآخرين', 'لا يحمي نسخة الرسالة عند مقدم بريد خارجي'],
    en: ['E2EE between Proton accounts', 'external mail needs PGP or password-protected messages', 'Limited free tier', 'importing does not update your old address for others', 'It cannot protect copies at an external provider'],
  },
  nextcloud: {
    ar: ['تشفير طرفي اختياري لمجلدات مدعومة', 'المسؤول قد يقرأ الملفات العادية', 'تختار الخادم ومكان البيانات', 'العتاد والاستضافة والصيانة لها تكلفة', 'روابط المشاركة والصلاحيات لا تنتقل تلقائيًا', 'المزامنة وحدها لا تعوّض نسخة احتياطية'],
    en: ['optional E2EE for supported folders', 'Administrators may read ordinary files', 'Choose the server and data location', 'hardware, hosting and maintenance have costs', 'sharing links and permissions do not transfer automatically', 'Sync alone is not a backup'],
  },
  onlyoffice: {
    ar: ['التحرير المحلي ليس تشفيرًا تلقائيًا للملف', 'Desktop Editors مجاني ومفتوح المصدر', 'افحص التنسيق والتعليقات', 'الملفات المحلية تحتاج نسخًا احتياطية', 'إضافات AI قد ترسل المحتوى لمزود خارجي'],
    en: ['Local editing does not automatically encrypt a file', 'Desktop Editors is free and open source', 'check formatting and comments', 'Local files need backups', 'AI plugins may send content to an external provider'],
  },
};
