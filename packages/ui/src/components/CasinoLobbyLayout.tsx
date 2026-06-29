import React from 'react';

export interface CasinoLobbyLayoutProps {
  header?: React.ReactNode;
  hero?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function CasinoLobbyLayout({ header, hero, children, footer }: CasinoLobbyLayoutProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {header && (
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backgroundColor: 'var(--np-bg-medium)',
            borderBottom: '1px solid var(--np-border-subtle)',
          }}
        >
          {header}
        </header>
      )}
      {hero && <section aria-label="Hero">{hero}</section>}
      <main style={{ flex: 1, padding: 'var(--np-space-6)' }}>{children}</main>
      {footer && (
        <footer
          style={{
            borderTop: '1px solid var(--np-border-subtle)',
            backgroundColor: 'var(--np-bg-medium)',
            padding: 'var(--np-space-6)',
          }}
        >
          {footer}
        </footer>
      )}
    </div>
  );
}
