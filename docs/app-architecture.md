# Breathe — Offline Expo App Architecture & Plan

**Belief-based, cross-tradition breath & energy practice. Offline-first. Non-medical.**

> **Product decision update (supersedes the "Tradition-mode switch" below).** There is **no user-facing
> lens chooser** (Tradition / Felt / Body) and **no layer toggles**. Each tradition pack delivers **one
> combined, tradition-forward experience** that weaves breath mechanics + felt sense + tradition symbolism
> together; **the tradition layer is always integral** (reduce-motion still simplifies the animation, not the
> symbolism). In the code this means: the old `AppMode` enum and `technique.belief_default_mode` are removed,
> theming follows the **active tradition** (`TraditionProvider`), and the "three-layer model" below describes
> internal *rendering layers*, not selectable modes.

This plan builds *on top of* the existing `deep-research-report.md` decisions (offline-first Expo/CNG, the three-layer model, the goal taxonomy, the SQLite content schema, the accessibility-first stance, and the versioned authoring pipeline). It does not re-derive them. It **refines** them toward the user's emphasis: **belief-based content across world traditions, with strong embodied visuals of how breath/energy is felt and moves through the body** — reconciled with safe, non-medical labeling.

## The reconciling principle (read first)

The tension to resolve: the user wants the app to *lean belief-based* (prāṇa, qi, lung, nadis, dantian, lataif, kundalini) with vivid embodied visuals — **not** a clinical "biohacking" tool. The prior report's safety mechanism is the **three-layer model** and a non-medical disclaimer posture. These are not in conflict; they compose.

The resolution is **separation of frame, not dilution of content**:

1. **Belief is presented as belief, fully and beautifully** — the symbolic/traditional layer ("Tradition mode") is the *default emotional center* of the app, rendered richly. We do not hedge prāṇa into "just slow breathing." We say: *"In the Hatha Yoga tradition, prāṇa is the vital force; here is how it is said to rise through sushumna."*
2. **The claim attached to belief is never medical.** Energy maps are labeled as **traditional / contemplative / belief-based models**, never as measured anatomy or physiological mechanism. Visuals of energy "moving through the body" are explicitly framed as *the tradition's image of felt experience*, supported by the interoception/body-map evidence base for *felt sense* (Nummenmaa-style maps), not by a claim that the app measures energy.
3. **Provenance and contestation are first-class content, not fine print.** The research summaries repeatedly flag that the rainbow-chakra system is a ~1977 Western synthesis, that Huna and Holotropic Breathwork are modern reconstructions, and that closed ceremonial practices (sweat lodge, orisha initiation, tummo) require initiation. The app encodes a `provenance` and `is_modern_synthesis` field per tradition/center so it can *honestly attribute* rather than flatten — this is both an ethics requirement and a differentiator.
4. **Belief-mode never relaxes physical safety gates.** Symbolic framing changes the *words and visuals*, never the *breath mechanics or contraindications*. A tummo-styled session and a plain "navel warmth" session run the **same** hyperventilation/retention safety gate underneath.

This is the throughline for every section below.

---

## 1. Confirmed tech stack & rationale (with additions for rich tradition visuals)

The stack confirmed in the prior report stands. **No reversals.** Additions below are specifically to support belief-based, embodied, per-tradition visuals.

### 1.1 Confirmed core (unchanged)

| Concern | Library | Status |
|---|---|---|
| Native generation | **Expo CNG / `expo prebuild`** | Confirmed |
| Navigation | **Expo Router** | Confirmed |
| Animation | **react-native-reanimated** (UI-thread worklets) | Confirmed |
| 2D drawing | **React Native Skia** | Confirmed |
| Gestures | **react-native-gesture-handler** | Confirmed |
| Audio | **expo-audio** | Confirmed |
| Haptics | **expo-haptics** | Confirmed |
| Local DB | **expo-sqlite** (SQLCipher path via prebuild if needed) | Confirmed |
| Files / packs | **expo-file-system** | Confirmed |
| Secrets | **expo-secure-store** | Confirmed |
| Localization | **expo-localization** + i18n lib | Confirmed |
| Validation | **Zod** | Confirmed |
| OTA / packs | **expo-updates**, **expo-background-task** | Confirmed (optional) |

### 1.2 Additions needed for rich tradition visuals

The prior report deliberately avoided "over-designed energy effects" *in the default mode*. The user's emphasis means we now want those effects to be **available and excellent — but gated behind motion preferences and per-tradition skins.** Recommended additions:

