import type { Locale } from './config';

export type Copy = { ar: string; en: string };
export const t = (ar: string, en: string): Copy => ({ ar, en });
export const categories = {
  messaging: t('المراسلة', 'Messaging'), browser: t('التصفح', 'Browsing'),
  email: t('البريد', 'Email'), storage: t('التخزين', 'Storage'), documents: t('المستندات', 'Documents'),
};
export type Category = keyof typeof categories;
export const criteria = {
  encryption: t('التشفير ومن يقرأ المحتوى', 'Encryption & content access'),
  collection: t('البيانات التي تعالجها الخدمة', 'Data the service processes'),
  ads: t('الإعلانات والتتبع', 'Advertising & tracking'),
  control: t('مكان البيانات والتحكم بها', 'Data location & control'),
  account: t('الحساب والهوية', 'Account & identity'),
  features: t('الوظائف اليومية', 'Everyday features'),
  platforms: t('الأجهزة المدعومة', 'Supported devices'),
  cost: t('التكلفة', 'Cost'),
  portability: t('التصدير والانتقال', 'Export & migration'),
  limitations: t('الحدود والمسؤولية', 'Limits & responsibility'),
} as const;
export type Criterion = keyof typeof criteria;
export const privacyCriteria: Criterion[] = ['encryption', 'collection', 'ads', 'control', 'account'];
export type Source = { name: Copy; url: string };
export type ComparisonRow = { key: Criterion; current: Copy; alternative: Copy; sources: number[] };
export type Alternative = {
  id: string; name: string; current: string; category: Category; mark: string; color: string;
  description: Copy; gain: Copy; tradeoff: Copy; firstStep: Copy; steps: Copy[];
  official: string; download: string; sources: Source[]; rows: ComparisonRow[];
};
const source = (ar: string, en: string, url: string): Source => ({ name: t(ar, en), url });
const row = (key: Criterion, arCurrent: string, enCurrent: string, arAlternative: string, enAlternative: string, sources: number[]): ComparisonRow => ({ key, current: t(arCurrent, enCurrent), alternative: t(arAlternative, enAlternative), sources });
const googlePrivacy = source('سياسة خصوصية Google', 'Google privacy policy', 'https://policies.google.com/privacy');
const driveEncryption = source('Google: تشفير الملفات', 'Google: file encryption', 'https://support.google.com/drive/answer/10519333?hl=en');

