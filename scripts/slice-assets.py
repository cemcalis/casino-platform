"""One-off sprite sheet slicer for the Pyramid Quest asset integration.

Source sheets (kept as-is, not modified):
  assets/ChatGPT Image 1 Tem 2026 14_57_41.png  -> Pyramid Quest / master UI kit
  assets/5b47a755-8eb7-4ec5-a046-a57f8239c708.png -> FX pack

Crops are approximate bounding boxes read off the sheet layout; padding is
generous since sub-pixel alignment isn't required for UI sprites.
"""
from PIL import Image
import os

ROOT = 'C:/Users/Cem/Desktop/casino-platform'
PQ_SHEET = f'{ROOT}/assets/ChatGPT Image 1 Tem 2026 14_57_41.png'
FX_SHEET = f'{ROOT}/assets/5b47a755-8eb7-4ec5-a046-a57f8239c708.png'
WEB = f'{ROOT}/apps/web/public/assets'

pq = Image.open(PQ_SHEET).convert('RGBA')
fx = Image.open(FX_SHEET).convert('RGBA')

def save(im, box, path):
    crop = im.crop(box)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    crop.save(path)
    print('saved', path, crop.size)

# ── Pyramid Quest sheet (887x1774) ──────────────────────────────────────────
# Row 1: icon strip
save(pq, (10, 108, 140, 232), f'{WEB}/master-ui/icons/gold-crown.png')
save(pq, (140, 108, 240, 232), f'{WEB}/master-ui/icons/eye-of-horus.png')
save(pq, (240, 108, 360, 232), f'{WEB}/master-ui/icons/star-counter.png')
save(pq, (360, 108, 480, 232), f'{WEB}/master-ui/buttons/info-button.png')
save(pq, (480, 108, 575, 232), f'{WEB}/master-ui/icons/background-icon.png')
save(pq, (575, 108, 660, 232), f'{WEB}/master-ui/icons/settings-icon-alt.png')
save(pq, (660, 108, 745, 232), f'{WEB}/master-ui/icons/ankh-icon.png')
save(pq, (745, 108, 825, 232), f'{WEB}/master-ui/icons/settings-icon.png')
save(pq, (825, 108, 887, 232), f'{WEB}/master-ui/icons/exit-icon.png')

# Row 2: red/green markers, gamble + spin buttons, major-symbol frame
save(pq, (10, 240, 110, 330), f'{WEB}/master-ui/icons/marker-red.png')
save(pq, (110, 240, 210, 330), f'{WEB}/master-ui/icons/marker-green.png')
save(pq, (210, 240, 400, 330), f'{WEB}/master-ui/buttons/gamble-button-inactive.png')
save(pq, (400, 240, 620, 330), f'{WEB}/master-ui/buttons/spin-button.png')
save(pq, (620, 240, 887, 470), f'{WEB}/master-ui/ui/major-symbol-frame.png')

# Main background scene (ornate pyramid archway) + Pyramid Quest logo lockup
save(pq, (5, 335, 625, 805), f'{WEB}/pyramid-quest/backgrounds/background.png')
save(pq, (610, 470, 887, 800), f'{WEB}/pyramid-quest/ui/logo-lockup.png')

# Game symbols — row 1 (5 circular icons)
sym_row1 = ['horus-falcon', 'anubis', 'bastet-cat', 'eagle-gold', 'thoth-ibis']
for i, name in enumerate(sym_row1):
    x0 = 10 + i * 177
    save(pq, (x0, 855, x0 + 177, 975), f'{WEB}/pyramid-quest/symbols/{name}.png')

# Game symbols — row 2 (5 icons)
sym_row2 = ['scarab', 'cartouche', 'crook-and-flail', 'ankh-blue', 'ankh-red']
for i, name in enumerate(sym_row2):
    x0 = 10 + i * 177
    save(pq, (x0, 975, x0 + 177, 1105), f'{WEB}/pyramid-quest/symbols/{name}.png')

# Game symbols — row 3 (4 icons, wider)
sym_row3 = ['pyramid-gold', 'sphinx-bust', 'pharaoh-mask-blue', 'pharaoh-mask-dark']
for i, name in enumerate(sym_row3):
    x0 = 20 + i * 215
    save(pq, (x0, 1105, x0 + 215, 1260), f'{WEB}/pyramid-quest/symbols/{name}.png')

# Typography swatches (decorative title/label textures per color)
typo = ['blue', 'green', 'red', 'gold']
for i, color in enumerate(typo):
    y0 = 1310 + i * 100
    save(pq, (0, y0, 620, y0 + 100), f'{WEB}/pyramid-quest/typography/typeface-{color}.png')

# Particle icon references (glow / debris / behind-light)
save(pq, (760, 1300, 887, 1400), f'{WEB}/pyramid-quest/effects/glow-particle.png')
save(pq, (760, 1400, 887, 1500), f'{WEB}/pyramid-quest/effects/debris-particles.png')
save(pq, (760, 1500, 887, 1650), f'{WEB}/pyramid-quest/effects/behind-light-symbol.png')

# ── FX sheet (1024x1536, RGBA) ──────────────────────────────────────────────
save(fx, (0, 0, 330, 110), f'{WEB}/fx/win-banners/win.png')
save(fx, (340, 0, 680, 110), f'{WEB}/fx/win-banners/big-win.png')
save(fx, (690, 0, 1024, 110), f'{WEB}/fx/win-banners/epic-win.png')
save(fx, (0, 115, 330, 230), f'{WEB}/fx/win-banners/super-win.png')
save(fx, (340, 115, 680, 230), f'{WEB}/fx/win-banners/jackpot.png')
save(fx, (690, 115, 1024, 230), f'{WEB}/fx/win-banners/jackpot-grand-value.png')

save(fx, (0, 235, 330, 300), f'{WEB}/fx/coins/coin-pile-1.png')
save(fx, (340, 235, 680, 300), f'{WEB}/fx/coins/coin-pile-2.png')
save(fx, (690, 235, 1024, 300), f'{WEB}/fx/coins/coin-pile-3.png')

save(fx, (280, 300, 750, 345), f'{WEB}/fx/win-banners/race-with-banner.png')
save(fx, (690, 300, 1024, 345), f'{WEB}/fx/win-banners/grand-jackpot-banner.png')

save(fx, (10, 355, 260, 460), f'{WEB}/fx/coins/coin-cluster.png')
save(fx, (280, 355, 750, 460), f'{WEB}/fx/particles/light-burst-trio.png')
save(fx, (760, 355, 1024, 460), f'{WEB}/fx/particles/star-cluster.png')

# Ambient/particle full-width texture strips for background atmosphere + coin rain
strip_bounds = [
    (470, 700), (700, 900), (900, 1100), (1100, 1250),
    (1250, 1370), (1370, 1460), (1460, 1536),
]
for i, (y0, y1) in enumerate(strip_bounds):
    save(fx, (0, y0, 1024, y1), f'{WEB}/fx/particles/ambient-strip-{i+1}.png')

print('DONE')
