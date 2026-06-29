'use client';

import React, { useState, useEffect, useRef } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Ticket {
  id: string;
  player: string;
  initials: string;
  subject: string;
  category: 'Payment' | 'Account' | 'Technical' | 'Bonus' | 'VIP';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  time: string;
  unread: number;
  status: 'open' | 'pending' | 'resolved';
}

interface Message {
  id: number;
  sender: 'player' | 'agent' | 'system';
  text: string;
  time: string;
  read?: boolean;
  isNote?: boolean;
}

interface Transaction {
  type: string;
  amount: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

// ─── Data ────────────────────────────────────────────────────────────────────
const TICKETS: Ticket[] = [
  { id: 'TKT-8847', player: 'DragonKing99', initials: 'DK', subject: 'Withdrawal not received after 48h', category: 'Payment', priority: 'urgent', time: '2m ago', unread: 3, status: 'open' },
  { id: 'TKT-8846', player: 'LuckyAce77', initials: 'LA', subject: 'Bonus wagering requirement bug', category: 'Bonus', priority: 'high', time: '8m ago', unread: 1, status: 'open' },
  { id: 'TKT-8845', player: 'NeonWolf', initials: 'NW', subject: 'Account verification documents', category: 'Account', priority: 'medium', time: '15m ago', unread: 0, status: 'pending' },
  { id: 'TKT-8844', player: 'GoldRush_XL', initials: 'GR', subject: 'Game loading error - Neon Slots', category: 'Technical', priority: 'high', time: '23m ago', unread: 2, status: 'open' },
  { id: 'TKT-8843', player: 'VIPStar_Mia', initials: 'VM', subject: 'VIP cashback not credited', category: 'VIP', priority: 'urgent', time: '31m ago', unread: 5, status: 'open' },
  { id: 'TKT-8842', player: 'CryptoKing88', initials: 'CK', subject: 'BTC deposit missing - TXID prov.', category: 'Payment', priority: 'high', time: '45m ago', unread: 0, status: 'open' },
  { id: 'TKT-8841', player: 'SilverFox22', initials: 'SF', subject: 'Two-factor authentication reset', category: 'Account', priority: 'low', time: '1h ago', unread: 0, status: 'pending' },
  { id: 'TKT-8840', player: 'AceBlaster', initials: 'AB', subject: 'Free spins not applied to account', category: 'Bonus', priority: 'medium', time: '1h ago', unread: 1, status: 'open' },
  { id: 'TKT-8839', player: 'QueenOfCards', initials: 'QC', subject: 'Live dealer stream quality issue', category: 'Technical', priority: 'low', time: '2h ago', unread: 0, status: 'pending' },
  { id: 'TKT-8838', player: 'RoyalFlush_J', initials: 'RJ', subject: 'Responsible gaming limit request', category: 'Account', priority: 'medium', time: '2h ago', unread: 0, status: 'open' },
  { id: 'TKT-8837', player: 'MidnightBet', initials: 'MB', subject: 'E-wallet payment method not working', category: 'Payment', priority: 'high', time: '3h ago', unread: 0, status: 'resolved' },
  { id: 'TKT-8836', player: 'TurboSlots', initials: 'TS', subject: 'Account suspended unfairly', category: 'Account', priority: 'urgent', time: '3h ago', unread: 0, status: 'resolved' },
];

const MESSAGES_INITIAL: Message[] = [
  { id: 1, sender: 'system', text: 'Ticket #TKT-8847 opened — Payment Issue reported', time: '10:22 AM' },
  { id: 2, sender: 'player', text: "Hi, I submitted a withdrawal request 3 days ago for $850 and it still hasn't arrived in my bank account. The transaction shows as 'Processing' in my account history.", time: '10:22 AM' },
  { id: 3, sender: 'agent', text: "Hello DragonKing99! Thank you for reaching out. I'm sorry to hear about the delay with your withdrawal. Let me pull up your account details right away and investigate this for you.", time: '10:24 AM', read: true },
  { id: 4, sender: 'player', text: 'Thank you. The transaction ID is WD-20241201-88847. I really need this money urgently.', time: '10:25 AM' },
  { id: 5, sender: 'system', text: 'Identity verification completed — KYC Level 3', time: '10:26 AM' },
  { id: 6, sender: 'agent', text: "I can see your withdrawal request WD-20241201-88847. It's currently in our payment processor queue. I've flagged this as priority and escalated it to our Finance team. You should receive the funds within 4-6 business hours.", time: '10:27 AM', read: true },
  { id: 7, sender: 'player', text: 'OK thank you. Is there any way to expedite this further? This is the third time I have had issues with withdrawals.', time: '10:28 AM' },
  { id: 8, sender: 'agent', text: "I completely understand your frustration and I sincerely apologize for the repeated inconvenience. I've added a priority flag to your account and will personally monitor this transaction. I'm also adding a 25 free spin bonus as compensation for the delay.", time: '10:30 AM', read: true, isNote: false },
  { id: 9, sender: 'system', text: 'Escalated to Finance Team — Priority Level: HIGH', time: '10:31 AM' },
  { id: 10, sender: 'player', text: "OK, I'll wait. Please make sure it gets resolved today.", time: '10:33 AM' },
];

const TRANSACTIONS: Transaction[] = [
  { type: 'Withdrawal', amount: '-$850.00', date: 'Dec 1, 2024', status: 'pending' },
  { type: 'Deposit', amount: '+$500.00', date: 'Nov 28, 2024', status: 'completed' },
  { type: 'Deposit', amount: '+$1,200.00', date: 'Nov 22, 2024', status: 'completed' },
  { type: 'Withdrawal', amount: '-$300.00', date: 'Nov 15, 2024', status: 'completed' },
  { type: 'Bonus Credit', amount: '+$75.00', date: 'Nov 10, 2024', status: 'completed' },
];

const RECENT_TICKETS = [
  { id: 'TKT-8612', subject: 'Deposit not credited', date: 'Oct 14, 2024', status: 'resolved' },
  { id: 'TKT-8101', subject: 'Account locked after login', date: 'Sep 3, 2024', status: 'resolved' },
  { id: 'TKT-7854', subject: 'Bonus wagering dispute', date: 'Aug 19, 2024', status: 'resolved' },
];

const CATEGORY_COLORS: Record<string, string> = {
  Payment: '#f4c430',
  Account: '#00d4c8',
  Technical: '#ff2d78',
  Bonus: '#a855f7',
  VIP: '#f97316',
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: '#ff2d78',
  high: '#f97316',
  medium: '#f4c430',
  low: '#3b82f6',
};

const FILTER_TABS = ['All', 'Urgent', 'Open', 'Pending', 'Resolved'];

// ─── Helper components ────────────────────────────────────────────────────────
function AvatarCircle({ initials, size = 36, bg = '#3d1f6e', color = '#f4c430', fontSize = 13 }: { initials: string; size?: number; bg?: string; color?: string; fontSize?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color, fontWeight: 700, fontSize, flexShrink: 0, userSelect: 'none',
      border: '2px solid rgba(244,196,48,0.25)',
    }}>
      {initials}
    </div>
  );
}

