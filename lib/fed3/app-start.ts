import { t, type Copy, type Criterion } from './alternatives';

export const appStart: Record<string, { firstCriterion: Criterion; intro: Copy; benefit: Copy; remember: Copy; downloadLabel: Copy; note: Copy; steps: Copy[] }> = {
  signal: {
    firstCriterion: 'collection',
    benefit: t('مراسلة **بدون إعلانات**، مع تقليل البيانات التي تحتفظ بها الخدمة.', 'Messaging **without ads**, with less data retained by the service.'),
    remember: t('**ادعُ شخصًا واحدًا للتجربة**. من تراسله يحتاج Signal أيضًا، ومحادثات WhatsApp لا تنتقل مباشرة.', '**Invite one person to try it**. Your contact needs Signal too, and WhatsApp chats do not transfer directly.'),
    intro: t('رسائل ومكالمات ومشاركة ملفات مع **تشفير يحمي محتواها**. ابدأ **بمحادثة مع شخص واحد** وجرّب ما يناسبك.', 'Messages, calls and file sharing with **encryption that protects their content**. Start with **one conversation with one person**.'),
    downloadLabel: t('نزّل Signal', 'Download Signal'),
    note: t('ابدأ على هاتفك، ثم اربط تطبيق الحاسوب إذا احتجته.', 'Start on your phone, then link the desktop app if you need it.'),
    steps: [t('نزّل التطبيق وسجّل رقمك.', 'Install the app and register your number.'), t('ادعُ شخصًا واحدًا لتجربته.', 'Invite one person to try it.'), t('جرّب رسالة ومكالمة، واحتفظ بسجلك القديم.', 'Try a message and call, and keep your old chat history.')],
  },
  brave: {
    firstCriterion: 'ads',
    benefit: t('**حظر مدمج للإعلانات والمتعقبات**، مع استخدام إضافات Chromium.', '**Built-in ad and tracker blocking**, with Chromium extensions.'),
    remember: t('**جرّب مواقعك أولًا**. بعض المواقع تحتاج تعديل Shields، والتصفح لا يصبح مجهولًا بالكامل.', '**Try your sites first**. Some need Shields adjustments, and browsing is not fully anonymous.'),
    intro: t('متصفح مع **حظر مدمج للإعلانات والمتعقبات**. استورد علاماتك و**جرّب مواقعك اليومية** قبل تغيير متصفحك الأساسي.', 'A browser with **built-in ad and tracker blocking**. Import bookmarks and **try your everyday sites** before switching your default.'),
    downloadLabel: t('نزّل Brave', 'Download Brave'),
    note: t('جرّبه مع مواقعك اليومية، ثم قرّر إذا بدك تخليه متصفحك الأساسي.', 'Try your everyday sites, then decide whether to make it your default browser.'),
    steps: [t('نزّل Brave من موقعه الرسمي.', 'Download Brave from its official site.'), t('استورد العلامات التي تحتاجها.', 'Import the bookmarks you need.'), t('جرّب مواقعك وراجع Shields عند الحاجة.', 'Try your sites and review Shields when needed.')],
  },
  'proton-mail': {
    firstCriterion: 'encryption',
    benefit: t('**تشفير محتوى البريد المخزن**، وتشفير طرفي للرسائل بين حسابات Proton.', '**Encrypted stored mail content**, with end-to-end encryption between Proton accounts.'),
    remember: t('**جرّب رسالة قبل نقل البريد**. عنوان الرسالة ومعلومات المرسل والمستلم ليست مشفّرة طرفيًا، والبريد الخارجي له شروط.', '**Test a message before importing mail**. Subjects and sender/recipient details are not end-to-end encrypted. External mail has conditions.'),
    intro: t('بريد يحمي **محتوى الرسائل المخزنة بالتشفير**. ابدأ من **المتصفح أو الهاتف**، وجرّب رسالة قبل استيراد بريدك.', 'Email with **encrypted stored message content**. Start on **browser or mobile** and test a message before importing mail.'),
    downloadLabel: t('نزّل Proton Mail', 'Download Proton Mail'),
    note: t('يمكنك البدء من المتصفح أيضًا. أنشئ حسابًا وجرّب رسالة قبل نقل بريدك.', 'You can start in a browser too. Create an account and test a message before importing your mail.'),
    steps: [t('اختر خطة مناسبة وأنشئ حسابًا.', 'Choose a suitable plan and create an account.'), t('جرّب رسالة واحفظ وسائل الاسترداد.', 'Test a message and save your recovery options.'), t('استورد بريدك بأداة Easy Switch عند الحاجة.', 'Import mail with Easy Switch when you need it.')],
  },
  nextcloud: {
    firstCriterion: 'control',
    benefit: t('**اختَر مكان ملفاتك وخادمك**، ونظّم مشاركة الفريق وصلاحياته.', '**Choose where files live and which server to use**, with team sharing and access controls.'),
    remember: t('**ابدأ بملفات تجريبية**، وخطّط للصيانة والحماية والنسخ والاستعادة. روابط المشاركة لا تنتقل تلقائيًا.', '**Start with sample files** and plan maintenance, protection, backups and recovery. Sharing links do not transfer automatically.'),
    intro: t('زامن ملفات فريقك وشاركها عبر **سحابة تختارها**. ابدأ **بملفات تجريبية قليلة** على حساب المؤسسة أو المزوّد.', 'Sync and share team files using **a cloud you choose**. Start with **a few sample files** on your organization’s or provider’s account.'),
    downloadLabel: t('نزّل تطبيق Nextcloud', 'Download the Nextcloud app'),
    note: t('تطبيق المزامنة يتصل بحساب Nextcloud موجود. لتجهيز سحابة جديدة، ابدأ بدليل السحابة المحلية.', 'The sync app connects to an existing Nextcloud account. For a new cloud, start with our local cloud guide.'),
    steps: [t('جهّز حسابًا على سحابة المؤسسة أو المزوّد.', 'Set up an account with your organization or provider.'), t('اربط التطبيق وارفع ملفات تجريبية قليلة.', 'Connect the app and upload a few sample files.'), t('جرّب المشاركة واحفظ نسخة احتياطية وتأكد أنك تقدر تسترجعها.', 'Test sharing and check that a backup can be restored.')],
  },
  onlyoffice: {
    firstCriterion: 'account',
    benefit: t('**حرّر ملفاتك محليًا ودون إنترنت**، مع دعم صيغ Office.', '**Edit locally and offline**, with Office format support.'),
    remember: t('**افحص التنسيق والتعليقات بنسخة تجريبية**. التعاون المباشر يحتاج ربط خدمة مناسبة.', '**Check formatting and comments using a sample copy**. Live collaboration needs a connected service.'),
    intro: t('افتح المستندات والجداول والعروض و**اشتغل دون إنترنت**. جرّب **نسخة من ملفك** وراجع التنسيق قبل اعتماد طريقة العمل.', 'Open documents, spreadsheets and presentations and **work offline**. Try **a copy of your file** and check its formatting first.'),
    downloadLabel: t('نزّل ONLYOFFICE', 'Download ONLYOFFICE'),
    note: t('ابدأ بنسخة من ملفك، وافحص التنسيق قبل اعتماد طريقة العمل.', 'Start with a copy of your file and check its formatting before adopting the workflow.'),
    steps: [t('نزّل Desktop Editors للحاسوب.', 'Download Desktop Editors for your computer.'), t('افتح نسخة من ملف Word أو Excel أو PowerPoint.', 'Open a copy of a Word, Excel or PowerPoint file.'), t('راجع التنسيق والتعليقات واحفظ نسخة احتياطية.', 'Check formatting and comments, and keep a backup.')],
  },
};
