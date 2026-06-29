import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SpinButton } from './SpinButton';

describe('SpinButton', () => {
  it('renders SPIN label in idle state', () => {
    render(<SpinButton />);
    expect(screen.getByRole('button').textContent).toBe('SPIN');
  });

  it('renders ellipsis label in spinning state', () => {
    render(<SpinButton state="spinning" />);
    expect(screen.getByRole('button').textContent).toBe('…');
  });

  it('is disabled when state=disabled', () => {
    render(<SpinButton state="disabled" />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when state=spinning', () => {
    render(<SpinButton state="spinning" />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('fires onClick when idle', () => {
    const onClick = vi.fn();
    render(<SpinButton state="idle" onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire onClick when spinning', () => {
    const onClick = vi.fn();
    render(<SpinButton state="spinning" onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders custom label', () => {
    render(<SpinButton label="PLAY" />);
    expect(screen.getByRole('button').textContent).toBe('PLAY');
  });
});
