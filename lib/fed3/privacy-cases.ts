import type { Locale } from './config';

export type PrivacyCompany = 'meta' | 'google' | 'microsoft';
type Translation<T> = Record<Locale, T>;
type Source = { href: string; label: Translation<string> };
type CaseCopy = {
  title: string; summary: string; context: string; impact: string;
  status: string; region: string; date: string; stat: string; unit: string;
};
export type PrivacyCase = {
  id: string; company: PrivacyCompany; kind: 'case' | 'policy';
  image: string; imageAlt: Translation<string>; dateTime?: string;
  copy: Translation<CaseCopy>; sources: Source[];
};

export const privacyReviewedOn = '2026-11-15';
export const companyNames: Record<PrivacyCompany, Translation<string>> = {
  meta: { ar: 'ميتا', en: 'Meta' },
  google: { ar: 'جوجل', en: 'Google' },
  microsoft: { ar: 'مايكروسوفت', en: 'Microsoft' },
};

export const privacySources = {
  whatsapp: 'https://www.dataprotection.ie/en/news-media/press-releases/data-protection-commission-announces-decision-whatsapp-inquiry',
  instagram: 'https://dataprotection.ie/en/news-media/press-releases/data-protection-commission-announces-decision-instagram-inquiry',
  fines: 'https://dataprotection.ie/en/dpc-guidance/decisions/fines',
  newMexico: 'https://nmdoj.gov/press-release/the-new-mexico-department-of-justice-secures-another-landmark-victory-against-big-tech-with-historic-25-billion-penalty-against-facebook/',
  metaFiling: 'https://www.sec.gov/Archives/edgar/data/1326801/000162828026066773/meta-20260930.htm',
  facebookFTC: 'https://www.ftc.gov/news-events/news/press-releases/2019/07/ftc-imposes-5-billion-penalty-sweeping-new-privacy-restrictions-facebook',
  googleLocation: 'https://oag.ca.gov/news/press-releases/attorney-general-bonta-announces-93-million-settlement-regarding-google%E2%80%99s',
  xbox: 'https://www.ftc.gov/legal-library/browse/cases-proceedings/1923258-microsoft-corporation-us-v',
  metaAI: 'https://about.fb.com/news/2025/04/making-ai-work-harder-for-europeans/',
  gemini: 'https://support.google.com/gemini/answer/13594961?hl=en',
  copilot: 'https://support.microsoft.com/en-us/privacy/microsoft-copilot/privacy-controls',
  transfers: 'https://dataprotection.ie/en/dpc-guidance/decisions/inquiry-concerning-data-transfers-eueea-us-meta-platforms-ireland-limited-its-facebook-service',
  metaPolicy: 'https://www.facebook.com/privacy/policy/',
  metaPolicySnapshot: 'https://storage.googleapis.com/transparency_hub_documents/675211559efd527760c64413/privacy_policy/1787558446.pdf',
  googlePolicy: 'https://policies.google.com/privacy?hl=en',
  microsoftPolicy: 'https://www.microsoft.com/en-us/privacy/privacystatement',
} as const;

