# Fed3

Arabic and English landing page for the Digital Sovereignty Initiative. It uses the supplied PNG sequence, semantic station copy, a single canvas and a native-scroll GSAP timeline.

## Project baseline

`Fed3_Project` was empty when inspected. The user authorized initialization here. There was no existing router, package manager, locale provider, stylesheet, font bundle, deployment configuration or reverse proxy file to preserve.

The app uses Next.js 16.4.3 App Router, React 19.3.1, TypeScript 7, npm with `package-lock.json`, CSS modules and standalone Node output. GSAP is not an npm dependency. The 3.13.0 UMD scripts are bundled in `public/vendor/` and load through `next/script` after hydration. ScrollTrigger loads after core is ready. Sources and the applicable license reference are retained beside the scripts.

The alternatives page includes [Opening Tomorrow](docs/game.md), a bilingual local game about permissions, independent file recovery and community learning. Its code loads when the visitor opens the game. The source documents below include historical implementation notes; `docs/game.md`, `docs/alternatives.md`, and `docs/verification.md` describe the current features and checks.

## Run locally

Requires Node 22 or newer and npm.

```sh
npm ci
npm run dev
```

Open `/ar/` or `/en/` on the printed local URL. `/` defaults to Arabic and respects the language cookie after a visitor switches language. A direct locale URL takes precedence over a remembered preference.

```sh
npm run typecheck
npm test
npm run test:browser
npm run build
npm run verify:assets
```

Browser tests use installed Google Chrome and a running app at `http://127.0.0.1:3000`. Set `TEST_BASE_URL` to test another local port. Tests run headlessly; they do not use an existing browser profile. See [verification notes](docs/verification.md) for actual results and test-fixture limitations.

## Historical source-asset problem

The current 240 frames pass `npm run verify:assets`, including byte sizes, hashes, and PNG structure. The notes in this section record the initial source files on 23 October 2026 and do not describe the current release. Current verification is recorded in `docs/verification.md`.

The supplied extracted folder and ZIP both contain 21 damaged PNGs. Five are empty. Their hashes differ from the supplied `sequence.json`. The copies in `public/Fed3_Frame_240/` preserve those supplied files unchanged. The user confirmed no intact alternative copy is available.

Damaged frame numbers:

```text
13, 14, 15, 16, 33, 52, 67, 68, 69, 90, 91,
104, 105, 134, 157, 175, 176, 206, 207, 227, 228
```

All five anchors (1, 60, 120, 180, 240) are intact. With the current assets the animated loader truthfully stops at **219 / 240 (91%)**, offers Retry and View simplified page, and never initializes an incomplete timeline. A download failure immediately exposes all content in normal flow behind the retry tray; choosing the simplified view dismisses the tray. The complete bilingual simplified page works with these five anchors. A GSAP failure also switches to that view. No JavaScript leaves the server-rendered content and anchor images available.

`npm run verify:assets` intentionally exits with code 1 until the 21 files are replaced with intact originals matching the manifest. It reports byte sizes, hashes and PNG dimensions. Replace damaged files in `public/Fed3_Frame_240/` or the configured CDN folder, then run this check again. Do not repeat adjacent frames, regenerate poses or remove frames to make the count pass.

## Configuration and real CDN setup

`lib/fed3/config.ts` is the single configuration object. It contains `FRAME_BASE_URL`, `MANIFEST_URL`, `FRAME_COUNT: 240`, `PAD_LENGTH: 5`, `defaultLocale: 'ar'`, `assetVersion`, desktop/mobile budgets, scroll distances and localized route maps.

The default browser path is `/Fed3_Frame_240/`. Its leading slash keeps both localized routes working. Copy the corrected 240 PNGs and their original `sequence.json` into a versioned folder on your actual HTTPS CDN, then set these public variables **before building**:

```dotenv
NEXT_PUBLIC_FED3_FRAME_BASE_URL=<actual HTTPS CDN folder, including version and trailing slash>
NEXT_PUBLIC_FED3_ASSET_VERSION=1.0.0
```

