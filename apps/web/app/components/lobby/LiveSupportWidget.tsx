'use client';

import { useState, useEffect, useRef } from 'react';
import { HeadsetIcon } from '../icons';
import {
  appendMessage,
  claimTicket,
  createTicket,
  loadCrm,
  subscribeCrm,
  type CrmTicket,
} from '../crm/crm-mock';

const GUEST_TICKET_KEY = 'casino_crm_my_ticket_id';
const CANNED_AGENT_REPLIES = [
  "Thanks for reaching out! I'm looking into this for you now.",
  'Got it — give me just a moment to check your account.',
  "I've flagged this as priority and I'm reviewing the details now.",
];

export default function LiveSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [ticket, setTicket] = useState<CrmTicket | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const replyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Demo-safe CRM ticket store (localStorage-backed, no backend) — see crm-mock.ts
  useEffect(() => {
    const savedId = typeof window !== 'undefined' ? window.localStorage.getItem(GUEST_TICKET_KEY) : null;
    if (savedId) {
      const state = loadCrm();
      const existing = state.tickets.find(t => t.id === savedId);
      if (existing) setTicket(existing);
    }
    const unsubscribe = subscribeCrm(() => {
      setTicket(prev => {
        if (!prev) return prev;
        const state = loadCrm();
        return state.tickets.find(t => t.id === prev.id) ?? prev;
      });
    });
    return () => {
      unsubscribe();
      if (replyTimerRef.current) clearTimeout(replyTimerRef.current);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages.length, isOpen]);

  useEffect(() => {
    if (isOpen) setUnreadCount(0);
  }, [isOpen, ticket?.messages.length]);

  function scheduleDemoAgentReply(ticketId: string) {
    if (replyTimerRef.current) clearTimeout(replyTimerRef.current);
    setIsTyping(true);
    replyTimerRef.current = setTimeout(() => {
      setIsTyping(false);
      claimTicket(ticketId, 'AGT-001');
      const reply = CANNED_AGENT_REPLIES[Math.floor(Math.random() * CANNED_AGENT_REPLIES.length)]!;
      appendMessage(ticketId, 'agent', reply, 'Sarah K.');
      const state = loadCrm();
      const updated = state.tickets.find(t => t.id === ticketId);
      if (updated) setTicket(updated);
      if (!isOpen) setUnreadCount(c => c + 1);
    }, 1500);
  }

  const sendMessage = () => {
    const text = inputValue.trim();
    if (!text) return;
    setInputValue('');

    if (!ticket) {
      const created = createTicket('You', 'Live chat support request', text);
      if (typeof window !== 'undefined') window.localStorage.setItem(GUEST_TICKET_KEY, created.id);
      setTicket(created);
      scheduleDemoAgentReply(created.id);
      return;
    }

    appendMessage(ticket.id, 'player', text, 'You');
    const state = loadCrm();
    const updated = state.tickets.find(t => t.id === ticket.id);
    if (updated) setTicket(updated);
    if (!ticket.assignedAgentId) scheduleDemoAgentReply(ticket.id);
  };

  const agentOnline = !ticket || ticket.status !== 'closed';
  const displayMessages = ticket
    ? ticket.messages.filter(m => m.sender !== 'system')
    : [{ id: 'welcome', sender: 'agent' as const, text: 'Welcome to Neon Palace Support! How can I help you today?', time: '' }];

  return (
    <>
      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
      
      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: 100,
          right: 24,
          width: 380,
          height: isMinimized ? 60 : 520,
          borderRadius: 16,
          background: 'linear-gradient(135deg, #1a0d35 0%, #0d0618 100%)',
          border: '1px solid rgba(244,196,48,0.3)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 20px rgba(244,196,48,0.1)',
          zIndex: 1000,
          overflow: 'hidden',
          animation: 'chatSlideUp 0.3s ease-out',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 18px',
            background: 'linear-gradient(135deg, #3d1f6e, #251240)',
            borderBottom: '1px solid rgba(244,196,48,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f4c430, #f97316)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16,
                }}><HeadsetIcon size={16} color="#f4c430" /></div>
                <div style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 12, height: 12, borderRadius: '50%',
                  background: agentOnline ? '#22c55e' : '#6b7280',
                  border: '2px solid #1a0d35',
                  boxShadow: agentOnline ? '0 0 8px #22c55e' : 'none',
                }} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#f4c430' }}>Live Support</div>
                <div style={{ fontSize: 11, color: agentOnline ? '#22c55e' : '#6b7280', fontWeight: 600 }}>
                  {ticket
                    ? ticket.status === 'closed'
                      ? '● Ticket Closed'
                      : ticket.assignedAgentId
                      ? `● Agent Connected${ticket.assignedAgentId === 'AGT-001' ? ' — Sarah K.' : ''}`
                      : '● Waiting for Agent'
                    : '● Agents Online'}
                </div>
                {ticket && (
                  <div style={{ fontSize: 9, color: '#7c6fa0', fontFamily: 'monospace', marginTop: 1 }}>{ticket.id}</div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                style={{
                  background: 'rgba(255,255,255,0.1)', border: 'none',
                  color: '#c4b5d4', borderRadius: 6, padding: '6px 10px',
                  fontSize: 14, cursor: 'pointer',
                }}
              >
                {isMinimized ? '▲' : '−'}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255,45,120,0.2)', border: '1px solid rgba(255,45,120,0.3)',
                  color: '#ff2d78', borderRadius: 6, padding: '6px 10px',
                  fontSize: 14, cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                background: 'rgba(13,6,24,0.5)',
              }}>
                {displayMessages.map(msg => (
                  <div key={msg.id} style={{
                    display: 'flex',
                    flexDirection: msg.sender === 'player' ? 'row-reverse' : 'row',
                    gap: 8,
                  }}>
                    <div style={{
                      maxWidth: '75%',
                      background: msg.sender === 'player'
                        ? 'linear-gradient(135deg, #7c3aed, #5b21b6)'
                        : 'rgba(61,31,110,0.6)',
                      border: msg.sender === 'player'
                        ? '1px solid rgba(244,196,48,0.4)'
                        : '1px solid rgba(244,196,48,0.2)',
                      borderRadius: msg.sender === 'player' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      padding: '10px 14px',
                    }}>
                      <div style={{ fontSize: 13, color: '#f1efe9', lineHeight: 1.5 }}>{msg.text}</div>
                      <div style={{ fontSize: 10, color: '#7c6fa0', marginTop: 4 }}>
                        {msg.time ? new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{
                      background: 'rgba(61,31,110,0.6)',
                      border: '1px solid rgba(244,196,48,0.2)',
                      borderRadius: '16px 16px 16px 4px',
                      padding: '10px 14px',
                      display: 'flex', gap: 4, alignItems: 'center',
                    }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{
                          width: 6, height: 6, borderRadius: '50%', background: '#7c6fa0',
                          animation: `bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
                        }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{
                padding: '12px',
                borderTop: '1px solid rgba(244,196,48,0.15)',
                background: 'rgba(26,13,53,0.8)',
              }}>
                <div style={{
                  display: 'flex', gap: 8,
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(124,111,160,0.3)',
                  borderRadius: 10,
                  padding: '8px 12px',
                }}>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
                    placeholder="Type your message..."
                    style={{
                      flex: 1, background: 'transparent', border: 'none',
                      color: '#f1efe9', fontSize: 13, outline: 'none',
                    }}
                  />
                  <button
                    onClick={sendMessage}
                    style={{
                      background: 'linear-gradient(135deg, #f4c430, #f97316)',
                      border: 'none', borderRadius: 8, padding: '6px 16px',
                      color: '#0d0618', fontSize: 12, fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    SEND
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f4c430, #f97316)',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(244,196,48,0.4)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          transition: 'transform 0.2s',
          animation: isOpen ? 'none' : 'pulse 2s ease-in-out infinite',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {isOpen ? (
          '✕'
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 6a3 3 0 013-3h10a3 3 0 013 3v8a3 3 0 01-3 3H9l-4.2 3.4a.8.8 0 01-1.3-.6V6z" fill="#fff" />
          </svg>
        )}
        {!isOpen && unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -2, right: -2,
            width: 20, height: 20, borderRadius: '50%',
            background: '#ff2d78', color: '#fff', fontSize: 11, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid #0d0618',
          }}>{unreadCount}</span>
        )}
      </button>
    </>
  );
}
