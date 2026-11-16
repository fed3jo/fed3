# فيديو مقدمة السحابة المحلية

ثلاثة برومبتات جاهزة: صورة البداية، صورة النهاية، وحركة الفيديو. المشهد خادم بنفسجي بين حاسوب وهاتف، مع نسخة احتياطية منفصلة. يطابق ألوان الرئيسية والبدائل ومساحة المقدمة الكحلية.

تعرض الصفحة الفيديو الذي أُنتج باستخدام هذه البرومبتات. الفاصل البرتقالي والعنوان والنص عناصر في الموقع، فلا ترسمها داخل الصور.

## الإعدادات

- صور بنسبة 16:9، وبدقة 1920 × 1080 إذا كانت متاحة.
- فيديو 8 ثوانٍ، بنسبة 16:9. اختَر هذه المدة إذا أتاحها النموذج.
- خلفية كحلية موحّدة #062759. عاجي #F2EFE9، بنفسجي #562474، وبرتقالي #F16E00.
- كل المجسمات وظلالها داخل وسط 60% من العرض و60% من الارتفاع. الأطراف فارغة وكحلية لتناسب القص على الهاتف والحاسوب.
- كاميرا ثابتة، من دون كتابة أو شعارات أو صوت. نفس المشهد للعربية والإنجليزية.

## 1. برومبت صورة البداية

```text
Create a premium minimalist 3D editorial product illustration for the Fed3 local-cloud website hero. Landscape 16:9, 1920x1080. Uniform deep navy background, target hex #062759, extending continuously to every edge, with no gradient, horizon, room or visible floor boundary. One compact three-tier local server is the central subject, made of matte purple ceramic, target #562474, with softly bevelled edges, subtle darker purple side faces, two narrow vent slots and one tiny orange status light on each tier. On the left, one small open ivory laptop, target #F2EFE9, with a navy screen showing a single simple embossed ivory folder pictogram. On the right, one upright ivory phone, with the same simple folder pictogram on its navy screen. A thin orange #F16E00 physical cable-like path connects the laptop to the server and the server to the phone. One separate small ivory backup drive rests in the lower right foreground, connected to the server by a distinct thin dashed orange path. One small ivory document tile rests beside the server. All objects are grounded in one coherent three-quarter scene with soft ambient shadows and refined studio lighting. Locked orthographic camera. Keep the complete composition, including all objects and shadows, strictly inside the central 60 percent of the image width and the central 60 percent of its height. Leave generous empty navy margins on all four sides. Calm, mature, tactile, carefully spaced design. Preserve the visual separation between the device connections and the independent backup connection. No text, letters, numbers, app logos, cloud symbols, people, watermark, border, interface screenshot, decorative particles, glowing cyber effects or extra objects.
```

## 2. برومبت صورة النهاية

أرفق صورة البداية كمرجع عند توليد النهاية.

```text
Use the supplied opening image as the exact visual reference and recreate its resting composition for the closing frame of a seamless loop. Preserve the exact same three-tier purple local server in the center, the same ivory laptop on the left, the same upright ivory phone on the right, the same separate ivory backup drive in the lower right foreground, the same small document tile, and the same thin orange connection paths. Keep the backup connection visually separate and dashed. Match every object's position, orientation, size, folder pictogram, bevels, materials and shadows to the opening image. Use the identical locked orthographic camera, lighting, framing and uniform navy #062759 background. Preserve ivory #F2EFE9, purple #562474 and orange #F16E00. Every object and shadow must remain within the original central 60 percent safe area. The document tile has returned to its original resting position and the orange status lights are at their original brightness. No new objects, changed icons, writing, letters, numbers, logos, watermark, horizon, camera movement, crop change or redesign. The final frame should visually match the first frame.
```

لأقرب تطابق في الحلقة، استخدم ملف صورة البداية نفسه للبداية والنهاية. برومبت النهاية متاح إذا احتجت توليد نسخة مطابقة، لكن التوليد قد يغيّر التفاصيل.

## 3. برومبت الفيديو في Google Flow

```text
Animate the supplied start and matching end frames as one seamless 8-second minimalist 3D product-motion loop for a local-cloud website hero. Keep the orthographic camera completely locked. Preserve the exact identities, geometry, positions, scale and materials of the purple three-tier server, ivory laptop, upright ivory phone, separate backup drive and single document tile. Do not transform one object into another. From 0 to 1 second, hold the original resting composition. From 1 to 3 seconds, a tiny orange pulse travels along the existing connection from the laptop to the central server; the document tile lifts very slightly beside the server and settles. From 3 to 5 seconds, another restrained orange pulse follows the existing connection from the server to the phone; the phone's existing folder pictogram briefly brightens without changing shape. From 5 to 6.5 seconds, one subtle orange pulse follows only the separate dashed backup path to the independent drive; do not depict this drive as an ordinary sync endpoint. From 6.5 to 7.5 seconds, all small light changes fade back to the exact original brightness and the document tile returns to its exact opening position. Hold the matching original resting composition from 7.5 to 8 seconds. Use gentle easing without bouncing. Keep all objects, paths and shadows inside the central 60 percent of the frame width and height. Maintain a completely uniform navy #062759 background, ivory #F2EFE9 devices, purple #562474 server and restrained orange #F16E00 accents. One continuous shot. No pan, tilt, zoom, orbit, cut, flashing, morphing, expanding paths, new objects, extra tiles, particles, cloud symbols, text, letters, numbers, logos, voice, music or sound effects. End on the exact opening composition for a clean repeating loop.
```

في Flow افتح مشروعك، ثم اختَر **Video > Frames**. ضع الصورة في **Add start frame** وصورة النهاية في **Add end frame**، ثم الصق برومبت الفيديو وحدّد النسبة والمدة المتاحتين. قد تختلف الخيارات بحسب النموذج والمنطقة. [تعليمات Google الرسمية](https://support.google.com/flow/answer/16353334?hl=en).

## عند تجهيز الملف للموقع

احتفظ بنسخة أصلية، وصدّر نسخة 720p للحاسوب ونسخة أصغر للهاتف وصورة ثابتة من الإطار الأول. افحص الحلقة والأطراف الكحلية على خلفية الموقع. الملفات المستخدمة في الموقع داخل `public/videos/`، ويشغّلها قالب المقدمة المشترك.
