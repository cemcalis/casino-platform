# Audio Prompt Pack — NEON PALACE Sound Design

**Agent:** Audio Director  
**Version:** 1.0  
**Sprint:** SPR-013  
**Theme:** NEON PALACE (original IP — not based on any commercial game or commercial soundtrack)

---

## Sound Design Philosophy

NEON PALACE audio occupies the space between luxury hotel ambience and near-future electronic club. Every sound should feel expensive — like it was recorded in a professional studio and then processed through high-end synthesis hardware. No arcade bleeps. No cheap slot machine jingles. No sounds that reference any existing casino title.

The tonal language:
- **UI interactions:** clean, crystalline, high-frequency, brief — like tapping a crystal glass
- **Game sounds:** physical weight, doppler elements, building tension with satisfying release
- **Wins:** celebratory but controlled — not cartoonish. Think champagne pop, not circus
- **Music:** cinematic electronic with jazz undertones — think movie score for a heist in a luxury vault

---

## Technical Specifications

| Property | Requirement |
|----------|-------------|
| Format | OGG Vorbis (primary), MP3 128kbps (fallback) |
| Sample rate | 44.1 kHz |
| Bit depth | 16-bit minimum |
| Channels | Stereo (music/ambient), Mono acceptable for short SFX |
| Loudness target | -14 LUFS integrated (short SFX: -12 LUFS peak) |
| True peak | -1 dBTP maximum |
| Loop points | Zero-crossing aligned (for all looping tracks) |
| Silence tails | 50ms fade-out on all SFX |

---

## Layer Architecture

Audio plays in three independent layers, each independently controllable by volume:

```
Layer 1: MUSIC     — looping background music track
Layer 2: AMBIENT   — looping environmental ambience
Layer 3: SFX       — event-driven one-shot sounds
```

Volume state is persisted per-user and defaults: Music 60%, Ambient 30%, SFX 80%.

---

## Section 1 — UI Interaction Sounds

### SFX-001: Button Click (Primary)
**Filename:** `sfx-click-primary.ogg`  
**Duration:** 60–80ms  
**Mood:** Confident, crystalline, satisfying

**Prompt:**
```
Ultra-short UI click sound, 60-80 milliseconds, crystalline glass tap quality, 
single transient, high-mid frequency (2-4kHz peak), fast attack (1ms), 
fast decay (50ms), slight reverb tail in a small marble room, 
premium interface quality, clean and precise, no distortion
```

**Variations needed:** `sfx-click-primary.ogg`, `sfx-click-secondary.ogg` (slightly softer, lower pitch by ~3 semitones)

---

### SFX-002: Button Hover
**Filename:** `sfx-hover.ogg`  
**Duration:** 40–60ms  
**Mood:** Subtle, airy, non-intrusive

**Prompt:**
```
Extremely subtle hover sound, 40-60ms, soft high-frequency shimmer, 
like a whisper of teal light, almost inaudible but perceptible, 
crystal bell partial harmonic, no attack transient — gentle onset, 
mix this at -18dBFS relative to click sounds
```

---

### SFX-003: Toggle On / Feature Activate
**Filename:** `sfx-toggle-on.ogg`, `sfx-toggle-off.ogg`  
**Duration:** 120–180ms  
**Mood:** Mechanical precision, electronic confirmation

**Prompt:**
```
Toggle switch activation sound, 120-180ms, two-component design: 
1) soft mechanical click (5ms) + 2) brief electronic confirmation tone (100ms), 
the confirmation tone is a pure sine wave at 880Hz with fast attack and medium decay, 
slight pitch rise on "on", pitch drop on "off", premium tactile interface quality
```

---

### SFX-004: Menu Open / Panel Slide
**Filename:** `sfx-menu-open.ogg`, `sfx-menu-close.ogg`  
**Duration:** 200–300ms  
**Mood:** Smooth, sophisticated, spatial

**Prompt:**
```
Panel slide sound, 200-300ms, whoosh with subtle friction quality, 
high-pass filtered air movement, slight pitch sweep upward (for open), 
downward (for close), ends cleanly with brief settle sound, 
the material feels like brushed gold sliding on velvet, premium, no harsh frequencies
```

