# Art Prompt Pack — NEON PALACE Visual Identity

**Agent:** Art Director  
**Version:** 1.0  
**Sprint:** SPR-013  
**Theme:** NEON PALACE (original IP — not based on any commercial game)

---

## Style Bible

### Visual DNA
NEON PALACE is a fictional luxury venue that exists somewhere between an art-deco casino from the 1930s and a holographic nightclub from the far future. The mood is: velvet and voltage. Every asset should feel expensive, glowing, and slightly impossible.

### Color Constraints (MANDATORY — use only these)
| Role | Hex | Usage |
|------|-----|-------|
| Background deep | `#0d0618` | Base layer, voids |
| Background medium | `#1a0a2e` | Card surfaces, panels |
| Neon gold | `#f4c430` | Primary glow, highlights |
| Cyber teal | `#00d4c8` | Secondary glow, accents |
| Hot magenta | `#ff2d78` | Danger, special alerts only |
| Text primary | `#f0e8ff` | Near-white with violet shift |
| Win gold | `#ffd700` | Win celebrations only |

### Style Keywords (for every prompt)
> dark luxury, art deco architecture, cyberpunk neon lighting, deep violet shadows, gold neon glow, teal holographic shimmer, volumetric light, premium casino atmosphere, hyperrealistic render

### Negative Prompts (for every prompt — add to every image generation)
> photorealistic faces, human figures, brand logos, watermarks, text overlays, cartoon style, anime, 8-bit pixel art, flat design, pastel colors, copyrighted symbols, licensed characters, real casino game branding, slot machine brand markings, real currency symbols ($, €, £)

---

## Section 1 — Lobby Backgrounds

### 1.1 Lobby Hero — Full Bleed Scroll Background

**Filename:** `bg-lobby-hero@2x.webp`  
**Size:** 2560 × 1440px (export as WebP, quality 85)  
**Usage:** Main lobby page, parallax scroll base layer

**Prompt:**
```
Vast opulent casino interior, ceiling height 40 meters, ribbed vaulted arches in dark obsidian and gold, 
thousands of neon purple-violet lights receding into the distance, twin neon gold (#f4c430) light columns 
framing the entrance, translucent holographic floor with teal (#00d4c8) grid patterns, no human figures, 
art deco meets cyberpunk, volumetric god rays in violet and gold, ultra wide angle, cinematic, photorealistic, 
8K quality render, dramatic depth of field
```

**Notes:**
- Keep the center 1200px relatively clear for UI overlay
- The glow should be subtle enough that white text remains legible over it

---

### 1.2 Lobby Background — Card Section Dark Panel

**Filename:** `bg-lobby-cards@2x.webp`  
**Size:** 1920 × 600px  
**Usage:** Game card grid section background

**Prompt:**
```
Dark purple velvet texture, subtle hexagonal geometric pattern in deep violet, faint teal holographic 
shimmer at edges, center pure dark (#1a0a2e), extremely subtle depth, luxury fabric quality, 
no objects, no figures, abstract dark elegant background, seamless tile edges
```

---

### 1.3 Game Canvas Background — Standard

**Filename:** `bg-game-canvas@2x.webp`  
**Size:** 1920 × 1080px  
**Usage:** Behind the game reel frame

**Prompt:**
```
Ornate casino backdrop, dark indigo marble floor with gold inlay geometric patterns, towering dark 
columns with neon teal (#00d4c8) accent lighting, fog at ground level, purple atmospheric haze, 
theatrical theatrical drama, no symbols or numbers, no human figures, wide establishing shot, 
ultra-detailed, photorealistic, luxury venue photography style
```

---

## Section 2 — Symbol Set (NEON PALACE Original)

**Export all symbols:** 256×256px transparent PNG → convert to WebP  
**Style for ALL symbols:** 3D render, volumetric glow, luxury material quality, on transparent black  
**Symbol style note:** Each symbol has 2 states: `idle` (soft ambient glow) and `win` (intense bloom)

