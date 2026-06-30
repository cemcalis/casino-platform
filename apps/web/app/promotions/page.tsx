'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { userApi } from '../../lib/api-user';

const C = {
  bg: '#07030f',
  surface: '#120820',
  card: '#1a0c30',
  cardBorder: '#2d1558',
  gold: '#f4c430',
  goldDim: '#f4c43066',
  teal: '#00d4c8',
  magenta: '#ff2d78',
  purple: '#7c3aed',
  text: '#f0e8ff',
  textDim: '#9d8ec0',
  green: '#00ff88',
};

type ClaimState = 'idle' | 'claiming' | 'claimed' | 'unavailable';

interface Promotion {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  amount: number;
  amountLabel: string;
  description: string;
  terms: string[];
  accentColor: string;
  glowColor: string;
  bgGradient: string;
  icon: string;
  claimKey?: 'daily' | 'welcome';
  ctaLabel: string;
  ctaAction?: () => void;
}

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{timeLeft}</span>;
}

function PromoCard({
  promo,
  claimState,
  onClaim,
  disabled,
}: {
  promo: Promotion;
  claimState: ClaimState;
  onClaim: () => void;
  disabled: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const isClaimed = claimState === 'claimed' || claimState === 'unavailable';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: promo.bgGradient,
        border: `1px solid ${hovered ? promo.accentColor + '80' : C.cardBorder}`,
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.3s',
        boxShadow: hovered ? `0 0 40px ${promo.glowColor}30, 0 20px 60px rgba(0,0,0,0.6)` : '0 4px 20px rgba(0,0,0,0.4)',
        transform: hovered ? 'translateY(-4px)' : 'none',
      }}
    >
      {/* Badge */}
      <div style={{
        position: 'absolute', top: 16, right: 16,
        background: promo.badgeColor, color: '#fff',
        fontSize: 10, fontWeight: 900, letterSpacing: 2,
        padding: '4px 10px', borderRadius: 20,
        boxShadow: `0 0 10px ${promo.badgeColor}88`,
      }}>
        {promo.badge}
      </div>

      {/* Content */}
      <div style={{ padding: '32px 28px 24px' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>{promo.icon}</div>

        <div style={{ fontSize: 11, color: promo.accentColor, letterSpacing: 3, fontWeight: 700, marginBottom: 6 }}>
          {promo.subtitle}
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, color: C.text, marginBottom: 4, lineHeight: 1.2 }}>
          {promo.title}
        </div>

        <div style={{
          fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 900, marginBottom: 4,
          background: `linear-gradient(135deg, ${promo.accentColor}, ${C.gold})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          lineHeight: 1,
        }}>
          {promo.amount.toLocaleString()} <span style={{ fontSize: '0.45em', WebkitTextFillColor: C.textDim }}>{promo.amountLabel}</span>
        </div>

        <p style={{ fontSize: 13, color: C.textDim, lineHeight: 1.6, marginBottom: 20, minHeight: 42 }}>
          {promo.description}
        </p>

        {/* Terms */}
        <ul style={{ padding: 0, margin: '0 0 20px', listStyle: 'none' }}>
          {promo.terms.map((t, i) => (
            <li key={i} style={{ fontSize: 11, color: C.textDim, marginBottom: 4, display: 'flex', gap: 6 }}>
              <span style={{ color: promo.accentColor, flexShrink: 0 }}>▸</span>
              {t}
            </li>
          ))}
        </ul>

        {/* CTA */}
        {promo.claimKey ? (
          <button
            onClick={onClaim}
            disabled={disabled || isClaimed}
            style={{
              width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
              background: isClaimed
                ? 'rgba(255,255,255,0.05)'
                : claimState === 'claiming'
                ? `${promo.accentColor}88`
                : `linear-gradient(135deg, ${promo.accentColor}, ${C.gold})`,
              color: isClaimed ? C.textDim : '#0d0618',
              fontSize: 14, fontWeight: 900, letterSpacing: 2,
              cursor: isClaimed || disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              opacity: claimState === 'claiming' ? 0.7 : 1,
            }}
          >
            {claimState === 'claiming' ? 'CLAIMING…'
              : claimState === 'claimed' ? '✓ CLAIMED'
              : claimState === 'unavailable' ? 'ALREADY CLAIMED'
              : promo.ctaLabel}
          </button>
        ) : (
          <button
            onClick={promo.ctaAction}
            style={{
              width: '100%', padding: '14px 0', borderRadius: 12,
              background: `linear-gradient(135deg, ${promo.accentColor}22, transparent)`,
              border: `1px solid ${promo.accentColor}44`,
              color: promo.accentColor, fontSize: 14, fontWeight: 700, letterSpacing: 2,
              cursor: 'pointer', transition: 'all 0.3s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = `${promo.accentColor}22`; }}
            onMouseLeave={e => { e.currentTarget.style.background = `linear-gradient(135deg, ${promo.accentColor}22, transparent)`; }}
          >
            {promo.ctaLabel}
          </button>
        )}
      </div>
    </div>
  );
}

export default function PromotionsPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [welcomeState, setWelcomeState] = useState<ClaimState>('idle');
  const [dailyState, setDailyState] = useState<ClaimState>('idle');
  const [claimedAmount, setClaimedAmount] = useState<{ welcome?: string; daily?: string }>({});
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const t = sessionStorage.getItem('accessToken');
    setToken(t);
    if (!t) return;

    userApi.getBonusStatus(t)
      .then(status => {
        if (status.welcome.claimed) setWelcomeState('unavailable');
        if (status.daily.claimedToday) setDailyState('unavailable');
      })
      .catch(() => {});
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }, []);

  const handleClaim = useCallback(async (key: 'daily' | 'welcome') => {
    if (!token) { router.push('/login'); return; }
    if (key === 'daily') {
      if (dailyState !== 'idle') return;
      setDailyState('claiming');
      try {
        const res = await userApi.claimDailyBonus(token);
        setDailyState('claimed');
        setClaimedAmount(p => ({ ...p, daily: res.bonusAmount }));
        showToast(`+${parseFloat(res.bonusAmount).toLocaleString()} VCOIN added to your wallet!`);
      } catch {
        setDailyState('unavailable');
        showToast('Daily bonus already claimed today.');
      }
    } else {
      if (welcomeState !== 'idle') return;
      setWelcomeState('claiming');
      try {
        const res = await userApi.claimWelcomeBonus(token);
        setWelcomeState('claimed');
        setClaimedAmount(p => ({ ...p, welcome: res.bonusAmount }));
        showToast(`Welcome! +${parseFloat(res.bonusAmount).toLocaleString()} VCOIN in your wallet!`);
      } catch {
        setWelcomeState('unavailable');
        showToast('Welcome bonus already claimed.');
      }
    }
  }, [token, dailyState, welcomeState, router, showToast]);

  const promotions: Promotion[] = [
    {
      id: 'welcome',
      badge: 'NEW PLAYER',
      badgeColor: C.magenta,
      title: 'Welcome to Neon Palace',
      subtitle: 'EXCLUSIVE ONE-TIME OFFER',
      amount: 5000,
      amountLabel: 'VCOIN',
      description: 'Start your journey with a massive boost. Claim your 5,000 VCOIN welcome gift and explore every game.',
      terms: ['One-time claim per account', 'Available immediately after registration', 'No wagering requirements', 'Virtual currency only — for entertainment'],
      accentColor: C.magenta,
      glowColor: C.magenta,
      bgGradient: 'linear-gradient(145deg, #2d0030 0%, #1a0020 60%, #0d000f 100%)',
      icon: '🎉',
      claimKey: 'welcome',
      ctaLabel: 'CLAIM 5,000 VCOIN',
    },
    {
      id: 'daily',
      badge: 'DAILY',
      badgeColor: C.gold,
      title: 'Daily Reload Bonus',
      subtitle: 'EVERY 24 HOURS',
      amount: 500,
      amountLabel: 'VCOIN',
      description: 'Log in every day to claim your free 500 VCOIN. Resets at midnight — don\'t miss a day!',
      terms: ['One claim per calendar day', 'Resets at 00:00 UTC', 'Stackable with other bonuses', 'Virtual currency only'],
      accentColor: C.gold,
      glowColor: C.gold,
      bgGradient: 'linear-gradient(145deg, #2a1a00 0%, #1a0d00 60%, #0d0600 100%)',
      icon: '🌅',
      claimKey: 'daily',
      ctaLabel: 'CLAIM 500 VCOIN',
    },
    {
      id: 'tournament',
      badge: 'WEEKLY',
      badgeColor: C.teal,
      title: 'Weekly Spin Tournament',
      subtitle: 'COMPETE FOR THE TOP SPOT',
      amount: 50000,
      amountLabel: 'VCOIN PRIZE POOL',
      description: 'Spin your way to the top of the weekly leaderboard and share the 50,000 VCOIN prize pool.',
      terms: ['Top 10 players share the prize pool', 'Calculated on total spin volume', 'Resets every Monday 00:00 UTC', 'View live standings on Leaderboard'],
      accentColor: C.teal,
      glowColor: C.teal,
      bgGradient: 'linear-gradient(145deg, #001a1a 0%, #000d12 60%, #000609 100%)',
      icon: '🏆',
      claimKey: undefined,
      ctaLabel: 'VIEW LEADERBOARD',
      ctaAction: () => router.push('/leaderboard'),
    },
    {
      id: 'vip',
      badge: 'COMING SOON',
      badgeColor: C.purple,
      title: 'VIP Cashback Program',
      subtitle: 'FOR HIGH ROLLERS',
      amount: 20,
      amountLabel: '% WEEKLY CASHBACK',
      description: 'Unlock VIP status and receive up to 20% of your weekly losses back. The more you play, the higher you climb.',
      terms: ['Bronze → Silver → Gold → Platinum tiers', 'Cashback calculated every Sunday', 'Higher tiers unlock exclusive games', 'Early access to new releases'],
      accentColor: C.purple,
      glowColor: C.purple,
      bgGradient: 'linear-gradient(145deg, #0d0030 0%, #07001a 60%, #030009 100%)',
      icon: '💎',
      claimKey: undefined,
      ctaLabel: 'JOIN WAITLIST',
      ctaAction: () => {},
    },
    {
      id: 'referral',
      badge: 'REFERRAL',
      badgeColor: '#22c55e',
      title: 'Refer a Friend',
      subtitle: 'SHARE THE EXCITEMENT',
      amount: 1000,
      amountLabel: 'VCOIN PER REFERRAL',
      description: 'Share your unique code and earn 1,000 VCOIN for every friend who joins and plays their first game.',
      terms: ['Friend must complete first spin', 'No limit on referrals', 'Bonus credited within 24 hours', 'Referred player also receives 250 VCOIN'],
      accentColor: '#22c55e',
      glowColor: '#22c55e',
      bgGradient: 'linear-gradient(145deg, #001a0a 0%, #000d05 60%, #000602 100%)',
      icon: '👥',
      claimKey: undefined,
      ctaLabel: 'GET REFERRAL CODE',
      ctaAction: () => {},
    },
    {
      id: 'happy-hour',
      badge: 'HAPPY HOUR',
      badgeColor: '#ff9500',
      title: '2× Bonus Hours',
      subtitle: 'DAILY 18:00–22:00 UTC',
      amount: 2,
      amountLabel: '× BONUS MULTIPLIER',
      description: 'During Happy Hour, all wins are doubled! Play Neon Palace between 18:00–22:00 UTC daily for maximum VCOIN.',
      terms: ['Active 18:00–22:00 UTC daily', 'Applies to all game types', 'Multiplied on actual server payouts', 'Check the lobby for countdown'],
      accentColor: '#ff9500',
      glowColor: '#ff9500',
      bgGradient: 'linear-gradient(145deg, #1a0a00 0%, #0d0500 60%, #060200 100%)',
      icon: '⚡',
      claimKey: undefined,
      ctaLabel: 'PLAY NOW',
      ctaAction: () => router.push('/games/neon-palace'),
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Outfit', sans-serif", color: C.text }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
          background: C.card, border: `1px solid ${C.gold}66`, borderRadius: 14,
          padding: '14px 28px', fontSize: 14, fontWeight: 700, color: C.gold,
          zIndex: 9999, boxShadow: `0 0 30px ${C.gold}33`,
          animation: 'none',
        }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${C.cardBorder}`,
        background: `${C.surface}cc`,
        backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 100,
        padding: '0 24px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => router.push('/')} style={{
            background: 'none', border: 'none', color: C.textDim, cursor: 'pointer',
            fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, letterSpacing: 1,
          }}>← LOBBY</button>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 900, background: `linear-gradient(90deg,${C.magenta},${C.gold},${C.teal})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: 2 }}>
              PROMOTIONS
            </div>
            <div style={{ fontSize: 10, color: C.textDim, letterSpacing: 3 }}>NEON PALACE BONUS CENTER</div>
          </div>

          <div style={{ fontSize: 12, color: C.textDim }}>
            {token ? (
              <span style={{ color: C.green }}>● LOGGED IN</span>
            ) : (
              <button onClick={() => router.push('/login')} style={{ background: 'none', border: 'none', color: C.gold, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                SIGN IN TO CLAIM →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hero */}
      <div style={{
        background: `radial-gradient(ellipse at 50% 0%, #3d0080 0%, transparent 70%)`,
        padding: '60px 24px 40px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 11, color: C.magenta, letterSpacing: 4, fontWeight: 700, marginBottom: 12 }}>EXCLUSIVE OFFERS</div>
        <h1 style={{
          fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 16,
          background: `linear-gradient(135deg, ${C.text} 0%, ${C.gold} 50%, ${C.magenta} 100%)`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          Your Bonuses Await
        </h1>
        <p style={{ fontSize: 15, color: C.textDim, maxWidth: 520, margin: '0 auto 24px', lineHeight: 1.6 }}>
          Claim daily rewards, compete in tournaments, and unlock VIP perks. All virtual currency — pure entertainment.
        </p>

        {/* Daily reset countdown */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          background: C.card, border: `1px solid ${C.cardBorder}`,
          borderRadius: 30, padding: '8px 20px',
          fontSize: 13, color: C.textDim,
        }}>
          <span style={{ color: C.gold }}>◉</span>
          Daily bonus resets in <strong style={{ color: C.gold, marginLeft: 4 }}><CountdownTimer /></strong>
        </div>
      </div>

      {/* Cards grid */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 60px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 20,
        }}>
          {promotions.map(promo => (
            <PromoCard
              key={promo.id}
              promo={promo}
              claimState={promo.id === 'daily' ? dailyState : promo.id === 'welcome' ? welcomeState : 'idle'}
              onClaim={() => promo.claimKey && handleClaim(promo.claimKey)}
              disabled={!token && !!promo.claimKey}
            />
          ))}
        </div>

        {/* Sign-in CTA for guests */}
        {!token && (
          <div style={{
            marginTop: 40, padding: '32px 40px', borderRadius: 20,
            background: `linear-gradient(135deg, #2a0060, #1a0040)`,
            border: `1px solid ${C.purple}44`,
            textAlign: 'center',
            boxShadow: `0 0 40px ${C.purple}22`,
          }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: C.text, marginBottom: 8 }}>Ready to claim?</div>
            <p style={{ color: C.textDim, marginBottom: 20 }}>Create a free account to start collecting bonuses</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => router.push('/register')} style={{
                padding: '12px 32px', borderRadius: 12, border: 'none',
                background: `linear-gradient(135deg, ${C.gold}, #ff8c00)`,
                color: '#0d0618', fontSize: 15, fontWeight: 900, cursor: 'pointer',
              }}>
                JOIN FREE
              </button>
              <button onClick={() => router.push('/login')} style={{
                padding: '12px 32px', borderRadius: 12,
                background: 'transparent', border: `1px solid ${C.cardBorder}`,
                color: C.textDim, fontSize: 15, fontWeight: 700, cursor: 'pointer',
              }}>
                SIGN IN
              </button>
            </div>
          </div>
        )}

        {/* Claimed amounts summary */}
        {(claimedAmount.welcome || claimedAmount.daily) && (
          <div style={{
            marginTop: 32, padding: '20px 28px', borderRadius: 16,
            background: `${C.green}11`, border: `1px solid ${C.green}33`,
            display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center',
          }}>
            <span style={{ fontSize: 20 }}>🎊</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.green }}>Bonuses Claimed This Session</div>
              <div style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>
                {[
                  claimedAmount.welcome && `Welcome: +${parseFloat(claimedAmount.welcome).toLocaleString()} VCOIN`,
                  claimedAmount.daily && `Daily: +${parseFloat(claimedAmount.daily).toLocaleString()} VCOIN`,
                ].filter(Boolean).join(' · ')}
              </div>
            </div>
            <button onClick={() => router.push('/wallet')} style={{
              marginLeft: 'auto', padding: '8px 20px', borderRadius: 10,
              background: `${C.green}22`, border: `1px solid ${C.green}44`,
              color: C.green, fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}>
              VIEW WALLET →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
