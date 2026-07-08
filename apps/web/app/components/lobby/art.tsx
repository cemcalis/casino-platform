'use client';

import React from 'react';

// Hand-drawn SVG/CSS key art for lobby game cards (extracted from the legacy lobby page).

export function StarBackground() {
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
      <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(244,196,48,0.12) 0%, transparent 70%)', animation: 'floatOrb 8s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,200,0.07) 0%, transparent 70%)', animation: 'floatOrb 11s ease-in-out 2s infinite' }} />
      <div style={{ position: 'absolute', top: '30%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,45,120,0.06) 0%, transparent 70%)', animation: 'floatOrb 9s ease-in-out 4s infinite' }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GAME CARD ART COMPONENTS (CSS-only, zero emoji)
// ─────────────────────────────────────────────────────────────────────────────

export function PyramidQuestArt() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/pyramid-quest/backgrounds/background.png" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(10,5,0,0.9) 100%)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, transparent, #f4c430, #d4af37, #f4c430, transparent)', boxShadow: '0 0 20px rgba(244,196,48,0.8)' }} />
    </div>
  );
}

export function NeonPalaceArt() {
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

export function DragonArt() {
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

export function OlympusArt() {
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

export function GoldenVaultArt() {
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

export function CyberRouletteArt() {
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

export function CrystalCavernsArt() {
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

export function Lucky7Art() {
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

export function SolarWildsArt() {
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

export function BlackjackProArt() {
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

export function MegaMoolahArt() {
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

export function StarPrismArt() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* Cosmic rays */}
      {Array.from({length:8},(_,i)=>(
        <div key={i} style={{ position:'absolute', top:'50%', left:'50%', width:3, height:90, background:`linear-gradient(180deg, rgba(232,121,249,0.8) 0%, transparent 100%)`, transformOrigin:'top center', transform:`translate(-50%,-100%) rotate(${i*45}deg)`, borderRadius:2 }} />
      ))}
      {/* Star core */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 50, height: 50, borderRadius: '50%', background: 'radial-gradient(circle, #fff 0%, #e879f9 40%, #7c3aed 80%, transparent 100%)', boxShadow: '0 0 30px rgba(232,121,249,0.9), 0 0 60px rgba(244,196,48,0.5)' }} />
      {/* Ring */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 100, height: 100, borderRadius: '50%', border: '2px solid rgba(232,121,249,0.4)', boxShadow: '0 0 20px rgba(232,121,249,0.3)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,transparent,#e879f9,#7c3aed,#e879f9,transparent)', boxShadow: '0 0 20px rgba(232,121,249,0.8)' }} />
    </div>
  );
}

export function GonzoQuestArt() {
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

export function BookOfDeadArt() {
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

export function LightningRouletteArt() {
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

export function DreamCatcherArt() {
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

export function CrazyTimeArt() {
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

export function AtlasReefArt() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* Deep sea glow */}
      <div style={{ position: 'absolute', top: '55%', left: '50%', transform: 'translate(-50%,-50%)', width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.35), transparent 70%)' }} />
      {/* Trident */}
      <img src="/assets/atlas-reef/ui/lobby-card.png" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.92 }} />
      {/* Rising bubbles */}
      {[14, 32, 58, 76, 88].map((left, i) => (
        <div key={i} style={{ position: 'absolute', bottom: -10, left: `${left}%`, width: 8 + (i % 3) * 5, height: 8 + (i % 3) * 5, borderRadius: '50%', border: '1.5px solid rgba(125,211,252,0.5)', animation: `floatY 6s ease-in-out ${i * 0.7}s infinite` }} />
      ))}
      {/* Reef silhouette */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 34, background: 'linear-gradient(0deg, rgba(21,94,117,0.8), transparent)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,transparent,#22d3ee,#fde047,#22d3ee,transparent)', boxShadow: '0 0 20px rgba(34,211,238,0.8)' }} />
    </div>
  );
}

export function KeyArtCard({ src, accent }: { src: string; accent: string }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <img src={src} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.92 }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg,transparent,${accent},transparent)`, boxShadow: `0 0 20px ${accent}` }} />
    </div>
  );
}


export function RocketRushArt() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {[12, 30, 55, 72, 88].map((left, i) => (
        <div key={i} style={{ position: 'absolute', left: `${left}%`, top: `${(i * 19 + 8) % 90}%`, width: 2, height: 2, borderRadius: '50%', background: 'rgba(255,255,255,0.7)', boxShadow: '0 0 6px rgba(255,255,255,0.8)' }} />
      ))}
      <div style={{ position: 'absolute', left: '18%', bottom: '22%', width: '64%', height: 3, background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.9))', transform: 'rotate(-32deg)', transformOrigin: 'left bottom', borderRadius: 3, boxShadow: '0 0 14px rgba(139,92,246,0.7)' }} />
      <div style={{ position: 'absolute', right: '14%', top: '26%', width: 54, height: 54, transform: 'rotate(-38deg)' }}>
        <div style={{ position: 'absolute', inset: '10% 30%', background: 'linear-gradient(180deg, #e4e4e7, #a1a1aa)', borderRadius: '50% 50% 40% 40%' }} />
        <div style={{ position: 'absolute', left: '38%', top: '22%', width: 12, height: 12, borderRadius: '50%', background: '#312e81', border: '2px solid #c4b5fd' }} />
        <div style={{ position: 'absolute', left: '30%', bottom: '-16%', width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '22px solid #f97316', filter: 'blur(1px)' }} />
      </div>
      <div style={{ position: 'absolute', left: 12, bottom: 70, fontSize: 26, fontWeight: 900, color: '#d4af37', textShadow: '0 0 18px rgba(212,175,55,0.6)' }}>2.47x</div>
    </div>
  );
}

export const GAME_ARTS: Record<string, () => JSX.Element> = {
  'rocket-rush': RocketRushArt,
  'atlas-reef': AtlasReefArt,
  'ember-falls': () => <KeyArtCard src="/assets/ember-falls/ui/lobby-card.png" accent="#fb923c" />,
  'sugar-realm': () => <KeyArtCard src="/assets/sugar-realm/ui/lobby-card.png" accent="#e879f9" />,
  'pyramid-quest': PyramidQuestArt,
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
  'starburst': StarPrismArt,
  'gonzo-quest': GonzoQuestArt,
  'book-of-dead': BookOfDeadArt,
  'lightning-roulette': LightningRouletteArt,
  'dream-catcher': DreamCatcherArt,
  'crazy-time': CrazyTimeArt,
};

export function WelcomePromoArt() {
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

export function ReloadPromoArt() {
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

export function VIPPromoArt() {
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
