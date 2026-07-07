'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  Gamepad2,
  Tv,
  TrendingUp,
  Trophy,
  Gift,
  Crown,
  Wallet,
  Activity,
  BarChart3,
  HelpCircle,
} from 'lucide-react';
import { CoinIcon } from '../icons';
import { SLIDER_GAMES } from '../lobby/data';

interface FeedEntry {
  id: number;
  user: string;
  game: string;
  amount: string;
}

const INITIAL_FEED: FeedEntry[] = [
  { id: 1, user: 'Dragon***', game: 'Neon Palace', amount: '24,750' },
  { id: 2, user: 'Royal***', game: 'Atlas Reef', amount: '18,200' },
  { id: 3, user: 'Lucky***', game: 'Cyber Roulette', amount: '12,500' },
  { id: 4, user: 'Mega***', game: 'Golden Vault', amount: '9,800' },
];

const NAV_SECTIONS: { label: string; items: { name: string; href: string; icon: typeof Gamepad2; badge?: string; badgeTone?: string }[] }[] = [
  {
    label: 'Lobi Kategorileri',
    items: [
      { name: 'Lobi', href: '/', icon: Sparkles },
      { name: 'Slotlar', href: '/#games', icon: Gamepad2, badge: 'HOT', badgeTone: 'bg-red-600/15 text-red-400' },
      { name: 'Canlı Casino', href: '/#live', icon: Tv, badge: 'POPÜLER', badgeTone: 'bg-[#a078ff]/15 text-[#d0bcff]' },
      { name: 'Spor Bahisleri', href: '/sports', icon: TrendingUp, badge: 'YAKINDA', badgeTone: 'bg-green-600/15 text-green-400 animate-pulse' },
    ],
  },
  {
    label: 'Kulüp',
    items: [
      { name: 'Turnuvalar', href: '/tournaments', icon: Trophy },
      { name: 'Promosyonlar', href: '/promotions', icon: Gift },
      { name: 'Liderlik', href: '/leaderboard', icon: BarChart3 },
      { name: 'VIP', href: '/vip', icon: Crown, badge: 'ELİT', badgeTone: 'bg-[#e9c349]/15 text-[#e9c349]' },
      { name: 'Cüzdan', href: '/wallet', icon: Wallet },
      { name: 'SSS', href: '/faq', icon: HelpCircle },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [feed, setFeed] = useState<FeedEntry[]>(INITIAL_FEED);

  useEffect(() => {
    const NAMES = ['Tiger', 'Comet', 'Blaze', 'Nova', 'Falcon', 'Viper', 'Storm', 'Atlas', 'Zafer', 'Kartal'];
    const timer = setInterval(() => {
      const name = NAMES[Math.floor(Math.random() * NAMES.length)];
      const game = SLIDER_GAMES[Math.floor(Math.random() * SLIDER_GAMES.length)];
      const amount = Math.floor(500 + Math.random() * 30000).toLocaleString('en-US');
      setFeed(prev =>
        [{ id: Date.now(), user: `${name}***`, game: game.name, amount }, ...prev].slice(0, 6),
      );
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <aside className="w-64 bg-zinc-950 border-r border-white/10 flex flex-col h-full z-30 select-none">
      {/* BRAND */}
      <div className="p-6 pb-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#a078ff] to-[#e9c349] flex items-center justify-center shadow-[0_0_15px_rgba(160,120,255,0.4)]">
            <Sparkles className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
          <div>
            <h2 className="font-display text-lg font-black tracking-widest text-white leading-none">
              NEON PALACE
            </h2>
            <span className="text-[10px] uppercase font-black tracking-widest text-[#e9c349]">
              Sosyal Casino
            </span>
          </div>
        </Link>

        {/* VIP STATUS CARD */}
        <div className="mt-5 bg-gradient-to-b from-zinc-900 to-zinc-950 border border-[#e9c349]/25 rounded-2xl p-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#e9c349]/5 rounded-full blur-xl pointer-events-none" />
          <span className="text-[10px] text-white/40 uppercase font-black tracking-wider">VIP Seviyesi</span>
          <p className="font-display text-base font-black text-[#e9c349] tracking-wide mt-1 group-hover:scale-105 transition-transform">
            Gold Prestij
          </p>
          <div className="w-full bg-zinc-800/60 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#e9c349] to-[#ffe088]" style={{ width: '62%' }} />
          </div>
          <span className="text-[9px] text-white/35 mt-1.5 block">Platinum&apos;a 3.800 puan kaldı</span>
        </div>
      </div>

      {/* NAV */}
      <div className="flex-1 px-4 py-2 space-y-4 overflow-y-auto scrollbar-none">
        {NAV_SECTIONS.map(section => (
          <div key={section.label} className="space-y-1.5">
            <p className="text-[10px] text-white/30 uppercase font-black tracking-widest pl-2 mb-2">{section.label}</p>
            {section.items.map(item => {
              const Icon = item.icon;
              const isActive =
                item.href === '/' ? pathname === '/' : pathname.startsWith(item.href.replace(/#.*$/, '')) && item.href !== '/#games' && item.href !== '/#live';
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-gradient-to-r from-[#a078ff]/10 to-transparent border border-[#a078ff]/20 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-[18px] h-[18px] transition-colors ${isActive ? 'text-[#a078ff]' : 'text-white/45 group-hover:text-white'}`} />
                    <span className="text-xs font-semibold tracking-wide">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[8px] font-black tracking-wider px-1.5 py-0.5 rounded ${item.badgeTone}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* LIVE WINNERS FEED */}
      <div className="p-4 border-t border-white/10 bg-black/40">
        <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-black uppercase tracking-wider mb-2.5">
          <Activity className="w-3.5 h-3.5 text-[#e9c349] animate-pulse" /> CANLI KAZANANLAR
        </div>
        <div className="bg-zinc-950/80 rounded-xl p-3 border border-white/5 h-[88px] overflow-hidden relative">
          <div className="space-y-2">
            {feed.slice(0, 3).map(entry => (
              <div key={entry.id} className="text-[10px] text-white/80 flex items-center gap-1 truncate animate-[fadeIn_0.5s_ease]">
                <span className="text-[#e9c349] font-bold">{entry.user}</span>
                <span className="text-white/40">·</span>
                <span className="truncate text-white/50">{entry.game}</span>
                <span className="ml-auto text-green-400 font-bold flex items-center gap-0.5">
                  {entry.amount} <CoinIcon size={10} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
