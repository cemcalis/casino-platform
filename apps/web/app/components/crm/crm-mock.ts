// Demo-safe mock CRM store shared by the web live-chat widget, the support
// agent panel, and the admin oversight panel. There is no backend — state is
// persisted to localStorage so a refresh doesn't lose the demo session.
//
// This exact module is mirrored (not imported) in apps/support and
// apps/admin because each app is an independent Next.js deployment on its
// own origin/port, so a real shared workspace package or cross-origin
// localStorage sync isn't possible without a backend. Keep the type shapes
// and function names in sync across the three copies if you change this file.

export type TicketStatus = 'new' | 'open' | 'pending' | 'closed';
export type TicketPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TicketCategory = 'Payment' | 'Account' | 'Technical' | 'Bonus' | 'VIP';
export type MessageSender = 'player' | 'agent' | 'system';

export interface CrmMessage {
  id: string;
  sender: MessageSender;
  senderName?: string;
  text: string;
  time: string; // ISO timestamp
  isNote?: boolean; // internal note — not visible to the player
}

export interface CrmTicket {
  id: string;
  player: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignedAgentId: string | null;
  createdAt: string;
  updatedAt: string;
  messages: CrmMessage[];
}

export interface CrmAgent {
  id: string;
  name: string;
  initials: string;
  online: boolean;
  shiftStartedAt: string | null;
  handledToday: number;
  avgResponseSeconds: number;
}

export interface CrmState {
  tickets: CrmTicket[];
  agents: CrmAgent[];
}

const STORAGE_KEY = 'casino_crm_demo_v1';
const EVENT_NAME = 'casino-crm-updated';

function nowIso() {
  return new Date().toISOString();
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function seedState(): CrmState {
  const agents: CrmAgent[] = [
    { id: 'AGT-001', name: 'Sarah K.', initials: 'SK', online: true, shiftStartedAt: null, handledToday: 14, avgResponseSeconds: 72 },
    { id: 'AGT-002', name: 'Mike R.', initials: 'MR', online: true, shiftStartedAt: null, handledToday: 9, avgResponseSeconds: 108 },
    { id: 'AGT-003', name: 'Emma L.', initials: 'EL', online: false, shiftStartedAt: null, handledToday: 6, avgResponseSeconds: 126 },
    { id: 'AGT-004', name: 'David C.', initials: 'DC', online: false, shiftStartedAt: null, handledToday: 3, avgResponseSeconds: 90 },
  ];

  const tickets: CrmTicket[] = [
    {
      id: 'TKT-8847', player: 'DragonKing99', subject: 'Withdrawal not received after 48h',
      category: 'Payment', priority: 'urgent',
      status: 'open', assignedAgentId: 'AGT-001', createdAt: nowIso(), updatedAt: nowIso(),
      messages: [
        { id: uid('MSG'), sender: 'system', text: 'Ticket opened — Payment Issue reported', time: nowIso() },
        { id: uid('MSG'), sender: 'player', text: "Hi, I submitted a withdrawal request 3 days ago for 850 VCOIN and it still hasn't arrived.", time: nowIso() },
        { id: uid('MSG'), sender: 'agent', senderName: 'Sarah K.', text: "Hello! I'm sorry about the delay — let me check your account now.", time: nowIso() },
      ],
    },
    {
      id: 'TKT-8846', player: 'LuckyAce77', subject: 'Bonus wagering requirement bug',
      category: 'Bonus', priority: 'high',
      status: 'pending', assignedAgentId: 'AGT-002', createdAt: nowIso(), updatedAt: nowIso(),
      messages: [
        { id: uid('MSG'), sender: 'system', text: 'Ticket opened — Bonus Issue reported', time: nowIso() },
        { id: uid('MSG'), sender: 'player', text: 'My wagering progress bar is stuck at 80% even after several spins.', time: nowIso() },
      ],
    },
    {
      id: 'TKT-8845', player: 'NeonWolf', subject: 'Account verification documents',
      category: 'Account', priority: 'medium',
      status: 'new', assignedAgentId: null, createdAt: nowIso(), updatedAt: nowIso(),
      messages: [
        { id: uid('MSG'), sender: 'system', text: 'Ticket opened — Account Verification', time: nowIso() },
        { id: uid('MSG'), sender: 'player', text: 'I uploaded my ID three times, still pending review.', time: nowIso() },
      ],
    },
    {
      id: 'TKT-8836', player: 'TurboSlots', subject: 'Account suspended unfairly',
      category: 'Account', priority: 'urgent',
      status: 'closed', assignedAgentId: 'AGT-001', createdAt: nowIso(), updatedAt: nowIso(),
      messages: [
        { id: uid('MSG'), sender: 'system', text: 'Ticket opened — Account Issue', time: nowIso() },
        { id: uid('MSG'), sender: 'player', text: 'Why was my account suspended? I did nothing wrong.', time: nowIso() },
        { id: uid('MSG'), sender: 'agent', senderName: 'Sarah K.', text: 'This was a false positive from our fraud filter — your account is restored.', time: nowIso() },
        { id: uid('MSG'), sender: 'system', text: 'Ticket closed by Sarah K.', time: nowIso() },
      ],
    },
  ];

  return { tickets, agents };
}

export function loadCrm(): CrmState {
  if (typeof window === 'undefined') return seedState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedState();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw) as CrmState;
  } catch {
    return seedState();
  }
}

