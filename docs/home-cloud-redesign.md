# صفحة السحابة المحلية

المصدر: [Home-cloud guide](https://docs.google.com/document/d/1CqsiVg5j9hzYkPLR7GyGW_tYCFayS0zrEDtq1Sx0PC4/edit)، داخل مخرجات الأسبوع 14. روجع النص الأصلي وبنية الدليل عبر Google Drive؛ النسخة النصية المرجعية في `home-cloud-guide-source.txt`.

تعرض الصفحة رحلة من إعادة استخدام حاسوب إلى تشغيل Nextcloud، ثم الوصول للملفات من الحاسوب والهاتف. النص الأساسي عربي وإنجليزي، مع أقسام للفكرة والخدمات وطريقة الوصول ومتطلبات الجهاز وخطوات المسؤول والاستخدام اليومي والمساعدة. تبقى معاينة الجاهزية دون إرسال أو حفظ للإجابات.

توزع الافتتاحية النص والصورة في عمودين على الكمبيوتر، مع إبقاء الصورة الأصلية كاملة باستخدام `object-fit: contain` وارتفاع يناسب مجال العرض. تظهر الشروحات الثلاثة أسفلها. على الهاتف تتتابع المقدمة والصورة والشروحات في صفوف قابلة للقراءة دون قص أو تمرير أفقي.

جدول العتاد ينسب أرقام 2 و4 GB RAM والتخزين إلى تجربة البداية في دليل المبادرة، ويبيّن أن الاحتياج يتغير حسب الاستخدام. يعرض قسم المسؤول مسار Linux وSnap الوارد في الدليل، مع روابط التوثيق الرسمي. لا يعرض الوصول من الخارج أو التخزين المحلي كضمان للخصوصية. وتُذكر مسؤولية الإدارة والنسخ والاستعادة والصلاحيات.

استُخدمت الصورتان المرفقتان كمرجع للفكرة والأسلوب: رسم إعادة استخدام الحاسوب، وصورة الخادم البنفسجي مع الأجهزة. وُلد مشهد موحد من المرجعين بأداة ImageGen المدمجة، ثم وُلدت منه صورة استخدام يومي بنفس الأسلوب. الأصول في:

- `public/cloud/home-cloud-journey-v1.png` و`public/cloud/home-cloud-journey-v1.webp`.
- `public/cloud/home-cloud-daily-v1.png` و`public/cloud/home-cloud-daily-v1.webp`.

الصور توضيحية، والنصوص والعناوين وروابط الدليل عناصر HTML مستقلة. تستخدم الصور الكحلي `#062759` والبرتقالي `#F16E00` والبنفسجي `#562474` على أرضية بيج دافئة. تُحفظ الصور الأصلية، وتُستخدم نسخ WebP المحسنة في الصفحة.

## وصف توليد المشهد الموحد

Use case: stylized-concept. Asset type: website hero illustration for Fed3 Home-Cloud. Use reference 1 ONLY for its narrative: repurpose an old PC, set up a local home cloud, access files from a phone or laptop away from home. Use reference 2 for its premium minimal 3D material language and purple stacked personal server, ivory laptop and phone. Create ONE coherent panoramic 3D scene connecting both references, not a collage. On the left a modest old desktop computer with a navy screen, a restrained curved orange reuse arrow leads toward a simple architectural cutaway home at the center containing a compact three-layer Crypto Purple #562474 personal server and a small navy router. Fine physical orange and navy data paths travel from that home to a modern ivory laptop and upright phone on the right, with a few small ivory document and photo tiles following the path. Objects grounded on one continuous warm Amman Stone #F2EFE9 studio floor, very clean background #F2EFE9. Digital Navy #062759 details, Action Orange #F16E00 used sparingly, no cyan. Refined photorealistic CGI product rendering, tactile matte ceramic, frosted glass, soft shadows, subtle metallic ports. A clear low horizontal silhouette with ample space around objects, generous top and bottom margins, all objects complete and visible. Equal visual quality across old PC, home, server and mobile devices. No text, no letters, no numbers, no slogans, no UI panels, no logos, no border, no watermark, no people. Landscape 16:9 composition, for an editorial educational website. Keep the scene readable at small sizes and background uncluttered.

## وصف توليد الاستخدام اليومي

Use case: stylized-concept. Asset type: companion illustration for the everyday-use section of the same Fed3 Home-Cloud website. Use the attached reference as the exact style reference and keep the same rounded three-layer Crypto Purple #562474 personal server, navy details, ivory devices, tactile matte materials and warm Amman Stone #F2EFE9 background. Create a close three-quarter product scene: compact purple local server slightly left of center, a modern ivory laptop with a simple navy folder symbol on its screen behind it, an upright ivory phone beside it, and five small physical matte cards arranged along a fine orange curved path in front: folder, image, document, sharing link and restore-arrow pictograms. They represent upload, share, sync and recovery. No written text, no numbers, no UI screenshots, no logo, no people. Orange #F16E00 and Digital Navy #062759 restrained accents. Soft studio daylight, realistic gentle shadows and clean continuous floor, visually consistent with reference. Objects large and clearly legible, balanced editorial negative space, no excessive floating decorative clutter. Landscape 4:3 composition suitable for a side-by-side educational guide.

## المراجع التقنية

- [Nextcloud Snap](https://github.com/nextcloud-snap/nextcloud-snap/wiki).
- [متطلبات النظام](https://docs.nextcloud.com/server/stable/admin_manual/installation/system_requirements.html).
- [الملفات والمزامنة](https://docs.nextcloud.com/server/stable/user_manual/en/files/index.html).
- [المشاركة](https://docs.nextcloud.com/server/stable/user_manual/en/files/sharing.html).
- [النسخ الاحتياطي](https://docs.nextcloud.com/server/latest/admin_manual/maintenance/backup.html).
