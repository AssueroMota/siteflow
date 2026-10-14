import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, Sparkles, MessageSquare } from 'lucide-react';
import { usePlatform } from '../contexts/PlatformContext';
import { api } from '../services/api';
export default function Request() {
  const { systems, user, demo } = usePlatform();
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    business: '',
    type:
      params.get('tipo') === 'melhorar' ? 'Melhoria de projeto existente' : 'Site institucional',
    model: params.get('modelo') || '',
    description: '',
    consent: false,
  });
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [done, setDone] = useState(null);
  const change = (e) =>
    setForm({
      ...form,
      [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    });
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      let result;
      if (demo) {
        const item = {
          ...form,
          id: crypto.randomUUID(),
          status: 'Novo',
          createdAt: new Date().toISOString(),
          demo: true,
        };
        const old = JSON.parse(localStorage.getItem('siteflow.requests') || '[]');
        localStorage.setItem('siteflow.requests', JSON.stringify([item, ...old]));
        result = item;
      } else result = await api('/requests', { method: 'POST', body: JSON.stringify(form) });
      setDone(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="section page-section">
      <div className="request-layout">
        <aside>
          <span className="eyebrow">O PRIMEIRO PASSO É UMA CONVERSA</span>
          <h1>
            Conte sua ideia.
            <br />
            <span>Vamos criar juntos.</span>
          </h1>
          <p>
            Você não precisa saber programar nem ter tudo definido. Conte o que seu negócio precisa
            e o que imagina para o projeto.
          </p>
          <div className="request-tip">
            <Sparkles />
            <h3>Uma dica para começar</h3>
            <p>
              Quem vai usar? O que precisa fazer? Tem alguma referência? Esses detalhes ajudam a
              desenhar a solução.
            </p>
          </div>
          <div className="check-line">
            <MessageSquare size={20} />
            <span>Escopo e condições alinhados antes da contratação.</span>
          </div>
        </aside>
        {done ? (
          <div className="request-form success-state">
            <CheckCircle2 size={54} />
            <h2>{demo ? 'Ideia salva na demonstração!' : 'Recebemos sua ideia!'}</h2>
            <p>
              {demo
                ? 'Sua solicitação foi salva apenas neste navegador. Nenhuma mensagem foi enviada à equipe.'
                : 'Sua solicitação foi registrada. A equipe poderá consultar seus detalhes no painel e entrar em contato.'}
            </p>
            <p className="request-number">Protocolo: {done.id.slice(0, 8).toUpperCase()}</p>
            <Link className="button button-primary" to="/painel">
              Acompanhar meus projetos <ArrowUpRight size={18} />
            </Link>
            <button className="text-link" onClick={() => setDone(null)}>
              Enviar outra ideia
            </button>
          </div>
        ) : (
          <form className="request-form" onSubmit={submit}>
            <div className="form-title">
              <span>✦</span>
              <div>
                <h2>Seu próximo projeto</h2>
                <p>Vamos conhecer um pouco mais.</p>
              </div>
            </div>
            <div className="form-row">
              <label>
                Seu nome
                <input
                  name="name"
                  required
                  maxLength={100}
                  value={form.name}
                  onChange={change}
                  placeholder="Como podemos chamar você?"
                />
              </label>
              <label>
                E-mail
                <input
                  name="email"
                  required
                  type="email"
                  maxLength={200}
                  value={form.email}
                  onChange={change}
                  placeholder="voce@empresa.com"
                />
              </label>
            </div>
            <div className="form-row">
              <label>
                WhatsApp
                <input
                  name="phone"
                  type="tel"
                  maxLength={30}
                  value={form.phone}
                  onChange={change}
                  placeholder="(11) 99999-9999"
                />
              </label>
              <label>
                Nome do seu negócio
                <input
                  name="business"
                  required
                  maxLength={150}
                  value={form.business}
                  onChange={change}
                  placeholder="Sua marca ou empresa"
                />
              </label>
            </div>
            <div className="form-row">
              <label>
                O que você quer criar?
                <select name="type" value={form.type} onChange={change}>
                  {[
                    'Site institucional',
                    'Melhoria de projeto existente',
                    'Loja virtual',
                    'Landing page',
                    'Sistema personalizado',
                    'Agendamentos',
                    'Ainda estou descobrindo',
                  ].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label>
                Referência do catálogo
                <select name="model" value={form.model} onChange={change}>
                  <option value="">Quero uma ideia do zero</option>
                  {systems
                    .filter((s) => s.published)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
              </label>
            </div>
            <label>
              Conte o que você tem em mente
              <textarea
                name="description"
                required
                minLength={20}
                maxLength={5000}
                rows={5}
                value={form.description}
                onChange={change}
                placeholder="Quero um site para minha empresa com… Quais funções você precisa? O que gostaria que seu cliente pudesse fazer?"
              />
              <small>Mínimo de 20 caracteres. Não inclua senhas ou informações sensíveis.</small>
            </label>
            <label className="checkbox-label">
              <input
                name="consent"
                type="checkbox"
                required
                checked={form.consent}
                onChange={change}
              />
              <span>
                Autorizo o uso destes dados para analisar a solicitação e entrar em contato.{' '}
                <Link to="/termos">Ver privacidade.</Link>
              </span>
            </label>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            {demo && (
              <p className="demo-form-note">
                Modo demonstrativo: os dados ficam apenas neste navegador.
              </p>
            )}
            <button disabled={busy} className="button button-primary full" type="submit">
              {busy ? 'Salvando sua ideia…' : 'Enviar minha ideia'}
              <ArrowUpRight size={19} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
