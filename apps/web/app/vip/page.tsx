'use client';

import { AppIcon } from '../components/icons';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../lib/api-client';

const C = {
  bg: '#07030f',
  surface: '#120820',
  card: '#1a0c30',
  cardBorder: '#2d1558',
  gold: '#f4c430',
  teal: '#00d4c8',
  magenta: '#ff2d78',
  purple: '#7c3aed',
  text: '#f0e8ff',
  textDim: '#9d8ec0',
  green: '#00ff88',
};

interface VipStatus {
  tier: string;
  tierIcon: string;
  tierColor: string;
  totalBetVcoin: number;
  totalSpins: number;
  progressPct: number;
  vcoinToNextTier: number;
  nextTierName: string | null;
  benefits: { cashbackPct: number; dailyBonusVcoin: number };
  allTiers: Array<{
    name: string;
    icon: string;
    color: string;
    minBet: number;
    cashback: number;
    dailyBonus: number;
    unlocked: boolean;
  }>;
}

const TIER_BG: Record<string, string> = {
  Bronze:   'linear-gradient(145deg, #1a0d00 0%, #0d0600 100%)',
  Silver:   'linear-gradient(145deg, #12121a 0%, #080810 100%)',
  Gold:     'linear-gradient(145deg, #1a1200 0%, #0d0800 100%)',
  Platinum: 'linear-gradient(145deg, #0d0d1a 0%, #060608 100%)',
};

const TIER_PERKS: Record<string, string[]> = {
  Bronze:   ['500 VCOIN daily bonus', 'Access to all standard games', 'Weekly spin tournament entry', 'Community chat access'],
  Silver:   ['1,000 VCOIN daily bonus', '3% weekly cashback on losses', 'Priority support', 'Exclusive Silver game themes', 'Early access to new games'],
  Gold:     ['2,000 VCOIN daily bonus', '7% weekly cashback on losses', 'Dedicated account manager', 'Exclusive Gold tournaments', 'Double XP weekends', 'Special game modifiers'],
  Platinum: ['5,000 VCOIN daily bonus', '15% weekly cashback on losses', 'Personal VIP concierge', 'Exclusive Platinum-only games', 'Monthly special events', 'Custom avatar frame', 'Lifetime member badge'],
};

