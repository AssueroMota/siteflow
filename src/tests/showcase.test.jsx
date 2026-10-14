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

test('carrossel no laptop troca modelos, preserva referência no CTA e acompanha categoria do link', async () => {
  const user = userEvent.setup();
  const view = mount('/catalogo');
  const carousel = screen.getByRole('region', { name: 'Vitrine de sistemas do catálogo' });
  await user.click(within(carousel).getByRole('button', { name: 'Mostrar Bistrô & Co.' }));
  expect(within(carousel).getByRole('heading', { name: 'Bistrô & Co.' })).toBeTruthy();
  expect(within(carousel).getByTitle('Landing page Bistrô & Co.').getAttribute('src')).toBe(
    '/modelos/bistro?embed=1',
  );
  expect(
    within(carousel).getByRole('link', { name: 'Abrir landing page' }).getAttribute('href'),
  ).toBe('/modelos/bistro');
  expect(
    within(carousel).getByRole('link', { name: 'Quero um projeto assim' }).getAttribute('href'),
  ).toBe('/solicitar?modelo=bistro');
  await user.click(within(carousel).getByRole('button', { name: 'Próximo sistema' }));
  expect(within(carousel).getByRole('heading', { name: 'Lume Store' })).toBeTruthy();
  view.unmount();
  mount('/catalogo?categoria=Barbearias');
  const filteredCarousel = screen.getByRole('region', { name: 'Vitrine de sistemas do catálogo' });
  expect(within(filteredCarousel).getByRole('heading', { name: 'Barber Studio' })).toBeTruthy();
  expect(within(filteredCarousel).getByRole('button', { name: 'Próximo sistema' }).disabled).toBe(
    true,
  );
});

test('rascunho de depoimento não aparece; publicação exige autorização e persiste', async () => {
  const user = userEvent.setup();
  let view = mount('/admin');
  await user.click(screen.getByRole('button', { name: 'Depoimentos', exact: true }));
  await user.click(screen.getByRole('button', { name: 'Novo depoimento' }));
  await user.type(screen.getByLabelText('Nome do cliente'), 'Cliente de teste');
  await user.type(screen.getByLabelText('Negócio ou identificação pública'), 'Empresa de teste');
  await user.type(
    screen.getByLabelText('Depoimento real do cliente'),
    'Relato de teste para verificar o cadastro e a publicação.',
  );
  expect(screen.getByLabelText('Publicar na página inicial').disabled).toBe(true);
  await user.click(screen.getByRole('button', { name: 'Salvar depoimento' }));
  await waitFor(() => expect(screen.queryByLabelText('Nome do cliente')).toBeNull());
  view.unmount();
  view = mount('/');
  expect(screen.queryByText('Cliente de teste')).toBeNull();
  expect(screen.getByText('HISTÓRIAS EM CONSTRUÇÃO')).toBeTruthy();
  view.unmount();
  view = mount('/admin');
  await user.click(screen.getByRole('button', { name: 'Depoimentos', exact: true }));
  await user.click(screen.getByRole('button', { name: 'Editar', exact: true }));
  await user.click(
    screen.getByLabelText('Tenho autorização do cliente para publicar este relato.'),
  );
  await user.click(screen.getByLabelText('Publicar na página inicial'));
  await user.click(screen.getByRole('button', { name: 'Salvar depoimento' }));
  await waitFor(() => expect(screen.queryByLabelText('Nome do cliente')).toBeNull());
  view.unmount();
  mount('/');
  expect(screen.getByText('Cliente de teste')).toBeTruthy();
  expect(
    screen.getByText('Relato de teste para verificar o cadastro e a publicação.'),
  ).toBeTruthy();
  expect(screen.queryByText('HISTÓRIAS EM CONSTRUÇÃO')).toBeNull();
});

test('caminho de melhoria de projeto chega ao briefing com o tipo correto', async () => {
  const user = userEvent.setup();
  mount('/');
  await user.click(screen.getByRole('link', { name: /Quero melhorar o que já tenho/ }));
  expect(screen.getByLabelText('O que você quer criar?').value).toBe(
    'Melhoria de projeto existente',
  );
});
