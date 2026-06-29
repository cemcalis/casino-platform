import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HistoryPanel } from './HistoryPanel';
import type { HistoryEntry } from './HistoryPanel';

const entry: HistoryEntry = {
  roundId: 'abc123456',
  bet: '10',
  outcome: 'WIN',
  payout: '50',
  timestamp: new Date('2026-01-01T12:00:00'),
};

describe('HistoryPanel', () => {
  it('shows empty state when no entries', () => {
    render(<HistoryPanel entries={[]} />);
    expect(screen.getByText('No rounds played yet.')).toBeTruthy();
  });

  it('shows loading state', () => {
    render(<HistoryPanel entries={[]} loading />);
    expect(screen.getByText('Loading…')).toBeTruthy();
  });

  it('renders a row for each entry', () => {
    render(<HistoryPanel entries={[entry]} />);
    expect(screen.getByText('WIN')).toBeTruthy();
    expect(screen.getByText('50')).toBeTruthy();
  });

  it('truncates roundId to last 6 chars', () => {
    render(<HistoryPanel entries={[entry]} />);
    // 'abc123456'.slice(-6) === '123456'
    expect(screen.getByText('123456')).toBeTruthy();
    expect(screen.queryByText('abc123456')).toBeNull();
  });

  it('respects maxRows limit', () => {
    const entries = Array.from({ length: 15 }, (_, i) => ({
      ...entry,
      roundId: `round-${i}`,
      payout: `payout-${i}`,
    }));
    render(<HistoryPanel entries={entries} maxRows={5} />);
    expect(screen.getByText('payout-4')).toBeTruthy();
    expect(screen.queryByText('payout-5')).toBeNull();
  });

  it('shows column headers', () => {
    render(<HistoryPanel entries={[entry]} />);
    expect(screen.getByText('Result')).toBeTruthy();
    expect(screen.getByText('Payout')).toBeTruthy();
  });
});
