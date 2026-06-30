import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '..', '..');

// Helper to write file both to source assets/ and apps/web/public/assets/
function writeAsset(relativePath, content, isBinary = false) {
  const paths = [
    join(root, 'assets', relativePath),
    join(root, 'apps', 'web', 'public', 'assets', relativePath)
  ];

  for (const p of paths) {
    mkdirSync(dirname(p), { recursive: true });
    if (isBinary) {
      writeFileSync(p, Buffer.from(content, 'base64'));
    } else {
      writeFileSync(p, content, 'utf8');
    }
    console.log(`Placed: ${p.replace(root, '')}`);
  }
}

// ── 1. GENERATE AUDIO FILES (Tiny silent MP3s) ──────────────────────────────
// This satisfies the existsSync checks and provides real (albeit silent) assets
// that prevent browser console load errors while the SoundEngine plays synthesized overlays.
const silentMp3Base64 = '//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA';

writeAsset('neon-palace/audio/spin-start.mp3', silentMp3Base64, true);
writeAsset('neon-palace/audio/reel-stop.mp3', silentMp3Base64, true);
writeAsset('neon-palace/audio/win-small.mp3', silentMp3Base64, true);
writeAsset('neon-palace/audio/jackpot.mp3', silentMp3Base64, true);
writeAsset('neon-palace/audio/bgm.mp3', silentMp3Base64, true);

// ── 2. GENERATE GRAPHICS AS HIGH-QUALITY SVGS ────────────────────────────────

// UI Panels
const jackpotPanelSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 80" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a0030"/>
      <stop offset="100%" stop-color="#0a0015"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f4c430"/>
      <stop offset="50%" stop-color="#ffe066"/>
      <stop offset="100%" stop-color="#8a5e10"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <!-- Main Plate -->
  <rect x="5" y="5" width="490" height="70" rx="12" fill="url(#bg)" stroke="url(#gold)" stroke-width="3" filter="url(#glow)"/>
  <!-- Bevel Details -->
  <rect x="10" y="10" width="480" height="60" rx="8" fill="none" stroke="#ffe066" stroke-width="1" opacity="0.3"/>
  <circle cx="20" cy="40" r="4" fill="url(#gold)"/>
  <circle cx="480" cy="40" r="4" fill="url(#gold)"/>
</svg>`;

const betButtonSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f001b"/>
      <stop offset="100%" stop-color="#06000c"/>
    </linearGradient>
    <linearGradient id="chrome" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#9daab8"/>
      <stop offset="50%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#6b7280"/>
    </linearGradient>
  </defs>
  <circle cx="48" cy="48" r="42" fill="url(#bg)" stroke="url(#chrome)" stroke-width="4"/>
  <circle cx="48" cy="48" r="36" fill="none" stroke="#9daab8" stroke-width="1" opacity="0.4"/>
  <path d="M 30,48 L 66,48 M 48,30 L 48,66" stroke="url(#chrome)" stroke-width="6" stroke-linecap="round"/>
</svg>`;

const autoButtonSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 48" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0f001b"/>
      <stop offset="100%" stop-color="#06000c"/>
    </linearGradient>
    <linearGradient id="teal" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#00c8be"/>
      <stop offset="100%" stop-color="#004d49"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect x="3" y="3" width="114" height="42" rx="10" fill="url(#bg)" stroke="url(#teal)" stroke-width="2" filter="url(#glow)"/>
  <circle cx="28" cy="24" r="8" fill="none" stroke="#00c8be" stroke-width="2.5" stroke-dasharray="35 15"/>
  <polygon points="34,16 38,20 34,24" fill="#00c8be"/>
</svg>`;

const turboButtonSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 48" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0f001b"/>
      <stop offset="100%" stop-color="#06000c"/>
    </linearGradient>
    <linearGradient id="mag" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ff2068"/>
      <stop offset="100%" stop-color="#831843"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect x="3" y="3" width="114" height="42" rx="10" fill="url(#bg)" stroke="url(#mag)" stroke-width="2" filter="url(#glow)"/>
  <path d="M 28,12 L 18,26 L 26,26 L 20,38 L 32,22 L 24,22 Z" fill="url(#mag)" filter="url(#glow)"/>
</svg>`;

writeAsset('neon-palace/ui/jackpot-panel.svg', jackpotPanelSvg);
writeAsset('neon-palace/ui/bet-button.svg', betButtonSvg);
writeAsset('neon-palace/ui/auto-button.svg', autoButtonSvg);
writeAsset('neon-palace/ui/turbo-button.svg', turboButtonSvg);

