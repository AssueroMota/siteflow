import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  Code2,
  FileCheck2,
  Globe2,
  Headphones,
  LayoutTemplate,
  ListChecks,
  MousePointerClick,
  Palette,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import Reveal from '../ui/Reveal';
const tabs = [
  {
    id: 'criacao',
    label: 'Na criação',
    kicker: 'DO CONCEITO À EXPERIÊNCIA',
    title: 'Uma presença que faz sentido para você.',
    intro: 'Design, conteúdo e navegação trabalhando juntos para apresentar o seu negócio.',
    items: [
      [Palette, 'Sua identidade', 'Cores, tipografia e conteúdo adaptados à sua marca.'],
      [
        LayoutTemplate,
        'Estrutura bem pensada',
        'Páginas e seções organizadas conforme os objetivos do projeto.',
      ],
      [
        Smartphone,
        'Em diferentes telas',
        'Experiência ajustada para computador, tablet e celular.',
      ],
      [
        MousePointerClick,
        'Um próximo passo claro',
        'Formulários e chamadas de contato definidos no escopo.',
      ],
    ],
  },
  {
    id: 'manutencao',
    label: 'Na manutenção mensal',
    kicker: 'DEPOIS QUE O PROJETO VAI AO AR',
    title: 'O cuidado continua depois da entrega.',
    intro:
      'As condições de manutenção são alinhadas na proposta, para você saber com o que pode contar.',
    items: [
      [Settings2, 'Manutenção técnica', 'Correções e ajustes previstos no acordo de manutenção.'],
      [Headphones, 'Acompanhamento', 'Solicitações e atualizações organizadas na área do cliente.'],
      [
        RefreshCw,
        'Conteúdo e alterações',
        'Atualizações avaliadas conforme o escopo do seu projeto.',
      ],
      [Globe2, 'Hospedagem e domínio', 'Condições de infraestrutura definidas na proposta.'],
    ],
  },
  {
    id: 'proposta',
    label: 'Combinado na proposta',
    kicker: 'CLAREZA ANTES DE CONTRATAR',
    title: 'Você sabe o que está contratando.',
    intro:
      'Cada negócio tem necessidades próprias. Estes pontos são definidos com você antes do início.',
    items: [
      [
        CalendarDays,
        'Escopo e prazo',
        'Entregas, etapas e prazo alinhados à complexidade do projeto.',
      ],
      [
        Code2,
        'Integrações e recursos',
        'Pagamentos, agendas e sistemas externos avaliados caso a caso.',
      ],
      [
        ShieldCheck,
        'Continuidade do projeto',
        'Condições de acesso, propriedade e cancelamento apresentadas no contrato.',
      ],
      [
        FileCheck2,
        'Evoluções futuras',
        'Novas funcionalidades recebem avaliação e proposta próprias.',
      ],
    ],
  },
];
export default function DeliverablesSection() {
  const [active, setActive] = useState('criacao');
  const current = tabs.find((tab) => tab.id === active);
  function navigate(event, index) {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      setActive(tabs[next].id);
      document.getElementById(`delivery-tab-${tabs[next].id}`)?.focus();
    }
  }
  return (
    <section className="section deliverables-section" id="o-que-recebe">
      <Reveal direction="up" className="deliverables-heading">
        <span className="eyebrow">SEM FICAR NA DÚVIDA</span>
        <h2>
          O que faz parte
          <br />
          <span>do seu projeto.</span>
        </h2>
        <p>
          Da criação à manutenção, entenda o que entra em cada etapa e o que vamos definir juntos.
        </p>
      </Reveal>
      <Reveal direction="down">
        <div className="deliverables-tabs" role="tablist" aria-label="Etapas e entregas">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              id={`delivery-tab-${tab.id}`}
              role="tab"
              aria-selected={active === tab.id}
              aria-controls={`delivery-panel-${tab.id}`}
              tabIndex={active === tab.id ? 0 : -1}
              onClick={() => setActive(tab.id)}
              onKeyDown={(event) => navigate(event, index)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Reveal>
      <div
        id={`delivery-panel-${current.id}`}
        className="deliverables-panel"
        role="tabpanel"
        aria-labelledby={`delivery-tab-${current.id}`}
        tabIndex={0}
        key={current.id}
      >
        <div className="deliverables-panel-intro">
          <span>{current.kicker}</span>
          <h3>{current.title}</h3>
          <p>{current.intro}</p>
        </div>
        <div className="deliverables-grid">
          {current.items.map(([Icon, title, description], index) => (
            <Reveal
              direction={['left', 'right', 'up', 'down'][index]}
              delay={index * 65}
              key={title}
              className="delivery-item"
            >
              <span>
                <Icon size={23} />
              </span>
              <div>
                <h4>{title}</h4>
                <p>{description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
      <Reveal direction="up" className="delivery-start">
        <div>
          <span>
            <ListChecks size={24} />
          </span>
          <div>
            <h3>O que ajuda a começar?</h3>
            <p>
              <span>
                <Check size={14} /> Uma ideia ou objetivo
              </span>
              <span>
                <Check size={14} /> Referências que você gosta
              </span>
              <span>
                <Check size={14} /> O que o projeto precisa fazer
              </span>
            </p>
          </div>
        </div>
        <Link to="/solicitar" className="text-link">
          Já posso contar minha ideia <ArrowUpRight size={17} />
        </Link>
      </Reveal>
    </section>
  );
}