No operational CDN address has been invented or provisioned. The manifest URL derives from the configured folder. A preconnect link is added only for the configured HTTPS image origin. Frame fetches go directly to that origin, with no Next image-optimization proxy and no secret tokens. The ordinary local vector logo uses `next/image`.

If using an external image host, configure it to return:

- `Content-Type: image/png` for every PNG and `application/json` for the manifest.
- `Access-Control-Allow-Origin: *` for public, credential-free assets, or the actual site origin. Add `Vary: Origin` when dynamically reflecting an allowed origin. These are fetch requests, so cross-origin permission is required even when an image would display in an ordinary `img` tag.
- `Cache-Control: public, max-age=31536000, immutable` for versioned assets and the manifest in that versioned folder. Never replace bytes at an immutable URL; publish a new version path and rebuild with its version.

The mutable local fallback uses revalidation instead of immutable caching so repaired files can be retrieved. If your reverse proxy overrides cache headers, retain that behavior. For a Content Security Policy, allow the app's local Next and vendor scripts, and `blob:` in `img-src` for local Blob decoding. An explicitly configured external frame host also needs its origin in `connect-src` and `img-src`. The default local setup does not load GSAP from jsDelivr.

## Resource and rendering behavior

The manifest describes 50,553,491 compressed PNG bytes (50.55 MB, approximately 48.21 MiB). The five anchors total 1,343,425 bytes (1.34 MB). The damaged supplied files total 47,968,906 bytes; this smaller number is not an optimization. The manifest itself is 65,274 bytes. Frame dimensions are 1600 × 900. The original vector logo is copied locally without mirroring or recoloring. No local font files were supplied, so the page uses Tahoma/Segoe UI/Arial for Arabic and Arial/Helvetica for English.

Animated mode requests all 240 files, prioritizing 1, 60, 120, 180 and 240. The queue allows six downloads on desktop or four on mobile. Downloaded Blobs persist independently of locale in a version/base-URL resource manager. In-flight requests are deduplicated. A 150 ms lease grace period accommodates Strict Mode remounts; abandoned requests abort when no consumer remains. Switching to simplified mode cancels unneeded frame work.

The loader counts unique verified PNG Blobs. It checks MIME type, manifest length, PNG signature/end marker and, when Web Crypto is available, SHA-256. HTTP requests have a 12-second timeout and up to three attempts; integrity failures get one further download round. Manual retry preserves successful Blobs. After 18 seconds without progress, the loader exposes a stall message and retry. The visual bar eases toward the actual percentage and cannot exceed it.

Compressed preload and decoded memory are separate. The canvas owns an LRU cache capped at 16 frames / 80 MiB on desktop or 10 frames / 24 MiB on mobile, including reserved space for pending decodes. Up to two decodes run concurrently. `createImageBitmap` uses useful display dimensions, capped at 1600 pixels wide on desktop or 960 on mobile. The HTML image fallback can retain fewer full-size frames to stay within the byte budget. Evictions close bitmaps; temporary object URLs are revoked. Late decodes are discarded after resize or teardown.

Only the latest requested frame and nearby frames are warmed. One on-demand animation-frame scheduler draws when frame or backing size changes. It keeps the previous/nearest valid image while a target decodes. Canvas uses an opaque 2D context, capped DPR, contained 16:9 imagery and debounced resize measurements. Rendering sleeps when hidden/off-screen. No frame-by-frame React state updates or perpetual canvas loop are used.

## Scroll, locale and accessibility

One master timeline pins one stage, uses `scrub: 0.45`, and maps durations to `sequence.json` proportions. Default distance is six viewport heights on desktop and seven on mobile. The timeline has named station labels. Header and bottom station links scroll to the middle of the stable holds (27%, 53%, 79%). They never seek only the animation.

