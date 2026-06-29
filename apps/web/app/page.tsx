'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { userApi } from '../lib/api-user';

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

const CATEGORY_MAP: Record<string, string[]> = {
  All: SLIDER_GAMES.map(g => g.id),
  Slots: ['neon-palace', 'dragons-fortune', 'olympus-strikes', 'crystal-caverns', 'lucky-7s', 'solar-wilds'],
  Table: ['cyber-roulette'],
  Live: ['cyber-roulette'],
  Jackpots: ['golden-vault'],
  New: ['olympus-strikes', 'crystal-caverns'],
  Popular: ['neon-palace', 'dragons-fortune', 'solar-wilds'],
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
@keyframes slideUp{from{opacity:0;transform:translateY(40px);}to{opacity:1;transform:translateY(0);}}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
@keyframes glowPulse{0%,100%{box-shadow:0 0 20px rgba(244,196,48,0.2);}50%{box-shadow:0 0 50px rgba(244,196,48,0.6),0 0 100px rgba(244,196,48,0.2);}}
@keyframes cardShine{0%{left:-100%;}60%,100%{left:150%;}}
@keyframes dotBlink{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(34,197,94,0.5);}50%{opacity:.7;box-shadow:0 0 0 5px rgba(34,197,94,0);}}
@keyframes promoFade{from{opacity:0;transform:translateX(30px);}to{opacity:1;transform:translateX(0);}}
@keyframes spinGlow{0%,100%{box-shadow:0 8px 40px rgba(244,196,48,0.3);}50%{box-shadow:0 8px 80px rgba(244,196,48,0.7),0 0 120px rgba(244,196,48,0.2);}}
@keyframes rotateSlow{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
@keyframes scalePop{0%{transform:scale(0.8);opacity:0;}100%{transform:scale(1);opacity:1;}}
@keyframes borderGlow{0%,100%{border-color:rgba(244,196,48,0.15);}50%{border-color:rgba(244,196,48,0.5);}}
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
      {/* Big ambient orbs */}
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
      {/* Reel columns */}
      {[0,1,2].map(i => (
        <div key={i} style={{ position: 'absolute', top: 20, bottom: 20, left: `${18 + i*26}%`, width: 40, borderRadius: 8, background: 'rgba(10,0,30,0.7)', border: '1px solid rgba(244,196,48,0.3)', overflow: 'hidden' }}>
          {[0,1,2].map(j => (
            <div key={j} style={{ height: '33.33%', borderBottom: j < 2 ? '1px solid rgba(244,196,48,0.2)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 20, height: 20, borderRadius: 3, background: j === 1 ? 'linear-gradient(135deg,#f4c430,#d97706)' : 'rgba(244,196,48,0.1)', boxShadow: j === 1 ? '0 0 12px rgba(244,196,48,0.8)' : 'none' }} />
            </div>
          ))}
        </div>
      ))}
      {/* Glow top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, transparent, #f4c430, #ff2d78, #f4c430, transparent)', boxShadow: '0 0 20px rgba(244,196,48,0.8)' }} />
      {/* Stripe pattern */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, rgba(244,196,48,0.03) 0px, rgba(244,196,48,0.03) 2px, transparent 2px, transparent 20px)', pointerEvents: 'none' }} />
      {/* Corner gems */}
      <div style={{ position: 'absolute', top: 10, right: 10, width: 14, height: 14, background: 'linear-gradient(135deg,#ff2d78,#f4c430)', borderRadius: 3, transform: 'rotate(45deg)', boxShadow: '0 0 10px rgba(255,45,120,0.8)' }} />
    </div>
  );
}

function DragonArt() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* Scale pattern */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse 24px 18px at 0 0, rgba(255,107,0,0.2) 0%, transparent 100%)', backgroundSize: '24px 18px' }} />
      {/* Fire glow */}
      <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 120, height: 80, background: 'radial-gradient(ellipse at bottom, rgba(255,107,0,0.8) 0%, rgba(255,45,0,0.4) 40%, transparent 70%)', borderRadius: '50%' }} />
      {/* Dragon silhouette body */}
      <div style={{ position: 'absolute', top: '25%', left: '50%', transform: 'translateX(-50%)', width: 70, height: 60, background: 'rgba(139,26,0,0.6)', borderRadius: '40% 60% 60% 40%', boxShadow: '0 0 20px rgba(255,107,0,0.4)' }} />
      {/* Wings */}
      <div style={{ position: 'absolute', top: '20%', left: '15%', width: 50, height: 40, background: 'rgba(139,26,0,0.4)', borderRadius: '0 80% 0 0', transform: 'skewX(-10deg)' }} />
      <div style={{ position: 'absolute', top: '20%', right: '15%', width: 50, height: 40, background: 'rgba(139,26,0,0.4)', borderRadius: '80% 0 0 0', transform: 'skewX(10deg)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, transparent, #ff6b00, #ff2d00, #ff6b00, transparent)', boxShadow: '0 0 20px rgba(255,107,0,0.8)' }} />
    </div>
  );
}

