# Station video performance

Each station initially displays a lazy cover. No MP4 is requested until at least 15% of the station is visible below the header. The silent video then starts automatically and loops. The player selects the 360p rendition for viewports up to 800px or a constrained connection; other visitors receive 720p. The video pauses when leaving the station or hiding the tab, and resumes when returning. A manual pause remains respected until the visitor resumes playback. Browsers that block autoplay receive a play control. All three stations have configured videos.

## Assets

| Asset | Bytes |
| --- | ---: |
| Source recording, retained outside the repository | 2,515,791 |
| 720p H.264 MP4 | 488,767 |
| 360p H.264 MP4 | 142,649 |
| WebP cover | 13,324 |
| Local-cloud 720p H.264 MP4 | 404,004 |
| Local-cloud 360p H.264 MP4 | 100,883 |
| Local-cloud WebP cover | 12,354 |
| Communities 720p H.264 MP4 | 446,411 |
| Communities 360p H.264 MP4 | 145,353 |
| Communities WebP cover | 16,618 |

All MP4s are silent, use yuv420p, place the moov atom before mdat, and support HTTP range requests. The player uses `preload="none"`; the cover is a lazy image. Versioned video URLs receive immutable cache headers.

## Verification, 4 November 2026

Production build and TypeScript checking pass. Five focused Chrome browser tests pass for Arabic and English layouts, native navigation, automatic playback, looping, pause/resume on station and tab visibility changes, manual pause, HTTP 206 byte ranges, caching, and no frame-sequence requests.

The automated network check uses a local production server, empty browser cache, a 390x844 viewport, 1.6 Mbps download, 750 Kbps upload, 150 ms emulated network latency and 4x CPU slowdown. First contentful paint and largest contentful paint both remain below five seconds. Starting each small video upon entering its station also remains below five seconds. The check visits all three stations, verifies automatic playback and confirms the previous station pauses. Exact run metrics are written to `test-results/station-video-3g.json`.

This is a defined simulated 3G profile. It does not establish a five-second guarantee for all mobile networks, devices, radio conditions or hosting locations. Public DNS, TLS, server response times and real mobile-device performance still need measurement after deployment. Slower 3G links may exceed this timing.

The 3D mountain remains available. On a connection reported as constrained, it requires an explicit click so its JavaScript and rendering do not compete with the initial page. Browsers without Network Information API use the default idle-loading behavior.

Run against a production server:

```powershell
$env:TEST_BASE_URL='http://127.0.0.1:3210'
npx playwright test tests/station-video-performance.browser.spec.ts tests/video-stations.browser.spec.ts --project=chromium
```