export const privacyCases: PrivacyCase[] = [
  {
    id: 'meta-new-mexico', company: 'meta', kind: 'case', image: '/privacy/meta-court.webp', dateTime: '2026-10-21',
    imageAlt: { ar: 'رسم تحريري لشعار ميتا خلف ملف قضائي', en: 'Editorial illustration of Meta behind a court file' },
    copy: {
      ar: { title: 'وعدوا المستخدمين بالتحكّم. المحكمة وجدت [[تضليلاً]].', summary: 'أمرت محكمة في نيو مكسيكو ميتا بدفع [[25 مليار دولار]]، بعد أن وجدت هيئة محلفين 43,899,725 مخالفة لقانون حماية المستهلك، في قضية شملت تصريحات الشركة عن خصوصية البيانات ووصول أطراف أخرى إليها.', context: 'صدر الحكم في 21 أكتوبر 2026. ميتا أعلنت في إفصاحها المالي أنها تنوي الاستئناف؛ لذلك لا نعرض المبلغ كغرامة سُدّدت أو حكم حُسم استئنافه.', impact: 'التحكّم ببياناتك يحتاج إلى صلاحيات فعلية وحدود لوصول الآخرين إليها، إلى جانب الوعود المكتوبة.', status: 'حكم قضائي · ميتا تنوي الاستئناف', region: 'نيو مكسيكو، الولايات المتحدة', date: '21 أكتوبر 2026', stat: '$25B', unit: 'عقوبة مدنية بحكم قضائي' },
      en: { title: 'Users were promised control. The court found [[deception]].', summary: 'A New Mexico court ordered Meta to pay [[$25 billion]] after a jury found 43,899,725 consumer protection violations in a case that included representations about privacy and third-party access to data.', context: 'The order was issued on October 21, 2026. Meta says in its financial filing that it intends to appeal. This is not presented as a paid penalty or a judgment whose appeal has been resolved.', impact: 'Control over your data needs enforceable permissions and limits on access alongside written promises.', status: 'Court order · Meta intends to appeal', region: 'New Mexico, United States', date: 'October 21, 2026', stat: '$25B', unit: 'court-ordered civil penalty' },
    },
    sources: [
      { href: privacySources.newMexico, label: { ar: 'بيان وزارة العدل', en: 'Justice Department statement' } },
      { href: privacySources.metaFiling, label: { ar: 'إفصاح ميتا والاستئناف', en: 'Meta filing and intended appeal' } },
    ],
  },
  {
    id: 'whatsapp-transparency', company: 'meta', kind: 'case', image: '/privacy/whatsapp-transparency.webp', dateTime: '2021-09-02',
    imageAlt: { ar: 'شعار واتساب مع ملف بيانات وعدسة توضيحية', en: 'WhatsApp symbol with a data file and magnifying glass' },
    copy: {
      ar: { title: 'واتساب: [[225 مليون يورو]] بسبب غموض استخدام البيانات.', summary: 'فرضت هيئة حماية البيانات الأيرلندية غرامة [[225 مليون يورو]] على واتساب بسبب مخالفة التزامات الشفافية تجاه المستخدمين وغير المستخدمين، بما يشمل شرح معالجة المعلومات بين واتساب وشركات فيسبوك الأخرى.', context: 'أُعلن القرار في 2 سبتمبر 2021. يسجل جدول الهيئة المحدّث في 11 نوفمبر 2026 الغرامة باعتبارها قيد الاستئناف. القضية تخص وضوح الإفصاح عن معالجة البيانات؛ لا تثبت قراءة الرسائل المشفّرة.', impact: 'تحقّق من البيانات التي تجمعها الخدمة وما تشاركه مع شركات المجموعة، إضافة إلى حماية محتوى الرسائل.', status: 'غرامة تنظيمية · قيد الاستئناف', region: 'أيرلندا / الاتحاد الأوروبي', date: '2 سبتمبر 2021', stat: '€225M', unit: 'غرامة عن مخالفات الشفافية' },
      en: { title: 'WhatsApp: [[€225 million]] over data transparency.', summary: 'Ireland’s Data Protection Commission fined WhatsApp [[€225 million]] for transparency violations affecting users and non-users, including disclosures about information processing between WhatsApp and other Facebook companies.', context: 'Announced September 2, 2021. The regulator’s table updated November 11, 2026 lists the fine as pending appeal. This concerns transparency about processing, not a finding that encrypted messages were read.', impact: 'Check what data a service collects and shares across its corporate group alongside the protection of message content.', status: 'Regulatory fine · pending appeal', region: 'Ireland / European Union', date: 'September 2, 2021', stat: '€225M', unit: 'fine for transparency violations' },
    },
    sources: [
      { href: privacySources.whatsapp, label: { ar: 'القرار الرسمي', en: 'Regulator announcement' } },
      { href: privacySources.fines, label: { ar: 'حالة الاستئناف', en: 'Appeal status' } },
    ],
  },
  {
    id: 'instagram-children', company: 'meta', kind: 'case', image: '/privacy/instagram-children.webp', dateTime: '2022-09-15',
    imageAlt: { ar: 'شعار إنستغرام وبطاقة بيانات تواصل خلف درع', en: 'Instagram symbol and a contact record behind a shield' },
    copy: {
      ar: { title: 'إنستغرام: [[بيانات تواصل أطفال]] ظهرت للعامة.', summary: 'فرضت هيئة حماية البيانات الأيرلندية غرامة [[405 ملايين يورو]] على ميتا بشأن بيانات أطفال على إنستغرام. شمل التحقيق إظهار بريد الأطفال أو أرقامهم في الحسابات التجارية، وجعل حسابات أطفال شخصية عامة افتراضياً.', context: 'اعتُمد القرار في 2 سبتمبر وأُعلن في 15 سبتمبر 2022. الغرامة مسجلة قيد الاستئناف في جدول الهيئة المحدّث في 11 نوفمبر 2026. يتناول القرار ممارسات محدّدة آنذاك.', impact: 'راجع ظهور رقم الهاتف والبريد ونوع الحساب وإعداد الجمهور، خصوصاً لحسابات الأطفال.', status: 'غرامة تنظيمية · قيد الاستئناف', region: 'أيرلندا / الاتحاد الأوروبي', date: '15 سبتمبر 2022', stat: '€405M', unit: 'غرامة بشأن بيانات الأطفال' },
      en: { title: 'Instagram: [[children’s contact details]] exposed publicly.', summary: 'Ireland’s Data Protection Commission imposed a [[€405 million]] fine on Meta over children’s data on Instagram. The inquiry covered public email addresses or phone numbers in business accounts and children’s personal accounts set to public by default.', context: 'The decision was adopted September 2 and announced September 15, 2022. The regulator’s table updated November 11, 2026 lists the fine as pending appeal. It concerns specific practices at that time.', impact: 'Review phone and email visibility, account type, and audience settings, particularly for children’s accounts.', status: 'Regulatory fine · pending appeal', region: 'Ireland / European Union', date: 'September 15, 2022', stat: '€405M', unit: 'fine concerning children’s data' },
    },
    sources: [
      { href: privacySources.instagram, label: { ar: 'القرار الرسمي', en: 'Regulator announcement' } },
      { href: privacySources.fines, label: { ar: 'حالة الاستئناف', en: 'Appeal status' } },
    ],
  },
  {
    id: 'google-location', company: 'google', kind: 'case', image: '/privacy/google-location.webp', dateTime: '2023-09-14',
    imageAlt: { ar: 'رسم تحريري لدبوس موقع جوجل ومسار تتبّع', en: 'Editorial illustration of a Google location pin and tracking trail' },
    copy: {
      ar: { title: 'أوقفت سجلّ المواقع. هل توقّف [[التتبّع]]؟', summary: 'أعلنت كاليفورنيا تسوية بقيمة [[93 مليون دولار]] مع جوجل. قالت الشكوى إن الشركة واصلت جمع الموقع من مصادر أخرى بعد إيقاف إعداد "سجلّ المواقع"، وضلّلت المستخدمين بشأن استخدامه.', context: 'هذه تسوية لاتهامات عن ممارسات سابقة، أُعلنت في سبتمبر 2023. شملت شروطاً لزيادة وضوح إعدادات الموقع والإفصاح عن استخدامه في تخصيص الإعلانات.', impact: 'راجع إعدادات النشاط وأذونات الموقع معاً؛ إيقاف إعداد واحد قد لا يغطي كل مصادر البيانات.', status: 'تسوية اتهامات', region: 'كاليفورنيا، الولايات المتحدة', date: '14 سبتمبر 2023', stat: '$93M', unit: 'قيمة التسوية المعلنة' },
      en: { title: 'Location History was off. Was [[tracking]]?', summary: 'California announced a [[$93 million]] settlement with Google. The complaint alleged that Google continued collecting location through other sources after users turned off Location History, and misled them about its use.', context: 'Announced in September 2023, this settlement addressed allegations about past practices. Its terms required clearer location settings and disclosures about advertising uses.', impact: 'Review activity settings and location permissions together. One switch may not cover every source of data.', status: 'Settlement of allegations', region: 'California, United States', date: 'September 14, 2023', stat: '$93M', unit: 'announced settlement amount' },
    },
    sources: [{ href: privacySources.googleLocation, label: { ar: 'وزارة العدل في كاليفورنيا', en: 'California Department of Justice' } }],
  },
  {
    id: 'microsoft-xbox', company: 'microsoft', kind: 'case', image: '/privacy/microsoft-xbox.webp', dateTime: '2023-06-09',
    imageAlt: { ar: 'رسم تحريري ليد تحكّم ألعاب وملف بيانات طفل', en: 'Editorial illustration of a game controller and a child’s data record' },
    copy: {
      ar: { title: 'حساب للّعب، و[[بيانات أطفال]] جُمعت قبل موافقة الأهل.', summary: 'تسوية بقيمة [[20 مليون دولار]] أنهت اتهامات FTC لمايكروسوفت بجمع معلومات أطفال دون 13 عاماً عند التسجيل في Xbox، قبل إبلاغ الأهل والحصول على موافقتهم، والاحتفاظ بها بصورة غير قانونية.', context: 'يتضمن ملف القضية أمراً قضائياً بتاريخ 9 يونيو 2023، مع التزامات بحماية بيانات الأطفال. هذه القضية تخص ممارسات التسجيل والاحتفاظ بالبيانات في Xbox.', impact: 'راجع موافقة الأهل، ومدة الاحتفاظ، والبيانات التي يجمعها حساب الطفل قبل إنشاء الحساب.', status: 'تسوية وأمر قضائي', region: 'الولايات المتحدة', date: '9 يونيو 2023', stat: '$20M', unit: 'عقوبة مدنية ضمن التسوية' },
      en: { title: 'A gaming account. [[Children’s data]] collected before parental consent.', summary: 'A [[$20 million]] settlement resolved FTC charges that Microsoft collected personal information from children under 13 signing up for Xbox before notifying parents and obtaining consent, and illegally retained it.', context: 'The case file includes a court order dated June 9, 2023, with requirements to protect children’s data. The case concerns Xbox registration and retention practices.', impact: 'Check parental consent, retention periods, and the information collected before creating a child’s account.', status: 'Settlement and court order', region: 'United States', date: 'June 9, 2023', stat: '$20M', unit: 'civil penalty in the settlement' },
    },
    sources: [{ href: privacySources.xbox, label: { ar: 'ملف القضية لدى FTC', en: 'FTC case and court order' } }],
  },
  {
    id: 'facebook-ftc', company: 'meta', kind: 'case', image: '/privacy/meta-ftc.webp', dateTime: '2019-07-24',
    imageAlt: { ar: 'رسم تحريري لقفل خصوصية وملف فيسبوك', en: 'Editorial illustration of a privacy lock and Facebook file' },
    copy: {
      ar: { title: '[[5 مليارات دولار]] وراء وعود الخصوصية في فيسبوك.', summary: 'أعلنت FTC غرامة بقيمة [[5 مليارات دولار]] لتسوية اتهامات بأن فيسبوك خالفت أمر الخصوصية لعام 2012، عبر خداع المستخدمين بشأن قدرتهم على التحكّم بمعلوماتهم الشخصية.', context: 'أُعلنت التسوية في يوليو 2019. وتوضح ميتا في إفصاحها المالي أنها دفعت الغرامة في أبريل 2020 عند دخول الأمر المعدّل حيّز التنفيذ.', impact: 'اقرأ كيف تصل التطبيقات المرتبطة إلى بياناتك، وما تسمح به إعدادات المشاركة فعلياً.', status: 'تسوية · الغرامة دُفعت في 2020', region: 'الولايات المتحدة', date: '24 يوليو 2019', stat: '$5B', unit: 'غرامة ضمن تسوية FTC' },
      en: { title: '[[Five billion dollars]] behind Facebook’s privacy promises.', summary: 'The FTC announced a [[$5 billion]] penalty to settle charges that Facebook violated its 2012 privacy order by deceiving users about their ability to control personal information.', context: 'The settlement was announced in July 2019. Meta’s financial filing confirms that it paid the penalty in April 2020 when the modified order took effect.', impact: 'Check how connected apps access your data and what your sharing settings actually permit.', status: 'Settlement · penalty paid in 2020', region: 'United States', date: 'July 24, 2019', stat: '$5B', unit: 'penalty in the FTC settlement' },
    },
    sources: [
      { href: privacySources.facebookFTC, label: { ar: 'قرار FTC', en: 'FTC announcement' } },
      { href: privacySources.metaFiling, label: { ar: 'إفصاح ميتا عن السداد', en: 'Meta’s payment disclosure' } },
    ],
  },
  {
    id: 'meta-ai', company: 'meta', kind: 'policy', image: '/privacy/meta-ai.webp',
    imageAlt: { ar: 'رسم تحريري لمنشورات ومحادثة تصل إلى نموذج ذكاء اصطناعي', en: 'Editorial illustration of public posts and an AI conversation' },
    copy: {
      ar: { title: 'منشوراتك العامة وكلامك مع [[Meta AI]] قد يدخلان التدريب.', summary: 'تعلن ميتا استخدام المحتوى العام للبالغين وتفاعلاتهم مع [[Meta AI]] لتدريب نماذجها في الاتحاد الأوروبي، مع إمكانية الاعتراض هناك.', context: 'تقول ميتا إنها لا تستخدم الرسائل الخاصة بين الأصدقاء والعائلة، إلا إذا اخترت أنت أو شخص في المحادثة مشاركتها مع أدواتها للذكاء الاصطناعي. أوضحت هذا الاستثناء في 27 مارس 2026.', impact: 'المحادثة مع Meta AI تختلف عن مراسلة صديق. تجنّب إدخال أسرارك أو مشاركة رسائل الآخرين مع المساعد.', status: 'استخدام معلَن من الشركة', region: 'إعلان موجّه للاتحاد الأوروبي', date: 'توضيح بتاريخ 27 مارس 2026', stat: 'AI', unit: 'المحتوى العام + تفاعلات المساعد' },
      en: { title: 'Public posts and your [[Meta AI]] chats can become training data.', summary: 'Meta says it uses adults’ public content and interactions with [[Meta AI]] to train its models in the EU, where users can object.', context: 'Meta says private messages with friends and family are excluded unless you or someone in the chat chooses to share them with its AI features. It clarified this exception on March 27, 2026.', impact: 'Chatting with Meta AI differs from messaging a friend. Keep secrets and other people’s private messages out of the assistant.', status: 'Company-disclosed use', region: 'Announcement for the European Union', date: 'Clarified March 27, 2026', stat: 'AI', unit: 'public content + assistant interactions' },
    },
    sources: [{ href: privacySources.metaAI, label: { ar: 'إعلان ميتا وتوضيح الرسائل', en: 'Meta announcement and messages exception' } }],
  },
  {
    id: 'google-gemini', company: 'google', kind: 'policy', image: '/privacy/google-gemini.webp',
    imageAlt: { ar: 'رسم تحريري لمحادثة Gemini وعين ترمز إلى المراجعة البشرية', en: 'Editorial illustration of a Gemini chat and a human-review eye' },
    copy: {
      ar: { title: 'حذفت محادثة Gemini؟ بعض النسخ قد تبقى [[3 سنوات]].', summary: 'توضح جوجل أن بعض محادثات Gemini تخضع [[لمراجعة بشرية]]. النسخ التي راجعها البشر قد تُحفظ حتى ثلاث سنوات، ولا تُحذف عند حذف نشاطك.', context: 'تقول جوجل إنها تفصل هذه المحادثات عن حسابك قبل إرسالها لمزوّدي الخدمة. إيقاف "الاحتفاظ بالنشاط" يوقف مراجعة المحادثات المستقبلية لتحسين الخدمة، مع استثناءات للأمان والملاحظات التي ترسلها.', impact: 'تجنّب المعلومات السرية، وراجع إعداد الاحتفاظ بالنشاط والمحادثات المؤقتة قبل مشاركة ملفات حساسة.', status: 'بند في إشعار الخصوصية', region: 'تطبيقات Gemini للأفراد', date: 'إشعار محدّث في 26 أكتوبر 2026', stat: '3', unit: 'سنوات كحد أقصى للنسخ المراجَعة' },
      en: { title: 'Deleted a Gemini chat? Reviewed copies may remain for [[3 years]].', summary: 'Google explains that some Gemini chats undergo [[human review]]. Reviewed copies can be retained for up to three years and are not deleted when you delete your activity.', context: 'Google says it disconnects these chats from your account before sending them to service providers. Turning off Keep Activity stops future review for service improvement, with exceptions for safety and feedback you submit.', impact: 'Keep confidential information out, and review Keep Activity and temporary chats before sharing sensitive files.', status: 'Privacy notice provision', region: 'Consumer Gemini Apps', date: 'Notice updated October 26, 2026', stat: '3', unit: 'years maximum for reviewed copies' },
    },
    sources: [{ href: privacySources.gemini, label: { ar: 'إشعار خصوصية Gemini', en: 'Gemini Apps Privacy Hub' } }],
  },
  {
    id: 'microsoft-copilot', company: 'microsoft', kind: 'policy', image: '/privacy/microsoft-copilot.webp',
    imageAlt: { ar: 'رسم تحريري لمحادثة Copilot تتصل بملفات تخصيص الإعلانات', en: 'Editorial illustration of a Copilot chat connected to advertising profiles' },
    copy: {
      ar: { title: 'كلامك مع Copilot قد يساعد على [[تخصيص الإعلانات]].', summary: 'توضح مايكروسوفت أن الإعلانات المخصّصة في Copilot قد تستخدم [[سجلّ المحادثات والذكريات المحفوظة]] وبيانات أخرى اخترت مشاركتها، وأن محادثاتك قد تخصّص تجربتك في Bing وEdge وMSN.', context: 'هذا التوضيح يخص التطبيق الجديد بحساب شخصي، ولا يشمل حسابات العمل أو الدراسة. إعداد التجربة المشتركة منفصل عن إعداد تخصيص الإعلانات. وتقول الشركة إنها لا تعرض إعلانات مخصّصة لمن هم دون 18 عاماً.', impact: 'راجع إعدادَي "التجربة المشتركة" و"السماح بتخصيص الإعلانات"؛ إيقاف أحدهما لا يوقف الآخر.', status: 'استخدام معلَن وإعدادات منفصلة', region: 'Copilot الجديد بحساب شخصي', date: 'وثائق الإصدار المتاح من أغسطس 2026', stat: 'ADS', unit: 'المحادثات قد تُستخدم للتخصيص' },
      en: { title: 'Your Copilot conversations may help [[personalize ads]].', summary: 'Microsoft says personalized Copilot ads may use [[chat history and saved memories]] plus other data you choose to share. Copilot chats can also personalize your Bing, Edge, and MSN experiences.', context: 'This covers the new app with a personal account, excluding work and school accounts. Shared experiences and ad personalization have separate controls. Microsoft says users under 18 do not receive personalized ads.', impact: 'Review both One shared experience and Allow ads personalization. Switching off one does not switch off the other.', status: 'Disclosed use with separate controls', region: 'New Copilot app, personal accounts', date: 'Documentation for the August 2026 release', stat: 'ADS', unit: 'chats may inform personalization' },
    },
    sources: [{ href: privacySources.copilot, label: { ar: 'ضوابط خصوصية Copilot', en: 'Copilot privacy controls and choices' } }],
  },
  {
    id: 'meta-transfers', company: 'meta', kind: 'case', image: '/privacy/meta-transfers.webp', dateTime: '2023-05-12',
    imageAlt: { ar: 'رسم تحريري لانتقال البيانات بين أوروبا والولايات المتحدة', en: 'Editorial illustration of data transfers between Europe and the United States' },
    copy: {
      ar: { title: 'بياناتك تعبر الحدود. [[أيّ قانون يحميها]]؟', summary: 'في مايو 2023، فرضت هيئة حماية البيانات الأيرلندية غرامة [[1.2 مليار يورو]] على ميتا، بعد قرار بشأن مخالفة نقل بيانات مستخدمي فيسبوك من الاتحاد الأوروبي والمنطقة الاقتصادية الأوروبية إلى الولايات المتحدة.', context: 'هذا قرار تنظيمي عن عمليات نقل محدّدة آنذاك. لا يعني أن كل نقل دولي للبيانات مخالف، ولا يصف وحده الوضع القانوني الحالي لكل خدمات ميتا.', impact: 'اسأل عن مكان تخزين بياناتك، ومن يستطيع الوصول إليها، والقانون الذي يحكم هذا الوصول. هذه أسئلة السيادة الرقمية.', status: 'قرار تنظيمي بتاريخ 2023', region: 'الاتحاد الأوروبي ← الولايات المتحدة', date: '12 مايو 2023', stat: '€1.2B', unit: 'غرامة في قرار هيئة حماية البيانات' },
      en: { title: 'Your data crosses borders. [[Which law protects it]]?', summary: 'In May 2023, Ireland’s Data Protection Commission imposed a [[€1.2 billion]] fine on Meta over unlawful transfers of Facebook users’ data from the EU/EEA to the United States.', context: 'This regulatory decision concerns specific transfers at that time. It does not mean every international transfer is unlawful or establish the current legal position of every Meta service.', impact: 'Ask where data is stored, who can access it, and which law governs that access. These are questions of digital sovereignty.', status: 'Regulatory decision from 2023', region: 'EU/EEA to the United States', date: 'May 12, 2023', stat: '€1.2B', unit: 'fine in the DPC decision' },
    },
    sources: [{ href: privacySources.transfers, label: { ar: 'قرار هيئة حماية البيانات', en: 'Data Protection Commission decision' } }],
  },
];

