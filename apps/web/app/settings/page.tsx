'use client';

import { useState } from 'react';
import LobbyHeader from '../components/lobby/LobbyHeader';
import LobbyCard, { LobbySectionTitle } from '../components/lobby/LobbyCard';
import { LC, LOBBY_BASE_CSS } from '../components/lobby/theme';

// ── Local UI-only state. No backend calls — preferences are cosmetic in this demo. ──
function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        background: on ? LC.green : 'rgba(255,255,255,0.12)',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.2s',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: '#fff',
          position: 'absolute',
          top: 3,
          left: on ? 23 : 3,
          transition: 'left 0.2s',
        }}
      />
    </button>
  );
}

function SettingRow({ icon, label, desc, on, onChange }: { icon: string; label: string; desc: string; on: boolean; onChange: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: `1px solid ${LC.cardBorder}` }}>
      <span style={{ fontSize: 18, width: 26, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{label}</div>
        <div style={{ fontSize: 11, color: LC.textDim, marginTop: 2 }}>{desc}</div>
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  );
}

const CURRENCIES = ['VCOIN', 'USD (display)', 'EUR (display)', 'GBP (display)'];
const LANGUAGES = ['English', 'Spanish', 'German', 'French', 'Portuguese'];
const THEMES = ['Neon (default)', 'Midnight', 'Classic Gold'];

export default function SettingsPage() {
  // Notification preferences
  const [notifWins, setNotifWins] = useState(true);
  const [notifBonus, setNotifBonus] = useState(true);
  const [notifTournaments, setNotifTournaments] = useState(true);
  const [notifMarketing, setNotifMarketing] = useState(false);
  const [emailDigest, setEmailDigest] = useState(true);

  // Gameplay preferences
  const [soundEffects, setSoundEffects] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [autoSpinConfirm, setAutoSpinConfirm] = useState(true);

  // Privacy / responsible gaming
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(true);
  const [sessionReminders, setSessionReminders] = useState(true);

  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [theme, setTheme] = useState(THEMES[0]);

  const [saved, setSaved] = useState(false);
  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  return (
    <div style={{ minHeight: '100vh', background: LC.bg, fontFamily: "'Outfit', sans-serif", color: LC.text }}>
      <style>{LOBBY_BASE_CSS}</style>
      <LobbyHeader eyebrow="PREFERENCES" title="SETTINGS" rightLabel="PROFILE →" rightHref="/profile" />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px 80px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>Settings</h1>
        <p style={{ fontSize: 12, color: LC.textDim, marginBottom: 8 }}>
          These preferences are stored locally in this demo session — no account or payment data is changed.
        </p>

        <LobbyCard>
          <LobbySectionTitle>Notifications</LobbySectionTitle>
          <SettingRow icon="" label="Win alerts" desc="Notify me when I win a spin or jackpot" on={notifWins} onChange={() => setNotifWins((v) => !v)} />
          <SettingRow icon="" label="Bonus reminders" desc="Daily bonus and cashback availability" on={notifBonus} onChange={() => setNotifBonus((v) => !v)} />
          <SettingRow icon="" label="Tournament updates" desc="Tournament start times and results" on={notifTournaments} onChange={() => setNotifTournaments((v) => !v)} />
          <SettingRow icon="" label="Promotional offers" desc="New promotions and limited-time deals" on={notifMarketing} onChange={() => setNotifMarketing((v) => !v)} />
          <div style={{ paddingTop: 12 }}>
            <SettingRow icon="" label="Weekly email digest" desc="Summary of your activity and offers" on={emailDigest} onChange={() => setEmailDigest((v) => !v)} />
          </div>
        </LobbyCard>

        <LobbyCard accent={LC.cyan}>
          <LobbySectionTitle accent={LC.cyan}>Gameplay</LobbySectionTitle>
          <SettingRow icon="" label="Sound effects" desc="Spin, win, and button sounds" on={soundEffects} onChange={() => setSoundEffects((v) => !v)} />
          <SettingRow icon="" label="Background music" desc="Ambient music while playing" on={musicEnabled} onChange={() => setMusicEnabled((v) => !v)} />
          <SettingRow icon="" label="Reduce motion" desc="Minimize reel animations and particle effects" on={reduceMotion} onChange={() => setReduceMotion((v) => !v)} />
          <SettingRow icon="" label="Confirm before auto-spin" desc="Ask for confirmation when starting auto-spin" on={autoSpinConfirm} onChange={() => setAutoSpinConfirm((v) => !v)} />
        </LobbyCard>

        <LobbyCard accent={LC.purple}>
          <LobbySectionTitle accent={LC.purple}>Privacy & Responsible Gaming</LobbySectionTitle>
          <SettingRow icon="" label="Show me on leaderboards" desc="Display my username in public rankings" on={showOnLeaderboard} onChange={() => setShowOnLeaderboard((v) => !v)} />
          <SettingRow icon="⏰" label="Session time reminders" desc="Gentle reminder every hour of play" on={sessionReminders} onChange={() => setSessionReminders((v) => !v)} />
        </LobbyCard>

        <LobbyCard>
          <LobbySectionTitle>Display</LobbySectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {[
              { label: 'Currency Display', value: currency, options: CURRENCIES, set: setCurrency },
              { label: 'Language', value: language, options: LANGUAGES, set: setLanguage },
              { label: 'Theme', value: theme, options: THEMES, set: setTheme },
            ].map((field) => (
              <div key={field.label}>
                <div style={{ fontSize: 11, color: LC.textDim, marginBottom: 6, letterSpacing: 0.5 }}>{field.label}</div>
                <select
                  value={field.value}
                  onChange={(e) => field.set(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${LC.cardBorder}`,
                    color: LC.text,
                    borderRadius: 10,
                    padding: '9px 10px',
                    fontSize: 13,
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  {field.options.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </LobbyCard>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={handleSave}
            style={{
              padding: '12px 32px',
              borderRadius: 12,
              border: 'none',
              background: `linear-gradient(135deg, ${LC.gold}, #ff8c00)`,
              color: '#0d0618',
              fontSize: 14,
              fontWeight: 900,
              letterSpacing: 1,
              cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            SAVE PREFERENCES
          </button>
          {saved && <span style={{ color: LC.green, fontSize: 13, fontWeight: 700 }}>✓ Saved</span>}
        </div>
      </div>
    </div>
  );
}
