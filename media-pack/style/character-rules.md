# Character rules (every SWIMMER PARTY character)

Paste these as the shared "series brief" in every image request, after the aesthetic block.
Each actor also has a stylization block in `cast/<code>.json` (`stylization`); use that actor's own block.

- Original, fictional characters. Never the likeness of a real person or a well-known character.
- Realistic adult body proportions, like a real person. Use about 7.25–7.5 heads tall for an adult around 175 cm: the crown-to-chin head length reads about 23–24 cm, the neck and torso have normal adult length, the pelvis sits near the body's midpoint, and the legs are natural rather than fashion-model long. Never use a large head, long neck, shortened torso, elongated legs or a child-like body.
- Faces look like real, ordinary people of their ethnicity, with distinctive, imperfect features, gently exaggerated from life. Lived-in, not idealized: no model looks.
- Ethnicity is part of identity, not a costume or background cue. When an actor is Chinese or East Asian, the face must read as Chinese or East Asian through its own facial structure, eye area, nose, cheeks, jaw, skin and hair—not through clothing alone and not through a generic or Eurocentric default.
- Every actor has 1–3 memorable signature features chosen in the actor identity block (for example: noticeably full lips, an unusually long face, a broad nose, uneven brows, a distinctive hairline, or a strong jaw). Make these features clear enough to recognize at a glance and preserve them through every angle, expression and wardrobe. Do not smooth them into an average face, beauty-standard face or generic character face.
- Signature features are gently cartoon-exaggerated while remaining adult, human and specific to that actor. The exaggeration belongs to the identity, not to a role costume or a one-off expression.
- The CG signal must be visible in the facial shapes as well as the rendering: slightly enlarged expressive eyes with clear irises and soft catchlights, simplified cheek, nose and lip planes, smooth simplified skin shading with soft subsurface scattering and no pores, and hair sculpted into clean grouped clumps. If the result could pass as a live-action portrait, reject it and push the facial shapes one step further toward feature-animation CG.
- Reference hygiene: SP-03 and SP-13 may be used only through their current `anchors.face` and `anchors.body` paths in their cast files as a style and proportion bar. Never search or use `library/trials/`, `library/overviews/`, `library/rejects/`, `notes/history/`, deprecated chats or role images as identity references. A new actor with null anchors uses the current aesthetic and these rules, not an old candidate image.
- “Free exploration” means exploring facial planes, brow and eye shapes, nose and lip balance, hair silhouette and expression within the approved actor facts. It never changes ethnicity, age, height, body proportions or signature features, and never imports a deprecated look. Label exploratory candidates as provisional until the Owner selects one.
- Clothing, fabrics, props and accessories are realistic, clean, generic and unbranded. No logos, no brand-like patterns (e.g. three-stripe slides, famous watch faces).
- Single-person reference images: one figure, vertical 9:16, fully transparent background, PNG, no floor shadow, soft even neutral-white front light, no coloured rim light, no visible lamps, no text, no watermark, no border.
- Full-body framing: head to feet with a little space around, horizontally centred. Close-up framing: head and upper chest, eyes at about 38% of the image height.
- Left/right always means the side of the frame, unless written "the character's left/right".

Known blockers (ChatGPT "similarity to third-party content"):
- Slicked-back hair + grey/black suit + thin dark tie read as a famous film CEO; striped slides and luxury watches read as brands.
- Fix: make every item generic, redesign the look away from the icon, split into smaller series.
