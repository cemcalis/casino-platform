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

// ── 1. AUDIO (Tiny silent MP3) ──────────────────────────────
const silentMp3Base64 = '//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA';
writeAsset('shared/audio/button-click.mp3', silentMp3Base64, true);

// ── 2. SVG GRAPHICS ─────────────────────────────────────────

const demoBannerBgSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 32" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0a0212"/>
      <stop offset="50%" stop-color="#040108"/>
      <stop offset="100%" stop-color="#0a0212"/>
    </linearGradient>
    <pattern id="felt" width="32" height="32" patternUnits="userSpaceOnUse">
      <line x1="0" y1="32" x2="32" y2="0" stroke="#000000" stroke-width="2" opacity="0.4"/>
      <line x1="0" y1="0" x2="32" y2="32" stroke="#d4a848" stroke-width="0.5" opacity="0.15"/>
      <line x1="16" y1="-16" x2="48" y2="16" stroke="#d4a848" stroke-width="0.5" opacity="0.08"/>
      <line x1="-16" y1="16" x2="16" y2="48" stroke="#d4a848" stroke-width="0.5" opacity="0.08"/>
    </pattern>
  </defs>
  <rect width="1920" height="32" fill="url(#bg)"/>
  <rect width="1920" height="32" fill="url(#felt)"/>
  <line x1="0" y1="31" x2="1920" y2="31" stroke="#d4a848" stroke-width="1" opacity="0.3"/>
  <line x1="0" y1="0" x2="1920" y2="0" stroke="#d4a848" stroke-width="0.5" opacity="0.15"/>
</svg>`;

const logoLockupSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 200" width="100%" height="100%">
  <defs>
    <linearGradient id="gold-bevel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff5cc"/>
      <stop offset="30%" stop-color="#f5cc5b"/>
      <stop offset="70%" stop-color="#b88a14"/>
      <stop offset="100%" stop-color="#664600"/>
    </linearGradient>
    <linearGradient id="gold-front" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff8db"/>
      <stop offset="40%" stop-color="#ffd257"/>
      <stop offset="75%" stop-color="#d4a31c"/>
      <stop offset="100%" stop-color="#916c0b"/>
    </linearGradient>
    <linearGradient id="chrome" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="40%" stop-color="#cbd5e1"/>
      <stop offset="60%" stop-color="#475569"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <filter id="purple-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feComponentTransfer in="blur" result="glow">
        <feFuncA type="linear" slope="0.7"/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode in="glow"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <g filter="url(#purple-glow)">
    <path d="M 300 40 L 350 40 L 360 48 L 400 48 L 440 48 L 450 40 L 500 40" fill="none" stroke="url(#gold-front)" stroke-width="1.5" opacity="0.6"/>
    <polygon points="400,43 404,48 400,53 396,48" fill="url(#gold-front)" opacity="0.8"/>
    <text x="400" y="125" text-anchor="middle" font-family="'Outfit', 'Cinzel', 'Inter', sans-serif" font-weight="900" font-size="76" letter-spacing="8" fill="#180030" opacity="0.9">NEON PALACE</text>
    <text x="398" y="123" text-anchor="middle" font-family="'Outfit', 'Cinzel', 'Inter', sans-serif" font-weight="900" font-size="76" letter-spacing="8" fill="url(#gold-bevel)">NEON PALACE</text>
    <text x="400" y="121" text-anchor="middle" font-family="'Outfit', 'Cinzel', 'Inter', sans-serif" font-weight="900" font-size="76" letter-spacing="8" fill="url(#gold-front)">NEON PALACE</text>
    <path d="M 220 145 L 380 145 L 390 150 L 410 150 L 420 145 L 580 145" fill="none" stroke="url(#gold-front)" stroke-width="1.5" opacity="0.8"/>
    <circle cx="400" cy="150" r="3" fill="url(#gold-front)"/>
    <text x="400" y="174" text-anchor="middle" font-family="'Outfit', 'Inter', sans-serif" font-weight="600" font-size="16" letter-spacing="12" fill="url(#chrome)" opacity="0.9">PREMIUM SLOTS</text>
  </g>
</svg>`;

const coinBurstSheetSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 64" width="100%" height="100%">
  <defs>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffe680"/>
      <stop offset="50%" stop-color="#e6b800"/>
      <stop offset="100%" stop-color="#806000"/>
    </linearGradient>
    <linearGradient id="gold-bright" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff3b3"/>
      <stop offset="100%" stop-color="#d4a31c"/>
    </linearGradient>
  </defs>
  <!-- Frame 0 -->
  <g transform="translate(32, 32)">
    <ellipse cx="0" cy="0" rx="24" ry="24" fill="url(#gold)" stroke="#ffd700" stroke-width="1.5"/>
    <ellipse cx="0" cy="0" rx="18" ry="18" fill="none" stroke="#b38600" stroke-width="1" stroke-dasharray="3, 2"/>
    <polygon points="0,-10 3,-3 10,-3 5,2 7,9 0,5 -7,9 -5,2 -10,-3 -3,-3" fill="url(#gold-bright)"/>
  </g>
  <!-- Frame 1 -->
  <g transform="translate(96, 32)">
    <ellipse cx="0" cy="0" rx="17" ry="24" fill="url(#gold)" stroke="#ffd700" stroke-width="1.5"/>
    <ellipse cx="0" cy="0" rx="12" ry="18" fill="none" stroke="#b38600" stroke-width="1" stroke-dasharray="2, 2"/>
    <polygon points="0,-10 2,-3 7,-3 3,2 5,9 0,5 -5,9 -3,2 -7,-3 -2,-3" fill="url(#gold-bright)"/>
  </g>
  <!-- Frame 2 -->
  <g transform="translate(160, 32)">
    <ellipse cx="0" cy="0" rx="5" ry="24" fill="url(#gold)" stroke="#ffd700" stroke-width="1.5"/>
    <rect x="-2.5" y="-20" width="5" height="40" fill="url(#gold-bright)" opacity="0.7"/>
  </g>
  <!-- Frame 3 -->
  <g transform="translate(224, 32)">
    <ellipse cx="0" cy="0" rx="17" ry="24" fill="url(#gold)" stroke="#ffd700" stroke-width="1.5"/>
    <ellipse cx="0" cy="0" rx="12" ry="18" fill="none" stroke="#b38600" stroke-width="1" stroke-dasharray="2, 2"/>
    <text x="0" y="6" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="16" fill="url(#gold-bright)">$</text>
  </g>
  <!-- Frame 4 -->
  <g transform="translate(288, 32)">
    <ellipse cx="0" cy="0" rx="24" ry="24" fill="url(#gold)" stroke="#ffd700" stroke-width="1.5"/>
    <ellipse cx="0" cy="0" rx="18" ry="18" fill="none" stroke="#b38600" stroke-width="1" stroke-dasharray="3, 2"/>
    <text x="0" y="8" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="24" fill="url(#gold-bright)">$</text>
  </g>
  <!-- Frame 5 -->
  <g transform="translate(352, 32)">
    <ellipse cx="0" cy="0" rx="17" ry="24" fill="url(#gold)" stroke="#ffd700" stroke-width="1.5"/>
    <ellipse cx="0" cy="0" rx="12" ry="18" fill="none" stroke="#b38600" stroke-width="1" stroke-dasharray="2, 2"/>
    <text x="0" y="6" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="16" fill="url(#gold-bright)">$</text>
  </g>
  <!-- Frame 6 -->
  <g transform="translate(416, 32)">
    <ellipse cx="0" cy="0" rx="5" ry="24" fill="url(#gold)" stroke="#ffd700" stroke-width="1.5"/>
    <rect x="-2.5" y="-20" width="5" height="40" fill="url(#gold-bright)" opacity="0.7"/>
  </g>
  <!-- Frame 7 -->
  <g transform="translate(480, 32)">
    <ellipse cx="0" cy="0" rx="17" ry="24" fill="url(#gold)" stroke="#ffd700" stroke-width="1.5"/>
    <ellipse cx="0" cy="0" rx="12" ry="18" fill="none" stroke="#b38600" stroke-width="1" stroke-dasharray="2, 2"/>
    <polygon points="0,-10 2,-3 7,-3 3,2 5,9 0,5 -5,9 -3,2 -7,-3 -2,-3" fill="url(#gold-bright)"/>
  </g>
