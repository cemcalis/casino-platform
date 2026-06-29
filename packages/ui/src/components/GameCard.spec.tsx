import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameCard } from './GameCard';

const base = { id: 'game-1', name: 'Neon Slots', category: 'SLOTS' };

describe('GameCard', () => {
  it('renders the game name', () => {
    render(<GameCard {...base} />);
    expect(screen.getByText('Neon Slots')).toBeTruthy();
  });

  it('renders the category', () => {
    render(<GameCard {...base} />);
    expect(screen.getByText('SLOTS')).toBeTruthy();
  });

  it('calls onClick when card is clicked', () => {
    const onClick = vi.fn();
    render(<GameCard {...base} onClick={onClick} />);
    fireEvent.click(screen.getByRole('article'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn();
    render(<GameCard {...base} onClick={onClick} disabled />);
    fireEvent.click(screen.getByRole('article'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders no img when no imageSrc', () => {
    const { container } = render(<GameCard {...base} />);
    expect(container.querySelector('img')).toBeNull();
  });

  it('renders img when imageSrc provided', () => {
    render(<GameCard {...base} imageSrc="/games/neon-slots.webp" />);
    const img = screen.getByRole('img');
    expect(img.getAttribute('src')).toBe('/games/neon-slots.webp');
  });

  it('renders badge text when provided', () => {
    render(<GameCard {...base} badgeText="HOT" />);
    expect(screen.getByText('HOT')).toBeTruthy();
  });

  it('renders RTP when provided', () => {
    render(<GameCard {...base} rtpPercent={96.5} />);
    expect(screen.getByText('96.5% RTP')).toBeTruthy();
  });
});
