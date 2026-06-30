// Shared design tokens for the lobby platform pages (Profile, Tournaments,
// Notifications, Settings, Search). Mirrors the palette already established
// by the Wallet / VIP / Promotions pages so the whole lobby feels like one product.
export const LC = {
  bg: '#06000e',
  surface: '#0d0018',
  card: '#130020',
  cardBorder: '#260840',
  gold: '#d4a848',
  goldBright: '#f4c430',
  purple: '#7c3aed',
  cyan: '#00d4c8',
  magenta: '#ff2d78',
  green: '#00e676',
  red: '#ff4466',
  text: '#f0e8ff',
  textDim: '#9d8ec0',
  textFaint: '#7a7090',
} as const;

export const LOBBY_FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');";

export const LOBBY_BASE_CSS = `
  ${LOBBY_FONT_IMPORT}
  *{box-sizing:border-box;}
  @keyframes lobbyFadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes lobbyPulse{0%,100%{opacity:1}50%{opacity:0.55}}
  @keyframes lobbyGlow{0%,100%{opacity:0.6}50%{opacity:1}}
`;
