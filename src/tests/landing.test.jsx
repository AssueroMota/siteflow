import React from 'react';
import { test, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { PlatformProvider } from '../contexts/PlatformContext';
import App from '../routes/App';
function mount(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <PlatformProvider>
        <App />
      </PlatformProvider>
    </MemoryRouter>,
  );
}
test('landing page abre completa e independente da navegação do SiteFlow', () => {
  mount('/modelos/barber-studio');
  expect(screen.getByRole('heading', { level: 1, name: /Seu próximo corte/ })).toBeTruthy();
  expect(screen.getByRole('heading', { name: 'Escolha o seu cuidado' })).toBeTruthy();
  expect(
    screen.getByRole('heading', { name: 'Mais do que um corte. Um momento seu.' }),
  ).toBeTruthy();
  expect(screen.getByRole('heading', { name: 'Vamos encontrar seu próximo estilo?' })).toBeTruthy();
  expect(screen.queryByRole('link', { name: 'SiteFlow início' })).toBeNull();
  expect(screen.getByRole('link', { name: 'Serviços' }).getAttribute('href')).toBe(
    '#landing-barber-studio-services',
  );
});
test('modelo de restaurante tem apresentação própria e modo embutido limpo', () => {
  mount('/modelos/bistro?embed=1');
  expect(screen.getByRole('heading', { level: 1, name: /Boa comida/ })).toBeTruthy();
  expect(screen.getByRole('heading', { name: 'Uma pausa para saborear' })).toBeTruthy();
  expect(screen.queryByRole('link', { name: 'Voltar aos modelos' })).toBeNull();
  expect(screen.queryByText('CONCEITO DE SITE')).toBeNull();
  expect(screen.queryByText('DESIGN QUE FAZ A DIFERENÇA')).toBeNull();
});
test('formulário da landing demonstra o fluxo sem afirmar envio real', async () => {
  const user = userEvent.setup();
  mount('/modelos/barber-studio');
  await user.click(screen.getByRole('button', { name: 'Agendar', exact: true }));
  const dialog = screen.getByRole('dialog', { name: 'Contato demonstrativo' });
  await user.type(within(dialog).getByLabelText('Seu nome'), 'Visitante de teste');
  await user.type(within(dialog).getByLabelText('E-mail'), 'teste@example.com');
  await user.type(
    within(dialog).getByLabelText('O que você tem em mente?'),
    'Quero conhecer o atendimento.',
  );
  await user.click(within(dialog).getByRole('button', { name: 'Testar envio' }));
  expect(
    within(dialog).getByText(
      'Esta é uma demonstração. Nenhuma mensagem ou agendamento foi enviado.',
    ),
  ).toBeTruthy();
  await user.click(within(dialog).getByRole('button', { name: 'Continuar explorando' }));
  expect(screen.queryByRole('dialog')).toBeNull();
});