// Symbols
const diamondSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="d1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff"/><stop offset="30%" stop-color="#dbeafe"/><stop offset="70%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>
    <linearGradient id="d2" x1="0.5" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#93c5fd"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <circle cx="256" cy="256" r="180" fill="#3b82f6" opacity="0.15" filter="url(#glow)"/>
  <polygon points="180,120 332,120 432,256 332,392 180,392 80,256" fill="url(#d1)" stroke="#93c5fd" stroke-width="6" filter="url(#glow)"/>
  <polygon points="210,150 302,150 362,256 302,362 210,362 150,256" fill="url(#d2)" opacity="0.9"/>
  <line x1="180" y1="120" x2="210" y2="150" stroke="#fff" stroke-width="4"/>
  <line x1="332" y1="120" x2="302" y2="150" stroke="#fff" stroke-width="4"/>
  <line x1="432" y1="256" x2="362" y2="256" stroke="#fff" stroke-width="4"/>
  <line x1="332" y1="392" x2="302" y2="362" stroke="#fff" stroke-width="4"/>
  <line x1="180" y1="392" x2="210" y2="362" stroke="#fff" stroke-width="4"/>
  <line x1="80" y1="256" x2="150" y2="256" stroke="#fff" stroke-width="4"/>
  <circle cx="256" cy="256" r="15" fill="#fff" filter="url(#glow)"/>
</svg>`;

const rubySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <radialGradient id="r1" cx="40%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#fee2e2"/><stop offset="15%" stop-color="#f87171"/><stop offset="55%" stop-color="#dc2626"/><stop offset="100%" stop-color="#7f1d1d"/>
    </radialGradient>
    <radialGradient id="r2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fca5a5"/><stop offset="100%" stop-color="#b91c1c"/>
    </radialGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <circle cx="256" cy="256" r="180" fill="#dc2626" opacity="0.15" filter="url(#glow)"/>
  <ellipse cx="256" cy="260" rx="160" ry="190" fill="url(#r1)" stroke="#f87171" stroke-width="6" filter="url(#glow)"/>
  <ellipse cx="256" cy="240" rx="100" ry="120" fill="url(#r2)" opacity="0.85"/>
  <path d="M 96,260 Q 256,120 416,260" fill="none" stroke="#fca5a5" stroke-width="4" opacity="0.6"/>
  <path d="M 96,260 Q 256,400 416,260" fill="none" stroke="#dc2626" stroke-width="4" opacity="0.5"/>
  <line x1="256" y1="70" x2="256" y2="240" stroke="#fca5a5" stroke-width="4" opacity="0.5"/>
  <line x1="360" y1="110" x2="256" y2="240" stroke="#fca5a5" stroke-width="4" opacity="0.5"/>
  <line x1="416" y1="260" x2="256" y2="240" stroke="#fca5a5" stroke-width="4" opacity="0.5"/>
  <circle cx="210" cy="180" r="12" fill="#fff" filter="url(#glow)"/>
</svg>`;

const emeraldSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="e1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#a7f3d0"/><stop offset="30%" stop-color="#10b981"/><stop offset="70%" stop-color="#047857"/><stop offset="100%" stop-color="#064e3b"/>
    </linearGradient>
    <linearGradient id="e2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#34d399"/><stop offset="100%" stop-color="#059669"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <circle cx="256" cy="256" r="180" fill="#10b981" opacity="0.15" filter="url(#glow)"/>
  <polygon points="140,80 372,80 440,148 440,364 372,432 140,432 72,364 72,148" fill="url(#e1)" stroke="#34d399" stroke-width="6" filter="url(#glow)"/>
  <rect x="180" y="180" width="152" height="152" rx="10" fill="url(#e2)" opacity="0.8"/>
  <circle cx="210" cy="140" r="10" fill="#fff" filter="url(#glow)"/>
</svg>`;

const sapphireSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <radialGradient id="s1" cx="40%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#e0e7ff"/><stop offset="20%" stop-color="#818cf8"/><stop offset="60%" stop-color="#4f46e5"/><stop offset="100%" stop-color="#312e81"/>
    </radialGradient>
    <radialGradient id="s2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#c7d2fe"/><stop offset="100%" stop-color="#4338ca"/>
    </radialGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <circle cx="256" cy="256" r="180" fill="#4f46e5" opacity="0.15" filter="url(#glow)"/>
  <ellipse cx="256" cy="260" rx="170" ry="150" fill="url(#s1)" stroke="#818cf8" stroke-width="6" filter="url(#glow)"/>
  <ellipse cx="256" cy="250" rx="110" ry="90" fill="url(#s2)" opacity="0.85"/>
  <circle cx="210" cy="190" r="10" fill="#fff" filter="url(#glow)"/>
</svg>`;

