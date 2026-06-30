'use client';

export default function DemoBanner() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: 'linear-gradient(90deg,#0e0018,#130020,#0e0018)',
        borderBottom: '1px solid #d4a84833',
        color: '#d4a848',
        textAlign: 'center',
        padding: '4px 16px',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        fontFamily: 'Outfit, sans-serif',
      }}
    >
      Demo Mode — No live API · Social Casino · No Real Money
    </div>
  );
}
