'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const C = {
  bg: '#06000e',
  surface: '#0d0018',
  card: '#130020',
  cardBorder: '#260840',
  gold: '#d4a848',
  goldBright: '#f4c430',
  purple: '#7c3aed',
  cyan: '#00d4c8',
  text: '#f0eaf8',
  textDim: '#7a7090',
};

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{background:#06000e;font-family:'Outfit',sans-serif;color:#f0eaf8;}
@keyframes fadeIn{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
@keyframes expandDown{from{opacity:0;max-height:0;}to{opacity:1;max-height:400px;}}
`;

interface FAQItem {
  q: string;
  a: string;
}

const SECTIONS: { title: string; color: string; items: FAQItem[] }[] = [
  {
    title: 'General',
    color: C.goldBright,
    items: [
      {
        q: 'What is Neon Palace?',
        a: 'Neon Palace is a social casino platform. All games are played with virtual coins (VCOIN) — there is no real money involved. It\'s purely for entertainment.',
      },
      {
        q: 'Is this real gambling?',
        a: 'No. Neon Palace uses virtual currency only. You cannot deposit or withdraw real money. All winnings are in VCOIN and have no monetary value.',
      },
      {
        q: 'How do I get started?',
        a: 'Create a free account, receive your welcome bonus of 5,000 VCOIN, and start playing immediately. No deposit required.',
      },
      {
        q: 'What games are available?',
        a: 'We currently offer Neon Palace Slots, Lucky 7s Classic, Blackjack Pro, and Cyber Roulette. More games are coming soon including Dragon\'s Fortune, Crystal Caverns, and live dealer experiences.',
      },
    ],
  },
  {
    title: 'Account & Wallet',
    color: C.cyan,
    items: [
      {
        q: 'How do I earn more VCOIN?',
        a: 'You earn VCOIN by playing games, claiming your daily bonus (available every 24 hours), weekly cashback rewards, and climbing VIP tiers. Check the Promotions page for all active bonuses.',
      },
      {
        q: 'What is the daily bonus?',
        a: 'Every 24 hours you can claim a free VCOIN bonus from the Promotions page. The amount increases with your VIP tier — from 100 VCOIN at Bronze up to 1,000 VCOIN at Diamond.',
      },
      {
        q: 'Can I lose my VCOIN balance?',
        a: 'Yes — just like real casino games, you bet VCOIN and can lose it. Your balance can reach 0 but you can always claim the daily bonus to get back in the game. There\'s no real money at stake.',
      },
      {
        q: 'What is the VIP program?',
        a: 'The VIP program has 5 tiers: Bronze, Silver, Gold, Platinum, and Diamond. Higher tiers unlock bigger daily bonuses, higher cashback percentages, and exclusive promotions. Your tier is based on total VCOIN wagered.',
      },
    ],
  },
  {
    title: 'Games & Fairness',
    color: C.purple,
    items: [
      {
        q: 'Are the games fair?',
        a: 'Yes. All game outcomes use a provably fair RNG (Random Number Generator). For slots, every spin includes a server seed and nonce that you can verify. The RTP (Return to Player) for each game is displayed on the game card.',
      },
      {
        q: 'What is RTP?',
        a: 'RTP stands for Return to Player — the theoretical percentage of all wagered VCOIN that the game pays back over time. For example, a 96.7% RTP means for every 100 VCOIN bet, 96.7 VCOIN is returned on average over millions of spins.',
      },
      {
        q: 'What does DEMO MODE mean?',
        a: 'Some games offer a DEMO MODE which uses a separate demo balance that resets to 10,000 VCOIN. This lets you try games without risking your main account balance.',
      },
      {
        q: 'What are free spins?',
        a: 'In certain slot games, landing 3 or more scatter symbols awards free spins. During free spins your base bet is not deducted — all wins are pure profit to your VCOIN balance.',
      },
    ],
  },
  {
    title: 'Responsible Gaming',
    color: '#22c55e',
    items: [
      {
        q: 'Is Neon Palace safe for everyone?',
        a: 'Neon Palace is intended for adults (18+) as entertainment only. Since no real money is involved, the financial risks of gambling do not apply. However, if you feel you are spending excessive time on social casino games, please take breaks.',
      },
      {
        q: 'How can I take a break?',
        a: 'You can log out at any time. We are working on a self-exclusion feature that will allow you to lock your account for a set period. This will be available in a future update.',
      },
      {
        q: 'Who can I contact for support?',
        a: 'For any account issues, game bugs, or general questions, please use the contact form or reach out via the support email listed in our terms. We aim to respond within 24 hours.',
      },
      {
        q: 'What are your Terms of Service?',
        a: 'Neon Palace is a demo/social casino platform for entertainment only. All VCOIN has no monetary value. By using the platform you confirm you are 18+ and understand that this is not real money gambling. Full terms are available on request.',
      },
    ],
  },
];

function FAQAccordion({ items, accentColor }: { items: FAQItem[]; accentColor: string }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            borderRadius: 12,
            border: `1px solid ${open === i ? accentColor + '40' : C.cardBorder}`,
            background: open === i ? `${accentColor}08` : C.card,
            overflow: 'hidden',
            transition: 'border-color 0.2s, background 0.2s',
          }}
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              width: '100%',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 16,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: open === i ? accentColor : C.text,
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "'Outfit', sans-serif",
              textAlign: 'left',
              transition: 'color 0.2s',
            }}
          >
            <span>{item.q}</span>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                border: `1px solid ${open === i ? accentColor : C.cardBorder}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.2s',
                color: open === i ? accentColor : C.textDim,
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1, transform: open === i ? 'rotate(45deg)' : 'none', display: 'block', transition: 'transform 0.2s' }}>+</span>
            </div>
          </button>

          {open === i && (
            <div
              style={{
                padding: '0 20px 16px',
                fontSize: 13,
                color: C.textDim,
                lineHeight: 1.7,
                animation: 'expandDown 0.25s ease',
              }}
            >
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function FAQPage() {
  const router = useRouter();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <div style={{ minHeight: '100vh', background: C.bg }}>

        {/* Nav */}
        <nav style={{
          padding: '16px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${C.cardBorder}`,
          background: `${C.surface}cc`,
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <button
            onClick={() => router.push('/')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textDim, fontSize: 13, fontFamily: "'Outfit', sans-serif", letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <span style={{ fontSize: 16 }}>←</span> LOBBY
          </button>
          <div style={{ fontSize: 18, fontWeight: 900, color: C.goldBright, letterSpacing: '0.1em' }}>
            FAQ &amp; HELP
          </div>
          <button
            onClick={() => router.push('/promotions')}
            style={{
              padding: '8px 20px', borderRadius: 8,
              background: `linear-gradient(135deg, ${C.gold}, ${C.goldBright})`,
              color: '#06000e', fontSize: 12, fontWeight: 800,
              border: 'none', cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
              letterSpacing: '0.06em',
            }}
          >
            CLAIM BONUS
          </button>
        </nav>

        {/* Hero */}
        <div style={{
          maxWidth: 800,
          margin: '0 auto',
          padding: '64px 24px 48px',
          textAlign: 'center',
          animation: 'fadeIn 0.5s ease',
        }}>
          <div style={{
            display: 'inline-block',
            padding: '5px 16px',
            borderRadius: 20,
            background: `${C.gold}18`,
            border: `1px solid ${C.gold}33`,
            fontSize: 11, fontWeight: 800,
            color: C.gold, letterSpacing: '2px',
            marginBottom: 20,
          }}>
            HELP CENTER
          </div>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            marginBottom: 16,
            background: `linear-gradient(135deg, ${C.goldBright}, #fff)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Frequently Asked Questions
          </h1>
          <p style={{ fontSize: 15, color: C.textDim, lineHeight: 1.6, maxWidth: 500, margin: '0 auto' }}>
            Everything you need to know about Neon Palace social casino. Can&apos;t find your answer? Contact our support team.
          </p>
        </div>

        {/* FAQ sections */}
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 80px', display: 'flex', flexDirection: 'column', gap: 48 }}>
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 20,
              }}>
                <div style={{ width: 4, height: 28, borderRadius: 2, background: section.color }} />
                <h2 style={{ fontSize: 18, fontWeight: 800, color: section.color, letterSpacing: '0.04em' }}>
                  {section.title}
                </h2>
              </div>
              <FAQAccordion items={section.items} accentColor={section.color} />
            </div>
          ))}

          {/* Contact card */}
          <div style={{
            borderRadius: 16,
            background: `linear-gradient(135deg, ${C.surface}, ${C.card})`,
            border: `1px solid ${C.cardBorder}`,
            padding: 32,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}></div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 8 }}>Still have questions?</h3>
            <p style={{ fontSize: 13, color: C.textDim, marginBottom: 20 }}>
              Our support team is available 24/7. Average response time: under 2 hours.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => router.push('/')}
                style={{
                  padding: '11px 28px', borderRadius: 10,
                  background: `linear-gradient(135deg, ${C.gold}, ${C.goldBright})`,
                  color: '#06000e', fontSize: 13, fontWeight: 800,
                  border: 'none', cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                  letterSpacing: '0.06em',
                }}
              >
                BACK TO LOBBY
              </button>
              <button
                style={{
                  padding: '11px 28px', borderRadius: 10,
                  background: 'transparent',
                  color: C.text, fontSize: 13, fontWeight: 600,
                  border: `1px solid ${C.cardBorder}`, cursor: 'pointer',
                  fontFamily: "'Outfit', sans-serif",
                  letterSpacing: '0.04em',
                }}
              >
                CONTACT SUPPORT
              </button>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
