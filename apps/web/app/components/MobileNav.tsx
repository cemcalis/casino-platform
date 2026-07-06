'use client';

import { usePathname, useRouter } from 'next/navigation';

const ITEMS = [
  { href: '/', icon: '🏠', label: 'Lobi' },
  { href: '/search', icon: '🎰', label: 'Oyunlar' },
  { href: '/promotions', icon: '🎁', label: 'Bonuslar' },
  { href: '/tournaments', icon: '🏆', label: 'Turnuva' },
  { href: '/wallet', icon: '🪙', label: 'Cüzdan' },
];

/**
 * Fixed bottom navigation on small screens — the standard mobile casino
 * lobby pattern. Hidden on desktop; hidden inside game pages so it never
 * overlaps the spin controls.
 */
export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  if (pathname?.startsWith('/games/')) return null;

  return (
    <>
      <nav className="mnav" aria-label="Mobil gezinme">
        {ITEMS.map((item) => {
          const active =
            item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);
          return (
            <button
              key={item.href}
              className={`mnav-item${active ? ' mnav-on' : ''}`}
              onClick={() => router.push(item.href)}
            >
              <span className="mnav-ico" aria-hidden="true">
                {item.icon}
              </span>
              <span className="mnav-lbl">{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="mnav-spacer" aria-hidden="true" />
      <style>{`
        .mnav { display: none; }
        .mnav-spacer { display: none; }
        @media (max-width: 768px) {
          .mnav {
            display: flex;
            position: fixed;
            bottom: 0; left: 0; right: 0;
            z-index: 90;
            background: rgba(12, 5, 26, 0.94);
            backdrop-filter: blur(14px);
            border-top: 1px solid rgba(244, 196, 48, 0.18);
            padding: 6px 4px calc(6px + env(safe-area-inset-bottom));
            justify-content: space-around;
          }
          .mnav-item {
            background: none; border: none; cursor: pointer;
            display: flex; flex-direction: column; align-items: center; gap: 2px;
            color: #9b8ab8; font-size: 10px; font-weight: 700;
            padding: 4px 10px; border-radius: 12px; letter-spacing: 0.4px;
          }
          .mnav-on { color: #f4c430; background: rgba(244, 196, 48, 0.1); }
          .mnav-ico { font-size: 20px; line-height: 1; }
          .mnav-spacer { display: block; height: 64px; }
        }
      `}</style>
    </>
  );
}