function OlympusArt() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* Sky gradient */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,80,180,0.4) 0%, transparent 100%)' }} />
      {/* Columns */}
      {[15, 35, 55, 75].map((left, i) => (
        <div key={i} style={{ position: 'absolute', bottom: 0, left: `${left}%`, width: 18, background: 'linear-gradient(180deg, rgba(0,212,200,0.6) 0%, rgba(0,80,180,0.3) 100%)', height: `${60 + i * 8}%`, borderRadius: '4px 4px 0 0', boxShadow: '0 0 15px rgba(0,212,200,0.3)' }}>
          <div style={{ height: 8, background: 'rgba(0,212,200,0.8)', borderRadius: '4px 4px 0 0', boxShadow: '0 0 10px rgba(0,212,200,0.7)' }} />
        </div>
      ))}
      {/* Lightning bolt */}
      <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: 3, height: 40, background: 'linear-gradient(180deg,#f4c430,transparent)', boxShadow: '0 0 15px rgba(244,196,48,0.9)', borderRadius: 2 }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,transparent,#00d4c8,#7c3aed,#00d4c8,transparent)', boxShadow: '0 0 20px rgba(0,212,200,0.8)' }} />
    </div>
  );
}

function GoldenVaultArt() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* Vault door */}
      <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: 90, height: 110, borderRadius: '50% 50% 10px 10px', background: 'linear-gradient(135deg, #5a3800, #3d2800, #2a1800)', border: '4px solid rgba(244,196,48,0.5)', boxShadow: '0 0 30px rgba(244,196,48,0.3)' }}>
        {/* Vault dial */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 44, height: 44, borderRadius: '50%', background: 'radial-gradient(circle, #f4c430, #8b6914)', border: '3px solid rgba(244,196,48,0.6)', boxShadow: '0 0 20px rgba(244,196,48,0.5)' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-100%)', width: 2, height: 16, background: '#0d0618', borderRadius: 1 }} />
        </div>
        {/* Vault handle */}
        <div style={{ position: 'absolute', right: -10, top: '40%', width: 16, height: 28, borderRadius: 8, background: 'rgba(244,196,48,0.4)', border: '2px solid rgba(244,196,48,0.4)' }} />
        {/* Bolts */}
        {[[8,8],[8,92],[92,8],[92,92]].map(([t,l],i)=>(
          <div key={i} style={{ position:'absolute', top:`${t}%`, left:`${l}%`, width:10, height:10, borderRadius:'50%', background:'rgba(244,196,48,0.6)', transform:'translate(-50%,-50%)' }} />
        ))}
      </div>
      {/* Glow floor */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: 'radial-gradient(ellipse at bottom, rgba(244,196,48,0.2) 0%, transparent 100%)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,transparent,#f4c430,transparent)', boxShadow: '0 0 20px rgba(244,196,48,0.8)' }} />
    </div>
  );
}

