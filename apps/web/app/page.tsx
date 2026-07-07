'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Play, Flame, Tv, Gift, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { CoinIcon } from './components/icons';
import {
  SLIDER_GAMES,
  PROMO_CARDS,
  CATEGORIES_LIST,
  CATEGORY_MAP,
  HERO_SLIDES,
  LIVE_CASINO_GAMES,
  PROVIDERS,
  type SliderGame,
} from './components/lobby/data';
import { GAME_ARTS, StarBackground, WelcomePromoArt, ReloadPromoArt, VIPPromoArt } from './components/lobby/art';
import LiveSupportWidget from './components/lobby/LiveSupportWidget';

const PLAYABLE_GAMES = new Set([
  'atlas-reef', 'ember-falls', 'sugar-realm',
  'pyramid-quest', 'neon-palace', 'lucky-7s', 'blackjack-pro', 'cyber-roulette',
  'dragons-fortune', 'crystal-caverns', 'solar-wilds', 'starburst',
  'gonzo-quest', 'book-of-dead', 'golden-vault', 'olympus-strikes',
  'mega-moolah', 'lightning-roulette', 'crazy-time',
  'baccarat', 'dragon-fortune', 'fruit-frenzy', 'pharaohs-treasure', 'video-poker',
]);

const PROMO_ARTS: Record<string, () => JSX.Element> = {
  welcome: WelcomePromoArt,
  reload: ReloadPromoArt,
  'vip-cashback': VIPPromoArt,
};

const CATEGORY_LABELS: Record<string, string> = {
  All: 'Tümü',
  Slots: 'Slotlar',
  Table: 'Masa Oyunları',
  Live: 'Canlı',
  Jackpots: 'Jackpotlar',
  New: 'Yeni',
  Popular: 'Popüler',
};

// ─────────────────────────────────────────────────────────────────────────────
// SUIT JACKPOT TICKER (progressive pools, EGT style)
// ─────────────────────────────────────────────────────────────────────────────

