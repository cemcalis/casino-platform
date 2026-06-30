'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { userApi } from '../../lib/api-user';
import type { LedgerEntry } from '../../lib/api-user';

const C = {
  bg: '#06000e',
  surface: '#0d0018',
  card: '#130020',
  cardBorder: '#260840',
  gold: '#d4a848',
  goldBright: '#f4c430',
  purple: '#7c3aed',
  cyan: '#00d4c8',
  text: '#f0e8ff',
  textDim: '#7a7090',
  green: '#00e676',
  red: '#ff4466',
  magenta: '#ff2d78',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function entryLabel(entry: LedgerEntry): string {
  const ref = entry.referenceId;
  if (ref === 'daily-bonus' || ref === 'daily_bonus') return 'Daily Bonus';
  if (ref === 'welcome-bonus' || ref === 'welcome_bonus') return 'Welcome Bonus';
  if (ref === 'cashback-bonus') return 'Cashback Bonus';
  if (ref?.startsWith('spin_')) return 'Game Spin';
  if (entry.type === 'CREDIT') return 'Credit';
  return 'Debit';
}

function entryIcon(entry: LedgerEntry): string {
  const ref = entry.referenceId;
  if (ref === 'daily-bonus' || ref === 'daily_bonus') return '🎁';
  if (ref === 'welcome-bonus' || ref === 'welcome_bonus') return '🎉';
  if (ref === 'cashback-bonus') return '💰';
  if (ref?.startsWith('spin_') && entry.type === 'CREDIT') return '🏆';
  if (ref?.startsWith('spin_') && entry.type === 'DEBIT') return '🎰';
  return entry.type === 'CREDIT' ? '↑' : '↓';
}

// ── Payment Method SVG Icons ───────────────────────────────────────────────
function VisaIcon() {
  return (
    <svg width="48" height="28" viewBox="0 0 48 28" fill="none">
      <rect width="48" height="28" rx="4" fill="#1a1f71" />
      <text x="5" y="20" fontFamily="Arial" fontWeight="900" fontSize="14" fill="#ffffff">VISA</text>
    </svg>
  );
}
function MastercardIcon() {
  return (
    <svg width="48" height="28" viewBox="0 0 48 28" fill="none">
      <rect width="48" height="28" rx="4" fill="#1a0a0a" />
      <circle cx="18" cy="14" r="10" fill="#eb001b" />
      <circle cx="30" cy="14" r="10" fill="#f79e1b" />
      <path d="M24 6.3A10 10 0 0128.5 14 10 10 0 0124 21.7 10 10 0 0119.5 14 10 10 0 0124 6.3z" fill="#ff5f00" />
    </svg>
  );
}
function BitcoinIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill="#f7931a" />
      <text x="10" y="27" fontFamily="Arial" fontWeight="900" fontSize="20" fill="#fff">₿</text>
    </svg>
  );
}
function EthereumIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill="#627eea" />
      <polygon points="20,8 28,21 20,25 12,21" fill="white" fillOpacity="0.9" />
      <polygon points="20,25 28,21 20,32 12,21" fill="white" fillOpacity="0.6" />
    </svg>
  );
}
function UsdtIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill="#26a17b" />
      <text x="10" y="26" fontFamily="Arial" fontWeight="900" fontSize="16" fill="#fff">₮</text>
    </svg>
  );
}
function BankIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="#2d4a7a" />
      <rect x="8" y="20" width="4" height="10" fill="white" fillOpacity="0.9" />
      <rect x="14" y="16" width="4" height="14" fill="white" fillOpacity="0.9" />
      <rect x="20" y="12" width="4" height="18" fill="white" fillOpacity="0.9" />
      <rect x="26" y="18" width="4" height="12" fill="white" fillOpacity="0.9" />
      <rect x="6" y="31" width="26" height="3" fill="white" />
      <polygon points="19,7 6,14 32,14" fill="white" fillOpacity="0.9" />
    </svg>
  );
}

