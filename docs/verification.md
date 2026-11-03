# Verification

## Current checks, 27 October 2026

The local standalone production build passes all 36 tests: 10 unit tests and 26 Chrome browser tests. Production compilation, TypeScript checking, standalone preparation, and validation of all 240 frame assets pass. The new [Opening Tomorrow game](game.md) is available in the alternatives page in both languages.

Game logic tests cover 256 decision combinations, 64 permission combinations, invalid transitions, save validation, and causal replay. Browser tests complete prepared and unprepared routes, resume progress after reload, cancel and confirm restart, pause and close, keep keyboard focus inside the modal, restore focus on exit, and check widths of 320, 390, and 768 pixels in both languages. A complete prepared playthrough passes with external requests blocked and browser storage disabled. No gameplay POST requests are made.

The game bundle is absent before launch. This run records 27,030 encoded bytes for its additional JavaScript and CSS, excluding the cover and fonts, in `test-results/game-bundle.json`. Idle frame sampling is recorded separately in `test-results/game-timing.json`. These are headless Chrome observations on this Windows machine, not guarantees for every phone or network. Screenshots of the introduction, cloud task, results, and mobile layouts were inspected.

The SVG night-light overlay follows the room silhouette. Scene changes, pause/confirmation dismissal, and modal tab boundaries preserve keyboard focus. CSS animation and text reveal pause when the document is hidden or the player takes a break. Local GSAP and ScrollTrigger copies remove the landing page's runtime dependency on jsDelivr. Browser tests for the existing landing journey, alternatives, app details, cloud page, and survey pass.

Landing tests inject explicit file-download failures, control the browser-language preference, wait for the opening overlay to release scrolling, and use the current navigation labels. Healthy source images are not replaced. Historical fixture notes below describe the earlier asset state.

Sound effects are generated locally. Optional narration uses an installed local device voice when available. Studio or human voice recordings are not bundled. The preview runs at `http://127.0.0.1:3100/ar/alternatives/#game`; no external deployment was performed.

## Current checks, 25 October 2026

The local-cloud page and week 12 survey preview pass three additional browser tests. Eleven focused browser tests now pass across `alternatives.browser.spec.ts`, `home-cloud.browser.spec.ts` and `journey-redesign.browser.spec.ts`. The survey checks all 13 questions, local answer continuity, clearing on reload, a disabled submit action, and no outbound POST requests or saved answers. The alternatives checks include the clustered hero and both app-fact groups. Four unit tests and the production build also pass.

The current 240 frames pass `npm run verify:assets`, with matching sizes, hashes and PNG structure. The findings about damaged source files below are a historical record from 23 October and do not describe the current assets.

Type checking, four unit tests and the production build pass. Eight browser tests in `alternatives.browser.spec.ts` and `journey-redesign.browser.spec.ts` pass against a local production server on port 3100. They cover all five app pairs and ten localized detail pages, source and download links, filters, sharing, navigation, language changes, and widths of 320, 390, 768 and 1440 pixels. The journey test uses the real 240-frame sequence, including travel between stations, reverse scrolling, exact anchor frames, readable mobile content and leaving the pinned stage. Desktop and mobile screenshots were inspected.

The development server on port 3000 produced failed HMR WebSocket handshakes during automation; production browser checks avoid that transport issue. No external deployment was performed.

## Historical checks, 23 October 2026

Checked on 23 October 2026 on this Windows machine with Node 24.13.1 and installed Google Chrome. No external production host or real image CDN was available.

## Build and code checks

- `npm run typecheck`: passed, including Next-generated route types.
- `npm test`: four unit tests passed.
- `npm run build`: passed, with Arabic/English landing pages and twelve localized destination placeholders.
- `npm run prepare:standalone`: passed. The standalone server served HTML and PNGs over loopback with the expected MIME type and cache headers.
- `npm run verify:assets`: failed as expected for the 21 damaged supplied PNGs. All 240 names exist; the intact originals are still required for a complete animation. The ZIP was checked and has the same damaged files.

## Browser checks

Nine automated browser tests passed against the development server, which runs React Strict Mode. The real-asset failure flow, complete-sequence fixture flow and cached reload were also exercised against the standalone production server. After making download failure expose all copy immediately, its targeted browser check passed again.

The checks cover:

- Arabic and English HTML direction, copy and language preference; no detected hydration errors.
- Desktop 1440 × 900, mobile 390 × 844, and short 1280 × 600 layouts.
- An actual incomplete preload stopping at 219/240; retry preserves successful images and never reports false completion.
- Reduced motion loading only the five anchors; all station text and links remain available.
- Script failure, JavaScript disabled, and the HTMLImageElement decoding fallback.
- Station navigation scrolling to holds, exact frame 1 and frame 240, reverse traversal and rapid jumps.
- Language switching at Home Cloud restores frame 120 and the corresponding copy.
- One ScrollTrigger after route remounts, none after leaving; owned bitmaps close after teardown.
- Inactive station links are hidden and keyboard focus leaves a disappearing panel.
- Mobile visual containment, Arabic text/button visibility and no horizontal overflow.
- Configured detail URLs return 200 and honestly disclose that their full content is being prepared.
- Cached reloads transfer approximately 300 bytes of revalidation overhead per anchor rather than the PNG bodies.

## Test fixture boundary

The current assets cannot reach the all-240-ready path. Tests explicitly labeled `fixture` intercept only the 21 damaged files in the test browser and use the intact first PNG as test data, with a corresponding in-memory test manifest. These substitutions exist only in `tests/landing.browser.spec.ts`. They are not application behavior and are never written over the supplied assets.

This tests the queue, timeline, navigation, cleanup and memory behavior. It does **not** validate the appearance of missing poses or claim to repair the source animation. All anchor screenshots use intact original anchor frames. The ordinary real-asset tests do not use substitutions.

## Timing and memory observations

During a five-second forward/reverse test scroll at 1440 × 900 in headless Chrome, the development build recorded:

| Measurement | Observed |
| --- | --- |
| Peak live ImageBitmaps | 16 |
| Peak estimated decoded bitmap bytes | 50,466,816 (48.13 MiB) |
| Animation-frame timing samples | 301 |
| Median interval | 16.7 ms |
| 95th-percentile interval | 16.8 ms |
| Intervals longer than 34 ms | 0 |
| Recorded main-thread tasks longer than 50 ms during scroll | 0 |

The instrumentation wraps bitmap creation/close and observes animation-frame intervals and long tasks. It checks the application-owned decoded image budget, not total browser memory. It does not measure GPU memory, process RSS, actual display compositor drops or compressed Blob storage. The PNG fixture and this machine's performance limit what can be concluded; this is not a guaranteed 60 FPS claim.

## Remaining external checks

Replace the damaged frames, then inspect the full unmodified sequence and rerun asset verification. The original 60 → 61 discontinuity will remain; it is documented in the README. Test CORS and immutable caching on the actual versioned CDN origin, and validate the real reverse proxy after deployment. Hardware testing on iOS Safari, Android devices and low-memory phones was unavailable. No live deployment, certificate change or domain configuration was performed.

Complete the six detailed section pages or point their route maps to real destinations before public launch.
