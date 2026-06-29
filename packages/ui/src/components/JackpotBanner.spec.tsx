import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JackpotBanner } from './JackpotBanner';

describe('JackpotBanner', () => {
  it('renders the default JACKPOT label', () => {
    render(<JackpotBanner amount="1,000,000" />);
    expect(screen.getByText('JACKPOT')).toBeTruthy();
  });

  it('renders the jackpot amount', () => {
    render(<JackpotBanner amount="1,000,000" />);
    expect(screen.getByText('1,000,000')).toBeTruthy();
  });

  it('renders default currency VCOIN', () => {
    render(<JackpotBanner amount="500,000" />);
    expect(screen.getByText('VCOIN')).toBeTruthy();
  });

  it('renders custom currency', () => {
    render(<JackpotBanner amount="250,000" currency="GEMS" />);
    expect(screen.getByText('GEMS')).toBeTruthy();
  });

  it('renders custom label', () => {
    render(<JackpotBanner amount="100,000" label="MEGA JACKPOT" />);
    expect(screen.getByText('MEGA JACKPOT')).toBeTruthy();
  });

  it('has correct aria-label', () => {
    render(<JackpotBanner amount="500,000" currency="VCOIN" />);
    expect(screen.getByRole('banner', { name: /JACKPOT: 500,000 VCOIN/i })).toBeTruthy();
  });
});