type PolicyCopy = { title: string; approach: string; concern: string; control: string; scope: string };
export const privacyTeasers: Record<string, Translation<{ product: string; title: string; metric: string }>> = {
  'meta-new-mexico': { ar: { product: 'فيسبوك', title: 'تضليل المستخدمين بشأن [[خصوصية بياناتهم]].', metric: 'مليار دولار · حكم قضائي' }, en: { product: 'Facebook', title: 'Users misled about [[their data privacy]].', metric: 'billion dollars · court order' } },
  'whatsapp-transparency': { ar: { product: 'واتساب', title: 'استخدام بياناتك، [[بلا شرح واضح]].', metric: 'مليون يورو · غرامة قيد الاستئناف' }, en: { product: 'WhatsApp', title: 'Your data use, [[without clear disclosure]].', metric: 'million euros · fine under appeal' } },
  'instagram-children': { ar: { product: 'إنستغرام', title: '[[بيانات تواصل أطفال]] ظهرت للعامة.', metric: 'مليون يورو · غرامة قيد الاستئناف' }, en: { product: 'Instagram', title: '[[Children’s contact details]] made public.', metric: 'million euros · fine under appeal' } },
  'google-location': { ar: { product: 'جوجل', title: 'أوقفوا سجلّ المواقع. [[واستمرّ الجمع]].', metric: 'مليون دولار · تسوية اتهامات' }, en: { product: 'Google', title: 'Location History off. [[Collection continued]].', metric: 'million dollars · settlement' } },
  'microsoft-xbox': { ar: { product: 'مايكروسوفت / Xbox', title: '[[بيانات أطفال]] قبل موافقة الأهل.', metric: 'مليون دولار · تسوية وأمر قضائي' }, en: { product: 'Microsoft / Xbox', title: '[[Children’s data]] before parental consent.', metric: 'million dollars · settlement and order' } },
  'facebook-ftc': { ar: { product: 'فيسبوك', title: 'وعود بالتحكّم، [[وخداع بشأن الخصوصية]].', metric: 'مليارات دولار · غرامة دُفعت' }, en: { product: 'Facebook', title: 'Promises of control. [[Privacy deception]].', metric: 'billion dollars · penalty paid' } },
  'meta-transfers': { ar: { product: 'فيسبوك / ميتا', title: 'نقل بيانات لأمريكا [[خالف قواعد الحماية]].', metric: 'مليار يورو · قرار تنظيمي' }, en: { product: 'Facebook / Meta', title: 'US data transfers [[breached safeguards]].', metric: 'billion euros · regulatory decision' } },
};