const PAYMENT_METHODS = [
  { id: 'visa', label: 'Visa', Icon: VisaIcon, min: 10, max: 10000 },
  { id: 'mastercard', label: 'Mastercard', Icon: MastercardIcon, min: 10, max: 10000 },
  { id: 'bitcoin', label: 'Bitcoin', Icon: BitcoinIcon, min: 20, max: 50000 },
  { id: 'ethereum', label: 'Ethereum', Icon: EthereumIcon, min: 20, max: 50000 },
  { id: 'usdt', label: 'USDT (TRC-20)', Icon: UsdtIcon, min: 10, max: 100000 },
  { id: 'bankwire', label: 'Bank Wire', Icon: BankIcon, min: 100, max: 500000 },
];

type MainTab = 'deposit' | 'withdraw' | 'transactions';

function PaymentMethodGrid({
  selectedMethod,
  onSelect,
  amount,
  onAmountChange,
  onAction,
  actionLabel,
}: {
  selectedMethod: string | null;
  onSelect: (id: string) => void;
  amount: string;
  onAmountChange: (v: string) => void;
  onAction: () => void;
  actionLabel: string;
}) {
  const [hoveredMethod, setHoveredMethod] = useState<string | null>(null);
  const selected = PAYMENT_METHODS.find(m => m.id === selectedMethod);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 12,
      }}>
        {PAYMENT_METHODS.map(({ id, label, Icon }) => {
          const isSelected = selectedMethod === id;
          const isHovered = hoveredMethod === id;
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              onMouseEnter={() => setHoveredMethod(id)}
              onMouseLeave={() => setHoveredMethod(null)}
              style={{
                background: isSelected
                  ? `linear-gradient(135deg, ${C.gold}22, ${C.purple}22)`
                  : isHovered
                  ? `rgba(255,255,255,0.04)`
                  : C.card,
                border: `1px solid ${isSelected ? C.gold : isHovered ? C.cardBorder + 'aa' : C.cardBorder}`,
                borderRadius: 16,
                padding: '20px 12px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
                transition: 'all 0.25s',
                boxShadow: isSelected ? `0 0 20px ${C.gold}33` : 'none',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              <Icon />
              <span style={{
                fontSize: 12, fontWeight: 700, color: isSelected ? C.gold : C.textDim,
                letterSpacing: 0.5, transition: 'color 0.2s',
              }}>
                {label}
              </span>
              {isSelected && (
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: C.gold, boxShadow: `0 0 8px ${C.gold}`,
                }} />
              )}
            </button>
          );
        })}
      </div>

      {selectedMethod && (
        <div style={{
          background: `linear-gradient(135deg, ${C.gold}08, ${C.purple}08)`,
          border: `1px solid ${C.gold}44`,
          borderRadius: 20,
          padding: '28px 32px',
          boxShadow: `0 0 40px ${C.gold}11`,
          animation: 'fadeSlideUp 0.3s ease',
        }}>
          <div style={{ fontSize: 12, color: C.textDim, letterSpacing: 3, marginBottom: 8 }}>
            AMOUNT (COINS) — {selected?.label}
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <span style={{
                position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                color: C.gold, fontWeight: 900, fontSize: 18, pointerEvents: 'none',
              }}>$</span>
              <input
                type="number"
                value={amount}
                onChange={e => onAmountChange(e.target.value)}
                placeholder={`Min ${selected?.min ?? 10}`}
                style={{
                  width: '100%', padding: '14px 16px 14px 36px',
                  background: 'rgba(0,0,0,0.4)', border: `1px solid ${C.cardBorder}`,
                  borderRadius: 12, color: C.text, fontSize: 18, fontWeight: 700,
                  outline: 'none', fontFamily: "'Outfit', sans-serif",
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[100, 500, 1000, 5000].map(v => (
                <button
                  key={v}
                  onClick={() => onAmountChange(String(v))}
                  style={{
                    padding: '8px 14px', borderRadius: 8,
                    background: amount === String(v) ? `${C.gold}22` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${amount === String(v) ? C.gold : C.cardBorder}`,
                    color: amount === String(v) ? C.gold : C.textDim,
                    fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  {v.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={onAction}
            disabled={!amount || parseFloat(amount) <= 0}
            style={{
              marginTop: 20, width: '100%',
              padding: '16px 0', borderRadius: 14, border: 'none',
              background: amount && parseFloat(amount) > 0
                ? `linear-gradient(135deg, ${C.gold}, ${C.goldBright}, #e8a020)`
                : 'rgba(255,255,255,0.05)',
              color: amount && parseFloat(amount) > 0 ? '#0a0008' : C.textDim,
              fontSize: 15, fontWeight: 900, letterSpacing: 2,
              cursor: amount && parseFloat(amount) > 0 ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s',
              boxShadow: amount && parseFloat(amount) > 0 ? `0 4px 24px ${C.gold}44` : 'none',
              textTransform: 'uppercase',
            }}
          >
            {actionLabel}
          </button>
          {selected && (
            <div style={{ marginTop: 12, fontSize: 11, color: C.textDim, textAlign: 'center' }}>
              Limits: ${selected.min.toLocaleString()} – ${selected.max.toLocaleString()} COINS per transaction
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function WalletPage() {
  const router = useRouter();
  const [balance, setBalance] = useState<string | null>(null);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [bonusState, setBonusState] = useState<'idle' | 'claiming' | 'claimed' | 'error'>('idle');
  const [bonusError, setBonusError] = useState('');
  const [token, setToken] = useState<string | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<MainTab>('deposit');
  const [depositMethod, setDepositMethod] = useState<string | null>(null);
  const [withdrawMethod, setWithdrawMethod] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  useEffect(() => {
    const t = sessionStorage.getItem('accessToken');
    if (!t) { router.replace('/login'); return; }
    setToken(t);
    Promise.all([userApi.getWallet(t), userApi.getLedger(t, 1, 20)])
      .then(([wallet, ledger]) => {
        setBalance(wallet.balance);
        setEntries(ledger.entries);
        setTotalPages(ledger.pagination.totalPages);
        setLoading(false);
      })
      .catch(() => { router.replace('/login'); });
  }, [router]);

  const loadPage = useCallback((p: number) => {
    if (!token) return;
    userApi.getLedger(token, p, 20).then((ledger) => {
      setEntries(ledger.entries);
      setTotalPages(ledger.pagination.totalPages);
      setPage(p);
    });
  }, [token]);

  const claimBonus = async () => {
    if (!token || bonusState !== 'idle') return;
    setBonusState('claiming');
    try {
      const res = await userApi.claimDailyBonus(token);
      setBalance(res.balance);
      setBonusState('claimed');
      loadPage(1);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? '';
      setBonusError(msg.includes('already') ? 'Already claimed today — come back tomorrow!' : 'Claim failed');
      setBonusState('error');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');`}</style>
        <div style={{
          width: 60, height: 60, borderRadius: '50%',
          border: `3px solid ${C.cardBorder}`,
          borderTop: `3px solid ${C.gold}`,
          animation: 'spin 0.8s linear infinite',
        }} />
        <div style={{ color: C.textDim, fontSize: 13, letterSpacing: 4, fontFamily: "'Outfit', sans-serif" }}>LOADING WALLET…</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const credits = entries.filter(e => e.type === 'CREDIT').reduce((s, e) => s + parseFloat(e.amount), 0);
  const debits = entries.filter(e => e.type === 'DEBIT').reduce((s, e) => s + parseFloat(e.amount), 0);

  const tabs: { id: MainTab; label: string }[] = [
    { id: 'deposit', label: 'Deposit' },
    { id: 'withdraw', label: 'Withdraw' },
    { id: 'transactions', label: 'Transactions' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Outfit', sans-serif", color: C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');
        *{box-sizing:border-box;}
        input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
        input[type=number]{-moz-appearance:textfield}
        @keyframes fadeSlideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
      `}</style>

      {/* ── Sticky Navbar ─────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: `${C.surface}e0`,
        backdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${C.cardBorder}`,
        padding: '0 24px',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => router.push('/')} style={{
            background: 'none', border: 'none', color: C.textDim, cursor: 'pointer',
            fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, letterSpacing: 1,
            padding: '8px 12px', borderRadius: 8, transition: 'color 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = C.text; }}
            onMouseLeave={e => { e.currentTarget.style.color = C.textDim; }}
          >
            ← BACK TO LOBBY
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: `linear-gradient(135deg, ${C.gold}, ${C.purple})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14,
            }}>♦</div>
            <div style={{
              fontSize: 18, fontWeight: 900, letterSpacing: 2,
              background: `linear-gradient(90deg, ${C.gold}, ${C.goldBright})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              NEON PALACE
            </div>
          </div>

          <div style={{ fontSize: 12, color: C.textDim, letterSpacing: 1 }}>CASHIER</div>
        </div>
      </nav>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* ── Hero Balance Card ───────────────────────────────────────────── */}
        <div style={{
          background: `linear-gradient(135deg, #1e0042 0%, #130028 40%, #0a0018 100%)`,
          border: `1px solid ${C.gold}33`,
          borderRadius: 28,
          padding: '44px 48px',
          marginBottom: 32,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: `0 0 80px ${C.purple}22, 0 30px 80px rgba(0,0,0,0.7)`,
        }}>
          {/* Background orbs */}
          <div style={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: '50%', background: `radial-gradient(circle, ${C.gold}18, transparent 70%)`, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -60, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${C.purple}18, transparent 70%)`, pointerEvents: 'none' }} />

          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 11, color: C.textDim, letterSpacing: 5, fontWeight: 700, marginBottom: 12 }}>TOTAL BALANCE</div>
            <div style={{
              fontSize: 'clamp(52px, 9vw, 90px)',
              fontWeight: 900,
              background: `linear-gradient(135deg, ${C.goldBright} 0%, ${C.gold} 50%, #b8891e 100%)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              lineHeight: 1, letterSpacing: -2,
              textShadow: 'none',
              filter: 'drop-shadow(0 0 20px rgba(212,168,72,0.5))',
            }}>
              {parseFloat(balance ?? '0').toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: 13, color: C.gold, letterSpacing: 6, fontWeight: 700, marginTop: 6 }}>COINS</div>

            <div style={{ display: 'flex', gap: 40, marginTop: 32 }}>
              <div>
                <div style={{ fontSize: 10, color: C.textDim, letterSpacing: 3, marginBottom: 6 }}>CREDITED (PAGE)</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: C.green }}>
                  +{credits.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div style={{ width: 1, background: C.cardBorder }} />
              <div>
                <div style={{ fontSize: 10, color: C.textDim, letterSpacing: 3, marginBottom: 6 }}>DEBITED (PAGE)</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: C.red }}>
                  -{debits.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <button
                  onClick={claimBonus}
                  disabled={bonusState !== 'idle'}
                  style={{
                    padding: '12px 24px', borderRadius: 12, border: 'none',
                    cursor: bonusState === 'idle' ? 'pointer' : 'not-allowed',
                    background: bonusState === 'claimed'
                      ? `linear-gradient(135deg, ${C.green}, #00aa55)`
                      : bonusState === 'error'
                      ? `rgba(255,68,102,0.3)`
                      : bonusState === 'claiming'
                      ? `${C.gold}66`
                      : `linear-gradient(135deg, ${C.gold}, ${C.goldBright})`,
                    color: bonusState === 'idle' ? '#0a0008' : '#fff',
                    fontSize: 12, fontWeight: 900, letterSpacing: 2,
                    transition: 'all 0.3s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {bonusState === 'claiming' ? 'CLAIMING…'
                    : bonusState === 'claimed' ? '✓ CLAIMED'
                    : bonusState === 'error' ? bonusError.split('—')[0]?.trim() ?? 'UNAVAILABLE'
                    : '🎁 CLAIM DAILY'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tab Pills ──────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', gap: 6, marginBottom: 28,
          background: C.card, border: `1px solid ${C.cardBorder}`,
          borderRadius: 50, padding: 4, width: 'fit-content',
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 28px', borderRadius: 50, border: 'none',
                background: activeTab === tab.id
                  ? `linear-gradient(135deg, ${C.gold}, ${C.goldBright})`
                  : 'transparent',
                color: activeTab === tab.id ? '#0a0008' : C.textDim,
                fontSize: 13, fontWeight: activeTab === tab.id ? 900 : 600,
                letterSpacing: 1, cursor: 'pointer', transition: 'all 0.25s',
                boxShadow: activeTab === tab.id ? `0 2px 16px ${C.gold}44` : 'none',
              }}
            >
              {tab.label.toUpperCase()}
            </button>
          ))}
        </div>

        {/* ── Deposit Tab ────────────────────────────────────────────────── */}
        {activeTab === 'deposit' && (
          <div style={{ animation: 'fadeSlideUp 0.35s ease' }}>
            <div style={{
              background: C.card, border: `1px solid ${C.cardBorder}`,
              borderRadius: 24, padding: '32px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
            }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 6 }}>Select Payment Method</div>
                <div style={{ fontSize: 13, color: C.textDim }}>Choose how you want to deposit funds into your Neon Palace wallet.</div>
              </div>
              <PaymentMethodGrid
                selectedMethod={depositMethod}
                onSelect={id => setDepositMethod(id === depositMethod ? null : id)}
                amount={depositAmount}
                onAmountChange={setDepositAmount}
                onAction={() => { /* deposit logic placeholder */ }}
                actionLabel={`Deposit ${depositAmount ? parseFloat(depositAmount).toLocaleString() : ''} Coins Now`}
              />
            </div>
          </div>
        )}

        {/* ── Withdraw Tab ───────────────────────────────────────────────── */}
        {activeTab === 'withdraw' && (
          <div style={{ animation: 'fadeSlideUp 0.35s ease' }}>
            <div style={{
              background: C.card, border: `1px solid ${C.cardBorder}`,
              borderRadius: 24, padding: '32px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
            }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 6 }}>Withdraw Funds</div>
                <div style={{ fontSize: 13, color: C.textDim }}>Select your withdrawal method. Processing times vary by method.</div>
              </div>
              <PaymentMethodGrid
                selectedMethod={withdrawMethod}
                onSelect={id => setWithdrawMethod(id === withdrawMethod ? null : id)}
                amount={withdrawAmount}
                onAmountChange={setWithdrawAmount}
                onAction={() => { /* withdraw logic placeholder */ }}
                actionLabel={`Withdraw ${withdrawAmount ? parseFloat(withdrawAmount).toLocaleString() : ''} Coins Now`}
              />
            </div>
          </div>
        )}

        {/* ── Transactions Tab ───────────────────────────────────────────── */}
        {activeTab === 'transactions' && (
          <div style={{ animation: 'fadeSlideUp 0.35s ease' }}>
            <div style={{
              background: C.card, border: `1px solid ${C.cardBorder}`,
              borderRadius: 24, overflow: 'hidden',
              boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
            }}>
              {/* Table header */}
              <div style={{
                padding: '20px 28px',
                borderBottom: `1px solid ${C.cardBorder}`,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr',
                gap: 16,
              }}>
                {['Date', 'Type', 'Amount', 'Balance After'].map(h => (
                  <div key={h} style={{ fontSize: 10, color: C.textDim, letterSpacing: 3, fontWeight: 700 }}>{h}</div>
                ))}
              </div>

              {entries.length === 0 ? (
                <div style={{ padding: '64px 28px', textAlign: 'center', color: C.textDim }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                  No transactions yet
                </div>
              ) : (
                entries.map((entry, i) => (
                  <div key={entry.id} style={{
                    padding: '16px 28px',
                    borderBottom: i < entries.length - 1 ? `1px solid ${C.cardBorder}33` : 'none',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr 1fr',
                    gap: 16,
                    alignItems: 'center',
                    background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.012)',
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.012)'; }}
                  >
                    <div>
                      <div style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>{formatDate(entry.createdAt)}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                        background: entry.type === 'CREDIT' ? `${C.green}20` : `${C.red}20`,
                        border: `1px solid ${entry.type === 'CREDIT' ? C.green : C.red}40`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12,
                      }}>
                        {entryIcon(entry)}
                      </div>
                      <div style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>{entryLabel(entry)}</div>
                    </div>
                    <div style={{
                      fontSize: 15, fontWeight: 800,
                      color: entry.type === 'CREDIT' ? C.green : C.red,
                    }}>
                      {entry.type === 'CREDIT' ? '+' : '-'}{parseFloat(entry.amount).toFixed(2)}
                    </div>
                    <div style={{ fontSize: 12, color: C.textDim }}>
                      {parseFloat(entry.balanceAfter).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                ))
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{
                  padding: '16px 28px', borderTop: `1px solid ${C.cardBorder}`,
                  display: 'flex', justifyContent: 'center', gap: 6, alignItems: 'center',
                }}>
                  <button
                    onClick={() => loadPage(page - 1)} disabled={page <= 1}
                    style={{
                      padding: '8px 16px', borderRadius: 8, border: `1px solid ${C.cardBorder}`,
                      background: 'transparent', color: page <= 1 ? C.textDim : C.text,
                      cursor: page <= 1 ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700,
                    }}
                  >← PREV</button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                    return (
                      <button key={p} onClick={() => loadPage(p)} style={{
                        padding: '8px 14px', borderRadius: 8,
                        border: `1px solid ${p === page ? C.gold : C.cardBorder}`,
                        background: p === page ? `${C.gold}22` : 'transparent',
                        color: p === page ? C.gold : C.textDim,
                        cursor: 'pointer', fontSize: 13, fontWeight: p === page ? 800 : 600,
                      }}>{p}</button>
                    );
                  })}
                  <button
                    onClick={() => loadPage(page + 1)} disabled={page >= totalPages}
                    style={{
                      padding: '8px 16px', borderRadius: 8, border: `1px solid ${C.cardBorder}`,
                      background: 'transparent', color: page >= totalPages ? C.textDim : C.text,
                      cursor: page >= totalPages ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700,
                    }}
                  >NEXT →</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Quick Actions ──────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginTop: 28 }}>
          {[
            { label: 'Play Neon Palace', icon: '🎰', action: () => router.push('/games/neon-palace'), color: C.purple },
            { label: 'Leaderboard', icon: '🏆', action: () => router.push('/leaderboard'), color: C.gold },
            { label: 'VIP Club', icon: '💎', action: () => router.push('/vip'), color: C.cyan },
            { label: 'Dashboard', icon: '👤', action: () => router.push('/dashboard'), color: C.magenta },
          ].map(({ label, icon, action, color }) => (
            <button key={label} onClick={action} style={{
              background: C.card, border: `1px solid ${C.cardBorder}`,
              borderRadius: 14, padding: '16px 20px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 10,
              color: C.text, fontSize: 13, fontWeight: 700, letterSpacing: 0.3,
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = `${color}12`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.cardBorder; e.currentTarget.style.background = C.card; }}
            >
              <span style={{ fontSize: 18 }}>{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
