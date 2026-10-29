# Surface hover effects

`SurfaceSignal` adds decorative, hidden-from-assistive-technology SVG paths behind the existing content. Panels keep their existing layouts, text, controls, focus order, and colors. Information panels retain their normal non-clickable behavior.

| Area | Treatment |
| --- | --- |
| Capabilities | Compact paired connector plates and four diagonal cuts, plus slight perspective on the illustration |
| Journey | A short chronology ruler with ticks and one node pulse; text remains anchored |
| Statistics | A small arc gauge and subtle artwork parallax; the gauge is omitted on phones to protect text space |
| GreenWay features | A three-node sage route below the descriptions |
| GreenWay stack | A paired bus with a pin connector, without repeating the diagonal cuts |
| Skills disciplines | Two registration corners, leaving the footer clear; individual technology selection keeps its small accent |
| GreenWay product stage | Small directional tabs, a short glass scan, and web/phone parallax in opposite directions |

`useSurfaceHover` delegates passive pointer events to the mounted page's main element. It batches geometry reads and CSS variable writes into one requested frame, without a continuous animation loop or React state updates. Only the active surface receives pointer coordinates. Entry-only motifs skip subsequent pointer updates. Leaving, scrolling, resizing, hiding the tab, and route cleanup stop pending work. Values are clamped, empty surfaces are ignored, and secondary pointers do not take over an active interaction. Each motif has its own compact aspect ratio and stays in the margins; full-width grids, scanning rules through the text, and repeating footer rails are removed.

Touch activates on press and yields to page scrolling after ten pixels of movement; release and cancellation clear the effect. Small/coarse-pointer devices omit the artwork parallax and glass scans. Genuine controls retain keyboard focus feedback. Reduced motion disables these decorative layers and movement. The packet and glass animations run once per entry rather than looping.

The normal browser cursor remains unchanged. Quick Details has a separate decorative segmented marker with fine counter-moving arcs. It eases with movement and settles without an endless rotation. Its position stays inside the panel bounds. A sparse node field and a short circular press pulse replace the square crosshair, grid, and pixel burst. Text stays still. `interaction-polish.css` provides the lighter button, link, and icon responses. Existing portrait reveals, project dragging, illustration controls, navigation, and spider behavior remain independent.

Run `node --test tests/surface-hover.test.js` for controller lifecycle checks, `npm test` for regressions, and `npm run lint` / `npm run build` for project validation. These checks do not replace browser visual review.