### Symbol Style Anchor (Mandatory base prompt for ALL symbols)
```
Base: centered on pure black transparent background, 3D render, hyper-detailed, 
luxury premium casino quality, neon glow halo, art deco design language, isolated subject, 
no background environment, 256x256, symmetric, clean silhouette
```

---

### 2.1 Wild Symbol — The Crown (highest value)

**Filenames:** `symbol-crown-idle@2x.webp`, `symbol-crown-win@2x.webp`

**Idle Prompt:**
```
[BASE] + 
Ornate royal crown, forged from dark polished gold, encrusted with deep violet amethyst 
gemstones and cyan topaz, neon gold (#f4c430) ambient glow emanating from the crown, 
filigree patterns on the band, art deco styling, sublime craftsmanship, floating, 
soft purple shadow below
```

**Win Prompt:**
```
[IDLE] + intense neon gold bloom, radiant light burst, light rays emanating from gems, 
motion blur on glow trails, particle sparkles, explosive brilliance
```

---

### 2.2 Scatter Symbol — The Palace Seal (special value)

**Filenames:** `symbol-seal-idle@2x.webp`, `symbol-seal-win@2x.webp`

**Idle Prompt:**
```
[BASE] +
Circular heraldic seal, abstract palace architecture silhouette in center — twin towers flanking 
a central gate arch, surrounded by octagonal border with geometric art deco patterns, 
rendered in holographic teal (#00d4c8) and gold (#f4c430), luminescent, etched metal quality, 
ancient-meets-futuristic aesthetic
```

**Win Prompt:**
```
[IDLE] + teal and gold light explosion, holographic fractal rings expanding outward, 
rotating shimmer, intense cyan bloom, multicolored prismatic rays
```

---

### 2.3 Symbol — Electric Diamond (Tier A)

**Filenames:** `symbol-diamond-idle@2x.webp`, `symbol-diamond-win@2x.webp`

**Idle Prompt:**
```
[BASE] +
Geometric faceted diamond, perfectly cut, crystalline structure, refracts neon teal 
(#00d4c8) and violet light internally, brilliant cut with visible facet planes, 
laser-etched internal patterns, floating above subtle violet shadow, 
premium jeweler quality, high depth-of-field
```

---

### 2.4 Symbol — Neon Chalice (Tier B)

**Filenames:** `symbol-chalice-idle@2x.webp`, `symbol-chalice-win@2x.webp`

**Idle Prompt:**
```
[BASE] +
Elegant goblet, dark oxidized silver, filled with luminous neon gold liquid that spills 
over the rim in slow-motion light, art deco fluted stem, geometric base, 
gold glow emanating from the liquid, rich and opulent
```

---

### 2.5 Symbol — Golden Horseshoe (Tier B)

**Filenames:** `symbol-horseshoe-idle@2x.webp`, `symbol-horseshoe-win@2x.webp`

**Idle Prompt:**
```
[BASE] +
Ornamental horseshoe, heavy forged antique gold, studded with small brilliant gems 
along outer edge, glowing neon gold (#f4c430) light traces the curve, 
beveled art deco engravings on the metal surface, warm glow from below, 
symbolic good luck object, premium render
```

---

### 2.6 Symbol — Cyber 7 (Tier B)

**Filenames:** `symbol-seven-idle@2x.webp`, `symbol-seven-win@2x.webp`

**Idle Prompt:**
```
[BASE] +
Numeral 7, bold slab-serif futuristic typeface, constructed from illuminated neon tubes 
in hot gold (#f4c430), chrome frame structure, neon glow reflects on dark surface below, 
art deco proportions, the 7 feels electric and alive, iconic casino styling reinterpreted 
as high-tech neon sculpture
```

---

### 2.7 Symbol — Crystal Star (Tier C)

**Filenames:** `symbol-star-idle@2x.webp`, `symbol-star-win@2x.webp`

**Idle Prompt:**
```
[BASE] +
Five-pointed star, faceted like a cut gemstone, interior filled with glowing violet 
crystal lattice, outer edges traced in neon teal (#00d4c8) light, translucent 
ice-blue quality, elegant symmetry, subtle glow ring behind
```

---

### 2.8 Symbol — Neon Bar (Tier C)

