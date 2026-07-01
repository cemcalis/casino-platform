'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { userApi } from '../lib/api-user';
import {
  appendMessage,
  claimTicket,
  createTicket,
  loadCrm,
  subscribeCrm,
  type CrmTicket,
} from './components/crm/crm-mock';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface SliderGame {
  id: string;
  name: string;
  provider: string;
  rtp: string;
  badge: string;
  badgeColor: string;
  category: string;
  bg: string;
  accentColor: string;
}

interface Winner {
  initials: string;
  username: string;
  game: string;
  amount: string;
  avatarBg: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const SLIDER_GAMES: SliderGame[] = [
  {
    id: 'neon-palace',
    name: 'Neon Palace',
    provider: 'Pragmatic Play',
    rtp: '96.5%',
    badge: 'HOT',
    badgeColor: '#ff2d78',
    category: 'Slots',
    bg: 'linear-gradient(160deg, #1a0040 0%, #2d0060 40%, #3d0080 70%, #0a0020 100%)',
    accentColor: '#f4c430',
  },
  {
    id: 'dragons-fortune',
    name: "Dragon's Fortune",
    provider: 'NetEnt',
    rtp: '96.8%',
    badge: 'TOP',
    badgeColor: '#f4c430',
    category: 'Slots',
    bg: 'linear-gradient(160deg, #2d0000 0%, #5a0a00 40%, #8b1a00 70%, #1a0000 100%)',
    accentColor: '#ff6b00',
  },
  {
    id: 'olympus-strikes',
    name: 'Olympus Strikes',
    provider: 'EGT',
    rtp: '95.5%',
    badge: 'NEW',
    badgeColor: '#00d4c8',
    category: 'Slots',
    bg: 'linear-gradient(160deg, #001a3d 0%, #003080 40%, #0050c0 70%, #000d26 100%)',
    accentColor: '#00d4c8',
  },
  {
    id: 'golden-vault',
    name: 'Golden Vault',
    provider: 'Microgaming',
    rtp: '97.1%',
    badge: 'HOT',
    badgeColor: '#ff2d78',
    category: 'Jackpots',
    bg: 'linear-gradient(160deg, #1a1000 0%, #3d2800 40%, #5a3800 70%, #0d0800 100%)',
    accentColor: '#f4c430',
  },
  {
    id: 'cyber-roulette',
    name: 'Cyber Roulette',
    provider: 'Novomatic',
    rtp: '97.3%',
    badge: 'LIVE',
    badgeColor: '#22c55e',
    category: 'Table',
    bg: 'linear-gradient(160deg, #001a0d 0%, #003320 40%, #004d2e 70%, #000d08 100%)',
    accentColor: '#00d4c8',
  },
  {
    id: 'crystal-caverns',
    name: 'Crystal Caverns',
    provider: 'Pragmatic Play',
    rtp: '96.2%',
    badge: 'NEW',
    badgeColor: '#00d4c8',
    category: 'Slots',
    bg: 'linear-gradient(160deg, #001a1a 0%, #003d3d 40%, #006666 70%, #000d0d 100%)',
    accentColor: '#a855f7',
  },
  {
    id: 'lucky-7s',
    name: 'Lucky 7s Classic',
    provider: 'EGT',
    rtp: '95.5%',
    badge: 'HOT',
    badgeColor: '#ff2d78',
    category: 'Slots',
    bg: 'linear-gradient(160deg, #2d0010 0%, #5a0020 40%, #7a0030 70%, #1a0010 100%)',
    accentColor: '#f4c430',
  },
  {
    id: 'solar-wilds',
    name: 'Solar Wilds',
    provider: 'NetEnt',
    rtp: '96.9%',
    badge: 'POPULAR',
    badgeColor: '#f4c430',
    category: 'Slots',
    bg: 'linear-gradient(160deg, #1a0d00 0%, #3d2000 40%, #6b3a00 70%, #0d0800 100%)',
    accentColor: '#ff9500',
  },
  // NEW GAMES
  {
    id: 'blackjack-pro',
    name: 'Blackjack Pro',
    provider: 'NetEnt',
    rtp: '99.5%',
    badge: 'HOT',
    badgeColor: '#ff2d78',
    category: 'Table',
    bg: 'linear-gradient(160deg, #001a0a 0%, #002d14 40%, #004020 70%, #000d05 100%)',
    accentColor: '#22c55e',
  },
  {
    id: 'mega-moolah',
    name: 'Mega Moolah',
    provider: 'Microgaming',
    rtp: '96.0%',
    badge: 'MEGA',
    badgeColor: '#f97316',
    category: 'Jackpots',
    bg: 'linear-gradient(160deg, #1a0d00 0%, #3d1f00 40%, #5a2e00 70%, #0d0600 100%)',
    accentColor: '#f97316',
  },
  {
    id: 'starburst',
    name: 'Starburst',
    provider: 'NetEnt',
    rtp: '96.1%',
    badge: 'NEW',
    badgeColor: '#00d4c8',
    category: 'Slots',
    bg: 'linear-gradient(160deg, #1a0030 0%, #2d0050 40%, #1a0040 70%, #0d001a 100%)',
    accentColor: '#e879f9',
  },
  {
    id: 'gonzo-quest',
    name: "Gonzo's Quest",
    provider: 'NetEnt',
    rtp: '96.0%',
    badge: 'TOP',
    badgeColor: '#f4c430',
    category: 'Slots',
    bg: 'linear-gradient(160deg, #001a00 0%, #0a2d00 40%, #143d00 70%, #000d00 100%)',
    accentColor: '#84cc16',
  },
  {
    id: 'book-of-dead',
    name: 'Book of Dead',
    provider: 'Pragmatic Play',
    rtp: '96.21%',
    badge: 'HOT',
    badgeColor: '#ff2d78',
    category: 'Slots',
    bg: 'linear-gradient(160deg, #1a1000 0%, #3d2800 40%, #5a3800 70%, #0d0800 100%)',
    accentColor: '#d4a848',
  },
  {
    id: 'lightning-roulette',
    name: 'Lightning Roulette',
    provider: 'Evolution',
    rtp: '97.3%',
    badge: 'LIVE',
    badgeColor: '#22c55e',
    category: 'Live',
    bg: 'linear-gradient(160deg, #1a1200 0%, #3d2c00 40%, #5a4200 70%, #0d0900 100%)',
    accentColor: '#fbbf24',
  },
  {
    id: 'dream-catcher',
    name: 'Dream Catcher',
    provider: 'Evolution',
    rtp: '96.58%',
    badge: 'LIVE',
    badgeColor: '#22c55e',
    category: 'Live',
    bg: 'linear-gradient(160deg, #1a0040 0%, #2d0060 40%, #3d0080 70%, #0a0020 100%)',
    accentColor: '#f0abfc',
  },
  {
    id: 'crazy-time',
    name: 'Crazy Time',
    provider: 'Evolution',
    rtp: '96.08%',
    badge: 'LIVE',
    badgeColor: '#22c55e',
    category: 'Live',
    bg: 'linear-gradient(160deg, #001a00 0%, #002d00 40%, #003d00 70%, #000d00 100%)',
    accentColor: '#4ade80',
  },
  {
    id: 'baccarat',
    name: 'Baccarat',
    provider: 'Evolution',
    rtp: '98.94%',
    badge: 'LIVE',
    badgeColor: '#22c55e',
    category: 'Table',
    bg: 'linear-gradient(160deg, #1a0000 0%, #3d0a0a 40%, #5a1212 70%, #0d0000 100%)',
    accentColor: '#f4c430',
  },
  {
    id: 'dragon-fortune',
    name: 'Dragon Fortune',
    provider: 'Pragmatic Play',
    rtp: '96.4%',
    badge: 'NEW',
    badgeColor: '#00d4c8',
    category: 'Slots',
    bg: 'linear-gradient(160deg, #1a0008 0%, #3d0014 40%, #5a0020 70%, #0d0004 100%)',
    accentColor: '#ff6b00',
  },
  {
    id: 'fruit-frenzy',
    name: 'Fruit Frenzy',
    provider: 'NetEnt',
    rtp: '96.3%',
    badge: 'POPULAR',
    badgeColor: '#f4c430',
    category: 'Slots',
    bg: 'linear-gradient(160deg, #001a08 0%, #003d14 40%, #005a1e 70%, #000d04 100%)',
    accentColor: '#22c55e',
  },
  {
    id: 'pharaohs-treasure',
    name: "Pharaoh's Treasure",
    provider: 'Pragmatic Play',
    rtp: '96.5%',
    badge: 'HOT',
    badgeColor: '#ff2d78',
    category: 'Slots',
    bg: 'linear-gradient(160deg, #1a1400 0%, #3d2e00 40%, #5a4400 70%, #0d0a00 100%)',
    accentColor: '#f4c430',
  },
  {
    id: 'video-poker',
    name: 'Video Poker',
    provider: 'NetEnt',
    rtp: '99.5%',
    badge: 'TOP',
    badgeColor: '#f4c430',
    category: 'Table',
    bg: 'linear-gradient(160deg, #00081a 0%, #001433 40%, #001f4d 70%, #00040d 100%)',
    accentColor: '#00d4c8',
  },
];

const PROMO_CARDS = [
  {
    id: 'welcome',
    title: 'WELCOME BONUS',
    subtitle: '100% up to $1,000',
    detail: '+ 200 Free Spins on first deposit',
    cta: 'CLAIM NOW',
    bg: 'linear-gradient(135deg, #2d0060 0%, #1a0040 50%, #0d0020 100%)',
    border: 'rgba(244,196,48,0.4)',
    accent: '#f4c430',
    tag: 'LIMITED OFFER',
  },
  {
    id: 'reload',
    title: 'WEEKLY RELOAD',
    subtitle: '50% Reload Every Monday',
    detail: 'Up to $500 · Minimum deposit $20',
    cta: 'GET BONUS',
    bg: 'linear-gradient(135deg, #00302e 0%, #001a18 50%, #000d0c 100%)',
    border: 'rgba(0,212,200,0.4)',
    accent: '#00d4c8',
    tag: 'EVERY MONDAY',
  },
  {
    id: 'vip-cashback',
    title: 'VIP CASHBACK',
    subtitle: '20% Weekly Cashback',
    detail: 'Exclusive for VIP Gold+ members',
    cta: 'JOIN VIP',
    bg: 'linear-gradient(135deg, #3d2000 0%, #1a0d00 50%, #0d0800 100%)',
    border: 'rgba(244,196,48,0.4)',
    accent: '#f4c430',
    tag: 'VIP EXCLUSIVE',
  },
];

const CATEGORIES_LIST = ['All', 'Slots', 'Table', 'Live', 'Jackpots', 'New', 'Popular'];

const SORT_OPTIONS = ['Popular', 'Newest', 'Highest RTP', 'A-Z', 'Z-A'];

const VOLATILITY_OPTIONS = ['All', 'Low', 'Medium', 'High'];

const CATEGORY_MAP: Record<string, string[]> = {
  All: SLIDER_GAMES.map(g => g.id),
  Slots: ['neon-palace', 'dragons-fortune', 'olympus-strikes', 'crystal-caverns', 'lucky-7s', 'solar-wilds', 'starburst', 'gonzo-quest', 'book-of-dead', 'dragon-fortune', 'fruit-frenzy', 'pharaohs-treasure'],
  Table: ['cyber-roulette', 'blackjack-pro', 'baccarat', 'video-poker'],
  Live: ['cyber-roulette', 'lightning-roulette', 'dream-catcher', 'crazy-time', 'baccarat'],
  Jackpots: ['golden-vault', 'mega-moolah'],
  New: ['olympus-strikes', 'crystal-caverns', 'starburst', 'dragon-fortune'],
  Popular: ['neon-palace', 'dragons-fortune', 'solar-wilds', 'gonzo-quest', 'fruit-frenzy'],
};

const WINNERS: Winner[] = [
  { initials: 'DK', username: 'Dragon***', game: 'Neon Palace', amount: '$24,750', avatarBg: 'linear-gradient(135deg,#f4c430,#d97706)' },
  { initials: 'RM', username: 'Royal***', game: "Dragon's Fortune", amount: '$18,200', avatarBg: 'linear-gradient(135deg,#ff2d78,#9f1239)' },
  { initials: 'LK', username: 'Lucky***', game: 'Cyber Roulette', amount: '$12,500', avatarBg: 'linear-gradient(135deg,#00d4c8,#0e7490)' },
  { initials: 'MX', username: 'Mega***', game: 'Golden Vault', amount: '$9,800', avatarBg: 'linear-gradient(135deg,#7c3aed,#4c1d95)' },
  { initials: 'ST', username: 'Star***', game: 'Crystal Caverns', amount: '$8,400', avatarBg: 'linear-gradient(135deg,#a855f7,#7c3aed)' },
  { initials: 'NX', username: 'Neon***', game: 'Solar Wilds', amount: '$7,200', avatarBg: 'linear-gradient(135deg,#ff9500,#d97706)' },
  { initials: 'PK', username: 'Phoenix***', game: 'Lucky 7s Classic', amount: '$6,100', avatarBg: 'linear-gradient(135deg,#22c55e,#15803d)' },
  { initials: 'AX', username: 'Apex***', game: 'Olympus Strikes', amount: '$5,500', avatarBg: 'linear-gradient(135deg,#00d4c8,#7c3aed)' },
];

const VIP_LEVELS = [
  { name: 'Bronze', color: '#cd7f32', min: 0, max: 1000, perks: ['5% Cashback', 'Weekly Bonus', 'Priority Support'] },
  { name: 'Silver', color: '#c0c0c0', min: 1000, max: 5000, perks: ['10% Cashback', 'Birthday Bonus', 'Personal Manager'] },
  { name: 'Gold', color: '#f4c430', min: 5000, max: 15000, perks: ['15% Cashback', 'Exclusive Events', 'Faster Withdrawals'] },
  { name: 'Platinum', color: '#e5e4e2', min: 15000, max: 50000, perks: ['20% Cashback', 'Luxury Gifts', 'VIP Tournaments'] },
  { name: 'Diamond', color: '#00d4c8', min: 50000, max: 999999, perks: ['25% Cashback', 'Private Events', 'Dedicated Host'] },
];

const HERO_SLIDES = [
  {
    id: 'neon-palace-promo',
    title: 'NEON PALACE',
    subtitle: 'The Ultimate Slot Experience',
    desc: 'Spin the reels and win up to 10,000x your bet',
    cta: 'PLAY NOW',
    ctaLink: '/games/neon-palace',
    bg: 'linear-gradient(135deg, #1a0040 0%, #2d0060 40%, #3d0080 70%, #0a0020 100%)',
    accentColor: '#f4c430',
    glowColor: 'rgba(244,196,48,0.3)',
  },
  {
    id: 'welcome-bonus',
    title: 'WELCOME BONUS',
    subtitle: '100% up to 5,000 Coins',
    desc: '+ 200 Free Spins on your first deposit today',
    cta: 'CLAIM NOW',
    ctaLink: '/promotions',
    bg: 'linear-gradient(135deg, #1a0d00 0%, #3d2200 40%, #5a3200 70%, #0d0800 100%)',
    accentColor: '#f4c430',
    glowColor: 'rgba(244,196,48,0.35)',
  },
  {
    id: 'vip-club',
    title: 'VIP CLUB',
    subtitle: 'Exclusive Rewards Await',
    desc: 'Join our elite Diamond program and enjoy 25% cashback',
    cta: 'JOIN VIP',
    ctaLink: '/vip',
    bg: 'linear-gradient(135deg, #001a2d 0%, #002d40 40%, #003d50 70%, #000d1a 100%)',
    accentColor: '#00d4c8',
    glowColor: 'rgba(0,212,200,0.3)',
  },
];

const LIVE_CASINO_GAMES = [
  { id: 'lightning-roulette', name: 'Lightning Roulette', provider: 'Evolution', players: '1,247', color: '#fbbf24' },
  { id: 'dream-catcher', name: 'Dream Catcher', provider: 'Evolution', players: '892', color: '#f0abfc' },
  { id: 'crazy-time', name: 'Crazy Time', provider: 'Evolution', players: '2,103', color: '#4ade80' },
  { id: 'blackjack-pro', name: 'Blackjack Pro', provider: 'NetEnt', players: '443', color: '#22c55e' },
];

const PROVIDERS = [
  'Pragmatic Play', 'NetEnt', 'Microgaming', 'EGT', 'Novomatic',
  'Evolution', 'Playtech', 'Yggdrasil', 'Red Tiger', 'Push Gaming',
];

// ─────────────────────────────────────────────────────────────────────────────
// CSS KEYFRAMES + GLOBAL STYLES
// ─────────────────────────────────────────────────────────────────────────────

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{background:#0a0010;font-family:'Outfit',sans-serif;color:#f0e8ff;overflow-x:hidden;}
::-webkit-scrollbar{width:6px;height:6px;}
::-webkit-scrollbar-track{background:#0a0010;}
::-webkit-scrollbar-thumb{background:#3d1f6e;border-radius:3px;}
::-webkit-scrollbar-thumb:hover{background:#7c3aed;}

@keyframes twinkle{0%,100%{opacity:.15;transform:scale(1);}50%{opacity:.9;transform:scale(1.5);}}
@keyframes floatOrb{0%,100%{transform:translateY(0) scale(1);}50%{transform:translateY(-18px) scale(1.04);}}
@keyframes shimmer{0%{background-position:-400% center;}100%{background-position:400% center;}}
@keyframes jackpotFlash{0%,100%{text-shadow:0 0 20px rgba(244,196,48,0.5),0 0 40px rgba(244,196,48,0.3);}50%{text-shadow:0 0 40px rgba(244,196,48,1),0 0 80px rgba(244,196,48,0.7),0 0 160px rgba(244,196,48,0.4);}}
@keyframes jackpotNum{0%{transform:translateY(-4px);opacity:.6;}100%{transform:translateY(0);opacity:1;}}
@keyframes winnerScroll{0%{transform:translateX(0);}100%{transform:translateX(-50%);}}
@keyframes providerScroll{0%{transform:translateX(0);}100%{transform:translateX(-50%);}}
@keyframes slideUp{from{opacity:0;transform:translateY(40px);}to{opacity:1;transform:translateY(0);}}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
@keyframes glowPulse{0%,100%{box-shadow:0 0 20px rgba(244,196,48,0.2);}50%{box-shadow:0 0 50px rgba(244,196,48,0.6),0 0 100px rgba(244,196,48,0.2);}}
@keyframes cardShine{0%{left:-100%;}60%,100%{left:150%;}}
@keyframes dotBlink{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(34,197,94,0.5);}50%{opacity:.7;box-shadow:0 0 0 5px rgba(34,197,94,0);}}
@keyframes liveDot{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.6;transform:scale(1.4);}}
@keyframes promoFade{from{opacity:0;transform:translateX(30px);}to{opacity:1;transform:translateX(0);}}
@keyframes spinGlow{0%,100%{box-shadow:0 8px 40px rgba(244,196,48,0.3);}50%{box-shadow:0 8px 80px rgba(244,196,48,0.7),0 0 120px rgba(244,196,48,0.2);}}
@keyframes rotateSlow{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
@keyframes scalePop{0%{transform:scale(0.8);opacity:0;}100%{transform:scale(1);opacity:1;}}
@keyframes borderGlow{0%,100%{border-color:rgba(244,196,48,0.15);}50%{border-color:rgba(244,196,48,0.5);}}
@keyframes heroSlide{from{opacity:0;transform:translateX(60px);}to{opacity:1;transform:translateX(0);}}
@keyframes heroPop{from{opacity:0;transform:scale(0.92);}to{opacity:1;transform:scale(1);}}
`;

// ─────────────────────────────────────────────────────────────────────────────
// STAR BACKGROUND COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

function StarBackground() {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: `${(i * 17 + 3) % 100}%`,
    top: `${(i * 13 + 7) % 100}%`,
    size: i % 4 === 0 ? 3 : i % 3 === 0 ? 2 : 1,
    delay: `${(i * 0.37) % 4}s`,
    duration: `${2.5 + (i % 5) * 0.7}s`,
  }));

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {stars.map(s => (
        <div key={s.id} style={{
          position: 'absolute',
          left: s.left, top: s.top,
          width: s.size, height: s.size,
          borderRadius: '50%',
          background: '#fff',
          animation: `twinkle ${s.duration} ${s.delay} ease-in-out infinite`,
        }} />
      ))}
      <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', animation: 'floatOrb 8s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,200,0.07) 0%, transparent 70%)', animation: 'floatOrb 11s ease-in-out 2s infinite' }} />
      <div style={{ position: 'absolute', top: '30%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,45,120,0.06) 0%, transparent 70%)', animation: 'floatOrb 9s ease-in-out 4s infinite' }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GAME CARD ART COMPONENTS (CSS-only, zero emoji)
// ─────────────────────────────────────────────────────────────────────────────

function NeonPalaceArt() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {[0,1,2].map(i => (
        <div key={i} style={{ position: 'absolute', top: 20, bottom: 20, left: `${18 + i*26}%`, width: 40, borderRadius: 8, background: 'rgba(10,0,30,0.7)', border: '1px solid rgba(244,196,48,0.3)', overflow: 'hidden' }}>
          {[0,1,2].map(j => (
            <div key={j} style={{ height: '33.33%', borderBottom: j < 2 ? '1px solid rgba(244,196,48,0.2)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 20, height: 20, borderRadius: 3, background: j === 1 ? 'linear-gradient(135deg,#f4c430,#d97706)' : 'rgba(244,196,48,0.1)', boxShadow: j === 1 ? '0 0 12px rgba(244,196,48,0.8)' : 'none' }} />
            </div>
          ))}
        </div>
      ))}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, transparent, #f4c430, #ff2d78, #f4c430, transparent)', boxShadow: '0 0 20px rgba(244,196,48,0.8)' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, rgba(244,196,48,0.03) 0px, rgba(244,196,48,0.03) 2px, transparent 2px, transparent 20px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 10, right: 10, width: 14, height: 14, background: 'linear-gradient(135deg,#ff2d78,#f4c430)', borderRadius: 3, transform: 'rotate(45deg)', boxShadow: '0 0 10px rgba(255,45,120,0.8)' }} />
    </div>
  );
}

function DragonArt() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse 24px 18px at 0 0, rgba(255,107,0,0.2) 0%, transparent 100%)', backgroundSize: '24px 18px' }} />
      <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 120, height: 80, background: 'radial-gradient(ellipse at bottom, rgba(255,107,0,0.8) 0%, rgba(255,45,0,0.4) 40%, transparent 70%)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', top: '25%', left: '50%', transform: 'translateX(-50%)', width: 70, height: 60, background: 'rgba(139,26,0,0.6)', borderRadius: '40% 60% 60% 40%', boxShadow: '0 0 20px rgba(255,107,0,0.4)' }} />
      <div style={{ position: 'absolute', top: '20%', left: '15%', width: 50, height: 40, background: 'rgba(139,26,0,0.4)', borderRadius: '0 80% 0 0', transform: 'skewX(-10deg)' }} />
      <div style={{ position: 'absolute', top: '20%', right: '15%', width: 50, height: 40, background: 'rgba(139,26,0,0.4)', borderRadius: '80% 0 0 0', transform: 'skewX(10deg)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, transparent, #ff6b00, #ff2d00, #ff6b00, transparent)', boxShadow: '0 0 20px rgba(255,107,0,0.8)' }} />
    </div>
  );
}

function OlympusArt() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,80,180,0.4) 0%, transparent 100%)' }} />
      {[15, 35, 55, 75].map((left, i) => (
        <div key={i} style={{ position: 'absolute', bottom: 0, left: `${left}%`, width: 18, background: 'linear-gradient(180deg, rgba(0,212,200,0.6) 0%, rgba(0,80,180,0.3) 100%)', height: `${60 + i * 8}%`, borderRadius: '4px 4px 0 0', boxShadow: '0 0 15px rgba(0,212,200,0.3)' }}>
          <div style={{ height: 8, background: 'rgba(0,212,200,0.8)', borderRadius: '4px 4px 0 0', boxShadow: '0 0 10px rgba(0,212,200,0.7)' }} />
        </div>
      ))}
      <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: 3, height: 40, background: 'linear-gradient(180deg,#f4c430,transparent)', boxShadow: '0 0 15px rgba(244,196,48,0.9)', borderRadius: 2 }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,transparent,#00d4c8,#7c3aed,#00d4c8,transparent)', boxShadow: '0 0 20px rgba(0,212,200,0.8)' }} />
    </div>
  );
}

function GoldenVaultArt() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: 90, height: 110, borderRadius: '50% 50% 10px 10px', background: 'linear-gradient(135deg, #5a3800, #3d2800, #2a1800)', border: '4px solid rgba(244,196,48,0.5)', boxShadow: '0 0 30px rgba(244,196,48,0.3)' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 44, height: 44, borderRadius: '50%', background: 'radial-gradient(circle, #f4c430, #8b6914)', border: '3px solid rgba(244,196,48,0.6)', boxShadow: '0 0 20px rgba(244,196,48,0.5)' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-100%)', width: 2, height: 16, background: '#0d0618', borderRadius: 1 }} />
        </div>
        <div style={{ position: 'absolute', right: -10, top: '40%', width: 16, height: 28, borderRadius: 8, background: 'rgba(244,196,48,0.4)', border: '2px solid rgba(244,196,48,0.4)' }} />
        {[[8,8],[8,92],[92,8],[92,92]].map(([t,l],i)=>(
          <div key={i} style={{ position:'absolute', top:`${t}%`, left:`${l}%`, width:10, height:10, borderRadius:'50%', background:'rgba(244,196,48,0.6)', transform:'translate(-50%,-50%)' }} />
        ))}
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: 'radial-gradient(ellipse at bottom, rgba(244,196,48,0.2) 0%, transparent 100%)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,transparent,#f4c430,transparent)', boxShadow: '0 0 20px rgba(244,196,48,0.8)' }} />
    </div>
  );
}

function CyberRouletteArt() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,212,200,0.08) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,200,0.08) 1px,transparent 1px)', backgroundSize: '20px 20px' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 120, height: 120, borderRadius: '50%', border: '3px solid rgba(0,212,200,0.6)', boxShadow: '0 0 20px rgba(0,212,200,0.3), inset 0 0 20px rgba(0,212,200,0.1)' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 80, height: 80, borderRadius: '50%', border: '2px solid rgba(0,212,200,0.4)', boxShadow: '0 0 15px rgba(0,212,200,0.2)' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 30, height: 30, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,212,200,0.8),rgba(0,212,200,0.2))', boxShadow: '0 0 20px rgba(0,212,200,0.8)' }} />
        </div>
        {Array.from({length:8},(_,i)=>(
          <div key={i} style={{ position:'absolute', top:'50%', left:'50%', width:2, height:58, background:`rgba(0,212,200,${i%2===0?0.6:0.2})`, transformOrigin:'top center', transform:`translateX(-50%) rotate(${i*45}deg)`, borderRadius:1 }} />
        ))}
      </div>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,transparent,#00d4c8,transparent)', boxShadow: '0 0 20px rgba(0,212,200,0.8)' }} />
    </div>
  );
}

function CrystalCavernsArt() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {[
        { left: '10%', top: '10%', w: 50, h: 80, rotate: -20, color: 'rgba(168,85,247,0.4)' },
        { left: '30%', top: '5%', w: 35, h: 100, rotate: 5, color: 'rgba(0,212,200,0.4)' },
        { left: '55%', top: '15%', w: 45, h: 70, rotate: 15, color: 'rgba(168,85,247,0.3)' },
        { left: '70%', top: '8%', w: 30, h: 85, rotate: -10, color: 'rgba(0,212,200,0.3)' },
      ].map((c, i) => (
        <div key={i} style={{ position: 'absolute', left: c.left, top: c.top, width: c.w, height: c.h, background: c.color, transform: `rotate(${c.rotate}deg)`, clipPath: 'polygon(50% 0%, 100% 30%, 100% 70%, 50% 100%, 0% 70%, 0% 30%)', boxShadow: `0 0 20px ${c.color}` }} />
      ))}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 50, background: 'radial-gradient(ellipse at bottom, rgba(168,85,247,0.3) 0%, transparent 100%)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,transparent,#a855f7,#00d4c8,#a855f7,transparent)', boxShadow: '0 0 20px rgba(168,85,247,0.8)' }} />
    </div>
  );
}

function Lucky7Art() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle 1px at 50% 50%, rgba(244,196,48,0.08) 0%, transparent 100%)', backgroundSize: '12px 12px' }} />
      <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 70, height: 110, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 18, background: 'linear-gradient(135deg,#f4c430,#ff2d78)', borderRadius: 5, boxShadow: '0 0 20px rgba(244,196,48,0.6)' }} />
        <div style={{ flex: 1, marginLeft: 'auto', width: 18, background: 'linear-gradient(180deg,#f4c430,#d97706)', borderRadius: '0 0 5px 5px', boxShadow: '0 0 20px rgba(244,196,48,0.4)', marginTop: 2, transform: 'skewX(-8deg)' }} />
      </div>
      {[{t:'8%',l:'5%'},{t:'20%',r:'8%'},{b:'15%',l:'8%'},{b:'20%',r:'5%'}].map((pos,i)=>(
        <div key={i} style={{ position:'absolute', ...pos as React.CSSProperties, width:14, height:14, background:'rgba(244,196,48,0.6)', clipPath:'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)', boxShadow:'0 0 12px rgba(244,196,48,0.7)' }} />
      ))}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,transparent,#f4c430,#ff2d78,#f4c430,transparent)', boxShadow: '0 0 20px rgba(244,196,48,0.8)' }} />
    </div>
  );
}

function SolarWildsArt() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {Array.from({length:12},(_,i)=>(
        <div key={i} style={{ position:'absolute', top:'50%', left:'50%', width:2, height:80, background:`rgba(255,149,0,${i%2===0?0.4:0.2})`, transformOrigin:'top center', transform:`translate(-50%,-100%) rotate(${i*30}deg)`, borderRadius:2 }} />
      ))}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 60, height: 60, borderRadius: '50%', background: 'radial-gradient(circle, #fff 0%, #ffdd00 30%, #ff9500 70%, transparent 100%)', boxShadow: '0 0 30px rgba(255,149,0,0.9), 0 0 60px rgba(255,149,0,0.4)' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 110, height: 110, borderRadius: '50%', border: '1px solid rgba(255,149,0,0.3)', boxShadow: '0 0 20px rgba(255,149,0,0.1)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,transparent,#ff9500,#f4c430,#ff9500,transparent)', boxShadow: '0 0 20px rgba(255,149,0,0.8)' }} />
    </div>
  );
}

// NEW GAME ARTS

function BlackjackProArt() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse 30px 20px at 50% 50%, rgba(34,197,94,0.06) 0%, transparent 100%)', backgroundSize: '30px 20px' }} />
      {/* Card 1 */}
      <div style={{ position: 'absolute', top: '20%', left: '22%', width: 60, height: 84, borderRadius: 8, background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.6)', transform: 'rotate(-8deg)' }}>
        <div style={{ position: 'absolute', top: 6, left: 8, fontSize: 14, fontWeight: 900, color: '#111', fontFamily: 'serif' }}>A</div>
        <div style={{ position: 'absolute', top: 50, left: '50%', transform: 'translateX(-50%)', fontSize: 18, color: '#cc0000' }}>♥</div>
      </div>
      {/* Card 2 */}
      <div style={{ position: 'absolute', top: '15%', left: '40%', width: 60, height: 84, borderRadius: 8, background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.6)', transform: 'rotate(5deg)' }}>
        <div style={{ position: 'absolute', top: 6, left: 8, fontSize: 14, fontWeight: 900, color: '#111', fontFamily: 'serif' }}>K</div>
        <div style={{ position: 'absolute', top: 50, left: '50%', transform: 'translateX(-50%)', fontSize: 18, color: '#111' }}>♠</div>
      </div>
      {/* Glow */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 50, background: 'radial-gradient(ellipse at bottom, rgba(34,197,94,0.25) 0%, transparent 100%)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,transparent,#22c55e,transparent)', boxShadow: '0 0 20px rgba(34,197,94,0.8)' }} />
    </div>
  );
}

function MegaMoolahArt() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* Safari stripes */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(60deg, rgba(249,115,22,0.04) 0px, rgba(249,115,22,0.04) 4px, transparent 4px, transparent 28px)' }} />
      {/* Big coin */}
      <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: 90, height: 90, borderRadius: '50%', background: 'radial-gradient(circle, #fcd34d 0%, #f97316 60%, #c2410c 100%)', border: '4px solid rgba(253,186,116,0.6)', boxShadow: '0 0 40px rgba(249,115,22,0.7), 0 0 80px rgba(249,115,22,0.3)' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 26, fontWeight: 900, color: '#7c2d12', fontFamily: 'serif' }}>$</div>
      </div>
      {/* Small coins */}
      {[{t:'62%',l:'15%'},{t:'65%',r:'15%'},{t:'75%',l:'40%'}].map((p,i)=>(
        <div key={i} style={{ position:'absolute', ...p as React.CSSProperties, width:28, height:28, borderRadius:'50%', background:'radial-gradient(circle,#fcd34d,#f97316)', boxShadow:'0 0 12px rgba(249,115,22,0.6)' }} />
      ))}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,transparent,#f97316,#fcd34d,#f97316,transparent)', boxShadow: '0 0 20px rgba(249,115,22,0.8)' }} />
    </div>
  );
}

function StarburstArt() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* Cosmic rays */}
      {Array.from({length:8},(_,i)=>(
        <div key={i} style={{ position:'absolute', top:'50%', left:'50%', width:3, height:90, background:`linear-gradient(180deg, rgba(232,121,249,0.8) 0%, transparent 100%)`, transformOrigin:'top center', transform:`translate(-50%,-100%) rotate(${i*45}deg)`, borderRadius:2 }} />
      ))}
      {/* Star core */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 50, height: 50, borderRadius: '50%', background: 'radial-gradient(circle, #fff 0%, #e879f9 40%, #7c3aed 80%, transparent 100%)', boxShadow: '0 0 30px rgba(232,121,249,0.9), 0 0 60px rgba(124,58,237,0.5)' }} />
      {/* Ring */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 100, height: 100, borderRadius: '50%', border: '2px solid rgba(232,121,249,0.4)', boxShadow: '0 0 20px rgba(232,121,249,0.3)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,transparent,#e879f9,#7c3aed,#e879f9,transparent)', boxShadow: '0 0 20px rgba(232,121,249,0.8)' }} />
    </div>
  );
}

function GonzoQuestArt() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* Jungle bg */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,40,0,0.4) 0%, rgba(20,61,0,0.6) 100%)' }} />
      {/* Aztec blocks */}
      {[[10,15],[30,8],[50,20],[70,12],[85,5]].map(([l,t],i)=>(
        <div key={i} style={{ position:'absolute', left:`${l}%`, top:`${t}%`, width:28, height:28, background:`rgba(132,204,22,${0.2+i*0.05})`, border:'1px solid rgba(132,204,22,0.3)', borderRadius:4 }}>
          <div style={{ position:'absolute', inset:4, border:'1px solid rgba(132,204,22,0.2)', borderRadius:2 }} />
        </div>
      ))}
      {/* Gold accent */}
      <div style={{ position: 'absolute', bottom: '20%', left: '50%', transform: 'translateX(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'radial-gradient(circle,#fcd34d,#84cc16)', boxShadow: '0 0 25px rgba(132,204,22,0.7)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,transparent,#84cc16,#fcd34d,#84cc16,transparent)', boxShadow: '0 0 20px rgba(132,204,22,0.8)' }} />
    </div>
  );
}

function BookOfDeadArt() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* Sand/gold desert bg */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(30,20,0,0.5) 0%, rgba(50,35,0,0.7) 100%)' }} />
      {/* Hieroglyph lines */}
      {[20,40,60,80].map((t,i)=>(
        <div key={i} style={{ position:'absolute', top:`${t}%`, left:'15%', right:'15%', height:1, background:`rgba(212,168,72,${0.15+i*0.05})` }} />
      ))}
      {/* Book icon */}
      <div style={{ position: 'absolute', top: '18%', left: '50%', transform: 'translateX(-50%)', width: 64, height: 80, borderRadius: 4, background: 'linear-gradient(135deg,rgba(212,168,72,0.4),rgba(212,168,72,0.15))', border: '2px solid rgba(212,168,72,0.5)', boxShadow: '0 0 25px rgba(212,168,72,0.4)' }}>
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 2, background: 'rgba(212,168,72,0.4)', transform: 'translateX(-50%)' }} />
        {[25,45,65].map((t,i)=>(
          <div key={i} style={{ position:'absolute', top:`${t}%`, left:'20%', right:'20%', height:2, background:'rgba(212,168,72,0.3)', borderRadius:1 }} />
        ))}
      </div>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,transparent,#d4a848,transparent)', boxShadow: '0 0 20px rgba(212,168,72,0.8)' }} />
    </div>
  );
}

function LightningRouletteArt() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(251,191,36,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(251,191,36,0.06) 1px,transparent 1px)', backgroundSize: '18px 18px' }} />
      {/* Wheel */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 110, height: 110, borderRadius: '50%', border: '3px solid rgba(251,191,36,0.7)', boxShadow: '0 0 30px rgba(251,191,36,0.4), inset 0 0 20px rgba(251,191,36,0.1)' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 70, height: 70, borderRadius: '50%', border: '2px solid rgba(251,191,36,0.4)' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 25, height: 25, borderRadius: '50%', background: 'radial-gradient(circle,#fbbf24,rgba(251,191,36,0.3))', boxShadow: '0 0 15px rgba(251,191,36,0.9)' }} />
        </div>
        {/* Lightning bolt in center */}
        {Array.from({length:6},(_,i)=>(
          <div key={i} style={{ position:'absolute', top:'50%', left:'50%', width:2, height:53, background:`rgba(251,191,36,${i%2===0?0.7:0.3})`, transformOrigin:'top center', transform:`translateX(-50%) rotate(${i*60}deg)`, borderRadius:1 }} />
        ))}
      </div>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,transparent,#fbbf24,transparent)', boxShadow: '0 0 20px rgba(251,191,36,0.9)' }} />
    </div>
  );
}

function DreamCatcherArt() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* Carnival-ish colors */}
      {[
        { r: 40, g: 0, top: '10%', left: '10%', color: 'rgba(240,171,252,0.5)' },
        { r: 30, g: 0, top: '15%', right: '10%', color: 'rgba(129,140,248,0.5)' },
        { r: 25, g: 0, bottom: '20%', left: '20%', color: 'rgba(52,211,153,0.4)' },
        { r: 35, g: 0, bottom: '15%', right: '15%', color: 'rgba(251,191,36,0.4)' },
      ].map((o, i) => {
        const { r, g, ...pos } = o;
        return (
          <div key={i} style={{ position: 'absolute', ...pos as React.CSSProperties, width: r * 2, height: r * 2, borderRadius: '50%', background: pos.color as string, boxShadow: `0 0 20px ${pos.color as string}` }} />
        );
      })}
      {/* Wheel center */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 80, height: 80, borderRadius: '50%', border: '3px solid rgba(240,171,252,0.6)', boxShadow: '0 0 25px rgba(240,171,252,0.4)' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 30, height: 30, borderRadius: '50%', background: 'radial-gradient(circle,#f0abfc,#7c3aed)', boxShadow: '0 0 15px rgba(240,171,252,0.8)' }} />
      </div>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,transparent,#f0abfc,#7c3aed,#f0abfc,transparent)', boxShadow: '0 0 20px rgba(240,171,252,0.8)' }} />
    </div>
  );
}

function CrazyTimeArt() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* Festive colored segments */}
      {['#4ade80','#f97316','#60a5fa','#f472b6','#facc15','#34d399'].map((color, i) => (
        <div key={i} style={{ position: 'absolute', top: '50%', left: '50%', width: 0, height: 0, transformOrigin: '0 0', transform: `rotate(${i * 60}deg)`, borderLeft: '60px solid transparent', borderRight: '60px solid transparent', borderBottom: `104px solid ${color}30`, marginTop: -60, marginLeft: -60 }} />
      ))}
      {/* Center hub */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 90, height: 90, borderRadius: '50%', border: '4px solid rgba(74,222,128,0.6)', boxShadow: '0 0 30px rgba(74,222,128,0.4)' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 36, height: 36, borderRadius: '50%', background: 'radial-gradient(circle,#4ade80,#22c55e)', boxShadow: '0 0 20px rgba(74,222,128,0.8)' }} />
      </div>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,transparent,#4ade80,#f97316,#4ade80,transparent)', boxShadow: '0 0 20px rgba(74,222,128,0.8)' }} />
    </div>
  );
}

const GAME_ARTS: Record<string, () => JSX.Element> = {
  'neon-palace': NeonPalaceArt,
  'dragons-fortune': DragonArt,
  'olympus-strikes': OlympusArt,
  'golden-vault': GoldenVaultArt,
  'cyber-roulette': CyberRouletteArt,
  'crystal-caverns': CrystalCavernsArt,
  'lucky-7s': Lucky7Art,
  'solar-wilds': SolarWildsArt,
  'blackjack-pro': BlackjackProArt,
  'mega-moolah': MegaMoolahArt,
  'starburst': StarburstArt,
  'gonzo-quest': GonzoQuestArt,
  'book-of-dead': BookOfDeadArt,
  'lightning-roulette': LightningRouletteArt,
  'dream-catcher': DreamCatcherArt,
  'crazy-time': CrazyTimeArt,
};

// ─────────────────────────────────────────────────────────────────────────────
// GAME SLIDER CARD
// ─────────────────────────────────────────────────────────────────────────────

function GameSliderCard({ game, isActive, onUnderConstruction }: { game: SliderGame; isActive: boolean; onUnderConstruction: (name: string) => void }) {
  const [hovered, setHovered] = useState(false);
  const router = useRouter();
  const ArtComponent = GAME_ARTS[game.id] ?? (() => <div />);
  const PLAYABLE_GAMES = new Set([
    'neon-palace', 'lucky-7s', 'blackjack-pro', 'cyber-roulette',
    'dragons-fortune', 'crystal-caverns', 'solar-wilds', 'starburst',
    'gonzo-quest', 'book-of-dead', 'golden-vault', 'olympus-strikes',
    'mega-moolah', 'lightning-roulette', 'crazy-time',
    'baccarat', 'dragon-fortune', 'fruit-frenzy', 'pharaohs-treasure', 'video-poker',
  ]);
  const handlePlay = () => {
    if (PLAYABLE_GAMES.has(game.id)) {
      router.push(`/games/${game.id}`);
    } else {
      onUnderConstruction(game.name);
    }
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        minWidth: 280,
        width: 280,
        height: 360,
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        background: game.bg,
        border: `1px solid ${isActive ? game.accentColor + '60' : 'rgba(255,255,255,0.07)'}`,
        transform: isActive ? 'scale(1.05)' : hovered ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isActive
          ? `0 0 40px ${game.accentColor}50, 0 20px 60px rgba(0,0,0,0.8)`
          : hovered
          ? `0 10px 40px rgba(0,0,0,0.7)`
          : `0 4px 20px rgba(0,0,0,0.5)`,
        transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        flexShrink: 0,
      }}
    >
      <div style={{ position: 'absolute', inset: 0 }}>
        <ArtComponent />
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%', background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 50%, transparent 100%)' }} />

      {hovered && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 20, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: 0, left: '-100%', width: '60%', height: '100%', background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)', animation: 'cardShine 0.7s ease forwards', transform: 'skewX(-15deg)' }} />
        </div>
      )}

      <div style={{
        position: 'absolute', top: 14, left: 14,
        padding: '4px 12px', borderRadius: 20,
        background: game.badge === 'LIVE' ? '#22c55e' : game.badge === 'HOT' ? '#ff2d78' : game.badge === 'NEW' ? '#7c3aed' : game.badge === 'MEGA' ? '#f97316' : 'rgba(244,196,48,0.9)',
        color: '#fff', fontSize: 11, fontWeight: 800, letterSpacing: '1px',
        boxShadow: `0 0 12px ${game.badgeColor}60`,
      }}>
        {game.badge}
      </div>

      <div style={{
        position: 'absolute', top: 14, right: 14,
        padding: '4px 10px', borderRadius: 20,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
        color: '#f4c430', fontSize: 11, fontWeight: 700,
        border: '1px solid rgba(244,196,48,0.3)',
      }}>
        RTP {game.rtp}
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 18px 18px' }}>
        <div style={{ fontSize: 11, color: game.accentColor, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 }}>
          {game.provider}
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 4, letterSpacing: '-0.3px' }}>
          {game.name}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 14 }}>
          {game.category}
        </div>

        <button onClick={handlePlay} style={{
          width: '100%', padding: '11px 0', borderRadius: 12,
          background: hovered ? `linear-gradient(135deg, ${game.accentColor}, ${game.accentColor}aa)` : 'rgba(255,255,255,0.08)',
          border: `1px solid ${hovered ? game.accentColor : 'rgba(255,255,255,0.15)'}`,
          color: hovered ? '#0a0010' : '#fff',
          fontSize: 13, fontWeight: 800, letterSpacing: '1.5px', cursor: 'pointer',
          fontFamily: "'Outfit', sans-serif",
          boxShadow: hovered ? `0 0 20px ${game.accentColor}60` : 'none',
          transition: 'all 0.25s',
        }}>
          PLAY NOW
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROMO CARD ART (CSS layers)
// ─────────────────────────────────────────────────────────────────────────────

function WelcomePromoArt() {
  return (
    <div style={{ position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%)', width: 160, height: 160, pointerEvents: 'none' }}>
      <div style={{ width: 100, height: 80, background: 'linear-gradient(135deg,rgba(244,196,48,0.3),rgba(244,196,48,0.1))', borderRadius: 12, border: '1px solid rgba(244,196,48,0.4)', margin: '0 auto', position: 'relative', boxShadow: '0 0 30px rgba(244,196,48,0.2)' }}>
        <div style={{ position: 'absolute', top: -12, left: 0, right: 0, height: 20, background: 'rgba(244,196,48,0.3)', borderRadius: 8, border: '1px solid rgba(244,196,48,0.4)', boxShadow: '0 0 15px rgba(244,196,48,0.3)' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 2, background: 'rgba(244,196,48,0.5)' }} />
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, background: 'rgba(244,196,48,0.3)', transform: 'translateY(-50%)' }} />
        <div style={{ position: 'absolute', top: -28, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4 }}>
          <div style={{ width: 20, height: 16, borderRadius: '50% 0 0 50%', border: '2px solid rgba(255,45,120,0.6)', background: 'transparent' }} />
          <div style={{ width: 20, height: 16, borderRadius: '0 50% 50% 0', border: '2px solid rgba(255,45,120,0.6)', background: 'transparent' }} />
        </div>
      </div>
      {[{top:0,left:10},{top:10,right:10},{bottom:10,left:5},{bottom:5,right:5}].map((pos,i)=>(
        <div key={i} style={{ position:'absolute', ...pos as React.CSSProperties, width:8, height:8, background:'rgba(244,196,48,0.7)', clipPath:'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)', boxShadow:'0 0 8px rgba(244,196,48,0.8)' }} />
      ))}
    </div>
  );
}

function ReloadPromoArt() {
  return (
    <div style={{ position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%)', width: 140, height: 140, pointerEvents: 'none' }}>
      <div style={{ width: 100, height: 100, margin: '0 auto', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '6px solid transparent', borderTopColor: 'rgba(0,212,200,0.7)', borderRightColor: 'rgba(0,212,200,0.4)', boxShadow: '0 0 20px rgba(0,212,200,0.3)' }} />
        <div style={{ position: 'absolute', inset: 12, borderRadius: '50%', border: '4px solid transparent', borderBottomColor: 'rgba(0,212,200,0.5)', borderLeftColor: 'rgba(0,212,200,0.3)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 30, height: 30, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,200,0.6), rgba(0,212,200,0.1))', boxShadow: '0 0 15px rgba(0,212,200,0.5)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 18, fontWeight: 900, color: '#00d4c8' }}>50%</div>
      </div>
    </div>
  );
}

function VIPPromoArt() {
  return (
    <div style={{ position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%)', width: 140, height: 140, pointerEvents: 'none' }}>
      <div style={{ width: 100, height: 70, margin: '20px auto 0', position: 'relative' }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 20, background: 'linear-gradient(135deg,rgba(244,196,48,0.4),rgba(244,196,48,0.2))', borderRadius: '0 0 8px 8px', border: '1px solid rgba(244,196,48,0.4)' }}>
          {[20,50,80].map((left,i)=>(
            <div key={i} style={{ position:'absolute', bottom:0, left:`${left}%`, transform:'translateX(-50%)', width:8, height:8, borderRadius:'50%', background:'rgba(244,196,48,0.8)', boxShadow:'0 0 8px rgba(244,196,48,0.8)' }} />
          ))}
        </div>
        <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ width: 0, height: 0, borderLeft: '16px solid transparent', borderRight: '16px solid transparent', borderBottom: '40px solid rgba(244,196,48,0.3)' }} />
          <div style={{ width: 0, height: 0, borderLeft: '16px solid transparent', borderRight: '16px solid transparent', borderBottom: '55px solid rgba(244,196,48,0.4)' }} />
          <div style={{ width: 0, height: 0, borderLeft: '16px solid transparent', borderRight: '16px solid transparent', borderBottom: '40px solid rgba(244,196,48,0.3)' }} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO BANNER
// ─────────────────────────────────────────────────────────────────────────────

function HeroSlide({ slide }: { slide: typeof HERO_SLIDES[0] }) {
  const router = useRouter();
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: slide.bg,
      display: 'flex', alignItems: 'center',
      padding: '0 64px',
      animation: 'heroSlide 0.6s cubic-bezier(0.25,0.46,0.45,0.94) both',
    }}>
      {/* Background grid */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize: '50px 50px', pointerEvents: 'none' }} />
      {/* Glow orb */}
      <div style={{ position: 'absolute', right: '10%', top: '50%', transform: 'translateY(-50%)', width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${slide.glowColor} 0%, transparent 70%)`, pointerEvents: 'none' }} />
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 600 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 16px', borderRadius: 20, background: `${slide.accentColor}18`, border: `1px solid ${slide.accentColor}35`, marginBottom: 20 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: slide.accentColor, boxShadow: `0 0 8px ${slide.accentColor}`, animation: 'dotBlink 1.5s infinite' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: slide.accentColor, letterSpacing: '2px' }}>FEATURED</span>
        </div>
        <h1 style={{
          fontSize: 'clamp(2.4rem,6vw,4rem)',
          fontWeight: 900, letterSpacing: '-1px', marginBottom: 12,
          background: `linear-gradient(135deg,${slide.accentColor} 0%,#fff 60%)`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          lineHeight: 1.1,
        }}>{slide.title}</h1>
        <p style={{ fontSize: 22, fontWeight: 800, color: '#f0e8ff', marginBottom: 8 }}>{slide.subtitle}</p>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', marginBottom: 32 }}>{slide.desc}</p>
        <button
          onClick={() => router.push(slide.ctaLink)}
          style={{
            padding: '15px 48px', borderRadius: 14,
            background: `linear-gradient(135deg,${slide.accentColor},${slide.accentColor}bb)`,
            color: '#0a0010', fontSize: 15, fontWeight: 900,
            border: 'none', cursor: 'pointer', letterSpacing: '1.5px',
            fontFamily: "'Outfit',sans-serif",
            boxShadow: `0 8px 40px ${slide.glowColor}`,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >{slide.cta}</button>
      </div>
    </div>
  );
}

function HeroBanner() {
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex(i => (i + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'relative',
      height: 340,
      borderRadius: 28,
      overflow: 'hidden',
      marginBottom: 0,
      border: '1px solid rgba(124,58,237,0.25)',
      boxShadow: '0 0 60px rgba(124,58,237,0.12)',
    }}>
      <HeroSlide key={slideIndex} slide={HERO_SLIDES[slideIndex]!} />

      {/* Dot navigation */}
      <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 10 }}>
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setSlideIndex(i)}
            style={{
              width: i === slideIndex ? 28 : 8, height: 8, borderRadius: 4,
              background: i === slideIndex ? '#f4c430' : 'rgba(255,255,255,0.3)',
              border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0,
              boxShadow: i === slideIndex ? '0 0 10px rgba(244,196,48,0.6)' : 'none',
            }}
          />
        ))}
      </div>

      {/* Slide arrows */}
      <button
        onClick={() => setSlideIndex(i => (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
        style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}
      >
        <div style={{ width: 8, height: 8, borderLeft: '2px solid #fff', borderBottom: '2px solid #fff', transform: 'rotate(45deg) translate(2px,-2px)' }} />
      </button>
      <button
        onClick={() => setSlideIndex(i => (i + 1) % HERO_SLIDES.length)}
        style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}
      >
        <div style={{ width: 8, height: 8, borderRight: '2px solid #fff', borderTop: '2px solid #fff', transform: 'rotate(45deg) translate(-2px,2px)' }} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LIVE CASINO CARD
// ─────────────────────────────────────────────────────────────────────────────

function LiveCasinoCard({ game, onComingSoon }: { game: typeof LIVE_CASINO_GAMES[0]; onComingSoon: (name: string) => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onComingSoon(game.name)}
      style={{
        flex: '1 1 220px',
        borderRadius: 18,
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        background: 'linear-gradient(160deg, #0d0020 0%, #1a0030 50%, #0a0018 100%)',
        border: `1px solid ${hovered ? game.color + '50' : 'rgba(124,58,237,0.2)'}`,
        boxShadow: hovered ? `0 0 30px ${game.color}30, 0 10px 40px rgba(0,0,0,0.7)` : '0 4px 20px rgba(0,0,0,0.5)',
        transition: 'all 0.3s ease',
        minHeight: 200,
        padding: 20,
      }}
    >
      {/* Dealer silhouette art */}
      <div style={{ position: 'relative', height: 100, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Dealer table */}
        <div style={{ position: 'absolute', bottom: 0, left: '10%', right: '10%', height: 30, background: `linear-gradient(135deg, ${game.color}20, ${game.color}08)`, borderRadius: '50% 50% 0 0', border: `1px solid ${game.color}30` }} />
        {/* Dealer body silhouette */}
        <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', width: 28, height: 50, background: `${game.color}25`, borderRadius: '40% 40% 0 0' }} />
        {/* Dealer head */}
        <div style={{ position: 'absolute', bottom: 68, left: '50%', transform: 'translateX(-50%)', width: 24, height: 24, borderRadius: '50%', background: `${game.color}30`, border: `1px solid ${game.color}40` }} />
        {/* Cards on table */}
        {[-20, 0, 20].map((x, i) => (
          <div key={i} style={{ position: 'absolute', bottom: 8, left: `calc(50% + ${x}px)`, width: 18, height: 26, borderRadius: 3, background: i === 1 ? `${game.color}40` : 'rgba(255,255,255,0.08)', border: `1px solid ${i === 1 ? game.color + '60' : 'rgba(255,255,255,0.12)'}`, transform: `rotate(${(i - 1) * 8}deg)` }} />
        ))}
        {/* Glow */}
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle, ${game.color}08 0%, transparent 70%)` }} />
      </div>

      {/* LIVE badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px rgba(34,197,94,0.9)', animation: 'liveDot 1.5s ease-in-out infinite' }} />
        <span style={{ fontSize: 10, fontWeight: 800, color: '#22c55e', letterSpacing: '1.5px' }}>LIVE</span>
        <span style={{ marginLeft: 'auto', fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{game.players} players</span>
      </div>

      <div style={{ fontSize: 16, fontWeight: 800, color: '#f0e8ff', marginBottom: 4 }}>{game.name}</div>
      <div style={{ fontSize: 11, color: game.color, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 14 }}>{game.provider}</div>

      <button style={{
        width: '100%', padding: '9px 0', borderRadius: 10,
        background: hovered ? `${game.color}25` : 'rgba(255,255,255,0.05)',
        border: `1px solid ${hovered ? game.color + '50' : 'rgba(255,255,255,0.1)'}`,
        color: hovered ? game.color : 'rgba(255,255,255,0.5)',
        fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: '1px',
        fontFamily: "'Outfit',sans-serif",
        transition: 'all 0.2s',
      }}>JOIN TABLE</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDERS STRIP
// ─────────────────────────────────────────────────────────────────────────────

function ProvidersStrip() {
  const [hoveredProvider, setHoveredProvider] = useState<string | null>(null);
  const doubled = [...PROVIDERS, ...PROVIDERS];

  return (
    <section style={{ marginBottom: 52, overflow: 'hidden' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#f0e8ff', letterSpacing: '-0.3px' }}>Game Providers</h2>
        <div style={{ fontSize: 13, color: '#6b5d8a', marginTop: 2 }}>World-class studios powering your experience</div>
      </div>
      <div style={{ overflow: 'hidden', position: 'relative' }}>
        {/* Fade edges */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(90deg, #0a0010, transparent)', zIndex: 2, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(-90deg, #0a0010, transparent)', zIndex: 2, pointerEvents: 'none' }} />
        <div style={{
          display: 'flex', gap: 14,
          animation: 'providerScroll 24s linear infinite',
          width: 'max-content',
        }}>
          {doubled.map((provider, i) => (
            <div
              key={i}
              onMouseEnter={() => setHoveredProvider(`${provider}-${i}`)}
              onMouseLeave={() => setHoveredProvider(null)}
              style={{
                padding: '10px 22px',
                borderRadius: 12,
                background: hoveredProvider === `${provider}-${i}` ? 'rgba(244,196,48,0.08)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${hoveredProvider === `${provider}-${i}` ? 'rgba(244,196,48,0.4)' : 'rgba(255,255,255,0.08)'}`,
                fontSize: 13, fontWeight: 700,
                color: hoveredProvider === `${provider}-${i}` ? '#f4c430' : '#6b5d8a',
                whiteSpace: 'nowrap' as const,
                cursor: 'pointer',
                transition: 'all 0.2s',
                flexShrink: 0,
                letterSpacing: '0.3px',
              }}
            >{provider}</div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function LobbyPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Jackpot state
  const [megaJP, setMegaJP] = useState(4287341);
  const [majorJP, setMajorJP] = useState(847205);
  const [minorJP, setMinorJP] = useState(45892);
  const [miniJP, setMiniJP] = useState(1247);
  const [jpFlash, setJpFlash] = useState(false);

  // Game slider state
  const [activeCategory, setActiveCategory] = useState('All');
  const [sliderIndex, setSliderIndex] = useState(0);
  const [sliderOffset, setSliderOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragDelta, setDragDelta] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Promo slider state
  const [promoIndex, setPromoIndex] = useState(0);

  // Nav state
  const [activeNav, setActiveNav] = useState('Lobby');
  const [balance, setBalance] = useState('10,000.00');
  const [username, setUsername] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  
  // Enhanced lobby state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('Popular');
  const [volatilityFilter, setVolatilityFilter] = useState('All');
  const [providerFilter, setProviderFilter] = useState('All');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Overlay state
  const [overlayGame, setOverlayGame] = useState<string | null>(null);

  const handleUnderConstruction = (name: string) => setOverlayGame(name);
  const handleComingSoon = (name: string) => setOverlayGame(name);

  const NAV_ITEMS = [
    { label: 'Lobby', href: '/' },
    { label: 'Promotions', href: '/promotions' },
    { label: 'Tournaments', href: '/tournaments' },
    { label: 'Leaderboard', href: '/leaderboard' },
    { label: 'VIP', href: '/vip' },
    { label: 'FAQ', href: '/faq' },
  ];

  useEffect(() => {
    setMounted(true);
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      Promise.all([userApi.getProfile(token), userApi.getWallet(token)])
        .then(([profile, wallet]) => {
          setUsername(profile.username);
          setBalance(parseFloat(wallet.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        })
        .catch(() => {});
    }

    const jpInterval = setInterval(() => {
      setMegaJP(v => v + Math.floor(Math.random() * 47 + 3));
      setMajorJP(v => v + Math.floor(Math.random() * 12 + 1));
      setMinorJP(v => v + Math.floor(Math.random() * 5));
      setMiniJP(v => v + Math.floor(Math.random() * 2));
      setJpFlash(true);
      setTimeout(() => setJpFlash(false), 300);
    }, 1800);

    const promoInterval = setInterval(() => setPromoIndex(i => (i + 1) % PROMO_CARDS.length), 5000);

    return () => {
      clearInterval(jpInterval);
      clearInterval(promoInterval);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = () => setShowProfileDropdown(false);
    if (showProfileDropdown) document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [showProfileDropdown]);

  const filteredGameIds = CATEGORY_MAP[activeCategory] ?? SLIDER_GAMES.map(g => g.id);
  let filteredGames = SLIDER_GAMES.filter(g => filteredGameIds.includes(g.id));
  
  // Apply search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredGames = filteredGames.filter(g => 
      g.name.toLowerCase().includes(query) || 
      g.provider.toLowerCase().includes(query) ||
      g.category.toLowerCase().includes(query)
    );
  }
  
  // Apply provider filter
  if (providerFilter !== 'All') {
    filteredGames = filteredGames.filter(g => g.provider === providerFilter);
  }
  
  // Apply sorting
  filteredGames = [...filteredGames].sort((a, b) => {
    switch (sortBy) {
      case 'Newest':
        return (a.badge === 'NEW' ? -1 : 1) - (b.badge === 'NEW' ? -1 : 1);
      case 'Highest RTP':
        return parseFloat(b.rtp) - parseFloat(a.rtp);
      case 'A-Z':
        return a.name.localeCompare(b.name);
      case 'Z-A':
        return b.name.localeCompare(a.name);
      default: // Popular
        return (a.badge === 'HOT' || a.badge === 'TOP' ? -1 : 1) - (b.badge === 'HOT' || b.badge === 'TOP' ? -1 : 1);
    }
  });
  const CARD_WIDTH = 280 + 20;
  const VISIBLE = 4;
  const maxIndex = Math.max(0, filteredGames.length - VISIBLE);

  const goToSlide = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(maxIndex, index));
    setSliderIndex(clamped);
    setSliderOffset(-clamped * CARD_WIDTH);
  }, [maxIndex, CARD_WIDTH]);

  useEffect(() => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      setSliderIndex(i => {
        const next = i >= maxIndex ? 0 : i + 1;
        setSliderOffset(-next * CARD_WIDTH);
        return next;
      });
    }, 4000);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [maxIndex, CARD_WIDTH, activeCategory]);

  useEffect(() => {
    setSliderIndex(0);
    setSliderOffset(0);
  }, [activeCategory]);

  const onDragStart = (clientX: number) => {
    setIsDragging(true);
    setDragStart(clientX);
    setDragDelta(0);
    if (autoRef.current) clearInterval(autoRef.current);
  };
  const onDragMove = (clientX: number) => {
    if (!isDragging) return;
    setDragDelta(clientX - dragStart);
  };
  const onDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const threshold = CARD_WIDTH / 3;
    if (dragDelta < -threshold) goToSlide(sliderIndex + 1);
    else if (dragDelta > threshold) goToSlide(sliderIndex - 1);
    else goToSlide(sliderIndex);
    setDragDelta(0);
  };

  const currentTranslate = sliderOffset + dragDelta;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0010', fontFamily: "'Outfit', sans-serif", overflowX: 'hidden', color: '#f0e8ff' }}>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <StarBackground />

      {/* ── UNDER CONSTRUCTION / COMING SOON OVERLAY ── */}
      {overlayGame && (
        <div
          onClick={() => setOverlayGame(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              padding: '52px 60px', borderRadius: 28,
              background: 'linear-gradient(135deg,#130020,#0d0018)',
              border: '1px solid rgba(124,58,237,0.4)',
              boxShadow: '0 0 80px rgba(124,58,237,0.2)',
              textAlign: 'center', maxWidth: 440,
              animation: 'scalePop 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
            }}
          >
            {/* Construction icon */}
            <div style={{ width: 72, height: 72, borderRadius: 20, background: 'linear-gradient(135deg,rgba(244,196,48,0.2),rgba(244,196,48,0.08))', border: '1px solid rgba(244,196,48,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <div style={{ width: 36, height: 36, position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 4, height: 36, background: 'linear-gradient(180deg,#f4c430,#d97706)', borderRadius: 2 }} />
                <div style={{ position: 'absolute', top: 12, left: 0, right: 0, height: 4, background: 'rgba(244,196,48,0.5)', borderRadius: 2 }} />
                <div style={{ position: 'absolute', top: 22, left: 0, right: 0, height: 4, background: 'rgba(244,196,48,0.3)', borderRadius: 2 }} />
              </div>
            </div>
            <h3 style={{ fontSize: 26, fontWeight: 900, color: '#f0e8ff', marginBottom: 8, letterSpacing: '-0.3px' }}>Coming Soon</h3>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#f4c430', marginBottom: 8 }}>{overlayGame}</p>
            <p style={{ fontSize: 14, color: '#7a7090', marginBottom: 32, lineHeight: 1.6 }}>We&apos;re working on bringing this game to you. Stay tuned for the launch!</p>
            <button
              onClick={() => setOverlayGame(null)}
              style={{
                padding: '12px 36px', borderRadius: 12,
                background: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
                color: '#fff', fontSize: 14, fontWeight: 800, border: 'none', cursor: 'pointer',
                fontFamily: "'Outfit',sans-serif", letterSpacing: '1px',
                boxShadow: '0 8px 30px rgba(124,58,237,0.4)',
              }}
            >GOT IT</button>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* NAVBAR */}
      {/* ──────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: 'rgba(10,0,16,0.92)', backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(124,58,237,0.25)',
        boxShadow: '0 4px 40px rgba(0,0,0,0.5)',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 28px', display: 'flex', alignItems: 'center', height: 72, gap: 28 }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, marginRight: 8, cursor: 'pointer' }} onClick={() => router.push('/')}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#f4c430)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(244,196,48,0.4)' }}>
              <div style={{ width: 18, height: 20, position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: '#fff', borderRadius: 2 }} />
                <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 3, background: '#fff', borderRadius: 2 }} />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#fff', borderRadius: 2, transformOrigin: 'top left', transform: 'rotate(35deg) scaleX(1.2)' }} />
              </div>
            </div>
            <span style={{
              fontSize: 20, fontWeight: 900, letterSpacing: '2.5px',
              background: 'linear-gradient(135deg,#f4c430 0%,#ffdd00 30%,#f4c430 60%,#d97706 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              animation: 'shimmer 4s linear infinite',
            }}>
              NEON PALACE
            </span>
          </div>

          {/* Desktop Nav links */}
          <div style={{ display: 'flex', gap: 2, flex: 1 }} className="desktop-nav">
            {NAV_ITEMS.map(item => (
              <button key={item.label} onClick={() => { setActiveNav(item.label); router.push(item.href); }} style={{
                padding: '7px 18px', borderRadius: 10,
                background: activeNav === item.label ? 'rgba(244,196,48,0.1)' : 'transparent',
                border: 'none',
                color: activeNav === item.label ? '#f4c430' : '#9b8ab8',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.5px',
                borderBottom: activeNav === item.label ? '2px solid #f4c430' : '2px solid transparent',
                transition: 'all 0.2s',
                fontFamily: "'Outfit', sans-serif",
              }}
                onMouseEnter={e => { if (activeNav !== item.label) { e.currentTarget.style.color = '#f0e8ff'; } }}
                onMouseLeave={e => { if (activeNav !== item.label) { e.currentTarget.style.color = '#9b8ab8'; } }}
              >{item.label}</button>
            ))}
          </div>

          {/* Right section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>

            {/* Search toggle */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowSearch(s => !s)}
                style={{ width: 38, height: 38, borderRadius: 10, background: showSearch ? 'rgba(244,196,48,0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${showSearch ? 'rgba(244,196,48,0.3)' : 'rgba(255,255,255,0.08)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              >
                {/* Magnifier icon */}
                <div style={{ position: 'relative', width: 16, height: 16 }}>
                  <div style={{ width: 11, height: 11, borderRadius: '50%', border: `2px solid ${showSearch ? '#f4c430' : '#9b8ab8'}`, position: 'absolute', top: 0, left: 0 }} />
                  <div style={{ width: 6, height: 2, background: showSearch ? '#f4c430' : '#9b8ab8', borderRadius: 1, position: 'absolute', bottom: 0, right: 0, transform: 'rotate(-45deg)', transformOrigin: 'left center' }} />
                </div>
              </button>
              {showSearch && (
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search games..."
                  style={{
                    position: 'absolute', right: 0, top: '110%',
                    width: 220, padding: '10px 16px', borderRadius: 12,
                    background: '#130020', border: '1px solid rgba(124,58,237,0.4)',
                    color: '#f0e8ff', fontSize: 13, fontFamily: "'Outfit',sans-serif",
                    outline: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                    animation: 'slideUp 0.15s ease both',
                    zIndex: 300,
                  }}
                />
              )}
            </div>

            {/* Notification bell */}
            <button style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: 16, height: 14, borderRadius: '8px 8px 0 0', background: '#9b8ab8', position: 'relative' }}>
                  <div style={{ position: 'absolute', bottom: -3, left: -3, right: -3, height: 4, background: '#9b8ab8', borderRadius: '0 0 2px 2px' }} />
                  <div style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', width: 6, height: 3, borderRadius: '0 0 3px 3px', background: '#9b8ab8' }} />
                </div>
                <div style={{ position: 'absolute', top: -3, right: -3, width: 8, height: 8, borderRadius: '50%', background: '#ff2d78', border: '1px solid #0a0010' }} />
              </div>
            </button>

            {/* Balance (only if logged in) */}
            {username && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '7px 14px', borderRadius: 12,
                background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(244,196,48,0.2)',
              }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'linear-gradient(135deg,#f4c430,#d97706)', flexShrink: 0, boxShadow: '0 0 10px rgba(244,196,48,0.4)' }} />
                <div>
                  <div style={{ fontSize: 10, color: '#6b5d8a', fontWeight: 600, letterSpacing: '1px' }}>BALANCE</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#f4c430', fontFamily: 'monospace' }}>${balance}</div>
                </div>
              </div>
            )}

            {username ? (
              /* Profile dropdown when logged in */
              <div style={{ position: 'relative' }}>
                <div
                  onClick={e => { e.stopPropagation(); setShowProfileDropdown(p => !p); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '7px 14px', borderRadius: 12,
                    background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#7c3aed,#f4c430)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800, color: '#fff',
                  }}>{username[0]?.toUpperCase()}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#f0e8ff' }}>{username}</div>
                    <div style={{ fontSize: 10, color: '#f4c430', fontWeight: 600 }}>GOLD VIP</div>
                  </div>
                  <div style={{ width: 12, height: 12, borderRight: '2px solid #6b5d8a', borderBottom: '2px solid #6b5d8a', transform: showProfileDropdown ? 'rotate(-135deg)' : 'rotate(45deg)', transition: 'transform 0.2s', marginTop: showProfileDropdown ? 4 : -2 }} />
                </div>

                {showProfileDropdown && (
                  <div
                    onClick={e => e.stopPropagation()}
                    style={{
                      position: 'absolute', right: 0, top: '110%',
                      background: '#130020', border: '1px solid rgba(124,58,237,0.3)',
                      borderRadius: 14, padding: '8px 0', minWidth: 180,
                      boxShadow: '0 16px 50px rgba(0,0,0,0.6)',
                      animation: 'slideUp 0.15s ease both', zIndex: 300,
                    }}
                  >
                    {[
                      { label: 'Dashboard', href: '/dashboard' },
                      { label: 'Profile', href: '/profile' },
                      { label: 'Wallet', href: '/wallet' },
                      { label: 'VIP Status', href: '/vip' },
                      { label: 'Notifications', href: '/notifications' },
                      { label: 'Settings', href: '/settings' },
                    ].map(item => (
                      <div
                        key={item.label}
                        onClick={() => { router.push(item.href); setShowProfileDropdown(false); }}
                        style={{ padding: '10px 18px', fontSize: 13, fontWeight: 600, color: '#9b8ab8', cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#f4c430'; e.currentTarget.style.background = 'rgba(244,196,48,0.06)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#9b8ab8'; e.currentTarget.style.background = 'transparent'; }}
                      >{item.label}</div>
                    ))}
                    <div style={{ height: 1, background: 'rgba(124,58,237,0.2)', margin: '6px 0' }} />
                    <div
                      onClick={() => { sessionStorage.removeItem('accessToken'); window.location.reload(); }}
                      style={{ padding: '10px 18px', fontSize: 13, fontWeight: 600, color: '#ff2d78', cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,45,120,0.06)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >Sign Out</div>
                  </div>
                )}
              </div>
            ) : (
              /* Login / Register when not logged in */
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => router.push('/login')}
                  style={{
                    padding: '9px 20px', borderRadius: 10,
                    background: 'transparent',
                    border: '1px solid rgba(244,196,48,0.35)',
                    color: '#f4c430', fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', letterSpacing: '0.5px',
                    fontFamily: "'Outfit',sans-serif",
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,196,48,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >LOGIN</button>
                <button
                  onClick={() => router.push('/register')}
                  style={{
                    padding: '9px 20px', borderRadius: 10,
                    background: 'linear-gradient(135deg,#f4c430,#d97706)',
                    color: '#0a0010', fontSize: 13, fontWeight: 900,
                    border: 'none', cursor: 'pointer', letterSpacing: '0.5px',
                    fontFamily: "'Outfit',sans-serif",
                    boxShadow: '0 4px 20px rgba(244,196,48,0.35)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                >REGISTER</button>
              </div>
            )}

            {/* Deposit CTA (always show) */}
            <button style={{
              padding: '10px 22px', borderRadius: 12,
              background: 'linear-gradient(135deg,#f4c430,#d97706)',
              color: '#0a0010', fontSize: 13, fontWeight: 900,
              border: 'none', cursor: 'pointer', letterSpacing: '1px',
              fontFamily: "'Outfit', sans-serif",
              boxShadow: '0 4px 20px rgba(244,196,48,0.35)',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(244,196,48,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(244,196,48,0.35)'; }}
            >DEPOSIT</button>

            {/* Hamburger button (mobile) */}
            <button
              onClick={() => setShowMobileMenu(m => !m)}
              style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5 }}
            >
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 18, height: 2, borderRadius: 1, background: '#9b8ab8', transition: 'all 0.2s' }} />
              ))}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div style={{
            background: 'rgba(10,0,16,0.98)', borderTop: '1px solid rgba(124,58,237,0.2)',
            padding: '16px 28px 20px',
            animation: 'slideUp 0.2s ease both',
          }}>
            {NAV_ITEMS.map(item => (
              <button key={item.label} onClick={() => { router.push(item.href); setShowMobileMenu(false); }} style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '12px 0', borderRadius: 0,
                background: 'transparent', border: 'none', borderBottom: '1px solid rgba(124,58,237,0.1)',
                color: '#9b8ab8', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                fontFamily: "'Outfit',sans-serif",
              }}>{item.label}</button>
            ))}
          </div>
        )}
      </nav>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* MAIN CONTENT */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 28px', position: 'relative', zIndex: 1 }}>

        {/* ── HERO BANNER ── */}
        <div style={{ margin: '32px 0 24px', animation: mounted ? 'slideUp 0.6s ease both' : 'none' }}>
          <HeroBanner />
        </div>

        {/* ── JACKPOT TICKER ── */}
        <section style={{
          margin: '0 0 48px',
          padding: '40px 64px 36px',
          borderRadius: 28,
          background: 'linear-gradient(135deg, #160825 0%, #220a40 30%, #1a0535 60%, #0d0020 100%)',
          border: '1px solid rgba(124,58,237,0.2)',
          boxShadow: '0 0 80px rgba(124,58,237,0.08), inset 0 1px 0 rgba(255,255,255,0.04)',
          position: 'relative', overflow: 'hidden',
          animation: mounted ? 'slideUp 0.7s ease both' : 'none',
        }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(244,196,48,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(244,196,48,0.03) 1px,transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: -80, right: '10%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle,rgba(244,196,48,0.1) 0%,transparent 70%)', animation: 'floatOrb 7s ease-in-out infinite', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -60, left: '5%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.12) 0%,transparent 70%)', animation: 'floatOrb 9s ease-in-out 3s infinite', pointerEvents: 'none' }} />

          {[{t:'10%',l:'8%'},{t:'70%',l:'4%'},{t:'20%',r:'5%'},{t:'80%',r:'8%'},{t:'45%',l:'50%'}].map((pos,i)=>(
            <div key={i} style={{ position:'absolute', ...pos as React.CSSProperties, width:6, height:6, background:'rgba(244,196,48,0.6)', clipPath:'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)', boxShadow:'0 0 10px rgba(244,196,48,0.6)', animation:`twinkle ${2+i*0.5}s ease-in-out ${i*0.4}s infinite`, pointerEvents:'none' }} />
          ))}

          <div style={{ position: 'relative', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 20, background: 'rgba(244,196,48,0.1)', border: '1px solid rgba(244,196,48,0.25)', marginBottom: 28 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f4c430', boxShadow: '0 0 8px rgba(244,196,48,0.8)', animation: 'dotBlink 2s infinite' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#f4c430', letterSpacing: '2px' }}>PROGRESSIVE JACKPOT — LIVE</span>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#9b8ab8', letterSpacing: '3px', marginBottom: 8 }}>MEGA JACKPOT</div>
              <div style={{
                fontSize: 'clamp(3rem,7vw,5.5rem)',
                fontWeight: 900, letterSpacing: '-2px',
                background: 'linear-gradient(135deg,#fcd34d 0%,#f4c430 30%,#ffdd00 60%,#f4c430 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                animation: `shimmer 3s linear infinite${jpFlash ? ', jackpotFlash 0.3s ease' : ''}`,
                transition: 'all 0.15s',
              }}>
                ${megaJP.toLocaleString('en-US')}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginBottom: 36, flexWrap: 'wrap' }}>
              {[
                { label: 'MAJOR', value: majorJP, color: '#a855f7' },
                { label: 'MINOR', value: minorJP, color: '#00d4c8' },
                { label: 'MINI', value: miniJP, color: '#22c55e' },
              ].map(jp => (
                <div key={jp.label} style={{
                  padding: '10px 24px', borderRadius: 14,
                  background: 'rgba(0,0,0,0.3)', border: `1px solid ${jp.color}30`,
                  textAlign: 'center', backdropFilter: 'blur(8px)',
                }}>
                  <div style={{ fontSize: 10, color: '#6b5d8a', fontWeight: 700, letterSpacing: '2px', marginBottom: 4 }}>{jp.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: jp.color, animation: jpFlash ? 'jackpotNum 0.15s ease' : 'none' }}>
                    ${jp.value.toLocaleString('en-US')}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button style={{
                padding: '16px 52px', borderRadius: 16,
                background: 'linear-gradient(135deg,#f4c430,#d97706)',
                color: '#0a0010', fontSize: 16, fontWeight: 900,
                border: 'none', cursor: 'pointer', letterSpacing: '2px',
                fontFamily: "'Outfit', sans-serif",
                boxShadow: '0 8px 40px rgba(244,196,48,0.4)',
                animation: 'spinGlow 3s ease-in-out infinite',
                transition: 'transform 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.07)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                onClick={() => router.push('/games/neon-palace')}
              >PLAY NOW</button>
              <button style={{
                padding: '16px 52px', borderRadius: 16,
                background: 'transparent',
                color: '#f0e8ff', fontSize: 16, fontWeight: 700,
                border: '2px solid rgba(255,255,255,0.15)', cursor: 'pointer', letterSpacing: '2px',
                fontFamily: "'Outfit', sans-serif",
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(244,196,48,0.5)'; e.currentTarget.style.color = '#f4c430'; e.currentTarget.style.background = 'rgba(244,196,48,0.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#f0e8ff'; e.currentTarget.style.background = 'transparent'; }}
              >HOW TO PLAY</button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 56, marginTop: 44, paddingTop: 36, borderTop: '1px solid rgba(124,58,237,0.2)', flexWrap: 'wrap' }}>
              {[
                { label: 'PLAYERS ONLINE', value: '2,847', dotColor: '#22c55e' },
                { label: 'GAMES AVAILABLE', value: '500+', dotColor: '#f4c430' },
                { label: 'WINNERS TODAY', value: '14,293', dotColor: '#00d4c8' },
                { label: 'TOTAL PAID OUT', value: '$2.8B', dotColor: '#a855f7' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.dotColor, boxShadow: `0 0 8px ${s.dotColor}` }} />
                    <span style={{ fontSize: 10, color: '#6b5d8a', letterSpacing: '1.5px', fontWeight: 600 }}>{s.label}</span>
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: '#f0e8ff', fontFamily: "'Outfit',sans-serif" }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WINNER FEED ── */}
        <div style={{
          margin: '0 0 44px',
          borderRadius: 14,
          background: 'rgba(22,8,37,0.7)',
          border: '1px solid rgba(124,58,237,0.2)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'stretch',
        }}>
          <div style={{
            padding: '12px 20px', background: 'linear-gradient(135deg,rgba(244,196,48,0.15),rgba(244,196,48,0.08))',
            borderRight: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
              <div style={{ width: 18, height: 14, background: 'linear-gradient(135deg,#f4c430,#d97706)', borderRadius: '4px 4px 0 0', position: 'relative' }}>
                <div style={{ position: 'absolute', bottom: -3, left: -4, right: -4, height: 4, background: '#f4c430', borderRadius: '0 0 2px 2px' }} />
              </div>
              <div style={{ width: 6, height: 6, background: '#f4c430', marginTop: 2 }} />
              <div style={{ width: 14, height: 3, background: '#f4c430', borderRadius: 2 }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#f4c430', letterSpacing: '1.5px', marginLeft: 8 }}>WINNERS</span>
          </div>
          <div style={{ overflow: 'hidden', flex: 1, padding: '0 4px' }}>
            <div style={{ display: 'flex', gap: 40, animation: 'winnerScroll 28s linear infinite', width: 'max-content', alignItems: 'center', height: 46 }}>
              {[...WINNERS, ...WINNERS].map((w, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: w.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                    {w.initials}
                  </div>
                  <span style={{ fontSize: 13, color: '#9b8ab8', whiteSpace: 'nowrap' }}>
                    <span style={{ color: '#f0e8ff', fontWeight: 700 }}>{w.username}</span>
                    {' won '}
                    <span style={{ color: '#f4c430', fontWeight: 800 }}>{w.amount}</span>
                    <span style={{ color: '#6b5d8a' }}> on {w.game}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── PROMOTIONS SLIDER ── */}
        <section style={{ marginBottom: 52, animation: mounted ? 'slideUp 0.7s ease 0.1s both' : 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#f0e8ff', letterSpacing: '-0.3px' }}>Hot Promotions</h2>
              <div style={{ fontSize: 13, color: '#6b5d8a', marginTop: 2 }}>Exclusive offers for new and returning players</div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {PROMO_CARDS.map((_, i) => (
                <button key={i} onClick={() => setPromoIndex(i)} style={{
                  width: i === promoIndex ? 28 : 8, height: 8, borderRadius: 4,
                  background: i === promoIndex ? '#f4c430' : 'rgba(124,58,237,0.4)',
                  border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0,
                }} />
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', overflow: 'hidden', borderRadius: 24 }}>
            {PROMO_CARDS.map((promo, i) => i === promoIndex && (
              <div key={promo.id} style={{
                padding: '48px 48px',
                background: promo.bg,
                border: `1px solid ${promo.border}`,
                borderRadius: 24,
                position: 'relative', overflow: 'hidden',
                animation: 'promoFade 0.45s ease both',
                minHeight: 180,
              }}>
                {promo.id === 'welcome' && <WelcomePromoArt />}
                {promo.id === 'reload' && <ReloadPromoArt />}
                {promo.id === 'vip-cashback' && <VIPPromoArt />}
                <div style={{ position: 'absolute', top: -60, left: -60, width: 250, height: 250, borderRadius: '50%', background: `radial-gradient(circle,${promo.accent}12 0%,transparent 70%)`, pointerEvents: 'none' }} />

                <div style={{ position: 'relative', maxWidth: '60%' }}>
                  <div style={{
                    display: 'inline-block', padding: '4px 14px', borderRadius: 20, marginBottom: 14,
                    background: `${promo.accent}18`, color: promo.accent,
                    fontSize: 11, fontWeight: 800, letterSpacing: '1.5px',
                    border: `1px solid ${promo.accent}30`,
                  }}>{promo.tag}</div>
                  <h3 style={{
                    fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', fontWeight: 900, marginBottom: 6,
                    background: `linear-gradient(135deg,${promo.accent},#f0e8ff)`,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.5px',
                  }}>{promo.title}</h3>
                  <p style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{promo.subtitle}</p>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 28 }}>{promo.detail}</p>
                  <button style={{
                    padding: '13px 36px', borderRadius: 12,
                    background: `linear-gradient(135deg,${promo.accent},${promo.accent}bb)`,
                    color: '#0a0010', fontSize: 14, fontWeight: 900,
                    border: 'none', cursor: 'pointer', letterSpacing: '1.5px',
                    fontFamily: "'Outfit',sans-serif",
                    boxShadow: `0 8px 30px ${promo.accent}40`,
                    transition: 'transform 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                    onClick={() => {
                      if (promo.id === 'welcome') router.push('/promotions');
                      else if (promo.id === 'reload') router.push('/promotions');
                      else if (promo.id === 'vip-cashback') router.push('/vip');
                    }}
                  >{promo.cta}</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
            <button onClick={() => setPromoIndex(i => Math.max(0, i - 1))} style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#9b8ab8', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,196,48,0.1)'; e.currentTarget.style.borderColor = 'rgba(244,196,48,0.3)'; e.currentTarget.style.color = '#f4c430'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#9b8ab8'; }}
            >
              <div style={{ width: 8, height: 8, borderLeft: '2px solid currentColor', borderBottom: '2px solid currentColor', transform: 'rotate(45deg) translate(2px,-2px)' }} />
            </button>
            <button onClick={() => setPromoIndex(i => (i + 1) % PROMO_CARDS.length)} style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#9b8ab8', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,196,48,0.1)'; e.currentTarget.style.borderColor = 'rgba(244,196,48,0.3)'; e.currentTarget.style.color = '#f4c430'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#9b8ab8'; }}
            >
              <div style={{ width: 8, height: 8, borderRight: '2px solid currentColor', borderTop: '2px solid currentColor', transform: 'rotate(45deg) translate(-2px,2px)' }} />
            </button>
          </div>
        </section>

        {/* ── FEATURED GAMES SLIDER ── */}
        <section id="all-games" style={{ marginBottom: 52, animation: mounted ? 'slideUp 0.7s ease 0.15s both' : 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22, flexWrap: 'wrap', gap: 14 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#f0e8ff', letterSpacing: '-0.3px' }}>Featured Games</h2>
              <div style={{ fontSize: 13, color: '#6b5d8a', marginTop: 2 }}>The best games handpicked for you</div>
            </div>
            <a href="#all-games" style={{ fontSize: 13, color: '#f4c430', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, alignSelf: 'center' }}>
              View All
              <div style={{ width: 8, height: 8, borderRight: '2px solid #f4c430', borderTop: '2px solid #f4c430', transform: 'rotate(45deg) translate(-1px,1px)' }} />
            </a>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
            {CATEGORIES_LIST.map(cat => {
              const active = activeCategory === cat;
              return (
                <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                  padding: '8px 20px', borderRadius: 10,
                  background: active ? 'rgba(244,196,48,0.08)' : 'rgba(255,255,255,0.04)',
                  border: 'none',
                  borderBottom: active ? '2px solid #f4c430' : '2px solid transparent',
                  color: active ? '#f4c430' : '#9b8ab8',
                  fontSize: 13, fontWeight: active ? 700 : 500, cursor: 'pointer',
                  fontFamily: "'Outfit',sans-serif",
                  letterSpacing: '0.3px',
                  boxShadow: active ? '0 0 20px rgba(244,196,48,0.1)' : 'none',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.color = '#f0e8ff'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.color = '#9b8ab8'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; } }}
                >{cat}</button>
              );
            })}
          </div>

          {/* Enhanced Filter Bar */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: 24, 
            padding: '12px 16px',
            borderRadius: 14,
            background: 'rgba(124,58,237,0.06)',
            border: '1px solid rgba(124,58,237,0.15)',
            flexWrap: 'wrap',
            gap: 12,
          }}>
            {/* Sort dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#6b5d8a', fontWeight: 600, letterSpacing: '0.5px' }}>SORT:</span>
              <select 
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  background: '#130020',
                  border: '1px solid rgba(124,58,237,0.3)',
                  color: '#f0e8ff',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Outfit',sans-serif",
                }}
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Provider filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#6b5d8a', fontWeight: 600, letterSpacing: '0.5px' }}>PROVIDER:</span>
              <select 
                value={providerFilter}
                onChange={e => setProviderFilter(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  background: '#130020',
                  border: '1px solid rgba(124,58,237,0.3)',
                  color: '#f0e8ff',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Outfit',sans-serif",
                }}
              >
                <option value="All">All Providers</option>
                {PROVIDERS.map(provider => (
                  <option key={provider} value={provider}>{provider}</option>
                ))}
              </select>
            </div>

            {/* View mode toggle */}
            <div style={{ display: 'flex', gap: 4, borderRadius: 8, background: 'rgba(0,0,0,0.3)', padding: 3 }}>
              <button 
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  background: viewMode === 'grid' ? 'rgba(244,196,48,0.2)' : 'transparent',
                  border: 'none',
                  color: viewMode === 'grid' ? '#f4c430' : '#6b5d8a',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Grid icon */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, width: 16, height: 16 }}>
                  {[0,1,2,3].map(i => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: 1, background: 'currentColor' }} />
                  ))}
                </div>
              </button>
              <button 
                onClick={() => setViewMode('list')}
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  background: viewMode === 'list' ? 'rgba(244,196,48,0.2)' : 'transparent',
                  border: 'none',
                  color: viewMode === 'list' ? '#f4c430' : '#6b5d8a',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* List icon */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: 16, height: 16, justifyContent: 'center' }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width: 16, height: 3, borderRadius: 1, background: 'currentColor' }} />
                  ))}
                </div>
              </button>
            </div>

            {/* Results count */}
            <div style={{ marginLeft: 'auto', fontSize: 12, color: '#6b5d8a', fontWeight: 600 }}>
              {filteredGames.length} games
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            {/* Left arrow */}
            <button
              onClick={() => goToSlide(sliderIndex - 1)}
              disabled={sliderIndex === 0}
              style={{
                position: 'absolute', left: -20, top: '50%', transform: 'translateY(-50%)',
                zIndex: 10, width: 44, height: 44, borderRadius: '50%',
                background: sliderIndex === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(22,8,37,0.95)',
                border: `1px solid ${sliderIndex === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(244,196,48,0.3)'}`,
                color: sliderIndex === 0 ? '#3d1f6e' : '#f4c430',
                cursor: sliderIndex === 0 ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: sliderIndex === 0 ? 'none' : '0 0 20px rgba(244,196,48,0.2)',
                transition: 'all 0.2s',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div style={{ width: 10, height: 10, borderLeft: '2.5px solid currentColor', borderBottom: '2.5px solid currentColor', transform: 'rotate(45deg) translate(2px,-2px)' }} />
            </button>

            {/* Right arrow */}
            <button
              onClick={() => goToSlide(sliderIndex + 1)}
              disabled={sliderIndex >= maxIndex}
              style={{
                position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)',
                zIndex: 10, width: 44, height: 44, borderRadius: '50%',
                background: sliderIndex >= maxIndex ? 'rgba(255,255,255,0.03)' : 'rgba(22,8,37,0.95)',
                border: `1px solid ${sliderIndex >= maxIndex ? 'rgba(255,255,255,0.05)' : 'rgba(244,196,48,0.3)'}`,
                color: sliderIndex >= maxIndex ? '#3d1f6e' : '#f4c430',
                cursor: sliderIndex >= maxIndex ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: sliderIndex >= maxIndex ? 'none' : '0 0 20px rgba(244,196,48,0.2)',
                transition: 'all 0.2s',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div style={{ width: 10, height: 10, borderRight: '2.5px solid currentColor', borderTop: '2.5px solid currentColor', transform: 'rotate(45deg) translate(-2px,2px)' }} />
            </button>

            {/* Slider viewport */}
            <div style={{ overflow: 'hidden', borderRadius: 16, padding: '20px 0', margin: '0 -10px' }}
              ref={sliderRef}
              onMouseDown={e => onDragStart(e.clientX)}
              onMouseMove={e => onDragMove(e.clientX)}
              onMouseUp={onDragEnd}
              onMouseLeave={() => { if (isDragging) onDragEnd(); }}
              onTouchStart={e => onDragStart(e.touches[0]!.clientX)}
              onTouchMove={e => onDragMove(e.touches[0]!.clientX)}
              onTouchEnd={onDragEnd}
            >
              <div style={{
                display: 'flex', gap: 20, padding: '0 10px',
                transform: `translateX(${currentTranslate}px)`,
                transition: isDragging ? 'none' : 'transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94)',
                cursor: isDragging ? 'grabbing' : 'grab',
                userSelect: 'none',
              }}>
                {filteredGames.map((game, i) => (
                  <GameSliderCard key={game.id} game={game} isActive={i === sliderIndex} onUnderConstruction={handleUnderConstruction} />
                ))}
              </div>
            </div>

            {/* Dot indicators */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20 }}>
              {Array.from({ length: maxIndex + 1 }, (_, i) => (
                <button key={i} onClick={() => goToSlide(i)} style={{
                  width: i === sliderIndex ? 24 : 8, height: 8, borderRadius: 4, border: 'none',
                  background: i === sliderIndex ? '#f4c430' : 'rgba(124,58,237,0.35)',
                  cursor: 'pointer', transition: 'all 0.3s', padding: 0,
                  boxShadow: i === sliderIndex ? '0 0 10px rgba(244,196,48,0.5)' : 'none',
                }} />
              ))}
            </div>
          </div>
        </section>

        {/* ── LIVE CASINO SECTION ── */}
        <section style={{ marginBottom: 52, animation: mounted ? 'slideUp 0.7s ease 0.18s both' : 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: '#f0e8ff', letterSpacing: '-0.3px' }}>Live Casino</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 12px', borderRadius: 20, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px rgba(34,197,94,0.9)', animation: 'liveDot 1.5s ease-in-out infinite' }} />
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#22c55e', letterSpacing: '1.5px' }}>LIVE</span>
                </div>
              </div>
              <div style={{ fontSize: 13, color: '#6b5d8a' }}>Real dealers, real action — streaming now</div>
            </div>
            <a href="#all-games" style={{ fontSize: 13, color: '#f4c430', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              All Live Games
              <div style={{ width: 8, height: 8, borderRight: '2px solid #f4c430', borderTop: '2px solid #f4c430', transform: 'rotate(45deg) translate(-1px,1px)' }} />
            </a>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {LIVE_CASINO_GAMES.map(game => (
              <LiveCasinoCard key={game.id} game={game} onComingSoon={handleComingSoon} />
            ))}
          </div>
        </section>

        {/* ── CATEGORIES GRID ── */}
        <section style={{ marginBottom: 52, animation: mounted ? 'slideUp 0.7s ease 0.2s both' : 'none' }}>
          <div style={{ marginBottom: 22 }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#f0e8ff', letterSpacing: '-0.3px' }}>Game Categories</h2>
            <div style={{ fontSize: 13, color: '#6b5d8a', marginTop: 2 }}>Find your perfect game type</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { name: 'Slots', count: '350+ Games', bg: 'linear-gradient(135deg,#2d0060,#1a0040)', accent: '#f4c430', art: 'slots' },
              { name: 'Table Games', count: '80+ Games', bg: 'linear-gradient(135deg,#003d3d,#001a1a)', accent: '#00d4c8', art: 'table' },
              { name: 'Live Casino', count: '60+ Tables', bg: 'linear-gradient(135deg,#1a0040,#0d0020)', accent: '#ff2d78', art: 'live' },
              { name: 'Jackpots', count: '40+ Games', bg: 'linear-gradient(135deg,#3d2000,#1a0d00)', accent: '#f4c430', art: 'jackpot' },
              { name: 'Crash Games', count: '15+ Games', bg: 'linear-gradient(135deg,#2d0020,#1a0010)', accent: '#ff2d78', art: 'crash' },
              { name: 'Virtual Sports', count: '25+ Games', bg: 'linear-gradient(135deg,#001a40,#000d26)', accent: '#7c3aed', art: 'sports' },
            ].map((cat, i) => (
              <div key={i} style={{
                padding: '28px 24px',
                borderRadius: 20,
                background: cat.bg,
                border: `1px solid ${cat.accent}18`,
                cursor: 'pointer',
                position: 'relative', overflow: 'hidden',
                transition: 'all 0.25s',
                minHeight: 120,
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 20px 50px rgba(0,0,0,0.5), 0 0 30px ${cat.accent}20`; (e.currentTarget as HTMLDivElement).style.borderColor = `${cat.accent}35`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; (e.currentTarget as HTMLDivElement).style.borderColor = `${cat.accent}18`; }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${cat.accent}15`, border: `1px solid ${cat.accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, boxShadow: `0 0 15px ${cat.accent}20` }}>
                  {cat.art === 'slots' && (
                    <div style={{ display: 'flex', gap: 3 }}>
                      {[0,1,2].map(j=><div key={j} style={{width:6,height:18,borderRadius:2,background:j===1?cat.accent:`${cat.accent}50`}} />)}
                    </div>
                  )}
                  {cat.art === 'table' && (
                    <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${cat.accent}`, position: 'relative' }}>
                      <div style={{ position:'absolute', top:'50%',left:'50%',width:8,height:8,borderRadius:'50%',background:cat.accent,transform:'translate(-50%,-50%)',boxShadow:`0 0 8px ${cat.accent}` }} />
                    </div>
                  )}
                  {cat.art === 'live' && (
                    <div style={{ display:'flex', alignItems:'center', gap: 3 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff2d78', boxShadow: '0 0 8px #ff2d78', animation: 'dotBlink 1.5s infinite' }} />
                      <div style={{ fontSize: 10, fontWeight: 800, color: '#ff2d78' }}>LIVE</div>
                    </div>
                  )}
                  {cat.art === 'jackpot' && (
                    <div style={{ fontSize: 20, fontWeight: 900, color: cat.accent, lineHeight: 1 }}>$</div>
                  )}
                  {cat.art === 'crash' && (
                    <div style={{ width: 20, height: 20, position: 'relative' }}>
                      <div style={{ position:'absolute',bottom:0,left:0,width:'100%',height:2,background:cat.accent,borderRadius:1 }} />
                      <div style={{ position:'absolute',bottom:0,left:0,width:2,height:'100%',background:cat.accent,borderRadius:1 }} />
                      <div style={{ position:'absolute',bottom:2,left:2,width:14,height:14,borderTop:`2px solid ${cat.accent}`,borderRight:`2px solid ${cat.accent}`,borderRadius:'0 8px 0 0' }} />
                    </div>
                  )}
                  {cat.art === 'sports' && (
                    <div style={{ width:22, height:22, borderRadius:'50%', border:`2px solid ${cat.accent}`, position:'relative' }}>
                      <div style={{ position:'absolute',top:'50%',left:0,right:0,height:1.5,background:`${cat.accent}50`,transform:'translateY(-50%)' }} />
                      <div style={{ position:'absolute',top:0,bottom:0,left:'50%',width:1.5,background:`${cat.accent}50`,transform:'translateX(-50%)' }} />
                    </div>
                  )}
                </div>

                <div style={{ fontSize: 16, fontWeight: 800, color: '#f0e8ff', marginBottom: 4 }}>{cat.name}</div>
                <div style={{ fontSize: 12, color: cat.accent, fontWeight: 600 }}>{cat.count}</div>

                <div style={{ position: 'absolute', right: 20, bottom: 20, width: 10, height: 10, borderRight: `2px solid ${cat.accent}50`, borderTop: `2px solid ${cat.accent}50`, transform: 'rotate(45deg)' }} />
                <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(ellipse 80% 60% at 0% 0%, ${cat.accent}08 0%, transparent 60%)`, pointerEvents: 'none' }} />
              </div>
            ))}
          </div>
        </section>

        {/* ── GAME PROVIDERS STRIP ── */}
        <ProvidersStrip />

        {/* ── VIP SECTION ── */}
        <section style={{ marginBottom: 52, animation: mounted ? 'slideUp 0.7s ease 0.25s both' : 'none' }}>
          <div style={{
            borderRadius: 28, overflow: 'hidden',
            background: 'linear-gradient(135deg,#1e0835 0%,#160025 50%,#0d001a 100%)',
            border: '1px solid rgba(244,196,48,0.15)',
            boxShadow: '0 0 60px rgba(244,196,48,0.04)',
            animation: 'borderGlow 4s ease-in-out infinite',
          }}>
            <div style={{ padding: '36px 44px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, borderBottom: '1px solid rgba(124,58,237,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{
                  width: 70, height: 70, borderRadius: 18,
                  background: 'linear-gradient(135deg,rgba(244,196,48,0.2),rgba(244,196,48,0.08))',
                  border: '1px solid rgba(244,196,48,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 30px rgba(244,196,48,0.15)',
                  position: 'relative', flexShrink: 0,
                }}>
                  <div style={{ width: 38, height: 28, position: 'relative' }}>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 10, background: 'rgba(244,196,48,0.7)', borderRadius: '0 0 4px 4px' }}>
                      {[25,50,75].map((l,i)=><div key={i} style={{ position:'absolute', bottom:0, left:`${l}%`, transform:'translateX(-50%)', width:5, height:5, borderRadius:'50%', background:'#f4c430', boxShadow:'0 0 6px rgba(244,196,48,0.9)' }} />)}
                    </div>
                    <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ width:0,height:0,borderLeft:'7px solid transparent',borderRight:'7px solid transparent',borderBottom:'18px solid rgba(244,196,48,0.5)' }} />
                      <div style={{ width:0,height:0,borderLeft:'7px solid transparent',borderRight:'7px solid transparent',borderBottom:'26px solid rgba(244,196,48,0.7)' }} />
                      <div style={{ width:0,height:0,borderLeft:'7px solid transparent',borderRight:'7px solid transparent',borderBottom:'18px solid rgba(244,196,48,0.5)' }} />
                    </div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#f0e8ff', letterSpacing: '-0.3px', marginBottom: 4 }}>VIP Program</div>
                  <div style={{ fontSize: 14, color: '#9b8ab8' }}>Unlock exclusive rewards as you play</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {VIP_LEVELS.map(level => (
                  <div key={level.name} style={{ textAlign: 'center' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${level.color}18`, border: `1px solid ${level.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', boxShadow: `0 0 10px ${level.color}15` }}>
                      <div style={{ width: 14, height: 14, borderRadius: '50%', background: `radial-gradient(circle,${level.color},${level.color}80)` }} />
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: level.color, letterSpacing: '1px' }}>{level.name}</div>
                    <div style={{ fontSize: 9, color: '#6b5d8a', marginTop: 2 }}>{level.perks[0]}</div>
                  </div>
                ))}
              </div>

              <button style={{
                padding: '14px 32px', borderRadius: 14,
                background: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
                color: '#fff', fontSize: 14, fontWeight: 800, border: 'none', cursor: 'pointer',
                letterSpacing: '1px', fontFamily: "'Outfit',sans-serif",
                boxShadow: '0 8px 30px rgba(124,58,237,0.35)',
                transition: 'transform 0.2s', flexShrink: 0,
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                onClick={() => router.push('/vip')}
              >UNLOCK VIP</button>
            </div>

            <div style={{ padding: '28px 44px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <span style={{ fontSize: 14, color: '#9b8ab8' }}>Your progress to </span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#f4c430' }}>Gold VIP</span>
                </div>
                <span style={{ fontSize: 14, color: '#f4c430', fontWeight: 700 }}>3,240 / 5,000 points</span>
              </div>
              <div style={{ height: 10, borderRadius: 5, background: 'rgba(61,31,110,0.5)', overflow: 'hidden', marginBottom: 16 }}>
                <div style={{
                  height: '100%', width: '64.8%', borderRadius: 5,
                  background: 'linear-gradient(90deg,#7c3aed,#f4c430)',
                  boxShadow: '0 0 15px rgba(244,196,48,0.4)',
                  transition: 'width 1.5s ease',
                }}>
                  <div style={{ height: '100%', width: '100%', backgroundImage: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.3) 50%,transparent 100%)', backgroundSize: '200% 100%', animation: 'shimmer 2s linear infinite' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {VIP_LEVELS.map((lvl, i) => (
                  <div key={lvl.name} style={{ textAlign: 'center', opacity: i <= 1 ? 1 : 0.4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: i <= 1 ? lvl.color : '#3d1f6e', margin: '0 auto 4px', boxShadow: i <= 1 ? `0 0 8px ${lvl.color}` : 'none' }} />
                    <div style={{ fontSize: 9, color: i <= 1 ? lvl.color : '#6b5d8a', fontWeight: 700 }}>{lvl.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop: '1px solid rgba(124,58,237,0.15)', paddingTop: 40, paddingBottom: 48 }}>
          <div style={{ marginBottom: 36 }}>
            <div style={{ fontSize: 11, color: '#6b5d8a', fontWeight: 700, letterSpacing: '2px', marginBottom: 16, textAlign: 'center' }}>POWERED BY WORLD-CLASS PROVIDERS</div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              {['Pragmatic Play', 'EGT Interactive', 'Novomatic', 'NetEnt', 'Microgaming', 'Evolution', 'Playtech'].map(p => (
                <div key={p} style={{
                  padding: '8px 18px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  fontSize: 12, fontWeight: 700, color: '#6b5d8a', letterSpacing: '0.5px',
                  transition: 'all 0.2s', cursor: 'pointer',
                }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#9b8ab8'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#6b5d8a'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                >{p}</div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 40, marginBottom: 40 }}>
            <div style={{ maxWidth: 300 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#7c3aed,#f4c430)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(244,196,48,0.3)' }}>
                  <div style={{ width: 16, height: 18, position: 'relative' }}>
                    <div style={{ position:'absolute',left:0,top:0,bottom:0,width:2.5,background:'#fff',borderRadius:2 }} />
                    <div style={{ position:'absolute',right:0,top:0,bottom:0,width:2.5,background:'#fff',borderRadius:2 }} />
                    <div style={{ position:'absolute',top:0,left:0,right:0,height:2.5,background:'#fff',borderRadius:2,transformOrigin:'top left',transform:'rotate(35deg) scaleX(1.15)' }} />
                  </div>
                </div>
                <span style={{
                  fontSize: 18, fontWeight: 900, letterSpacing: '2px',
                  background: 'linear-gradient(135deg,#f4c430,#d97706)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>NEON PALACE</span>
              </div>
              <p style={{ fontSize: 13, color: '#4a3870', lineHeight: 1.7 }}>
                Premium entertainment platform. All games are for entertainment only. Play responsibly. 18+ only. Not available in restricted territories.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 52, flexWrap: 'wrap' }}>
              {[
                { title: 'GAMES', links: ['Slots', 'Table Games', 'Live Casino', 'Jackpots', 'Crash Games'] },
                { title: 'ACCOUNT', links: ['Profile', 'Transaction History', 'Bonuses', 'VIP Program'] },
                { title: 'SUPPORT', links: ['FAQ', 'Live Chat', 'Terms of Service', 'Privacy Policy', 'Responsible Gaming'] },
              ].map(sec => (
                <div key={sec.title}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#f4c430', letterSpacing: '2px', marginBottom: 14 }}>{sec.title}</div>
                  {sec.links.map(link => (
                    <div key={link} style={{ fontSize: 13, color: '#4a3870', marginBottom: 10, cursor: 'pointer', transition: 'color 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#9b8ab8'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#4a3870'; }}
                    >{link}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, borderTop: '1px solid rgba(124,58,237,0.12)', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: 12, color: '#2d1f4a' }}>© 2026 Neon Palace Casino Platform · Entertainment Only · No Real-Money Gambling</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { label: 'SSL SECURED', color: '#22c55e' },
                { label: '18+', color: '#f4c430' },
                { label: 'FAIR PLAY', color: '#00d4c8' },
                { label: 'RNG CERTIFIED', color: '#7c3aed' },
                { label: 'RESPONSIBLE', color: '#ff2d78' },
              ].map(badge => (
                <div key={badge.label} style={{
                  padding: '4px 10px', borderRadius: 6,
                  background: `${badge.color}0a`, border: `1px solid ${badge.color}20`,
                  fontSize: 10, color: `${badge.color}80`, fontWeight: 700, letterSpacing: '0.5px',
                }}>{badge.label}</div>
              ))}
            </div>
          </div>
        </footer>

        {/* ── LIVE SUPPORT WIDGET ── */}
        <LiveSupportWidget />

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LIVE SUPPORT WIDGET COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const GUEST_TICKET_KEY = 'casino_crm_my_ticket_id';
const CANNED_AGENT_REPLIES = [
  "Thanks for reaching out! I'm looking into this for you now.",
  'Got it — give me just a moment to check your account.',
  "I've flagged this as priority and I'm reviewing the details now.",
];

function LiveSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [ticket, setTicket] = useState<CrmTicket | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const replyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Demo-safe CRM ticket store (localStorage-backed, no backend) — see crm-mock.ts
  useEffect(() => {
    const savedId = typeof window !== 'undefined' ? window.localStorage.getItem(GUEST_TICKET_KEY) : null;
    if (savedId) {
      const state = loadCrm();
      const existing = state.tickets.find(t => t.id === savedId);
      if (existing) setTicket(existing);
    }
    const unsubscribe = subscribeCrm(() => {
      setTicket(prev => {
        if (!prev) return prev;
        const state = loadCrm();
        return state.tickets.find(t => t.id === prev.id) ?? prev;
      });
    });
    return () => {
      unsubscribe();
      if (replyTimerRef.current) clearTimeout(replyTimerRef.current);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages.length, isOpen]);

  useEffect(() => {
    if (isOpen) setUnreadCount(0);
  }, [isOpen, ticket?.messages.length]);

  function scheduleDemoAgentReply(ticketId: string) {
    if (replyTimerRef.current) clearTimeout(replyTimerRef.current);
    setIsTyping(true);
    replyTimerRef.current = setTimeout(() => {
      setIsTyping(false);
      claimTicket(ticketId, 'AGT-001');
      const reply = CANNED_AGENT_REPLIES[Math.floor(Math.random() * CANNED_AGENT_REPLIES.length)]!;
      appendMessage(ticketId, 'agent', reply, 'Sarah K.');
      const state = loadCrm();
      const updated = state.tickets.find(t => t.id === ticketId);
      if (updated) setTicket(updated);
      if (!isOpen) setUnreadCount(c => c + 1);
    }, 1500);
  }

  const sendMessage = () => {
    const text = inputValue.trim();
    if (!text) return;
    setInputValue('');

    if (!ticket) {
      const created = createTicket('You', 'Live chat support request', text);
      if (typeof window !== 'undefined') window.localStorage.setItem(GUEST_TICKET_KEY, created.id);
      setTicket(created);
      scheduleDemoAgentReply(created.id);
      return;
    }

    appendMessage(ticket.id, 'player', text, 'You');
    const state = loadCrm();
    const updated = state.tickets.find(t => t.id === ticket.id);
    if (updated) setTicket(updated);
    if (!ticket.assignedAgentId) scheduleDemoAgentReply(ticket.id);
  };

  const agentOnline = !ticket || ticket.status !== 'closed';
  const displayMessages = ticket
    ? ticket.messages.filter(m => m.sender !== 'system')
    : [{ id: 'welcome', sender: 'agent' as const, text: 'Welcome to Neon Palace Support! How can I help you today?', time: '' }];

  return (
    <>
      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
      
      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: 100,
          right: 24,
          width: 380,
          height: isMinimized ? 60 : 520,
          borderRadius: 16,
          background: 'linear-gradient(135deg, #1a0d35 0%, #0d0618 100%)',
          border: '1px solid rgba(244,196,48,0.3)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 20px rgba(244,196,48,0.1)',
          zIndex: 1000,
          overflow: 'hidden',
          animation: 'chatSlideUp 0.3s ease-out',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 18px',
            background: 'linear-gradient(135deg, #3d1f6e, #251240)',
            borderBottom: '1px solid rgba(244,196,48,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f4c430, #f97316)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16,
                }}>🎧</div>
                <div style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 12, height: 12, borderRadius: '50%',
                  background: agentOnline ? '#22c55e' : '#6b7280',
                  border: '2px solid #1a0d35',
                  boxShadow: agentOnline ? '0 0 8px #22c55e' : 'none',
                }} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#f4c430' }}>Live Support</div>
                <div style={{ fontSize: 11, color: agentOnline ? '#22c55e' : '#6b7280', fontWeight: 600 }}>
                  {ticket
                    ? ticket.status === 'closed'
                      ? '● Ticket Closed'
                      : ticket.assignedAgentId
                      ? `● Agent Connected${ticket.assignedAgentId === 'AGT-001' ? ' — Sarah K.' : ''}`
                      : '● Waiting for Agent'
                    : '● Agents Online'}
                </div>
                {ticket && (
                  <div style={{ fontSize: 9, color: '#7c6fa0', fontFamily: 'monospace', marginTop: 1 }}>{ticket.id}</div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                style={{
                  background: 'rgba(255,255,255,0.1)', border: 'none',
                  color: '#c4b5d4', borderRadius: 6, padding: '6px 10px',
                  fontSize: 14, cursor: 'pointer',
                }}
              >
                {isMinimized ? '▲' : '−'}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255,45,120,0.2)', border: '1px solid rgba(255,45,120,0.3)',
                  color: '#ff2d78', borderRadius: 6, padding: '6px 10px',
                  fontSize: 14, cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                background: 'rgba(13,6,24,0.5)',
              }}>
                {displayMessages.map(msg => (
                  <div key={msg.id} style={{
                    display: 'flex',
                    flexDirection: msg.sender === 'player' ? 'row-reverse' : 'row',
                    gap: 8,
                  }}>
                    <div style={{
                      maxWidth: '75%',
                      background: msg.sender === 'player'
                        ? 'linear-gradient(135deg, #7c3aed, #5b21b6)'
                        : 'rgba(61,31,110,0.6)',
                      border: msg.sender === 'player'
                        ? '1px solid rgba(124,58,237,0.4)'
                        : '1px solid rgba(244,196,48,0.2)',
                      borderRadius: msg.sender === 'player' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      padding: '10px 14px',
                    }}>
                      <div style={{ fontSize: 13, color: '#f0e8ff', lineHeight: 1.5 }}>{msg.text}</div>
                      <div style={{ fontSize: 10, color: '#7c6fa0', marginTop: 4 }}>
                        {msg.time ? new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{
                      background: 'rgba(61,31,110,0.6)',
                      border: '1px solid rgba(244,196,48,0.2)',
                      borderRadius: '16px 16px 16px 4px',
                      padding: '10px 14px',
                      display: 'flex', gap: 4, alignItems: 'center',
                    }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{
                          width: 6, height: 6, borderRadius: '50%', background: '#7c6fa0',
                          animation: `bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
                        }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{
                padding: '12px',
                borderTop: '1px solid rgba(244,196,48,0.15)',
                background: 'rgba(26,13,53,0.8)',
              }}>
                <div style={{
                  display: 'flex', gap: 8,
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(124,111,160,0.3)',
                  borderRadius: 10,
                  padding: '8px 12px',
                }}>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
                    placeholder="Type your message..."
                    style={{
                      flex: 1, background: 'transparent', border: 'none',
                      color: '#f0e8ff', fontSize: 13, outline: 'none',
                    }}
                  />
                  <button
                    onClick={sendMessage}
                    style={{
                      background: 'linear-gradient(135deg, #f4c430, #f97316)',
                      border: 'none', borderRadius: 8, padding: '6px 16px',
                      color: '#0d0618', fontSize: 12, fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    SEND
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f4c430, #f97316)',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(244,196,48,0.4)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          transition: 'transform 0.2s',
          animation: isOpen ? 'none' : 'pulse 2s ease-in-out infinite',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {isOpen ? '✕' : '💬'}
        {!isOpen && unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -2, right: -2,
            width: 20, height: 20, borderRadius: '50%',
            background: '#ff2d78', color: '#fff', fontSize: 11, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid #0d0618',
          }}>{unreadCount}</span>
        )}
      </button>
    </>
  );
}
