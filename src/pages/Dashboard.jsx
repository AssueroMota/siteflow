import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, LogOut, FolderKanban, CreditCard, Clock, ArrowUpRight, User } from 'lucide-react';
import { usePlatform } from '../contexts/PlatformContext';
import { api, money, safeUrl } from '../services/api';
export default function Dashboard() {
  const { user, demo, logout, offer } = usePlatform();
  const [data, setData] = useState({ requests: [], orders: [] }),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    if (demo) {
      const items = JSON.parse(localStorage.getItem('siteflow.requests') || '[]');
      setData({
        requests: items.filter((r) => !user || r.email.toLowerCase() === user.email.toLowerCase()),
        orders: [],
      });
      setLoading(false);
    } else if (user) {
      api('/account')
        .then(setData)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    } else setLoading(false);
  }, [demo, user]);
  if (!user && !demo)
    return (
      <div className="section empty-state">
        <h1>Seu projeto tem um espaço aqui.</h1>
        <p>Entre para acompanhar suas solicitações.</p>
        <Link to="/entrar" className="button button-primary">
          Entrar na minha conta
        </Link>
      </div>
    );
  const paid = data.orders.find(
    (o) => o.status === 'active' && new Date(o.valid_until) > new Date(),
  );
  const url = safeUrl(offer.checkoutUrl);
  return (
    <div className="section page-section">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">SEU ESPAÇO SITEFLOW</span>
          <h1>
            Olá, {user?.name?.split(' ')[0] || 'visitante'}
            <span> ✦</span>
          </h1>
          <p>Cada grande projeto começa com uma ideia. Acompanhe a sua por aqui.</p>
        </div>
        <div className="dashboard-actions">
          <Link className="button button-primary" to="/solicitar">
            <Plus size={18} /> Novo projeto
          </Link>
          {user && (
            <button className="icon-button" aria-label="Sair da conta" onClick={logout}>
              <LogOut size={20} />
            </button>
          )}
        </div>
      </div>
      {demo && (
        <div className="info-box">
          Área demonstrativa. As solicitações abaixo foram salvas neste navegador. Nenhuma cobrança
          foi realizada.
        </div>
      )}
      <div className="stats-grid">
        <div>
          <FolderKanban />
          <small>Seus projetos</small>
          <b>{data.requests.length}</b>
        </div>
        <div>
          <Clock />
          <small>Em andamento</small>
          <b>
            {
              data.requests.filter((r) => !['Novo', 'Entregue', 'Cancelado'].includes(r.status))
                .length
            }
          </b>
        </div>
        <div>
          <CreditCard />
          <small>Manutenção mensal</small>
          <b className="status-text">{paid ? 'Ativa' : demo ? 'Demonstração' : 'Não contratada'}</b>
        </div>
      </div>
      <div className="dashboard-columns">
        <section>
          <div className="section-heading compact">
            <h2>Meus projetos</h2>
            <span>{data.requests.length} solicitações</span>
          </div>
          {loading ? (
            <p>Carregando seus projetos…</p>
          ) : error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : data.requests.length ? (
            data.requests.map((r) => (
              <details className="project-item" key={r.id}>
                <summary>
                  <span className="project-avatar">
                    <FolderKanban size={21} />
                  </span>
                  <span>
                    <b>{r.business}</b>
                    <small>
                      {r.type} · {new Date(r.createdAt || r.created_at).toLocaleDateString('pt-BR')}
                    </small>
                  </span>
                  <span
                    className={`status-badge status-${r.status === 'Entregue' ? 'done' : 'pending'}`}
                  >
                    {r.status}
                  </span>
                </summary>
                <div className="project-body">
                  <p>{r.description}</p>
                  {r.notes && (
                    <div className="info-box">
                      <b>Atualização da equipe</b>
                      <p>{r.notes}</p>
                    </div>
                  )}
                  <div className="project-timeline">
                    {[
                      'Novo',
                      'Em análise',
                      'Proposta enviada',
                      'Em desenvolvimento',
                      'Em revisão',
                      'Entregue',
                    ].map((t, i) => (
                      <span
                        key={t}
                        className={
                          i <=
                          [
                            'Novo',
                            'Em análise',
                            'Proposta enviada',
                            'Em desenvolvimento',
                            'Em revisão',
                            'Entregue',
                          ].indexOf(r.status)
                            ? 'complete'
                            : ''
                        }
                      >
                        <i />
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </details>
            ))
          ) : (
            <div className="panel-empty">
              <FolderKanban size={34} />
              <h3>Vamos começar?</h3>
              <p>Conte sua ideia e ela aparecerá aqui.</p>
              <Link to="/solicitar" className="text-link">
                Solicitar meu primeiro projeto <ArrowUpRight size={16} />
              </Link>
            </div>
          )}
          <h2 className="orders-heading">Histórico financeiro</h2>
          {data.orders.length ? (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Transação</th>
                    <th>Status</th>
                    <th>Válido até</th>
                  </tr>
                </thead>
                <tbody>
                  {data.orders.map((o) => (
                    <tr key={o.transaction}>
                      <td>{o.transaction}</td>
                      <td>{o.status}</td>
                      <td>{new Date(o.valid_until).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="muted">Ainda não há pagamentos confirmados para esta conta.</p>
          )}
        </section>
        <aside className="account-card">
          <User size={25} />
          <h3>Seu cadastro</h3>
          <p>{user?.name || 'Visitante demonstrativo'}</p>
          <p>{user?.email || 'Entre para visualizar sua conta.'}</p>
          <hr />
          <CreditCard size={25} />
          <h3>Manutenção do projeto</h3>
          <b className="account-price">
            {money(offer.price)}
            <small>/mês</small>
          </b>
          <p>
            Contratação após aprovação da proposta. O status muda após confirmação do pagamento.
          </p>
          {url && !demo ? (
            <a href={url} className="button button-primary" target="_blank" rel="noreferrer">
              Ir para a assinatura
            </a>
          ) : (
            <Link className="button button-outline" to="/mensalidade">
              Ver condições
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}
