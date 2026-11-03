import type { Locale } from './config';
import { t, type Copy } from './alternatives';

export const cloudSources = {
  snap: 'https://github.com/nextcloud-snap/nextcloud-snap/wiki',
  requirements: 'https://docs.nextcloud.com/server/stable/admin_manual/installation/system_requirements.html',
  daily: 'https://docs.nextcloud.com/server/stable/user_manual/en/files/index.html',
  aio: 'https://github.com/nextcloud/all-in-one#readme',
  backup: 'https://docs.nextcloud.com/server/latest/admin_manual/maintenance/backup.html',
  users: 'https://docs.nextcloud.com/server/latest/admin_manual/configuration_user/user_configuration.html',
  clients: 'https://nextcloud.com/install/',
};

export const cloudCopy = {
  ar: {
    nav: ['الفكرة', 'كيف تشتغل؟', 'خطوات التجهيز', 'الجاهزية'],
    eyebrow: 'المحطة 02 / السحابة المحلية', title: 'سحابة داخل مؤسستك.', accent: 'وملفاتكم بإيدكم.',
    lead: 'مساحة خاصة لحفظ الملفات ومشاركتها على جهاز مستقل داخل المؤسسة. نبدأ بفهم احتياجكم، ثم تجهيز الجهاز والصلاحيات والنسخ الاحتياطي، وتدريب الكادر على الاستخدام والإدارة.',
    explore: 'شوف كيف بتشتغل', survey: 'استبيان الجاهزية', soon: 'قريبًا',
    ownership: 'كل مؤسسة تشغّل جهازها المستقل.', signature: 'تحكّم بالمكان. افهم المسؤولية.',
    strip: ['جهاز داخل المؤسسة', 'حساب لكل مستخدم', 'نسخة احتياطية منفصلة'],
    overview: 'مكان واحد لملفات الشغل.', overviewLead: 'السحابة المحلية بتنظّم وصول الفريق للملفات. باستخدام Nextcloud، بتقدروا ترفعوا وتزامنوا وتشاركوا، مع تحديد مين بقدر يوصل لكل مساحة.',
    uses: [
      ['folder', 'ملفاتكم بترتيب واضح', 'مجلدات للعمل اليومي وأرشفة الصور والمستندات، مع الوصول من الهاتف أو الحاسوب.'],
      ['people', 'مشاركة بصلاحيات', 'حسابات منفصلة ومجموعات وحصص تخزين، وروابط مشاركة تحددوا صلاحيتها.'],
      ['backup', 'استرجاع تتدرّبوا عليه', 'المزامنة تختلف عن النسخ الاحتياطي. نجهّز نسخة منفصلة ونجرب الاستعادة قبل نقل الملفات المهمة.'],
    ],
    flow: 'وين بتمر ملفاتكم؟', flowLead: 'اختَر طريقة الوصول لتفهم الفرق. البداية المقترحة داخل شبكة المؤسسة أو شبكة خاصة بين أجهزة محددة.',
    modes: ['داخل المؤسسة', 'شبكة خاصة', 'وصول عام'],
    modeDescriptions: [
      'أجهزة الفريق والخادم على الشبكة نفسها. البداية أبسط، لكن الوصول من خارج المؤسسة يحتاج إعدادًا آخر.',
      'توصل أجهزة محددة بالخادم عبر شبكة خاصة. تحتاج إعداد الوصول والهوية على الأجهزة المشاركة.',
      'الدخول عبر نطاق وHTTPS. يُجهّز بعد فحص الشبكة والصلاحيات والنسخ والاستعادة، ومع مسؤول واضح للصيانة.',
    ],
    nodes: [['platforms', 'أجهزة الفريق', 'رفع ومزامنة'], ['network', 'شبكة المؤسسة', 'اتصال بين الأجهزة'], ['control', 'خادمكم المحلي', 'ملفات وحسابات'], ['backup', 'نسخة مستقلة', 'استعادة عند الحاجة']],
    accessLabels: ['نفس الشبكة', 'أجهزة محددة', 'نطاق وHTTPS'],
    responsibility: 'التحكّم والمسؤولية مع بعض.', responsibilityText: 'وجود الجهاز داخل المؤسسة يزيد تحكّمكم بمكان الملفات. مسؤول الخادم يملك صلاحيات واسعة؛ حدّدوا هويته وحدود وصوله، وخطة التحديث والنسخ والاستجابة للأعطال.',
    steps: 'من الجاهزية لأول ملف.', stepsLead: 'هذا ترتيب العمل المقترح مع المسؤول التقني. ابدأوا بمجلد تجريبي وملفات غير حساسة قبل توسيع الاستخدام.',
    setup: [
      ['افهموا الاحتياج', 'حدّدوا عدد المستخدمين والملفات المراد حفظها، ومين رح يتابع الخدمة. اتفقوا على الوصول والدعم ومسؤوليات كل طرف.', 'المخرج: احتياج واضح ومسؤول معروف'],
      ['افحصوا الجهاز والشبكة', 'راجعوا سلامة الحاسوب والقرص والمساحة والتهوية والطاقة. خصصوا وجهة نسخ منفصلة، وافحصوا استقرار الشبكة.', 'المخرج: جهاز وبيئة مناسبين للتجربة'],
      ['جهّزوا Nextcloud', 'يعرض دليل المبادرة مسار Linux باستخدام Snap. يتبع المسؤول هذا المسار مع توثيق الإعدادات، ثم يجهّز الوصول المحلي أو الخاص مع HTTPS صحيح.', 'المخرج: خدمة تعمل بإعداد موثّق'],
      ['وزّعوا الحسابات والصلاحيات', 'أنشئوا حسابًا مستقلًا لكل مستخدم، وحساب إدارة منفصلًا. اضبطوا المجموعات والحصص، وفعّلوا المصادقة الثنائية واحفظوا رموز الاسترداد بأمان.', 'المخرج: كل مستخدم يعرف صلاحياته'],
      ['جرّبوا النسخ والاستعادة', 'نفّذوا نسخة احتياطية متسقة تشمل البيانات والإعدادات وقاعدة البيانات وما يلزم من تخصيصات. اختبروا الاستعادة في بيئة منفصلة قبل نقل ملفات مهمة.', 'المخرج: استعادة ناجحة وموثّقة'],
      ['تدرّبوا وسلّموا الإدارة', 'جرّبوا رفع ملف من الهاتف وفتحه من الحاسوب، ثم المشاركة وإلغاء الرابط والاسترجاع. دوّنوا مسؤول الصيانة والبديل ودورية المتابعة.', 'المخرج: فريق يقدر يستخدم ويتابع'],
    ],
    stepSources: 'الدليل الرسمي للمسؤول التقني',
    care: 'بعد التجهيز، المتابعة مستمرة.', routines: [
      ['النسخ', 'راجعوا نجاح النسخ والمساحة المتبقية، واحتفظوا بنقاط استعادة متعددة.'],
      ['التحديثات', 'حدّدوا نافذة صيانة، وخذوا نسخة قبل التحديثات المهمة.'],
      ['الاستعادة', 'كرّروا اختبار الاستعادة وسجّلوا النتيجة، وراجعوا الحسابات وروابط المشاركة.'],
    ],
    faq: 'أسئلة قبل البداية', faqs: [
      ['هل بتشتغل بدون إنترنت؟', 'الوصول المحلي ممكن بين أجهزة الشبكة بحسب الإعداد. الوصول من خارج المؤسسة والتحديثات والخدمات الخارجية تحتاج اتصالًا مناسبًا.'],
      ['هل المزامنة بتكفي كنسخة احتياطية؟', 'الحذف أو الخطأ قد ينتقل مع المزامنة. تحتاجوا نسخة مستقلة ونقاط استعادة واختبارًا يثبت إنكم بتقدروا ترجعوا الخدمة.'],
      ['مين بقدر يقرأ الملفات؟', 'هذا يعتمد على الحسابات والصلاحيات ونوع التشفير. مدير الخادم عنده صلاحيات تشغيل واسعة؛ وضّحوا حدود الوصول قبل الاستخدام. التخزين المحلي وحده مش ضمان للخصوصية.'],
      ['هل التجهيز بدون تكلفة؟', 'البرمجية مفتوحة المصدر، لكن الجهاز والتخزين والطاقة والنسخ ووقت الصيانة والدعم إلها تكلفة. تحديدها بيبدأ بفهم الاحتياج.'],
    ],
    readinessTitle: 'هل مؤسستكم جاهزة للخطوة؟', readinessLead: 'معاينة لأسئلة تقييم الجاهزية التقنية والإدارية، من نموذج الأسبوع 12 في المبادرة. الإرسال قريبًا؛ بإمكانكم الاطلاع وتجربة تعبئة الأسئلة الآن.',
    previewNote: 'معاينة فقط. إجاباتك لا تُرسل ولا تُحفظ، وتختفي عند مغادرة الصفحة أو تحديثها.',
    surveyGroups: ['عن المؤسسة', 'الجاهزية التقنية', 'الدعم والمتابعة'], next: 'القسم التالي', back: 'السابق', submit: 'الإرسال قريبًا', preview: 'معاينة الاستبيان', optional: 'اختياري',
    multi: 'يمكن اختيار أكثر من إجابة', progress: 'القسم', of: 'من',
    footer: 'السحابة المحلية / Fed3', returnHome: 'العودة إلى الرئيسية', alternatives: 'استكشف البدائل', sourceLabel: 'مراجع التجهيز',
  },
  en: {
    nav: ['The idea', 'How it works', 'Setup steps', 'Readiness'],
    eyebrow: 'CHAPTER 02 / LOCAL CLOUD', title: 'A cloud inside your organization.', accent: 'Your files, in your hands.',
    lead: 'A private space for storing and sharing files on independent hardware inside your organization. Start with your needs, then prepare the device, access controls and backups, and train the team to use and manage it.',
    explore: 'See how it works', survey: 'Readiness survey', soon: 'Soon', ownership: 'Each organization runs its own independent device.', signature: 'Control the location. Understand the responsibility.',
    strip: ['Hardware on your premises', 'A separate account for each user', 'An independent backup'],
    overview: 'One place for your team’s files.', overviewLead: 'Local cloud storage organizes your team’s access to files. Nextcloud lets you upload, sync and share while defining who can access each space.',
    uses: [['folder', 'Organized files', 'Folders for daily work and archived photos and documents, accessible from a phone or computer.'], ['people', 'Sharing with permissions', 'Separate accounts, groups and storage quotas, with sharing links whose access you control.'], ['backup', 'Recovery you practise', 'Sync and backup serve different purposes. Set up a separate backup and test recovery before moving important files.']],
    flow: 'Where do your files go?', flowLead: 'Choose an access method to understand the difference. Start on the organization’s network or a private network between selected devices.',
    modes: ['Local network', 'Private network', 'Public access'],
    modeDescriptions: ['Team devices and the server share the same network. A simpler starting point; access from outside needs additional setup.', 'Selected devices connect through a private network. Participating devices need access and identity configuration.', 'Access through a domain and HTTPS, after checking the network, permissions, backups and recovery, with a named maintenance owner.'],
    nodes: [['platforms', 'Team devices', 'Upload & sync'], ['network', 'Your network', 'Device connections'], ['control', 'Your local server', 'Files & accounts'], ['backup', 'Separate backup', 'Recovery when needed']],
    accessLabels: ['Same network', 'Selected devices', 'Domain & HTTPS'],
    responsibility: 'Control comes with responsibility.', responsibilityText: 'Keeping hardware on your premises gives you more control over file location. The administrator has broad access: define their role, access limits, update schedule, backups and incident response.',
    steps: 'From readiness to your first file.', stepsLead: 'Follow this sequence with your technical lead. Begin with a test folder and non-sensitive files before expanding use.',
    setup: [
      ['Understand the need', 'Define users, files and the person who will maintain the service. Agree on access, support and responsibilities.', 'Outcome: clear needs and a named owner'],
      ['Check hardware and network', 'Check the computer, drive, space, cooling and power. Allocate a separate backup destination and check network stability.', 'Outcome: hardware and a suitable test environment'],
      ['Prepare Nextcloud', 'The initiative guide follows Linux and Nextcloud Snap. The technical lead follows this path, documents the setup, and configures local or private access with valid HTTPS.', 'Outcome: a working, documented service'],
      ['Set up accounts and permissions', 'Create separate user accounts and a separate admin account. Configure groups and quotas, enable two-factor authentication and store recovery codes safely.', 'Outcome: each user understands their access'],
      ['Test backup and recovery', 'Create a consistent backup of data, configuration, the database and relevant customizations. Test recovery separately before moving important files.', 'Outcome: a successful, documented restore'],
      ['Train and hand over', 'Upload from a phone, open on a computer, then share, revoke a link and restore a file. Record the main and backup maintenance contacts and review schedule.', 'Outcome: a team that can use and maintain it'],
    ],
    stepSources: 'Official guide for the technical lead', care: 'Maintenance continues after setup.',
    routines: [['Backups', 'Check completed backups and free space. Retain several recovery points.'], ['Updates', 'Schedule maintenance and back up before important updates.'], ['Recovery', 'Repeat and document recovery tests. Review accounts and sharing links.']],
    faq: 'Questions before you start', faqs: [
      ['Can it work without the internet?', 'Local access can work between devices on the same network, depending on setup. External access, updates and external services need suitable connectivity.'],
      ['Is sync enough as a backup?', 'Deletion or errors can propagate through sync. Keep a separate backup, recovery points and evidence that you can restore the service.'],
      ['Who can read the files?', 'It depends on accounts, permissions and encryption. Administrators have broad operational access. Define its limits before use; local storage alone does not guarantee privacy.'],
      ['Is setup free?', 'The software is open source. Hardware, storage, power, backup, maintenance and support still have costs. Assess your needs first.'],
    ],
    readinessTitle: 'Is your organization ready?', readinessLead: 'Preview the technical and administrative readiness questions from the initiative’s week 12 form. Submission is coming soon; you can explore the questions now.',
    previewNote: 'Preview only. Answers are never sent or saved and disappear when you leave or refresh the page.',
    surveyGroups: ['Your organization', 'Technical readiness', 'Support & maintenance'], next: 'Next section', back: 'Previous', submit: 'Submission coming soon', preview: 'Survey preview', optional: 'Optional', multi: 'Choose all that apply', progress: 'Section', of: 'of',
    footer: 'Local Cloud / Fed3', returnHome: 'Back to home', alternatives: 'Explore alternatives', sourceLabel: 'Setup references',
  },
};