// Card Symbols
const aceSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="ac" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f4c430"/><stop offset="50%" stop-color="#ffe066"/><stop offset="100%" stop-color="#9a6e10"/>
    </linearGradient>
  </defs>
  <rect x="32" y="32" width="448" height="448" rx="40" fill="#0a000f" stroke="url(#ac)" stroke-width="12"/>
  <rect x="52" y="52" width="408" height="408" rx="28" fill="none" stroke="#f4c43033" stroke-width="4"/>
  <text x="256" y="340" text-anchor="middle" font-size="280" font-weight="900" fill="url(#ac)" font-family="Outfit, sans-serif">A</text>
</svg>`;

const kingSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="k1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#c4b5fd"/><stop offset="50%" stop-color="#8b5cf6"/><stop offset="100%" stop-color="#4c1d95"/>
    </linearGradient>
  </defs>
  <rect x="32" y="32" width="448" height="448" rx="40" fill="#0a000f" stroke="url(#k1)" stroke-width="12"/>
  <rect x="52" y="52" width="408" height="408" rx="28" fill="none" stroke="#8b5cf633" stroke-width="4"/>
  <text x="256" y="340" text-anchor="middle" font-size="270" font-weight="900" fill="url(#k1)" font-family="Outfit, sans-serif">K</text>
</svg>`;

const queenSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="q1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#5eead4"/><stop offset="50%" stop-color="#14b8a6"/><stop offset="100%" stop-color="#0f4c45"/>
    </linearGradient>
  </defs>
  <rect x="32" y="32" width="448" height="448" rx="40" fill="#0a000f" stroke="url(#q1)" stroke-width="12"/>
  <rect x="52" y="52" width="408" height="408" rx="28" fill="none" stroke="#14b8a633" stroke-width="4"/>
  <text x="256" y="335" text-anchor="middle" font-size="260" font-weight="900" fill="url(#q1)" font-family="Outfit, sans-serif">Q</text>
</svg>`;

const jackSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="j1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f9a8d4"/><stop offset="50%" stop-color="#ec4899"/><stop offset="100%" stop-color="#831843"/>
    </linearGradient>
  </defs>
  <rect x="32" y="32" width="448" height="448" rx="40" fill="#0a000f" stroke="url(#j1)" stroke-width="12"/>
  <rect x="52" y="52" width="408" height="408" rx="28" fill="none" stroke="#ec489933" stroke-width="4"/>
  <text x="256" y="340" text-anchor="middle" font-size="270" font-weight="900" fill="url(#j1)" font-family="Outfit, sans-serif">J</text>
</svg>`;

const tenSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="t1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#cbd5e1"/><stop offset="50%" stop-color="#94a3b8"/><stop offset="100%" stop-color="#334155"/>
    </linearGradient>
  </defs>
  <rect x="32" y="32" width="448" height="448" rx="40" fill="#0a000f" stroke="url(#t1)" stroke-width="12"/>
  <rect x="52" y="52" width="408" height="408" rx="28" fill="none" stroke="#94a3b833" stroke-width="4"/>
  <text x="256" y="325" text-anchor="middle" font-size="240" font-weight="900" fill="url(#t1)" font-family="Outfit, sans-serif">10</text>
</svg>`;

// Original classic symbols for future templates
const crownSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="cg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f4c430"/><stop offset="50%" stop-color="#ffe066"/><stop offset="100%" stop-color="#8a5e10"/>
    </linearGradient>
  </defs>
  <rect x="80" y="380" width="352" height="60" rx="15" fill="url(#cg)" stroke="#f4c430" stroke-width="4"/>
  <polygon points="80,380 80,180 160,280 256,120 352,280 432,180 432,380" fill="url(#cg)" stroke="#ffe066" stroke-width="4"/>
  <circle cx="256" cy="120" r="16" fill="#eff6ff"/>
  <circle cx="80" cy="180" r="12" fill="#eff6ff"/>
  <circle cx="432" cy="180" r="12" fill="#eff6ff"/>
</svg>`;

const sevenSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="s7" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ff2068"/><stop offset="100%" stop-color="#b91c1c"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f4c430"/><stop offset="100%" stop-color="#ffe066"/>
    </linearGradient>
  </defs>
  <polygon points="120,100 380,100 380,160 220,420 140,420 300,160 120,160" fill="url(#s7)" stroke="url(#gold)" stroke-width="12" stroke-linejoin="round"/>
