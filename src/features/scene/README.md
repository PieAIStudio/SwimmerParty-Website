# Scene

Optional local blocking tool at `/[locale]/scene`, reached from Your cast. It does not change actor data or download/account rules. Generic stand-ins are explicitly not delivered actor models. No generation, uploads, cloud saves, animation player or joint editor.

- `index.ts` is the server page entry; `SceneEditor` owns plain versioned draft/history and UIKit controls. Only its `dynamic(..., {ssr:false})` canvas imports Three/Fiber/Drei. Cast links disable prefetch. Do not export the canvas through a shared site/client barrel.
- `model.ts` owns limits, six pose/build/view IDs, camera fitting and local draft validation. Heights are centimetres; ground x/z are metres, Y is elevation, +Z is forward. Missing actor height starts at an explicitly approximate 175 cm. Body width changes use distinct prepared assets, not a whole-body horizontal stretch.
- The WebGL surface has a fixed neutral export palette, independent of the UI theme. Preview and PNG share the camera and aspect. Demand rendering, DPR capped at 1.5; no post-processing or remote lighting. Export renders at the requested dimensions, omits grid/selection and restores preview sizing in `finally`.
- `sp-scene-v1` saves one local draft; Undo/Redo is session-only (30 edits). More than five requested actors opens an explicit chooser without mutating the saved cast. Storage/WebGL failure leaves ordinary actor references and the Guide available.
- Setting references reuse `features/settings`, also used in Guide. Selected setting/sentence edits share this draft/history; old drafts receive defaults. References are not 3D backgrounds and never change the clean PNG. Image slots stay honestly empty until real MediaFactory references arrive; ownership and bounded integration checks are in `../settings/README.md`.

## Figure asset handoff

`loadFigure(build) → GLB URL` in `figure-assets.ts` is the sole runtime seam. `figures.json` owns the three URLs. Replace files/manifest entries, not renderer code, when MediaFactory delivers cleared MPFB CC0 GLBs.

Each GLB must use metres, +Y up, +Z forward, origin at the ground under the feet, neutral standing stature **1.75 m**, and contain six clips named exactly as `POSES` in `model.ts`. Each clip is a fully specified static pose at time 0 (including the root's grounded height). The rig/hierarchy may differ; `SkeletonUtils.clone` gives each figure independent pose state. Clear every animated transform when switching clips; neutral must restore the bind pose. Maximum **10,000 triangles per figure**; small, shared materials, no external/uncleared textures. Record exact asset provenance/licence with the delivered files before changing the manifest. The MIT renderer licence does not clear a model.

Current three GLBs are original texture-free sphere/cylinder placeholders: 3,176 triangles each. Their editable recipe is `generate-placeholders.mjs` (manual: `node src/features/scene/generate-placeholders.mjs`), not production actor assets. No Mannequin.js or GPL application code is shipped.

## Related acceptance mapping

| Changed paths                                                         | Bounded Playwright coverage                                                                                                                                          |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| scene route, `features/scene/**`, `public/scene/**`, cast stage entry | `e2e/scene.spec.ts`: cast choice, five figures/poses/builds/cameras, all PNG frames, draft/undo, asset contract, route chunk isolation and throttled Chrome evidence |
| shared header, dossier toolbar, heading offsets                       | `e2e/build-1-layout.spec.ts`: natural scroll, all labels visible, licence first view and jump clearance in both locales/sizes                                        |

The existing push selector runs changed-file format/lint/types, not browser acceptance. Run the mapped cases for the changed dynamic/layout seams; do not substitute `--only-changed` imports for source-to-screen coverage or launch the entire browser suite. Physical-phone thermals, Safari gestures, delivered CC0 assets and downstream AI image fidelity are not established by desktop Chrome emulation. The stage budget is **600 KB gzip additional JavaScript**, excluding the unchanged shell; measured route/chunk details and phone-size CPU-throttled results belong to the task receipt. `SCENE_EVIDENCE_PREFIX=B` keeps a later settings-integration run's screenshots/JSON separate from the retained C evidence.