function CyberRouletteArt() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* Grid */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,212,200,0.08) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,200,0.08) 1px,transparent 1px)', backgroundSize: '20px 20px' }} />
      {/* Outer ring */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 120, height: 120, borderRadius: '50%', border: '3px solid rgba(0,212,200,0.6)', boxShadow: '0 0 20px rgba(0,212,200,0.3), inset 0 0 20px rgba(0,212,200,0.1)' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 80, height: 80, borderRadius: '50%', border: '2px solid rgba(0,212,200,0.4)', boxShadow: '0 0 15px rgba(0,212,200,0.2)' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 30, height: 30, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,212,200,0.8),rgba(0,212,200,0.2))', boxShadow: '0 0 20px rgba(0,212,200,0.8)' }} />
        </div>
        {/* Segment markers */}
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
      {/* Crystal facets */}
      {[
        { left: '10%', top: '10%', w: 50, h: 80, rotate: -20, color: 'rgba(168,85,247,0.4)' },
        { left: '30%', top: '5%', w: 35, h: 100, rotate: 5, color: 'rgba(0,212,200,0.4)' },
        { left: '55%', top: '15%', w: 45, h: 70, rotate: 15, color: 'rgba(168,85,247,0.3)' },
        { left: '70%', top: '8%', w: 30, h: 85, rotate: -10, color: 'rgba(0,212,200,0.3)' },
      ].map((c, i) => (
        <div key={i} style={{ position: 'absolute', left: c.left, top: c.top, width: c.w, height: c.h, background: c.color, transform: `rotate(${c.rotate}deg)`, clipPath: 'polygon(50% 0%, 100% 30%, 100% 70%, 50% 100%, 0% 70%, 0% 30%)', boxShadow: `0 0 20px ${c.color}` }} />
      ))}
      {/* Glow bottom */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 50, background: 'radial-gradient(ellipse at bottom, rgba(168,85,247,0.3) 0%, transparent 100%)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,transparent,#a855f7,#00d4c8,#a855f7,transparent)', boxShadow: '0 0 20px rgba(168,85,247,0.8)' }} />
    </div>
  );
}

function Lucky7Art() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* Felt pattern */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle 1px at 50% 50%, rgba(244,196,48,0.08) 0%, transparent 100%)', backgroundSize: '12px 12px' }} />
      {/* Big 7 shape */}
      <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 70, height: 110, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 18, background: 'linear-gradient(135deg,#f4c430,#ff2d78)', borderRadius: 5, boxShadow: '0 0 20px rgba(244,196,48,0.6)' }} />
        <div style={{ flex: 1, marginLeft: 'auto', width: 18, background: 'linear-gradient(180deg,#f4c430,#d97706)', borderRadius: '0 0 5px 5px', boxShadow: '0 0 20px rgba(244,196,48,0.4)', marginTop: 2, transform: 'skewX(-8deg)' }} />
      </div>
      {/* Stars around */}
      {[{t:'8%',l:'5%'},{t:'20%',r:'8%'},{b:'15%',l:'8%'},{b:'20%',r:'5%'}].map((pos,i)=>(
        <div key={i} style={{ position:'absolute', ...pos as any, width:14, height:14, background:'rgba(244,196,48,0.6)', clipPath:'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)', boxShadow:'0 0 12px rgba(244,196,48,0.7)' }} />
      ))}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,transparent,#f4c430,#ff2d78,#f4c430,transparent)', boxShadow: '0 0 20px rgba(244,196,48,0.8)' }} />
    </div>
  );
}

function SolarWildsArt() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* Sun rays */}
      {Array.from({length:12},(_,i)=>(
        <div key={i} style={{ position:'absolute', top:'50%', left:'50%', width:2, height:80, background:`rgba(255,149,0,${i%2===0?0.4:0.2})`, transformOrigin:'top center', transform:`translate(-50%,-100%) rotate(${i*30}deg)`, borderRadius:2 }} />
      ))}
      {/* Sun core */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 60, height: 60, borderRadius: '50%', background: 'radial-gradient(circle, #fff 0%, #ffdd00 30%, #ff9500 70%, transparent 100%)', boxShadow: '0 0 30px rgba(255,149,0,0.9), 0 0 60px rgba(255,149,0,0.4)' }} />
      {/* Orbit ring */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 110, height: 110, borderRadius: '50%', border: '1px solid rgba(255,149,0,0.3)', boxShadow: '0 0 20px rgba(255,149,0,0.1)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,transparent,#ff9500,#f4c430,#ff9500,transparent)', boxShadow: '0 0 20px rgba(255,149,0,0.8)' }} />
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
};

