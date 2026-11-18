# Scroll motion

`src/hooks/useScrollReveal.ts` observes section groups on Full Experience pages. Each group enters once as it reaches the viewport, using a short fade and upward lift from `src/components/ScrollReveal.css`. Panels land with a small alternating sideways offset, while numbered heading badges get one sweep in the active theme's accent color. Groups entering together have a stagger capped at 64ms.

Project galleries move as a group. The entrance only animates opacity and the independent `translate` property, so the cards keep their hover and drag transforms. The artwork keeps its existing colors and styling in both themes. Minimal View does not use this effect.

The first screen and restored scroll positions stay visible immediately. Pending content also stays readable during fast scrolls. Keyboard focus completes the entrance of enclosing groups, and reduced motion and print skip it. A short fallback finishes the entrance if the animation-end event is lost, so the calendar spider can still start. Route cleanup cancels pending timers.

Validation: build and lint, plus scroll-reveal tests for initial content, calendar fallback, child animation events, keyboard focus, reduced motion, missing observers, and cleanup. Navigation regression tests cover route handoffs separately. These tests validate lifecycle behavior, not browser rendering.
