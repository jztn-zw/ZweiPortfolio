# Hero portrait

## Real portrait reveal

Both themes use the same pixel reveal masks, photographic fragments, particle travel, scan line and reversible 1400 ms timeline. Light mode adjusts only the temporary fragment tones and opacity for the paper background; it does not replace the animation with a crossfade. The permanent crimson backdrop stays fixed. Reduced motion settles immediately to the selected portrait.

Current asset: `public/images/jaztin-portrait-real-matched.png`

The matched version was created with the built-in imagegen tool, using the illustration as the edit target and the original photo as the identity reference. Both states share the original illustrated crimson backdrop on a separate SVG layer. The illustration fades out completely, and the photo uses its own grayscale silhouette mask so the illustrated chin and collar cannot show through at the edges. The crimson geometry, frame dimensions, and page background remain fixed. The transition changes only portrait opacity, with no scaling or translation.

Matched asset final edit prompt:

Use case: identity-preserve, precise compositing. EDIT TARGET IMAGE 1: illustrated grayscale man with crimson diagonal shards on transparent background. IMAGE 2 is the real human identity and photographic facial texture reference. Create an exact registered alternate frame of IMAGE 1 for a website crossfade. Canvas exactly 941 x 1672. Keep IMAGE 1's exact overall scale, head size, eye positions, face angle, neck, shoulders, suit silhouette and diagonal gaps at precisely the same pixel positions. Replace only the illustrated HUMAN pixels with photorealistic grayscale human pixels from IMAGE 2, preserving his actual recognizable facial features, glasses, hair and natural skin texture. The person must fit the illustrated silhouette exactly rather than become larger or shift left. Keep ALL crimson background fragments from IMAGE 1 completely unchanged: exact same geometry, exact same red shades, positions, black diagonal cutouts and transparent gaps. Especially do NOT add red lines across the hair or face. The diagonal channels through the human must remain transparent like IMAGE 1, not red. No text, no backdrop, no new shapes. True transparent alpha background. Frame registration to IMAGE 1 is more important than new styling. Only human rendering changes from illustrated to photographic, every other pixel should stay unchanged.

### Earlier photo variant

Archived asset: `public/images/jaztin-portrait-real.png` (not used by the hero).

Created with the built-in imagegen tool from the user-supplied `Fragmented Monochrome Portrait Poster.png`, with the existing illustrated asset as a composition and color reference. The original photo remains unchanged. This first variant was superseded by the matched asset above.

Final edit prompt:

Use case: identity-preserve / background-extraction. Asset: transparent website hero portrait hover variant. Edit target is IMAGE 1, the real photographic portrait poster. Supporting style and precise composition reference is IMAGE 2, the existing illustrated website portrait with crimson geometric fragments on transparent background. Make image 1 work as a matched alternate to image 2: preserve the REAL PERSON'S exact facial features, skin texture, glasses, hair, pose, clothing and photographic realism from image 1, do not illustrate or beautify the face. Remove all white background and white diagonal gaps to actual transparent alpha, remove tiny JAZTIN text and line. Recolor ONLY the solid black decorative geometric shapes behind and around the person into deep crimson red matching image 2 (#a51b24 to #d1363a). Keep hair, suit and all photographic content grayscale. Align the overall silhouette, head, glasses, face and fragments as closely as possible to image 2 for a smooth overlaid crossfade on the website. Same tall portrait canvas ratio as image 2, full artwork visible with slim transparent margins, no clipping. The photographic human face from IMAGE 1 must stay unchanged, not anime. No new text, no watermark, no backdrop, genuine transparent background.

## Illustrated portrait

Asset: `public/images/jaztin-portrait.png`

Created with the built-in imagegen tool using the user-supplied illustrated portrait as the edit target. The generated PNG has a transparent background and is stored in the project. The original user attachment was preserved.

## Final edit prompt

Edit target: the supplied portrait poster. Create a production-ready transparent PNG website hero asset, preserving exactly the illustrated man's face, glasses, hair, grayscale suit, pose and recognizable identity. Preserve the striking diagonally sliced portrait composition and angular shards. Remove the white paper background, the white empty margins and white diagonal negative-space channels to true alpha transparency, while preserving white highlights INSIDE the face and shirt. Recolor the pure-black GEOMETRIC BACKGROUND SHARDS to restrained crimson #D1363A and deep burgundy #802126, keeping the man grayscale and black hair unchanged. Keep the complete composition with no clipping of shards or head, slim portrait aspect ratio near 9:16, clean crisp edges. Remove the small printed JAZTIN text and all other typography or watermark. This asset will sit directly on a #111111 dark website background; ensure the grayscale face stays bright and the crimson shards remain crisp. Change only background, negative spaces, geometric accent color and removal of printed text. Do not redesign or change his facial features. No extra shapes or lettering.
