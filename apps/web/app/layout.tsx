import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import AppShell from './components/shell/AppShell';

export const metadata: Metadata = {
  title: 'Neon Palace Casino | Social Casino Games',
  description: 'Play free social casino games — slots, blackjack, roulette and more. No real money gambling. Win virtual coins, climb the leaderboard.',
  keywords: 'social casino, free slots, blackjack online, roulette, virtual casino, casino games',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
