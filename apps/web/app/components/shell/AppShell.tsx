'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import DemoBanner from '../DemoBanner';
import Footer from '../Footer';
import MobileNav from '../MobileNav';

/**
 * Global app chrome: desktop sidebar + top bar, mobile bottom nav.
 * Game screens (/games/*) stay full-bleed without chrome.
 */
export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isFullBleed = pathname.startsWith('/games/');

  if (isFullBleed) {
    return <>{children}</>;
  }

  return (
    <div className="w-screen h-screen bg-[#050506] text-white flex flex-col md:flex-row overflow-hidden antialiased">
      <div className="hidden md:block h-full flex-shrink-0">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto relative bg-[#0a0a0b]">
          <DemoBanner />
          {children}
          <Footer />
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
