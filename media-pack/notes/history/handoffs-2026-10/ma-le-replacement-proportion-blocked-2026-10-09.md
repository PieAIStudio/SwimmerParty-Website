# Ma Le replacement proportion gate — blocked

Run: `run-mv0hcknk-683800a8`
ChatGPT conversation: `https://chatgpt.com/g/g-p-6ac396efc218819190830b751d24ab00-pics-a/c/6ac86faf-0d48-83e9-a692-298a313c64e5`
Date: 2026-10-09

## Result

The replacement run used a fresh Pics-A chat and three subscription messages. The browser returned one independent image for each message (3 images total). All three were independently downloaded and rejected. Every file is 941×1672 RGBA with an alpha channel and complete shoes, but the visible figure remains approximately 5.32–5.34 heads tall, far below the 7.3–7.7 target. All three also drift to a straight short hairstyle and navy shirt rather than Ma Le's curly permed black hair and mustard-yellow casting basics.

Measurements are recorded as `crownY`, `chinY`, `soleY`, `headsTall`, and the hair measurement rule in `library/actors/ma-le/evidence/replacement-20261009/replacement-{1,2,3}-measurement.json`. Rejected PNGs remain in `library/actors/ma-le/evidence/replacement-20261009/rejected/`.

## Gate

No replacement candidate passed the adult proportion gate. Nothing was moved to staging. `actors/ma-le.json` remains unchanged with `anchors.body: null`, `status.delivered: 0`, and `proposals.phase: audition-pending-owner`. The 55-image pack, six voice clips, and Grok sample were not started.

## Route limitation

The Codex In-app Browser did not expose a usable file chooser for attaching the current face reference in this run. The prompts therefore preserved only the actor JSON identity facts; no old rejected body image was used as a reference.

## Model separation correction

Execution-side Codex supervision for this handoff is fixed to `gpt-6.1-sol` with medium thinking. The ChatGPT web image route is a separate production surface and must use the work-order model `gpt-5.6-sol`; the Codex model setting must never be passed to or substituted for the web image model. No further web generation was started after this correction.
