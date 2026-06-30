'use client';
import SlotDemo from '../_shared/SlotDemo';

const config = {
  gameId: 'golden-vault',
  gameName: 'Golden Vault',
  provider: 'Microgaming',
  rtp: '97.1%',
  bgGradient: 'radial-gradient(ellipse at top, #1a0d00 0%, #0a0500 50%, #020100 100%)',
  accentColor: '#f4c430',
  accentColor2: '#ff9500',
  storageKey: 'gv_demo_balance',
  symbols: [
    { id: 'cherry',  label: 'CHERRY', color: '#ef4444', payout3: 2,  payout4: 5,   payout5: 10   },
    { id: 'lemon',   label: 'LEMON',  color: '#fef08a', payout3: 2,  payout4: 6,   payout5: 12   },
    { id: 'plum',    label: 'PLUM',   color: '#c084fc', payout3: 3,  payout4: 8,   payout5: 20   },
    { id: 'coin',    label: 'COIN',   color: '#fbbf24', payout3: 5,  payout4: 15,  payout5: 40   },
    { id: 'diamond', label: 'DIAM',   color: '#67e8f9', payout3: 10, payout4: 30,  payout5: 100  },
    { id: 'vault',   label: 'VAULT',  color: '#f97316', payout3: 20, payout4: 80,  payout5: 300  },
    { id: 'jackpot', label: 'JKPOT',  color: '#f4c430', payout3: 50, payout4: 200, payout5: 1000 },
  ],
};

export default function GoldenVaultPage() {
  return <SlotDemo config={config} />;
}
