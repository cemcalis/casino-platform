import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BalancePanel } from './BalancePanel';

describe('BalancePanel', () => {
  it('renders the balance amount', () => {
    render(<BalancePanel balance="1,234.00" />);
    expect(screen.getByText('1,234.00')).toBeTruthy();
  });

  it('renders the default currency label VCOIN', () => {
    render(<BalancePanel balance="0.00" />);
    expect(screen.getByText('VCOIN')).toBeTruthy();
  });

  it('renders a custom currency', () => {
    render(<BalancePanel balance="50.00" currency="GOLD" />);
    expect(screen.getByText('GOLD')).toBeTruthy();
  });

  it('shows a loading skeleton when loading=true', () => {
    render(<BalancePanel balance="100.00" loading />);
    expect(screen.getByLabelText('Loading balance')).toBeTruthy();
  });

  it('hides balance text when loading', () => {
    render(<BalancePanel balance="999.00" loading />);
    expect(screen.queryByText('999.00')).toBeNull();
  });
});