export const policyPreviews: Record<PrivacyCompany, Translation<{ title: string; from: string; to: string; note: string }> & { image: string; example: string }> = {
  meta: { image: '/privacy/meta-ai.webp', example: 'meta-ai', ar: { title: '[[المحتوى العام]] قد يدرّب الذكاء الاصطناعي.', from: 'منشوراتك العامة', to: 'تدريب AI', note: 'المراسلات الخاصة لها استثناءات محدّدة.' }, en: { title: '[[Public content]] may train AI.', from: 'Public posts', to: 'AI training', note: 'Private messages have specific exceptions.' } },
  google: { image: '/privacy/google-gemini.webp', example: 'google-gemini', ar: { title: 'بعض محادثات Gemini تبقى [[حتى 3 سنوات]].', from: 'محادثات مختارة', to: 'مراجعة بشرية', note: 'النسخ المراجَعة لا تُحذف مع نشاطك.' }, en: { title: 'Some Gemini chats stay [[up to 3 years]].', from: 'Selected chats', to: 'Human review', note: 'Reviewed copies survive activity deletion.' } },
  microsoft: { image: '/privacy/microsoft-copilot.webp', example: 'microsoft-copilot', ar: { title: 'محادثات Copilot قد تخصّص [[إعلاناتك]].', from: 'محادثاتك', to: 'تخصيص الإعلانات', note: 'في النسخة الشخصية، حسب إعداداتك.' }, en: { title: 'Copilot chats may personalize [[your ads]].', from: 'Your chats', to: 'Ad personalization', note: 'Personal accounts, depending on settings.' } },
};

