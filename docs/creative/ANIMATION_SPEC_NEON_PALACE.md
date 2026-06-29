# Animation Spec — NEON PALACE Motion Design

**Agent:** Animation Director  
**Version:** 1.0  
**Sprint:** SPR-013  
**Token Reference:** `@casino/theme` — `motion.duration.*`, `motion.easing.*`

---

## Motion Philosophy

NEON PALACE motion has one rule: **every movement serves a purpose**. Animations communicate game state, reward players for wins, and guide attention. Nothing moves for decoration alone.

The character of NEON PALACE motion is:
- **Precise** — snaps to states, no loose floating
- **Weighted** — high-value moments have momentum and impact
- **Electric** — transitions have a brief charge-up quality
- **Restrained** — idle states are still. Motion is reserved for events

All animations respect `prefers-reduced-motion`. When that setting is active: all durations collapse to `instant` (100ms) or zero, no particle effects, no bouncing.

---

## Token Reference

```typescript
// From @casino/theme — motion tokens
duration.instant     = 100ms
duration.fast        = 150ms
duration.medium      = 300ms
duration.slow        = 600ms
duration['extra-slow'] = 1200ms
duration.spin        = 800ms
duration.celebration = 1500ms

easing.standard      = cubic-bezier(0.4, 0, 0.2, 1)
easing.enter         = cubic-bezier(0, 0, 0.2, 1)
easing.exit          = cubic-bezier(0.4, 0, 1, 1)
easing.bounce        = cubic-bezier(0.34, 1.56, 0.64, 1)
easing.spring        = cubic-bezier(0.175, 0.885, 0.32, 1.275)
```

---

## Section 1 — Button & Interactive States

### 1.1 Primary Button (SpinButton, Bet Confirm)

| State | Property | Value | Duration | Easing |
|-------|----------|-------|----------|--------|
| idle | scale | 1.0 | — | — |
| hover | scale | 1.04 | `fast` (150ms) | `standard` |
| hover | box-shadow | `glow-gold` from theme | `fast` | `standard` |
| active/press | scale | 0.96 | `instant` (100ms) | `exit` |
| active/press | brightness | 0.85 | `instant` | `exit` |
| release | scale | 1.0 | `fast` (150ms) | `spring` |
| disabled | opacity | 0.4 | `medium` (300ms) | `standard` |

**Framer Motion implementation note:**
```typescript
whileHover={{ scale: 1.04, boxShadow: shadows['glow-gold'] }}
whileTap={{ scale: 0.96, filter: 'brightness(0.85)' }}
transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
```

**GSAP alternative:**
```javascript
// hover in
gsap.to(el, { scale: 1.04, duration: 0.15, ease: 'power2.out' });
// press
gsap.to(el, { scale: 0.96, duration: 0.1, ease: 'power3.in' });
// release
gsap.to(el, { scale: 1.0, duration: 0.15, ease: 'back.out(1.7)' });
```

---

### 1.2 Secondary Button / Icon Button

Same as primary but `hover.scale = 1.06` and no glow box-shadow — instead, icon color transitions from `text.secondary` → `text.gold` in `fast` duration.

---

### 1.3 Bet +/- Buttons (rapid repeat)

**Special case:** These fire on `pointerdown` with repeat. Animation must complete within 100ms so rapid-fire presses don't queue visually.

| State | Property | Value | Duration |
|-------|----------|-------|----------|
| press | scale | 0.90 | 80ms (`exit`) |
| release | scale | 1.0 | 80ms (`spring`) |

---

## Section 2 — Panel & Modal Transitions

### 2.1 Modal Appear / Dismiss

**Enter:**
1. Overlay: `opacity` 0 → 1, `duration.medium` (300ms), `easing.enter`
2. Modal panel: `translateY` +40px → 0px, `opacity` 0 → 1, `duration.medium`, `easing.enter`
3. Timing: both start simultaneously

