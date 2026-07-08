'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles, Wallet, Bell, User, ArrowDownLeft, Gift, X, CheckCircle2 } from 'lucide-react';
import { CoinIcon } from '../icons';
import { userApi } from '../../../lib/api-user';

const COIN_PACKS = [10_000, 50_000, 250_000, 1_000_000];

export default function TopBar() {
  const [megapool, setMegapool] = useState(154_289_520);
  const [balance, setBalance] = useState(10_000);
  const [username, setUsername] = useState<string | null>(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const [pack, setPack] = useState(COIN_PACKS[1]);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setMegapool(v => v + Math.floor(Math.random() * 900 + 50));
    }, 2200);

    const token = sessionStorage.getItem('accessToken');
    if (token) {
      Promise.all([userApi.getProfile(token), userApi.getWallet(token)])
        .then(([profile, wallet]) => {
          setUsername(profile.username);
          setBalance(Math.floor(parseFloat(wallet.balance)));
        })
        .catch(() => {});
    }
    return () => clearInterval(timer);
  }, []);

  const handleTopUp = () => {
    setIsClaiming(true);
    // Social casino: coins are virtual and free — server credits when logged in,
    // otherwise this is a local demo balance only.
    const token = sessionStorage.getItem('accessToken');
    const finish = (amount: number) => {
      setBalance(b => b + amount);
      setIsClaiming(false);
      setClaimed(true);
    };
    if (token) {
      userApi
        .claimDailyBonus(token)
        .then(res => finish(Math.floor(parseFloat(res.bonusAmount))))
        .catch(() => finish(pack));
    } else {
      setTimeout(() => finish(pack), 1200);
    }
  };

  const closeModal = () => {
    setShowTopUp(false);
    setClaimed(false);
  };

  return (
    <header className="h-20 bg-zinc-950 border-b border-white/10 flex items-center justify-between px-4 md:px-8 select-none z-20 relative">
      {/* MEGAPOOL */}
      <div className="hidden lg:flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-[#d4af37] animate-pulse" />
        <div className="text-left">
          <span className="text-[10px] text-white/30 uppercase font-black tracking-wider block">NEON PALACE MEGAPOOL</span>
          <span className="font-display text-base font-black text-[#d4af37] drop-shadow-[0_0_10px_rgba(212,175,55,0.3)] flex items-center gap-1.5">
            {megapool.toLocaleString('en-US')} <CoinIcon size={14} />
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4 ml-auto">
        {/* BALANCE HUB */}
        <div className="bg-zinc-900/60 border border-white/5 rounded-xl px-3 md:px-4 py-2 flex items-center gap-3 shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
          <div className="p-1.5 rounded-lg bg-[#8b5cf6]/10 text-[#c4b5fd]">
            <Wallet className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="text-[9px] text-white/40 uppercase font-black tracking-widest block leading-none">BAKİYE (COIN)</span>
            <span className="font-display text-base font-black text-white leading-none mt-1 flex items-center gap-1">
              {balance.toLocaleString('en-US')} <CoinIcon size={13} />
            </span>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => setShowTopUp(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#a16207] hover:from-[#e8cd6b] hover:to-[#d4af37] text-black font-semibold text-xs flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer shadow-[0_4px_15px_rgba(212,175,55,0.15)]"
          >
            <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
            Coin Yükle
          </button>
          <Link
            href="/promotions"
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
          >
            <Gift className="w-4 h-4 text-white/50" />
            Bonuslar
          </Link>
        </div>

        {/* NOTIFICATIONS + PROFILE */}
        <div className="flex items-center gap-3 border-l border-white/10 pl-3 md:pl-4">
          <Link
            href="/notifications"
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
          </Link>
          <Link href={username ? '/profile' : '/login'} className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8b5cf6] to-[#e8cd6b] p-0.5 shadow-[0_0_12px_rgba(139,92,246,0.3)]">
              <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
                <User className="w-4 h-4 text-[#d4af37]" />
              </div>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-white text-xs font-bold font-display leading-none">{username ?? 'Misafir'}</p>
              <span className="text-[9px] uppercase font-bold tracking-wider text-[#d4af37]">
                {username ? 'VIP Üye' : 'Giriş Yap'}
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* COIN TOP-UP MODAL (virtual currency only — no payment) */}
      <AnimatePresence>
        {showTopUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl p-6 shadow-[0_25px_50px_rgba(0,0,0,0.8)]"
            >
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h3 className="font-display text-lg font-bold text-white tracking-wide">Coin Yükleme Merkezi</h3>
                  <p className="text-white/45 text-xs">Sanal coin — tamamen ücretsiz, gerçek para değildir.</p>
                </div>
                <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!claimed ? (
                <div className="space-y-4 text-left">
                  <div>
                    <label className="text-white/40 text-[9px] uppercase font-bold tracking-wider">Coin Paketi Seç</label>
                    <div className="grid grid-cols-4 gap-2 mt-1">
                      {COIN_PACKS.map(val => (
                        <button
                          key={val}
                          onClick={() => setPack(val)}
                          className={`py-2.5 rounded-lg border text-[11px] font-bold transition-all flex flex-col items-center gap-0.5 ${
                            pack === val
                              ? 'bg-[#d4af37] text-black border-transparent'
                              : 'bg-zinc-900/60 border-white/5 text-white/60 hover:border-white/15'
                          }`}
                        >
                          <CoinIcon size={12} />
                          {val >= 1_000_000 ? `${val / 1_000_000}M` : `${val / 1000}K`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-3.5 text-[11px] text-white/50 leading-relaxed">
                    Neon Palace bir <b className="text-white/80">sosyal casinodur</b>. Coinler yalnızca eğlence
                    amaçlıdır, satın alınamaz ve paraya çevrilemez. Giriş yaptıysan günlük bonusun hesabına eklenir.
                  </div>

                  <button
                    onClick={handleTopUp}
                    disabled={isClaiming}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#a16207] hover:from-[#e8cd6b] hover:to-[#d4af37] text-black font-display font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                  >
                    {isClaiming ? 'COINLER YÜKLENİYOR...' : 'COINLERI AL'}
                  </button>
                </div>
              ) : (
                <div className="py-6 text-center space-y-4">
                  <CheckCircle2 className="w-14 h-14 text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.4)] mx-auto" />
                  <div>
                    <h4 className="font-display text-lg font-bold text-white tracking-wide">Coinler Yüklendi!</h4>
                    <p className="text-white/40 text-xs mt-1">Bakiyene eklendi. İyi eğlenceler!</p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-colors"
                  >
                    Kapat
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