Overlay controls appear only when both the timeline and painted canvas are on the corresponding stable anchor. Inactive panels use `hidden`, excluding their links from focus and interaction. Content uses native headings, paragraphs, lists and links; the canvas does not announce changing frame numbers. There is a skip link, visible focus, keyboard navigation, an accessible progress bar and no focus-trapping loader.

Reduced motion loads only the five anchors and presents all content in normal flow. Short screens use that view too. On mobile, the height requirement accounts for the full contained visual plus readable text and controls. The mobile menu includes the simplified-view control.

Locale switches use Next `Link`, save normalized progress in session storage, and remember the language in an optional cookie/localStorage. Storage errors are caught. Browser storage is read after hydration, and initial HTML always matches its explicit server locale. A remount decodes the saved frame before constructing the timeline, refreshes after fonts/layout, and restores its normalized scroll position. Same-document remounts reuse the shared Blob manager. Next's dynamic root locale can require a full-document navigation; that path restores from session storage and uses browser/HTTP caching, with fresh decoding and integrity checks. It is not described as zero reload work.

The scoped `gsap.context` reverts on teardown. Async setup checks whether the component is still mounted. The provider uses `onReady` to support cached scripts on remount. Scene decode errors or script errors expose the static page. The footer enters the normal document after the pin releases; the final frame remains on the stage as it scrolls away.

## Destinations

The route map contains `/ar/` and `/en/` variants for `alternatives`, `home-cloud`, `communities`, `about`, `privacy` and `contact`. These detailed pages did not exist. The app includes honest, localized destination placeholders with a working return link and `noindex`, so calls to action do not lead to 404s. The three station destinations repeat only the supplied description. No privacy policy, contact details or social accounts have been invented.

Replace these placeholders with the actual content or change `fed3.routes` to existing destination URLs before public launch. The landing page is complete; the six detail-page bodies remain a content dependency.

## Self-hosted deployment

```sh
npm ci
npm run build
npm run prepare:standalone
```

Run `.next/standalone/server.js` with Node under the existing process supervisor. Set `PORT=3000`, `HOSTNAME=127.0.0.1` when a reverse proxy runs on the same host, and `NODE_ENV=production`. For example, after setting those environment variables:

```sh
node .next/standalone/server.js
```

The preparation script copies `public/` and `.next/static/` into the standalone release. Alternatively, `npm start` serves the regular build. There was no existing reverse proxy configuration in this empty project; [the Nginx example](deploy/nginx.conf.example) shows a location block to integrate into the real TLS host. Preserve that host's certificates, domain and security settings. No external deployment was performed.

## Source transitions and motion limits

The sequence samples 32 seconds of source at approximately 7.5 images/second. GSAP scrub smooths the playhead, not the source poses. It does not produce the detail of a 24/60 FPS video.

Visual inspection found a clear scale/composition jump at 60 → 61: the toggle becomes smaller/lower and the cards spread farther apart. Boundaries 120 → 121 and 180 → 181 are visually close, with small background/edge differences. Mean absolute RGB differences on the supplied pairs were 15.446, 1.451 and 1.075 out of 255 respectively. These are source differences; rendering optimization does not remove them. Frame blending is disabled to avoid ghosting.

## Implementation references

The requested official [ScrollTrigger](https://raw.githubusercontent.com/greensock/gsap-skills/main/skills/gsap-scrolltrigger/SKILL.md), [timeline](https://raw.githubusercontent.com/greensock/gsap-skills/main/skills/gsap-timeline/SKILL.md), [performance](https://raw.githubusercontent.com/greensock/gsap-skills/main/skills/gsap-performance/SKILL.md) and [React cleanup](https://raw.githubusercontent.com/greensock/gsap-skills/main/skills/gsap-react/SKILL.md) skills were read. React lifecycle guidance is adapted to CDN globals and `useEffect` with `gsap.context`, without installing GSAP packages. Next's bundled documentation and official Script/self-hosting documentation were also consulted.