**Exit:**
1. Modal panel: `translateY` 0 → +20px, `opacity` 1 → 0, `duration.fast` (150ms), `easing.exit`
2. Overlay: `opacity` 1 → 0, `duration.fast`, `easing.exit`, delay 50ms

---

### 2.2 Toast Notification

**Enter:** Slides in from bottom-right
- `translateY` +60px → 0, `opacity` 0 → 1, `duration.medium`, `easing.spring`

**Exit:** Fades and slides right
- `translateX` 0 → +20px, `opacity` 1 → 0, `duration.fast`, `easing.exit`

**Auto-dismiss:** 4000ms after enter complete

---

### 2.3 Sidebar / Drawer

**Enter:**
- `translateX` -100% → 0, `duration.slow` (600ms), `easing.enter`
- Overlay: `opacity` 0 → 0.7, `duration.slow`

**Exit:**
- `translateX` 0 → -100%`, `duration.medium` (300ms), `easing.exit`

---

### 2.4 Tab / Section Switch

- Active tab indicator: `translateX` animates to new position, `duration.medium`, `easing.standard`
- Content: crossfade, `opacity` 1 → 0 → 1, `duration.fast` total with midpoint at 75ms

---

## Section 3 — Balance Panel Animations

### 3.1 Balance Count-Up (after win)

When the displayed balance is increasing (win credited):
- Numbers transition using a vertical "ticker" flip: previous number exits `translateY` 0 → -100%, incoming number enters `translateY` +100% → 0
- Duration per digit: 80ms
- Easing: `easing.standard`
- Digits fire in sequence right-to-left at 40ms intervals
- Color pulses to `win.gold` during count-up, returns to `text.primary` after 500ms

**CSS approach:**
```css
.digit-enter { transform: translateY(100%); }
.digit-enter-active { transform: translateY(0); transition: transform 80ms cubic-bezier(0.4,0,0.2,1); }
.digit-exit { transform: translateY(0); }
.digit-exit-active { transform: translateY(-100%); transition: transform 80ms cubic-bezier(0.4,0,1,1); }
```

### 3.2 Balance Decrease (bet placed)

Simpler than count-up. Numbers update instantly (no animation) but panel briefly dims: `opacity` 1 → 0.7 → 1 over `fast` (150ms). Confirms bet was consumed.

---

## Section 4 — Reel Animation States

This is the primary game mechanic animation. Reels are the most performance-sensitive animation in the product.

### 4.1 Reel Lifecycle

```
IDLE → SPINNING → STOPPING → STOPPED
```

| Phase | Duration | Easing | Notes |
|-------|----------|--------|-------|
| Spin start (accelerate) | 300ms | `easing.exit` (ease-in) | Symbol strip translates downward, accelerating |
| Full speed spin | variable (min 800ms) | linear | Continuous loop — CSS animation with negative translateY cycling |
| Decelerate (per reel) | 400ms | `easing.enter` (ease-out) | Each reel stops independently |
| Settle bounce | 80ms | `easing.bounce` | Brief overshoot-and-settle on the winning symbol |

**Reel stop sequencing (left to right):**
- Reel 1 stops at `t + 0ms`
- Reel 2 stops at `t + 250ms`
- Reel 3 stops at `t + 500ms`
- Reel 4 stops at `t + 750ms` (if 4-reel game)
- Reel 5 stops at `t + 1000ms` (if 5-reel game)

**Performance note:** Use `transform: translateY()` only — never animate `top` or `height`. Use `will-change: transform` on the symbol strip. Request `requestAnimationFrame` loop for JS-driven reels.

---

### 4.2 Symbol Reveal — Winning Symbol Highlight

When a win line is confirmed, winning symbols are highlighted in sequence:

1. **Non-winning symbols:** `opacity` 1 → 0.3, `duration.fast` (150ms), `easing.exit`
2. **Winning symbols:** `filter: drop-shadow(0 0 12px #f4c430)` fade in, `duration.medium` (300ms), `easing.enter`
3. **Winning symbols pulse:** scale 1.0 → 1.08 → 1.0, infinite, period `duration.slow` (600ms), `easing.standard`
4. **Win line trace:** animated SVG path `stroke-dashoffset` 100% → 0%, `duration.slow`, `easing.standard`

---

### 4.3 Anticipation Mode (near-miss)

When reels 1-4 show a potential jackpot line and reel 5 is still spinning:

- Reel 5 decelerates to ~20% normal speed (instead of full stop)
- Duration of slow-down: 2000ms–3000ms (randomly selected)
- Camera: subtle whole-game shake (translateX ±3px at 12Hz) for 500ms
- Audio cue: `sfx-anticipation.ogg` triggers
- Then reel 5 completes its stop normally

**Implementation:**
```typescript
// Slow-spin easing for anticipation reel
// Use a very long decelerate phase
const anticipationDuration = randomBetween(2000, 3000); // server-determined
```

---

## Section 5 — Win Celebration Sequences

All win sequences are composed from layers that fire simultaneously but at different intensities based on win tier.

### 5.1 Small Win (1×–5× bet)

**Duration:** 1200ms total

| t (ms) | Element | Animation |
|--------|---------|-----------|
| 0 | Winning symbols | Scale 1.0 → 1.1, glow appears |
| 0 | Win amount badge | Appears: `scale` 0 → 1, `easing.spring` |
| 100 | Balance counter | Starts count-up |
| 300 | Symbols | Pulse (scale 1.1 → 1.0 → 1.1, once) |
| 800 | Win badge | Fades out if player has already dismissed |
| 1200 | All | Returns to idle state |

---

### 5.2 Medium Win (6×–20× bet)

**Duration:** 2500ms total

| t (ms) | Element | Animation |
|--------|---------|-----------|
| 0 | Screen | Brief flash: `opacity` 0 → 0.3 → 0 over 200ms (white overlay) |
| 50 | Winning symbols | Scale 1.0 → 1.15, intense gold glow |
| 100 | Coin particles | 20–30 coins emitted from winning symbols, arc upward and fall |
| 200 | Win amount badge | Large entrance: `scale` 0 → 1.1 → 1.0, `easing.spring` |
| 300 | Balance | Count-up begins |
| 500 | Glow ring | Teal glow ring expands from symbols outward and fades |
| 1500 | Coins | Settle and disappear |
| 2500 | All | Returns to idle |

---

### 5.3 Big Win (21×–99× bet)

**Duration:** 5000ms total

| t (ms) | Element | Animation |
|--------|---------|-----------|
| 0 | Screen | White flash + screen shake (±8px, 15Hz, 300ms) |
| 0 | Background | Pulse to brighter bg for 500ms |
| 100 | Win banner | Full-width banner slams in from top: `translateY` -200px → 0, `easing.bounce` |
| 200 | Symbols | Scale 1.0 → 1.2, rotate ±5deg oscillation at 1Hz |
| 300 | Coin particles | 60–80 coins, high arc, fills screen |
| 400 | Gold light rays | Ray burst vfx expands from center, 1200ms duration |
| 500 | Win amount | Counts up rapidly, numbers glow gold during count |
| 1000 | Confetti | 50–80 pieces rain down from top |
| 3000 | Coin/confetti | Begin settling |
| 5000 | All | Fade to idle (elements exit individually) |

---

### 5.4 Jackpot / Mega Win (100×+ bet)

**Duration:** 8000ms total

This is the rarest, most cinematic event. The screen effectively becomes a celebration experience.

| t (ms) | Element | Animation |
|--------|---------|-----------|
| 0 | Screen | Hard cut to black (50ms), then explosion of light |
| 50 | Gold ray burst | Massive full-screen ray burst vfx |
| 200 | "JACKPOT" banner | Slams in from top with heavy bounce, overshoots 20px |
| 300 | Background | Cycling through gold/teal color pulses at 2Hz |
| 500 | Coins | 150+ coins fill the screen continuously for 5s |
| 600 | Confetti | Dense confetti from top edge |
| 800 | Win amount | Starts count-up, large typography, glowing gold |
| 1000 | Glow rings | Multiple concentric rings expand and fade |
| 3000 | (all active) | Peak celebration moment |
| 5000 | Coins/confetti | Begin settling |
| 6000 | Background | Returns to normal |
| 7000 | Banner | Fades to smaller persistent display |
| 8000 | All | Returns to normal game state |

**Note:** All particle counts are maximum values. Implementation should use `requestAnimationFrame` budgeting with adaptive quality — reduce particle count if frame time exceeds 16ms.

---

## Section 6 — Lobby & Navigation Animations

### 6.1 Game Card — Hover

| Property | Value | Duration | Easing |
|----------|-------|----------|--------|
| scale | 1.0 → 1.04 | `fast` (150ms) | `standard` |
| translateY | 0 → -4px | `fast` | `standard` |
| box-shadow | `md` → `glow-gold` | `fast` | `standard` |

### 6.2 Lobby Page Load — Staggered Card Grid

Cards enter staggered on initial load:
- Each card: `opacity` 0 → 1, `translateY` 24px → 0
- Duration: `medium` (300ms), `easing.enter`
- Stagger interval: 60ms between cards
- Cards animate in row-by-row (all cards in row 1 simultaneously, then row 2 at +60ms, etc.)

### 6.3 Page Transition (route change)

**Exit current page:**
- `opacity` 1 → 0, `translateY` 0 → -12px, `duration.fast` (150ms), `easing.exit`

**Enter new page:**
- `opacity` 0 → 1, `translateY` 12px → 0, `duration.medium` (300ms), `easing.enter`
- Starts 50ms after exit completes

---

## Section 7 — Loading States

### 7.1 Spin Button Loading (waiting for server response)

While a round result is pending:
- Button shows a rotating ring: `rotate` 0 → 360deg, `linear`, `duration.spin` (800ms), infinite
- Ring color: `neonPalaceColors.gold['500']`
- Ring width: 3px, radius matches button corner radius

### 7.2 Game Initial Load

Full-screen loading state before game assets are ready:
- NEON PALACE crown icon: `opacity` 0 → 1 → 0, `slow` (600ms) each, infinite (breathing pulse)
- Progress bar (if used): gradient fill from left, `easing.standard`

---

## Section 8 — Reduced Motion Overrides

When `@media (prefers-reduced-motion: reduce)` is active:

```css
*, *::before, *::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}
```

Additionally:
- No particle effects (coins, confetti, sparks) — replace with static gold flash
- No screen shake
- Win banner still appears but with no entrance animation (just `opacity` 0 → 1 at 100ms)
- Balance counter updates instantly — no ticker animation

---

## Implementation Notes

### Framer Motion (React components in packages/ui)

Use `motion.div` with `variants` for stateful components:
```typescript
const variants = {
  idle: { scale: 1, opacity: 1 },
  hover: { scale: 1.04 },
  tap: { scale: 0.96 },
};
```

Use `AnimatePresence` for mount/unmount (modals, toasts, win banners).

### GSAP (complex timeline sequences — win celebrations)

Win celebrations use GSAP `Timeline` for precise sequencing:
```javascript
const tl = gsap.timeline();
tl.to(symbols, { scale: 1.2, duration: 0.15, ease: 'back.out(1.7)' })
  .to(winBadge, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }, '-=0.1')
  .to(particles, { ... }, '<');
```

### CSS Animations (reel spin — performance critical)

Reel spinning uses native CSS `@keyframes` for maximum GPU compositing performance:
```css
@keyframes reel-spin {
  from { transform: translateY(0); }
  to   { transform: translateY(-{symbolCount * symbolHeight}px); }
}
.reel-spinning {
  animation: reel-spin 800ms linear infinite;
  will-change: transform;
}
```

### Canvas / WebGL (particle systems — jackpot only)

Jackpot-tier particle effects (150+ coins) should use `<canvas>` with requestAnimationFrame, not DOM elements. A lightweight particle system (~100 LOC) maintains particle positions and draws them in a 2D canvas context. This prevents DOM thrashing during the highest-impact event.
