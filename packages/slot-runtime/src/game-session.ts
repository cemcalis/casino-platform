import type { GameSession, SpinResult, SlotConfig } from './types';

let _counter = 0;
function nextSessionId(): string {
  return `session-${Date.now()}-${++_counter}`;
}

export function createSession(config: SlotConfig, initialBalance: number): GameSession {
  return {
    sessionId: nextSessionId(),
    balance: initialBalance,
    bet: config.defaultBet,
    spinCount: 0,
    freeSpinsRemaining: 0,
    totalWon: 0,
    totalWagered: 0,
    config,
  };
}

export function setBet(session: GameSession, newBet: number): GameSession {
  if (newBet < session.config.minBet || newBet > session.config.maxBet) {
    throw new RangeError(
      `Bet ${newBet} out of range [${session.config.minBet}, ${session.config.maxBet}]`,
    );
  }
  return { ...session, bet: newBet };
}

export function applySpinResult(session: GameSession, result: SpinResult): GameSession {
  const betDeducted = result.isFreeSpın ? 0 : result.bet;
  const newBalance = session.balance - betDeducted + result.totalPayout;
  const newFreeSpins = Math.max(0, session.freeSpinsRemaining - (result.isFreeSpın ? 1 : 0))
    + result.freeSpinsAwarded;

  return {
    ...session,
    balance: newBalance,
    spinCount: session.spinCount + 1,
    freeSpinsRemaining: newFreeSpins,
    totalWon: session.totalWon + result.totalPayout,
    totalWagered: session.totalWagered + betDeducted,
  };
}

export function canSpin(session: GameSession): boolean {
  if (session.freeSpinsRemaining > 0) return true;
  return session.balance >= session.bet;
}