---

### SFX-005: Error / Blocked Action
**Filename:** `sfx-error.ogg`  
**Duration:** 200–350ms  
**Mood:** Clear denial, not harsh or alarming

**Prompt:**
```
Soft denial sound, 200-350ms, descending two-tone pattern, 
low-mid frequency (300-600Hz range), muted quality, 
feels like a gentle no rather than an alarm, 
no harsh high-frequency content, brief and clear, no echo
```

---

### SFX-006: Notification / Toast Appear
**Filename:** `sfx-notify.ogg`  
**Duration:** 250–400ms  
**Mood:** Gentle, informative, pleasant

**Prompt:**
```
Notification chime, 250-400ms, two ascending notes a perfect fifth apart, 
bell-like synthesis, warm harmonic content, moderate decay, 
pleasant and professional, not urgent, premium notification quality
```

---

## Section 2 — Game Core Sounds

### SFX-010: Spin Start
**Filename:** `sfx-spin-start.ogg`  
**Duration:** 300–500ms  
**Mood:** Mechanical engagement, kinetic energy building

**Prompt:**
```
Reel spin initiation sound, 300-500ms, mechanical engagement: 
brief lever/button click (30ms) followed immediately by 
whirring mechanical energy building in pitch (like a turbine spinning up), 
ends as reels reach full speed, no abrupt cut — fade into seamless reel spin loop, 
physical weight, precision engineering quality, not digital-sounding
```

---

### SFX-011: Reel Spin Loop
**Filename:** `sfx-reel-spinning.ogg`  
**Duration:** 1000ms (seamless loop)  
**Mood:** Kinetic, rhythmic, physical

**Prompt:**
```
Looping reel spin sound, exactly 1 second for seamless loop, 
mechanical rotation quality with slight whoosh component, 
rhythmic low-mid rumble at ~120BPM subdivision, 
feels like precision bearings at high speed, 
loop points at zero crossings, no clicks on loop boundary, 
subtle air displacement sound component
```

---

### SFX-012: Reel Stop — Individual (5 variations)
**Filenames:** `sfx-reel-stop-1.ogg` through `sfx-reel-stop-5.ogg`  
**Duration:** 150–250ms each  
**Mood:** Satisfying mechanical thud, each slightly different

**Prompt (base — generate 5 variations):**
```
Mechanical reel stop sound, 150-250ms, single transient click + brief resonance, 
like a heavy precision drum stopping with internal damping, 
pitch varies across the 5 files (slightly lower pitch each successive stop 
from stop 1 to stop 5 — approximately 1-2 semitones descending), 
physical mass quality, satisfying, not harsh
```

**Timing note:** Stops 1–5 are triggered at 200ms intervals during a normal spin sequence.

---

### SFX-013: Anticipation Build (Pre-Reveal)
**Filename:** `sfx-anticipation.ogg`  
**Duration:** 1500–2500ms  
**Mood:** Rising tension, suspense, excitement

**Prompt:**
```
Tension-building sound, 1.5-2.5 seconds, starts subtle and builds, 
two elements that grow together: 1) low drone that slowly rises in pitch and volume, 
2) rapid high-frequency sparkle/shimmer that increases in density, 
ends on an unresolved high note that begs for the win/loss reveal, 
cinematic thriller quality, no sudden cuts, natural crescendo
```

---

## Section 3 — Win Sounds

### SFX-020: No Win (Neutral Result)
**Filename:** `sfx-result-neutral.ogg`  
**Duration:** 400–600ms  
**Mood:** Neutral, clean, not discouraging

**Prompt:**
```
Neutral result sound, 400-600ms, soft descending tone, 
not a fail sound — just a clear round end, 
single medium-length note that fades cleanly, 
no sadness or alarm quality, like turning a page
```

---

### SFX-021: Small Win (1×–5× bet)
**Filename:** `sfx-win-small.ogg`  
**Duration:** 800ms–1200ms  
**Mood:** Pleasant confirmation, light celebration

