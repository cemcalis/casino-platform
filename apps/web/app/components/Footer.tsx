'use client';
import Link from 'next/link';

/* ─── Design tokens ────────────────────────────────────────────── */
const T = {
  bg: '#06000e',
  surface: '#0d0018',
  card: '#130020',
  cardBorder: '#260840',
  gold: '#d4a848',
  goldBright: '#f4c430',
  purple: '#7c3aed',
  cyan: '#00d4c8',
  text: '#f0eaf8',
  textDim: '#7a7090',
  font: "'Outfit', sans-serif",
};

/* ─── Column link data ──────────────────────────────────────────── */
const COLUMNS = [
  {
    title: 'Games',
    links: [
      { label: 'All Games', href: '/#all-games' },
      { label: 'Search Games', href: '/search' },
      { label: 'Neon Palace', href: '/games/neon-palace' },
      { label: 'Blackjack Pro', href: '/games/blackjack-pro' },
      { label: 'Cyber Roulette', href: '/games/cyber-roulette' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Profile', href: '/profile' },
      { label: 'Wallet', href: '/wallet' },
      { label: 'History', href: '/history' },
      { label: 'VIP Club', href: '/vip' },
      { label: 'Tournaments', href: '/tournaments' },
      { label: 'Settings', href: '/settings' },
    ],
  },
  {
    title: 'Promotions',
    links: [
      { label: 'Welcome Bonus', href: '/promotions' },
      { label: 'Daily Bonus', href: '/promotions' },
      { label: 'Cashback', href: '/promotions' },
      { label: 'Free Spins', href: '/promotions' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'FAQ', href: '/faq' },
      { label: 'Support', href: '/faq' },
      { label: 'Responsible Gaming', href: '/faq' },
      { label: 'Terms', href: '/faq' },
    ],
  },
];

/* ─── Payment CSS art icons ─────────────────────────────────────── */
function PaymentIcon({ label, color }: { label: string; color: string }) {
  return (
    <div
      style={{
        padding: '6px 14px',
        borderRadius: 6,
        border: `1px solid ${T.cardBorder}`,
        background: `${color}11`,
        fontSize: 11,
        fontWeight: 800,
        color,
        letterSpacing: '0.06em',
        fontFamily: "'Courier New', monospace",
        userSelect: 'none',
      }}
    >
      {label}
    </div>
  );
}

/* ─── Provider pill ─────────────────────────────────────────────── */
function ProviderPill({ name }: { name: string }) {
  return (
    <span
      style={{
        padding: '5px 14px',
        borderRadius: 100,
        border: `1px solid ${T.cardBorder}`,
        background: T.card,
        fontSize: 11,
        color: T.textDim,
        letterSpacing: '0.05em',
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {name}
    </span>
  );
}

/* ─── Footer component ──────────────────────────────────────────── */
export default function Footer() {
  return (
    <footer
      style={{
        background: `linear-gradient(180deg, ${T.surface} 0%, ${T.bg} 100%)`,
        borderTop: `1px solid ${T.cardBorder}`,
        fontFamily: T.font,
        color: T.text,
      }}
    >
      {/* ── Top section: logo + tagline ───────────────────────── */}
      <div
        style={{
          padding: 'clamp(32px, 6vw, 48px) clamp(20px, 5vw, 40px) 32px',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: `linear-gradient(135deg, ${T.purple}, ${T.goldBright})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 15px ${T.gold}4d`,
              flexShrink: 0,
            }}
          >
            <div style={{ width: 16, height: 18, position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2.5, background: '#fff', borderRadius: 2 }} />
              <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 2.5, background: '#fff', borderRadius: 2 }} />
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2.5, background: '#fff', borderRadius: 2, transformOrigin: 'top left', transform: 'rotate(35deg) scaleX(1.15)' }} />
            </div>
          </div>
          <span
            style={{
              fontSize: 20,
              fontWeight: 900,
              letterSpacing: '0.1em',
              background: `linear-gradient(135deg, ${T.goldBright}, ${T.gold})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            NEON PALACE
          </span>
        </div>
        <p
          style={{
            margin: '0 0 36px',
            fontSize: 13,
            color: T.textDim,
            letterSpacing: '0.05em',
            maxWidth: 380,
            lineHeight: 1.6,
          }}
        >
          The ultimate social casino experience. Play premium slots with virtual coins — no real money, pure entertainment.
        </p>

        {/* ── 4-column link grid ─────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '28px 24px',
          }}
        >
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: T.gold,
                  letterSpacing: '0.12em',
                  marginBottom: 14,
                  textTransform: 'uppercase',
                }}
              >
                {col.title}
              </div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      style={{
                        fontSize: 13,
                        color: T.textDim,
                        textDecoration: 'none',
                        letterSpacing: '0.03em',
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = T.text)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = T.textDim)}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Divider ───────────────────────────────────────────── */}
      <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${T.cardBorder}, transparent)` }} />

      {/* ── Payment methods ──────────────────────────────────── */}
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '24px clamp(20px, 5vw, 40px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: T.textDim, letterSpacing: '0.1em', fontWeight: 700, marginBottom: 12 }}>
            PAYMENT METHODS
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <PaymentIcon label="VISA" color="#1a73e8" />
            <PaymentIcon label="MC" color="#eb001b" />
            <PaymentIcon label="₿ BTC" color="#f7931a" />
            <PaymentIcon label="Ξ ETH" color="#627eea" />
          </div>
        </div>

        {/* ── Game providers ─────────────────────────────────── */}
        <div>
          <div style={{ fontSize: 11, color: T.textDim, letterSpacing: '0.1em', fontWeight: 700, marginBottom: 12 }}>
            GAME PROVIDERS
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <ProviderPill name="Pragmatic Play" />
            <ProviderPill name="NetEnt" />
            <ProviderPill name="Microgaming" />
            <ProviderPill name="EGT" />
            <ProviderPill name="Novomatic" />
          </div>
        </div>
      </div>

      {/* ── Divider ───────────────────────────────────────────── */}
      <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${T.cardBorder}, transparent)` }} />

      {/* ── Bottom bar ───────────────────────────────────────── */}
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '20px clamp(20px, 5vw, 40px) clamp(20px, 4vw, 28px)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        {/* Left: copyright + disclaimer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 12, color: T.textDim, letterSpacing: '0.04em' }}>
            © {new Date().getFullYear()} Neon Palace. All rights reserved.
          </div>
          <div
            style={{
              fontSize: 11,
              color: T.gold,
              letterSpacing: '0.05em',
              background: `${T.gold}18`,
              border: `1px solid ${T.gold}33`,
              borderRadius: 6,
              padding: '4px 10px',
              display: 'inline-block',
              maxWidth: 'max-content',
            }}
          >
            Social Casino · No Real Money · Entertainment Only
          </div>
        </div>

        {/* Right: badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* 18+ badge */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(255,68,68,0.12)',
              border: '1.5px solid #ff4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 900,
              color: '#ff6b6b',
              letterSpacing: '-0.02em',
              flexShrink: 0,
            }}
          >
            18+
          </div>

          {/* Responsible gaming */}
          <div
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: '1px solid #22c55e55',
              background: '#22c55e11',
              fontSize: 11,
              color: '#22c55e',
              fontWeight: 700,
              letterSpacing: '0.06em',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
            }}
          >
            RESPONSIBLE GAMING
          </div>

          {/* License */}
          <div
            style={{
              fontSize: 10,
              color: T.textDim,
              letterSpacing: '0.04em',
              maxWidth: 200,
              lineHeight: 1.5,
              textAlign: 'right',
            }}
          >
            Licensed & Regulated · Demo Platform<br />Virtual currency — not real gambling
          </div>
        </div>
      </div>
    </footer>
  );
}
