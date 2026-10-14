import React from 'react';
import { test, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { PlatformProvider } from '../contexts/PlatformContext';
import App from '../routes/App';
import ProjectProgress from '../components/ui/ProjectProgress';

function mount(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <PlatformProvider>
        <App />
      </PlatformProvider>
    </MemoryRouter>,
  );
}

test('WhatsApp flutuante usa número configurado e referência; Esc devolve o foco', async () => {
  const user = userEvent.setup();
  mount('/solicitar?modelo=barber-studio');
  const trigger = screen.getByRole('button', { name: 'Conversar pelo WhatsApp' });
  await user.click(trigger);
  const dialog = screen.getByRole('dialog');
  const link = within(dialog).getByRole('link', { name: /Abrir WhatsApp/ });
  const url = new URL(link.href);
  expect(url.origin).toBe('https://wa.me');
  expect(url.pathname).toBe('/5581989957462');
  expect(url.searchParams.get('text')).toContain('Barber Studio');
  expect(link.target).toBe('_blank');
  expect(document.activeElement).toBe(
    within(dialog).getByRole('button', { name: 'Fechar contato' }),
  );
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.activeElement).toBe(trigger);
});

test('contato salvo no painel atualiza o botão e catálogo fecha o balão', async () => {
  const user = userEvent.setup();
  mount('/admin');
  await user.click(screen.getByRole('button', { name: 'Mensalidade', exact: true }));
  const phone = screen.getByLabelText('WhatsApp de atendimento');
  await user.clear(phone);
  await user.type(phone, '11 99999-9999');
  await user.click(screen.getByRole('button', { name: 'Salvar mensalidade' }));
  await user.click(screen.getByRole('button', { name: 'Conversar pelo WhatsApp' }));
  expect(new URL(screen.getByRole('link', { name: /Abrir WhatsApp/ }).href).pathname).toBe(
    '/5511999999999',
  );
  await user.click(screen.getByRole('button', { name: 'Explore o catálogo' }));
  expect(screen.queryByRole('heading', { name: 'Sua ideia começa com um “olá”.' })).toBeNull();
  expect(screen.getByRole('dialog', { name: 'Catálogo completo.' })).toBeTruthy();
});

test('sem número configurado mantém um caminho de contato válido pelo formulário', async () => {
  localStorage.setItem('siteflow.offer', JSON.stringify({ whatsapp: '' }));
  const user = userEvent.setup();
  mount();
  await user.click(screen.getByRole('button', { name: 'Conversar pelo WhatsApp' }));
  const dialog = screen.getByRole('dialog');
  expect(within(dialog).queryByRole('link', { name: /Abrir WhatsApp/ })).toBeNull();
  await user.click(within(dialog).getByRole('link', { name: /Prefiro preencher o formulário/ }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.getByLabelText('Nome do seu negócio')).toBeTruthy();
});

test('briefing exige negócio antes de avançar e preserva escolhas ao voltar', async () => {
  const user = userEvent.setup();
  mount('/solicitar');
  await user.click(screen.getByRole('button', { name: 'Continuar' }));
  expect(screen.getByRole('heading', { name: 'Seu projeto' })).toBeTruthy();
  await user.type(screen.getByLabelText('Nome do seu negócio'), 'Meu negócio');
  await user.selectOptions(screen.getByLabelText('Principal objetivo'), 'Vender pela internet');
  await user.click(screen.getByRole('button', { name: 'Continuar' }));
  await user.click(screen.getByRole('button', { name: 'Continuar' }));
  expect(screen.getByRole('heading', { name: 'O que precisa' })).toBeTruthy();
  await user.type(
    screen.getByLabelText(/Conte o que você tem em mente/),
    'Gostaria de vender meus produtos em uma loja online.',
  );
  await user.click(screen.getByLabelText('Loja e pagamentos'));
  await user.click(screen.getByRole('button', { name: 'Voltar' }));
  expect(screen.getByLabelText('Nome do seu negócio').value).toBe('Meu negócio');
  expect(screen.getByLabelText('Principal objetivo').value).toBe('Vender pela internet');
  await user.click(screen.getByRole('button', { name: 'Continuar' }));
  expect(screen.getByLabelText('Loja e pagamentos').checked).toBe(true);
  await user.click(screen.getByRole('button', { name: 'Continuar' }));
  expect(screen.getByText('Meu negócio')).toBeTruthy();
  expect(localStorage.getItem('siteflow.requests')).toBeNull();
});

test('projeto cancelado tem explicação própria e não exibe etapas concluídas', () => {
  render(<ProjectProgress status="Cancelado" />);
  expect(screen.getByRole('heading', { name: 'Solicitação cancelada' })).toBeTruthy();
  expect(screen.queryByRole('list', { name: 'Etapas do projeto' })).toBeNull();
});

test('trocar de referência no briefing sincroniza o WhatsApp e o catálogo sem perder o negócio', async () => {
  const user = userEvent.setup();
  mount('/solicitar');
  await user.type(screen.getByLabelText('Nome do seu negócio'), 'Minha empresa');
  await user.selectOptions(screen.getByLabelText('Referência do catálogo'), 'barber-studio');
  await user.click(screen.getByRole('button', { name: 'Conversar pelo WhatsApp' }));
  expect(
    new URL(screen.getByRole('link', { name: /Abrir WhatsApp/ }).href).searchParams.get('text'),
  ).toContain('Barber Studio');
  await user.keyboard('{Escape}');
  await user.click(screen.getByRole('button', { name: 'Explore o catálogo' }));
  const dialog = screen.getByRole('dialog', { name: 'Catálogo completo.' });
  const card = within(dialog).getAllByRole('article')[1];
  await user.click(within(card).getByRole('link', { name: 'Usar este modelo' }));
  expect(screen.getByLabelText('Referência do catálogo').value).not.toBe('barber-studio');
  expect(screen.getByLabelText('Nome do seu negócio').value).toBe('Minha empresa');
});
