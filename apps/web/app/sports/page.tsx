'use client';

import Link from 'next/link';
import { TrendingUp, ArrowLeft } from 'lucide-react';

export default function SportsPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#8b5cf6]/20 to-[#d4af37]/20 border border-white/10 flex items-center justify-center mb-5">
        <TrendingUp className="w-8 h-8 text-[#8b5cf6]" />
      </div>
      <h1 className="font-display text-2xl md:text-3xl font-black text-white tracking-wide">SPOR BAHİSLERİ</h1>
      <p className="text-white/45 text-sm mt-2 max-w-md">
        Sanal coin ile spor tahmin ligi çok yakında burada — canlı maç kartları, kupon ve kombine oranlar.
      </p>
      <span className="mt-4 text-[10px] font-black uppercase tracking-widest text-green-400 bg-green-600/10 border border-green-500/20 px-3 py-1 rounded-full animate-pulse">
        YAKINDA
      </span>
      <Link
        href="/"
        className="mt-8 flex items-center gap-2 text-xs font-semibold text-white/60 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Lobiye Dön
      </Link>
    </div>
  );
}
