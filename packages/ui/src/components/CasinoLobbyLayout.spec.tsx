import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CasinoLobbyLayout } from './CasinoLobbyLayout';

describe('CasinoLobbyLayout', () => {
  it('renders children in main', () => {
    render(
      <CasinoLobbyLayout>
        <span>Game Grid</span>
      </CasinoLobbyLayout>,
    );
    expect(screen.getByText('Game Grid')).toBeTruthy();
  });

  it('renders header slot content', () => {
    render(
      <CasinoLobbyLayout header={<div>Header Content</div>}>
        <span>Body</span>
      </CasinoLobbyLayout>,
    );
    expect(screen.getByText('Header Content')).toBeTruthy();
  });

  it('renders hero slot content', () => {
    render(
      <CasinoLobbyLayout hero={<section>Hero Banner</section>}>
        <span>Body</span>
      </CasinoLobbyLayout>,
    );
    expect(screen.getByText('Hero Banner')).toBeTruthy();
  });

  it('renders footer slot content', () => {
    render(
      <CasinoLobbyLayout footer={<footer>Footer Text</footer>}>
        <span>Body</span>
      </CasinoLobbyLayout>,
    );
    expect(screen.getByText('Footer Text')).toBeTruthy();
  });

  it('renders without optional slots', () => {
    const { container } = render(
      <CasinoLobbyLayout>
        <span>Only children</span>
      </CasinoLobbyLayout>,
    );
    expect(container.querySelector('header')).toBeNull();
    expect(container.querySelector('footer')).toBeNull();
  });
});