**Prompt:**
```
Small win sound, 800ms-1.2 seconds, bright ascending arpeggio of 3-4 notes, 
crystal bell timbre, ends with satisfying resolution, 
not over-celebratory — confident and pleasant, 
like finding a nice surprise, gold coin shimmer quality
```

---

### SFX-022: Medium Win (6×–20× bet)
**Filename:** `sfx-win-medium.ogg`  
**Duration:** 1500ms–2500ms  
**Mood:** Genuine excitement, uplifting

**Prompt:**
```
Medium win sound, 1.5-2.5 seconds, orchestral sweep + electronic elements, 
brass stab followed by ascending synth pad, 
coin cascade starts at 500ms and layers in, 
genuine excitement quality but not chaotic, 
premium casino feel, strong resolution at the end
```

---

### SFX-023: Big Win (21×–99× bet)
**Filename:** `sfx-win-big.ogg`  
**Duration:** 3000ms–5000ms  
**Mood:** Triumph, celebration, emotional peak

**Prompt:**
```
Big win sound, 3-5 seconds, full cinematic moment: 
brief silence/breath (200ms) → explosive upward brass and synth fanfare, 
coin waterfall in mid-layer, high-frequency sparkle cascade in top layer, 
builds to a triumphant held chord, cinematic quality, 
no cartoon quality — this feels like a movie moment, genuine triumph
```

---

### SFX-024: Jackpot / Mega Win (100×+ bet)
**Filename:** `sfx-win-jackpot.ogg`  
**Duration:** 5000ms–8000ms  
**Mood:** Extraordinary, life-changing, cinematic

**Prompt:**
```
Jackpot win sound, 5-8 seconds, dramatic cinematic composition: 
phase 1 (0-1s): rising orchestral tension with electronic pulse, 
phase 2 (1-3s): massive explosive release — full orchestra + synth ensemble, 
phase 3 (3-6s): triumphant fanfare with coin cascade and sparkle shower, 
phase 4 (6-8s): sustained celebration chord fade, 
premium film score quality, this is the rarest most celebrated event
```

---

### SFX-025: Win Counter Tick
**Filename:** `sfx-win-tick.ogg`  
**Duration:** 50–80ms  
**Mood:** Crisp, numerical, rapid

**Prompt:**
```
Win counter increment tick, 50-80ms, clean single click with slight metallic ring, 
like a counting machine advancing one unit, crisp and precise, 
played rapidly in sequence to count up win amount (20-60 ticks per second), 
must stay pleasant even when played very rapidly in succession
```

---

### SFX-026: Coin Drop / Scatter
**Filename:** `sfx-coins-scatter.ogg`  
**Duration:** 1000ms–2000ms  
**Mood:** Physical, celebratory, golden

**Prompt:**
```
Coins cascading and bouncing, 1-2 seconds, medium density, 
physical gold coin quality with resonant ring on each bounce, 
natural stereo scatter — coins appear from left, right, and center, 
slight echo in a marble/stone environment, 
dies away naturally, not abruptly cut
```

---

## Section 4 — Feature Sounds

### SFX-030: Scatter Symbol Land
**Filename:** `sfx-scatter-land.ogg`  
**Duration:** 500ms–800ms  
**Mood:** Distinctive, special, attention-grabbing

**Prompt:**
```
Scatter symbol landing sound, 500-800ms, unique sonic signature: 
teal/crystalline quality (matches the Palace Seal visual identity), 
sparkle + resonant glass bowl tone, feels magical and rare, 
players must be conditioned to associate this sound with feature incoming
```

---

### SFX-031: Feature Triggered (e.g. Free Spins)
**Filename:** `sfx-feature-trigger.ogg`  
**Duration:** 2000ms–3500ms  
**Mood:** Revelation, excitement, anticipation of what's coming

**Prompt:**
```
Feature trigger fanfare, 2-3.5 seconds, dramatic reveal quality, 
starts with a rising whoosh, then a brass + synth hit, 
then an ascending musical phrase that implies "something special is beginning", 
cinematic transition feel, bridge between normal play and bonus state
```

