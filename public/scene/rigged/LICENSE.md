# Licence & Provenance — SwimmerParty MPFB CC0 Rigged Stage Mannequin Family & Pose Shelf

## 1. Delivered Assets Licence (CC0 1.0 Universal)

All 6 skinned rest-pose 3D mannequin GLB files (`slim.glb`, `average.glb`, `broad.glb`, `slim-f.glb`, `average-f.glb`, `broad-f.glb`) and all 12 bone-local quaternion pose JSON files (`poses/*.json`) delivered in `handoff-rigged/` are derivatives of the MakeHuman / MPFB 2.0.18 `hm08` base mesh (`data/3dobjs/base.obj`), morph targets (`data/targets/**/*.target.gz`), and game-engine rig/weights (`data/rigs/standard/rig.game_engine.json`, `data/weights/game_engine/weights.game_engine.json`), dedicated to the public domain under **CC0 1.0 Universal (CC0-1.0)**.

**No MPFB Python add-on code (`GPL-3.0-or-later`) is included in `handoff-rigged/` or shipped with these assets.**

---

## 2. Exact Upstream Source & Package Provenance

The read-only donor archive is pinned in `donors-individual-lock.json` at the repository root and independently verified against upstream GitHub commit `d0a32e57a7f915cb2f2b95410e2117648c7bbb7e`:

| Field | Value |
|---|---|
| Donor ID | `mpfb` (MakeHuman Plugin For Blender) |
| Version / Tag | `2.0.18` (build `20261010`) |
| Upstream Git Repository | `https://github.com/makehumancommunity/mpfb2.git` |
| Upstream Git Commit | `d0a32e57a7f915cb2f2b95410e2117648c7bbb7e` |
| Upstream Assets Licence File | `https://raw.githubusercontent.com/makehumancommunity/mpfb2/d0a32e57a7f915cb2f2b95410e2117648c7bbb7e/LICENSE.ASSETS.md` |
| Official Package URL | `https://extensions.blender.org/download/sha256:c075b3e9b94b8e5556a5f03f4653602d02ea306de08126e8f55ed6dee28a2dad/add-on-mpfb-v2.0.18.zip` |
| Archive Size (bytes) | `45956992` |
| Archive SHA-256 | `c075b3e9b94b8e5556a5f03f4653602d02ea306de08126e8f55ed6dee28a2dad` |
| Shared Skeleton Definition | `data/rigs/standard/rig.game_engine.json` (`53` bones, CC0 1.0) |
| Shared Skinning Weights | `data/weights/game_engine/weights.game_engine.json` (CC0 1.0) |

---

## 3. Licence Split Between Add-on Code (GPL-3.0-or-later) and Bundled 3D Data Assets (CC0)

MPFB 2.0.18 separates the license of its Blender Python add-on code from the license of the bundled MakeHuman 3D mesh, target, and rig assets:

1. **Add-on Python Code (`GPL-3.0-or-later`, Excluded from Delivery)**
   - Declared in `.local-store/blender/extensions/blender_org/mpfb/blender_manifest.toml`:

```toml
id = "mpfb"
version = "2.0.18"
name = "MPFB"
maintainer = "Joel Palmius"
type = "add-on"
license = ["SPDX:GPL-3.0-or-later"]
```

   - The Python add-on was executed locally during the build phase only: Blender 5.2.1 LTS for the original delivery, Blender 5.2.0 LTS for the 2026-11-08 head revision. Zero lines of MPFB Python code are bundled in `handoff-rigged/`.

2. **Bundled 3D Base Mesh, Morph Targets, and Game Engine Rig (`CC0-1.0`, Source of Delivered GLBs & Poses)**
   - Exact verbatim first 16 lines from installed `.local-store/blender/extensions/blender_org/mpfb/data/3dobjs/base.obj` (lines 1–16):

```text
# This is a mesh file for MakeHuman
#
# This asset was explicitly released as CC0 in september 2020. The license
# text for CC0 can be found in the root of this repository.
#
# The copyright holders at the point of the release to CC0 were:
#
# Copyright (C) 2020 Data Collection AB, https://www.datacollection.se
# Copyright (C) 2020 Joel Palmius
# Copyright (C) 2020 Jonas Hauquier
#
# The primary legal contact for MakeHuman is Data Collection AB.
#
# For more information, see homepage at http://www.makehumancommunity.org
#
# basemesh hm08
```

   - Upstream repository asset licence (`https://raw.githubusercontent.com/makehumancommunity/mpfb2/d0a32e57a7f915cb2f2b95410e2117648c7bbb7e/LICENSE.ASSETS.md`) confirms the bundled MakeHuman mesh, target, rig (`rig.game_engine.json`), and skinning weight (`weights.game_engine.json`) assets are released under **CC0 1.0 Universal**.
   - The original procedural bob/bun (`append_sculptural_hair_to_bmesh` in `source/build_mannequins.py`), original-topology lip closure, female cheek/jaw shaping and front-cap taper (`close_original_lips`, `fill_female_cheeks`, `round_female_jaw`, `append_tapered_hair` in `source/build_rigged_bodies.py`; no replacement face patch or stretched skull), the procedural grey rough PBR material (`MannequinGrey`), and the 12 bone-local quaternion poses (`poses/{stand,walk,point,wave,sit,arms-crossed,lean-in,hand-on-hip,hands-on-table,look-over-shoulder,hug-ready,kneel}.json`) were authored cleanly as original procedural geometry/parameters in `source/rigged_config.json` and `source/build_rigged_bodies.py` without third-party meshes, textures, or external non-CC0 assets, and are dedicated to the public domain under **CC0 1.0 Universal (CC0-1.0)**.