export type SurveyField = { id: string; label: Copy; type: 'text' | 'textarea' | 'radio' | 'checkbox'; options?: Copy[]; optional?: boolean; hasOther?: boolean };
export const cloudSurvey: SurveyField[][] = [
  [
    { id: 'organization', label: t('ما هو اسم المنشأة؟', 'What is the organization’s name?'), type: 'text' },
    { id: 'type', label: t('ما هي طبيعة عمل المنشأة؟', 'What type of organization is it?'), type: 'radio', options: [t('مدرسة / مؤسسة تعليمية', 'School / educational institution'), t('جمعية', 'Association'), t('مؤسسة (ربحية / غير ربحية)', 'Organization (for-profit / nonprofit)'), t('أخرى', 'Other')], hasOther: true },
    { id: 'contact', label: t('رقم التواصل / البريد الإلكتروني للمنشأة', 'Organization phone / email'), type: 'text' },
    { id: 'coordinator', label: t('المسمى الوظيفي واسم الشخص المسؤول عن التنسيق مع المبادرة', 'Name and job title of the initiative coordinator'), type: 'text' },
    { id: 'coordinator-contact', label: t('رقم ووسيلة التواصل مع مسؤول التنسيق', 'Coordinator contact number and method'), type: 'text' },
  ],
  [
    { id: 'network', label: t('هل تتوفر لدى المنشأة شبكة إنترنت؟', 'Does the organization have internet access?'), type: 'radio', options: [t('توجد شبكة محلية (Wi-Fi أو كوابل) + إنترنت مستقر + كهرباء مستقرة.', 'Local network (Wi-Fi or wired), stable internet and stable power.'), t('توجد شبكة وإنترنت ولكن الاستقرار متوسط.', 'A network and internet are available, with moderate stability.'), t('لا توجد شبكة محلية أو إنترنت مستقر.', 'No local network or stable internet.')] },
    { id: 'hardware', label: t('هل يتوفر لديكم جهاز حاسوب قديم أو غير مستعمل؟', 'Do you have an old or unused computer?'), type: 'radio', options: [t('نعم، يتوفر جهاز سليم ومخصص للتجربة.', 'Yes, a working device dedicated to the trial.'), t('نعم، يتوفر جهاز قديم يحتاج صيانة بسيطة أو تأهيل، مثل إضافة SSD أو زيادة الذاكرة.', 'Yes, an old device that needs minor repairs or upgrades, such as an SSD or more RAM.'), t('لا', 'No')] },
    { id: 'users', label: t('كم عدد المستخدمين / الموظفين المتوقع استخدامهم للسحابة؟', 'How many users / staff are expected to use the cloud?'), type: 'radio', options: [t('أقل من 10 مستخدمين', 'Fewer than 10 users'), t('10 إلى 25 مستخدمًا', '10 to 25 users'), t('أكثر من 25 مستخدمًا', 'More than 25 users')] },
    { id: 'needs', label: t('ما هي أسباب احتياجكم للسحابة المحلية؟', 'Why do you need local cloud storage?'), type: 'checkbox', options: [t('مشاركة الملفات والمستندات بأمان بين الموظفين', 'Secure file and document sharing between staff'), t('حماية خصوصية بيانات الطلاب / الموظفين', 'Protecting student / staff data privacy'), t('عمل نسخ احتياطية آمنة للبيانات الحساسة', 'Secure backups of sensitive data'), t('أرشفة الصور وفيديوهات الفعاليات والمشاريع', 'Archiving event and project photos and videos'), t('أخرى', 'Other')], hasOther: true },
  ],
  [
    { id: 'technical', label: t('هل يوجد موظف تقني أو شخص لديه معرفة بالحاسوب لمتابعة الجهاز بعد التركيب؟', 'Is there a technical staff member or someone with computer knowledge to maintain the device after setup?'), type: 'radio', options: [t('نعم', 'Yes'), t('لا', 'No')] },
    { id: 'training', label: t('هل ترغبون بالانضمام للورشات التدريبية المرافقة لتركيب واستخدام السحابة لكادر المؤسسة؟', 'Would your staff like to join the training workshops for setting up and using the cloud?'), type: 'radio', options: [t('نرغب بتدريب شخص أو شخصين فقط', 'Train one or two people only'), t('نعم، نرغب بتدريب كامل الكادر / الفريق', 'Train the whole staff / team'), t('غير مهتمين حاليًا بالتدريب', 'Not currently interested in training')] },
    { id: 'maintenance', label: t('هل المؤسسة مستعدة لإدارة وصيانة ومتابعة الخدمة السحابية بعد التركيب؟', 'Is the organization ready to manage, maintain and monitor the service after setup?'), type: 'radio', options: [t('نعم، موافقون وجاهزون.', 'Yes, willing and ready.'), t('نعم، ولكن نطلب مراجعة مسودة الاتفاقية أولًا.', 'Yes, but we would like to review the draft agreement first.'), t('لا', 'No')] },
    { id: 'notes', label: t('ملاحظات أو استفسارات', 'Comments or questions'), type: 'textarea', optional: true },
  ],
];

export const cloudNav = (locale: Locale) => ['cloud-overview', 'cloud-flow', 'cloud-steps', 'cloud-readiness'].map((id, i) => ({ id, label: cloudCopy[locale].nav[i], soon: i === 3 }));
