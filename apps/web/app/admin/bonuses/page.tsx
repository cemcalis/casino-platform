'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────
interface BonusCfg {
  type: string;
  enabled: boolean;
  baseAmount: string;
  cashbackPct: string;
  expiresInDays: number;
  tierMultipliers: Record<string, number>;
}
interface AdminConfig { welcome: BonusCfg; daily: BonusCfg; cashback: BonusCfg }
interface RecentBonus { id: string; type: string; amount: string; claimedAt: string | null; createdAt: string; user: { username: string; email: string } }

// ─── Demo Defaults ────────────────────────────────────────────────────────────
const DEMO_CONFIG: AdminConfig = {
  welcome:  { type: 'WELCOME',  enabled: true,  baseAmount: '5000.00', cashbackPct: '0.00', expiresInDays: 30, tierMultipliers: { SILVER: 1, GOLD: 1, PLATINUM: 1 } },
  daily:    { type: 'DAILY',    enabled: true,  baseAmount: '500.00',  cashbackPct: '0.00', expiresInDays: 1,  tierMultipliers: { SILVER: 2, GOLD: 4, PLATINUM: 10 } },
  cashback: { type: 'CASHBACK', enabled: true,  baseAmount: '0.00',    cashbackPct: '5.00', expiresInDays: 7,  tierMultipliers: { SILVER: 1, GOLD: 1, PLATINUM: 1 } },
};
const DEMO_RECENT: RecentBonus[] = [
  { id: '1', type: 'WELCOME',  amount: '5000.00', claimedAt: new Date().toISOString(), createdAt: new Date().toISOString(), user: { username: 'new_player', email: 'new@demo.com' } },
  { id: '2', type: 'DAILY',    amount: '2000.00', claimedAt: new Date().toISOString(), createdAt: new Date(Date.now() - 60000).toISOString(), user: { username: 'velvet_king', email: 'vk@demo.com' } },
  { id: '3', type: 'DAILY',    amount: '500.00',  claimedAt: new Date().toISOString(), createdAt: new Date(Date.now() - 120000).toISOString(), user: { username: 'ace_king99', email: 'ak@demo.com' } },
  { id: '4', type: 'CASHBACK', amount: '842.50',  claimedAt: new Date().toISOString(), createdAt: new Date(Date.now() - 300000).toISOString(), user: { username: 'neon_phoenix', email: 'np@demo.com' } },
  { id: '5', type: 'DAILY',    amount: '1000.00', claimedAt: new Date().toISOString(), createdAt: new Date(Date.now() - 600000).toISOString(), user: { username: 'midnight_rose', email: 'mr@demo.com' } },
];

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1';
const BONUS_COLORS: Record<string, string> = { WELCOME: '#f4c430', DAILY: '#00d4c8', CASHBACK: '#a855f7' };
const BONUS_ICONS: Record<string, string> = { WELCOME: '', DAILY: '', CASHBACK: '' };

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BonusesPage() {
  const router = useRouter();
  const [config, setConfig] = useState<AdminConfig>(DEMO_CONFIG);
  const [recent, setRecent] = useState<RecentBonus[]>(DEMO_RECENT);
  const [isDemo, setIsDemo] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [activeNav] = useState('Bonuses');
  const [notifOpen, setNotifOpen] = useState(false);
  const [editField, setEditField] = useState<{ type: string; field: string; value: string } | null>(null);

  const navItems = ['Dashboard', 'Players', 'Games', 'Finance', 'Bonuses', 'Reports', 'Settings'];

  const getToken = () => (typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null);

  const fetchData = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const [cfgRes, recentRes] = await Promise.all([
        fetch(`${API}/bonus/admin/config`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/bonus/admin/recent`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (cfgRes.ok) { setConfig(await cfgRes.json() as AdminConfig); setIsDemo(false); }
      if (recentRes.ok) { const d = await recentRes.json() as { items: RecentBonus[] }; setRecent(d.items); }
    } catch { /* keep demo */ }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleEnabled = async (type: string, current: boolean) => {
    const token = getToken();
    const key = type.toLowerCase() as keyof AdminConfig;
    setConfig(c => ({ ...c, [key]: { ...c[key], enabled: !current } }));
    if (!token) return;
    await fetch(`${API}/bonus/admin/config/${type}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ enabled: !current }),
    }).catch(() => setConfig(c => ({ ...c, [key]: { ...c[key], enabled: current } })));
  };

  const saveField = async () => {
    if (!editField) return;
    const { type, field, value } = editField;
    const key = type.toLowerCase() as keyof AdminConfig;
    const token = getToken();
    setSaving(type);
    const body: Record<string, unknown> = {};
    if (field === 'baseAmount') body['baseAmount'] = parseFloat(value);
    if (field === 'cashbackPct') body['cashbackPct'] = parseFloat(value);
    if (field === 'expiresInDays') body['expiresInDays'] = parseInt(value);
    setConfig(c => ({ ...c, [key]: { ...c[key], [field]: value } }));
    setEditField(null);
    if (token) {
      await fetch(`${API}/bonus/admin/config/${type}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      }).catch(() => {});
    }
    setSaving(null);
  };

  const cfgList = [config.welcome, config.daily, config.cashback];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0d0618; font-family: 'Inter', sans-serif; }
        @keyframes pulse { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(0,212,200,.6)} 50%{opacity:.7;box-shadow:0 0 0 6px rgba(0,212,200,0)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes pulseRed { 0%,100%{box-shadow:0 0 0 0 rgba(255,45,120,.6)} 50%{box-shadow:0 0 0 6px rgba(255,45,120,0)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar{width:6px;height:6px} ::-webkit-scrollbar-track{background:#0d0618} ::-webkit-scrollbar-thumb{background:#3d2060;border-radius:3px}
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0d0618', backgroundImage: 'radial-gradient(circle at 20% 50%,rgba(37,18,64,.8) 0%,transparent 50%)', fontFamily: "'Inter',sans-serif", color: '#f0e8ff' }}>
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle,rgba(244,196,48,.08) 1px,transparent 1px)', backgroundSize: '32px 32px' }} />

        {/* NAV */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(13,6,24,.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(244,196,48,.15)', padding: '0 32px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 32px rgba(0,0,0,.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: '.05em', background: 'linear-gradient(135deg,#f4c430,#ff8c00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', whiteSpace: 'nowrap' }}>♠ NEON PALACE ADMIN</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {navItems.map(item => (
                <button key={item} onClick={() => {
                  if (item === 'Dashboard') { router.push('/admin'); return; }
                  if (item === 'Players') { router.push('/admin/players'); return; }
                  if (item === 'Reports') { router.push('/admin/reports'); return; }
                  if (item === 'Bonuses') return;
                }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: activeNav === item ? '#f4c430' : '#a08bc0', fontSize: 13, fontWeight: 600, padding: '6px 12px', borderRadius: 8, fontFamily: "'Inter',sans-serif", transition: 'color .2s', borderBottom: activeNav === item ? '2px solid #f4c430' : '2px solid transparent' }}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,45,120,.15)', border: '1px solid rgba(255,45,120,.4)', borderRadius: 8, padding: '4px 12px' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff2d78', display: 'inline-block', animation: 'blink 1.2s infinite' }} />
              <span style={{ color: '#ff2d78', fontSize: 12, fontWeight: 700, letterSpacing: '.1em' }}>LIVE</span>
            </div>
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setNotifOpen(!notifOpen)}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(240,232,255,.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, border: '1px solid rgba(240,232,255,.1)' }}></div>
              <span style={{ position: 'absolute', top: -4, right: -4, background: '#ff2d78', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulseRed 2s infinite' }}>2</span>
              {notifOpen && (
                <div style={{ position: 'absolute', top: 48, right: 0, background: '#1a0d30', border: '1px solid rgba(244,196,48,.2)', borderRadius: 12, padding: 12, width: 240, zIndex: 200 }}>
                  {['Cashback claimed — velvet_king', 'Welcome bonus — new player'].map((n, i) => (
                    <div key={i} style={{ padding: '8px 12px', borderRadius: 8, color: '#f0e8ff', fontSize: 13, borderBottom: i < 1 ? '1px solid rgba(240,232,255,.05)' : 'none', cursor: 'pointer' }}>
                      <span style={{ color: '#f4c430', marginRight: 8 }}>●</span>{n}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(240,232,255,.05)', border: '1px solid rgba(240,232,255,.1)', borderRadius: 10, padding: '6px 14px' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#f4c430,#ff8c00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#0d0618' }}>SA</div>
              <div><div style={{ color: '#f0e8ff', fontSize: 13, fontWeight: 600 }}>System Admin</div><div style={{ color: '#a08bc0', fontSize: 11 }}>Super Admin</div></div>
            </div>
          </div>
        </nav>

        <main style={{ padding: '32px', maxWidth: 1400, margin: '0 auto', position: 'relative', zIndex: 1 }}>

          {/* Header */}
          <div style={{ marginBottom: 32, animation: 'slideUp .5s ease both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f0e8ff', fontFamily: "'Outfit',sans-serif", margin: 0 }}>Bonus Engine</h1>
                <p style={{ color: '#a08bc0', fontSize: 14, marginTop: 4 }}>
                  Configure welcome, daily, and cashback bonuses
                  {isDemo && <span style={{ marginLeft: 12, background: '#f4c43022', color: '#f4c430', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>DEMO DATA</span>}
                </p>
              </div>
              <button onClick={fetchData} style={{ background: 'rgba(244,196,48,.1)', border: '1px solid rgba(244,196,48,.3)', color: '#f4c430', fontSize: 13, fontWeight: 600, padding: '8px 18px', borderRadius: 10, cursor: 'pointer' }}>
                ↻ Refresh
              </button>
            </div>
          </div>

          {/* Bonus Config Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32, animation: 'slideUp .5s ease .1s both' }}>
            {cfgList.map(cfg => {
              const color = BONUS_COLORS[cfg.type] ?? '#f4c430';
              const icon = BONUS_ICONS[cfg.type] ?? '';
              const key = cfg.type.toLowerCase() as keyof AdminConfig;
              const isSavingThis = saving === cfg.type;

              return (
                <div key={cfg.type} style={{ background: '#251240', borderRadius: 16, border: `1px solid ${cfg.enabled ? color + '44' : 'rgba(240,232,255,.08)'}`, padding: 24, transition: 'border-color .3s', opacity: cfg.enabled ? 1 : 0.65 }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}22`, border: `1px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{icon}</div>
                      <div>
                        <div style={{ color: '#f0e8ff', fontWeight: 700, fontSize: 16 }}>{cfg.type.charAt(0) + cfg.type.slice(1).toLowerCase()} Bonus</div>
                        <div style={{ color: '#a08bc0', fontSize: 12, marginTop: 2 }}>
                          {cfg.type === 'WELCOME' && 'One-time on registration'}
                          {cfg.type === 'DAILY' && 'Once per UTC day'}
                          {cfg.type === 'CASHBACK' && 'Weekly on net losses'}
                        </div>
                      </div>
                    </div>
                    {/* Toggle */}
                    <button onClick={() => toggleEnabled(cfg.type, cfg.enabled)} style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: cfg.enabled ? color : 'rgba(240,232,255,.15)', position: 'relative', transition: 'background .2s' }}>
                      <div style={{ position: 'absolute', top: 3, left: cfg.enabled ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,.4)' }} />
                    </button>
                  </div>

                  {/* Fields */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {cfg.type !== 'CASHBACK' && (
                      <EditableField
                        label="Base Amount (VC)"
                        value={cfg.baseAmount}

                        isEditing={editField?.type === cfg.type && editField?.field === 'baseAmount'}
                        editValue={editField?.value ?? ''}
                        color={color}
                        isSaving={isSavingThis}
                        onEdit={() => setEditField({ type: cfg.type, field: 'baseAmount', value: cfg.baseAmount })}
                        onEditChange={v => setEditField(e => e ? { ...e, value: v } : null)}
                        onSave={saveField}
                        onCancel={() => setEditField(null)}
                      />
                    )}
                    {cfg.type === 'CASHBACK' && (
                      <EditableField
                        label="Cashback Rate (%)"
                        value={cfg.cashbackPct}
                        isEditing={editField?.type === cfg.type && editField?.field === 'cashbackPct'}
                        editValue={editField?.value ?? ''}
                        color={color}
                        isSaving={isSavingThis}
                        onEdit={() => setEditField({ type: cfg.type, field: 'cashbackPct', value: cfg.cashbackPct })}
                        onEditChange={v => setEditField(e => e ? { ...e, value: v } : null)}
                        onSave={saveField}
                        onCancel={() => setEditField(null)}
                      />
                    )}
                    <EditableField
                      label="Expires In (days)"
                      value={String(cfg.expiresInDays)}
                      isEditing={editField?.type === cfg.type && editField?.field === 'expiresInDays'}
                      editValue={editField?.value ?? ''}
                      color={color}
                      isSaving={isSavingThis}
                      onEdit={() => setEditField({ type: cfg.type, field: 'expiresInDays', value: String(cfg.expiresInDays) })}
                      onEditChange={v => setEditField(e => e ? { ...e, value: v } : null)}
                      onSave={saveField}
                      onCancel={() => setEditField(null)}
                    />

                    {/* Tier multipliers for DAILY */}
                    {cfg.type === 'DAILY' && (
                      <div style={{ marginTop: 4, padding: '12px', background: 'rgba(240,232,255,.04)', borderRadius: 10, border: '1px solid rgba(240,232,255,.07)' }}>
                        <div style={{ color: '#a08bc0', fontSize: 11, fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 8 }}>Tier Multipliers</div>
                        {Object.entries(cfg.tierMultipliers).map(([tier, mult]) => (
                          <div key={tier} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(240,232,255,.04)' }}>
                            <span style={{ color: '#a08bc0', fontSize: 13 }}>{tier}</span>
                            <span style={{ color, fontSize: 13, fontWeight: 700 }}>{mult}× = {(parseFloat(cfg.baseAmount) * mult).toFixed(0)} VC</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Status chip */}
                    <div style={{ marginTop: 4, display: 'flex', justifyContent: 'flex-end' }}>
                      <span style={{ background: cfg.enabled ? `${color}22` : 'rgba(240,232,255,.06)', color: cfg.enabled ? color : '#6b5a8a', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, letterSpacing: '.05em' }}>
                        {cfg.enabled ? 'ACTIVE' : 'DISABLED'}
                      </span>
                    </div>
                  </div>
                </div>
              );

              function EditableField({ label, value, isEditing, editValue, color: c, isSaving: saving2, onEdit, onEditChange, onSave, onCancel }: {
                label: string; value: string; isEditing: boolean; editValue: string; color: string; isSaving: boolean;
                onEdit: () => void; onEditChange: (v: string) => void; onSave: () => void; onCancel: () => void;
              }) {
                return (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(240,232,255,.04)', borderRadius: 8, border: '1px solid rgba(240,232,255,.06)' }}>
                    <span style={{ color: '#a08bc0', fontSize: 13 }}>{label}</span>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <input type="number" value={editValue} onChange={e => onEditChange(e.target.value)}
                          style={{ width: 90, background: '#1a0d30', border: `1px solid ${c}`, borderRadius: 6, padding: '4px 8px', color: '#f0e8ff', fontSize: 13, outline: 'none' }}
                          autoFocus onKeyDown={e => { if (e.key === 'Enter') onSave(); if (e.key === 'Escape') onCancel(); }} />
                        <button onClick={onSave} disabled={saving2} style={{ background: c, border: 'none', color: '#0d0618', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 6, cursor: 'pointer' }}>Save</button>
                        <button onClick={onCancel} style={{ background: 'rgba(240,232,255,.08)', border: 'none', color: '#a08bc0', fontSize: 12, padding: '4px 8px', borderRadius: 6, cursor: 'pointer' }}>✕</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ color: c, fontWeight: 700, fontSize: 15 }}>{value}</span>
                        <button onClick={onEdit} style={{ background: 'rgba(240,232,255,.07)', border: '1px solid rgba(240,232,255,.1)', color: '#a08bc0', fontSize: 11, padding: '3px 8px', borderRadius: 5, cursor: 'pointer' }}>Edit</button>
                      </div>
                    )}
                  </div>
                );
              }
            })}
          </div>

          {/* Cashback tier rates info */}
          <div style={{ background: '#251240', borderRadius: 16, border: '1px solid rgba(168,85,247,.15)', padding: 24, marginBottom: 24, animation: 'slideUp .5s ease .2s both' }}>
            <h3 style={{ color: '#f0e8ff', fontSize: 17, fontWeight: 700, margin: '0 0 16px' }}>Cashback Rates by VIP Tier</h3>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[{ tier: 'Bronze', color: '#cd7f32', rate: 5, min: 0 }, { tier: 'Silver', color: '#c0c0c0', rate: 10, min: 1000 }, { tier: 'Gold', color: '#f4c430', rate: 15, min: 10000 }, { tier: 'Platinum', color: '#e5e4e2', rate: 20, min: 50000 }].map(t => (
                <div key={t.tier} style={{ flex: 1, minWidth: 140, background: 'rgba(240,232,255,.04)', borderRadius: 12, padding: '16px', border: `1px solid ${t.color}33`, textAlign: 'center' }}>
                  <div style={{ color: t.color, fontSize: 22, fontWeight: 800 }}>{t.rate}%</div>
                  <div style={{ color: '#f0e8ff', fontSize: 13, fontWeight: 600, marginTop: 4 }}>{t.tier}</div>
                  <div style={{ color: '#6b5a8a', fontSize: 11, marginTop: 2 }}>{t.min.toLocaleString()}+ VC bet</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Bonus Activity */}
          <div style={{ background: '#251240', borderRadius: 16, border: '1px solid rgba(244,196,48,.1)', overflow: 'hidden', animation: 'slideUp .5s ease .3s both' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(240,232,255,.07)' }}>
              <h3 style={{ color: '#f0e8ff', fontSize: 17, fontWeight: 700, margin: 0 }}>Recent Bonus Activity</h3>
              <p style={{ color: '#a08bc0', fontSize: 13, margin: '2px 0 0' }}>Latest claimed bonuses across all players</p>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Player', 'Type', 'Amount (VC)', 'Claimed At'].map(col => (
                      <th key={col} style={{ padding: '12px 20px', textAlign: 'left', color: '#a08bc0', fontSize: 11, fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase' }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recent.map((b, i) => {
                    const color = BONUS_COLORS[b.type] ?? '#f4c430';
                    return (
                      <tr key={b.id} style={{ background: i % 2 === 0 ? 'rgba(240,232,255,.02)' : 'transparent' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(244,196,48,.04)')}
                        onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'rgba(240,232,255,.02)' : 'transparent')}>
                        <td style={{ padding: '13px 20px' }}>
                          <div style={{ color: '#f0e8ff', fontWeight: 600, fontSize: 14 }}>{b.user.username}</div>
                          <div style={{ color: '#6b5a8a', fontSize: 11 }}>{b.user.email}</div>
                        </td>
                        <td style={{ padding: '13px 20px' }}>
                          <span style={{ background: `${color}22`, color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, letterSpacing: '.05em' }}>
                            {BONUS_ICONS[b.type]} {b.type}
                          </span>
                        </td>
                        <td style={{ padding: '13px 20px', color, fontWeight: 700, fontSize: 15 }}>{parseFloat(b.amount).toLocaleString('en-US')}</td>
                        <td style={{ padding: '13px 20px', color: '#a08bc0', fontSize: 13 }}>
                          {b.claimedAt ? new Date(b.claimedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <footer style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid rgba(240,232,255,.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 14, background: 'linear-gradient(135deg,#f4c430,#ff8c00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>♠ NEON PALACE</span>
            <span style={{ color: '#6b5a8a', fontSize: 12 }}>© 2026 Neon Palace Gaming. All rights reserved.</span>
          </footer>
        </main>
      </div>
    </>
  );
}
