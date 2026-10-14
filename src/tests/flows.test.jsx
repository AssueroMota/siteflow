import React from 'react';
import { test, expect } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
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
test('catálogo combina busca, categoria e ordenação e limpa resultado vazio', async () => {
  const user = userEvent.setup();
  mount('/catalogo');
  expect(document.querySelectorAll('.system-card').length).toBe(9);
  await user.click(screen.getByRole('button', { name: 'Barbearias', exact: true }));
  expect(document.querySelectorAll('.system-card').length).toBe(1);
  expect(screen.getByRole('link', { name: 'Barber Studio', exact: true })).toBeTruthy();
  await user.type(screen.getByRole('textbox', { name: 'Buscar modelos' }), 'inexistente');
  expect(screen.getByText('A sua ideia pode ser a próxima.')).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Limpar filtros' }));
  expect(document.querySelectorAll('.system-card').length).toBe(9);
});
test('solicitação demo é salva, aparece no painel e pode avançar de etapa no admin', async () => {
  const user = userEvent.setup();
  const view = mount('/solicitar?modelo=barber-studio');
  await user.type(screen.getByLabelText('Seu nome'), 'Cliente Teste');
  await user.type(screen.getByLabelText('E-mail'), 'teste@example.com');
  await user.type(screen.getByLabelText('Nome do seu negócio'), 'Barbearia Teste');
  await user.type(
    screen.getByLabelText(/Conte o que você tem em mente/),
    'Quero criar um site para minha barbearia com serviços e contato.',
  );
  await user.click(screen.getByRole('checkbox'));
  await user.click(screen.getByRole('button', { name: 'Enviar minha ideia' }));
  await screen.findByText('Ideia salva na demonstração!');
  expect(JSON.parse(localStorage.getItem('siteflow.requests'))[0].model).toBe('barber-studio');
  await user.click(screen.getByRole('link', { name: /Acompanhar meus projetos/ }));
  expect(screen.getByText('Barbearia Teste')).toBeTruthy();
  view.unmount();
  mount('/admin');
  await user.selectOptions(screen.getByLabelText('Etapa do projeto'), 'Em desenvolvimento');
  await waitFor(() =>
    expect(JSON.parse(localStorage.getItem('siteflow.requests'))[0].status).toBe(
      'Em desenvolvimento',
    ),
  );
});
test('edição de referência persiste e rascunho sai do catálogo público', async () => {
  const user = userEvent.setup();
  const view = mount('/admin');
  await user.click(screen.getByRole('button', { name: 'Catálogo', exact: true }));
  await user.click(screen.getByRole('button', { name: 'Editar Barber Studio' }));
  const dialog = screen.getByRole('dialog');
  const name = within(dialog).getByLabelText('Nome');
  await user.clear(name);
  await user.type(name, 'Barbearia Personalizada');
  await user.click(within(dialog).getByLabelText('Publicar no catálogo'));
  await user.click(within(dialog).getByRole('button', { name: 'Salvar referência' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  view.unmount();
  mount('/catalogo');
  expect(screen.queryByRole('link', { name: /Barbearia Personalizada/ })).toBeNull();
  expect(document.querySelectorAll('.system-card').length).toBe(8);
});
test('mensalidade é única, configurável e não oferece compra de templates', async () => {
  const user = userEvent.setup();
  const view = mount('/admin');
  await user.click(screen.getByRole('button', { name: 'Mensalidade', exact: true }));
  const price = screen.getByLabelText('Valor mensal (R$)');
  await user.clear(price);
  await user.type(price, '199');
  await user.click(screen.getByRole('button', { name: 'Salvar mensalidade' }));
  await waitFor(() => expect(JSON.parse(localStorage.getItem('siteflow.offer')).price).toBe(199));
  view.unmount();
  mount('/mensalidade');
  expect(screen.getByText('R$ 199,00')).toBeTruthy();
  expect(screen.getByRole('link', { name: /Solicitar meu projeto/ })).toBeTruthy();
  expect(screen.queryByText('Comprar Pacote Completo')).toBeNull();
});
