import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WinBanner } from './WinBanner';

describe('WinBanner', () => {
  it('renders nothing when visible=false', () => {
    const { container } = render(<WinBanner visible={false} amount="100" tier="small" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the win amount when visible', () => {
    render(<WinBanner visible amount="500.00" tier="small" />);
    expect(screen.getByText('500.00')).toBeTruthy();
  });

  it('renders WIN label for small tier', () => {
    render(<WinBanner visible amount="10" tier="small" />);
    expect(screen.getByText('WIN')).toBeTruthy();
  });

  it('renders JACKPOT! label for jackpot tier', () => {
    render(<WinBanner visible amount="10000" tier="jackpot" />);
    expect(screen.getByText('JACKPOT!')).toBeTruthy();
  });

  it('renders COLLECT button and fires onDismiss', () => {
    const onDismiss = vi.fn();
    render(<WinBanner visible amount="100" tier="medium" onDismiss={onDismiss} />);
    fireEvent.click(screen.getByText('COLLECT'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not render COLLECT button without onDismiss', () => {
    render(<WinBanner visible amount="100" tier="medium" />);
    expect(screen.queryByText('COLLECT')).toBeNull();
  });

  it('renders custom currency', () => {
    render(<WinBanner visible amount="100" tier="small" currency="GEMS" />);
    expect(screen.getByText('GEMS')).toBeTruthy();
  });
});
