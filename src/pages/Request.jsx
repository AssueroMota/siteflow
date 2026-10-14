import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { usePlatform } from '../contexts/PlatformContext';
import { api } from '../services/api';
import { projectMessage, whatsappLink } from '../../shared/contact';
import { WhatsAppIcon } from '../components/ui/WhatsAppContact';

const steps = ['Seu projeto', 'O que precisa', 'Contato e envio'];
const features = [
  'Formulário de contato',
  'Botão do WhatsApp',
  'Agendamento',
  'Catálogo de produtos',
  'Loja e pagamentos',
  'Área do cliente',
  'Painel de gestão',
  'Integrações',
];
const types = [
  'Site institucional',
  'Melhoria de projeto existente',
  'Loja virtual',
  'Landing page',
  'Sistema personalizado',
  'Agendamentos',
  'Ainda estou descobrindo',
];

export default function Request() {
  const { systems, user, demo, offer } = usePlatform();
  const [params, setParams] = useSearchParams();
  const published = systems.filter((item) => item.published);
  const requestedModel = published.some((item) => item.id === params.get('modelo'))
    ? params.get('modelo')
    : '';
  const requestedType = params.get('tipo');
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    business: '',
    type:
      params.get('tipo') === 'melhorar'
        ? 'Melhoria de projeto existente'
        : params.get('modelo')
          ? 'Landing page'
          : 'Site institucional',
    model: published.some((item) => item.id === params.get('modelo')) ? params.get('modelo') : '',
    description: '',
    goal: 'Receber mais contatos',
    timeline: 'Quero orientação sobre o prazo',
    features: [],
    consent: false,
  });
  const [step, setStep] = useState(0),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [done, setDone] = useState(null);
  const heading = useRef(null);
  useEffect(() => {
    setForm((previous) => ({
      ...previous,
      model: requestedModel,
      ...(requestedType === 'melhorar' ? { type: 'Melhoria de projeto existente' } : {}),
    }));
    setStep(0);
    setDone(null);
  }, [requestedModel, requestedType]);
  const selected = published.find((item) => item.id === form.model);
  const protocol = done?.id.slice(0, 8).toUpperCase();
  const contact = whatsappLink(offer.whatsapp, projectMessage(selected?.name, protocol));
  const change = (event) =>
    setForm((previous) => ({
      ...previous,
      [event.target.name]:
        event.target.type === 'checkbox' ? event.target.checked : event.target.value,
    }));
  function goTo(next) {
    setStep(next);
    setError('');
    requestAnimationFrame(() => {
      heading.current?.focus();
      heading.current?.scrollIntoView({ block: 'nearest' });
    });
  }
  async function submit(event) {
    event.preventDefault();
    if (step === 0 && !form.business.trim()) {
      setError('Informe o nome do seu negócio para continuar.');
      return;
    }
    if (step === 1 && form.description.trim().length < 20) {
      setError('Descreva sua ideia com pelo menos 20 caracteres.');
      return;
    }
    if (step < 2) {
      goTo(step + 1);
      return;
    }
    if (!form.name.trim()) {
      setError('Informe seu nome para enviar a ideia.');
      return;
    }
    if (busy) return;
    setBusy(true);
    setError('');
    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      business: form.business.trim(),
      type: form.type,
      model: form.model,
      consent: form.consent,
      description: `${form.description.trim()}\n\nObjetivo: ${form.goal}\nRecursos desejados: ${form.features.join(', ') || 'A definir em conjunto'}\nExpectativa de prazo: ${form.timeline}`,
    };
    try {
      let result;
      if (demo) {
        const item = {
          ...payload,
          id: crypto.randomUUID(),
          status: 'Novo',
          createdAt: new Date().toISOString(),
          demo: true,
        };
        let old;
        try {
          old = JSON.parse(localStorage.getItem('siteflow.requests') || '[]');
        } catch {
          old = [];
        }
        localStorage.setItem(
          'siteflow.requests',
          JSON.stringify([item, ...(Array.isArray(old) ? old : [])]),
        );
        result = item;
      } else result = await api('/requests', { method: 'POST', body: JSON.stringify(payload) });
      setDone(result);
      requestAnimationFrame(() => heading.current?.focus());
    } catch (cause) {
      setError(cause.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="section page-section">
      <div className="request-layout guided-request">
        <aside>
          <span className="eyebrow">O PRIMEIRO PASSO É UMA CONVERSA</span>
          <h1>
            Conte sua ideia.
            <br />
            <span>Vamos criar juntos.</span>
          </h1>
          <p>
            Você conta o que precisa. A gente transforma isso em uma proposta para criar seu site ou
            sistema e cuidar da manutenção mensal.
          </p>
          <div className="request-tip">
            <Sparkles />
            <h3>Você não precisa saber tudo.</h3>
            <p>
              Uma referência e uma descrição do seu negócio já ajudam a começar. Os detalhes
              técnicos são alinhados com você.
            </p>
          </div>
          <ol className="briefing-benefits">
            <li>
              <Check size={18} /> Projeto adaptado à sua marca
            </li>
            <li>
              <Check size={18} /> Escopo e prazo antes de contratar
            </li>
            <li>
              <Check size={18} /> Acompanhamento pela área do cliente
            </li>
          </ol>
          <div className="check-line">
            <MessageSquare size={20} />
            <span>Enviar a ideia não inicia uma cobrança.</span>
          </div>
        </aside>
        {done ? (
          <div className="request-form success-state">
            <CheckCircle2 size={54} />
            <h2 ref={heading} tabIndex={-1}>
              {demo ? 'Ideia salva na demonstração!' : 'Recebemos sua ideia!'}
            </h2>
            <p>
              {demo
                ? 'Sua solicitação foi salva apenas neste navegador. Nenhuma mensagem foi enviada à equipe.'
                : 'Sua solicitação foi registrada. A equipe poderá analisar os detalhes e entrar em contato pelos dados informados.'}
            </p>
            <p className="request-number">Protocolo: {protocol}</p>
            <div className="request-next">
              <h3>E agora?</h3>
              <ol>
                <li>Analisamos o objetivo e os recursos desejados.</li>
                <li>Alinhamos escopo, prazo e condições da mensalidade.</li>
                <li>Você aprova a proposta antes de começar.</li>
              </ol>
            </div>
            {contact && (
              <a
                className="button whatsapp-action full"
                href={contact}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon size={20} /> Conversar sobre este projeto <ArrowUpRight size={18} />
              </a>
            )}
            <Link className="button button-primary full" to="/painel">
              Acompanhar meus projetos <ArrowUpRight size={18} />
            </Link>
            {!user && !demo && (
              <p>
                Para acompanhar no painel, entre ou crie uma conta com{' '}
                <b>o mesmo e-mail usado na solicitação</b> e confirme seu endereço.
              </p>
            )}
            <button
              className="text-link"
              onClick={() => {
                setDone(null);
                setForm((previous) => ({
                  ...previous,
                  description: '',
                  features: [],
                  consent: false,
                }));
                goTo(0);
              }}
            >
              Enviar outra ideia
            </button>
          </div>
        ) : (
          <form className="request-form" onSubmit={submit}>
            <nav aria-label="Etapas do pedido">
              <ol className="briefing-steps">
                {steps.map((label, index) => (
                  <li
                    key={label}
                    aria-current={index === step ? 'step' : undefined}
                    className={index < step ? 'completed' : ''}
                  >
                    <span>{index < step ? <Check size={17} /> : index + 1}</span>
                    <b>{label}</b>
                  </li>
                ))}
              </ol>
            </nav>
            <div className="form-title">
              <span>✦</span>
              <div>
                <h2 ref={heading} tabIndex={-1}>
                  {steps[step]}
                </h2>
                <p>
                  Etapa {step + 1} de 3 ·{' '}
                  {step === 0
                    ? 'Qual é o seu próximo passo?'
                    : step === 1
                      ? 'Vamos entender a sua ideia.'
                      : 'Confira os detalhes e envie.'}
                </p>
              </div>
            </div>
            {step === 0 && (
              <>
                <label>
                  Nome do seu negócio
                  <input
                    name="business"
                    required
                    maxLength={150}
                    autoComplete="organization"
                    value={form.business}
                    onChange={change}
                    placeholder="Sua marca ou empresa"
                  />
                </label>
                <label>
                  O que você quer criar?
                  <select name="type" value={form.type} onChange={change}>
                    {types.map((type) => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Referência do catálogo
                  <select
                    name="model"
                    value={form.model}
                    onChange={(event) => {
                      change(event);
                      setParams(
                        (previous) => {
                          const next = new URLSearchParams(previous);
                          if (event.target.value) next.set('modelo', event.target.value);
                          else next.delete('modelo');
                          return next;
                        },
                        { replace: true },
                      );
                    }}
                  >
                    <option value="">Quero uma ideia do zero</option>
                    {published.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
                {selected && (
                  <div className="briefing-reference">
                    <div>
                      <span>SEU PONTO DE PARTIDA</span>
                      <b>{selected.name}</b>
                      <small>{selected.category} · Adaptado ao seu negócio</small>
                    </div>
                    <Link to={`/modelos/${selected.id}`} target="_blank" rel="noopener noreferrer">
                      Rever modelo <ArrowUpRight size={17} />
                    </Link>
                  </div>
                )}
                <label>
                  Principal objetivo
                  <select name="goal" value={form.goal} onChange={change}>
                    {[
                      'Receber mais contatos',
                      'Apresentar minha empresa',
                      'Vender pela internet',
                      'Organizar a operação',
                      'Automatizar uma tarefa',
                      'Ainda quero descobrir',
                    ].map((goal) => (
                      <option key={goal}>{goal}</option>
                    ))}
                  </select>
                </label>
              </>
            )}
            {step === 1 && (
              <>
                <label>
                  Conte o que você tem em mente
                  <textarea
                    name="description"
                    required
                    minLength={20}
                    maxLength={4000}
                    rows={5}
                    value={form.description}
                    onChange={change}
                    placeholder="O que seu negócio faz? Quem vai usar o projeto? O que essa pessoa precisa conseguir fazer?"
                  />
                  <small>
                    Mínimo de 20 caracteres · {form.description.length}/4000. Não inclua senhas ou
                    informações sensíveis.
                  </small>
                </label>
                <fieldset className="briefing-features">
                  <legend>
                    Quais recursos você imagina? <small>Opcional</small>
                  </legend>
                  <div>
                    {features.map((feature) => (
                      <label key={feature}>
                        <input
                          type="checkbox"
                          checked={form.features.includes(feature)}
                          onChange={(event) =>
                            setForm((previous) => ({
                              ...previous,
                              features: event.target.checked
                                ? [...previous.features, feature]
                                : previous.features.filter((item) => item !== feature),
                            }))
                          }
                        />
                        <span>{feature}</span>
                      </label>
                    ))}
                  </div>
                  <p>
                    Selecione o que faz sentido. A viabilidade e o escopo serão avaliados na
                    proposta.
                  </p>
                </fieldset>
                <label>
                  Quando gostaria de começar?
                  <select name="timeline" value={form.timeline} onChange={change}>
                    {[
                      'Quero orientação sobre o prazo',
                      'Assim que possível',
                      'Nas próximas semanas',
                      'Estou planejando para os próximos meses',
                    ].map((timeline) => (
                      <option key={timeline}>{timeline}</option>
                    ))}
                  </select>
                  <small>
                    Essa preferência ajuda no planejamento. O prazo é confirmado na proposta.
                  </small>
                </label>
              </>
            )}
            {step === 2 && (
              <>
                <div className="briefing-review">
                  <h3>
                    Sua ideia, em resumo{' '}
                    <button type="button" onClick={() => goTo(0)}>
                      Editar projeto
                    </button>
                  </h3>
                  <dl>
                    <div>
                      <dt>Negócio</dt>
                      <dd>{form.business}</dd>
                    </div>
                    <div>
                      <dt>Projeto</dt>
                      <dd>{form.type}</dd>
                    </div>
                    <div>
                      <dt>Referência</dt>
                      <dd>{selected?.name || 'Criação do zero'}</dd>
                    </div>
                    <div>
                      <dt>Objetivo</dt>
                      <dd>{form.goal}</dd>
                    </div>
                  </dl>
                  <details>
                    <summary>Ver descrição e recursos</summary>
                    <p>{form.description}</p>
                    <p>{form.features.join(' · ') || 'Recursos a definir em conjunto'}</p>
                    <p>{form.timeline}</p>
                    <button type="button" className="text-link" onClick={() => goTo(1)}>
                      Editar necessidades
                    </button>
                  </details>
                </div>
                <div className="form-row">
                  <label>
                    Seu nome
                    <input
                      name="name"
                      required
                      maxLength={100}
                      autoComplete="name"
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
                      autoComplete="email"
                      value={form.email}
                      onChange={change}
                      placeholder="voce@empresa.com"
                    />
                  </label>
                </div>
                <label>
                  WhatsApp
                  <input
                    name="phone"
                    type="tel"
                    maxLength={30}
                    autoComplete="tel"
                    value={form.phone}
                    onChange={change}
                    placeholder="(81) 99999-9999"
                  />
                  <small>Opcional. Inclua o DDD para facilitar o contato.</small>
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
                {demo && (
                  <p className="demo-form-note">
                    Modo demonstrativo: os dados ficam apenas neste navegador.
                  </p>
                )}
              </>
            )}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <div className="briefing-navigation">
              {step > 0 && (
                <button
                  type="button"
                  className="button button-outline"
                  disabled={busy}
                  onClick={() => goTo(step - 1)}
                >
                  <ArrowLeft size={18} /> Voltar
                </button>
              )}
              <button disabled={busy} className="button button-primary" type="submit">
                {busy ? 'Salvando sua ideia…' : step === 2 ? 'Enviar minha ideia' : 'Continuar'}
                <ArrowRight size={18} />
              </button>
            </div>
            <p className="briefing-footnote">
              Projeto personalizado + manutenção mensal. Condições alinhadas antes da contratação.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
