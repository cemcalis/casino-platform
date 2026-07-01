'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  loadCrm,
  subscribeCrm,
  claimTicket,
  setTicketStatus as crmSetTicketStatus,
  setTicketPriority as crmSetTicketPriority,
  appendMessage,
  setAgentOnline,
  activeChatsForAgent,
  ticketCountsByStatus,
  createTicket,
  type CrmTicket,
  type CrmAgent,
  type TicketStatus,
} from './components/crm/crm-mock';

// The signed-in agent for this demo CRM session (matches crm-mock seed data)
const CURRENT_AGENT_ID = 'AGT-001';
const CURRENT_AGENT_NAME = 'Sarah K.';

interface Transaction {
  type: string;
  amount: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

function initialsOf(name: string): string {
  const parts = name.replace(/[^a-zA-Z0-9 ]/g, ' ').trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? parts[0]?.[1] ?? '')).toUpperCase();
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.floor(diffMs / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

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

const FILTER_TABS = ['All', 'New', 'Open', 'Pending', 'Closed'];

// ─── Automatic assignment: claim the oldest unclaimed ticket for the
// online agent currently carrying the fewest active chats ─────────────────────
function pickAgentForAutoAssign(agents: CrmAgent[], tickets: CrmTicket[]): CrmAgent | null {
  const online = agents.filter(a => a.online);
  if (online.length === 0) return null;
  const state = { tickets, agents };
  return online.reduce((best, a) =>
    activeChatsForAgent(state, a.id) < activeChatsForAgent(state, best.id) ? a : best
  );
}

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
  const [crm, setCrm] = useState(() => loadCrm());
  const tickets = crm.tickets;
  const agents = crm.agents;
  const currentAgent = agents.find(a => a.id === CURRENT_AGENT_ID) ?? agents[0];

  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets[0]?.id ?? '');
  const [activeFilter, setActiveFilter] = useState('All');
  const [agentStatus, setAgentStatus] = useState<'Online' | 'Away' | 'Offline'>('Online');
  const [messageInput, setMessageInput] = useState('');
  const [isNote, setIsNote] = useState(false);
  const [shiftSeconds, setShiftSeconds] = useState(0);
  const [notification, setNotification] = useState<{ show: boolean; ticket: string }>({ show: false, ticket: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [autoAssignEnabled, setAutoAssignEnabled] = useState(true);
  const [assignmentLog, setAssignmentLog] = useState<Array<{ ticketId: string; agentName: string; timestamp: string }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedTicket = tickets.find(t => t.id === selectedTicketId) ?? null;

  // Re-read the CRM store whenever it changes (this tab or another tab/app)
  useEffect(() => {
    return subscribeCrm(() => setCrm(loadCrm()));
  }, []);

  // Agent goes online and the shift timer starts the moment this panel opens
  useEffect(() => {
    setAgentOnline(CURRENT_AGENT_ID, true);
    setCrm(loadCrm());
    const t = setInterval(() => setShiftSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // New ticket notification — simulates a fresh demo ticket arriving
  useEffect(() => {
    const t = setTimeout(() => {
      const created = createTicket('VIPStar_Mia', 'VIP cashback not credited', 'My weekly cashback never showed up in my wallet.', 'VIP', 'urgent');
      setCrm(loadCrm());
      setNotification({ show: true, ticket: created.id });
      setTimeout(() => setNotification({ show: false, ticket: '' }), 4000);
    }, 8000);
    return () => clearTimeout(t);
  }, []);

  // Auto-assign: claim any unclaimed ticket for the least-busy online agent
  useEffect(() => {
    if (!autoAssignEnabled) return;
    const unclaimed = tickets.filter(t => !t.assignedAgentId && t.status !== 'closed');
    if (unclaimed.length === 0) return;
    unclaimed.forEach(ticket => {
      const agent = pickAgentForAutoAssign(agents, tickets);
      if (agent) {
        claimTicket(ticket.id, agent.id);
        setAssignmentLog(prev => [...prev, { ticketId: ticket.id, agentName: agent.name, timestamp: new Date().toLocaleTimeString() }]);
      }
    });
    setCrm(loadCrm());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoAssignEnabled, tickets.length]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedTicket?.messages.length]);

  const formatShift = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const filteredTickets = tickets.filter(t => {
    const matchesFilter =
      activeFilter === 'All' ||
      (activeFilter === 'New' && t.status === 'new') ||
      (activeFilter === 'Open' && t.status === 'open') ||
      (activeFilter === 'Pending' && t.status === 'pending') ||
      (activeFilter === 'Closed' && t.status === 'closed');
    const matchesSearch =
      !searchQuery ||
      t.player.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusColors: Record<string, string> = { Online: '#22c55e', Away: '#f4c430', Offline: '#6b7280' };

  function handleAgentStatusChange(value: 'Online' | 'Away' | 'Offline') {
    setAgentStatus(value);
    setAgentOnline(CURRENT_AGENT_ID, value !== 'Offline');
    setCrm(loadCrm());
  }

  function handleClaim(ticketId: string) {
    claimTicket(ticketId, CURRENT_AGENT_ID);
    setCrm(loadCrm());
  }

  function handleTicketStatus(ticketId: string, status: TicketStatus) {
    crmSetTicketStatus(ticketId, status);
    setCrm(loadCrm());
  }

  const sendMessage = () => {
    if (!messageInput.trim() || !selectedTicket) return;
    appendMessage(selectedTicket.id, 'agent', messageInput.trim(), CURRENT_AGENT_NAME, isNote);
    setCrm(loadCrm());
    setMessageInput('');
  };

  const quickReplies = ['Verify Identity', 'Check Payment', 'Escalate to Finance'];

  const todayHandled = currentAgent?.handledToday ?? 0;
  const myActiveChats = currentAgent ? activeChatsForAgent(crm, currentAgent.id) : 0;
  const avgResponseLabel = currentAgent ? `${(currentAgent.avgResponseSeconds / 60).toFixed(1)} min` : '—';
  const counts = ticketCountsByStatus(crm);
  const onlineAgentCount = agents.filter(a => a.online).length;

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
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(168,137,247,0.15)', border: '1px solid rgba(168,137,247,0.4)', borderRadius: 8, padding: '4px 12px' }}>
              <span style={{ color: '#a855f7', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em' }}>DEMO STAFF PORTAL</span>
            </div>
          </div>

          {/* Center: Stats */}
          <div style={{ display: 'flex', gap: 28 }}>
            {[
              { label: 'Handled Today', value: String(todayHandled), color: '#ff2d78' },
              { label: 'Active Chats', value: String(myActiveChats), color: '#f4c430' },
              { label: 'Avg Response', value: avgResponseLabel, color: '#00d4c8' },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: stat.color, lineHeight: 1, fontFamily: "'Outfit', sans-serif" }}>{stat.value}</div>
                <div style={{ fontSize: 10, color: '#7c6fa0', letterSpacing: '0.06em', marginTop: 2 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Right: Agent info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Auto-assign toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 11, color: '#7c6fa0', fontWeight: 600, letterSpacing: '0.06em' }}>AUTO-ASSIGN</div>
              <button
                onClick={() => setAutoAssignEnabled(!autoAssignEnabled)}
                style={{
                  width: 44, height: 24, borderRadius: 12,
                  background: autoAssignEnabled ? '#22c55e' : 'rgba(107,114,128,0.3)',
                  border: 'none', cursor: 'pointer', position: 'relative',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: '#fff',
                  position: 'absolute', top: 3,
                  left: autoAssignEnabled ? 23 : 3,
                  transition: 'all 0.2s',
                }} />
              </button>
            </div>

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
              onChange={e => handleAgentStatusChange(e.target.value as 'Online' | 'Away' | 'Offline')}
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
                  className={`ticket-item${selectedTicketId === ticket.id ? ' selected' : ''}`}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  style={{
                    borderLeft: `3px solid ${PRIORITY_COLORS[ticket.priority]}`,
                    borderRadius: '0 8px 8px 0',
                    padding: '10px 10px 10px 12px',
                    marginBottom: 4,
                    cursor: 'pointer',
                    background: selectedTicketId === ticket.id ? 'rgba(61,31,110,0.75)' : 'rgba(37,18,64,0.5)',
                    transition: 'all 0.2s',
                    animationDelay: `${idx * 0.05}s`,
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                    <AvatarCircle initials={initialsOf(ticket.player)} size={30} bg="#2d1458" color="#f4c430" fontSize={11} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#f0e8ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ticket.player}
                        </span>
                        <span style={{ fontSize: 10, color: '#7c6fa0', flexShrink: 0, marginLeft: 4 }}>{relativeTime(ticket.updatedAt)}</span>
                      </div>
                      <div style={{ fontSize: 10, color: '#7c6fa0' }}>{ticket.id}</div>
                    </div>
                    {!ticket.assignedAgentId && ticket.status !== 'closed' && (
                      <div style={{
                        background: '#ff2d78', color: '#fff', borderRadius: 10,
                        fontSize: 9, fontWeight: 700, padding: '1px 6px', flexShrink: 0,
                      }}>NEW</div>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#c4b5d4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 6 }}>
                    {ticket.subject}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
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
                    <span style={{
                      background: 'rgba(124,111,160,0.15)', color: '#c4b5d4',
                      borderRadius: 4, padding: '2px 7px', fontSize: 10, fontWeight: 600,
                      textTransform: 'capitalize',
                    }}>{ticket.status}</span>
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
              {!selectedTicket ? (
                <div style={{ fontSize: 13, color: '#7c6fa0', padding: '8px 0' }}>Select a ticket from the queue to view the conversation.</div>
              ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#f0e8ff', fontFamily: "'Outfit', sans-serif" }}>#{selectedTicket.id}</span>
                  <span style={{ fontSize: 14, color: '#7c6fa0' }}>—</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#f0e8ff' }}>{selectedTicket.subject}</span>
                  <span style={{
                    background: `${PRIORITY_COLORS[selectedTicket.priority]}22`,
                    color: PRIORITY_COLORS[selectedTicket.priority],
                    border: `1px solid ${PRIORITY_COLORS[selectedTicket.priority]}66`, borderRadius: 5,
                    padding: '2px 10px', fontSize: 11, fontWeight: 700,
                  }}>{selectedTicket.priority.toUpperCase()}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {!selectedTicket.assignedAgentId && (
                    <button onClick={() => handleClaim(selectedTicket.id)} className="action-btn" style={{
                      background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)',
                      color: '#22c55e', borderRadius: 7, padding: '5px 14px', fontSize: 12,
                      fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                    }}>Claim Ticket</button>
                  )}
                  {/* Status selector */}
                  <select
                    value={selectedTicket.status}
                    onChange={e => handleTicketStatus(selectedTicket.id, e.target.value as TicketStatus)}
                    style={{
                      background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(124,111,160,0.3)',
                      color: '#c4b5d4', borderRadius: 7, padding: '5px 12px', fontSize: 12,
                      fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    <option value="new">⚪ New</option>
                    <option value="open">🔴 Open</option>
                    <option value="pending">🟡 Pending</option>
                    <option value="closed">🟢 Closed</option>
                  </select>
                  {/* Priority selector */}
                  <select
                    value={selectedTicket.priority}
                    onChange={e => { crmSetTicketPriority(selectedTicket.id, e.target.value as 'urgent' | 'high' | 'medium' | 'low'); setCrm(loadCrm()); }}
                    style={{
                      background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(124,111,160,0.3)',
                      color: '#c4b5d4', borderRadius: 7, padding: '5px 12px', fontSize: 12,
                      fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    <option value="urgent">🔴 Urgent</option>
                    <option value="high">🟠 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🔵 Low</option>
                  </select>
                  {selectedTicket.status === 'closed' ? (
                    <button onClick={() => handleTicketStatus(selectedTicket.id, 'open')} className="action-btn" style={{
                      background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(124,111,160,0.3)',
                      color: '#c4b5d4', borderRadius: 7, padding: '5px 14px', fontSize: 12,
                      fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                    }}>Reopen</button>
                  ) : (
                    <button onClick={() => handleTicketStatus(selectedTicket.id, 'closed')} className="action-btn" style={{
                      background: 'rgba(255,45,120,0.12)', border: '1px solid rgba(255,45,120,0.35)',
                      color: '#ff2d78', borderRadius: 7, padding: '5px 14px', fontSize: 12,
                      fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                    }}>Close Ticket</button>
                  )}
                </div>
              </div>
              )}
              {/* Player mini bar */}
              {selectedTicket && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 16,
                background: 'rgba(0,0,0,0.25)', borderRadius: 8, padding: '7px 14px', flexWrap: 'wrap',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AvatarCircle initials={initialsOf(selectedTicket.player)} size={28} bg="#3d1f6e" color="#f4c430" fontSize={10} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#f4c430' }}>{selectedTicket.player}</span>
                </div>
                <div style={{ width: 1, height: 20, background: 'rgba(124,111,160,0.3)' }} />
                <span style={{ fontSize: 12, color: '#00d4c8' }}>{selectedTicket.category}</span>
                <div style={{ width: 1, height: 20, background: 'rgba(124,111,160,0.3)' }} />
                <span style={{ fontSize: 12, color: '#7c6fa0' }}>
                  Assigned: {selectedTicket.assignedAgentId ? agents.find(a => a.id === selectedTicket.assignedAgentId)?.name ?? selectedTicket.assignedAgentId : 'Unassigned'}
                </span>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                  <span style={{ fontSize: 11, color: '#22c55e' }}>Online Now</span>
                </div>
              </div>
              )}
            </div>

            {/* Message thread */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {(selectedTicket?.messages ?? []).map((msg, idx) => (
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
                      ⚙️ {msg.text} · {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                          <span style={{ fontSize: 10, color: '#7c6fa0' }}>
                            {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {msg.sender === 'agent' && (
                            <span style={{ fontSize: 11, color: '#00d4c8' }}>✓✓</span>
                          )}
                        </div>
                      </div>
                      {msg.sender === 'agent' && <AvatarCircle initials="SK" size={28} bg="linear-gradient(135deg,#5a2d99,#3d1f6e)" color="#f4c430" fontSize={10} />}
                    </>
                  )}
                </div>
              ))}
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
            {/* Assignment Log */}
            {autoAssignEnabled && assignmentLog.length > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, #251240, #1a0d35)',
                border: '1px solid rgba(34,197,94,0.3)',
                borderRadius: 12, padding: '14px',
                boxShadow: '0 4px 16px rgba(34,197,94,0.1)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 14 }}>🤖</span>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#22c55e' }}>Auto-Assignment Log</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 150, overflowY: 'auto' }}>
                  {assignmentLog.slice(-5).reverse().map((log, idx) => (
                    <div key={idx} style={{
                      background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
                      borderRadius: 6, padding: '8px 10px', fontSize: 11,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span style={{ color: '#22c55e', fontWeight: 600 }}>{log.ticketId}</span>
                        <span style={{ color: '#7c6fa0' }}>{log.timestamp}</span>
                      </div>
                      <div style={{ color: '#c4b5d4' }}>→ Assigned to {log.agentName}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                }}>{selectedTicket ? initialsOf(selectedTicket.player) : '—'}</div>
                <div style={{
                  position: 'absolute', top: -6, right: -6, fontSize: 20,
                  filter: 'drop-shadow(0 0 4px rgba(244,196,48,0.6))',
                }}>👑</div>
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#f0e8ff', fontFamily: "'Outfit', sans-serif", marginBottom: 2 }}>{selectedTicket?.player ?? 'No player selected'}</div>
              <div style={{ fontSize: 11, color: '#7c6fa0', marginBottom: 8 }}>Demo player profile · mock data</div>
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
                <span style={{ color: '#22c55e', fontWeight: 700 }}>{onlineAgentCount} agent{onlineAgentCount !== 1 ? 's' : ''}</span> online
              </span>
            </div>
            <div style={{ width: 1, height: 16, background: 'rgba(124,111,160,0.25)' }} />
            <div style={{ fontSize: 11, color: '#7c6fa0' }}>
              Queue: <span style={{ color: '#f0e8ff', fontWeight: 600 }}>{counts.new + counts.open + counts.pending} open</span> · <span style={{ color: '#ff2d78', fontWeight: 600 }}>{tickets.filter(t => t.priority === 'urgent' && t.status !== 'closed').length} urgent</span>
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
