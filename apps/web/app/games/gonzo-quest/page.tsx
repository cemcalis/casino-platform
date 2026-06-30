'use client';
import SlotDemo from '../_shared/SlotDemo';

const config = {
  gameId: 'gonzo-quest',
  gameName: "Gonzo's Quest",
  provider: 'NetEnt',
  rtp: '96.0%',
  bgGradient: 'radial-gradient(ellipse at top, #003d00 0%, #001500 50%, #000500 100%)',
  accentColor: '#84cc16',
  accentColor2: '#fcd34d',
  storageKey: 'gq_demo_balance',
  symbols: [
    { id: 'stone',  label: 'STONE',  color: '#9ca3af', payout3: 2,  payout4: 5,   payout5: 12  },
    { id: 'mask',   label: 'MASK',   color: '#86efac', payout3: 3,  payout4: 8,   payout5: 20  },
    { id: 'idol',   label: 'IDOL',   color: '#6ee7b7', payout3: 5,  payout4: 12,  payout5: 30  },
    { id: 'temple', label: 'TEMPLE', color: '#fcd34d', payout3: 8,  payout4: 20,  payout5: 50  },
    { id: 'aztec',  label: 'AZTEC',  color: '#fb923c', payout3: 10, payout4: 30,  payout5: 80  },
    { id: 'condor', label: 'CONDOR', color: '#f87171', payout3: 15, payout4: 50,  payout5: 150 },
    { id: 'gonzo',  label: 'GONZO',  color: '#84cc16', payout3: 25, payout4: 100, payout5: 500 },
  ],
};

export default function GonzoQuestPage() {
  return <SlotDemo config={config} />;
}
