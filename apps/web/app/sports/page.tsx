'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TrendingUp, Trash2, Ticket, CircleDot } from 'lucide-react';
import { CoinIcon } from '../components/icons';

/**
 * Virtual-coin sportsbook (social, no real money). Fixtures and teams are
 * fictional; listed odds carry a ~6% overround. Settlement is simulated:
 * each leg wins with its fair implied probability, so long-run RTP ≈ 94%.
 */

const START_BALANCE = 10_000;
const STORAGE_BAL = 'forge_sportsbook_balance';
const STORAGE_BETS = 'forge_sportsbook_bets';
const MARGIN = 0.06;
const SETTLE_MS = 45_000;

type Pick = 'home' | 'draw' | 'away';

interface Fixture {
  id: string;
  league: string;
  sport: string;
  home: string;
  away: string;
  isLive: boolean;
  minute?: number;
  homeScore?: number;
  awayScore?: number;
  time: string;
  odds: { home: number; draw?: number; away: number };
}

const FIXTURES: Fixture[] = [
  { id: 'm1', league: 'Neon Süper Lig', sport: 'Futbol', home: 'Neon Knights FC', away: 'Obsidian Athletics', isLive: true, minute: 63, homeScore: 2, awayScore: 1, time: 'CANLI', odds: { home: 1.45, draw: 4.2, away: 6.8 } },
  { id: 'm2', league: 'Neon Süper Lig', sport: 'Futbol', home: 'Violet City SK', away: 'Golden Harbor United', isLive: true, minute: 31, homeScore: 0, awayScore: 0, time: 'CANLI', odds: { home: 2.1, draw: 3.3, away: 3.4 } },
  { id: 'm3', league: 'Neon Süper Lig', sport: 'Futbol', home: 'Crimson Wolves', away: 'Azure Falcons', isLive: false, time: 'Bugün 20:45', odds: { home: 1.85, draw: 3.5, away: 4.1 } },
  { id: 'm4', league: 'Palace Basket Ligi', sport: 'Basketbol', home: 'Obsidian Titans', away: 'Neon Comets', isLive: false, time: 'Bugün 21:30', odds: { home: 1.72, away: 2.05 } },
  { id: 'm5', league: 'Palace Basket Ligi', sport: 'Basketbol', home: 'Golden Griffins BC', away: 'Violet Vipers BC', isLive: true, minute: 3, homeScore: 58, awayScore: 61, time: '3. ÇEYREK', odds: { home: 2.3, away: 1.58 } },
  { id: 'm6', league: 'Palace Tenis Kupası', sport: 'Tenis', home: 'D. Yıldırım', away: 'M. Aksoy', isLive: false, time: 'Yarın 14:00', odds: { home: 1.95, away: 1.8 } },
  { id: 'm7', league: 'Neon Siber Ligi', sport: 'Espor', home: 'Violet Vipers', away: 'Golden Griffins', isLive: true, minute: 2, homeScore: 1, awayScore: 0, time: '2. HARİTA', odds: { home: 1.62, away: 2.2 } },
  { id: 'm8', league: 'Neon Siber Ligi', sport: 'Espor', home: 'Obsidian Reapers', away: 'Chrome Phantoms', isLive: false, time: 'Cuma 19:00', odds: { home: 2.75, away: 1.42 } },
];

const SPORTS = ['Tümü', 'Futbol', 'Basketbol', 'Tenis', 'Espor'];

interface SlipItem {
  fixtureId: string;
  label: string;
  pick: Pick;
  pickName: string;
  odds: number;
}

interface PlacedBet {
  id: number;
  legs: SlipItem[];
  stake: number;
  totalOdds: number;
  placedAt: number;
  status: 'open' | 'won' | 'lost';
  payout: number;
}

function loadBets(): PlacedBet[] {
  try {
    const raw = localStorage.getItem(STORAGE_BETS);
    if (raw) return JSON.parse(raw) as PlacedBet[];
  } catch { /* fresh start */ }
  return [];
}

