# Loading and rendering

- Active PNG artwork is served as lossless WebP at the original dimensions. Run `python scripts/optimize-images.py` with Pillow to regenerate it. The script verifies every RGBA pixel and records file sizes in `output/media-optimization.json`. Original images remain available for editing.
- The hero illustration is preloaded at high priority. The secondary real portrait has low priority. Mobile does not mount the hidden desktop portrait's masks, fragment layers or photo request. Resizing back to desktop restores the effect.
- Skills, Numbers and GreenWay JavaScript/CSS load on demand. Link hover, keyboard focus, touch and hash changes start their downloads during the existing page transition. Slow downloads show a themed loading state; failed chunk downloads offer a retry.
- Initial HTML contains a lightweight branded preview until React takes over. This is informational, introduces no artificial wait and works while JavaScript downloads.
- Looping CSS artwork pauses outside the viewport and when the tab is hidden. Its animation timeline resumes when visible. The calendar spider already follows the same visibility policy.
- The existing showcase MP4 already places its `moov` metadata before `mdat`, allowing progressive streaming. Its original video/audio streams, dimensions and frame rate are preserved without re-encoding. It starts downloading near the viewport and pauses when offscreen or in a hidden tab. Explicit user pause persists until the user plays it again. A poster stays visible until playback can begin, and buffering has a status message.
- No device is forced into a lower resolution or reduced animation mode. Existing reduced-motion preferences still apply. Network outages, video buffering and limited hardware can still delay loading or frames.

During validation, a stream-copy remux was compared with the source: both audio and video SHA-256 stream hashes matched. Because the source already supports fast start, the duplicate was discarded.

## Validation

- 10 active image assets: 13,323,511 bytes → 7,786,256 bytes (41.6% smaller), with identical decoded RGBA pixels.
- Production build creates separate Skills, GreenWay and Numbers chunks; the entry JavaScript is about 333 kB before gzip. The original combined entry was about 369 kB.
- A local throttled proxy added 6 seconds of JavaScript latency and limited each transfer to roughly 160 KiB/s. Homepage content and subsequent Numbers navigation completed successfully. This is a network simulation, not a physical-device CPU benchmark.
- Production preview checked in desktop and 390 px mobile layouts. Desktop portrait toggle remains functional; mobile mounts no hidden portrait pixel grid and has no horizontal overflow at 390 px.
- Video play/pause, pause outside the viewport, automatic resume and preservation of explicit user pause were checked in the browser.
- Local static preview has no deployed Vercel API handlers; unavailable visitor/calendar states are expected there. API regression checks run through the existing automated tests.
