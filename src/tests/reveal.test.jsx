import React from 'react';
import { afterEach, test, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import Reveal from '../components/ui/Reveal';
afterEach(() => vi.unstubAllGlobals());
test('animação respeita redução de movimento sem ocultar conteúdo', () => {
  const observer = vi.fn();
  vi.stubGlobal('IntersectionObserver', observer);
  vi.stubGlobal('matchMedia', () => ({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  render(<Reveal direction="left">Conteúdo acessível</Reveal>);
  expect(screen.getByText('Conteúdo acessível').getAttribute('data-visible')).toBe('true');
  expect(observer).not.toHaveBeenCalled();
});
test('entrada se revela ao entrar na tela e libera o observador', () => {
  let observe;
  const disconnect = vi.fn();
  class Observer {
    constructor(callback) {
      observe = callback;
    }
    observe() {}
    disconnect() {
      disconnect();
    }
  }
  vi.stubGlobal('IntersectionObserver', Observer);
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  render(<Reveal direction="right">Projeto em destaque</Reveal>);
  const element = screen.getByText('Projeto em destaque');
  expect(element.getAttribute('data-visible')).toBe('false');
  act(() => observe([{ isIntersecting: true }]));
  expect(element.getAttribute('data-visible')).toBe('true');
  expect(disconnect).toHaveBeenCalled();
});
