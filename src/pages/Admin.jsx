import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutGrid,
  Settings2,
  FolderKanban,
  Users,
  CreditCard,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Upload,
  Tags,
} from 'lucide-react';
import { usePlatform } from '../contexts/PlatformContext';
import { api, safeUrl } from '../services/api';
const tabs = [
  ['requests', 'Solicitações', FolderKanban],
  ['catalog', 'Catálogo', LayoutGrid],
  ['offer', 'Mensalidade', Settings2],
  ['categories', 'Categorias', Tags],
  ['customers', 'Clientes', Users],
  ['orders', 'Pagamentos', CreditCard],
];
export default function Admin() {
  const {
    demo,
    user,
    systems,
    offer,
    categories,
    saveSystem,
    deleteSystem,
    saveOffer,
    saveCategories,
  } = usePlatform();
  const [tab, setTab] = useState('requests'),
    [requests, setRequests] = useState([]),
    [customers, setCustomers] = useState([]),
    [orders, setOrders] = useState([]),
    [editing, setEditing] = useState(null),
    [offerForm, setOfferForm] = useState(offer),
    [categoryText, setCategoryText] = useState(categories.filter((c) => c !== 'Todos').join('\n')),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [confirmDelete, setConfirmDelete] = useState('');
  useEffect(() => {
    if (demo) {
      setRequests(JSON.parse(localStorage.getItem('siteflow.requests') || '[]'));
      return;
    }
    if (user?.role !== 'admin') return;
    Promise.all([api('/admin/requests'), api('/admin/customers'), api('/admin/orders')])
      .then(([r, c, o]) => {
        setRequests(r);
        setCustomers(c);
        setOrders(o);
        setEditing(null);
      })
      .catch((e) => setError(e.message));
  }, [demo, user]);
  if (!demo && user?.role !== 'admin')
    return (
      <div className="section empty-state">
        <h1>Acesso administrativo</h1>
        <p>Entre com uma conta autorizada para gerenciar a plataforma.</p>
        <Link to="/entrar" className="button button-primary">
          Entrar
        </Link>
      </div>
    );
  async function run(fn) {
    setBusy(true);
    setError('');
    try {
      await fn();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function updateRequest(id, changes) {
    const items = requests.map((r) => (r.id === id ? { ...r, ...changes } : r));
    if (demo) localStorage.setItem('siteflow.requests', JSON.stringify(items));
    else await api(`/admin/requests/${id}`, { method: 'PATCH', body: JSON.stringify(changes) });
    setRequests(items);
  }
  async function uploadImage(file) {
    if (!file) return;
    if (
      !['image/png', 'image/jpeg', 'image/webp'].includes(file.type) ||
      file.size > 5 * 1024 * 1024
    )
      throw new Error('Use PNG, JPG ou WebP até 5 MB.');
    if (demo) {
      if (file.size > 1024 * 1024) throw new Error('Na demonstração, use uma imagem até 1 MB.');
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setEditing((v) => ({ ...v, imageUrl: data }));
    } else {
      const form = new FormData();
      form.append('image', file);
      const data = await api('/admin/uploads', { method: 'POST', body: form });
      setEditing((v) => ({ ...v, imageUrl: data.url }));
    }
  }
  const newSystem = () =>
    setEditing({
      id: crypto.randomUUID(),
      name: '',
      category: categories[1] || 'Outros Sistemas',
      description: '',
      theme: 'landing',
      features: [],
      technologies: ['React', 'Tailwind CSS'],
      featured: false,
      published: false,
      demoUrl: '',
      imageUrl: '',
      createdAt: new Date().toISOString(),
    });
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <span className="eyebrow">GESTÃO SITEFLOW</span>
        <h2>
          Seu centro
          <br />
          de criação.
        </h2>
        {tabs.map(([key, label, Icon]) => (
          <button
            key={key}
            className={tab === key ? 'active' : ''}
            onClick={() => {
              setTab(key);
              setError('');
            }}
          >
            <Icon size={19} />
            {label}
            {key === 'requests' && <span>{requests.length}</span>}
          </button>
        ))}
        <Link to="/" className="back-link">
          ← Ver site público
        </Link>
      </aside>
      <div className="admin-content">
        <div className="dashboard-heading">
          <div>
            <span className="eyebrow">PAINEL ADMINISTRATIVO</span>
            <h1>{tabs.find((t) => t[0] === tab)[1]}</h1>
          </div>
          {tab === 'catalog' && (
            <button className="button button-primary small" onClick={newSystem}>
              <Plus size={17} /> Nova referência
            </button>
          )}
        </div>
        {demo && (
          <div className="info-box">
            Painel demo aberto para exploração. Alterações são salvas somente neste navegador. Na
            versão conectada, o servidor exige uma conta administrativa.
          </div>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {tab === 'requests' && (
          <div className="admin-requests">
            {requests.length ? (
              requests.map((r) => (
                <article className="admin-request" key={r.id}>
                  <div>
                    <span className="status-badge">{r.status}</span>
                    <small>
                      {new Date(r.createdAt || r.created_at).toLocaleDateString('pt-BR')}
                    </small>
                  </div>
                  <h3>{r.business}</h3>
                  <p>
                    {r.name} · {r.email}
                    {r.phone && ` · ${r.phone}`}
                  </p>
                  <b>{r.type}</b>
                  <p className="request-description">{r.description}</p>
                  {r.model && (
                    <small>
                      Referência: {systems.find((s) => s.id === r.model)?.name || r.model}
                    </small>
                  )}
                  <label>
                    Etapa do projeto
                    <select
                      value={r.status}
                      disabled={busy}
                      onChange={(e) => run(() => updateRequest(r.id, { status: e.target.value }))}
                    >
                      {[
                        'Novo',
                        'Em análise',
                        'Proposta enviada',
                        'Em desenvolvimento',
                        'Em revisão',
                        'Entregue',
                        'Cancelado',
                      ].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      run(() =>
                        updateRequest(r.id, { notes: new FormData(e.target).get('notes') }),
                      );
                    }}
                  >
                    <label>
                      Atualização para o cliente
                      <textarea
                        name="notes"
                        defaultValue={r.notes || ''}
                        rows={2}
                        maxLength={2000}
                        placeholder="Próximos passos, andamento ou observações…"
                      />
                    </label>
                    <button disabled={busy} className="button button-outline small">
                      <Save size={15} /> Salvar atualização
                    </button>
                  </form>
                </article>
              ))
            ) : (
              <div className="panel-empty">
                <FolderKanban size={40} />
                <h2>O próximo projeto começa aqui.</h2>
                <p>Solicitações feitas no site aparecem neste painel.</p>
                <Link to="/solicitar" className="text-link">
                  Testar uma solicitação →
                </Link>
              </div>
            )}
          </div>
        )}
        {tab === 'catalog' && (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Referência</th>
                  <th>Categoria</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {systems.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <b>{s.name}</b>
                      {s.featured && <small className="table-small">✦ Destaque</small>}
                    </td>
                    <td>{s.category}</td>
                    <td>
                      <span className="status-badge">{s.published ? 'Publicado' : 'Rascunho'}</span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          aria-label={`Editar ${s.name}`}
                          className="icon-button"
                          onClick={() => setEditing({ ...s })}
                        >
                          <Pencil size={17} />
                        </button>
                        {confirmDelete === s.id ? (
                          <>
                            <button
                              className="danger-button"
                              disabled={busy}
                              onClick={() =>
                                run(async () => {
                                  await deleteSystem(s.id);
                                  setConfirmDelete('');
                                })
                              }
                            >
                              Excluir
                            </button>
                            <button onClick={() => setConfirmDelete('')}>Cancelar</button>
                          </>
                        ) : (
                          <button
                            aria-label={`Excluir ${s.name}`}
                            className="icon-button"
                            onClick={() => setConfirmDelete(s.id)}
                          >
                            <Trash2 size={17} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab === 'offer' && (
          <form
            className="admin-form"
            onSubmit={(e) => {
              e.preventDefault();
              run(() => saveOffer({ ...offerForm, price: Number(offerForm.price) }));
            }}
          >
            <h2>Uma mensalidade, um serviço personalizado.</h2>
            <p>
              Configure os dados públicos. O produto na Hotmart deve ser configurado como uma
              assinatura mensal separadamente.
            </p>
            <label>
              Título da oferta
              <input
                required
                maxLength={150}
                value={offerForm.title}
                onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
              />
            </label>
            <div className="form-row">
              <label>
                Valor mensal (R$)
                <input
                  required
                  type="number"
                  min="1"
                  max="100000"
                  step="0.01"
                  value={offerForm.price}
                  onChange={(e) => setOfferForm({ ...offerForm, price: e.target.value })}
                />
              </label>
              <label>
                ID do produto Hotmart
                <input
                  value={offerForm.productId}
                  onChange={(e) => setOfferForm({ ...offerForm, productId: e.target.value })}
                />
              </label>
            </div>
            <label>
              Link do checkout de assinatura
              <input
                type="url"
                placeholder="https://pay.hotmart.com/…"
                value={offerForm.checkoutUrl}
                onChange={(e) => setOfferForm({ ...offerForm, checkoutUrl: e.target.value })}
              />
            </label>
            {[
              ['support', 'Manutenção e suporte'],
              ['license', 'Escopo e condições'],
              ['access', 'Cancelamento e continuidade'],
            ].map(([key, label]) => (
              <label key={key}>
                {label}
                <textarea
                  rows={3}
                  required
                  maxLength={2000}
                  value={offerForm[key]}
                  onChange={(e) => setOfferForm({ ...offerForm, [key]: e.target.value })}
                />
              </label>
            ))}
            <button disabled={busy} className="button button-primary">
              <Save size={17} /> Salvar mensalidade
            </button>
            <p className="muted">
              Credenciais e token do webhook são configurados no servidor, fora do React.
            </p>
          </form>
        )}
        {tab === 'categories' && (
          <form
            className="admin-form"
            onSubmit={(e) => {
              e.preventDefault();
              run(() =>
                saveCategories([
                  'Todos',
                  ...new Set(
                    categoryText
                      .split('\n')
                      .map((c) => c.trim())
                      .filter((c) => c && c !== 'Todos'),
                  ),
                ]),
              );
            }}
          >
            <h2>Organize as inspirações</h2>
            <label>
              Uma categoria por linha
              <textarea
                required
                rows={12}
                value={categoryText}
                onChange={(e) => setCategoryText(e.target.value)}
              />
            </label>
            <button disabled={busy} className="button button-primary">
              <Save size={17} /> Salvar categorias
            </button>
          </form>
        )}
        {tab === 'customers' &&
          (customers.length ? (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Perfil</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>{c.email}</td>
                      <td>{c.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="panel-empty">
              <Users size={40} />
              <h2>
                {demo ? 'Clientes reais só no modo conectado.' : 'Nenhum cliente cadastrado ainda.'}
              </h2>
              <p>
                {demo
                  ? 'Contas demonstrativas não geram clientes nem pagamentos reais.'
                  : 'As contas criadas na plataforma aparecerão aqui.'}
              </p>
            </div>
          ))}
        {tab === 'orders' &&
          (orders.length ? (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Transação</th>
                    <th>Cliente</th>
                    <th>Status</th>
                    <th>Válido até</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.transaction}>
                      <td>{o.transaction}</td>
                      <td>{o.email}</td>
                      <td>{o.status}</td>
                      <td>{new Date(o.valid_until).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="panel-empty">
              <CreditCard size={40} />
              <h2>Nenhum pagamento registrado.</h2>
              <p>Pagamentos confirmados pelo webhook validado aparecem aqui.</p>
            </div>
          ))}
      </div>
      {editing && (
        <div className="modal-overlay">
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="editor-title">
            <div className="modal-header">
              <h2 id="editor-title">Editar referência</h2>
              <button
                className="icon-button"
                aria-label="Fechar editor"
                onClick={() => setEditing(null)}
              >
                <X />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                run(async () => {
                  if (editing.demoUrl && !safeUrl(editing.demoUrl))
                    throw new Error('Informe uma demonstração HTTPS válida.');
                  await saveSystem(editing);
                  setEditing(null);
                });
              }}
            >
              <label>
                Nome
                <input
                  autoFocus
                  required
                  maxLength={100}
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </label>
              <div className="form-row">
                <label>
                  Categoria
                  <select
                    value={editing.category}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  >
                    {categories
                      .filter((c) => c !== 'Todos')
                      .map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                  </select>
                </label>
                <label>
                  Estilo da prévia
                  <select
                    value={editing.theme}
                    onChange={(e) => setEditing({ ...editing, theme: e.target.value })}
                  >
                    {[
                      'barber',
                      'restaurant',
                      'store',
                      'dashboard',
                      'clinic',
                      'landing',
                      'agenda',
                      'agency',
                      'workspace',
                    ].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                Descrição
                <textarea
                  required
                  maxLength={1000}
                  rows={3}
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </label>
              <label>
                Funcionalidades (uma por linha)
                <textarea
                  required
                  rows={3}
                  value={editing.features.join('\n')}
                  onChange={(e) => setEditing({ ...editing, features: e.target.value.split('\n') })}
                />
              </label>
              <label>
                Link da demonstração real
                <input
                  type="url"
                  value={editing.demoUrl}
                  onChange={(e) => setEditing({ ...editing, demoUrl: e.target.value })}
                />
              </label>
              <label className="upload-label">
                <Upload size={17} /> Imagem de apresentação
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => run(() => uploadImage(e.target.files[0]))}
                />
              </label>
              {editing.imageUrl && (
                <button
                  className="text-link"
                  type="button"
                  onClick={() => setEditing({ ...editing, imageUrl: '' })}
                >
                  Remover imagem e usar prévia ilustrativa
                </button>
              )}
              <div className="form-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={editing.published}
                    onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
                  />{' '}
                  Publicar no catálogo
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={editing.featured}
                    onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
                  />{' '}
                  Destacar na homepage
                </label>
              </div>
              {error && <p className="form-error">{error}</p>}
              <button disabled={busy} className="button button-primary full">
                <Save size={17} /> Salvar referência
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