---

## Section 5 — Music Tracks

### MUS-001: Lobby Music Loop
**Filename:** `music-lobby-loop.ogg`  
**Duration:** 90 seconds (seamless loop)  
**BPM:** 95–105  
**Mood:** Sophisticated, welcoming, luxurious — players arriving at the venue

**Prompt:**
```
90-second seamless loop, casino lobby background music, 
jazz-influenced electronic, upright bass and brushed drums foundation, 
gold/warm harmonic palette, subtle piano chord voicings, 
background atmospheric pad, sophisticated adult atmosphere, 
think: exclusive members club at 9pm, guests arriving, 
tempo 95-105 BPM, key of Db major or Eb major, 
no lyrics, no singing, no recognizable melody from existing songs
```

**Loop requirement:** Loop point at bar 36 (approximately 90 seconds). The ending must crossfade into the beginning with no audible seam.

---

### MUS-002: Game Music Loop — Calm State
**Filename:** `music-game-calm.ogg`  
**Duration:** 60 seconds (seamless loop)  
**BPM:** 88–96  
**Mood:** Focused, slightly tense, atmospheric — between spins

**Prompt:**
```
60-second seamless loop, game background music, calm state, 
electronic cinematic, sparse arpeggiated synthesizer pattern, 
subtle percussion (hi-hats and light kick), 
warm deep bass pulse, tension without anxiety, 
this plays between spins — players need to focus, 
tempo 88-96 BPM, minor key, atmospheric, sparse
```

---

### MUS-003: Game Music Loop — Win State (transitions from calm)
**Filename:** `music-game-win.ogg`  
**Duration:** 30 seconds (seamless loop)  
**BPM:** Same as MUS-002 (match exactly for crossfade)  
**Mood:** Uplift, momentum, celebrating

**Prompt:**
```
30-second seamless loop, game music win state, 
must be same BPM and key as calm state for seamless crossfade, 
adds: brass stabs on downbeats, increased percussion energy, 
brighter pad chord voicing, counter-melody in upper register, 
this plays during win celebrations — keep it celebratory not chaotic
```

---

## Section 6 — Ambient Tracks

### AMB-001: Lobby Ambience
**Filename:** `ambient-lobby.ogg`  
**Duration:** 120 seconds (seamless loop)  
**Mood:** Spatial, immersive, a living venue

**Prompt:**
```
120-second ambient loop, upscale casino lobby environment, 
background elements (very subtle, -20dBFS under music): 
distant low murmur of a crowd (not intelligible words), 
occasional soft clink of glasses, 
very subtle ventilation hum, 
marble footstep reverb in distance, 
warm and welcoming, not busy, this is a premium quiet venue
```

---

### AMB-002: Game Room Ambience
**Filename:** `ambient-game.ogg`  
**Duration:** 90 seconds (seamless loop)  
**Mood:** Focused, atmospheric, slightly electric

**Prompt:**
```
90-second ambient loop, casino game room environment, 
subtle electronic hum of machines, 
very faint distant mechanical reel sounds from other games, 
atmospheric neon light buzz (very subtle, under -24dBFS), 
a sense of many games running simultaneously in the background, 
focused and energetic atmosphere, slightly tense
```

---

## Delivery Checklist

Before delivering audio files:

- [ ] All files pass loudness check: -14 LUFS integrated, -1 dBTP true peak
- [ ] All loop files verified: zero crossing at loop point, no click on loop
- [ ] OGG format: encoded at quality 6 (≈160kbps variable)
- [ ] MP3 fallbacks at 128kbps if required
- [ ] Filename matches convention exactly: `sfx-*`, `music-*`, `ambient-*`
- [ ] No copyrighted music, no recordings of commercial casino machines
- [ ] No intelligible speech or lyrics
- [ ] No reference to real-world brands or places
- [ ] Deliver to: `public/assets/neon-palace/raw/audio/<sfx|music|ambient>/`
