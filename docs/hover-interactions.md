# Surface hover effects

`SurfaceSignal` adds decorative, hidden-from-assistive-technology SVG paths behind the existing content. Panels keep their existing layouts, text, controls, focus order, and colors. Information panels retain their normal non-clickable behavior.

| Area | Treatment |
| --- | --- |
| Capabilities | Distinct edge diagnostics for responsive interfaces, data buses, and branching workflows; staggered gutter ticks, a corner lock, and one brief illustration scan, with slight perspective |
| Journey | A live chronology ruler with a traveling diamond, gently staggered ticks and breathing timeline/status nodes; loops only while hovered, text remains anchored |
| Statistics | A small arc gauge and subtle artwork parallax; the gauge is omitted on phones to protect text space |
| GreenWay features | A three-node sage route below the descriptions |
| GreenWay stack | Page-colored panel and tags, with a dedicated screens/data/media schematic at the row end; packets and LEDs loop only while that row is hovered |
| Skills disciplines | Open rows on the page canvas, wrapping outlined tags, and a small crimson node/corner with a looping transmission underline on the active tag |
| GreenWay product stage | Small directional tabs, a short glass scan, and web/phone parallax in opposite directions |

`useSurfaceHover` delegates passive pointer events to the mounted page's main element. It batches geometry reads and CSS variable writes into one requested frame, without a continuous animation loop or React state updates. Only the active surface receives pointer coordinates. Entry-only motifs skip subsequent pointer updates. Leaving, scrolling, resizing, hiding the tab, and route cleanup stop pending work. Values are clamped, empty surfaces are ignored, and secondary pointers do not take over an active interaction. Each motif has its own compact aspect ratio and stays in the margins; full-width grids, scanning rules through the text, and repeating footer rails are removed.

Touch activates on press and yields to page scrolling after ten pixels of movement; release and cancellation clear the effect. Small/coarse-pointer devices omit the artwork parallax and glass scans. Genuine controls retain keyboard focus feedback. Reduced motion disables these decorative layers and movement. The packet and glass animations run once per entry rather than looping.

The normal browser cursor remains unchanged. Quick Details aligns its header ornament in a three-column grid, with the title and context at opposite edges. The item padding, badge offsets, dividers, and hover washes share the same inset. Each label reserves space for its own schematic: a location route, ascending learning steps, a code signal, or an interests orbit. These loop only during fine-pointer hover, alongside the recurring badge scan; text stays still. The old pointer-following overlay and loose corner indicator are removed. Reduced motion hides diagrams without shifting the header, and the existing visibility guard pauses animations in hidden tabs. `interaction-polish.css` provides lighter button, link, and icon responses. Existing portrait reveals, project dragging, illustration controls, navigation, and spider behavior remain independent.

Skills retains the existing technology inventory and descriptions. Each tag is a button that reveals its description in a reserved area below the group on hover, keyboard focus, or tap; Escape dismisses it without losing keyboard focus. Tags wrap naturally, with 44px controls on phones. The discipline rows keep a transparent background in both themes, including hover, and the previous large framed cards and repeated tool-description lists are removed. Tag motion respects reduced motion and the hidden-tab animation guard.

GreenWay shares one column grid between the project introduction and the film/story row, with a four-column facts strip between them. The film label and story kicker share a baseline; the film stays roughly half-width on desktop and keeps its full 16:9 frame. At 960px and below the film moves above the story, and the facts become two columns below 760px. A slow crimson edge trace and header indicator loop during hover or control focus; facts have subtle local border responses. Playback, automatic looping, mute controls, and visibility-based loading remain unchanged. Decorative motion pauses in hidden tabs and is disabled for reduced motion.

The GreenWay stack board, header, rows, and technology tags share the page canvas in both themes. Each row reserves a third column for its own screen, data, or media schematic, replacing the repeated bottom bus decoration. CSS packets and status indicators loop only on fine-pointer hover; tags get a short transmission underline. Text and icons stay anchored, no pointer-coordinate tracking is used for these rows, and narrow phones omit the diagrams to keep the tags readable. Reduced motion disables loops, and the hidden-tab guard pauses them.

Run `node --test tests/surface-hover.test.js` for controller lifecycle checks, `npm test` for regressions, and `npm run lint` / `npm run build` for project validation. These checks do not replace browser visual review.