function JackpotTicker() {
  const [pools, setPools] = useState({ spades: 458_124, hearts: 87_922, diamonds: 12_450, clubs: 1_420 });

  useEffect(() => {
    const t = setInterval(() => {
      setPools(p => ({
        spades: p.spades + Math.floor(Math.random() * 12 + 2),
        hearts: p.hearts + Math.floor(Math.random() * 6 + 1),
        diamonds: p.diamonds + Math.floor(Math.random() * 3 + 1),
        clubs: p.clubs + (Math.random() < 0.5 ? 1 : 0),
      }));
    }, 2500);
    return () => clearInterval(t);
  }, []);

  const entries: { suit: string; tone: string; valueTone: string; value: number }[] = [
    { suit: '♠', tone: 'text-zinc-500', valueTone: 'text-indigo-400', value: pools.spades },
    { suit: '♥', tone: 'text-red-500', valueTone: 'text-rose-400', value: pools.hearts },
    { suit: '♦', tone: 'text-amber-500', valueTone: 'text-amber-400', value: pools.diamonds },
    { suit: '♣', tone: 'text-green-500', valueTone: 'text-green-400', value: pools.clubs },
  ];

  return (
    <div className="mx-auto w-fit max-w-full flex gap-2 md:gap-4 bg-zinc-950/85 border border-amber-500/20 px-3 md:px-5 py-1.5 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.6)] backdrop-blur-md overflow-x-auto scrollbar-none">
      {entries.map((e, i) => (
        <div
          key={e.suit}
          className={`flex items-center gap-1.5 text-[10px] md:text-xs whitespace-nowrap ${i > 0 ? 'border-l border-white/10 pl-2 md:pl-4' : ''}`}
        >
          <span className={`${e.tone} font-bold`}>{e.suit}</span>
          <span className={`${e.valueTone} font-mono font-black flex items-center gap-1`}>
            {e.value.toLocaleString('en-US')} <CoinIcon size={10} />
          </span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO BANNER
// ─────────────────────────────────────────────────────────────────────────────

function HeroBanner() {
  const router = useRouter();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex(i => (i + 1) % HERO_SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);

  const slide = HERO_SLIDES[index];

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/10 h-56 md:h-72" style={{ background: slide.bg }}>
      <div
        className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-[100px] pointer-events-none"
        style={{ background: slide.glowColor }}
      />
      <div key={slide.id} className="relative z-10 h-full flex flex-col justify-center px-6 md:px-12 animate-[heroSlide_0.5s_ease]">
        <span
          className="text-[10px] md:text-xs uppercase font-black tracking-[3px] mb-2"
          style={{ color: slide.accentColor }}
        >
          {slide.subtitle}
        </span>
        <h1 className="font-display text-3xl md:text-5xl font-black text-white tracking-wide drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
          {slide.title}
        </h1>
        <p className="text-white/60 text-xs md:text-sm mt-2 max-w-md">{slide.desc}</p>
        <button
          onClick={() => router.push(slide.ctaLink)}
          className="mt-5 w-fit px-7 py-3 rounded-xl bg-gradient-to-r from-[#e9c349] to-[#ca801e] hover:from-[#ffe088] hover:to-[#e9c349] text-black font-display font-black text-xs uppercase tracking-widest transition-all hover:scale-105 shadow-[0_4px_20px_rgba(233,195,73,0.25)]"
        >
          {slide.cta}
        </button>
      </div>

      {/* Dots + arrows */}
      <div className="absolute bottom-4 right-5 z-20 flex items-center gap-2">
        <button
          onClick={() => setIndex(i => (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
          className="p-1.5 rounded-lg bg-black/40 border border-white/10 text-white/60 hover:text-white transition-colors"
          aria-label="Önceki"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {HERO_SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setIndex(i)}
            aria-label={s.title}
            className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-[#e9c349]' : 'w-1.5 bg-white/25 hover:bg-white/50'}`}
          />
        ))}
        <button
          onClick={() => setIndex(i => (i + 1) % HERO_SLIDES.length)}
          className="p-1.5 rounded-lg bg-black/40 border border-white/10 text-white/60 hover:text-white transition-colors"
          aria-label="Sonraki"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GAME CARD
// ─────────────────────────────────────────────────────────────────────────────

function GameCard({ game, onUnderConstruction }: { game: SliderGame; onUnderConstruction: (name: string) => void }) {
  const router = useRouter();
  const Art = GAME_ARTS[game.id];

  const handlePlay = () => {
    if (PLAYABLE_GAMES.has(game.id)) router.push(`/games/${game.id}`);
    else onUnderConstruction(game.name);
  };

  const badgeTone =
    game.badge === 'LIVE' ? 'bg-green-600/90' :
    game.badge === 'HOT' ? 'bg-red-600/90' :
    game.badge === 'NEW' || game.badge === 'YENİ' ? 'bg-[#7c3aed]/90' :
    game.badge === 'MEGA' ? 'bg-orange-600/90' : 'bg-[#e9c349]/90 text-black';

  return (
    <div
      onClick={handlePlay}
      className="group relative rounded-2xl bg-zinc-900/40 border border-white/5 overflow-hidden transition-all duration-300 hover:border-[#a078ff]/30 hover:shadow-[0_10px_30px_rgba(160,120,255,0.08)] hover:-translate-y-1 cursor-pointer flex flex-col"
    >
      {/* Art banner */}
      <div className="relative aspect-[4/5] overflow-hidden" style={{ background: game.bg }}>
        <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-500">
          {Art ? <Art /> : null}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        <span className={`absolute top-3 left-3 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-lg ${badgeTone}`}>
          {game.badge}
        </span>
        <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-[#e9c349] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#e9c349]/25">
          RTP {game.rtp}
        </span>

        {/* Hover play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
          <span className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#a078ff] to-[#b691ff] text-black font-black text-xs uppercase tracking-wider shadow-[0_4px_20px_rgba(160,120,255,0.4)] scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-3.5 h-3.5 fill-black" /> OYNA
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="p-3.5">
        <h3 className="font-display text-sm font-bold text-white tracking-wide truncate">{game.name}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-white/40 truncate">{game.provider}</span>
          <span className="text-[10px] text-[#d0bcff] font-medium">{game.category}</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOBBY PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function LobbyPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [overlayGame, setOverlayGame] = useState<string | null>(null);
  const [promoIndex, setPromoIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPromoIndex(i => (i + 1) % PROMO_CARDS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const visibleGames = useMemo(() => {
    const ids = new Set(CATEGORY_MAP[activeCategory] ?? []);
    return SLIDER_GAMES.filter(g => {
      if (!ids.has(g.id)) return false;
      if (searchQuery && !g.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="relative min-h-full">
      <StarBackground />
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-[#a078ff]/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-5 space-y-8 pb-16">
        {/* PROGRESSIVE JACKPOT POOLS */}
        <JackpotTicker />

        {/* HERO */}
        <HeroBanner />

        {/* GAME LOBBY */}
        <section id="games" className="scroll-mt-24">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white tracking-wide flex items-center gap-2.5">
                <Flame className="w-6 h-6 text-[#e9c349]" /> OYUN LOBİSİ
              </h2>
              <p className="text-white/40 text-xs md:text-sm mt-1">
                Gerçek RTP matematiği ile kalibre edilmiş, tamamen ücretsiz sosyal slotlar.
              </p>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Oyun ara..."
                className="w-full bg-zinc-900/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#a078ff]/50 transition-all"
              />
            </div>
          </div>

          {/* Category chips */}
          <div className="flex gap-2 mt-5 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES_LIST.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-[#a078ff] to-[#d0bcff] text-black border-transparent shadow-[0_0_15px_rgba(160,120,255,0.35)]'
                    : 'bg-zinc-900/40 border-white/5 text-white/60 hover:text-white hover:border-white/15'
                }`}
              >
                {CATEGORY_LABELS[cat] ?? cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-5">
            {visibleGames.map(game => (
              <GameCard key={game.id} game={game} onUnderConstruction={setOverlayGame} />
            ))}
          </div>
          {visibleGames.length === 0 && (
            <div className="text-center py-16 text-white/35 text-sm">Aramanla eşleşen oyun bulunamadı.</div>
          )}
        </section>

        {/* LIVE CASINO */}
        <section id="live" className="scroll-mt-24">
          <h2 className="font-display text-2xl font-bold text-white tracking-wide flex items-center gap-2.5">
            <Tv className="w-6 h-6 text-[#a078ff]" /> CANLI CASINO SALONU
          </h2>
          <p className="text-white/40 text-xs md:text-sm mt-1">Canlı masa hissi — krupiye animasyonlu stüdyo masaları.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
            {LIVE_CASINO_GAMES.map(game => (
              <div
                key={game.id}
                onClick={() => router.push(`/games/${game.id}`)}
                className="group rounded-2xl bg-zinc-900/40 border border-white/5 p-5 cursor-pointer transition-all hover:border-[#a078ff]/30 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-400 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-[liveDot_1.5s_ease_infinite]" /> CANLI
                  </span>
                  <span className="text-[10px] text-white/40">{game.players} oyuncu</span>
                </div>
                <h3 className="font-display text-base font-bold text-white mt-3 truncate">{game.name}</h3>
                <p className="text-[11px] text-white/40 mt-0.5">{game.provider}</p>
                <div
                  className="mt-4 h-1 rounded-full"
                  style={{ background: `linear-gradient(90deg, ${game.color}, transparent)` }}
                />
              </div>
            ))}
          </div>
        </section>

        {/* PROMOTIONS */}
        <section>
          <h2 className="font-display text-2xl font-bold text-white tracking-wide flex items-center gap-2.5">
            <Gift className="w-6 h-6 text-[#e9c349]" /> PROMOSYONLAR
          </h2>
          <div className="relative rounded-2xl overflow-hidden border mt-5 h-44 md:h-48 transition-all"
            style={{ background: PROMO_CARDS[promoIndex].bg, borderColor: PROMO_CARDS[promoIndex].border }}
          >
            {(() => {
              const promo = PROMO_CARDS[promoIndex];
              const PromoArt = PROMO_ARTS[promo.id];
              return (
                <div key={promo.id} className="h-full flex flex-col justify-center px-6 md:px-10 animate-[heroSlide_0.45s_ease] relative">
                  <span className="text-[9px] uppercase font-black tracking-[2px] mb-1.5" style={{ color: promo.accent }}>
                    {promo.tag}
                  </span>
                  <h3 className="font-display text-xl md:text-2xl font-black text-white">{promo.title}</h3>
                  <p className="text-white/60 text-xs mt-1">{promo.subtitle} — {promo.detail}</p>
                  <button
                    onClick={() => router.push('/promotions')}
                    className="mt-4 w-fit px-5 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider text-black transition-transform hover:scale-105"
                    style={{ background: promo.accent }}
                  >
                    {promo.cta}
                  </button>
                  <div className="hidden md:block">{PromoArt ? <PromoArt /> : null}</div>
                </div>
              );
            })()}
            <div className="absolute bottom-3 right-4 flex gap-1.5">
              {PROMO_CARDS.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setPromoIndex(i)}
                  aria-label={p.title}
                  className={`h-1.5 rounded-full transition-all ${i === promoIndex ? 'w-5 bg-white/80' : 'w-1.5 bg-white/25'}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* PROVIDERS MARQUEE */}
        <section className="border-t border-white/5 pt-6 overflow-hidden">
          <div className="flex gap-10 w-max animate-[providerScroll_28s_linear_infinite]">
            {[...PROVIDERS, ...PROVIDERS].map((p, i) => (
              <span key={i} className="text-white/25 text-xs font-black uppercase tracking-[3px] whitespace-nowrap">
                {p}
              </span>
            ))}
          </div>
        </section>
      </div>

      {/* UNDER CONSTRUCTION OVERLAY */}
      {overlayGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setOverlayGame(null)}>
          <div className="w-full max-w-sm bg-zinc-950 border border-white/10 rounded-2xl p-6 text-center" onClick={e => e.stopPropagation()}>
            <div className="flex justify-end">
              <button onClick={() => setOverlayGame(null)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <h3 className="font-display text-lg font-bold text-white">{overlayGame}</h3>
            <p className="text-white/45 text-xs mt-2">Bu oyun şu anda yapım aşamasında. Çok yakında Forge kalitesiyle burada!</p>
          </div>
        </div>
      )}

      <LiveSupportWidget />
    </div>
  );
}
