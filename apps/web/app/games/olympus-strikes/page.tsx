'use client';
import SlotDemo from '../_shared/SlotDemo';

const config = {
  gameId: 'olympus-strikes',
  gameName: 'Olympus Strikes',
  provider: 'EGT',
  rtp: '95.5%',
  bgGradient: 'radial-gradient(ellipse at top, #001a3d 0%, #00082d 50%, #000108 100%)',
  accentColor: '#00d4c8',
  accentColor2: '#7c3aed',
  storageKey: 'os_demo_balance',
  symbols: [
    { id: 'wave',    label: 'WAVE',  color: '#7dd3fc', payout3: 2,  payout4: 5,   payout5: 12  },
    { id: 'owl',     label: 'OWL',   color: '#d1d5db', payout3: 3,  payout4: 8,   payout5: 18  },
    { id: 'harp',    label: 'HARP',  color: '#fbbf24', payout3: 5,  payout4: 12,  payout5: 28  },
    { id: 'helmet',  label: 'HELMT', color: '#60a5fa', payout3: 8,  payout4: 20,  payout5: 50  },
    { id: 'trident', label: 'TRDT',  color: '#00d4c8', payout3: 10, payout4: 30,  payout5: 80  },
    { id: 'thunder', label: 'THDR',  color: '#fef08a', payout3: 15, payout4: 50,  payout5: 150 },
    { id: 'zeus',    label: 'ZEUS',  color: '#a855f7', payout3: 25, payout4: 100, payout5: 500 },
  ],
};

export default function OlympusStrikesPage() {
  return <SlotDemo config={config} />;
}