// Editorial comparisons of the named editions, checked against publisher documentation.
// These are not independent audits, speed benchmarks or security scores.
export const alternatives: Alternative[] = [
  {
    id: 'signal', name: 'Signal', current: 'WhatsApp', category: 'messaging', mark: 'S', color: '#3565d7',
    description: t('محادثات خاصة، مع تقليل البيانات التي تحتفظ بها الخدمة.', 'Private conversations with less data retained by the service.'),
    gain: t('تركيز على المراسلة وتقليل البيانات، دون إعلانات.', 'A messaging service focused on data minimization, without ads.'),
    tradeoff: t('ستحتاج أن ينضم من تراسلهم إلى Signal. محادثات WhatsApp لا تنتقل إليه مباشرة.', 'Your contacts need Signal too. WhatsApp chats do not transfer directly.'),
    firstStep: t('ابدأ بمحادثة تجريبية مع شخص واحد.', 'Start with one test conversation.'),
    steps: [t('نزّل Signal من موقعه الرسمي وسجّل رقم هاتفك.', 'Install Signal from its official site and register your phone number.'), t('راجع خصوصية الرقم وأنشئ اسم مستخدم، ثم فعّل قفل التسجيل.', 'Review phone number privacy, create a username, and enable registration lock.'), t('ادعُ شخصًا تثق به وجرّب رسالة ومكالمة. احتفظ بسجلك القديم قبل أي حذف.', 'Invite a trusted contact and test a message and call. Keep your old history before deleting anything.')],
    official: 'https://signal.org/download/', download: 'https://signal.org/download/',
    sources: [source('Signal: الخصوصية', 'Signal: privacy', 'https://signal.org/legal/'), source('WhatsApp: البيانات والخصوصية', 'WhatsApp: data & privacy', 'https://www.whatsapp.com/privacyquestions'), source('Signal: الرقم واسم المستخدم', 'Signal: numbers & usernames', 'https://support.signal.org/hc/en-us/articles/6712070553754-Phone-Number-Privacy-and-Usernames'), source('Signal: الأجهزة والتنزيل', 'Signal: devices & downloads', 'https://signal.org/download/')],
    rows: [
      row('encryption', 'الرسائل والمكالمات الشخصية مشفرة طرفًا لطرف افتراضيًا. تواصل الشركات والذكاء الاصطناعي له شروط مختلفة.', 'Personal messages and calls use E2EE by default. Business and AI interactions have different conditions.', 'الرسائل والمكالمات مشفرة طرفًا لطرف افتراضيًا؛ لا تقرأ الخدمة محتواها.', 'Messages and calls use E2EE by default; the service cannot read their content.', [0, 1]),
      row('collection', 'يعالج معلومات الحساب والجهاز والاستخدام وبعض معلومات المجموعات.', 'Processes account, device, usage and some group information.', 'رقم للتسجيل ومعلومات تقنية لازمة للتشغيل؛ يحتفظ بالحد الأدنى وفق سياسته.', 'A registration number and operational technical data; its policy limits retention.', [0, 1]),
      row('ads', 'إعلانات في قسم المستجدات؛ الرسائل الشخصية لا تستخدم لاستهدافها.', 'Ads in Updates; personal messages are not used for ad targeting.', 'لا إعلانات ولا بيع للبيانات الشخصية وفق السياسة.', 'No ads or sale of personal data under its policy.', [0, 1]),
      row('control', 'خدمة تديرها Meta؛ إعدادات النسخ الاحتياطي مسار منفصل يجب مراجعته.', 'Meta-operated service; review backup settings separately.', 'سجل المحادثة على أجهزتك. الخدمة مركزية وليست استضافة ذاتية.', 'Chat history lives on your devices. The service is centralized, not self-hosted.', [0, 1]),
      row('account', 'يعتمد التسجيل على رقم هاتف.', 'Registration uses a phone number.', 'يتطلب رقمًا للتسجيل؛ اسم المستخدم يتيح بدء التواصل دون مشاركته.', 'Requires a number to register; usernames let you connect without sharing it.', [0, 2]),
      row('features', 'رسائل ومجموعات ومكالمات، مع قنوات وخدمات أعمال.', 'Messages, groups and calls, plus channels and business services.', 'رسائل ومجموعات ومكالمات ومشاركة ملفات ورسائل تختفي.', 'Messages, groups, calls, file sharing and disappearing messages.', [0, 1, 3]),
      row('platforms', 'هاتف وتطبيق حاسوب وواجهة ويب.', 'Phone, desktop app and web interface.', 'Android وiOS وWindows وmacOS وLinux؛ الحاسوب يرتبط بالهاتف، دون واجهة ويب.', 'Android, iOS, Windows, macOS and Linux; desktop links to a phone, with no web client.', [1, 3]),
      row('cost', 'المراسلة الشخصية مجانية؛ بعض خدمات الأعمال مدفوعة.', 'Personal messaging is free; some business services are paid.', 'المراسلة مجانية، مع إمكانية دعم المشروع بالتبرع.', 'Messaging is free; donations can support the project.', [0, 1, 3]),
      row('portability', 'احفظ سجلك قبل الانتقال؛ التصدير لا يعني إمكان استيراده في بديل.', 'Keep your history; export does not imply import into another app.', 'ابدأ محادثات جديدة؛ لا توجد أداة لاستيراد محادثات WhatsApp مباشرة.', 'Start new chats; there is no direct WhatsApp chat importer.', [0, 3]),
      row('limitations', 'المحتوى المرسل لشركة قد يدخل أنظمة الشركة المستلمة.', 'Content sent to a business may enter the recipient’s business systems.', 'التشفير لا يمنع المستلم من نسخ الرسالة، ويلزم انضمام الطرف الآخر.', 'Encryption cannot stop recipients copying messages; both parties need the app.', [0, 1]),
    ],
  },
  {
    id: 'brave', name: 'Brave', current: 'Google Chrome', category: 'browser', mark: 'B', color: '#b9480a',
    description: t('حظر مدمج لعدد من الإعلانات والمتعقبات أثناء التصفح.', 'Built-in blocking for many ads and trackers while browsing.'),
    gain: t('حماية تتبع مدمجة، مع استخدام إضافات Chromium.', 'Built-in tracking protection with Chromium extensions.'),
    tradeoff: t('بعض المواقع تحتاج تعديل Shields. المتصفح لا يخفي هويتك عن كل جهة.', 'Some sites need Shields adjustments. A browser does not hide your identity from everyone.'),
    firstStep: t('جرّبه على مواقعك اليومية قبل جعله المتصفح الافتراضي.', 'Try your everyday sites before making it your default.'),
    steps: [t('نزّل Brave من الموقع الرسمي واستورد العلامات التي تحتاجها.', 'Download Brave from its official site and import the bookmarks you need.'), t('راجع Shields وإعدادات القياس والخدمات الاختيارية مثل Rewards.', 'Review Shields, usage measurement and optional services such as Rewards.'), t('اختبر تسجيل الدخول والعمل على مواقعك. احتفظ بالمتصفح الحالي حتى تتأكد.', 'Test sign-in and your work sites. Keep your current browser until you are satisfied.')],
    official: 'https://brave.com/download/', download: 'https://brave.com/download/',
    sources: [source('Brave: سياسة المتصفح', 'Brave: browser policy', 'https://brave.com/privacy/browser/'), source('Chrome: الحساب والمزامنة', 'Chrome: account & sync', 'https://support.google.com/chrome/answer/13948160?hl=en'), source('Brave: Shields', 'Brave: Shields', 'https://brave.com/shields/'), source('Brave: التنزيل', 'Brave: download', 'https://brave.com/download/')],
    rows: [
      row('encryption', 'HTTPS يحمي الاتصال بالموقع؛ لا يمنع الموقع من قراءة ما ترسله إليه.', 'HTTPS protects the connection; the website still reads what you send it.', 'نفس حدود HTTPS؛ حظر التتبع لا يحوّل التصفح إلى اتصال مجهول.', 'The same HTTPS limits apply; tracker blocking does not make browsing anonymous.', [0, 1]),
      row('collection', 'قد تحفظ بيانات التصفح في حساب Google بحسب المزامنة وإعدادات النشاط.', 'Browser data may be saved to your Google Account depending on sync and activity settings.', 'لا يجمع سجل التصفح وفق سياسته؛ توجد قياسات استخدام وخدمات تعالج بيانات محددة.', 'Its policy excludes browsing-history collection; usage measurements and services still process certain data.', [0, 1]),
      row('ads', 'إدارة الخصوصية والتتبع تعتمد على الإعدادات والإضافات.', 'Tracking controls depend on settings and extensions.', 'Shields يحظر متعقبات وإعلانات؛ Rewards خدمة إعلانات اختيارية منفصلة.', 'Shields blocks trackers and ads; Rewards is a separate optional ad service.', [0, 1, 2]),
      row('control', 'حفظ محلي أو مزامنة اختيارية بحساب Google.', 'Local storage or optional Google Account sync.', 'حفظ محلي ومزامنة مشفرة اختيارية بين أجهزتك.', 'Local storage with optional encrypted device sync.', [0, 1]),
      row('account', 'يمكن التصفح دون حساب؛ الحساب يتيح حفظ البيانات بين الأجهزة.', 'Browsing needs no account; an account enables cross-device storage.', 'التصفح الأساسي لا يحتاج حسابًا.', 'Core browsing requires no account.', [0, 1]),
      row('features', 'متصفح Chromium وتكامل مع خدمات Google وإضافات.', 'Chromium browser with Google integrations and extensions.', 'متصفح Chromium بإضافات وحماية Shields مدمجة.', 'Chromium browser with extensions and built-in Shields.', [1, 2, 3]),
      row('platforms', 'Windows وmacOS وLinux وAndroid وiOS.', 'Windows, macOS, Linux, Android and iOS.', 'Windows وmacOS وLinux وAndroid وiOS؛ بعض الخصائص تختلف.', 'Windows, macOS, Linux, Android and iOS; some features vary.', [1, 3]),
      row('cost', 'التصفح الأساسي مجاني.', 'Core browsing is free.', 'المتصفح مجاني؛ بعض الخدمات الإضافية مدفوعة.', 'The browser is free; some additional services are paid.', [0, 3]),
      row('portability', 'يمكن تصدير العلامات وبعض البيانات من الإعدادات.', 'Settings allow export of bookmarks and some data.', 'استيراد بيانات من متصفحات مدعومة؛ راجع العناصر المنقولة.', 'Imports data from supported browsers; check what actually transfers.', [0, 1, 3]),
      row('limitations', 'وضع التصفح الخفي لا يخفي النشاط عن الموقع أو مزود الشبكة.', 'Incognito does not hide activity from websites or your network provider.', 'قد يتعطل جزء من موقع بسبب الحظر؛ تعطيل الحماية له يغير مستوى التتبع.', 'Blocking can break site features; disabling protection changes tracking exposure.', [0, 2]),
    ],
  },
  {
    id: 'proton-mail', name: 'Proton Mail', current: 'Gmail', category: 'email', mark: 'P', color: '#7050ad',
    description: t('بريد يحمي محتوى صندوقك بتشفير لا تملك الخدمة مفاتيح فكّه.', 'Email with zero-access encryption for stored mailbox content.'),
    gain: t('حماية محتوى الرسائل المخزنة، وتشفير طرفي بين حسابات Proton.', 'Protected stored content and end-to-end encryption between Proton accounts.'),
    tradeoff: t('عنوان الرسالة وبيانات المرسل والمستلم ليست مشفرة طرفًا لطرف. البريد الخارجي له شروط.', 'Subjects and sender/recipient metadata are not end-to-end encrypted. External mail has conditions.'),
    firstStep: t('أنشئ حسابًا وجرب رسالة قبل نقل بريدك القديم.', 'Create an account and test a message before importing old mail.'),
    steps: [t('راجع الخطة المناسبة وأنشئ حسابًا من الموقع الرسمي.', 'Review the available plans and create an account on the official site.'), t('فعّل المصادقة الثنائية واحفظ وسيلة استرداد الحساب والبيانات بأمان.', 'Enable two-factor authentication and safely store account and data recovery options.'), t('جرّب رسالة لحساب Proton ورسالة لبريد خارجي، ثم استخدم Easy Switch عند الحاجة.', 'Test mail to Proton and to an external address, then use Easy Switch if needed.')],
    official: 'https://proton.me/mail', download: 'https://proton.me/mail/download',
    sources: [source('Proton: نطاق التشفير', 'Proton: encryption scope', 'https://proton.me/support/what-is-encrypted-within-protonmail'), source('Proton Mail: سياسة الخصوصية', 'Proton Mail: privacy policy', 'https://proton.me/mail/privacy-policy'), source('Gmail: التشفير', 'Gmail: encryption', 'https://support.google.com/mail/answer/6330403?hl=en'), source('Gmail: الإعلانات', 'Gmail: advertising', 'https://support.google.com/mail/answer/6603?hl=en'), source('Proton: الخطط والأجهزة', 'Proton: plans & devices', 'https://proton.me/mail/pricing'), source('Proton: استيراد البريد', 'Proton: mail import', 'https://proton.me/easyswitch')],
    rows: [
      row('encryption', 'TLS للنقل افتراضيًا. بعض خطط المؤسسات تقدم حماية إضافية بإعداد المسؤول.', 'TLS in transit by default. Some organizational plans offer administrator-configured additional protection.', 'طرفي بين حسابات Proton؛ البريد الخارجي يحتاج PGP أو رسالة محمية بكلمة مرور.', 'E2EE between Proton accounts; external mail needs PGP or password-protected messages.', [0, 2]),
      row('collection', 'الخدمة تعالج الرسائل لتقديم البريد والحماية من الرسائل الضارة.', 'The service processes mail to deliver it and protect against harmful messages.', 'تظل العناوين والموضوع والتوقيت متاحة للخدمة؛ المحتوى المخزن مشفر دون وصولها.', 'Addresses, subjects and timing remain accessible; stored content uses zero-access encryption.', [0, 1, 2]),
      row('ads', 'تظهر إعلانات؛ Google تقول إنها لا تقرأ الرسائل لاستهداف الإعلانات.', 'Shows ads; Google says message content is not read for ad targeting.', 'البريد بلا إعلانات؛ الاشتراكات تموّل المزايا المدفوعة.', 'Ad-free mail; subscriptions fund paid features.', [3, 4]),
      row('control', 'صندوق بريد تديره Google؛ يمكن إدارة البيانات وتصديرها.', 'Google operates the mailbox; data controls and export are available.', 'خدمة مستضافة تديرها Proton، وليست خادم بريد على جهازك.', 'A Proton-operated hosted service, not a mail server on your device.', [1, 2, 5]),
      row('account', 'يتطلب حساب Google.', 'Requires a Google Account.', 'يتطلب حساب Proton وخطة استرداد مناسبة.', 'Requires a Proton account and suitable recovery planning.', [1, 4]),
      row('features', 'بريد وبحث وتصنيف وتكامل مع منظومة Google.', 'Email, search, categorization and Google integrations.', 'بريد وتقويم وفلاتر؛ بعض المزايا مرتبطة بالخطة.', 'Email, calendar and filters; some features depend on the plan.', [2, 4]),
      row('platforms', 'الويب وAndroid وiOS وعملاء البريد المدعومون.', 'Web, Android, iOS and supported mail clients.', 'الويب وAndroid وiOS؛ تطبيق الحاسوب وBridge يخضعان لشروط الخطة.', 'Web, Android and iOS; desktop and Bridge depend on plan terms.', [2, 4]),
      row('cost', 'خطة شخصية مجانية وخطط مدفوعة لزيادة الموارد.', 'Free personal tier and paid plans for more resources.', 'خطة مجانية بحدود؛ مساحة ونطاقات ومزايا إضافية مدفوعة.', 'Limited free tier; extra storage, domains and features are paid.', [4]),
      row('portability', 'يمكن الاحتفاظ بنسخة من البريد قبل أي تغيير.', 'Keep a copy of your mail before changing services.', 'Easy Switch يستورد البريد؛ الاستيراد لا يغيّر عنوانك القديم لدى الآخرين.', 'Easy Switch imports mail; importing does not update your old address for others.', [5]),
      row('limitations', 'التشفير أثناء النقل لا يعني أن مقدم البريد لا يرى المحتوى.', 'Transport encryption does not prevent provider access to content.', 'لا يحمي نسخة الرسالة عند مقدم بريد خارجي؛ احتفظ بوسائل الاسترداد.', 'It cannot protect copies at an external provider; keep recovery options safe.', [0, 1, 2]),
    ],
  },
  {
    id: 'nextcloud', name: 'Nextcloud', current: 'Google Drive', category: 'storage', mark: 'N', color: '#08779c',
    description: t('ملفات ومشاركة على خادم تختار من يديره وأين يوجد.', 'Files and sharing on a server whose location and operator you choose.'),
    gain: t('تختار الاستضافة والصلاحيات وسياسة الاحتفاظ بالملفات.', 'Choose hosting, permissions and file retention policies.'),
    tradeoff: t('تحتاج مسؤول تشغيل وتحديثات ونسخًا احتياطية. الاستضافة الذاتية لا تعني تشفيرًا طرفيًا تلقائيًا.', 'You need maintenance, updates and backups. Self-hosting does not automatically mean E2EE.'),
    firstStep: t('جرّب مجلدًا غير حساس مع مسؤول تقني.', 'Test a non-sensitive folder with a technical administrator.'),
    steps: [t('حدّد الخادم أو مقدم الاستضافة ومن يتولى تحديثه ونسخه واستعادته.', 'Choose a server or provider and assign updates, backups and recovery responsibilities.'), t('أنشئ حسابًا بصلاحيات محدودة، واختبر ملفًا ومشاركته وإلغاء المشاركة.', 'Create a limited-permission account; test a file, sharing and revoking access.'), t('اختبر استعادة نسخة منفصلة قبل نقل الملفات المهمة. راجع دليل Home-Cloud.', 'Test restoring a separate backup before moving important files. Review Home-Cloud.')],
    official: 'https://nextcloud.com/install/', download: 'https://nextcloud.com/install/',
    sources: [source('Nextcloud Files: الوظائف', 'Nextcloud Files: features', 'https://nextcloud.com/files/'), source('Nextcloud: التشفير', 'Nextcloud: encryption', 'https://nextcloud.com/encryption/'), source('Nextcloud: دليل التشفير الطرفي', 'Nextcloud: E2EE manual', 'https://docs.nextcloud.com/server/latest/user_manual/en/files/using_e2ee.html'), driveEncryption, googlePrivacy, source('Nextcloud: التثبيت والعملاء', 'Nextcloud: installation & clients', 'https://nextcloud.com/install/'), source('Nextcloud: النسخ الاحتياطي', 'Nextcloud: backups', 'https://docs.nextcloud.com/server/stable/admin_manual/maintenance/backup.html')],
    rows: [
      row('encryption', 'تشفير أثناء النقل والتخزين؛ تشفير العميل إضافة مؤسسية لها متطلبات.', 'Encrypted in transit and at rest; client-side encryption has organizational requirements.', 'HTTPS وتشفير طرفي اختياري لمجلدات مدعومة. المسؤول قد يقرأ الملفات العادية.', 'HTTPS and optional E2EE for supported folders. Administrators may read ordinary files.', [1, 2, 3]),
      row('collection', 'ملفات وبيانات حساب واستخدام وسجلات خدمة وفق سياسة Google.', 'Files, account and usage data, and service logs under Google’s policy.', 'الملفات والسجلات عند مشغّل الخادم؛ الإضافات والتكاملات قد تضيف جهات أخرى.', 'Files and logs reside with the server operator; integrations can add other parties.', [0, 4]),
      row('ads', 'Google تقول إنها لا تستخدم محتوى Drive لاستهداف الإعلانات.', 'Google says Drive content is not used for ad targeting.', 'لا تحتاج منظومة إعلانات لتشغيل خادمك؛ راجع إضافاتك ومقدم الاستضافة.', 'Running your server needs no ad system; review plugins and your host.', [0, 4]),
      row('control', 'Google تدير البنية والتخزين.', 'Google operates the infrastructure and storage.', 'تختار الخادم ومكان البيانات؛ الاستضافة المدارة تبقى عند مقدم تختاره.', 'Choose the server and data location; managed hosting remains with your chosen provider.', [0, 4]),
      row('account', 'حساب Google وصلاحيات مشاركة.', 'Google Account and sharing permissions.', 'حساب على خادم المؤسسة أو المزود، مع صلاحيات يحددها المسؤول.', 'An account on your organization’s or provider’s server, with administrator-defined permissions.', [0, 4]),
      row('features', 'مشاركة ومزامنة وتكامل مع Docs وSheets.', 'Sharing, sync and integration with Docs and Sheets.', 'مشاركة ومزامنة وإصدارات؛ التحرير المشترك يحتاج تكاملًا مناسبًا.', 'Sharing, sync and versioning; collaborative editing needs a suitable integration.', [0, 3]),
      row('platforms', 'ويب وهاتف؛ تطبيق حاسوب رسمي لـWindows وmacOS.', 'Web and mobile; official desktop app for Windows and macOS.', 'ويب وAndroid وiOS؛ عملاء Windows وmacOS وLinux.', 'Web, Android and iOS; Windows, macOS and Linux clients.', [0, 5]),
      row('cost', 'حصة مجانية وخطط مدفوعة لزيادة السعة.', 'Free allowance with paid storage upgrades.', 'البرنامج المجتمعي مجاني؛ العتاد والاستضافة والصيانة لها تكلفة.', 'Community software is free; hardware, hosting and maintenance have costs.', [0, 5]),
      row('portability', 'نزّل الملفات وصدّر المستندات بصيغ مناسبة.', 'Download files and export native documents to suitable formats.', 'ارفع نسخة صغيرة أولًا؛ روابط المشاركة والصلاحيات لا تنتقل تلقائيًا.', 'Upload a small copy first; sharing links and permissions do not transfer automatically.', [0, 5]),
      row('limitations', 'تعتمد على توافر الخدمة وحسابك لدى المزود.', 'Depends on provider availability and account access.', 'مسؤوليتك تشمل الحماية والاستعادة. المزامنة وحدها لا تعوّض نسخة احتياطية.', 'You are responsible for security and recovery. Sync alone is not a backup.', [0, 6]),
    ],
  },
  {
    id: 'onlyoffice', name: 'ONLYOFFICE', current: 'Google Docs', category: 'documents', mark: 'O', color: '#b24930',
    description: t('محررات حاسوب تعمل على مستنداتك محليًا، حتى دون إنترنت.', 'Desktop editors for local documents, including offline work.'),
    gain: t('يمكن تحرير الملفات على جهازك دون رفعها إلى خدمة سحابية.', 'Edit files on your device without uploading them to a cloud service.'),
    tradeoff: t('نقارن Desktop Editors تحديدًا. التعاون المباشر يحتاج اتصالًا بخدمة، وقد تختلف التنسيقات.', 'This comparison covers Desktop Editors. Live collaboration needs a connected service; formatting can differ.'),
    firstStep: t('صدّر مستندًا غير حساس وجرّب تحرير نسخة محلية.', 'Export a non-sensitive document and edit a local copy.'),
    steps: [t('نزّل Desktop Editors لنظام حاسوبك من الموقع الرسمي.', 'Download Desktop Editors for your computer from the official site.'), t('صدّر مستندًا إلى DOCX، وافتح نسخة منه دون ربط خدمة سحابية أو إضافة ذكاء اصطناعي.', 'Export a document as DOCX and open a copy without connecting cloud services or AI plugins.'), t('راجع العربية والجداول والتنسيق، واحفظ نسخة احتياطية قبل اعتماد سير العمل.', 'Check Arabic text, tables and formatting, and back up files before adopting the workflow.')],
    official: 'https://www.onlyoffice.com/download-desktop', download: 'https://www.onlyoffice.com/download-desktop',
    sources: [source('ONLYOFFICE: محررات الحاسوب', 'ONLYOFFICE: Desktop Editors', 'https://www.onlyoffice.com/desktop'), source('ONLYOFFICE: المصدر والترخيص', 'ONLYOFFICE: source & license', 'https://github.com/ONLYOFFICE/DesktopEditors'), source('ONLYOFFICE: التشغيل والتكاملات', 'ONLYOFFICE: operation & integrations', 'https://api.onlyoffice.com/docs/desktop-editors/get-started/overview'), driveEncryption, googlePrivacy],
    rows: [
      row('encryption', 'تشفير النقل والتخزين؛ تشفير العميل يحتاج خطة وإعدادًا مؤسسيًا مناسبًا.', 'Transit and storage encryption; client-side encryption needs an eligible organizational setup.', 'التحرير المحلي ليس تشفيرًا تلقائيًا للملف. حماية القرص والنسخ مسؤوليتك.', 'Local editing does not automatically encrypt a file. Disk and backup protection are your responsibility.', [2, 3]),
      row('collection', 'المستندات وبيانات الحساب والاستخدام تُعالج ضمن خدمة Google.', 'Documents, account and usage data are processed within Google’s service.', 'العمل المحلي دون تكاملات لا يحتاج رفع المستند. السحابة والإضافات تغير مسار البيانات.', 'Local work without integrations needs no document upload. Cloud and plugins change the data flow.', [2, 4]),
      row('ads', 'لا تستخدم Google محتوى Drive لاستهداف الإعلانات وفق سياستها.', 'Google’s policy excludes Drive content from ad targeting.', 'يمكن تحرير مستند محلي دون خدمة إعلانات أو حساب سحابي.', 'Local documents can be edited without an ad service or cloud account.', [0, 4]),
      row('control', 'التخزين الأساسي على خدمة Google مع خيارات تنزيل.', 'Primary storage is on Google’s service, with download options.', 'ملفات محلية تختار مكانها. ربط سحابة يجعل شروط مزودها ذات صلة.', 'Choose where local files live. Connecting a cloud makes its provider’s terms relevant.', [2, 4]),
      row('account', 'يلزم حساب لإنشاء المستندات وإدارتها.', 'An account is needed to create and manage documents.', 'تحرير الملفات المحلية لا يتطلب حسابًا سحابيًا.', 'Editing local files requires no cloud account.', [0, 4]),
      row('features', 'تعاون عبر المتصفح وتعليقات وسجل تعديلات.', 'Browser collaboration, comments and revision history.', 'مستندات وجداول وعروض وPDF؛ التعاون يحتاج منصة متصلة.', 'Documents, spreadsheets, presentations and PDFs; collaboration needs a connected platform.', [0, 2, 3]),
      row('platforms', 'المتصفح وAndroid وiOS؛ العمل دون اتصال يحتاج إعدادًا.', 'Browser, Android and iOS; offline work needs setup.', 'Desktop Editors على Windows وmacOS وLinux. تطبيق الهاتف منتج منفصل.', 'Desktop Editors on Windows, macOS and Linux. Mobile is a separate app.', [0, 1]),
      row('cost', 'استخدام شخصي مجاني وخطط مؤسسات مدفوعة.', 'Free personal use and paid organizational plans.', 'Desktop Editors مجاني ومفتوح المصدر؛ حلول الخادم والدعم لها شروط أخرى.', 'Desktop Editors is free and open source; server products and support have separate terms.', [0, 1]),
      row('portability', 'تنزيل بصيغ مثل DOCX وPDF.', 'Download formats include DOCX and PDF.', 'يدعم صيغ Office؛ افحص التنسيق والتعليقات بعد التصدير والاستيراد.', 'Supports Office formats; check formatting and comments after export and import.', [0, 2]),
      row('limitations', 'سير العمل والتعاون مرتبطان بالحساب وخدمة Google.', 'Workflow and collaboration depend on Google’s service and account.', 'الملفات المحلية تحتاج نسخًا احتياطية؛ إضافات AI قد ترسل المحتوى لمزود خارجي.', 'Local files need backups; AI plugins may send content to an external provider.', [2, 4]),
    ],
  },
];

export const reviewDate: Record<Locale, string> = { ar: '24 أكتوبر 2026', en: '24 October 2026' };