function saveCrm(state: CrmState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

/** Subscribe to CRM changes from this tab (custom event) and other tabs (storage event). */
export function subscribeCrm(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = () => onChange();
  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener('storage', handler);
  };
}

export function resetCrmDemo(): CrmState {
  const seeded = seedState();
  saveCrm(seeded);
  return seeded;
}

export function createTicket(
  player: string,
  subject: string,
  firstMessage: string,
  category: TicketCategory = 'Account',
  priority: TicketPriority = 'medium'
): CrmTicket {
  const state = loadCrm();
  const ticket: CrmTicket = {
    id: uid('TKT'),
    player,
    subject,
    category,
    priority,
    status: 'new',
    assignedAgentId: null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    messages: [
      { id: uid('MSG'), sender: 'system', text: 'Ticket opened from live chat', time: nowIso() },
      { id: uid('MSG'), sender: 'player', senderName: player, text: firstMessage, time: nowIso() },
    ],
  };
  state.tickets = [ticket, ...state.tickets];
  saveCrm(state);
  return ticket;
}

export function appendMessage(
  ticketId: string,
  sender: MessageSender,
  text: string,
  senderName?: string,
  isNote?: boolean
): CrmState {
  const state = loadCrm();
  const ticket = state.tickets.find((t) => t.id === ticketId);
  if (ticket) {
    ticket.messages.push({ id: uid('MSG'), sender, senderName, text, time: nowIso(), isNote });
    ticket.updatedAt = nowIso();
    if (sender === 'player' && ticket.status === 'closed') ticket.status = 'open';
  }
  saveCrm(state);
  return state;
}

export function claimTicket(ticketId: string, agentId: string): CrmState {
  const state = loadCrm();
  const ticket = state.tickets.find((t) => t.id === ticketId);
  if (ticket && !ticket.assignedAgentId) {
    ticket.assignedAgentId = agentId;
    if (ticket.status === 'new') ticket.status = 'open';
    ticket.updatedAt = nowIso();
    ticket.messages.push({
      id: uid('MSG'), sender: 'system',
      text: `Ticket claimed by ${state.agents.find((a) => a.id === agentId)?.name ?? agentId}`,
      time: nowIso(),
    });
  }
  saveCrm(state);
  return state;
}

export function assignTicket(ticketId: string, agentId: string | null): CrmState {
  const state = loadCrm();
  const ticket = state.tickets.find((t) => t.id === ticketId);
  if (ticket) {
    ticket.assignedAgentId = agentId;
    if (agentId && ticket.status === 'new') ticket.status = 'open';
    ticket.updatedAt = nowIso();
    const agentName = agentId ? state.agents.find((a) => a.id === agentId)?.name ?? agentId : null;
    ticket.messages.push({
      id: uid('MSG'), sender: 'system',
      text: agentName ? `Ticket assigned to ${agentName} by admin` : 'Ticket unassigned by admin',
      time: nowIso(),
    });
  }
  saveCrm(state);
  return state;
}

export function setTicketStatus(ticketId: string, status: TicketStatus): CrmState {
  const state = loadCrm();
  const ticket = state.tickets.find((t) => t.id === ticketId);
  if (ticket) {
    const wasOpen = ticket.status !== 'closed';
    ticket.status = status;
    ticket.updatedAt = nowIso();
    if (status === 'closed' && wasOpen && ticket.assignedAgentId) {
      const agent = state.agents.find((a) => a.id === ticket.assignedAgentId);
      if (agent) agent.handledToday += 1;
    }
    ticket.messages.push({ id: uid('MSG'), sender: 'system', text: `Ticket marked ${status}`, time: nowIso() });
  }
  saveCrm(state);
  return state;
}

export function setTicketPriority(ticketId: string, priority: TicketPriority): CrmState {
  const state = loadCrm();
  const ticket = state.tickets.find((t) => t.id === ticketId);
  if (ticket) {
    ticket.priority = priority;
    ticket.updatedAt = nowIso();
  }
  saveCrm(state);
  return state;
}

export function setAgentOnline(agentId: string, online: boolean): CrmState {
  const state = loadCrm();
  const agent = state.agents.find((a) => a.id === agentId);
  if (agent) {
    agent.online = online;
    agent.shiftStartedAt = online ? (agent.shiftStartedAt ?? nowIso()) : null;
  }
  saveCrm(state);
  return state;
}

export function activeChatsForAgent(state: CrmState, agentId: string): number {
  return state.tickets.filter((t) => t.assignedAgentId === agentId && t.status !== 'closed').length;
}

export function ticketCountsByStatus(state: CrmState): Record<TicketStatus, number> {
  return state.tickets.reduce(
    (acc, t) => { acc[t.status] += 1; return acc; },
    { new: 0, open: 0, pending: 0, closed: 0 } as Record<TicketStatus, number>
  );
}

export function formatShiftDuration(shiftStartedAt: string | null, nowMs: number): string {
  if (!shiftStartedAt) return '--:--:--';
  const elapsed = Math.max(0, Math.floor((nowMs - new Date(shiftStartedAt).getTime()) / 1000));
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
