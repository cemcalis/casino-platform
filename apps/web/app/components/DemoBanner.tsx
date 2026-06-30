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
        background: '#f4c430',
        color: '#1a1a2e',
        textAlign: 'center',
        padding: '6px 16px',
        fontSize: '13px',
        fontWeight: 600,
        letterSpacing: '0.03em',
      }}
    >
      DEMO MODE — No live API connected. Login and real-money features are disabled.
    </div>
  );
}
