# Scroll motion

The three supplied local MP4 references were reviewed as chronological contact sheets: a 5.5-second logo assembly, a 23.5-second esports introduction, and an 18-second boxing introduction. The portfolio borrows their stepped assembly, diagonal cuts, staggered composition, and depth cues. Their footage, text, logos, and colors are not imported into the site.

`src/hooks/useScrollReveal.ts` observes section groups once per route. `src/components/ScrollReveal.css` gives each type a distinct entrance:

- Titles assemble through a three-band stepped mask; supporting copy follows slightly later.
- Panels approach from alternating sides and settle with a small tilt.
- Project cards arrive in sequence with a restrained fan motion, preserving gallery drag and hover transforms.
- Illustrations reveal through a diagonal mask with a small scale settle.
- Section marks scan into view, number badges receive one crimson sweep, and rules draw on.
- On desktop browsers supporting view timelines, completed artwork entrances gain a subtle 20px scroll-linked drift. Video controls and the calendar are excluded from this drift.

Phones use shorter travel, no card fan rotation, and no continuous artwork drift. The first screen and restored scroll positions remain visible immediately. Keyboard focus reveals all enclosing groups. Reduced motion skips these effects, and print styles expose all content. A timed fallback completes an entrance if its animation-end event is replaced or lost; route cleanup cancels all pending timers. The calendar spider can start once its section is visible.

Validation: build and lint, plus scroll-reveal tests for initial content, calendar fallback, child animation events, keyboard focus, reduced motion, missing observers, and cleanup. Navigation regression tests cover route handoffs separately. These tests validate lifecycle behavior, not browser rendering.