export function privacyFileHref(locale: Locale, id: string) { return `/${locale}/privacy-files/${id}/`; }

export const privacyPolicies: { company: PrivacyCompany; copy: Translation<PolicyCopy>; sources: Source[] }[] = [
  {
    company: 'meta',
    copy: {
      ar: { title: 'نشاطك يدخل في التخصيص، والمحتوى العام قد يدخل التدريب.', approach: 'تذكر نسخة يوليو 2026 من السياسة استخدام معلومات عبر منتجات ميتا وأجهزتك لتخصيص المحتوى والإعلانات. وتوضح الشركة في إعلان منفصل استخدام المحتوى العام وتفاعلات Meta AI للتدريب.', concern: 'من منظور السيادة الرقمية، اسأل عن حدود الجمع بين الخدمات، وعن مشاركة رسائلك مع الذكاء الاصطناعي بواسطة شخص آخر في المحادثة.', control: 'راجع تفضيلات الإعلانات ونشاطك خارج ميتا، وافصل الرسائل الخاصة عن تفاعلات المساعد. يتاح الاعتراض على التدريب في الاتحاد الأوروبي وفق إعلان الشركة.', scope: 'قُرئت نسخة السياسة المؤرخة 23 يوليو 2026 وإعلان AI المحدّث في مارس 2026. تعذّر جلب رابط السياسة الحي مباشرة؛ النسخة المقروءة مرفقة.' },
      en: { title: 'Activity informs personalization. Public content may inform training.', approach: 'The July 2026 policy snapshot describes using information across Meta products and devices to personalize content and ads. A separate company announcement describes training with public content and Meta AI interactions.', concern: 'For digital sovereignty, ask about the limits on combining services and another participant sharing your messages with AI.', control: 'Review ad preferences and off-Meta activity. Keep private messages separate from assistant interactions. EU users can object to training as described in Meta’s announcement.', scope: 'Reviewed the July 23, 2026 policy snapshot and the AI announcement clarified in March 2026. Direct retrieval of the live policy was unavailable; the reviewed snapshot is linked.' },
    },
    sources: [
      { href: privacySources.metaPolicy, label: { ar: 'السياسة الرسمية', en: 'Official policy' } },
      { href: privacySources.metaPolicySnapshot, label: { ar: 'نسخة يوليو 2026 المقروءة', en: 'Reviewed July 2026 snapshot' } },
      { href: privacySources.metaAI, label: { ar: 'تفاصيل تدريب AI', en: 'AI training details' } },
    ],
  },
  {
    company: 'google',
    copy: {
      ar: { title: 'بيانات استخدام وموقع، ومعالجة قد تحصل خارج بلدك.', approach: 'تصف سياسة جوجل جمع نشاط الاستخدام ومعلومات الأجهزة والموقع بحسب الخدمة والإعدادات، واستخدام البيانات في التخصيص والإعلانات. وتذكر معالجة المعلومات على خوادم قد تقع خارج بلد إقامتك.', concern: 'من منظور السيادة الرقمية، تحتاج إلى معرفة مسار البيانات عبر الخدمات ومكان معالجتها. وفي Gemini، حذف النشاط لا يحذف النسخ التي خضعت للمراجعة البشرية فوراً.', control: 'راجع عناصر التحكّم بالنشاط والإعلانات كلّاً على حدة، وراجع احتفاظ Gemini بالنشاط. تقول جوجل إن محادثات Gemini لا تُستخدم حالياً لعرض الإعلانات.', scope: 'السياسة السارية من 16 أكتوبر 2026 وإشعار Gemini المحدّث في 26 أكتوبر 2026. التفاصيل تختلف بين المنتجات والحسابات.' },
      en: { title: 'Usage and location data, with processing beyond your country.', approach: 'Google’s policy describes collecting usage activity, device information, and location depending on the service and settings, and using data for personalization and ads. Processing may take place on servers outside your country.', concern: 'Digital sovereignty requires understanding data flows between services and where processing happens. In Gemini, deleting activity does not immediately delete human-reviewed copies.', control: 'Review activity and advertising controls separately, alongside Gemini’s Keep Activity. Google says Gemini chats are not currently used to show ads.', scope: 'Policy effective October 16, 2026; Gemini notice updated October 26, 2026. Details vary by product and account.' },
    },
    sources: [
      { href: privacySources.googlePolicy, label: { ar: 'سياسة جوجل', en: 'Google Privacy Policy' } },
      { href: privacySources.gemini, label: { ar: 'إشعار Gemini', en: 'Gemini privacy notice' } },
    ],
  },
  {
    company: 'microsoft',
    copy: {
      ar: { title: 'سياسة عامة واسعة، والتفاصيل تتغيّر حسب المنتج والحساب.', approach: 'تذكر مايكروسوفت جمع بيانات الاستخدام والتفاعل بحسب المنتج والإعدادات، وإمكان تخزين البيانات ومعالجتها في منطقتك والولايات المتحدة ودول أخرى تعمل فيها الشركة أو مزوّدوها.', concern: 'من منظور السيادة الرقمية، راجع بلد المعالجة وصلاحيات الوصول. وفي Copilot الشخصي، انتبه لربط المحادثات بالتخصيص والإعلانات عبر إعدادات منفصلة.', control: 'راجع لوحة الخصوصية، وأذونات المنتج، وإعدادات Copilot. وثائق الحسابات الشخصية تختلف عن شروط حسابات المؤسسات والعمل والتعليم.', scope: 'بيان الخصوصية المحدّث في نوفمبر 2026 ووثائق Copilot الجديد. لا نعمّم ممارسات النسخة الشخصية على بيانات المؤسسات.' },
      en: { title: 'A broad policy, with details that depend on product and account.', approach: 'Microsoft describes collecting usage and interaction data according to the product and settings. Data may be stored and processed in your region, the US, and other countries where Microsoft or its providers operate.', concern: 'For digital sovereignty, review processing locations and access permissions. In personal Copilot, check how conversations inform personalization and advertising through separate settings.', control: 'Review the privacy dashboard, product permissions, and Copilot settings. Personal account documentation differs from work, school, and enterprise terms.', scope: 'Privacy statement updated November 2026 and documentation for the new Copilot app. Personal account practices are not generalized to enterprise data.' },
    },
    sources: [
      { href: privacySources.microsoftPolicy, label: { ar: 'بيان خصوصية مايكروسوفت', en: 'Microsoft Privacy Statement' } },
      { href: privacySources.copilot, label: { ar: 'ضوابط Copilot', en: 'Copilot controls' } },
    ],
  },
];
