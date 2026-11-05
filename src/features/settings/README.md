# Setting references

One renderer-independent picker, shared by Guide and the scene panel. Twenty-six references, including the original six: 9 Indoor, 10 Outdoor and 7 Dusk / night (the six delivered night/dusk settings plus rooftop sunset). The existing UIKit segmented control shows one group at a time, with counts; switching groups selects its first card without discarding sentence edits. Only the visible group's previews mount. Pick a card to edit its own sentence, copy that sentence as a prompt, or save its reference image when supplied. No model calls, uploads, provider options or generated-output claims.

- `index.ts` exports `SettingCards`; `contracts.ts` is the pure public draft schema. Neither imports scene or Three. Guide keeps edits in page memory; scene stores the selected ID and all sentence edits in its existing local draft/history. Older version-1 scene drafts default this additive field safely.
- `src/content/settings.ts` is the image manifest and ID source. All 26 slots use the delivered MediaFactory references in `public/media/settings/`: run-1 keeps its 960 × 540 WebP previews, run-2 uses smaller 640 × 360 previews, and all downloads are unchanged 1664 × 936 PNGs retaining the original filenames. Save image is enabled for these real files. A future null slot still shows the honest pending label and disables saving. UI labels/default sentences belong only to `src/i18n/messages.source.ts`.
- For any replacement delivery, record provenance/licence here, review the real images, then fill `preview`, `download`, `filename`, `width` and `height` in the manifest. Use an approved local/owned image path; keep the original format's filename. The shared `fetchImageBlob` validates the MIME/body and `saveBlob` downloads the actual file. Preview images load lazily with responsive sizes. No renderer change or fake test-image substitution is needed.
- SSR renders the new sentence/choice controls disabled until React hydrates them. Use the server/client `useSyncExternalStore` snapshot, not an effect-driven setState or a lint exemption. Pixel review caught mixed initial/edited text on a fast load; the blocked-JS regression now proves edits cannot start before handlers are ready.
- The editable sentence remains selectable if clipboard access is denied. Copy reuses the existing site `CopyButton`, not a parallel clipboard implementation. Settings are references, never painted into the 3D canvas or PNG.

## Bounded acceptance mapping

| Changed source                                                                          | Related Playwright coverage                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| manifest, `features/settings/**`, integration in Guide/SceneEditor, new paired messages | `e2e/settings.spec.ts`: both routes × en/zh × 1440/390, all 26 selections and distinct edits across three counted groups, exact copied payload within the unchanged 300-character contract, 26 real lazy previews, enabled saves with actual PNG filename/dimensions/SHA equality (all 26 originals once and one save in each matrix case), scene reload, gated-JS hydration guard, denied-clipboard/selectable-text fallback, no generation requests or page errors |
| `site/CopyButton.tsx` optional copied caption                                           | `e2e/settings.spec.ts`: prompt-specific caption and focused existing-license default-caption/payload regression                                                                                                                                                                                                                                                                                                                                                      |
| additive scene draft and settings integration                                           | `e2e/scene.spec.ts`: static asset/draft contract (including old/invalid drafts), en/390 controls/clean-PNG smoke, runtime chunk isolation including Guide                                                                                                                                                                                                                                                                                                            |

The existing push selector adds changed-source format/lint/types and paired-message checks when messages change; browser mapping is explicit, not inferred from application imports. Clipboard APIs are isolated in-page fakes so acceptance never changes the Owner's OS pasteboard. Tests use the actual committed setting images, not generated download fixtures. Set `PLAYWRIGHT_EVIDENCE_DIR` and Playwright's `--output` to absolute receipt paths outside the repository for screenshots, reports and saved files. Physical phones, Safari and external image-tool fidelity remain untested. Unchanged renderer/asset/performance evidence is retained from the scene slice; no entire browser/timing suite is required for these cards.

## MediaFactory delivery — 2026-11-05

Source: `HQ/conductor/projects/MediaFactory/swimmerparty-settings-20261105/run-1/out/`, including `PROVENANCE.md` and `SENTENCES.md`. The Owner's `swimmerparty-settings-1` brief authorizes including these six originals in the website as previewable, downloadable setting references. They were generated with the built-in GPT Image `image_gen.imagegen` tool; its model version was not reported. The only image inputs were the Owner-supplied Polina Orlova and Thandiwe Dlamini actor references, for style/light/colour only. No third-party images were reported. This delivery is original synthetic scenery, not a real location or a 3D environment.

Licence boundary: the supplied provenance contains no separate asset-licence text or SPDX identifier. This import relies on the explicit Owner-directed website use/download authorization; it does not claim CC0, public-domain status, a third-party licence or a new standalone downstream setting licence. The existing actor licence and public licence copy are unchanged.

MediaFactory trimmed its 1672 × 941 generated outputs to 1664 × 936 without resizing. These delivered PNGs were opened individually again during website integration: no visible people, text, logos or watermarks; coherent empty settings with a clear central standing area. The website keeps those exact PNG bytes; only the previews are derived with Sharp 0.35.5 (`resize({ width: 960, withoutEnlargement: true }).webp({ quality: 84, effort: 4 })`), with no further crop. Manifest dimensions describe the original 16:9 canvas. The optional supplied English sentences are 351–404 characters, beyond the current 300-character edit contract, so the existing paired short defaults were retained and no messages were regenerated.