// ─────────────────────────────────────────────────────────────────────────────
// GAME SLIDER CARD
// ─────────────────────────────────────────────────────────────────────────────

function GameSliderCard({ game, isActive }: { game: SliderGame; isActive: boolean }) {
  const [hovered, setHovered] = useState(false);
  const router = useRouter();
  const ArtComponent = GAME_ARTS[game.id] || (() => <div />);
  const handlePlay = () => {
    if (game.id === 'neon-palace') router.push('/games/neon-palace');
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
      {/* Art layer */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <ArtComponent />
      </div>

      {/* Bottom gradient overlay */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%', background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 50%, transparent 100%)' }} />

      {/* Shine effect on hover */}
      {hovered && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 20, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: 0, left: '-100%', width: '60%', height: '100%', background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)', animation: 'cardShine 0.7s ease forwards', transform: 'skewX(-15deg)' }} />
        </div>
      )}

      {/* Badge */}
      <div style={{
        position: 'absolute', top: 14, left: 14,
        padding: '4px 12px', borderRadius: 20,
        background: game.badge === 'LIVE' ? '#22c55e' : game.badge === 'HOT' ? '#ff2d78' : game.badge === 'NEW' ? '#7c3aed' : 'rgba(244,196,48,0.9)',
        color: '#fff', fontSize: 11, fontWeight: 800, letterSpacing: '1px',
        boxShadow: `0 0 12px ${game.badgeColor}60`,
      }}>
        {game.badge}
      </div>

      {/* RTP badge */}
      <div style={{
        position: 'absolute', top: 14, right: 14,
        padding: '4px 10px', borderRadius: 20,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
        color: '#f4c430', fontSize: 11, fontWeight: 700,
        border: '1px solid rgba(244,196,48,0.3)',
      }}>
        RTP {game.rtp}
      </div>

      {/* Info */}
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

        {/* Play button */}
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
      {/* Gift box */}
      <div style={{ width: 100, height: 80, background: 'linear-gradient(135deg,rgba(244,196,48,0.3),rgba(244,196,48,0.1))', borderRadius: 12, border: '1px solid rgba(244,196,48,0.4)', margin: '0 auto', position: 'relative', boxShadow: '0 0 30px rgba(244,196,48,0.2)' }}>
        <div style={{ position: 'absolute', top: -12, left: 0, right: 0, height: 20, background: 'rgba(244,196,48,0.3)', borderRadius: 8, border: '1px solid rgba(244,196,48,0.4)', boxShadow: '0 0 15px rgba(244,196,48,0.3)' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 2, background: 'rgba(244,196,48,0.5)' }} />
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, background: 'rgba(244,196,48,0.3)', transform: 'translateY(-50%)' }} />
        {/* Bow */}
        <div style={{ position: 'absolute', top: -28, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4 }}>
          <div style={{ width: 20, height: 16, borderRadius: '50% 0 0 50%', border: '2px solid rgba(255,45,120,0.6)', background: 'transparent' }} />
          <div style={{ width: 20, height: 16, borderRadius: '0 50% 50% 0', border: '2px solid rgba(255,45,120,0.6)', background: 'transparent' }} />
        </div>
      </div>
      {/* Sparkles */}
      {[{top:0,left:10},{top:10,right:10},{bottom:10,left:5},{bottom:5,right:5}].map((pos,i)=>(
        <div key={i} style={{ position:'absolute', ...pos as any, width:8, height:8, background:'rgba(244,196,48,0.7)', clipPath:'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)', boxShadow:'0 0 8px rgba(244,196,48,0.8)' }} />
      ))}
    </div>
  );
}