</svg>`;

const barSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffe066"/><stop offset="50%" stop-color="#f4c430"/><stop offset="100%" stop-color="#8a5e10"/>
    </linearGradient>
  </defs>
  <polygon points="60,340 100,160 412,160 452,340" fill="url(#gold)" stroke="#ffe066" stroke-width="10"/>
  <line x1="100" y1="160" x2="130" y2="340" stroke="#8a5e10" stroke-width="4"/>
  <line x1="412" y1="160" x2="382" y2="340" stroke="#8a5e10" stroke-width="4"/>
</svg>`;

const starSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffe066"/><stop offset="50%" stop-color="#f4c430"/><stop offset="100%" stop-color="#8a5e10"/>
    </linearGradient>
  </defs>
  <polygon points="256,40 322,176 472,198 364,304 389,454 256,383 123,454 148,304 40,198 190,176" fill="url(#gold)" stroke="#ffe066" stroke-width="8"/>
</svg>`;

const horseshoeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="chrome" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff"/><stop offset="50%" stop-color="#9daab8"/><stop offset="100%" stop-color="#475569"/>
    </linearGradient>
  </defs>
  <path d="M 120,120 C 120,380 392,380 392,120 L 332,120 C 332,300 180,300 180,120 Z" fill="url(#chrome)" stroke="#cbd5e1" stroke-width="6"/>
  <circle cx="150" cy="180" r="8" fill="#fff"/>
  <circle cx="362" cy="180" r="8" fill="#fff"/>
  <circle cx="170" cy="250" r="8" fill="#fff"/>
  <circle cx="342" cy="250" r="8" fill="#fff"/>
</svg>`;

writeAsset('neon-palace/symbols/diamond.svg', diamondSvg);
writeAsset('neon-palace/symbols/ruby.svg', rubySvg);
writeAsset('neon-palace/symbols/emerald.svg', emeraldSvg);
writeAsset('neon-palace/symbols/sapphire.svg', sapphireSvg);
writeAsset('neon-palace/symbols/ace.svg', aceSvg);
writeAsset('neon-palace/symbols/king.svg', kingSvg);
writeAsset('neon-palace/symbols/queen.svg', queenSvg);
writeAsset('neon-palace/symbols/jack.svg', jackSvg);
writeAsset('neon-palace/symbols/ten.svg', tenSvg);
writeAsset('neon-palace/symbols/crown.svg', crownSvg);
writeAsset('neon-palace/symbols/seven.svg', sevenSvg);
writeAsset('neon-palace/symbols/bar.svg', barSvg);
writeAsset('neon-palace/symbols/star.svg', starSvg);
writeAsset('neon-palace/symbols/horseshoe.svg', horseshoeSvg);

// Effects Overlays & Particles
const bigWinOverlaySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="100%" height="100%">
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f4c430" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1080" height="1080" fill="url(#glow)"/>
  <circle cx="540" cy="540" r="100" fill="#fff" opacity="0.8" filter="blur(20px)"/>
</svg>`;

const megaWinOverlaySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="100%" height="100%">
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ff2068" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1080" height="1080" fill="url(#glow)"/>
  <circle cx="540" cy="540" r="120" fill="#fff" opacity="0.9" filter="blur(30px)"/>
</svg>`;

const epicWinOverlaySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="100%" height="100%">
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#a855f7" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1080" height="1080" fill="url(#glow)"/>
</svg>`;

const jackpotOverlaySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="100%" height="100%">
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffe066" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1080" height="1080" fill="url(#glow)"/>
</svg>`;

const coinParticleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffe066"/>
      <stop offset="50%" stop-color="#f4c430"/>
      <stop offset="100%" stop-color="#8a5e10"/>
    </linearGradient>
  </defs>
  <circle cx="32" cy="32" r="28" fill="url(#gold)" stroke="#ffe066" stroke-width="2"/>
  <circle cx="32" cy="32" r="20" fill="none" stroke="#8a5e10" stroke-width="1.5"/>
  <circle cx="32" cy="32" r="6" fill="#ffe066"/>
</svg>`;

const glowParticleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%">
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffe066" stop-opacity="1"/>
      <stop offset="50%" stop-color="#f4c430" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#f4c430" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="32" cy="32" r="30" fill="url(#glow)"/>
</svg>`;

writeAsset('neon-palace/effects/big-win-overlay.svg', bigWinOverlaySvg);
writeAsset('neon-palace/effects/mega-win-overlay.svg', megaWinOverlaySvg);
writeAsset('neon-palace/effects/epic-win-overlay.svg', epicWinOverlaySvg);
writeAsset('neon-palace/effects/jackpot-overlay.svg', jackpotOverlaySvg);
writeAsset('neon-palace/effects/coin-particle.svg', coinParticleSvg);
writeAsset('neon-palace/effects/glow-particle.svg', glowParticleSvg);

console.log('\nAll fallback graphics and audio assets generated successfully!\n');