| Original filename | PNG SHA-256                                                        |
| ----------------- | ------------------------------------------------------------------ |
| `studio.png`      | `949c2aa421fdf45f4c362f63a92ee3c34f792cf4b7eb40e6dd200e19d018536d` |
| `cafe.png`        | `2372b516ed6ec72ac217a5fee54eb5116008f5c97790253aed4e1c9ebcfe7c0d` |
| `street.png`      | `0ae919a0434054aae455cd1af0d8e28231b8dc2eb6e41ce2f563bc2620e102b5` |
| `garden.png`      | `b58eac6c78292b945402265eff101294dccd34f595ab6c29b0d46b82782d769e` |
| `living-room.png` | `10e8d81c4e19ed83513d78c3b6a6182f5996620cb9ecff9092e2af133a056922` |
| `gym.png`         | `a843cd781cd1d44332a0f62f24692047c6174598ce8afc71499671dcd0de413a` |

## MediaFactory run-2 — 2026-11-05

Source: `HQ/conductor/projects/MediaFactory/swimmerparty-settings-20261105/run-2/out/{PROVENANCE.md,SENTENCES.md,SHA256SUMS.txt}`. The Owner's `swimmerparty-settings-2` brief authorizes these twenty additional website previews/downloads. The same licence boundary above applies: no standalone asset licence/SPDX was supplied, no CC0 or broader downstream licence is claimed. The built-in GPT Image `image_gen.imagegen` tool did not report a model version or seed. Its only image inputs were the same two Owner-supplied actor references for style/light/colour; no third-party images were reported. MediaFactory made 23 sequential calls, selected twenty outputs and trimmed 1672 × 941 to 1664 × 936 without resizing. These are synthetic scenery, not real locations.

All twenty PNG hashes were checked against the supplied checksums (the separate comparison CONTACT.png was checked but not imported). During website integration, city-street-night, alley-rain-night, campfire-night, bus-stop-dusk, snowy-street, stage-concert-night, park-path-day and rooftop-sunset were opened individually at original resolution. Their standing areas and night ground were readable, with no visible people, text or logos found; this is a qualitative inspection, not a calibrated or independent numerical score. The producer's provenance records its own individual inspection of all twenty.

PNG downloads keep the exact delivered bytes. New previews use Sharp 0.35.5 `resize({ width: 640, withoutEnlargement: true }).webp({ quality: 76, effort: 4 })`, no crop: 871,842 bytes total, at most 58,878 bytes each. Original six files and all page budgets/timeouts are unchanged; group-only mounting and native lazy loading avoid fetching 26 previews at entry. New Chinese defaults reproduce SENTENCES.md verbatim. Supplied English sentences exceed the existing 300-character editor/draft limit, so only these new defaults condense their scene, lighting, material, camera and clear-standing-area details; no other UI copy changes.

| Original filename         | PNG SHA-256                                                        |
| ------------------------- | ------------------------------------------------------------------ |
| `alley-rain-night.png`    | `ac006d0bedd6bb6c6774fadc7c6d585d367e6a4e99a21ed472fe8f459f2fa417` |
| `beach-boardwalk.png`     | `3c980facc1c4f5631dbe384955537c63e168c8bdf13934299f1ee02efda04b1c` |
| `bedroom.png`             | `39129098b56ab4e1de87abf5c91bf29af1a7af66fa74ff935b191c1435bbd53c` |
| `bus-stop-dusk.png`       | `2d0fc1bfdcdf107c3d62846c998b0268f3c2b8d4fd02b9037b7bcc50070ef568` |
| `campfire-night.png`      | `31f1d75386e382b0eb7f4a68ad7aa6755ddd415c4da5cfb71e04693b6acbb9b3` |
| `city-street-night.png`   | `72bc77b121b4010e381f51b8e7e840ee9e6620c1529fa265a61ad4e5892889ad` |
| `forest-clearing.png`     | `643af5ffda72a25ec15c1df3865c8935c8b39a9f43331ab2c6f031d9751fefcb` |
| `kitchen.png`             | `ba9c19b6783349809eb0d58cacc072a551af58dd1745f0063d1632e051d07b89` |
| `lakeside-dock.png`       | `c20262fa8fc571478c5a5c2e46da1d8cbd659854701474c75b444ee4dff3172b` |
| `library.png`             | `a5833a27d07fc5856ee121a0a74fadb96aa4dd1a87e1c95697a24f544d03175e` |
| `market-street.png`       | `250d16628f54bf9e8ea8702556b492465b8c40ca2463997571e79a73938cbbd3` |
| `mountain-lookout.png`    | `c99cf11c92bfabca3cc4800f3b1b759e7bbc5af113626a98fedca363053a1741` |
| `office.png`              | `85db29dc346613e93dbb2eea56917293c1081ac4a8488b99157b492af5f49fb9` |
| `park-path-day.png`       | `7df1b53fd469155fcd9369dba51fd6ced49dbe17eec59455207fa49d2cd968c1` |
| `rooftop-sunset.png`      | `67d3c7cab3389bf47e3d3b6538f979122bc3a2b1c06fbaad0c72acff81b6716b` |
| `school-classroom.png`    | `8a7a65aa290426c5974281f2f5ef47f5ea370354672bd477a291b99b3bd118d7` |
| `shop-front-street.png`   | `e74d9cfcaf683ba25764fb20143c63f0582a4988b8c6f3ea4723862f8dc749fc` |
| `snowy-street.png`        | `721470d34f5acf31d553150396d9c3e93df3b9105c88389dc0b332ee17c65c63` |
| `stage-concert-night.png` | `36892b64a56c92f0969edcdc32ca69eeb8ba2dc1848a5ac5568c0ad5dde72c24` |
| `train-platform.png`      | `92d6e87b588bfed97a95ef32c68cf1125d82be460250f496e4a2c48bc6494207` |
