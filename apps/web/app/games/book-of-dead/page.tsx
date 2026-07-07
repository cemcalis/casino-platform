'use client';
import SlotDemo from '../_shared/SlotDemo';

const config = {
  gameId: 'book-of-dead',
  gameName: 'Tome of Anubis',
  provider: 'Forge Studio',
  rtp: '96.21%',
  bgGradient: 'radial-gradient(ellipse at top, #1a0d00 0%, #080400 50%, #020100 100%)',
  accentColor: '#d4a848',
  accentColor2: '#f4c430',
  storageKey: 'bod_demo_balance',
  symbols: [
    { id: 'card10',  label: '10',     color: '#9ca3af', payout3: 2,  payout4: 5,   payout5: 10  },
    { id: 'cardj',   label: 'J',      color: '#86efac', payout3: 2,  payout4: 5,   payout5: 10  },
    { id: 'cardq',   label: 'Q',      color: '#93c5fd', payout3: 3,  payout4: 8,   payout5: 15  },
    { id: 'cardk',   label: 'K',      color: '#fca5a5', payout3: 3,  payout4: 8,   payout5: 15  },
    { id: 'carda',   label: 'A',      color: '#fbbf24', payout3: 5,  payout4: 15,  payout5: 40  },
    { id: 'pharaoh', label: 'PHARAO', color: '#d4a848', payout3: 15, payout4: 50,  payout5: 200 },
    { id: 'book',    label: 'BOOK',   color: '#f4c430', payout3: 25, payout4: 100, payout5: 500 },
  ],
};

export default function BookOfDeadPage() {
  return <SlotDemo config={config} />;
}
