# About portrait artwork

The main portrait uses Jaztin's exact original photograph, without regenerating his face, pose, clothing or accessories. The file `public/images/jaztin-about-editorial.png` has the same SHA-256 hash as the supplied `Moody Editorial Portrait in Plaid Cardigan.png`. A code-defined silhouette crop and CSS monochrome treatment place it over the poster lettering.

The three smaller illustrated studies were generated with the built-in image generation tool, using Jaztin's existing portrait as the identity reference and the user-supplied monochrome poster images as style references.

Assets:
- `public/images/jaztin-about-editorial.png`: original main photograph, 1024 × 1536.
- `public/images/jaztin-profile-ink.png`: earlier generated portrait study, retained but no longer displayed.
- `public/images/jaztin-profile-studies.png`: three-view portrait strip, 2172 × 724.

The square composition, name typography, frame, theme colors and hover transitions are implemented in `AboutProfilePoster.tsx` and `AboutProfilePoster.css`.

## Earlier portrait study prompt (not used for the main picture)

Use case: identity-preserve / style-transfer.
Asset type: transparent portrait cutout for a square developer portfolio manga editorial poster.
Input images: Image 1 is Jaztin's current portrait and the PRIMARY identity, face, glasses and clothing reference. Image 2 is another real photo of the SAME man, supporting face identity only (foreground seated man). Images 3 and 4 are STYLE/COMPOSITION references only, not character identities.
Primary request: Draw the exact man from image 1 as an exceptionally polished black-and-white ink manga editorial portrait. Keep him clearly recognizable: same facial proportions, nose, lips, slim jaw, black fringe, black flat cap, chunky rectangular tinted glasses, plaid black cardigan over white crew-neck shirt, thin necklace. Do not make him resemble the characters in the style references.
Pose: a new relaxed three-quarter upper-body pose, shoulders slightly turned, head turned toward the viewer, subtle confident closed-mouth smile. One hand naturally and lightly touches the glasses at the temple, with correct anatomy; other arm relaxed and cropped at waist.
Style: precise fine ink contour lines, elegant crosshatching and fine screentone shadows, bold black fabric masses, warm off-white highlights. Semi-realistic facial likeness with manga print rendering, normal human facial proportions and eyes. Rich detail on cardigan and hair. Premium monochrome graphic novel editorial illustration, no photographic background.
Composition: a single centered waist-up subject, full cap/hair and shoulders inside frame, with a little empty space above and at sides. Portrait orientation; subject fills the canvas. Crisp alpha silhouette. No text, no lettering, no border, no panels, no extra people, no props, no weapons. Background must be genuinely transparent, not a white or black rectangle. The image will be layered over large editable typography and technical grid details in the website.
Constraints: preserve the identity of the man in image 1 as the highest priority. Keep his glasses and distinctive cap/cardigan look. No anime fantasy features, no extreme expression.

## Portrait strip prompt

Use case: identity-preserve / style-transfer.
Create a wide horizontal contact sheet, aspect ratio 3:1, containing exactly THREE equal square portrait panels side by side, no gaps. All three show the SAME real man Jaztin Abram Contreras, with exact facial likeness from reference image 1, rendered in the same detailed monochrome ink and screentone style of reference image 2. Image 1 is primary identity reference. Image 2 is the approved illustration rendering reference of that same person.
Panel 1: front-facing head and shoulders, calm slight closed-mouth smile. Panel 2: three-quarter head view facing slightly right, looking at viewer, thoughtful. Panel 3: left-facing profile/three-quarter, relaxed. Keep all faces recognizable as the same man, accurate human proportions, same nose/lips/jaw, short black fringe, black flat cap, rectangular black tinted glasses. Same black plaid cardigan, white shirt and thin necklace.
Crop each panel closely to cap, face and shoulders, with full head visible. Align faces vertically at the same height. Background warm pale ivory paper with subtle print grain; sharp black ink, fine hatching, black shadows and natural face proportions. No text, no lettering, no speech balloons, no border, no weapons, no fantasy features. This is a small portrait strip beneath a main portfolio cover illustration. No extra people.