**Filenames:** `symbol-bar-idle@2x.webp`, `symbol-bar-win@2x.webp`

**Idle Prompt:**
```
[BASE] +
Classic rectangular bar ingot, dark brushed platinum surface with embossed word "BAR" 
in art deco letterform, single teal neon stripe runs horizontally through center, 
industrial luxury aesthetic, solid weighty feel, elegant minimalism
```

---

### 2.9 Symbol — Violet Gem (Tier C lowest)

**Filenames:** `symbol-gem-violet-idle@2x.webp`, `symbol-gem-violet-win@2x.webp`

**Idle Prompt:**
```
[BASE] +
Oval gemstone, deep amethyst purple, faceted with precision cuts, inner luminescence 
in soft violet, subtle gold prong setting visible at edges, fine jewelry quality, 
internal light diffusion shows layered depth inside the stone
```

---

### 2.10 Symbol — Cyan Gem (Tier C lowest)

**Filenames:** `symbol-gem-cyan-idle@2x.webp`, `symbol-gem-cyan-win@2x.webp`

**Idle Prompt:**
```
[BASE] +
Oval gemstone, vivid cyan-teal color (#00d4c8), brilliant faceted cut, internal 
aquamarine light, cool shimmer, pure crystalline clarity, fine gold setting at edges, 
mirror-quality facet reflections
```

---

## Section 3 — UI Icons (SVG Preferred)

**Export:** SVG where possible. If raster required: 64×64px WebP with transparent background.  
**Style:** Line icon, single color (`#f0e8ff` default, `#f4c430` hover state), 2px stroke weight, rounded line caps

### Icon Prompts

**Note:** The following should be generated as clean vector/icon illustrations. If using raster AI, generate at 512×512px then trace to SVG.

---

**icon-sound-on.svg** (and icon-sound-off, icon-sound-low)
```
Minimal speaker icon with sound waves, single line weight, rounded corners, 
art deco slight influence, clean geometric construction, isolated on transparent background, 
single color monochrome, professional UI icon quality, 64x64
```

**icon-settings.svg**
```
Gear/cogwheel icon, 8-tooth design, circular aperture center, minimal line art, 
slightly art deco tooth profile, clean geometric, professional UI, 64x64 transparent
```

**icon-info.svg**
```
Circle with centered lowercase i, rounded ends, clean stroke, information symbol, 
professional UI quality, 64x64 transparent
```

**icon-close.svg**
```
X mark, equal weight diagonal strokes, rounded line caps, precise 45-degree angle, 
clean minimal, 64x64 transparent
```

**icon-fullscreen.svg / icon-exit-fullscreen.svg**
```
Four arrows pointing outward from center / four arrows pointing inward, 
corner bracket style, clean geometric, 64x64 transparent
```

**icon-help.svg**
```
Circle with centered ? mark, rounded letterform, clean stroke weight, 64x64 transparent
```

**icon-home.svg**
```
Simple house silhouette with art deco peaked roof, minimal, single stroke weight, 64x64 transparent
```

**icon-wallet.svg**
```
Rounded rectangle wallet with coin or card suggestion, minimal stroke, 64x64 transparent
```

---

## Section 4 — VFX Textures & Particle Assets

**Note:** These are texture sheets and particle sprites — not animations. Animation is specified in ANIMATION_SPEC_NEON_PALACE.md.

### 4.1 Coin Particle Sprite Sheet

**Filename:** `vfx-coin-sheet@2x.webp`  
**Size:** 512×512px (8×8 grid = 64 frames, each 64×64px)  
**Usage:** Coin rain / win celebration particle system

**Prompt:**
```
Single gold coin, clean isolated on black transparent background, art deco edge 
embossing, one face shows a geometric palace emblem, rendered at multiple rotation 
angles (8 views × 8 lighting states), flat-on front view top-left, rotating clockwise 
across the sheet, premium gold coin render, 64x64 per frame in 8x8 sprite grid, 512x512 total
```

---

### 4.2 Star Spark Particle

