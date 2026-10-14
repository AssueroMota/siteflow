import React from 'react';
import { test, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { PlatformProvider } from '../contexts/PlatformContext';
import App from '../routes/App';
function mount() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <PlatformProvider>
        <App />
      </PlatformProvider>
    </MemoryRouter>,
  );
}
test('catálogo completo abre em modal, filtra modelos e restaura foco ao fechar', async () => {
  const user = userEvent.setup();
  mount();
  const opener = screen.getByRole('button', { name: 'Ver catálogo completo' });
  await user.click(opener);
  const dialog = screen.getByRole('dialog', { name: 'Catálogo completo.' });
  expect(within(dialog).getAllByRole('article').length).toBe(9);
  expect(document.body.style.overflow).toBe('hidden');
  const search = within(dialog).getByRole('searchbox', { name: 'Buscar no catálogo' });
  expect(document.activeElement).toBe(search);
  await user.type(search, 'barber');
  expect(within(dialog).getAllByRole('article').length).toBe(1);
  expect(
    within(dialog)
      .getByRole('link', { name: 'Abrir landing page Barber Studio' })
      .getAttribute('href'),
  ).toBe('/modelos/barber-studio');
  await user.selectOptions(
    within(dialog).getByRole('combobox', { name: 'Categoria do catálogo' }),
    'Clínicas',
  );
  expect(within(dialog).getByText('Nenhum modelo encontrado.')).toBeTruthy();
  await user.click(within(dialog).getByRole('button', { name: 'Limpar busca' }));
  expect(within(dialog).getAllByRole('article').length).toBe(9);
  within(dialog).getByRole('button', { name: 'Fechar catálogo' }).focus();
  await user.tab({ shift: true });
  expect(document.activeElement).toBe(
    within(dialog).getByRole('link', { name: 'Conte sua ideia' }),
  );
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.body.style.overflow).toBe('');
  expect(document.activeElement).toBe(opener);
});
test('escolha no modal abre o briefing com o modelo selecionado', async () => {
  const user = userEvent.setup();
  mount();
  await user.click(screen.getByRole('button', { name: 'Ver catálogo completo' }));
  const dialog = screen.getByRole('dialog');
  await user.type(within(dialog).getByRole('searchbox', { name: 'Buscar no catálogo' }), 'barber');
  await user.click(within(dialog).getByRole('link', { name: 'Usar este modelo' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.getByLabelText('Referência do catálogo').value).toBe('barber-studio');
  expect(document.body.style.overflow).toBe('');
});
test('seção de entregas permite comparar criação, manutenção e condições com teclado', async () => {
  const user = userEvent.setup();
  mount();
  const tab = screen.getByRole('tab', { name: 'Na manutenção mensal' });
  await user.click(tab);
  expect(tab.getAttribute('aria-selected')).toBe('true');
  expect(
    within(screen.getByRole('tabpanel')).getByRole('heading', { name: 'Manutenção técnica' }),
  ).toBeTruthy();
  await user.keyboard('{ArrowRight}');
  const next = screen.getByRole('tab', { name: 'Combinado na proposta' });
  expect(next.getAttribute('aria-selected')).toBe('true');
  expect(document.activeElement).toBe(next);
  expect(
    within(screen.getByRole('tabpanel')).getByRole('heading', { name: 'Escopo e prazo' }),
  ).toBeTruthy();
});
