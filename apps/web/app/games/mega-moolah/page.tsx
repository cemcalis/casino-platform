'use client';
import SlotDemo from '../_shared/SlotDemo';

const config = {
  gameId: 'mega-moolah',
  gameName: 'Mega Moolah',
  provider: 'Microgaming',
  rtp: '96.0%',
  bgGradient: 'radial-gradient(ellipse at top, #1a0d00 0%, #080400 50%, #020100 100%)',
  accentColor: '#f97316',
  accentColor2: '#fcd34d',
  storageKey: 'mm_demo_balance',
  symbols: [
    { id: 'zebra',    label: 'ZEBRA',  color: '#d1d5db', payout3: 2,  payout4: 5,   payout5: 12   },
    { id: 'giraffe',  label: 'GIRAFF', color: '#fbbf24', payout3: 3,  payout4: 8,   payout5: 20   },
    { id: 'buffalo',  label: 'BUFF',   color: '#92400e', payout3: 5,  payout4: 12,  payout5: 30   },
    { id: 'elephant', label: 'ELEPH',  color: '#9ca3af', payout3: 8,  payout4: 20,  payout5: 50   },
    { id: 'lion',     label: 'LION',   color: '#f59e0b', payout3: 10, payout4: 30,  payout5: 80   },
    { id: 'monkey',   label: 'MONKEY', color: '#f97316', payout3: 15, payout4: 50,  payout5: 150  },
    { id: 'moolah',   label: '$$$',    color: '#fcd34d', payout3: 25, payout4: 200, payout5: 1000 },
  ],
};

export default function MegaMoolahPage() {
  return <SlotDemo config={config} />;
}
