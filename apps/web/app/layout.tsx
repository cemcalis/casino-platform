import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import DemoBanner from './components/DemoBanner';

export const metadata: Metadata = {
  title: 'Casino | Player',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <DemoBanner />
        {children}
      </body>
    </html>
  );
}
