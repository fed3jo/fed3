# برومبتات الصور والفيديوهات المترابطة لـ Fed3

ثلاثة مقاطع صامتة بأسلوب 3D مبسّط، بخامات مطفية وعمق خفيف. توضح البدائل الرقمية، ثم السحابة المحلية، ثم التعلّم ومشاركة المعرفة. لا كتابة أو حروف أو أرقام أو شعارات داخل الصور أو الفيديوهات، وتُستخدم النسخة نفسها للعربية والإنجليزية دون قلب صورة الفيديو.

اتجاه التصميم المقترح مستلهم من [Etail: موشن 3D في واجهة رئيسية](https://dribbble.com/shots/25571331-Etail-landing-page-web-design-3D-animation)، مع اعتماد مراجع ثابتة للكاميرا والخامات والأشياء بين المقاطع، كما يشرح [دليل Higgsfield لاتساق الأسلوب والعناصر](https://higgsfield.ai/blog/keep-characters-consistent-ai-animated-series). البرومبتات أدناه تصميم خاص للمبادرة، وليست نسخًا لعناصر تلك المشاريع.

## إعدادات التوليد

- الصور المرجعية: 1920 × 1080، بنسبة 16:9.
- الفيديو: 16:9، بدقة 720p أي 1280 × 720، ومدة 4 ثوانٍ لكل مقطع. المجموع 12 ثانية بالضبط.
- النموذج الظاهر في اللقطة: Omni 1.2 Flash، ووضع الإطارات Frames. اضبط المدة على 4 ثوانٍ قبل توليد كل فيديو. تختلف المدد والخيارات بحسب النموذج والاشتراك.
- الخلفية المستهدفة #062759، والمجسّمات #F2EFE9، واللمسات #F16E00 و#562474. راجع لون الخلفية بعد التوليد قبل إضافته للموقع؛ وصف اللون وحده لا يضمن مطابقته رقميًا في كل بكسل.
- تُحفظ الحركة والعناصر داخل وسط 60% من عرض الإطار و70% من ارتفاعه. كل الحواف كحلية فارغة.
- يُعرض الفيديو كاملًا دون قصّ أو تمديد في مساحة الموقع الجانبية، ويُعرض أسفل النبذة على الهاتف. لا يُضاف الفاصل المتعرّج أو الهيدر إلى الفيديو نفسه.

إرشادات Google الرسمية: [إطارات البداية والنهاية](https://support.google.com/flow/answer/16353334?hl=en)، و[الميزات والمدد بحسب النموذج](https://support.google.com/flow/answer/16352836?hl=en).

## خريطة الربط

كل مقطع ينفّذ حركة رئيسية واحدة ثم يستقر على إطار الربط خلال آخر ربع ثانية. صور A وB وC المعتمدة تبقى نفسها؛ تبسيط الحركة يقتصر على ما يحدث بينها.

توجد ست خانات صور، لكننا نعتمد ثلاثة ملفات صور فقط:

| الفيديو | البداية | النهاية |
| --- | --- | --- |
| الأول: البدائل | A: خمس بطاقات تطبيقات | B: بطاقة الملفات المختارة |
| الثاني: السحابة | B نفسها | C: بطاقة دليل التعلّم |
| الثالث: المجتمعات | C نفسها | A نفسها |

لا تُعِد توليد B لبداية الفيديو الثاني، أو C لبداية الثالث، أو A لنهاية الثالث. ارفع الملفات المعتمدة نفسها لهذه الخانات. برومبتات الخانات المكررة أدناه تثبّت وصف اللقطة، ولا تعني الحاجة إلى توليد نسخة مختلفة.

## الفيديو الأول: البدائل الرقمية

تتباعد البطاقات قليلًا ويختار المؤشر بطاقة الملفات مباشرة. تتقدّم البطاقة بينما تنسحب البقية، وينتهي المشهد بها وحدها في الوسط.

### 1. صورة البداية A

```text
Create a polished 3D motion-design opening keyframe, 1920x1080, landscape 16:9, for a digital-sovereignty initiative. A completely solid deep navy #062759 background extends to every edge, without a visible floor horizon. Use matte warm cream #F2EFE9 sculptural objects, small orange #F16E00 accents and very restrained purple #562474 details. Soft studio light from the upper left, gentle ambient occlusion, modest depth, rounded bevels. Locked orthographic camera, nearly frontal and elevated about 20 degrees.

Center exactly five distinct rounded-square application tiles in a compact staggered fan. Their simple navy pictograms are a speech bubble, globe, envelope, folder and document. Every tile is visibly separate and already present. The folder tile is identifiable near the middle. A small orange cursor rests below the group. Keep the entire group inside the central 60 percent of the frame width and 70 percent of its height, with generous empty navy margins. Use large readable silhouettes rather than tiny details.

Absolutely no words, letters, numbers, pseudo-writing, labels, brand logos, captions, interface chrome, watermarks, clouds, glossy chrome, or decorative particles.
```

### 2. صورة النهاية B

أرفق A مرجعًا عند توليد هذه الصورة.

```text
Use the supplied opening image A as the exact style, object, camera and lighting reference. Produce a 1920x1080 landscape 16:9 ending keyframe. Show only the same cream folder application tile, centered at 50 percent frame width and 50 percent frame height. Its visible height is approximately 42 percent of the frame height. Preserve its rounded-square proportions, thickness, bevels, matte #F2EFE9 material, original navy folder pictogram and orthographic orientation. Add a thin orange #F16E00 edge accent and one short orange horizontal stroke beneath the pictogram. The stroke is a plain geometric mark, not writing.

The other four tiles and cursor are completely out of view. Preserve the solid #062759 edge-to-edge background, soft upper-left lighting and gentle shadow. The tile is fully inside the central safe area with clear navy margins. This is the shared connection frame between digital alternatives and local storage.

No text, letters, numbers, labels, logos, captions, watermark, extra objects, interface, cloud shapes or camera change.
```

### 3. برومبت الفيديو الأول

استخدم A بداية وB نهاية، واضبط المدة على 4 ثوانٍ.

```text
Animate supplied start image A into supplied end image B over exactly 4 seconds. Silent polished 3D motion design. Preserve the locked orthographic camera, solid navy #062759 background, matte cream #F2EFE9 tiles, orange #F16E00 accents, restrained purple #562474 details, original pictograms, bevels and upper-left lighting. Keep all action inside the central 60 percent width and 70 percent height.

0.00-1.00 seconds: the existing five tiles separate slightly into a shallow fan while the orange cursor moves directly to the folder tile and selects it once.
1.00-3.75: the selected folder tile advances smoothly as the other four tiles recede and fade; the cursor leaves. Add the thin orange edge and short orange stroke. Settle precisely into image B, preserving its exact size, center position, orientation and lighting.
3.75-4.00: hold the exact B frame, ready for film two.

Use one clear selection action with controlled easing at natural speed. No extra browsing, new tiles, camera movement, cuts, flashes, uncontrolled morphing, writing, letters, numbers, logos, speech, music or sound effects. The background and outer margins remain still.
```

## الفيديو الثاني: السحابة المحلية

تستقر بطاقة الملفات على شاشة حاسوب بجانب جهاز تخزين محلي. يصل ملف تجريبي إلى الجهاز، ثم يظهر دليل استخدام مستقل في المقدمة. المشهد يقتصر على حاسوب وخادم، لتبقى الحركة واضحة خلال أربع ثوانٍ.

### 4. صورة البداية B

استخدم ملف B نفسه من نهاية الأول. هذا برومبت وصف الخانة المرجعية:

```text
The supplied image B is the exact start frame, not a loose visual reference. Preserve the original pixels and composition by reusing that file: the single centered matte cream folder tile, its 42-percent frame-height scale, navy folder pictogram, thin orange edge, short orange geometric stroke, solid navy #062759 background, orthographic orientation and upper-left lighting. Landscape 16:9. Add nothing and do not redesign, reposition, relight, crop or mirror the image. No writing, letters, numbers, labels or logos.
```

### 5. صورة النهاية C

أرفق B مرجعًا عند توليد هذه الصورة.

```text
Use supplied image B as the exact composition, camera, material and lighting reference. Create a 1920x1080 landscape 16:9 transition keyframe. Keep the same single rounded-square cream #F2EFE9 tile centered at 50 percent frame width and 50 percent frame height, with the same visible height of approximately 42 percent, thickness, bevels, orthographic orientation, thin orange #F16E00 edge and short orange geometric stroke.

Change only the pictogram area: replace the single folder symbol with three large, clean navy pictograms arranged as a balanced compact triangle, a simple tool, a folder, and two human silhouettes. These are separate pictograms representing a practical learning guide. Keep the original navy #062759 background, soft upper-left lighting and gentle shadow identical. No devices or room remain visible; this guide tile is the only object. This exact frame will also open the community-learning film.

No words, letters, numbers, pseudo-writing, captions, logos, watermark, security badge, extra props or camera change.
```

### 6. برومبت الفيديو الثاني

استخدم B بداية وC نهاية، واضبط المدة على 4 ثوانٍ.

```text
Animate the exact supplied image B into the exact supplied image C over exactly 4 seconds. Silent simplified 3D motion design. Preserve the locked orthographic camera, solid navy #062759 background, matte cream #F2EFE9 materials, orange #F16E00 actions, restrained purple #562474 details and upper-left lighting. Keep all action inside the central 60 percent width and 70 percent height.

0.00-0.65 seconds: the existing folder tile moves slightly backward and settles onto a simple laptop screen. Reveal one compact two-tray local storage server beside the laptop. Use only these two devices, with large readable silhouettes.
0.65-2.65: one orange demonstration file travels along a single short connection from the laptop into the server's upper tray. The file remains visibly stored there and the server indicator turns orange.
2.65-3.75: a separate cream learning-guide tile appears in front with the three pictograms from image C. The laptop and server gently recede and fade while the guide settles exactly into image C. The stored file stays in the server until the device fades; it does not turn into the guide.
3.75-4.00: hold the exact C frame, ready for film three.

Show one file transfer at a readable natural speed. No room construction, phone, external cloud, extra devices, padlocks, public sharing, camera move, cuts, flashes, text, letters, numbers, logos, speech, music or sound effects.
```

## الفيديو الثالث: المجتمعات الرقمية

يفتح الدليل بين شخصيتين مبسّطتين. ينقل المدرّب نسخة منه إلى المتعلّم في حركة واضحة واحدة، ثم يعود المشهد إلى بطاقات افتتاح الفيديو الأول.

### 7. صورة البداية C

استخدم ملف C نفسه من نهاية الثاني. هذا برومبت وصف الخانة المرجعية:

```text
Reuse the supplied image C unchanged as the exact opening frame. Keep the single centered cream learning-guide tile, the tool, folder and people pictograms, its 42-percent frame-height scale, thin orange edge, short orange geometric stroke, matte material, solid navy #062759 background, fixed orthographic orientation and soft upper-left lighting exactly as supplied. Landscape 16:9. Do not regenerate or reinterpret the design, add characters yet, crop, mirror, relight or reposition anything. No words, letters, numbers, labels or logos.
```

### 8. صورة النهاية A

استخدم ملف A نفسه من بداية الأول حتى تتصل نهاية السلسلة ببدايتها.

```text
Use the original approved image A itself as the final frame of the third film. It must be identical to the opening frame of film one: the same five cream application tiles in the same compact staggered fan, with the same speech-bubble, globe, envelope, folder and document pictograms, the same small orange cursor below the group, identical positions, proportions, overlap, bevels, shadows, orthographic camera and upper-left lighting. Keep the solid navy #062759 background and original safe margins. No community figures or learning guide remain visible. No text, letters, numbers, logos, new props, cropping or mirroring.
```

### 9. برومبت الفيديو الثالث

استخدم C بداية وA نهاية، واضبط المدة على 4 ثوانٍ.

```text
Animate the exact supplied image C into the original approved image A over exactly 4 seconds. This is the final chapter of a 12-second continuous three-part film. Silent simplified 3D motion design. Preserve the locked orthographic camera, matte cream #F2EFE9 materials, solid navy #062759 background, orange #F16E00 accents, restrained purple #562474 details and upper-left lighting. Keep all action inside the central 60 percent width and 70 percent height.

0.00-0.65 seconds: the guide opens slightly into a small visual learning board. Reveal exactly two stylized cream human figurines beside it: one instructor with a restrained purple detail and one learner with a small orange detail. Use rounded forms without detailed faces.
0.65-2.60: the instructor points once to the board and passes one small copy of the guide to the learner, who receives it. Keep the gesture simple and clearly readable.
2.60-3.75: the two figures and guide gently recede and fade. The original five application tiles and orange cursor return and settle into the exact composition, positions, lighting and shadows of image A.
3.75-4.00: hold the exact A frame, ready to loop into film one.

Show one knowledge-sharing action at natural speed. No extra people, laptop, elaborate gestures, institutional file transfer, camera movement, cuts, flashes, writing, letters, numbers, logos, speech, music or sound effects.
```

## ترتيب التنفيذ والمراجعة

1. ولّد A واعتمدها بصريًا قبل متابعة العمل.
2. ولّد B باستخدام A مرجعًا، ثم C باستخدام B وA عند توفر مراجع متعددة.
3. استخدم A وB في Frames للفيديو الأول، وB وC للثاني، وC وA للثالث. لا تولّد النسخ المكررة من الصور.
4. عند ظهور اختلاف في نهاية فعلية عن الصورة المحددة، راجع الوصلة قبل توليد التالي. يمكن حفظ آخر إطار فعلي وإعادة استخدامه بداية، مع إبقاء مرجع الأسلوب الأصلي A.
5. اجمع المقاطع بالترتيب وراجع موضع البطاقة ولون الخلفية والإضاءة عند كل وصلة. الإطارات المشتركة تساعد على الاتساق، لكنها لا تضمن وحدها وصلة مثالية.
6. اجمع المقاطع بالتتابع المباشر: الأول من 0 إلى 4 ثوانٍ، والثاني من 4 إلى 8، والثالث من 8 إلى 12. استخدم وصلات على الإطارات المشتركة، دون مقدمات أو فواصل إضافية أو تداخل زمني يقصّر المجموع. صدّر نسخة واحدة مدتها 12 ثانية. تبقى الفيديوهات الثلاثة مستقلة في مشروع التوليد.

توثّق هذه الحزمة برومبتات الإنتاج. قدّم المستخدم المقاطع الثلاثة، ودُمجت نسخة صامتة منها في المقدمة. راجع [الأصول وسلوك التشغيل](hero-journey-video.md).
