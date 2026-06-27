# Breathe — Visual & Sensory Design System

> **Scope.** How the Breathe app *renders* breath and felt energy as it moves and transitions through the body — built for **Skia + Reanimated** with a **reduce-motion variant for every animation**. This is a design-and-engineering spec: tokens, geometry, motion paths, multi-modal cue tables, theme catalog, and a11y rules.
>
> **Framing rule (non-negotiable, applies everywhere below).** Energy models (prana, qi, lung, lataif, sefirot, mana, etc.) are presented as **living tradition and felt-experience**, never as biomedical fact. Where a color/diagram scheme is a modern Western synthesis (notably the rainbow chakra ladder), it is **labeled `MODERN`**; classical schemes are labeled `CLASSICAL`. Initiatory/closed practices (tummo, tsa-lung, deity yoga, Qur'anic tajwid, Lakota inípi, didgeridoo "men's business," Munay-Ki) are depicted descriptively and **never as do-it-yourself technique skins**. A neutral, non-mystical **Default Pacer** is always the first-run experience and the fallback for everyone.

---

## 0. Foundations: cross-tradition visual grammar

Before per-tradition tokens, these primitives recur everywhere and are the building blocks of the whole system. They come straight from the convergent research (felt-sense vocabulary + visual-motif surveys).

### 0.1 Shape primitives (the "energy lexicon")

| Primitive | Meaning (cross-tradition) | Skia construct |
|---|---|---|
| **Expanding circle / orb** | Inhale, fullness, source-from-center; the universal pacer | `Circle` w/ animated `r` |
| **Contracting circle** | Exhale, release, settling | `Circle` w/ animated `r` |
| **Vertical axis / column** | Central channel (sushumna / Du Mai / uma / spinal rise) | `Path` line + `LinearGradient` |
| **Rising particle stream** | Energy ascending (kundalini, qi up the back, lung→central) | Skia particle field along a path |
| **Closed loop (back-up / front-down)** | Circulation completing (Microcosmic Orbit) | `Path` Bézier loop + traveling dot |
| **Upward triangle / flame** | Active, fire, heat, yang, ascending | `Path` + flame shader |
| **Downward triangle / crescent** | Receptive, water, settling, yin | `Path` |
| **Lotus / petalled wheel** | An energy center; petals = active/awakened | `Path` radial petals |
| **Bindu → concentric rings** | Source + culmination; ripple of sound/vibration | nested `Circle`s, animated |
| **Halo / radiant field** | Refined/transcendent state, grace, light | `RadialGradient` + blur |
| **Fine grain / shimmer** | Tingling, vibration, "pins and needles" | low-amplitude noise shader |
| **Wave / ripple sweep** | Flooding rapture (piti), settling exhale wave | `Path` sine sweep |

### 0.2 Motion → meaning mapping (the breath-phase grammar in one line each)

- **Inhale** = expand · brighten · cool→warm shift begins · rise along axis
- **Hold (full)** = stillness at max scale · gentle pulse/shimmer · gathering at a center
- **Exhale** = contract · dim · downward settling wave · release
- **Rest (empty)** = minimum scale · near-static · spaciousness/dark calm

### 0.3 Global motion tokens

```
motion.easing.breath      = cubic-bezier(0.37, 0, 0.63, 1)   // symmetric, organic
motion.easing.settle      = cubic-bezier(0.22, 1, 0.36, 1)    // decel for exhale/rest
motion.fps.target         = 60   (Skia frame budget ≤ 8ms)
motion.particle.maxCount  = 120  (reduce-motion: 0)
motion.amplitude.scale    = 1.0  (reduce-motion: 0.0–0.15)
motion.pulse.holdHz       = 0.5  (subtle breathing-at-rest pulse during holds)
```

### 0.4 Global color tokens (semantic, theme-agnostic)

```
phase.inhale.from / .to     // each theme overrides
phase.exhale.from / .to
phase.hold.glow
phase.rest.base
surface.bg.calm             // deep, low-chroma background
text.onSurface.hi / .lo
energy.rise                 // the "ascending" accent
energy.settle               // the "grounding" accent
heat.core                   // belly/navel warmth
light.refined               // crown/transcendent white-gold
```

All palettes below are expressed as design tokens (hex + role). Hexes are starting values tuned for **WCAG-safe contrast on dark surfaces**; the system ships dark-first with a light variant.

---

## 1. Per-tradition visual language → tokens, palettes & motif sets

Each tradition gets: **(a)** a palette table, **(b)** a motif set, **(c)** a `MODERN`/`CLASSICAL` note, **(d)** attribution/handling note.

### 1.1 Indian Yogic — Chakra ladder + nadi channels

**Palette — `MODERN` rainbow ladder** (label this in UI; it is a 20th-c. Theosophical/Leadbeater synthesis, *not* classical doctrine):

| Token | Center | Hex | Role |
|---|---|---|---|
| `chakra.root` | Muladhara | `#D7263D` | base / grounding |
| `chakra.sacral` | Svadhisthana | `#F46036` | flow |
| `chakra.solar` | Manipura | `#F4D35E` | fire / will |
| `chakra.heart` | Anahata | `#3DA35D` | opening (alt pink `#E89BB0`) |
| `chakra.throat` | Vishuddha | `#2E86AB` | expression |
| `chakra.brow` | Ajna | `#3B3B98` | insight |
| `chakra.crown` | Sahasrara | `#E6E6FA`→`#FFFFFF` | transcendence |

**Palette — `CLASSICAL` element scheme** (offered as a "Classical" toggle; do not imply equivalence with the rainbow):

| Center | Element | Classical color cue |
|---|---|---|
| Muladhara | earth | deep red + **yellow square** |
| Svadhisthana | water | **white crescent** |
| Manipura | fire | **downward red triangle** |
| Anahata | air | vermilion/gold + **hexagram** |
| Vishuddha | ether | smoky/white circle |
| Ajna | mind | white + **OM**, 2 petals |
| Sahasrara | — | luminous white "whiter than full moon" |

**Motif set:** lotus wheels with exact petal counts (4·6·10·12·16·2·1000); element-yantras (square/crescent/△/✡/circle); ida (left, cool/white-blue) + pingala (right, warm/red) spiraling around central **sushumna**; coiled **serpent** (kundalini, 3½ coils) at base → rising column of light; bija glyphs (LAM·VAM·RAM·YAM·HAM·OM) as optional center marks.

**Note:** Default chakra skin ships with the `MODERN` palette but with an inline "Modern color system — learn more" affordance; the `CLASSICAL` toggle swaps to element colors/geometry.

### 1.2 Chinese Daoist — Dantian + Microcosmic Orbit

**Palette (`CLASSICAL`, neidan):**

| Token | Hex | Role |
|---|---|---|
| `dao.dantian.glow` | `#E8A33D` (cinnabar-gold "golden stove") | lower belly warmth |
| `dao.qi.flow` | `#9FD8CB` | circulating qi (cloud-vapor) |
| `dao.du.rise` | warm gradient `#C75C3A→#E8A33D` | up the spine (yang) |
| `dao.ren.settle` | cool gradient `#3E6E8E→#2A4D5E` | down the front (yin) |
| `dao.taiji` | `#1A1A1A` / `#F2F2F2` | yin-yang |
| `dao.wuxing.*` | wood `#3C8C5A`, fire `#C0392B`, earth `#C9A227`, metal `#E8E8E8`, water `#1F3A4D` | five-phase coding |

**Motif set:** three stacked **dantian** (belly/heart/head) as soft furnaces/fields; **Microcosmic Orbit** as a closed loop — up the back (Du Mai), over crown, down the front (Ren Mai), tongue-to-palate "magpie bridge" as the join; qi rendered as **cloud-vapor/steam** (echoing 米+气); Neijing-tu "inner landscape" (spine-as-mountain) as an optional rich backdrop; **taiji** + bagua (Kan ☵ water / Li ☲ fire) for the fire-water marriage.

**Note:** `CLASSICAL`. Dantian are **not** chakras; the orbit is **not** kundalini — keep visually distinct (loop vs. ladder).

### 1.3 Tibetan Vajrayana — Central channel + tummo

**Palette (`CLASSICAL`, Naropa/Gelug schema — flag color/side assignments as lineage-contested):**

| Token | Hex | Role |
|---|---|---|
| `tib.central` | `#2D4FA3` (blue; sometimes white-out/red-in) | uma / avadhuti |
| `tib.right.roma` | `#C0392B` (red) | right channel |
| `tib.left.kyangma` | `#F4F4F4` (white) | left channel |
| `tib.navel.fire` | `#E85C2B→#FFB347` | tummo flame at navel |
| `tib.crown.drop` | `#FFFFFF` | white drop (HAM) |
| `tib.bliss.descend` | warm-white wash | melting drops / four joys |

**Motif set:** three vertical channels (central + two side) twisting/knotting at chakra-wheels (crown 32 / throat 16 / heart 8 / navel 64); seed-syllables (inverted white **HAM** crown, red **OM** throat, blue **HUM** heart, red **short-A** navel); navel **flame rising**, nectar **descending**; rainbow/mirage "empty-yet-apparent" deity glow.

**Note:** `CLASSICAL`, **initiatory**. Present as educational depiction only; **no operative tummo/tsa-lung "skin" that instructs vase-breath retention.** Do not collapse into Hindu ida/pingala.

### 1.4 Sufi — Lataif color points

**Palette (Naqshbandi-Mujaddidi; mark colors as lineage-contested):**

| Latifa | Location | Hex |
|---|---|---|
| `sufi.qalb` | below left breast | `#F4D35E` (yellow; some lineages red) |
| `sufi.ruh` | below right breast | `#C0392B` (red) |
| `sufi.sirr` | upper chest | `#FFFFFF` (white) |
| `sufi.khafi` | upper chest/brow | `#1B1B2F` (black; some blue) |
| `sufi.akhfa` | center chest | `#2E8B57` (green) |
| `sufi.nafs` | navel/brow | `#E0C36A` |

**Motif set:** colored "subtleties" on a torso silhouette; **aniconic** geometry only (no deities/figures) — eight-pointed star (Breath of the Compassionate uniting elements), girih/rosette patterns, calligraphic **Allah / Hū**; **black light** (nur-e-siyah) as an intentional motif of overwhelming intensity; **qabd/bast** as a contraction↔expansion of the whole field.

**Note:** Lataif **superficially** resemble chakras but are Qur'anic psycho-spiritual organs — do **not** chakra-map them. Treat Names/Hū as sacred; no remixing of Qur'anic recitation. The Inayatiyya elemental "purification breaths" (earth=gold, water=green, fire=red, air=blue, ether=grey) are a distinct, more accessible modern lineage — label as such.

### 1.5 Other tradition palettes (compressed)

| Tradition | Key colors | Motifs | MODERN/CLASSICAL | Handling |
|---|---|---|---|---|
| **Buddhist anapanasati** | luminous `#FFF7E0` nimitta on dark | bright orb/disc at nostril (cotton-wool→gem→midday-sun), enso | n/a (imageless) | No chakra overlay; abdomen vs nostril focus is contested → user choice |
| **Japanese hara / zazen** | cinnabar `#C75C3A` tanden, ink-black/white | tanden as "rolling ball," **ensō**, sumi-e stroke | tanden = lower dantian (credit Chinese root) | Non-mantric; do not assign bija/chakra |
| **Kabbalah (sefirot)** | per-pillar; Keter white, Tiferet gold, Malkhut earth | **Tree of Life** on Adam Kadmon, Hebrew letters | medieval; "Hermetic" color scales are 19th-c. occult | Theology-of-God first; not a breath-circuit |
| **Korean SunDo / danjeon** | warm belly-gold, three tancheon | mountain imagery, taegeuk | danjeon = dantian | Indigenous-claim flagged as tradition's account |
| **Vietnamese Plum Village** | calm greens, lotus, bamboo | calligraphic circle, bell, gatha text | modern mindfulness | Buddhist; attribute to Thích Nhất Hạnh |
| **Sikh Naam Simran** | Ik Onkar gold, deep blue | **Ik Onkar (ੴ)**, Khanda, **no chakra art** | n/a | Breath carries the Name; never label 3HO/Yogi-Bhajan content as Sikhi |
| **Hesychasm** | gold/white Tabor light | Christ icon, prayer-rope knots, mandorla | n/a | Christ-name essential; technique strictly secondary |
| **Egyptian / ANE** | gold ankh, lapis | **ankh-to-nostrils**, ka-arms, ba-bird | belief/iconography | Not a teachable breath technique |
| **Indigenous (Andean)** | luminous egg, sami-light vs dark hucha | poq'po bubble, chakana, despacho | sami/hucha is *modern* paqo systematization | Flag Munay-Ki as disputed/fabricated |
| **Modern science** | clinical sine-waves, cool→warm | **box square**, expanding circle, HRV sine | evidence-based | Keep separate from belief content |

---

## 2. Body-map design

### 2.1 Silhouette spec

- **Two views:** `front` and `back` (back needed for spinal-rise, Du Mai, Tibetan central channel). A `profile` view is optional for Neijing-tu / dantian depth.
- **Construction:** single androgynous, abstracted humanoid `Path` (no facial features, no gender markers) on a 1080×1920 logical canvas; seated-meditation pose default, standing pose for body-map screens.
- **Layered render order (back-to-front):** `bg field` → `silhouette fill` → `channel layer` → `center-overlay layer` → `motion/particle layer` → `phase-cue (orb)`.
- **Anchor points (normalized 0–1 along body axis, front view):**

```
anchor.perineum   = 0.06
anchor.lowerBelly = 0.18   (sacral / lower dantian / shakti kendra)
anchor.navel      = 0.30   (solar / navel chakra / tummo / hara·tanden)
anchor.solar      = 0.38
anchor.heart      = 0.52   (anahata / middle dantian / qalb-ruh / Tabor)
anchor.throat     = 0.66
anchor.brow       = 0.82   (ajna / upper dantian / darshan)
anchor.crown      = 0.94   (sahasrara / niwan / gyan / Dasam Duar)
```

Back view adds a continuous **spinal path** `spine = bezier(perineum→crown)` for ascending motion; front adds `frontMidline = bezier(crown→lowerBelly)` for the Daoist descent.

### 2.2 Region list (tap targets + screen-reader regions)

`crown, brow, throat, heart, solar-plexus, navel, lower-belly, perineum/base, spine (back), front-midline (back/front loop), left-channel, right-channel, hands, feet`. Each region is a Skia hit-path with an a11y label (see §7).

### 2.3 How center-overlays differ per tradition mode

The body silhouette is constant; an **overlay adapter** swaps which anchors are lit, the geometry drawn at each, and the channel rendering:

| Mode | Centers shown | Channel layer | Distinctive overlay |
|---|---|---|---|
| **Default (non-mystical)** | none, or single belly glow | none | just breath orb over torso |
| **Chakra (MODERN/CLASSICAL)** | 7 ladder anchors crown→base | ida/pingala spiral + sushumna (back) | lotus + petal count + bija |
| **Daoist** | 3 dantian | **orbit loop** (back-up/front-down) | furnace glow at lower dantian; cloud-vapor |
| **Tibetan** | 4 wheels | 3 channels twisting | navel flame + crown drop |
| **Sufi lataif** | 5–6 chest/head points | none | colored discs, aniconic, no spine ladder |
| **Hara/Zazen** | 1 (tanden) | none | single "rolling ball" at navel |
| **Buddhist breath** | 0 centers | none | nimitta orb at nostril OR abdomen rise/fall |

**Rule:** modes never mix iconography (no lotus on a Daoist body, no deity on a lataif body). Switching mode is an explicit, labeled choice, and the **Default** mode is selectable from anywhere.

---

## 3. Breath-phase visualization grammar

### 3.1 The four-phase visual contract

Every pacer, in every skin, animates these four phases. Timings come from the program (e.g., 4-7-8, box 4-4-4-4, coherent ~5.5 bpm / 5.5s-in-5.5s-out).

| Phase | Shape | Expansion | Color | Light | Motion |
|---|---|---|---|---|---|
| **Inhale** | orb grows | scale 0.45→1.0 | `phase.inhale.from→to` (cool→warm in some skins) | brighten +; soft bloom appears | rise along axis; particles drift up |
| **Hold (full)** | orb static at max | hold 1.0 | `phase.hold.glow` | steady max bloom + faint 0.5Hz pulse | shimmer/grain only; gather at center |
| **Exhale** | orb shrinks | scale 1.0→0.45 | `phase.exhale.from→to` (warm→cool) | dim −; bloom recedes | settling wave downward; particles fall/dissolve |
| **Rest (empty)** | orb at min | hold 0.45 | `phase.rest.base` (deep, low chroma) | darkest, calm | near-static; one slow drift |

A thin **progress ring** or **filling arc** around the orb optionally shows phase duration (non-color-dependent timing cue — see a11y).

### 3.2 Default non-mystical pacer ("Calm Orb")

- **Visual:** one soft circle on `surface.bg.calm`; cool teal→warm amber inhale, reverse on exhale; gentle bloom; **no body, no centers, no symbols**.
- **Why default:** widest comfort, no cosmology, the safe fallback for reduce-motion and for anyone who hasn't chosen a tradition skin.
- **Box variant:** swap circle for the **square pacer** — a dot traces four equal sides (inhale up, hold across, exhale down, hold back), the canonical box-breathing motif.

### 3.3 Richer tradition skins (built on the same 4-phase contract)

- **Chakra Rise:** inhale lights the next center up the ladder; a light-bead climbs sushumna on the back view; exhale settles it; full cycle can walk root→crown over a session.
- **Microcosmic Orbit:** inhale = warm bead rises up the spine (Du); exhale = cool bead descends the front midline (Ren); the loop visibly *closes* at the lower dantian.
- **Tummo Ember (educational):** inhale stokes a navel flame (grows, warms); hold = flame steady; exhale = soft nectar-white wash descends — depicted, **not** instructed as retention.
- **Ocean (Ujjayi):** inhale/exhale rendered as a wave-front sweeping the torso; audible-wave sound character; throat-region subtle highlight.
- **Hara Ball:** a warm "rolling ball" at the tanden swells/sinks with the belly; ensō stroke completes over the cycle.
- **Nimitta:** for stillness practice — a faint luminous disc at the nostril/abdomen that *steadies and brightens* as cycles accumulate (rewarding settledness, not forcing).

---

## 4. "Felt energy" & transition representation

This is the heart of the spec: concrete, performant Skia + Reanimated recipes for **movement of sensation through the body**, each with a **reduce-motion fallback**. Felt-quality vocabulary (warmth, tingling, vibration, pressure, expansion, flow, heaviness, lightness, settling) drives the visual encoding.

> Implementation pattern for all of them: a Reanimated `progress` shared value (0→1 across the phase) drives a Skia `useDerivedValue`. Particles use a single Skia `Atlas`/points draw, capped at `motion.particle.maxCount`. Reduce-motion swaps the animated derivation for **two crossfaded static frames** (start/end) or a single opacity ramp.

### 4.1 Rising prana up sushumna (ascending current)

- **Full motion:** a vertical `LinearGradient` light beam on the back-view spine, plus 60–100 particles spawning at `perineum`, drifting to `crown` with eased upward velocity; each center briefly **blooms** as the beam passes (sequential petal-open). Cool→warm gradient ascends; faint shimmer overlay = tingling.
- **Felt cue encoded:** warmth + "electric current" rising → warm hue + upward particle flow + per-center bloom.
- **Reduce-motion fallback:** no particles, no travel. Instead, **sequentially fade in** a soft glow at each center root→crown over the phase (opacity only), or a single static "lit spine" gradient that gently brightens. No vertical translation.

### 4.2 Microcosmic orbit loop (circulation completing)

- **Full motion:** one bright bead travels a closed Bézier loop — up the back, over the crown, down the front — synced so **inhale=ascend, exhale=descend**; a faint trailing comet-tail; lower dantian pulses warm when the loop closes.
- **Reduce-motion fallback:** the loop **path itself** stays static; replace the moving bead with a **gradient that sweeps along the path via a masked opacity ramp** (no positional motion to track), or simply alternate two states: "back-arc lit" (inhale) ↔ "front-arc lit" (exhale) as a crossfade.

### 4.3 Heat pooling in belly / tummo navel-fire (kindling & warmth)

- **Full motion:** a `RadialGradient` ember at `navel`/lower-dantian that **grows in radius and chroma** on inhale, holds, and on exhale spreads warmth outward into the torso (radius expands, opacity softens). Optional low-amplitude flame shader (Perlin-driven) for "blazing."
- **Felt cue:** warmth/fullness/pressure low in the belly → growing warm radial + slight scale.
- **Reduce-motion fallback:** static ember; encode the build with **opacity/chroma ramp only** (dim warm → bright warm), no flicker, no radius animation. Cap chroma so it never strobes.

### 4.4 Chest opening (heart / anahata expansion)

- **Full motion:** at `heart`, a soft form **expands outward** (scale + bloom) on inhale with a gentle warm-green or rose wash; a faint two-interlocking-triangles (hexagram) or simple ring "opens"; exhale softens it. Slight whole-upper-torso lift.
- **Felt cue:** expansion/openness/softening, sometimes ache → outward scale + bloom + warm tone.
- **Reduce-motion fallback:** crossfade between "closed" and "open" heart states (opacity), or a single static open glow whose **brightness** breathes (≤0.15 amplitude). No scaling.

### 4.5 Settling exhale wave (grounding / release)

- **Full motion:** on exhale, a **wave-front sweeps downward** from crown/chest to base and "drains" into the ground line (or into Pachamama-style earth glow in Andean skin / Du-to-dantian in Daoist); particles fall and dissolve; background dims to `phase.rest.base`. Heaviness encoded as a slight downward drift of the whole field.
- **Felt cue:** sinking, heaviness, spaciousness, "letting go."
- **Reduce-motion fallback:** a vertical gradient **dims top→bottom over the exhale** (opacity ramp), ending in calm dark; no wave translation, no falling particles.

### 4.6 Tingling / vibration (texture overlay, any phase)

- **Full motion:** very low-amplitude Skia **noise/grain shader** modulated by a slow oscillator, localized to whatever region is "active."
- **Reduce-motion fallback:** **disabled entirely** (grain shimmer is exactly the kind of motion reduce-motion users avoid); replace with a static stippled texture at fixed low opacity, or nothing.

### 4.7 Performance & safety guardrails (all effects)

```
- One Skia Canvas; effects composited as layers, not nested Canvases.
- Particle count auto-scales down on low-end devices (frame-time watchdog).
- No effect exceeds ~1.5 cycles/sec visible oscillation (flash-safety; avoid 3–60Hz).
- Chroma/brightness deltas capped to prevent strobing; bloom uses cached blur.
- Reduce-motion path is a separate render branch selected once at mount, not per-frame.
```

---

## 5. Multi-modal cue mapping table

Every phase/transition maps to **visual + audio + haptic + text**. Haptics gentle and optional; audio non-mystical by default (tones/drone) with tradition sound-characters layered only in skins. Text is the screen-reader / caption channel (see §7 for SR specifics).

| Phase / Transition | Visual | Audio | Haptic | Text (caption / SR) |
|---|---|---|---|---|
| **Inhale** | orb grows; brighten; rise | rising soft tone / pad swell; (Ujjayi: ocean-in) | gentle ramp-up buzz (intensity ↑ with amplitude) | "Breathe in" |
| **Hold (full)** | static max; faint pulse | sustained drone; (chant: held vowel/Hū) | one soft tap at start, then still | "Hold" |
| **Exhale** | orb shrinks; dim; settle wave | falling tone; (Ujjayi: ocean-out; Om: M-hum) | gentle ramp-down buzz | "Breathe out" |
| **Rest (empty)** | min scale; dark calm | near-silence / low pad | none (or single very soft tick) | "Rest" |
| **Phase change (any)** | shape inflection point | soft chime / transient | light tick at boundary | (SR announces next phase) |
| **Energy rising (4.1)** | spine beam + upward particles | ascending shimmer / pitch glide up | low→high traveling buzz (if device supports) | "Energy rising along the spine" |
| **Orbit loop (4.2)** | bead up-back/down-front | tone up then down per half | tap at crown, tap at belly (loop ends) | "Circulating up the back and down the front" |
| **Belly heat (4.3)** | growing navel ember | warm low drone swells | warm sustained low rumble (gentle) | "Warmth gathering in the belly" |
| **Chest opening (4.4)** | heart bloom/expand | gentle major-interval swell | soft expanding double-pulse | "The chest opens" |
| **Settling wave (4.5)** | downward drain + dim | descending pad, resolve to low note | descending fade buzz | "Settling… releasing downward" |
| **Session start** | fade-in field | single grounding tone | one welcome tap | "Beginning. Find a comfortable position." |
| **Session end** | fade to calm dark | resolving chord / bell | gentle completion pattern | "Complete." |

**Sound character is a theme property** (see §6): Default = neutral tones; richer skins add ocean (Ujjayi), bell/Tabor, ney/Hū (Sufi), low chordal drone (Tibetan, *recordings used respectfully, not gamified*), kirtan-style call-response (Sikh/Hindu), didgeridoo drone (Aboriginal — recreational/respectful only, never ceremonial content). **All audio and haptics are independently toggleable**; nothing is required to follow the pacer.

---

## 6. Tradition "skins" / themes catalog

Each theme = **{name, palette ref, motif, motion style, sound character}**. The **Default** is non-mystical and always present.

| # | Name | Palette | Motif | Motion style | Sound character |
|---|---|---|---|---|---|
| 0 | **Calm Orb (Default)** | semantic phase tokens, teal↔amber | single breathing circle, no body | smooth symmetric expand/contract | neutral tone pad + soft chime |
| 1 | **Box / Tactical** | cool clinical blues | square pacer, dot tracing sides | linear equal-side traversal | metronomic soft ticks |
| 2 | **Coherence (HRV)** | cool→warm sine | sine-wave + orb | slow 5.5bpm sine | low resonant hum (~6/min feel) |
| 3 | **Chakra Rise** | §1.1 MODERN (toggle CLASSICAL) | lotus ladder + sushumna serpent | bead climbs spine, centers bloom | bija seed-tones (LAM→OM), optional |
| 4 | **Microcosmic Orbit** | §1.2 Daoist | 3 dantian + closed loop, cloud-vapor | bead up-back/down-front loop | qi drone, water-tone settle |
| 5 | **Tummo Ember** *(educational)* | §1.3 Tibetan | navel flame + crown drop, 3 channels | ember stoke + nectar descent | low chordal drone (respectful) |
| 6 | **Ocean (Ujjayi)** | deep blue-greens | wave-front over torso | wave sweep in/out | ocean inhale/exhale |
| 7 | **Hara / Ensō** | cinnabar + ink | rolling ball at tanden, ensō stroke | belly swell/sink, brush completes | single low tone, wood tap |
| 8 | **Lataif Light** | §1.4 Sufi | aniconic colored points + 8-pt star | gentle per-point illumination, qabd/bast field | ney drone, soft "Hū" on exhale |
| 9 | **Nimitta (Stillness)** | dark + luminous cream | single brightening disc | minimal; disc steadies over cycles | near-silence + faint bell |
| 10 | **Tree of Light (Sefirot)** | per-pillar | Tree-of-Life nodes lighting downward | descent of light Keter→Malkhut | resonant low tones |
| 11 | **Naam (Sikh)** | Ik Onkar gold / deep blue | Ik Onkar glyph, no chakra art | gentle pulse on the Name per breath | kirtan-style call/response (respectful) |
| 12 | **Sami / Poq'po (Andean)** | luminous egg | energy bubble, light-down / heavy-drain | sami shower in, hucha drains to earth | nature ambience, soft flute |

Reduce-motion variants of every skin collapse to opacity/crossfade per §4; tradition-specific iconography remains but stops translating/oscillating.

---

## 7. Accessibility rules

### 7.1 Reduce-motion (system-respecting, mandatory)

- **Detect** OS "Reduce Motion" (and an in-app override toggle). When on, mount the **reduce-motion render branch** for every animation listed in §3–§4.
- **Allowed in reduce-motion:** opacity ramps, crossfades between two static states, *very* slow brightness "breathing" (≤0.15 amplitude, ≤0.5Hz). **Disallowed:** translation of objects to track, particle systems, grain/shimmer, flame flicker, looping bead travel, parallax.
- Every Reanimated driver checks `reduceMotion` and selects easing/amplitude accordingly; never animate position when reduced.

### 7.2 Contrast

- Dark-first surfaces with `text.onSurface.hi` ≥ **7:1** (AAA body where feasible, **4.5:1 minimum**). Orb/center glows must not be the only thing carrying state — pair with shape/size/text.
- Provide a **high-contrast theme** that raises silhouette/edge contrast and flattens decorative blooms.
- Center colors (esp. the MODERN chakra rainbow — indigo `#3B3B98` vs blue `#2E86AB`, etc.) are **never** distinguished by hue alone (see §7.3).

### 7.3 No color-only cues

- Each phase carries **≥2 redundant encodings**: e.g., inhale = grow **and** brighten **and** "Breathe in" text **and** rising tone. Color is supplementary.
- Energy centers are distinguished by **position + petal-count/shape + label**, not just color. Hovering/focusing a center shows its name as text.
- Timing is shown with a **shape/size or arc-fill cue**, not a color shift alone, so colorblind users can pace.
- Provide patterns/icons for the five-element/wuxing and channel colors (ida/pingala get distinct dash patterns, not just blue/red).

### 7.4 Screen-reader announcements (phases & energy movement)

- **Pacer is exposed as an accessible timer**, not a decorative animation. Use a polite **live region** that announces each phase boundary once: `"Breathe in"`, `"Hold"`, `"Breathe out"`, `"Rest"` (matching §5 text column). Throttle to phase boundaries — never per-frame.
- **Energy-movement transitions** get descriptive announcements when that skin is active: `"Energy rising along the spine,"` `"Warmth gathering in the belly,"` `"The chest opens,"` `"Settling downward."` These are **assertive only at user-initiated transitions**, polite otherwise.
- **Body-map regions** are individually focusable with labels + traits: e.g., `"Heart center. Anahata. Double-tap for details."` Descriptions include the **tradition framing as belief** ("In this tradition, the heart center is associated with…").
- Provide a **"describe current state"** action and a **text-only / SR-optimized mode** that replaces the canvas with a structured, announced phase sequence and a session transcript.
- Respect **prefers-reduced-transparency** (flatten blooms) and OS font scaling for all captions.

### 7.5 Safety & framing (a11y-adjacent, required)

- **Photosensitivity:** no visible oscillation 3–60Hz; cap flash luminance deltas; all "shimmer/flame" effects are off by default in reduce-motion and behind a toggle otherwise.
- **Breath-hold/hyperventilation safety:** any skin with retention (Tummo Ember, box holds, etc.) shows a one-time safety note; **never practice in/near water or while driving**; surface contraindication guidance (cardiovascular, pregnancy, epilepsy, glaucoma, panic/psychosis) — presented as general safety info, kept visually **separate** from the belief content so traditions aren't reduced to hazards.
- **Closed/initiatory content** (tummo, tsa-lung, deity yoga, Qur'anic recitation, Lakota inípi, didgeridoo ceremony, Munay-Ki) is **descriptive-only**, labeled as requiring a qualified teacher/lineage, and never delivered as a how-to skin.

---

### Build notes (one-paragraph engineering summary)

Single Skia `Canvas` per pacer; a layered composite (`bg → silhouette → channels → centers → motion → phase-orb`). One Reanimated `progress` shared value per phase drives `useDerivedValue` for scale/opacity/path-progress; particles via one capped Skia points/atlas draw. Mount-time branch on `reduceMotion` selects the opacity/crossfade renderer (no positional animation). Themes are data (`{palette, motif, motionStyle, soundChar}`); the body-map overlay adapter swaps lit anchors/geometry/channel layer by mode without mixing iconography. Audio + haptics are independent, boundary-throttled, and fully optional; the SR layer exposes the pacer as a live-region timer plus focusable, labeled body regions. Default to the non-mystical **Calm Orb**; everything richer is opt-in and reduce-motion-complete.