| Concern | Recommendation | Rationale |
|---|---|---|
| **Procedural energy fields, gradients, glows** | **Skia shaders (SkSL runtime effects) + Skia gradients** | Already have Skia. SkSL lets us render flowing prāṇa-light up sushumna, dantian glow, lataif color-photisms, nectar/amrita descent, and Nummenmaa-style felt-sense heatmaps **procedurally** (no heavy assets, fully themeable per tradition, animatable on the UI thread via Reanimated shared values fed into uniforms). This is the single most important visual addition. |
| **Crisp scalable sacred geometry** | **react-native-svg** | Yantras (Sri Yantra's 9 interlocking triangles), chakra lotus petal-counts (4/6/10/12/16/2/1000), enso, bagua/trigrams, Tree-of-Life sefirot graph, eight-pointed Sufi star. These are *line/geometry-defined* and authoring-friendly as data-driven SVG. Skia can also render paths, but SVG is the better authoring + accessibility (titles/roles) surface for static diagrams; use Skia for the animated/shaded layer on top. |
| **Hand-authored illustrative motion (optional packs)** | **Rive (preferred) or Lottie (fallback)** — *evaluate, do not hard-adopt at MVP* | For things genuinely hard to do procedurally — a coiling/uncoiling kundalini serpent, the Neijing-tu "inner landscape" waterwheels, a thangka-style channel diagram animating. **Rive** is favored: smaller runtime payload, state-machine driven (can be paced by the breath engine), better for offline packs. **Lottie** is the fallback if illustrators deliver After Effects. Decision: **ship MVP with Skia+SVG only; add Rive in the Tradition-pack phase** to avoid an extra native dependency early. |
| **Color/gradient theming engine** | Internal token system on top of Skia/SVG (see §6) | Each tradition needs its own palette and motif set; this is config, not a new dependency. |
| **Body silhouette + region hit-testing** | Skia paths + `react-native-svg` regions, backed by a `body_region` table | Powers both the felt-sense reflection map and the energy-center placement per tradition. |

**Explicitly deferred / not added:** no 3D engine (no `expo-gl`/Three) — the visual language is 2D inner-landscape/diagram/field, which Skia+SVG cover. No physics engine. BLE/sensors remain out of MVP exactly as the prior report scoped.

---

## 2. Navigation & screen map (Expo Router)

Building on the prior report's shallow, goal-led navigation, **add a first-class Traditions/Explore section** and make the **Tradition-mode switch** a global, persistent control.

### 2.1 The global Tradition-mode switch

Three modes (confirmed from prior report), persisted in `user_profile.beliefModePref` and overridable per-session:

- **Body & Breath** — anatomy-adjacent language (nose, chest, diaphragm, belly, pace). Minimal, clinical-clean visuals (pacer circle, box, diaphragm dome). The "safe default" framing.
- **Felt Sense** — interoceptive vocabulary (warmth, expansion, tingling, openness, settling). Nummenmaa-style body heatmaps, expanding/contracting glows, color-temperature gradients. Evidence-anchored to interoception/body-map research.
- **Tradition** — the belief-based heart of the app. Full symbolic content for the selected tradition (prāṇa/qi/lung/lataif), rich shader+SVG energy visuals, sacred geometry, lineage and provenance notes.

The switch is a segmented control available on the technique-detail and session screens, plus a global default in settings. **Switching mode re-skins the same underlying session** (same phases, same safety gates) — it changes vocabulary, visuals, and audio guidance variant, nothing about pacing or contraindications.

### 2.2 Screen map (Expo Router file tree)

```
app/
  _layout.tsx                     # Root: theme provider, mode provider, a11y provider, DB init
  (tabs)/
    _layout.tsx                   # Bottom tabs: Home · Explore · Traditions · Reflect · Settings
    index.tsx                     # HOME: resume, quick-start by goal, daily rhythm
    explore/
      index.tsx                   # EXPLORE/LIBRARY: browse by Goal (primary) / Technique family
      goal/[goalCode].tsx         # Goal landing (Calm, Sleep, Focus, Energy, ...)
      technique/[slug].tsx        # TECHNIQUE DETAIL: summary, safety, durations, mode toggle, preview
    traditions/
      index.tsx                   # TRADITIONS HOME: gallery of world traditions (cards w/ motif art)
      [traditionSlug]/
        index.tsx                 # TRADITION OVERVIEW: cosmology, lineage, provenance, energy-body map
        map.tsx                   # Interactive subtle-body / energy-center map (centers, channels)
        center/[centerSlug].tsx   # Energy-center detail (e.g., Manipura, Lower Dantian, Qalb)
        practices.tsx             # Practices belonging to this tradition (links to technique detail)
    reflect/
      index.tsx                   # REFLECTION HISTORY: past felt-sense maps, journal, trends
    settings/
      index.tsx                   # SETTINGS root
      accessibility.tsx           # reduce-motion override, screen-reader mode, captions, haptics, fontScale, contrast
      content-packs.tsx           # Bundled core + downloadable tradition packs (size, license, download/remove)
      safety.tsx                  # Disclaimers, contraindication profile, advanced-content unlock
      about-traditions.tsx        # Attribution, provenance policy, "what is belief-based" explainer
  session/
    [templateId].tsx              # SESSION PLAYER (modal/fullscreen, KeepAwake while active)
    complete.tsx                  # COMPLETION → routes into reflect flow
  safety-gate/[techniqueId].tsx   # Interstitial safety check (advanced/hyperventilation gating)
  modal/
    glossary.tsx                  # Cross-tradition glossary (Sanskrit/Tibetan/Arabic/Chinese terms)
    disclaimer.tsx                # Reusable non-medical disclaimer sheet
```

**Navigation notes**
- **Traditions** is its own tab (not buried under Explore) — this is the structural expression of the user's belief-based emphasis.
- **Explore** stays goal-first (Calm, Focus, Sleep, Recovery, Energy, Breath mechanics, Meditative awareness, Traditional practice) per the confirmed taxonomy; technique family is the secondary axis.
- The **safety gate** is a route, not a checkbox — advanced/hyperventilation techniques *cannot* deep-link straight into the player; they route through `safety-gate/` first.
- Tradition cards and center maps deep-link into the same `technique/[slug]` and `session/` screens; a session always knows which tradition skin launched it (`launchContext`).

---

## 3. Session / breath engine design

Refines the prior report's Reanimated+Skia session engine to add an **energy-transition timeline** layered over the existing phase model — the mechanism that drives "energy moving through the body" visuals in sync with breath.

### 3.1 Layered model

A runnable session = **a technique** (what) + **a session_template** (timing blueprint) + **a tradition skin** (vocabulary/visual/audio variant) + **an energy script** (optional, per tradition).

```
Technique ──> SessionTemplate ──> [ Phase, Phase, Phase, ... ]   (the pacing spine)
                                        │
                  Tradition skin ───────┤  (re-labels phases, swaps visuals/audio)
                                        │
                  Energy script ────────┘  (timeline of EnergyEvents bound to phases)
```

### 3.2 Phase model (confirmed, with cue layers)

Each `phase` carries: `seq`, `type` (`inhale | hold_in | exhale | hold_out | rest | free`), `seconds`, `cueStyle`, `bodyRegionCode`, and breath route (`nasal | mouth | either`). The engine emits **multimodal cues at every transition** in ≥4 modalities (text, shape, optional audio, optional haptic) — color never carries a phase change alone (confirmed a11y rule).

| Cue layer | Mechanism | Belief-mode behavior |
|---|---|---|
| **Visual pacer** | Reanimated shared value `phaseProgress` (0→1) drives Skia/SVG | Body&Breath: plain expand/contract or box. Tradition: energy field + center glow |
| **Text** | Short phrase per phase, mode-specific string key | "Inhale" vs "Draw prāṇa up" vs "Feel the breath rise" |
| **Audio** | expo-audio: optional spoken guidance + chime/bed; captions always available | Per-tradition narration variant; optional bija/seed-tone per body region |
| **Haptic** | expo-haptics: tap at transitions, softer on exhale/completion | Rising buzz pattern for "energy up the spine"; settling pulse for grounding. **Never safety-critical** (no-op in iOS Low Power Mode) |

### 3.3 Energy-transition timeline (new)

An **energy script** is an ordered list of `EnergyEvent`s, each bound to a phase `seq` (or a fraction of a phase), describing the tradition's narrative of where energy is felt/moving. This is what makes the visuals "embodied."

```ts
type EnergyEvent = {
  atPhaseSeq: number;
  atPhaseFraction?: number;        // 0..1 within the phase
  motion: 'rise' | 'descend' | 'pool' | 'expand' | 'circulate' | 'settle' | 'ignite';
  fromRegion?: string;             // body_region.code
  toRegion?: string;               // body_region.code
  centerSlug?: string;             // energy_center to glow/activate
  channelSlug?: string;            // energy_channel to illuminate (e.g., sushumna, du_mai)
  intensity: number;               // 0..1 -> shader uniform
  colorToken: string;              // resolved per tradition theme
  label_key: string;               // localized, belief-framed caption
};
```

Examples encoded as data (not code):
- **Tummo (Tibetan):** `ignite` at navel center on `hold_in`, `rise` navel→crown along central channel on `exhale`, `descend` (nectar) crown→navel on next `inhale`. Fire-below / nectar-above polarity. *Runs the standard kumbhaka safety gate.*
- **Microcosmic Orbit (Daoist):** `circulate` up Du Mai (back) on inhale, down Ren Mai (front) on exhale — a closed loop animation.
- **Kundalini/sushumna (Yogic):** `pool` at Muladhara, `rise` up central axis through chakras on successive cycles.
- **Sufi nafy-wa-ithbat:** breath-borne Name driven from navel up to and "struck" into the qalb (heart) — lataif glow in sequence.

The engine maps `phaseProgress` × active `EnergyEvent` → Skia shader uniforms (position along channel, glow intensity, color) and SVG opacity/transform. **In Body & Breath mode the energy script is ignored.** In Felt Sense mode it renders as neutral heatmap motion (warm/cool, expand/settle) without tradition labels. In Tradition mode it renders fully with sacred-geometry overlays and labels.

### 3.4 Engine architecture

- **Pacing clock** runs as a Reanimated worklet on the UI thread (jank-proof if JS is busy logging). Drives `phaseProgress` and `cycleIndex` shared values.
- **Cue dispatcher** reacts to phase transitions → fires haptics (JS bridge), advances audio, updates caption text.
- **Energy renderer** subscribes to shared values → feeds Skia SkSL uniforms + SVG props. Pure render, no state.
- **Session recorder** logs to `practice_session` / `session_event` (pause, resume, slow, stop, safety_exit) — append-only.
- **Controls always present:** pause / slow-down / stop, prominent and reachable; "stop" is a single tap (trauma-aware, exit-friendly — confirmed).
- **Reduce-motion path:** energy renderer swaps continuous shader motion for cross-fades + static labeled stills; pacer becomes a stepped/text indicator. This is a first-class render path, not a degraded afterthought.

---

## 4. Content & data model — extensions to the confirmed schema

The prior report's schema (`technique`, `technique_alias`, `technique_goal`, `contraindication_rule`, `session_template`, `phase`, `media_asset`, `translation_string`, `user_profile`, `accessibility_pref`, `practice_session`, `session_event`, `body_map_entry`, `sensor_summary`, `sync_oplog`, `content_version`) is the base. Below are the **new and changed tables** to represent traditions, energy centers/channels, visual themes/skins, body regions, transitions, and felt-sense vocabulary.

### 4.1 New tables

**`tradition`** — a world tradition/lineage.
| Field | Type | Notes |
|---|---|---|
| `id` | pk | |
| `slug` | text unique | `yogic`, `tibetan_vajrayana`, `daoist`, `zen_hara`, `theravada_anapanasati`, `sufi`, `kabbalah`, `greek_western_esoteric`, `modern_breathwork`, `science_informed`, `indigenous_pacific` |
| `displayName_key` | text | localized |
| `family` | text | `indic`, `tibetan`, `chinese`, `japanese`, `buddhist`, `islamic`, `jewish`, `western_esoteric`, `modern`, `indigenous` |
| `cosmology_summary_key` | text | localized belief-framed overview |
| `lineage_notes_key` | text | transmission/lineage context |
| `provenance` | text enum | `classical`, `medieval`, `modern_synthesis`, `contested`, `reconstruction` |
| `is_modern_synthesis` | bool | true for rainbow-chakra, Huna, Holotropic, WHM-as-tummo |
| `requires_initiation_note` | bool | flags tummo/tsa-lung, orisha, sweat-lodge as initiatory — show respect banner |
| `is_closed_practice` | bool | true → present as *about*, never as a reproducible "technique" (sweat lodge, orisha init) |
| `belief_label_key` | text | the exact "this is a traditional/belief model" disclaimer variant |
| `default_theme_id` | fk → `visual_theme` | |

**`energy_center`** — a center/locus within a tradition (chakra, dantian, latifa, sefirah, tanden, lung-wheel).
| Field | Type | Notes |
|---|---|---|
| `id` | pk | |
| `traditionId` | fk | |
| `slug` | text | `muladhara`, `lower_dantian`, `qalb`, `tanden`, `navel_chakra_tib` |
| `displayName_key` | text | localized (Sanskrit/Tibetan/Arabic etc.) |
| `ordinal` | int | order along the axis (root→crown, lower→upper) |
| `bodyRegionCode` | fk → `body_region` | placement on silhouette |
| `geometry_motif` | text | `lotus`, `triangle_up`, `triangle_down`, `crescent`, `square`, `hexagram`, `circle`, `flame`, `point` |
| `petal_count` | int nullable | for lotuses (4,6,10,12,16,2,1000) |
| `seed_syllable_key` | text nullable | LAM/VAM/RAM/YAM/HAM/OM, AH, HUM, Hu |
| `color_token` | text | resolved via theme |
| `color_provenance` | text enum | `classical_element` vs `modern_rainbow` — **lets UI honestly label** |
| `element_key` | text nullable | earth/water/fire/air/ether; wuxing phase |
| `deity_or_figure_key` | text nullable | presiding figure (aniconic traditions: null) |
| `felt_quality_keys` | json | linked felt-sense tags typically reported here |
| `notes_key` | text | contestation notes ("classical color differs from popular") |

**`energy_channel`** — a channel/vessel/path.
| Field | Type | Notes |
|---|---|---|
| `id` | pk | |
| `traditionId` | fk | |
| `slug` | text | `sushumna`, `ida`, `pingala`, `du_mai`, `ren_mai`, `central_channel_tib`, `right_channel`, `left_channel` |
| `displayName_key` | text | |
| `role` | text enum | `central`, `left`, `right`, `governing`, `conception`, `loop`, `minor` |
| `path_geometry_id` | fk → `body_path` | the drawable path on the silhouette |
| `color_token` | text | |
| `polarity_key` | text nullable | lunar/solar, yin/yang, white/red |
| `notes_key` | text | "left/right colors contested / reverse by gender" |

**`body_region`** — canonical regions of the body silhouette (front/back), shared across traditions and felt-sense maps.
| Field | Type | Notes |
|---|---|---|
| `code` | pk text | `crown`, `brow`, `throat`, `heart`, `solar_plexus`, `navel`, `lower_belly`, `perineum`, `spine_*`, `nostrils`, `chest`, `whole_body` |
| `displayName_key` | text | |
| `view` | text enum | `front`, `back`, `both` |
| `svg_region_id` | text | hit-test region id in the silhouette asset |

**`body_path`** — drawable channel/loop geometries on the silhouette (normalized 0..1 coords or SVG path data).
| Field | Type | Notes |
|---|---|---|
| `id` | pk | |
| `kind` | text | `straight_axis`, `spiral`, `loop`, `branch` |
| `path_data` | text | SVG path / control points |
| `view` | text enum | front/back |

**`visual_theme`** (skin) — per-tradition palette + motif set that the design system resolves at runtime.
| Field | Type | Notes |
|---|---|---|
| `id` | pk | |
| `traditionId` | fk nullable | null = neutral/Body&Breath/Felt-Sense theme |
| `slug` | text | `yogic_tantric`, `daoist_inner_landscape`, `tibetan_thangka`, `zen_sumi`, `sufi_geometric`, `neutral_clinical`, `feltsense_thermal` |
| `palette_json` | json | named color tokens (bg, axis, glow_warm, glow_cool, accent, center_default...) |
| `gradient_json` | json | gradient stops for shaders |
| `motif_set` | text | `lotus_yantra`, `neijing_landscape`, `channels_wheels`, `enso_ink`, `girih_star`, `minimal_pacer`, `thermal_heatmap` |
| `shader_key` | text nullable | which SkSL effect to use |
| `reduce_motion_fallback` | text | static-asset/crossfade variant id |
| `license_ref` | fk → `media_asset` nullable | if theme uses commissioned art |

**`energy_script`** — the timeline binding energy events to a session template (see §3.3).
| Field | Type | Notes |
|---|---|---|
| `id` | pk | |
| `templateId` | fk → `session_template` | |
| `traditionId` | fk | which tradition's narrative |
| `events_json` | json | array of `EnergyEvent` (validated by Zod) |
| `summary_key` | text | "energy journey" description for detail screen |

**`felt_sense_vocab`** — controlled vocabulary for subjective qualities (powers Felt-Sense mode + reflection tags).
| Field | Type | Notes |
|---|---|---|
| `code` | pk text | `warmth`, `cool`, `tingling`, `pressure`, `expansion`, `openness`, `flow`, `heaviness`, `lightness`, `settling`, `vibration`, `pulsation`, `tightness` |
| `displayName_key` | text | |
| `valence_default` | int | -1/0/+1 hint |
| `color_temp` | text | warm/cool/neutral → drives heatmap |
| `body_region_affinity` | json | regions where commonly reported |

### 4.2 Changed / extended existing tables

**`technique`** — add tradition + belief-framing fields.
| Added field | Notes |
|---|---|
| `primaryTraditionId` | fk → `tradition` (a technique can also map to many via join, below) |
| `requires_safety_gate` | bool — true for hyperventilation/long-retention/advanced |
| `intensity_class` | enum `gentle | moderate | advanced_caution` |
| `belief_default_mode` | enum — which mode this technique leads with (e.g., tummo → `tradition`) |

**New join `technique_tradition`** (`techniqueId`, `traditionId`, `role`) — a practice (e.g., alternate-nostril) can appear under multiple traditions with different framing.

**`session_template`** — add `defaultThemeId` (fk → `visual_theme`) and `defaultEnergyScriptId` (fk, nullable). Keep `phaseJson` for the pacing spine.

**`phase`** — extend `bodyRegionCode` to fk → `body_region`; add `breath_route` (`nasal|mouth|either`) and `cue_modality_mask` (which modalities fire).

**`media_asset`** — already has `licence`, `attribution`, `bundled`, `checksum`. Add `pack_id` (fk → `content_pack`) and `rights_class` enum (`commissioned`, `cc0`, `cc_by`, `cc_by_nc`, `public_domain`, `proprietary`) to enforce the rights manifest (see §5).

**`contraindication_rule`** — unchanged structurally, but seed data must be **tradition-agnostic and keyed to breath mechanics** (retention, hyperventilation, forced breath, prolonged holds), so belief framing can never bypass it.

**New `content_pack`** (`id`, `slug`, `kind` = `core|tradition|voice|illustration`, `traditionId` nullable, `version`, `sizeBytes`, `checksum`, `license_summary_key`, `min_app_version`) — the unit of bundling/download (see §5).

### 4.3 Key relationships

```
tradition 1─* energy_center ─* (felt_sense_vocab via affinity)
tradition 1─* energy_channel ─1 body_path
tradition 1─* visual_theme
tradition *─* technique           (via technique_tradition)
technique 1─* session_template 1─* phase
session_template 1─? energy_script ─* EnergyEvent(json) ─> energy_center / energy_channel / body_region
content_pack 1─* media_asset
body_region 1─* (energy_center placement, phase.bodyRegionCode, body_map_entry)
```

---

## 5. Offline content packaging strategy

Confirms the prior report's bundled-core + downloadable-packs model; specifies the split for traditions and the rights regime.

### 5.1 Bundled core (ships inside the app binary)

Keep the binary lean and universally useful offline on first launch with **zero network**:
- **Engine + all schema + Zod validators.**
- **Core technique set** (confirmed onboarding order): slow diaphragmatic/resonance, guided breath awareness, gentle humming, box, 4-7-8, alternate-nostril. These are cross-tradition-neutral and safe.
- **Neutral + Felt-Sense themes** (procedural Skia/SVG — near-zero asset weight).
- **One "starter" Tradition** rendered fully procedurally (recommend **Yogic prāṇa/chakra**, the most recognizable) so Tradition mode is demonstrable offline out of the box.
- **All UI strings** for default locale + the cross-tradition glossary stub.
- **All disclaimers, safety-gate copy, contraindication rules.**

### 5.2 Downloadable tradition packs (`content_pack.kind = 'tradition'`)

Each major tradition beyond the starter is its own pack: Tibetan Vajrayana (tsa-lung/tummo), Daoist (dantian/orbit/Neijing-tu), Zen/Hara, Theravāda ānāpānasati, Sufi lataif, Western esoteric, Modern breathwork, Science-informed. A pack contains: tradition/center/channel/theme/energy-script seed rows (SQLite import), localized strings, any **commissioned illustrations or Rive files**, and voice-guidance audio.

- Stored via **expo-file-system** in the document directory (safe from system reclamation); **checksum-verified** on download and at load; pack metadata in SQLite.
- Procedural-first: prefer SkSL+SVG so most packs are tiny (mostly text + audio). Hand-art (Rive/Lottie) only where procedural can't express the motif (Neijing-tu landscape, coiling serpent, thangka diagrams).
- **Voice packs** (`kind='voice'`) and **illustration packs** (`kind='illustration'`) split out so users on small devices can take Tradition content without large audio.
- Optional **expo-updates** channel for shipping pack *catalog* and content patches separately from app code (confirmed). Packs themselves download on demand, not via OTA, to keep OTA payloads small.

### 5.3 Asset rights (enforced, not aspirational)

The research stresses these are **sacred, lineage-transmitted, frequently-commercialized** systems. Rights policy:
- **Prefer commissioned or CC0/public-domain** art (confirmed). Avoid **CC BY-NC** unless permanently accepting non-commercial constraint (monetization unspecified).
- Every `media_asset` carries `rights_class`, `licence`, `attribution`. **Build-time gate:** a packaging script (Zod-validated) **fails the build** if any bundled/packed asset lacks license + attribution, or if `rights_class = cc_by_nc` while a "commercial" flag is set.
- **Closed-practice guard:** assets/content for `tradition.is_closed_practice = true` (sweat lodge, orisha initiation) are **descriptive/educational only** — no runnable session template, no reproduced rite. Enforced by a rule that closed traditions cannot own a `session_template` with executable phases.
- Per-tradition attribution and a provenance note are surfaced in `settings/about-traditions.tsx` and on each tradition overview — attribution is product surface, not a buried credits file.

---

## 6. Visualization layer architecture

How the design system plugs into Skia/Reanimated and themes per tradition.

### 6.1 Three-tier render stack

```
┌─ Tier 3: Sacred geometry & labels (react-native-svg) ───────────┐
│   lotus petals, yantra triangles, enso, bagua, sefirot graph,    │
│   seed-syllable glyphs, center labels, channel outlines          │
├─ Tier 2: Energy field & motion (Skia + SkSL shaders) ───────────┤
│   procedural glow, gradients, flowing light along channels,      │
│   dantian/navel ignition, nectar descent, felt-sense heatmap;    │
│   uniforms fed by Reanimated shared values (phaseProgress, etc.) │
├─ Tier 1: Body silhouette + base layout (Skia paths / SVG) ──────┤
│   front/back figure, body_region hit areas, axis line            │
└──────────────────────────────────────────────────────────────────┘
   driven by ▶ Reanimated worklet clock (UI thread) from §3 engine
```

### 6.2 Theming per tradition (token resolution)

A **`ThemeProvider`** resolves the active `visual_theme` (from tradition default, or mode) into a flat token map consumed by every renderer:

```
mode + traditionId ─> visual_theme row ─> {
   palette_json, gradient_json, shader_key, motif_set, reduce_motion_fallback
}  ─resolve─>  ThemeTokens { bg, axis, glowWarm, glowCool, centerColor(slug), channelColor(slug), accent }
```

- **Tier 2 shaders** read colors/gradients from tokens as SkSL uniforms — same shader, different palette per tradition (Daoist earthy-jade/cinnabar vs Tibetan blue-central/red-right/white-left vs Sufi color-photism set).
- **Tier 3 SVG** reads `motif_set` to choose which geometry component to mount (LotusYantra vs EnsoInk vs GirihStar vs SefirotTree vs MinimalPacer).
- **Color provenance honesty:** when an `energy_center.color_provenance = 'modern_rainbow'`, the center-detail UI shows the "modern synthesis" badge — the theme can render the popular rainbow *and* tell the truth about it.

### 6.3 Motion / performance discipline (confirmed, extended)

- All continuous motion runs from Reanimated shared values on the UI thread; renderers are pure functions of those values.
- **Reduce-motion contract:** every theme declares `reduce_motion_fallback`. When reduce-motion is on (system or app override), Tier 2 swaps shader animation for static gradient stills + cross-fades; Tier 3 geometry stops spinning; pacer becomes stepped/text. No vortex/swirl/tunnel under reduce-motion (Apple motion guidance).
- **Battery:** KeepAwake only during active session; drop shader frame budget / particle count under low-power; haptics optional and non-critical (iOS Low-Power no-op).
- **Felt-Sense heatmap** is a single SkSL effect parameterized by `body_region` activation values from `body_map_entry` / live `EnergyEvent`s — reused for both reflection and live session.

---

## 7. Localization & accessibility plan

Confirms the prior report's split (UI i18n vs content i18n, React Native a11y stack, WCAG 2.2) and specifies handling for sacred-language terms.

### 7.1 Localization

- **Two layers:** UI strings via `expo-localization` + i18n lib (react-i18next or Lingui); **content** strings (tradition/center/channel names, narration, glossary) keyed in `translation_string` / `*_key` columns so they version with content packs.
- **BCP-47 for sacred terms.** Term fragments embedded in another-language sentence must carry the correct language tag so TTS/screen readers pronounce or skip-spell correctly:
  - Sanskrit (Devanagari or IAST transliteration): `sa` / `sa-Latn` (e.g., प्राण / `prāṇa`)
  - Tibetan: `bo` / `bo-Latn` (e.g., gtum mo / tummo)
  - Arabic (Sufi terms, divine Names): `ar` (e.g., نفس nafas, هو Hu)
  - Chinese (Daoist): `zh-Hans` / pinyin `zh-Latn-pinyin` (氣 qì, 丹田 dāntián)
  - Japanese (Zen/Hara): `ja` / `ja-Latn` (丹田 tanden, 円相 ensō)
  - Hebrew (Kabbalah sefirot): `he`
- Each glossary entry stores: native script, transliteration, BCP-47 tag, pronunciation note, gloss. The UI applies `accessibilityLanguage` with the right tag to each fragment.
- **RTL** via `I18nManager` for Arabic/Hebrew UI; mixed-direction handling for transliteration inside LTR sentences.
- **No transliteration-as-translation:** prāṇa is not "rendered" as "energy" in copy; it is named, then explained — consistent with the belief-based stance.

### 7.2 Accessibility (WCAG 2.2 + RN stack)

- **Phase announcements** to VoiceOver/TalkBack via accessibility live regions; respect Android "time to take action" / recommended accessibility timeout from `AccessibilityInfo`.
- **`AccessibilityInfo` queries:** screen-reader state, reduce-motion, high-contrast/high-text-contrast — merged with `accessibility_pref` overrides (confirmed table).
- **Four-modality rule (confirmed):** every cue available as text + shape + optional audio + optional haptic; **color alone never signals a phase**. Captions always available for narration.
- **Sacred visuals are decorative-by-default to screen readers**, with an opt-in "describe energy" verbose mode that reads the `EnergyEvent.label_key` and center/channel names (with correct BCP-47) — so a blind practitioner can follow the "energy journey" as narration.
- **Text-only session mode** and static-cue mode are first-class (not fallbacks).
- **Trauma-aware:** single-tap stop, grounding prompt available, shorter durations, dizziness/distress check in reflection (confirmed). This applies *especially* to intense Tradition-mode practices.

---

## 8. Safety, disclaimers & content gating

Reconciles belief-based richness with non-medical safety. The rule: **belief framing is unlimited; physical-safety gating is non-negotiable and frame-independent.**

### 8.1 Belief-mode labeling

- Persistent, honest, non-buried labels (confirmed posture). Tradition content carries a per-tradition `belief_label_key`: e.g., *"Prāṇa and the chakras are concepts from the Yogic/Tantric tradition — a contemplative and belief-based model of felt experience, not a measured anatomical or medical structure."*
- **Provenance badges** rendered from `tradition.provenance` / `is_modern_synthesis`: the rainbow-chakra scheme, Huna, Holotropic Breathwork, and "WHM = tummo" are visibly tagged **modern synthesis / reconstruction** per the research, not presented as ancient.
- **Initiatory/closed-practice respect banners** from `requires_initiation_note` / `is_closed_practice`: tummo/tsa-lung, orisha initiation, sweat lodge shown *about*, with a note that authentic transmission requires a qualified lineage holder; closed practices are never reproduced as runnable techniques.
- Global non-medical disclaimer (App Store + Google Play Health-content aligned): Breathe is for **well-being, education, and contemplative practice**; **not a medical device**; does **not diagnose, treat, cure, or prevent** any condition. Reusable `modal/disclaimer.tsx` surfaced at onboarding, in technique detail, and in store copy.

### 8.2 Advanced / hyperventilation gating

- Techniques with `requires_safety_gate = true` (cyclic hyperventilation/Wim-Hof-style, long kumbhaka/retention, bhastrika/kapalabhati at intensity, tummo-styled retention) **route through `safety-gate/[techniqueId].tsx`** before any session — cannot be deep-linked or auto-started.
- The gate enforces (driven by `contraindication_rule`, breath-mechanics-keyed): explicit warnings (never in/near water, while driving, not standing unsupported), contraindication acknowledgement (syncope, seizure, cardiovascular disease, pregnancy, respiratory disease, high panic sensitivity → advise medical guidance / block), seated-or-lying confirmation, manual start, and **no retention "competition"** mechanics.
- **One-time advanced unlock** in `settings/safety.tsx`; advanced content hidden by default for beginners (confirmed onboarding ordering: gentle techniques first).
- **Frame-independence guarantee (the core reconciliation):** a tummo session in full Tradition skin and a plain "navel heat" session in Body & Breath share the *same* `contraindication_rule` set and the *same* safety gate. Symbolic visuals/audio for intense practices stay deliberately calm — no immersive trance overlays on the highest-risk patterns (confirmed). Belief mode changes words and art; it never unlocks a gate or alters pacing/holds.

---

## 9. Milestone roadmap & project initialization

### 9.1 Roadmap (MVP → full)

| Phase | Scope | Builds on / adds |
|---|---|---|
| **0 — Init & foundations** | Expo CNG project, Expo Router skeleton, SQLite + Zod, theme/mode/a11y providers, disclaimer + safety-gate routes, content-build script (rights manifest enforcement) | Confirmed foundation + new packaging script |
| **1 — Session engine MVP** | Pacing worklet clock, phase model, four-modality cues, pause/slow/stop, session logging | Confirmed engine |
| **2 — Embodied UX MVP (Felt Sense)** | Body silhouette + `body_region`, Felt-Sense heatmap (SkSL), reflection flow, reduce-motion path | Confirmed body-map + new render stack |
| **3 — Core content library** | Slow/resonance, breath awareness, humming, box, 4-7-8, alternate-nostril; Body & Breath mode | Confirmed core set |
| **4 — Tradition mode (starter)** | Tradition tab, Yogic starter tradition (procedural chakras/nadis/kundalini via SkSL+SVG), energy-script engine, tradition theming, belief labels + provenance badges | **New: §2–6 belief layer** |
| **5 — A11y & localization hardening** | Screen-reader phase announcements, BCP-47 sacred-term handling, glossary, captions, contrast themes, "describe energy" verbose mode | Confirmed a11y + new sacred-language plan |
| **6 — Advanced gating** | Safety-gate route, contraindication seed data, advanced unlock, hyperventilation/retention locks | Confirmed gating + frame-independence rule |
| **7 — Tradition packs** | Downloadable packs (Tibetan, Daoist, Zen, Theravāda, Sufi, Western, Modern); evaluate + add **Rive** for hand-art motifs; voice/illustration pack split | **New: §5 packaging** |
| **8 — Optional sync / OTA content** | Append-only oplog sync, OTA pack catalog/patches | Confirmed optional |
| **9 — Release validation** | Maestro UI/a11y flows, accessibility audit, battery profiling, store compliance (privacy policy, Health declaration, disclaimers) | Confirmed validation |

**MVP line = Phases 0–4** (offline, Body&Breath + Felt-Sense + one full Tradition). Phases 5–6 are required before public release. Phases 7–9 are post-MVP expansion.

### 9.2 Concrete initialization (Expo not yet initialized)

> Run from `C:\code\breathe`. These are the execution-ready steps; the planning doc stays read-only.

```bash
# 1. Scaffold Expo + Expo Router (CNG; managed/bare split is deprecated)
npx create-expo-app@latest . --template tabs   # tabs template ships expo-router

# 2. Core confirmed dependencies
npx expo install react-native-reanimated react-native-gesture-handler
npx expo install @shopify/react-native-skia
npx expo install expo-audio expo-haptics
npx expo install expo-sqlite expo-file-system expo-secure-store
npx expo install expo-localization expo-keep-awake
npx expo install expo-updates expo-background-task        # optional channels

# 3. Tradition-visual additions
npx expo install react-native-svg                          # sacred geometry (Tier 3)
# Skia shaders (SkSL) need no extra dep — part of @shopify/react-native-skia
# Rive deferred to Phase 7:
# npx expo install rive-react-native                        # add when building tradition packs

# 4. JS-only libs
npm i zod
npm i i18next react-i18next            # or: npm i @lingui/core @lingui/react

# 5. Dev / test
npm i -D jest-expo @types/jest
# Maestro for UI/a11y flows (installed separately, used in Phase 9)

# 6. Generate native dirs (CNG) when a native dep / config plugin needs it
npx expo prebuild

# 7. Run
npx expo start
```

**Key config to set during Phase 0:**
- `app.json` / `app.config.ts`: app name, slug, scheme (`breathe://`), iOS/Android bundle IDs, `userInterfaceStyle`, privacy policy URL, plugins array.
- **Reanimated:** add `react-native-reanimated/plugin` as the **last** Babel plugin in `babel.config.js`.
- **expo-router:** set `scheme` + typed-routes; entry via `expo-router/entry`.
- **expo-sqlite:** plan SQLCipher via config plugin only if encrypted storage is later required (needs prebuild; not in Expo Go) — confirmed.
- **expo-localization:** enable supported locales; pair with chosen i18n lib.
- Add a **content-build script** (`scripts/build-content.ts`): authors (MDX/Sheets export) → Zod validate → emit SQLite seed + JSON → **fail build on missing license/attribution** or closed-practice with executable phases (§5.3).
- **EAS** (`eas.json`) for build/update channels — set up before Phase 8/9.

---

### Summary of how this plan refines (not re-derives) the prior decisions

- **Keeps** the entire confirmed stack, three-layer model, goal taxonomy, base schema, accessibility-first stance, and versioned authoring pipeline.
- **Adds for belief + visuals:** Skia SkSL shaders + react-native-svg (and a deferred Rive evaluation) as the visualization engine; a Traditions tab + global tradition-mode switch; an energy-transition timeline layered over the existing phase model; seven new tables (`tradition`, `energy_center`, `energy_channel`, `body_region`, `body_path`, `visual_theme`, `energy_script`, `felt_sense_vocab`, `content_pack`) plus targeted extensions to `technique`, `session_template`, `phase`, `media_asset`, `contraindication_rule`.
- **Reconciles** belief and safety via four rules: belief is presented as belief (richly, with honest provenance badges), the attached claim is never medical, provenance/closed-practice respect is first-class content, and **belief mode never relaxes a physical-safety gate** (frame-independence).

Relevant file: `C:\code\breathe\deep-research-report.md` (the prior research this plan extends).