</svg>`;

const sparkleSheetSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 32" width="100%" height="100%">
  <defs>
    <radialGradient id="sparkle-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="40%" stop-color="#fff2b2"/>
      <stop offset="100%" stop-color="#f4c430" stop-opacity="0"/>
    </radialGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="1" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <!-- Frame 0 -->
  <g transform="translate(16, 16) scale(0.15)" filter="url(#glow)">
    <path d="M 0,-12 Q 0,0 12,0 Q 0,0 0,12 Q 0,0 -12,0 Q 0,0 0,-12 Z" fill="#ffffff"/>
  </g>
  <!-- Frame 1 -->
  <g transform="translate(48, 16) scale(0.5)" filter="url(#glow)">
    <circle cx="0" cy="0" r="10" fill="url(#sparkle-glow)" opacity="0.6"/>
    <path d="M 0,-12 Q 0,0 12,0 Q 0,0 0,12 Q 0,0 -12,0 Q 0,0 0,-12 Z" fill="#ffffff"/>
    <path d="M -8,-8 L 8,8 M -8,8 L 8,-8" stroke="#ffe57f" stroke-width="1.5"/>
  </g>
  <!-- Frame 2 -->
  <g transform="translate(80, 16) scale(1.0)" filter="url(#glow)">
    <circle cx="0" cy="0" r="14" fill="url(#sparkle-glow)"/>
    <path d="M 0,-14 Q 0,0 14,0 Q 0,0 0,14 Q 0,0 -14,0 Q 0,0 0,-14 Z" fill="#ffffff"/>
    <path d="M -9,-9 L 9,9 M -9,9 L 9,-9" stroke="#ffe57f" stroke-width="2"/>
  </g>
  <!-- Frame 3 -->
  <g transform="translate(112, 16) scale(0.8)" opacity="0.9" filter="url(#glow)">
    <circle cx="0" cy="0" r="12" fill="url(#sparkle-glow)"/>
    <path d="M 0,-14 Q 0,0 14,0 Q 0,0 0,14 Q 0,0 -14,0 Q 0,0 0,-14 Z" fill="#ffffff"/>
    <circle cx="0" cy="0" r="4" fill="#ffffff"/>
  </g>
  <!-- Frame 4 -->
  <g transform="translate(144, 16) scale(0.4)" opacity="0.6" filter="url(#glow)">
    <path d="M 0,-12 Q 0,0 12,0 Q 0,0 0,12 Q 0,0 -12,0 Q 0,0 0,-12 Z" fill="#ffe57f"/>
  </g>
  <!-- Frame 5 -->
  <g transform="translate(176, 16) scale(0.15)" opacity="0.3">
    <circle cx="0" cy="0" r="8" fill="#ffe57f"/>
  </g>
</svg>`;

writeAsset('shared/ui/demo-banner-bg.svg', demoBannerBgSvg);
writeAsset('shared/ui/logo-lockup.svg', logoLockupSvg);
writeAsset('shared/particles/coin-burst-sheet.svg', coinBurstSheetSvg);
writeAsset('shared/particles/sparkle-sheet.svg', sparkleSheetSvg);

console.log('\nAll shared fallback graphics and audio assets generated successfully!\n');
