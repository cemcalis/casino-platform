import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CasinoShell } from './CasinoShell';

describe('CasinoShell', () => {
  it('renders children', () => {
    render(<CasinoShell><span>content</span></CasinoShell>);
    expect(screen.getByText('content')).toBeTruthy();
  });

  it('applies minHeight 100vh', () => {
    const { container } = render(<CasinoShell>x</CasinoShell>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.minHeight).toBe('100vh');
  });

  it('forwards className', () => {
    const { container } = render(<CasinoShell className="custom">x</CasinoShell>);
    expect((container.firstChild as HTMLElement).className).toBe('custom');
  });

  it('injects NEON PALACE CSS custom properties', () => {
    const { container } = render(<CasinoShell>x</CasinoShell>);
    const style = (container.firstChild as HTMLElement).style;
    expect(style.getPropertyValue('--np-gold')).toBe('#f4c430');
  });
});
