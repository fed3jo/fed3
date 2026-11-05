# Sphere mountain and scrolling

The home-page mountain uses navy and orange spheres in one instanced mesh. The desktop layout has 6,376 spheres, and narrow layouts use 2,750 slightly larger spheres. Responsive static previews use the same coordinates and colors. The flag and pointer interaction remain available.

While the page scrolls, the canvas retains its last frame and suspends rendering. Rendering resumes 160 ms after the last scroll event, provided the scene is visible and the tab is active. Pointer repulsion is disabled during scrolling. A ResizeObserver caches the terrain height so the scroll handler does not repeatedly read layout.

Sphere projections are cached per camera/layout and reused for pointer interaction. Camera matrices are updated before building this cache. Instance matrices stop updating once the spheres settle. Canvas pixel ratio is capped at 1.25.

## Local comparison, 4 November 2026

The same Chrome automation sampled repeated 450px forward/reverse wheel gestures over the visible mountain at 1440x900, with 4x CPU slowdown. Each run used a warmed production page. WebGL draw calls and animation-frame intervals were observed in the browser.

| Sample | Logo mountain | Sphere mountain with scroll suspension |
| --- | ---: | ---: |
| Peak submitted triangles per sampled interval | 2,807,316 | 510,580 |
| 95th-percentile frame interval | 48.5 ms | 18.2 ms |
| Intervals over 34 ms | 18 / 147 | 2 / 348 |
| Observed main-thread tasks over 50 ms | 0 | 0 |

The submitted-geometry reduction is approximately 82%. These are local browser samples, not guarantees for all devices or compositor behavior. The raw comparisons are saved locally in `test-results/mountain-scroll-before.json` and `test-results/mountain-scroll-after.json`.

Production compilation and the twelve focused browser checks cover pointer displacement/return, reduced motion, off-screen pause, context loss and static fallback, narrow layouts, eased wheel movement and anchor positioning, station videos and their 3G loading profile. The pointer check passed after fixing the initial camera-matrix cache.