function StatusDot({ color, pulse = false }: { color: string; pulse?: boolean }) {
  return (
    <div style={{ position: 'relative', width: 10, height: 10 }}>
      <div style={{
        width: 10, height: 10, borderRadius: '50%', background: color,
        position: 'absolute',
      }} />
      {pulse && (
        <div style={{
          width: 10, height: 10, borderRadius: '50%', background: color,
          position: 'absolute', opacity: 0.4,
          animation: 'pulse-ring 1.5s ease-out infinite',
        }} />
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SupportCRMPage() {
  const [selectedTicket, setSelectedTicket] = useState<string>('TKT-8847');
  const [activeFilter, setActiveFilter] = useState('All');
  const [agentStatus, setAgentStatus] = useState<'Online' | 'Away' | 'Offline'>('Online');
  const [messages, setMessages] = useState<Message[]>(MESSAGES_INITIAL);
  const [isTyping, setIsTyping] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isNote, setIsNote] = useState(false);
  const [shiftSeconds, setShiftSeconds] = useState(9847);
  const [notification, setNotification] = useState<{ show: boolean; ticket: string }>({ show: false, ticket: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Shift timer
  useEffect(() => {
    const t = setInterval(() => setShiftSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Typing indicator + new message simulation
  useEffect(() => {
    const t1 = setTimeout(() => setIsTyping(true), 3000);
    const t2 = setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        sender: 'player',
        text: 'Are you still there? Any update on my withdrawal?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }, 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // New ticket notification after 8s
  useEffect(() => {
    const t = setTimeout(() => {
      setNotification({ show: true, ticket: 'TKT-8848' });
      setTimeout(() => setNotification({ show: false, ticket: '' }), 4000);
    }, 8000);
    return () => clearTimeout(t);
  }, []);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const formatShift = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const filteredTickets = TICKETS.filter(t => {
    const matchesFilter =
      activeFilter === 'All' ||
      (activeFilter === 'Urgent' && t.priority === 'urgent') ||
      (activeFilter === 'Open' && t.status === 'open') ||
      (activeFilter === 'Pending' && t.status === 'pending') ||
      (activeFilter === 'Resolved' && t.status === 'resolved');
    const matchesSearch =
      !searchQuery ||
      t.player.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusColors: Record<string, string> = { Online: '#22c55e', Away: '#f4c430', Offline: '#6b7280' };

  const sendMessage = () => {
    if (!messageInput.trim()) return;
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      sender: 'agent',
      text: messageInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      isNote,
    }]);
    setMessageInput('');
  };

  const quickReplies = ['Verify Identity', 'Check Payment', 'Escalate to Finance'];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; background: #0d0618; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #1a0d35; }
        ::-webkit-scrollbar-thumb { background: #3d1f6e; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #5a2d99; }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-18px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        @keyframes notifSlide {
          0% { transform: translateX(120%); opacity: 0; }
          15% { transform: translateX(0); opacity: 1; }
          80% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(120%); opacity: 0; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .ticket-item {
          animation: slideInLeft 0.35s ease both;
        }
        .msg-bubble {
          animation: fadeInUp 0.3s ease both;
        }
        .ticket-item:hover { background: rgba(61,31,110,0.5) !important; }
        .ticket-item.selected { background: rgba(61,31,110,0.75) !important; border-left-color: #f4c430 !important; }
        .quick-reply-btn:hover { background: rgba(244,196,48,0.15) !important; border-color: #f4c430 !important; color: #f4c430 !important; }
        .action-btn:hover { filter: brightness(1.15); transform: translateY(-1px); }
        .filter-tab:hover { color: #f0e8ff !important; }
        textarea:focus { outline: none; }
        input:focus { outline: none; }
        .status-select:focus { outline: none; }
      `}</style>

      <div style={{
        fontFamily: "'Inter', sans-serif",
        background: '#0d0618',
        minHeight: '100vh',
        color: '#f0e8ff',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '100vh',
      }}>

        {/* ── NOTIFICATION TOAST ── */}
        {notification.show && (
          <div style={{
            position: 'fixed', top: 80, right: 24, zIndex: 9999,
            background: 'linear-gradient(135deg, #251240, #1a0d35)',
            border: '1px solid #f4c430',
            borderRadius: 12, padding: '14px 20px',
            display: 'flex', alignItems: 'center', gap: 12,
            boxShadow: '0 8px 32px rgba(244,196,48,0.25)',
            animation: 'notifSlide 4s ease forwards',
            minWidth: 280,
          }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff2d78', flexShrink: 0, boxShadow: '0 0 8px #ff2d78' }} />
            <div>
              <div style={{ fontSize: 11, color: '#f4c430', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 2 }}>NEW URGENT TICKET</div>
              <div style={{ fontSize: 13, color: '#f0e8ff', fontWeight: 500 }}>{notification.ticket} — VIP Player Issue</div>
            </div>
            <div style={{
              marginLeft: 'auto', background: '#ff2d78', color: '#fff',
              fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
            }}>URGENT</div>
          </div>
        )}

        {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
        <header style={{
          background: 'linear-gradient(135deg, #1a0d35 0%, #251240 50%, #1a0d35 100%)',
          borderBottom: '1px solid rgba(244,196,48,0.2)',
          padding: '0 24px',
          height: 70,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          position: 'relative',
          zIndex: 10,
        }}>
          {/* Left: Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 10,
              background: 'linear-gradient(135deg, #f4c430, #f97316)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, boxShadow: '0 0 16px rgba(244,196,48,0.4)',
            }}>🎧</div>
            <div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 800, letterSpacing: '0.12em', color: '#f4c430', lineHeight: 1 }}>
                SUPPORT CENTER
              </div>
              <div style={{ fontSize: 11, color: '#7c6fa0', letterSpacing: '0.08em', marginTop: 2 }}>NEON PALACE CASINO — CRM v4.2</div>
            </div>
          </div>

          {/* Center: Stats */}
          <div style={{ display: 'flex', gap: 28 }}>
            {[
              { label: 'Open Tickets', value: '24', color: '#ff2d78' },
              { label: 'My Queue', value: '8', color: '#f4c430' },
              { label: 'Avg Response', value: '2.3 min', color: '#00d4c8' },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: stat.color, lineHeight: 1, fontFamily: "'Outfit', sans-serif" }}>{stat.value}</div>
                <div style={{ fontSize: 10, color: '#7c6fa0', letterSpacing: '0.06em', marginTop: 2 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Right: Agent info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Shift timer */}
            <div style={{
              background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,212,200,0.2)',
              borderRadius: 8, padding: '6px 14px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 10, color: '#00d4c8', letterSpacing: '0.08em', marginBottom: 1 }}>SHIFT TIME</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#f0e8ff', fontFamily: 'monospace' }}>{formatShift(shiftSeconds)}</div>
            </div>

            {/* Status */}
            <select
              className="status-select"
              value={agentStatus}
              onChange={e => setAgentStatus(e.target.value as 'Online' | 'Away' | 'Offline')}
              style={{
                background: 'rgba(0,0,0,0.4)', border: `1px solid ${statusColors[agentStatus]}`,
                color: statusColors[agentStatus], borderRadius: 8, padding: '6px 12px',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif",
              }}
            >
              <option value="Online">● Online</option>
              <option value="Away">● Away</option>
              <option value="Offline">● Offline</option>
            </select>

            {/* Agent */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ position: 'relative' }}>
                <AvatarCircle initials="SK" size={42} bg="linear-gradient(135deg,#5a2d99,#3d1f6e)" color="#f4c430" fontSize={15} />
                <div style={{
                  position: 'absolute', bottom: 1, right: 1, width: 11, height: 11,
                  borderRadius: '50%', background: statusColors[agentStatus],
                  border: '2px solid #1a0d35',
                }} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#f0e8ff' }}>Agent Sarah K.</div>
                <div style={{ fontSize: 11, color: statusColors[agentStatus] }}>{agentStatus}</div>
              </div>
            </div>
          </div>
        </header>

        {/* ══ THREE-COLUMN BODY ════════════════════════════════════════════════ */}
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '300px 1fr 320px',
          overflow: 'hidden',
          gap: 0,
        }}>

          {/* ── COLUMN 1: TICKET QUEUE ── */}
          <div style={{
            borderRight: '1px solid rgba(244,196,48,0.1)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: 'rgba(21,10,42,0.6)',
          }}>
            {/* Search */}
            <div style={{ padding: '16px 14px 10px' }}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#7c6fa0' }}>🔍</span>
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(124,111,160,0.3)',
                    borderRadius: 8, padding: '9px 10px 9px 32px', color: '#f0e8ff', fontSize: 13,
                    fontFamily: "'Inter', sans-serif",
                  }}
                />
              </div>
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', padding: '0 14px 10px', gap: 4, flexWrap: 'wrap' }}>
              {FILTER_TABS.map(tab => (
                <button
                  key={tab}
                  className="filter-tab"
                  onClick={() => setActiveFilter(tab)}
                  style={{
                    background: activeFilter === tab ? 'rgba(244,196,48,0.15)' : 'transparent',
                    border: activeFilter === tab ? '1px solid rgba(244,196,48,0.4)' : '1px solid rgba(124,111,160,0.2)',
                    color: activeFilter === tab ? '#f4c430' : '#7c6fa0',
                    borderRadius: 6, padding: '5px 10px', fontSize: 11, fontWeight: 600,
                    cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all 0.2s',
                    letterSpacing: '0.04em',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Count */}
            <div style={{ padding: '0 14px 8px', fontSize: 11, color: '#7c6fa0' }}>
              {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}
            </div>

            {/* Ticket list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 8px' }}>
              {filteredTickets.map((ticket, idx) => (
                <div
                  key={ticket.id}
                  className={`ticket-item${selectedTicket === ticket.id ? ' selected' : ''}`}
                  onClick={() => setSelectedTicket(ticket.id)}
                  style={{
                    borderLeft: `3px solid ${PRIORITY_COLORS[ticket.priority]}`,
                    borderRadius: '0 8px 8px 0',
                    padding: '10px 10px 10px 12px',
                    marginBottom: 4,
                    cursor: 'pointer',
                    background: selectedTicket === ticket.id ? 'rgba(61,31,110,0.75)' : 'rgba(37,18,64,0.5)',
                    transition: 'all 0.2s',
                    animationDelay: `${idx * 0.05}s`,
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                    <AvatarCircle initials={ticket.initials} size={30} bg="#2d1458" color="#f4c430" fontSize={11} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#f0e8ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ticket.player}
                        </span>
                        <span style={{ fontSize: 10, color: '#7c6fa0', flexShrink: 0, marginLeft: 4 }}>{ticket.time}</span>
                      </div>
                      <div style={{ fontSize: 10, color: '#7c6fa0' }}>{ticket.id}</div>
                    </div>
                    {ticket.unread > 0 && (
                      <div style={{
                        background: '#ff2d78', color: '#fff', borderRadius: 10,
                        fontSize: 10, fontWeight: 700, padding: '1px 6px', flexShrink: 0,
                        minWidth: 18, textAlign: 'center',
                      }}>{ticket.unread}</div>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#c4b5d4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 6 }}>
                    {ticket.subject}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      background: `${CATEGORY_COLORS[ticket.category]}20`,
                      color: CATEGORY_COLORS[ticket.category],
                      border: `1px solid ${CATEGORY_COLORS[ticket.category]}50`,
                      borderRadius: 4, padding: '2px 7px', fontSize: 10, fontWeight: 600,
                    }}>{ticket.category}</span>
                    <span style={{
                      background: `${PRIORITY_COLORS[ticket.priority]}15`,
                      color: PRIORITY_COLORS[ticket.priority],
                      borderRadius: 4, padding: '2px 7px', fontSize: 10, fontWeight: 600,
                      textTransform: 'capitalize',
                    }}>{ticket.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── COLUMN 2: CONVERSATION WINDOW ── */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: '#0f0820',
          }}>
            {/* Ticket Header */}
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid rgba(244,196,48,0.15)',
              background: 'linear-gradient(135deg,rgba(37,18,64,0.9),rgba(26,13,53,0.9))',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#f0e8ff', fontFamily: "'Outfit', sans-serif" }}>#TKT-8847</span>
                  <span style={{ fontSize: 14, color: '#7c6fa0' }}>—</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#f0e8ff' }}>Payment Issue</span>
                  <span style={{
                    background: 'rgba(255,45,120,0.15)', color: '#ff2d78',
                    border: '1px solid rgba(255,45,120,0.4)', borderRadius: 5,
                    padding: '2px 10px', fontSize: 11, fontWeight: 700,
                  }}>URGENT</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['Resolve', 'Escalate', 'Transfer'].map(btn => (
                    <button key={btn} className="action-btn" style={{
                      background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(124,111,160,0.3)',
                      color: '#c4b5d4', borderRadius: 7, padding: '5px 14px', fontSize: 12,
                      fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                      transition: 'all 0.2s',
                    }}>{btn}</button>
                  ))}
                </div>
              </div>
              {/* Player mini bar */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 16,
                background: 'rgba(0,0,0,0.25)', borderRadius: 8, padding: '7px 14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AvatarCircle initials="DK" size={28} bg="#3d1f6e" color="#f4c430" fontSize={10} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#f4c430' }}>DragonKing99</span>
                </div>
                <div style={{ width: 1, height: 20, background: 'rgba(124,111,160,0.3)' }} />
                <span style={{ fontSize: 12, color: '#00d4c8' }}>👑 VIP Gold</span>
                <div style={{ width: 1, height: 20, background: 'rgba(124,111,160,0.3)' }} />
                <span style={{ fontSize: 12, color: '#7c6fa0' }}>Member 2y 4m</span>
                <div style={{ width: 1, height: 20, background: 'rgba(124,111,160,0.3)' }} />
                <span style={{ fontSize: 12, color: '#7c6fa0' }}>ID: USR-441829</span>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                  <span style={{ fontSize: 11, color: '#22c55e' }}>Online Now</span>
                </div>
              </div>
            </div>

            {/* Message thread */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {messages.map((msg, idx) => (
                <div
                  key={msg.id}
                  className="msg-bubble"
                  style={{
                    animationDelay: `${idx * 0.04}s`,
                    display: 'flex',
                    flexDirection: msg.sender === 'agent' ? 'row-reverse' : 'row',
                    alignItems: 'flex-end',
                    gap: 10,
                    ...(msg.sender === 'system' ? { justifyContent: 'center' } : {}),
                  }}
                >
                  {msg.sender === 'system' ? (
                    <div style={{
                      background: 'rgba(0,212,200,0.08)', border: '1px solid rgba(0,212,200,0.2)',
                      borderRadius: 20, padding: '6px 16px', fontSize: 11, color: '#00d4c8',
                      fontStyle: 'italic', textAlign: 'center',
                    }}>
                      ⚙️ {msg.text} · {msg.time}
                    </div>
                  ) : (
                    <>
                      {msg.sender === 'player' && <AvatarCircle initials="DK" size={28} bg="#2d1458" color="#f4c430" fontSize={10} />}
                      <div style={{ maxWidth: '65%' }}>
                        <div style={{
                          background: msg.isNote
                            ? 'linear-gradient(135deg, rgba(244,196,48,0.18), rgba(244,196,48,0.08))'
                            : msg.sender === 'agent'
                              ? 'linear-gradient(135deg, #3d1f6e, #251240)'
                              : 'rgba(37,18,64,0.7)',
                          border: msg.isNote
                            ? '1px solid rgba(244,196,48,0.35)'
                            : msg.sender === 'agent'
                              ? '1px solid rgba(0,212,200,0.25)'
                              : '1px solid rgba(124,111,160,0.25)',
                          borderRadius: msg.sender === 'agent' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          padding: '10px 14px',
                          position: 'relative',
                          boxShadow: msg.sender === 'agent' ? '0 4px 16px rgba(0,212,200,0.1)' : 'none',
                        }}>
                          {msg.isNote && (
                            <div style={{ fontSize: 10, color: '#f4c430', fontWeight: 700, marginBottom: 4, letterSpacing: '0.06em' }}>
                              📋 INTERNAL NOTE
                            </div>
                          )}
                          <div style={{ fontSize: 13, color: '#f0e8ff', lineHeight: 1.5 }}>{msg.text}</div>
                        </div>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 4, marginTop: 4,
                          justifyContent: msg.sender === 'agent' ? 'flex-end' : 'flex-start',
                        }}>
                          <span style={{ fontSize: 10, color: '#7c6fa0' }}>{msg.time}</span>
                          {msg.sender === 'agent' && (
                            <span style={{ fontSize: 11, color: msg.read ? '#00d4c8' : '#7c6fa0' }}>
                              {msg.read ? '✓✓' : '✓'}
                            </span>
                          )}
                        </div>
                      </div>
                      {msg.sender === 'agent' && <AvatarCircle initials="SK" size={28} bg="linear-gradient(135deg,#5a2d99,#3d1f6e)" color="#f4c430" fontSize={10} />}
                    </>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
                  <AvatarCircle initials="DK" size={28} bg="#2d1458" color="#f4c430" fontSize={10} />
                  <div style={{
                    background: 'rgba(37,18,64,0.7)', border: '1px solid rgba(124,111,160,0.25)',
                    borderRadius: '16px 16px 16px 4px', padding: '12px 18px',
                    display: 'flex', gap: 5, alignItems: 'center',
                  }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: 7, height: 7, borderRadius: '50%', background: '#7c6fa0',
                        animation: `bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 10, color: '#7c6fa0', marginBottom: 4 }}>DragonKing99 is typing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div style={{
              padding: '14px 20px',
              borderTop: '1px solid rgba(244,196,48,0.12)',
              background: 'linear-gradient(135deg,rgba(26,13,53,0.95),rgba(21,10,42,0.95))',
              flexShrink: 0,
            }}>
              {/* Note toggle + quick replies */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <button
                  onClick={() => setIsNote(!isNote)}
                  style={{
                    background: isNote ? 'rgba(244,196,48,0.15)' : 'rgba(0,0,0,0.25)',
                    border: `1px solid ${isNote ? 'rgba(244,196,48,0.5)' : 'rgba(124,111,160,0.25)'}`,
                    color: isNote ? '#f4c430' : '#7c6fa0',
                    borderRadius: 6, padding: '5px 12px', fontSize: 11, fontWeight: 600,
                    cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all 0.2s',
                  }}
                >
                  📋 {isNote ? 'Note ON' : 'Add Note'}
                </button>
                <div style={{ width: 1, height: 20, background: 'rgba(124,111,160,0.25)' }} />
                {quickReplies.map(qr => (
                  <button
                    key={qr}
                    className="quick-reply-btn"
                    onClick={() => setMessageInput(prev => prev ? prev + ' ' + qr : qr)}
                    style={{
                      background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(124,111,160,0.25)',
                      color: '#c4b5d4', borderRadius: 6, padding: '5px 12px', fontSize: 11,
                      fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all 0.2s',
                    }}
                  >
                    ⚡ {qr}
                  </button>
                ))}
              </div>

              {/* Text + send */}
              <div style={{
                background: isNote ? 'rgba(244,196,48,0.05)' : 'rgba(0,0,0,0.3)',
                border: `1px solid ${isNote ? 'rgba(244,196,48,0.3)' : 'rgba(124,111,160,0.3)'}`,
                borderRadius: 10, overflow: 'hidden',
              }}>
                <textarea
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder={isNote ? '📋 Write internal note (not visible to player)...' : 'Type your message... (Enter to send)'}
                  rows={3}
                  style={{
                    width: '100%', background: 'transparent', border: 'none',
                    color: '#f0e8ff', fontSize: 13, padding: '12px 14px', resize: 'none',
                    fontFamily: "'Inter', sans-serif", lineHeight: 1.6,
                  }}
                />
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 14px', borderTop: '1px solid rgba(124,111,160,0.15)',
                }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {['📎', '😊', '🖼️'].map(icon => (
                      <button key={icon} style={{
                        background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: '2px 4px',
                        borderRadius: 4, transition: 'background 0.2s',
                      }}>{icon}</button>
                    ))}
                    <span style={{ fontSize: 11, color: '#7c6fa0', alignSelf: 'center' }}>
                      {messageInput.length}/2000
                    </span>
                  </div>
                  <button
                    onClick={sendMessage}
                    style={{
                      background: 'linear-gradient(135deg, #f4c430, #f97316)',
                      border: 'none', borderRadius: 8, padding: '8px 22px',
                      color: '#0d0618', fontSize: 13, fontWeight: 800,
                      cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                      boxShadow: '0 4px 12px rgba(244,196,48,0.35)',
                      transition: 'all 0.2s',
                      letterSpacing: '0.04em',
                    }}
                  >
                    SEND ➤
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── COLUMN 3: PLAYER SUMMARY ── */}
          <div style={{
            borderLeft: '1px solid rgba(244,196,48,0.1)',
            overflowY: 'auto',
            padding: '16px',
            background: 'rgba(21,10,42,0.6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}>
            {/* Player Card */}
            <div style={{
              background: 'linear-gradient(135deg, #251240, #1a0d35)',
              border: '1px solid rgba(244,196,48,0.2)',
              borderRadius: 14, padding: '18px',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: 10 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #5a2d99, #3d1f6e)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, fontWeight: 700, color: '#f4c430',
                  border: '3px solid rgba(244,196,48,0.4)',
                  boxShadow: '0 0 20px rgba(244,196,48,0.2)',
                }}>DK</div>
                <div style={{
                  position: 'absolute', top: -6, right: -6, fontSize: 20,
                  filter: 'drop-shadow(0 0 4px rgba(244,196,48,0.6))',
                }}>👑</div>
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#f0e8ff', fontFamily: "'Outfit', sans-serif", marginBottom: 2 }}>DragonKing99</div>
              <div style={{ fontSize: 11, color: '#7c6fa0', marginBottom: 8 }}>USR-441829 · 🇬🇧 United Kingdom</div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(244,196,48,0.12)', border: '1px solid rgba(244,196,48,0.35)', color: '#f4c430', borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 700 }}>👑 VIP GOLD</span>
                <span style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)', color: '#22c55e', borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 700 }}>● ACTIVE</span>
              </div>
              <div style={{ fontSize: 11, color: '#7c6fa0', marginTop: 8 }}>Member since Mar 12, 2022</div>
            </div>

            {/* Stats Grid */}
            <div style={{
              background: 'rgba(37,18,64,0.5)', border: '1px solid rgba(124,111,160,0.15)',
              borderRadius: 12, padding: 14,
            }}>
              <div style={{ fontSize: 11, color: '#7c6fa0', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 12 }}>PLAYER STATISTICS</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Lifetime Deposits', value: '$12,450', color: '#22c55e' },
                  { label: 'Total Withdrawals', value: '$8,200', color: '#ff2d78' },
                  { label: 'Net Win/Loss', value: '+$1,340', color: '#f4c430' },
                  { label: 'Fav. Game', value: 'Neon Slots', color: '#00d4c8' },
                  { label: 'Last Login', value: '2h ago', color: '#f0e8ff' },
                  { label: 'Sessions/Week', value: '14', color: '#a855f7' },
                ].map(s => (
                  <div key={s.label} style={{
                    background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '8px 10px',
                  }}>
                    <div style={{ fontSize: 10, color: '#7c6fa0', marginBottom: 3 }}>{s.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div style={{
              background: 'rgba(37,18,64,0.5)', border: '1px solid rgba(124,111,160,0.15)',
              borderRadius: 12, padding: 14,
            }}>
              <div style={{ fontSize: 11, color: '#7c6fa0', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 12 }}>RECENT TRANSACTIONS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {TRANSACTIONS.map((tx, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'rgba(0,0,0,0.2)', borderRadius: 7, padding: '7px 10px',
                  }}>
                    <div>
                      <div style={{ fontSize: 12, color: '#f0e8ff', fontWeight: 600 }}>{tx.type}</div>
                      <div style={{ fontSize: 10, color: '#7c6fa0' }}>{tx.date}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: 13, fontWeight: 700,
                        color: tx.amount.startsWith('+') ? '#22c55e' : tx.amount.startsWith('-') ? '#ff2d78' : '#f4c430',
                      }}>{tx.amount}</div>
                      <div style={{
                        fontSize: 10, fontWeight: 600,
                        color: tx.status === 'completed' ? '#22c55e' : tx.status === 'pending' ? '#f4c430' : '#ff2d78',
                      }}>{tx.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Tickets */}
            <div style={{
              background: 'rgba(37,18,64,0.5)', border: '1px solid rgba(124,111,160,0.15)',
              borderRadius: 12, padding: 14,
            }}>
              <div style={{ fontSize: 11, color: '#7c6fa0', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 12 }}>TICKET HISTORY</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {RECENT_TICKETS.map((rt, i) => (
                  <div key={i} style={{
                    background: 'rgba(0,0,0,0.2)', borderRadius: 7, padding: '8px 10px',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <div style={{
                      width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                      background: '#22c55e',
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: '#f0e8ff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rt.subject}</div>
                      <div style={{ fontSize: 10, color: '#7c6fa0' }}>{rt.id} · {rt.date}</div>
                    </div>
                    <span style={{ fontSize: 10, color: '#22c55e', fontWeight: 600, flexShrink: 0 }}>Resolved</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="action-btn" style={{
                background: 'linear-gradient(135deg, rgba(0,212,200,0.15), rgba(0,212,200,0.05))',
                border: '1px solid rgba(0,212,200,0.4)', color: '#00d4c8',
                borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all 0.2s',
                letterSpacing: '0.04em',
              }}>
                👤 View Full Profile
              </button>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button className="action-btn" style={{
                  background: 'rgba(244,196,48,0.08)', border: '1px solid rgba(244,196,48,0.3)',
                  color: '#f4c430', borderRadius: 8, padding: '8px 10px', fontSize: 12,
                  fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all 0.2s',
                }}>📋 Add Note</button>
                <button className="action-btn" style={{
                  background: 'rgba(255,45,120,0.08)', border: '1px solid rgba(255,45,120,0.3)',
                  color: '#ff2d78', borderRadius: 8, padding: '8px 10px', fontSize: 12,
                  fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all 0.2s',
                }}>🚩 Flag Account</button>
              </div>
              <button className="action-btn" style={{
                background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(249,115,22,0.05))',
                border: '1px solid rgba(249,115,22,0.4)', color: '#f97316',
                borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all 0.2s',
                letterSpacing: '0.04em',
              }}>
                ⬆️ Escalate to Manager
              </button>
            </div>
          </div>
        </div>

        {/* ══ BOTTOM STATUS BAR ════════════════════════════════════════════════ */}
        <footer style={{
          background: 'linear-gradient(135deg, #150a2a, #1a0d35)',
          borderTop: '1px solid rgba(244,196,48,0.12)',
          padding: '8px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          height: 40,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <StatusDot color="#22c55e" pulse />
              <span style={{ fontSize: 11, color: '#7c6fa0' }}>
                <span style={{ color: '#22c55e', fontWeight: 700 }}>6 agents</span> online
              </span>
            </div>
            <div style={{ width: 1, height: 16, background: 'rgba(124,111,160,0.25)' }} />
            <div style={{ fontSize: 11, color: '#7c6fa0' }}>
              Queue: <span style={{ color: '#f0e8ff', fontWeight: 600 }}>24 open</span> · <span style={{ color: '#ff2d78', fontWeight: 600 }}>8 urgent</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <StatusDot color="#22c55e" pulse />
            <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>All Systems Operational</span>
            <span style={{ fontSize: 11, color: '#7c6fa0', marginLeft: 4 }}>· Last check: 30s ago</span>
          </div>

          <div style={{ fontSize: 11, color: '#7c6fa0', fontFamily: 'monospace' }}>
            v4.2.1 · {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        </footer>
      </div>
    </>
  );
}
