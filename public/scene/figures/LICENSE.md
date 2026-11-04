# Licence & Provenance — SwimmerParty MPFB CC0 Stage Mannequin Family

## 1. Delivered Assets Licence (CC0 1.0 Universal)

All 21 3D mannequin GLB files delivered in `deliver/` (`slim.glb`, `average.glb`, `broad.glb`, and all 18 posed variants under `deliver/poses/*.glb`) are static mesh derivatives of the MakeHuman / MPFB 2.0.18 `hm08` base mesh (`data/3dobjs/base.obj`), morph targets (`data/targets/**/*.target.gz`), and standard rig weights (`data/rigs/standard/rig.default.json`, `weights.default.json`), which are dedicated to the public domain under **CC0 1.0 Universal (CC0-1.0)**.

**No MPFB Python add-on code is included in `deliver/` or shipped with these assets.**

---

## 2. Exact Upstream Source & Package Provenance

The read-only donor archive is pinned in `donors-individual-lock.json` at the repository root and independently verified against the upstream GitHub commit `d0a32e57a7f915cb2f2b95410e2117648c7bbb7e` (never inferred from `git rev-parse` inside an extracted extension directory):

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
   - The Python add-on was executed locally inside Blender 5.2.1 LTS during the build phase only. Zero lines of MPFB Python code are bundled in `deliver/`.

2. **Bundled 3D Base Mesh, Morph Targets, and Rigs (`CC0-1.0`, Source of Delivered GLBs)**
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
   - Upstream repository asset licence (`https://raw.githubusercontent.com/makehumancommunity/mpfb2/d0a32e57a7f915cb2f2b95410e2117648c7bbb7e/LICENSE.ASSETS.md`) confirms the bundled MakeHuman mesh/target/rig assets are released under **CC0 1.0 Universal**.
   - All morph targets applied during build calibration (`data/targets/macrodetails/*.target.gz`, `data/targets/measure/*.target.gz`, `data/targets/torso/*.target.gz`, `data/targets/arms/*.target.gz`, `data/targets/legs/*.target.gz`, `data/targets/neck/*.target.gz`, `data/targets/head/*.target.gz`, `data/targets/pelvis/bulge-decr.target.gz`, `data/targets/expression/units/caucasian/eye-left-closure.target.gz`, `eye-right-closure.target.gz`) belong to the same CC0 1.0 core dataset.
   - The procedural grey rough PBR material (`MannequinGrey`) and static pose joint angles were authored cleanly in `source/mannequin_config.json` and `source/build_mannequins.py` without third-party textures or external non-CC0 assets.