function TierCard({ tier, isCurrent }: { tier: VipStatus['allTiers'][number]; isCurrent: boolean }) {
  const [hovered, setHovered] = useState(false);
  const perks = TIER_PERKS[tier.name] ?? [];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: TIER_BG[tier.name] ?? C.card,
        border: `1px solid ${isCurrent ? tier.color : tier.unlocked ? tier.color + '44' : C.cardBorder}`,
        borderRadius: 20,
        padding: '28px 24px',
        position: 'relative',
        transition: 'all 0.3s',
        opacity: tier.unlocked ? 1 : 0.5,
        transform: isCurrent ? 'scale(1.03)' : hovered && tier.unlocked ? 'scale(1.01)' : 'scale(1)',
        boxShadow: isCurrent
          ? `0 0 40px ${tier.color}44, 0 20px 60px rgba(0,0,0,0.6)`
          : hovered && tier.unlocked
          ? `0 10px 30px rgba(0,0,0,0.4)`
          : 'none',
      }}
    >
      {isCurrent && (
        <div style={{
          position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
          background: tier.color, color: '#0d0618',
          fontSize: 10, fontWeight: 900, letterSpacing: 2,
          padding: '3px 12px', borderRadius: 20,
          whiteSpace: 'nowrap',
        }}>
          CURRENT TIER
        </div>
      )}

      {!tier.unlocked && (
        <div style={{
          position: 'absolute', top: 16, right: 16,
          fontSize: 18, opacity: 0.4,
        }}></div>
      )}

      <div style={{ fontSize: 40, marginBottom: 8 }}><AppIcon name={tier.icon} /></div>
      <div style={{ fontSize: 22, fontWeight: 900, color: tier.color, marginBottom: 4, letterSpacing: 1 }}>
        {tier.name.toUpperCase()}
      </div>
      <div style={{ fontSize: 11, color: C.textDim, letterSpacing: 2, marginBottom: 20 }}>
        {tier.minBet === 0 ? 'FROM THE START' : `${tier.minBet.toLocaleString()}+ VCOIN WAGERED`}
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '10px 12px' }}>
          <div style={{ fontSize: 10, color: C.textDim, letterSpacing: 1, marginBottom: 4 }}>DAILY BONUS</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: tier.color }}>
            {tier.dailyBonus.toLocaleString()}
          </div>
          <div style={{ fontSize: 9, color: C.textDim }}>VCOIN / DAY</div>
        </div>
        <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '10px 12px' }}>
          <div style={{ fontSize: 10, color: C.textDim, letterSpacing: 1, marginBottom: 4 }}>CASHBACK</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: tier.color }}>
            {tier.cashback}%
          </div>
          <div style={{ fontSize: 9, color: C.textDim }}>WEEKLY</div>
        </div>
      </div>

      <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
        {perks.map((p, i) => (
          <li key={i} style={{ fontSize: 12, color: tier.unlocked ? C.textDim : C.textDim + '88', marginBottom: 6, display: 'flex', gap: 8 }}>
            <span style={{ color: tier.color, flexShrink: 0 }}>▸</span>
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function VipPage() {
  const router = useRouter();
  const [vipStatus, setVipStatus] = useState<VipStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      setIsGuest(true);
      setLoading(false);
      return;
    }
    apiClient.get<VipStatus>('/users/me/vip', token)
      .then(v => { setVipStatus(v); setLoading(false); })
      .catch(() => { setIsGuest(true); setLoading(false); });
  }, []);

  const currentTier = vipStatus?.allTiers.find(t => t.name === vipStatus.tier);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Outfit', sans-serif", color: C.text }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0}@keyframes tierGlow{0%,100%{opacity:0.6}50%{opacity:1}}`}</style>

      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${C.cardBorder}`,
        background: `${C.surface}cc`,
        backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 100,
        padding: '0 24px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: C.textDim, cursor: 'pointer', fontSize: 14, letterSpacing: 1 }}>
            ← LOBBY
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 900, background: `linear-gradient(90deg,${C.gold},#e5e4e2,${C.gold})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: 2 }}>
              VIP CLUB
            </div>
            <div style={{ fontSize: 10, color: C.textDim, letterSpacing: 3 }}>NEON PALACE LOYALTY PROGRAM</div>
          </div>
          <button onClick={() => router.push('/promotions')} style={{ background: 'none', border: 'none', color: C.textDim, cursor: 'pointer', fontSize: 14, letterSpacing: 1 }}>
            BONUSES →
          </button>
        </div>
      </div>

      {/* Hero */}
      <div style={{
        background: `radial-gradient(ellipse at 50% 0%, #3d0080 0%, transparent 70%)`,
        padding: '60px 24px 48px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 11, color: C.gold, letterSpacing: 4, fontWeight: 700, marginBottom: 12 }}>EXCLUSIVE LOYALTY REWARDS</div>
        <h1 style={{
          fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 16,
          background: `linear-gradient(135deg, #e5e4e2 0%, ${C.gold} 50%, #cd7f32 100%)`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          Neon Palace VIP Club
        </h1>
        <p style={{ fontSize: 15, color: C.textDim, maxWidth: 540, margin: '0 auto', lineHeight: 1.6 }}>
          The more you play, the higher you climb. Unlock exclusive cashback, bigger daily bonuses, and premium perks.
        </p>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 60px' }}>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: C.gold }}>LOADING…</div>
        ) : isGuest ? (
          /* Guest view: show all tiers locked, CTA to join */
          <>
            <div style={{ textAlign: 'center', padding: '32px 24px 40px' }}>
              <p style={{ color: C.textDim, marginBottom: 20 }}>Create a free account to start climbing the VIP ladder</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button onClick={() => router.push('/register')} style={{ padding: '12px 32px', borderRadius: 12, border: 'none', background: `linear-gradient(135deg, ${C.gold}, #ff8c00)`, color: '#0d0618', fontSize: 15, fontWeight: 900, cursor: 'pointer' }}>JOIN FREE</button>
                <button onClick={() => router.push('/login')} style={{ padding: '12px 32px', borderRadius: 12, background: 'transparent', border: `1px solid ${C.cardBorder}`, color: C.textDim, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>SIGN IN</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {(['Bronze','Silver','Gold','Platinum'] as const).map((name, i) => (
                <TierCard key={name} tier={{ name, icon: ['','','',''][i]!, color: ['#cd7f32','#c0c0c0','#f4c430','#e5e4e2'][i]!, minBet: [0,1000,10000,50000][i]!, cashback: [0,3,7,15][i]!, dailyBonus: [500,1000,2000,5000][i]!, unlocked: false }} isCurrent={false} />
              ))}
            </div>
          </>
        ) : (
          vipStatus && (
            <>
              {/* Current status panel */}
              <div style={{
                background: `linear-gradient(135deg, ${currentTier?.color ?? C.gold}22 0%, ${C.card} 60%)`,
                border: `1px solid ${currentTier?.color ?? C.gold}44`,
                borderRadius: 20, padding: '32px 36px', marginBottom: 32,
                boxShadow: `0 0 60px ${currentTier?.color ?? C.gold}22`,
              }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center' }}>
                  {/* Tier badge */}
                  <div style={{ textAlign: 'center', minWidth: 120 }}>
                    <div style={{ fontSize: 56, marginBottom: 6 }}>{vipStatus.tierIcon}</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: currentTier?.color ?? C.gold, letterSpacing: 2 }}>{vipStatus.tier.toUpperCase()}</div>
                    <div style={{ fontSize: 11, color: C.textDim, letterSpacing: 1 }}>VIP STATUS</div>
                  </div>

                  {/* Stats */}
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 20 }}>
                      {[
                        { label: 'TOTAL WAGERED', value: `${vipStatus.totalBetVcoin.toLocaleString()} VCOIN` },
                        { label: 'TOTAL SPINS', value: vipStatus.totalSpins.toLocaleString() },
                        { label: 'DAILY BONUS', value: `${vipStatus.benefits.dailyBonusVcoin.toLocaleString()} VCOIN` },
                        { label: 'CASHBACK', value: `${vipStatus.benefits.cashbackPct}% / WEEK` },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <div style={{ fontSize: 10, color: C.textDim, letterSpacing: 2, marginBottom: 4 }}>{label}</div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Progress bar */}
                    {vipStatus.nextTierName && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontSize: 11, color: C.textDim, letterSpacing: 1 }}>PROGRESS TO {vipStatus.nextTierName.toUpperCase()}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: currentTier?.color ?? C.gold }}>{vipStatus.progressPct}%</span>
                        </div>
                        <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', width: `${vipStatus.progressPct}%`,
                            background: `linear-gradient(90deg, ${currentTier?.color ?? C.gold}, ${C.gold})`,
                            borderRadius: 4, transition: 'width 1s ease',
                          }}/>
                        </div>
                        <div style={{ fontSize: 11, color: C.textDim, marginTop: 6, textAlign: 'right' }}>
                          {vipStatus.vcoinToNextTier.toLocaleString()} VCOIN to go
                        </div>
                      </div>
                    )}
                    {!vipStatus.nextTierName && (
                      <div style={{ fontSize: 13, color: C.gold, fontWeight: 700, letterSpacing: 1 }}>
                         Maximum tier achieved — you are a Platinum member!
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tier comparison grid */}
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 14, color: C.textDim, letterSpacing: 3, fontWeight: 700, marginBottom: 20 }}>ALL TIERS</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                  {vipStatus.allTiers.map(tier => (
                    <TierCard key={tier.name} tier={tier} isCurrent={tier.name === vipStatus.tier} />
                  ))}
                </div>
              </div>

              {/* How to level up */}
              <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 16, padding: '28px 32px' }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: C.text, letterSpacing: 1, marginBottom: 16 }}>HOW VIP WORKS</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
                  {[
                    { icon: 'slots', title: 'Spin to Earn', desc: 'Every bet counts toward your VIP progress. The more VCOIN you wager, the faster you advance.' },
                    { icon: 'chart', title: 'Automatic Upgrade', desc: 'Tier upgrades happen automatically when your total wager threshold is reached.' },
                    { icon: 'money', title: 'Weekly Cashback', desc: 'Your cashback is calculated every Sunday and credited to your wallet on Monday.' },
                    { icon: 'gift', title: 'Daily Bonus', desc: 'Higher tiers unlock larger daily bonuses. Claim them from the Promotions page.' },
                  ].map(({ icon, title, desc }) => (
                    <div key={title}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 6 }}>{title}</div>
                      <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.6 }}>{desc}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
                  <button onClick={() => router.push('/games/neon-palace')} style={{
                    padding: '12px 28px', borderRadius: 12, border: 'none',
                    background: `linear-gradient(135deg, ${C.gold}, #ff8c00)`,
                    color: '#0d0618', fontSize: 14, fontWeight: 900, cursor: 'pointer', letterSpacing: 1,
                  }}>SPIN NOW →</button>
                  <button onClick={() => router.push('/promotions')} style={{
                    padding: '12px 28px', borderRadius: 12,
                    background: 'transparent', border: `1px solid ${C.cardBorder}`,
                    color: C.textDim, fontSize: 14, fontWeight: 700, cursor: 'pointer', letterSpacing: 1,
                  }}>VIEW PROMOTIONS</button>
                </div>
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}
