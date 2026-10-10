# Official sample execution — 2026-10-09

Owned by website continuation chat `01a11e64-f601-7881-8bc6-7f24087a164a`.
Other handoffs remain untouched and must not be staged with this file.

## Scope and progress

- Owner accepted Tang Yunqiu's two images and silent video in the continuation request.
- Misha Luo: two ChatGPT scene images and one silent Grok video completed locally.
- Zhang Qiang: two ChatGPT images and one silent Grok video completed locally.
- Chen Wei: two ChatGPT images reviewed; video in progress.
- Official posts, rounds 5–7.5 closeout, repository cleanup and round 8 remain pending.
- No deployment, cloud resource creation, Blob upload or production migration.

## Misha Luo

- ChatGPT conversation: https://chatgpt.com/g/g-p-6ac396efc218819190830b751d24ab00/c/6ac84c0b-c624-83ea-a342-61eab5be313c
- References: `public/media/assets/misha-luo/turnaround.front.webp` and `face.front.webp`.
- Output directory: `media-pack/library/samples/misha-luo/` (ignored originals).
- Images: `misha-luo__sample__image-01__v1.png` (noodle shop, holding tea cup) and `misha-luo__sample__image-02__v1.png` (riverside walk and greeting), two separate 941×1672 PNGs.
- Prompt: approved identity from `media-pack/cast/SP-03.json`, verbatim aesthetic block, clearly animated adult proportions; one image-tool call with two separate scene outputs, no collage. Full generation prompt is retained in the ChatGPT conversation above.
- Visual review against approved face: long narrow face, nose, ears, hair and grey-blue eyes retained; clearly animated rather than photographic. Scene backgrounds are intentionally opaque (sample route overrides transparent reference-sheet rule).
- Grok: `reference_to_video` once, first frame image-01, the same two identity references, 9:16, 6 seconds, 720p, no preset voice. Generation reported approximately 137 seconds.
- Video prompt: “Misha Luo gently lowers the ceramic tea cup already in his hand onto the visible tabletop, then looks at the camera with a small warm smile as the camera slowly pushes in. Keep his face, clothing, noodle bowl, chopsticks, furniture and background consistent with the first frame; no new objects, no smoke, no effects, no speech. Animated 3D feature-film character, not photoreal.”
- Removed audio with `ffmpeg -i <source> -map 0:v:0 -an -c:v copy <final>`; source retained separately as `.source.mp4`.
- Final `misha-luo__sample__video-01__v1.mp4`: 720×1280, 6.041667 seconds, 3,768,318 bytes; ffprobe reports one video stream and no audio.
- Reviewed frames 0, 72 and 144: cup moves from hand to table; identity and setting stable; no new props or exaggerated effects. Review sheet: `.devspace-reports/site-round-7-5/samples/misha-video-review.png`.

## Zhang Qiang

- ChatGPT conversation: https://chatgpt.com/g/g-p-6ac396efc218819190830b751d24ab00/c/6ac84d22-7c10-83e9-8e06-edcffd4821fc
- References: `public/media/assets/zhang-qiang/turnaround.front.webp` and `face.front.webp`; identity from `media-pack/actors/zhang-qiang.json`.
- Two separate 941×1672 PNGs in `media-pack/library/samples/zhang-qiang/`: image-01 kitchen mug, image-02 film-set clapperboard. Reviewed against approved face; narrow face, asymmetric brows, hair and adult proportions retained.
- Grok first frame image-02; same identity references, 9:16, 6 seconds, 720p.
- Video prompt: “Zhang Qiang closes the raised top of the clapperboard already held in his hands once, then looks into the camera with a small calm smile as the camera slowly pushes in. Keep his face, clothing, clapperboard, tripod camera, lights and background consistent; no new objects, no smoke, no effects, no speech. Animated 3D feature-film character, not photoreal.”
- Final video: 720×1280, 6.041667 seconds, 1,964,864 bytes; `ffmpeg -map 0:v:0 -an -c:v copy`; ffprobe reports one video stream, no audio.
- Frame review 0/72/144: board closes and reopens, face stays recognizable, slow camera push-in. Board surface gains blank ruled lines during motion (minor texture drift); no new prop or exaggerated effect. Review: `.devspace-reports/site-round-7-5/samples/zhang-video-review.png`.

## Pre-existing changes excluded from this chat's commits

- Modified: `2026-10-09-grok-video-route.md`.
- Untracked: `2026-10-08-tommy-brannigan-delivered.md`, `2026-10-08-tommy-brannigan-run-log.md`, `2026-10-09-grok-route-progress.md`, `2026-10-09-new-face-proportion-fix-run.md`, `2026-10-09-tommy-brannigan-acceptance-progress.md`, `2026-10-09-yan-lin-casting-trial-run.md`.
- All paths above are under `media-pack/notes/handoffs/` and belong to other sessions.
