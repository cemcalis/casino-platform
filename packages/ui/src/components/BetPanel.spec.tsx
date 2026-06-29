import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BetPanel } from './BetPanel';

describe('BetPanel', () => {
  const defaults = { bet: 10, minBet: 1, maxBet: 100, onBetChange: vi.fn() };

  it('renders current bet', () => {
    render(<BetPanel {...defaults} />);
    expect(screen.getByText('10')).toBeTruthy();
  });

  it('calls onBetChange with increased value on + click', () => {
    const onBetChange = vi.fn();
    render(<BetPanel {...defaults} onBetChange={onBetChange} step={5} />);
    fireEvent.click(screen.getByLabelText('Increase bet'));
    expect(onBetChange).toHaveBeenCalledWith(15);
  });

  it('calls onBetChange with decreased value on - click', () => {
    const onBetChange = vi.fn();
    render(<BetPanel {...defaults} onBetChange={onBetChange} step={5} />);
    fireEvent.click(screen.getByLabelText('Decrease bet'));
    expect(onBetChange).toHaveBeenCalledWith(5);
  });

  it('disables decrease button at minBet', () => {
    render(<BetPanel {...defaults} bet={1} />);
    expect(screen.getByLabelText('Decrease bet')).toBeDisabled();
  });

  it('disables increase button at maxBet', () => {
    render(<BetPanel {...defaults} bet={100} />);
    expect(screen.getByLabelText('Increase bet')).toBeDisabled();
  });

  it('renders preset buttons', () => {
    render(<BetPanel {...defaults} presets={[5, 10, 25, 50]} />);
    expect(screen.getByLabelText('Set bet to 25')).toBeTruthy();
  });

  it('preset button calls onBetChange with preset value', () => {
    const onBetChange = vi.fn();
    render(<BetPanel {...defaults} onBetChange={onBetChange} presets={[25]} />);
    fireEvent.click(screen.getByLabelText('Set bet to 25'));
    expect(onBetChange).toHaveBeenCalledWith(25);
  });
});