export default function SportsbookPage() {
  const [balance, setBalance] = useState(START_BALANCE);
  const [sport, setSport] = useState('Tümü');
  const [slip, setSlip] = useState<SlipItem[]>([]);
  const [stake, setStake] = useState(50);
  const [bets, setBets] = useState<PlacedBet[]>([]);
  const [oddsFlash, setOddsFlash] = useState(0);
  const [placedToast, setPlacedToast] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const settleBet = useCallback((betId: number) => {
    setBets((prev) => {
      const next = prev.map((bet) => {
        if (bet.id !== betId || bet.status !== 'open') return bet;
        // Each leg wins with its FAIR implied probability (margin stays with the house).
        const allWon = bet.legs.every((leg) => Math.random() < (1 - MARGIN) / leg.odds);
        const payout = allWon ? Math.round(bet.stake * bet.totalOdds) : 0;
        if (allWon) setBalance((b) => b + payout);
        return { ...bet, status: allWon ? ('won' as const) : ('lost' as const), payout };
      });
      try {
        localStorage.setItem(STORAGE_BETS, JSON.stringify(next.slice(0, 30)));
      } catch { /* quota */ }
      return next;
    });
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_BAL);
    if (saved && Number.isFinite(Number(saved))) setBalance(Number(saved));
    const loaded = loadBets();
    setBets(loaded);
    // Settle anything that was left open past its window, and schedule the rest.
    for (const bet of loaded.filter((b) => b.status === 'open')) {
      const remaining = Math.max(1000, bet.placedAt + SETTLE_MS - Date.now());
      timersRef.current.push(setTimeout(() => settleBet(bet.id), remaining));
    }
    const flash = setInterval(() => setOddsFlash((f) => f + 1), 8000);
    return () => {
      clearInterval(flash);
      timersRef.current.forEach(clearTimeout);
    };
  }, [settleBet]);

  useEffect(() => {
    localStorage.setItem(STORAGE_BAL, String(Math.round(balance)));
  }, [balance]);

  const persistBets = (next: PlacedBet[]) => {
    setBets(next);
    try {
      localStorage.setItem(STORAGE_BETS, JSON.stringify(next.slice(0, 30)));
    } catch { /* quota */ }
  };

  const toggle = (f: Fixture, pick: Pick, odds: number) => {
    const pickName = pick === 'home' ? f.home : pick === 'away' ? f.away : 'Beraberlik';
    setSlip((prev) => {
      const existing = prev.find((s) => s.fixtureId === f.id);
      if (existing?.pick === pick) return prev.filter((s) => s.fixtureId !== f.id);
      const item: SlipItem = { fixtureId: f.id, label: `${f.home} – ${f.away}`, pick, pickName, odds };
      return [...prev.filter((s) => s.fixtureId !== f.id), item];
    });
  };

  const totalOdds = useMemo(() => slip.reduce((acc, s) => acc * s.odds, 1), [slip]);
  const estPayout = Math.round(stake * totalOdds);
  const canPlace = slip.length > 0 && stake >= 10 && stake <= balance;

  const placeBet = () => {
    if (!canPlace) return;
    const bet: PlacedBet = {
      id: Date.now(),
      legs: slip,
      stake,
      totalOdds: Math.round(totalOdds * 100) / 100,
      placedAt: Date.now(),
      status: 'open',
      payout: 0,
    };
    setBalance((b) => b - stake);
    persistBets([bet, ...bets]);
    timersRef.current.push(setTimeout(() => settleBet(bet.id), SETTLE_MS));
    setSlip([]);
    setPlacedToast(true);
    setTimeout(() => setPlacedToast(false), 2500);
  };

  const visible = FIXTURES.filter((f) => sport === 'Tümü' || f.sport === sport);
  const drift = (base: number, id: string) =>
    Math.round((base + Math.sin(oddsFlash + id.charCodeAt(1)) * 0.03) * 100) / 100;

  const OddsBtn = ({ f, pick, odds, label }: { f: Fixture; pick: Pick; odds: number; label: string }) => {
    const active = slip.some((s) => s.fixtureId === f.id && s.pick === pick);
    return (
      <button
        onClick={() => toggle(f, pick, odds)}
        className={`flex-1 min-w-[64px] px-2 py-2 rounded-xl border text-center transition-all ${
          active
            ? 'bg-[#8b5cf6] border-[#8b5cf6] text-white shadow-[0_0_14px_rgba(139,92,246,0.4)]'
            : 'bg-zinc-900/60 border-white/10 text-white/80 hover:border-[#8b5cf6]/50'
        }`}
      >
        <span className="block text-[9px] uppercase tracking-wider opacity-60">{label}</span>
        <span className="block text-sm font-black">{odds.toFixed(2)}</span>
      </button>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-5">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-black text-white tracking-wide flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-[#8b5cf6]" /> SPOR BAHİSLERİ
          </h1>
          <p className="text-white/40 text-xs mt-1">
            Sanal coin tahmin ligi — kurgusal takımlar, ~%94 uzun vadeli geri dönüş. Gerçek para değildir.
          </p>
        </div>
        <div className="bg-zinc-900/60 border border-white/10 rounded-xl px-4 py-2 text-right">
          <span className="text-[9px] text-white/40 uppercase font-black tracking-widest block">SPOR BAKİYESİ</span>
          <span className="font-display text-base font-black text-[#d4af37] flex items-center gap-1">
            {balance.toLocaleString('tr-TR')} <CoinIcon size={13} />
          </span>
        </div>
      </div>

      {/* SPORT TABS */}
      <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-none pb-1">
        {SPORTS.map((s) => (
          <button
            key={s}
            onClick={() => setSport(s)}
            className={`px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap border transition-all ${
              sport === s
                ? 'bg-gradient-to-r from-[#8b5cf6] to-[#c4b5fd] text-black border-transparent'
                : 'bg-zinc-900/40 border-white/5 text-white/60 hover:text-white'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">
        {/* FIXTURES */}
        <div className="space-y-3">
          {visible.map((f) => (
            <div key={f.id} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-colors">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] text-white/35 font-bold uppercase tracking-wider">{f.league} · {f.sport}</span>
                {f.isLive ? (
                  <span className="flex items-center gap-1.5 text-[10px] font-black text-red-400 uppercase">
                    <CircleDot className="w-3 h-3 animate-pulse" /> {f.time} {f.minute ? `${f.minute}'` : ''}
                  </span>
                ) : (
                  <span className="text-[10px] text-white/40 font-bold">{f.time}</span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white flex items-center gap-2">
                    {f.home}
                    {f.isLive && <b className="text-[#d4af37]">{f.homeScore}</b>}
                  </p>
                  <p className="text-sm font-bold text-white/85 flex items-center gap-2 mt-0.5">
                    {f.away}
                    {f.isLive && <b className="text-[#d4af37]">{f.awayScore}</b>}
                  </p>
                </div>
                <div className="flex gap-2 flex-1 max-w-xs justify-end">
                  <OddsBtn f={f} pick="home" odds={drift(f.odds.home, f.id)} label="1" />
                  {f.odds.draw !== undefined && <OddsBtn f={f} pick="draw" odds={drift(f.odds.draw, f.id)} label="X" />}
                  <OddsBtn f={f} pick="away" odds={drift(f.odds.away, f.id)} label="2" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* BET SLIP + MY BETS */}
        <div className="space-y-4 lg:sticky lg:top-4">
          <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-4">
            <h3 className="font-display text-sm font-black text-white tracking-wider flex items-center gap-2 mb-3">
              <Ticket className="w-4 h-4 text-[#8b5cf6]" /> KUPON
              {slip.length > 0 && (
                <span className="ml-auto text-[10px] bg-[#8b5cf6] text-white rounded-full px-2 py-0.5">{slip.length}</span>
              )}
            </h3>

            {slip.length === 0 ? (
              <p className="text-white/35 text-xs py-4 text-center">Oran seçerek kupon oluştur.</p>
            ) : (
              <div className="space-y-2 mb-3">
                {slip.map((s) => (
                  <div key={s.fixtureId} className="bg-zinc-900/60 border border-white/5 rounded-xl p-2.5 flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-white truncate">{s.pickName}</p>
                      <p className="text-[9px] text-white/35 truncate">{s.label}</p>
                    </div>
                    <span className="text-xs font-black text-[#d4af37]">{s.odds.toFixed(2)}</span>
                    <button
                      onClick={() => setSlip((prev) => prev.filter((x) => x.fixtureId !== s.fixtureId))}
                      className="p-1 text-white/30 hover:text-red-400"
                      aria-label="Kaldır"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-4 gap-1.5 mb-2">
              {[10, 50, 100, 0].map((v) => (
                <button
                  key={v}
                  onClick={() => setStake(v === 0 ? balance : stake + v)}
                  className="py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-white/70 hover:text-white"
                >
                  {v === 0 ? 'MAX' : `+${v}`}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={stake}
              onChange={(e) => setStake(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-sm font-black text-[#d4af37] focus:outline-none focus:border-[#8b5cf6]/60"
            />

            <div className="flex justify-between items-center mt-3 text-xs">
              <span className="text-white/45">Toplam Oran</span>
              <b className="text-white">{slip.length ? totalOdds.toFixed(2) : '—'}</b>
            </div>
            <div className="flex justify-between items-center mt-1 text-xs">
              <span className="text-white/45">Olası Kazanç</span>
              <b className="text-[#d4af37] flex items-center gap-1">
                {slip.length ? estPayout.toLocaleString('tr-TR') : '—'} <CoinIcon size={11} />
              </b>
            </div>

            <button
              onClick={placeBet}
              disabled={!canPlace}
              className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] hover:from-[#a78bfa] hover:to-[#8b5cf6] text-white font-display font-black text-xs uppercase tracking-widest transition-all disabled:opacity-40"
            >
              BAHSİ OYNA
            </button>
            <p className="text-[9px] text-white/30 mt-2 text-center">Maçlar ~45 saniyede simüle sonuçlanır.</p>
          </div>

          {/* MY BETS */}
          {bets.length > 0 && (
            <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-4">
              <h3 className="font-display text-sm font-black text-white tracking-wider mb-3">BAHİSLERİM</h3>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {bets.map((b) => (
                  <div key={b.id} className="bg-zinc-900/60 border border-white/5 rounded-xl p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/45">
                        {b.legs.length > 1 ? `Kombine (${b.legs.length})` : b.legs[0]?.pickName} · {b.totalOdds.toFixed(2)}
                      </span>
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                          b.status === 'open'
                            ? 'bg-amber-500/15 text-amber-400 animate-pulse'
                            : b.status === 'won'
                              ? 'bg-green-500/15 text-green-400'
                              : 'bg-red-500/15 text-red-400'
                        }`}
                      >
                        {b.status === 'open' ? 'AÇIK' : b.status === 'won' ? 'KAZANDI' : 'KAYBETTİ'}
                      </span>
                    </div>
                    <div className="flex justify-between mt-1 text-[11px]">
                      <span className="text-white/60">{b.stake.toLocaleString('tr-TR')} yatırıldı</span>
                      {b.status === 'won' && (
                        <b className="text-green-400 flex items-center gap-1">
                          +{b.payout.toLocaleString('tr-TR')} <CoinIcon size={10} />
                        </b>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {placedToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#8b5cf6] text-white font-black text-xs tracking-wider px-6 py-2.5 rounded-full shadow-[0_8px_30px_rgba(139,92,246,0.5)] animate-[fadeIn_0.3s_ease]">
          KUPON ALINDI — SONUÇ ~45 SN
        </div>
      )}
    </div>
  );
}
