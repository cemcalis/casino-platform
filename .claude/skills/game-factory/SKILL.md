# Game Factory Skill

## Purpose

Turn a one-line theme brief ("uzay temalı, yüksek volatilite") into a complete,
production-quality slot game: math model, calibrated RTP, free spin feature,
presentation, audio, page, and lobby registration. The human only supplies the
theme; everything else is produced by this pipeline.

Built on:
- `@casino/forge` — math engine, manifest schema, Monte Carlo simulator, RTP gate
- `apps/web/app/games/_forge/SlotForge.tsx` — presentation runtime (reels,
  anticipation, tumble FX, win tiers, free spin flow, bonus buy, audio)

One factory run = one ticket = one branch (`feature/GAME-<slug>`).

---

## Inputs

| Input | Required | Default |
|-------|----------|---------|
| Theme brief (1 line) | yes | — |
| Volatility (1–5) | no | 4 |
| Pay model | no | pick by volatility: 1–3 → `lines`, 4–5 → `scatterPays` |
| Max win | no | lines: 5000x · scatterPays: 10000x |

## Hard Rules

1. **Original IP only.** Invent the game name, symbol set, and art direction.
   Never reuse a real provider's game name, symbol art, or trade dress.
   Mechanics (tumble, scatter pays, bomb multipliers, buy features) are fair
   game; expression is not.
2. **RTP gate is mandatory.** A game that fails the 92–97% band at 200k seeded
   spins does not ship. No exceptions, no manual overrides.
3. Social casino only — virtual currency, no payment or real-money logic.
4. Provider label is always an in-house studio name (e.g. `Forge Studio`).

---

## Pipeline

### 1. Design the manifest

Copy the nearest reference from `packages/forge/src/reference-manifests.ts`:
- `emberFalls()` — 5×3, 10 lines, tumble, wild, ladder multiplier (vol 1–3)
- `sugarRealm()` — 6×5, scatterPays, tumble, bomb multipliers (vol 4–5)

Then re-theme it completely:
- `gameId` (kebab-case), `gameName`, `tagline` (Turkish), `provider`
- 8–10 symbols: 4–5 low (thematic minor icons), 3–4 premium (theme
  protagonists), 1 wild (lines only), 1 scatter, 1 bomb (scatterPays only).
  Labels are emoji or ≤6 chars; give each a distinct `color`.
- `theme`: bgGradient (3-stop radial, dark), reelBg, accents, frameColor,
  one of 5 music profiles (`mystic|festive|epic|serene|arcade`),
  storageKey `forge_<id with _>`.
- Volatility knobs: higher volatility → steeper payout curve (top symbol
  5-kind ≥ 20× the lowest), rarer premiums (lower weights), bigger bomb
  values / ladder tops.

### 2. Calibrate to the RTP band

Write a temporary probe spec (copy the pattern below), run, tune, delete it:

```ts
// packages/forge/src/__tune.spec.ts  (TEMPORARY — delete before commit)
import { it } from 'vitest';
import { simulate, formatReport } from './simulate';
import { myGame } from './manifests/my-game';
it('probe', () => {
  console.log(formatReport(myGame(), simulate(myGame(), { spins: 100_000, seed: 1337 })));
});
```

Tuning rules (math is linear in payouts — converge in 2–3 passes):
- RTP off by a factor → scale **all payouts** by `target / measured`, then
  round to clean values.
- Free spin trigger should land at 1-in-100 … 1-in-250. Trigger probability
  moves ~cubically with scatter weight; halving weight ≈ 8× rarer.
- Free spin RTP share should be 10–25% of total. Too high → trim bomb values
  or ladder; too low → raise `freeSpinWeight` of premiums or bomb values.
- Volatility class in the report should match the brief (low/medium for 1–2,
  medium/high for 3–4, high/extreme for 5).

### 3. Permanent manifest + gate

- Save the manifest to `packages/forge/src/manifests/<game-id>.ts`, export it
  from `packages/forge/src/index.ts`.
- Add the game to the RTP gate: extend `packages/forge/src/simulate.spec.ts`
  with a gate test identical to the reference ones (200k spins, seed 1337).
- `pnpm --filter @casino/forge test` must pass.

### 4. Game page

`apps/web/app/games/<game-id>/page.tsx` is three lines:

```tsx
'use client';
import SlotForge from '../_forge/SlotForge';
import { myGame } from '@casino/forge';

export default function MyGamePage() {
  return <SlotForge manifest={myGame()} />;
}
```

### 5. Lobby registration (`apps/web/app/page.tsx`)

- Add an entry to `SLIDER_GAMES` (id, name, provider, rtp from the sim report,
  badge `YENİ`, bg gradient + accent from the manifest theme).
- Add the id to `GAME_CATEGORIES.Slots` (and `Popular` if flagship).
- Add a card art component to the art map if the lobby uses one for the id.

### 6. Verify like a player

- `pnpm --filter @casino/web typecheck && pnpm --filter @casino/web lint`
- `pnpm --filter @casino/web dev` → open `/games/<game-id>` and confirm:
  spin runs with staggered stops; a win pulses + counts up; tumble bursts and
  refills; scatter tease slows the tail reels; bonus buy triggers free spins
  with intro → banner → summary; paytable matches the manifest; audio plays
  and mutes.
- Screenshot the game for the PR description.

### 7. Deliver

Follow `.claude/skills/auto-pr-merge/SKILL.md`. Commit message trailer
`Ticket: GAME-<slug>`. Paste the sim report (`formatReport` output) into the
PR body as the math evidence.

---

## Quality bar (all must hold)

- [ ] RTP gate green at 200k spins, in-band
- [ ] Free spin trigger 1/100–1/250; FS RTP share 10–25%
- [ ] Hit frequency 25–60%
- [ ] Anticipation observed when ≥ (minTrigger−1) scatters land early
- [ ] Big Win tier reachable (≥20x seen in a 500-spin manual/auto session)
- [ ] All text on-screen in Turkish; no trademarked names anywhere
- [ ] Page + lobby entry + gate test in the same PR, nothing else touched