function ReloadPromoArt() {
  return (
    <div style={{ position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%)', width: 140, height: 140, pointerEvents: 'none' }}>
      {/* Reload circle arrow */}
      <div style={{ width: 100, height: 100, margin: '0 auto', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '6px solid transparent', borderTopColor: 'rgba(0,212,200,0.7)', borderRightColor: 'rgba(0,212,200,0.4)', boxShadow: '0 0 20px rgba(0,212,200,0.3)' }} />
        <div style={{ position: 'absolute', inset: 12, borderRadius: '50%', border: '4px solid transparent', borderBottomColor: 'rgba(0,212,200,0.5)', borderLeftColor: 'rgba(0,212,200,0.3)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 30, height: 30, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,200,0.6), rgba(0,212,200,0.1))', boxShadow: '0 0 15px rgba(0,212,200,0.5)' }} />
        {/* Percent */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 18, fontWeight: 900, color: '#00d4c8' }}>50%</div>
      </div>
    </div>
  );
}

function VIPPromoArt() {
  return (
    <div style={{ position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%)', width: 140, height: 140, pointerEvents: 'none' }}>
      {/* Crown */}
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

    // Jackpot incrementer
    const jpInterval = setInterval(() => {
      setMegaJP(v => v + Math.floor(Math.random() * 47 + 3));
      setMajorJP(v => v + Math.floor(Math.random() * 12 + 1));
      setMinorJP(v => v + Math.floor(Math.random() * 5));
      setMiniJP(v => v + Math.floor(Math.random() * 2));
      setJpFlash(true);
      setTimeout(() => setJpFlash(false), 300);
    }, 1800);

    // Promo auto-rotate
    const promoInterval = setInterval(() => setPromoIndex(i => (i + 1) % PROMO_CARDS.length), 5000);

    return () => {
      clearInterval(jpInterval);
      clearInterval(promoInterval);
    };
  }, []);

  // Get filtered games for slider
  const filteredGameIds = CATEGORY_MAP[activeCategory] || SLIDER_GAMES.map(g => g.id);
  const filteredGames = SLIDER_GAMES.filter(g => filteredGameIds.includes(g.id));
  const CARD_WIDTH = 280 + 20; // width + gap
  const VISIBLE = 4;
  const maxIndex = Math.max(0, filteredGames.length - VISIBLE);

  const goToSlide = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(maxIndex, index));
    setSliderIndex(clamped);
    setSliderOffset(-clamped * CARD_WIDTH);
  }, [maxIndex, CARD_WIDTH]);

  // Auto-advance slider
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

  // Reset slider on category change
  useEffect(() => {
    setSliderIndex(0);
    setSliderOffset(0);
  }, [activeCategory]);

  // Mouse/touch drag handlers
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

      {/* ──────────────────────────────────────────────────────────── */}
      {/* NAVBAR */}
      {/* ──────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: 'rgba(10,0,16,0.88)', backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(124,58,237,0.25)',
        boxShadow: '0 4px 40px rgba(0,0,0,0.5)',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 28px', display: 'flex', alignItems: 'center', height: 72, gap: 28 }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, marginRight: 8 }}>
            {/* Neon N icon */}
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
              textShadow: 'none',
            }}>
              NEON PALACE
            </span>
          </div>

          {/* Nav links */}
          <div style={{ display: 'flex', gap: 2, flex: 1 }}>
            {['Lobby', 'Games', 'Live Casino', 'Promotions', 'VIP'].map(item => (
              <button key={item} onClick={() => setActiveNav(item)} style={{
                padding: '7px 18px', borderRadius: 10,
                background: activeNav === item ? 'rgba(244,196,48,0.1)' : 'transparent',
                border: 'none',
                color: activeNav === item ? '#f4c430' : '#9b8ab8',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.5px',
                borderBottom: activeNav === item ? '2px solid #f4c430' : '2px solid transparent',
                transition: 'all 0.2s',
                fontFamily: "'Outfit', sans-serif",
              }}
                onMouseEnter={e => { if (activeNav !== item) { e.currentTarget.style.color = '#f0e8ff'; } }}
                onMouseLeave={e => { if (activeNav !== item) { e.currentTarget.style.color = '#9b8ab8'; } }}
              >{item}</button>
            ))}
          </div>

          {/* Right section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>

            {/* Notification bell */}
            <button style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                {/* Bell shape */}
                <div style={{ width: 16, height: 14, borderRadius: '8px 8px 0 0', background: '#9b8ab8', position: 'relative' }}>
                  <div style={{ position: 'absolute', bottom: -3, left: -3, right: -3, height: 4, background: '#9b8ab8', borderRadius: '0 0 2px 2px' }} />
                  <div style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', width: 6, height: 3, borderRadius: '0 0 3px 3px', background: '#9b8ab8' }} />
                </div>
                <div style={{ position: 'absolute', top: -3, right: -3, width: 8, height: 8, borderRadius: '50%', background: '#ff2d78', border: '1px solid #0a0010' }} />
              </div>
            </button>

            {/* Balance */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 16px', borderRadius: 12,
              background: 'linear-gradient(135deg,rgba(244,196,48,0.12),rgba(244,196,48,0.04))',
              border: '1px solid rgba(244,196,48,0.25)',
            }}>
              {/* Chip icon */}
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#f4c430,#d97706)', border: '3px solid rgba(255,255,255,0.2)', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 10, color: '#6b5d8a', letterSpacing: '1px', fontWeight: 600 }}>BALANCE</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#f4c430' }}>${balance}</div>
              </div>
            </div>

            {/* Profile */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '7px 14px', borderRadius: 12,
              background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)',
              cursor: 'pointer',
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'linear-gradient(135deg,#7c3aed,#f4c430)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800, color: '#fff',
              }}>{username ? username[0]?.toUpperCase() : 'G'}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#f0e8ff' }}>{username ?? 'Guest'}</div>
                <div style={{ fontSize: 10, color: '#f4c430', fontWeight: 600 }}>GOLD VIP</div>
              </div>
              <div style={{ width: 12, height: 12, borderRight: '2px solid #6b5d8a', borderBottom: '2px solid #6b5d8a', transform: 'rotate(45deg) translate(-2px,-2px)' }} />
            </div>

            {/* Deposit CTA */}
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
          </div>
        </div>
      </nav>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* MAIN CONTENT */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 28px', position: 'relative', zIndex: 1 }}>

        {/* ── HERO SECTION ── */}
        <section style={{
          margin: '40px 0 48px',
          padding: '64px 64px 56px',
          borderRadius: 32,
          background: 'linear-gradient(135deg, #160825 0%, #220a40 30%, #1a0535 60%, #0d0020 100%)',
          border: '1px solid rgba(124,58,237,0.2)',
          boxShadow: '0 0 80px rgba(124,58,237,0.08), 0 0 160px rgba(244,196,48,0.03), inset 0 1px 0 rgba(255,255,255,0.04)',
          position: 'relative', overflow: 'hidden',
          animation: mounted ? 'slideUp 0.7s ease both' : 'none',
        }}>
          {/* Background grid */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(244,196,48,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(244,196,48,0.03) 1px,transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

          {/* Floating orbs */}
          <div style={{ position: 'absolute', top: -80, right: '10%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle,rgba(244,196,48,0.1) 0%,transparent 70%)', animation: 'floatOrb 7s ease-in-out infinite', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -60, left: '5%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.12) 0%,transparent 70%)', animation: 'floatOrb 9s ease-in-out 3s infinite', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '30%', right: '2%', width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,45,120,0.08) 0%,transparent 70%)', animation: 'floatOrb 6s ease-in-out 1.5s infinite', pointerEvents: 'none' }} />

          {/* Sparkle particles */}
          {[{t:'10%',l:'8%'},{t:'70%',l:'4%'},{t:'20%',r:'5%'},{t:'80%',r:'8%'},{t:'45%',l:'50%'}].map((pos,i)=>(
            <div key={i} style={{ position:'absolute', ...pos as any, width:6, height:6, background:'rgba(244,196,48,0.6)', clipPath:'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)', boxShadow:'0 0 10px rgba(244,196,48,0.6)', animation:`twinkle ${2+i*0.5}s ease-in-out ${i*0.4}s infinite`, pointerEvents:'none' }} />
          ))}

          <div style={{ position: 'relative', textAlign: 'center' }}>
            {/* Label */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 20, background: 'rgba(244,196,48,0.1)', border: '1px solid rgba(244,196,48,0.25)', marginBottom: 28 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f4c430', boxShadow: '0 0 8px rgba(244,196,48,0.8)', animation: 'dotBlink 2s infinite' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#f4c430', letterSpacing: '2px' }}>PROGRESSIVE JACKPOT — LIVE</span>
            </div>

            {/* MEGA JACKPOT counter */}
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

            {/* Secondary jackpots */}
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

            {/* CTA buttons */}
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

            {/* Stats row */}
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
          padding: '0',
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
            {/* Trophy icon */}
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
                  {/* Avatar */}
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
                {/* Art */}
                {promo.id === 'welcome' && <WelcomePromoArt />}
                {promo.id === 'reload' && <ReloadPromoArt />}
                {promo.id === 'vip-cashback' && <VIPPromoArt />}
                {/* Glow */}
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
                  >{promo.cta}</button>
                </div>
              </div>
            ))}
          </div>

          {/* Promo nav arrows */}
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
        <section style={{ marginBottom: 52, animation: mounted ? 'slideUp 0.7s ease 0.15s both' : 'none' }}>
          {/* Section header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22, flexWrap: 'wrap', gap: 14 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#f0e8ff', letterSpacing: '-0.3px' }}>Featured Games</h2>
              <div style={{ fontSize: 13, color: '#6b5d8a', marginTop: 2 }}>The best games handpicked for you</div>
            </div>
            <a href="#" style={{ fontSize: 13, color: '#f4c430', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, alignSelf: 'center' }}>
              View All
              <div style={{ width: 8, height: 8, borderRight: '2px solid #f4c430', borderTop: '2px solid #f4c430', transform: 'rotate(45deg) translate(-1px,1px)' }} />
            </a>
          </div>

          {/* Category tabs */}
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

          {/* Slider wrapper */}
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
                  <GameSliderCard key={game.id} game={game} isActive={i === sliderIndex} />
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
            ].map((cat, i) => {
              return (
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
                  {/* Category icon */}
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

                  {/* Arrow */}
                  <div style={{ position: 'absolute', right: 20, bottom: 20, width: 10, height: 10, borderRight: `2px solid ${cat.accent}50`, borderTop: `2px solid ${cat.accent}50`, transform: 'rotate(45deg)' }} />
                  {/* Glow */}
                  <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(ellipse 80% 60% at 0% 0%, ${cat.accent}08 0%, transparent 60%)`, pointerEvents: 'none' }} />
                </div>
              );
            })}
          </div>
        </section>

        {/* ── VIP SECTION ── */}
        <section style={{ marginBottom: 52, animation: mounted ? 'slideUp 0.7s ease 0.25s both' : 'none' }}>
          <div style={{
            borderRadius: 28, overflow: 'hidden',
            background: 'linear-gradient(135deg,#1e0835 0%,#160025 50%,#0d001a 100%)',
            border: '1px solid rgba(244,196,48,0.15)',
            boxShadow: '0 0 60px rgba(244,196,48,0.04)',
            animation: 'borderGlow 4s ease-in-out infinite',
          }}>
            {/* Top section */}
            <div style={{ padding: '36px 44px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, borderBottom: '1px solid rgba(124,58,237,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                {/* Crown art */}
                <div style={{
                  width: 70, height: 70, borderRadius: 18,
                  background: 'linear-gradient(135deg,rgba(244,196,48,0.2),rgba(244,196,48,0.08))',
                  border: '1px solid rgba(244,196,48,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 30px rgba(244,196,48,0.15)',
                  position: 'relative', flexShrink: 0,
                }}>
                  {/* Crown shape */}
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

              {/* VIP tiers */}
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
              >UNLOCK VIP</button>
            </div>

            {/* Progress section */}
            <div style={{ padding: '28px 44px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <span style={{ fontSize: 14, color: '#9b8ab8' }}>Your progress to </span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#f4c430' }}>Gold VIP</span>
                </div>
                <span style={{ fontSize: 14, color: '#f4c430', fontWeight: 700 }}>3,240 / 5,000 points</span>
              </div>
              {/* Progress bar */}
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
              {/* Level markers */}
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
          {/* Provider logos */}
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

          {/* Main footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 40, marginBottom: 40 }}>
            {/* Brand */}
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

            {/* Links */}
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

          {/* Bottom bar */}
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

      </div>
    </div>
  );
}