**Filename:** `vfx-spark-star@2x.webp`  
**Size:** 128×128px transparent  
**Usage:** Scatter activation, high-value symbol win sparks

**Prompt:**
```
Four-pointed star spark, bright neon gold (#f4c430), intense center point, 
gradient fades to transparent edges, lens flare quality, centered on pure black, 
transparent background, isolated glowing artifact, 128x128
```

---

### 4.3 Teal Glow Ring

**Filename:** `vfx-glow-ring-teal@2x.webp`  
**Size:** 256×256px transparent  
**Usage:** Win frame, feature activation halo

**Prompt:**
```
Circular glow ring, thin neon teal (#00d4c8) band, gaussian blur falloff to transparent, 
perfectly centered, full circle, no gaps, radial gradient inner to outer, 
isolated on pure black transparent, 256x256
```

---

### 4.4 Gold Light Ray Burst

**Filename:** `vfx-ray-burst-gold@2x.webp`  
**Size:** 512×512px transparent  
**Usage:** Big win / jackpot reveal background effect

**Prompt:**
```
Radial light ray burst, 16 rays emanating from center point, neon gold (#f4c430) 
gradient from bright center to transparent edges, rays vary slightly in length, 
bokeh quality, soft, isolated on pure black transparent background, 512x512
```

---

### 4.5 Confetti Particle Sheet

**Filename:** `vfx-confetti-sheet@2x.webp`  
**Size:** 256×256px (4×4 grid = 16 individual confetti pieces, each 64×64px)

**Prompt:**
```
16 individual confetti pieces on 4x4 grid, each 64x64, pure black background, 
shapes: rectangles, diamonds, stars, circles, hexagons in gold (#f4c430), 
teal (#00d4c8), violet (#9b59f5), magenta (#ff2d78), metallic foil quality, 
each piece at unique rotation angle, isolated on black
```

---

## Section 5 — Loading Screen

**Filename:** `bg-loading@2x.webp`  
**Size:** 1920×1080px  
**Usage:** Initial app load, between-screen transitions

**Prompt:**
```
Minimalist dark luxury splash screen composition, centered golden crown icon floating 
in deep violet-black space (#0d0618), radial neon gold glow emanating from crown, 
faint art deco geometric ornamental lines framing the space, atmospheric depth, 
absolutely no text, no brand names, no logos, clean and premium, cinematic quality
```

---

## Section 6 — Game Card Thumbnails (Lobby)

**Size:** 400×560px (portrait card ratio) per thumbnail  
**Usage:** Lobby game grid cards

**Style note:** These are placeholder thumbnails for the NEON PALACE lobby. They represent "Coming Soon" game slots and should be visually distinct from each other while sharing the NEON PALACE aesthetic.

### 6.1 Slots Game Card

**Filename:** `thumb-slots-001@2x.webp`

**Prompt:**
```
Portrait format game card thumbnail, dark luxury casino aesthetic, three ornate 
glowing symbol wheels visible in slight perspective, neon gold crown symbol centered 
and glowing intensely, deep purple-black background with atmospheric neon lighting, 
art deco frame border in gold filigree, cinematic quality, 400x560px, no text, no numbers
```

### 6.2 Table Game Card

**Filename:** `thumb-table-001@2x.webp`

**Prompt:**
```
Portrait format game card thumbnail, elegant felt-green table surface viewed from above 
at dramatic angle, neon accent lighting in teal and gold at edges, dark luxury atmosphere, 
abstract geometric chip suggestion, art deco table design, 400x560px, no text, no numbers
```

---

## Export Checklist

Before delivering assets:

- [ ] All files named per convention: `{category}-{variant}-{state}@{scale}.{ext}`
- [ ] Transparent background confirmed on all symbol/icon/VFX assets
- [ ] No watermarks, no generation artifacts visible
- [ ] No text or numbers embedded in raster image (all text handled in UI layer)
- [ ] No copyrighted brand marks, no real currency symbols
- [ ] Color palette matches NEON PALACE spec (violet/gold/teal)
- [ ] Dimensions match per-asset spec above
- [ ] Deliver raw files to: `public/assets/neon-palace/raw/<category>/`
