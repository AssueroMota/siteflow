import { useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Scissors,
  Utensils,
  ShoppingBag,
  Heart,
  CalendarDays,
  Shapes,
  Zap,
  Layers,
  X,
} from 'lucide-react';
import { themePhotos, photos } from '../../data/photography';
import { landingPages } from '../../data/landingPages';
const icons = {
  barber: Scissors,
  restaurant: Utensils,
  store: ShoppingBag,
  clinic: Heart,
  agenda: CalendarDays,
  agency: Shapes,
  landing: Zap,
  dashboard: Layers,
  workspace: Layers,
};
export default function LandingPage({ system, interactive = false }) {
  const theme = system.theme || 'landing';
  const content = landingPages[theme] || landingPages.landing;
  const photo = themePhotos[theme] || photos.studio;
  const Icon = icons[theme] || Zap;
  const [contact, setContact] = useState(false),
    [sent, setSent] = useState(false);
  const prefix = `landing-${system.id}`;
  const Title = interactive ? 'h1' : 'h3';
  const action = () => {
    if (interactive) {
      setSent(false);
      setContact(true);
    }
  };
  const Cta = ({ className = '', children, onClick = action }) =>
    interactive ? (
      <button className={`lp-button ${className}`} onClick={onClick}>
        {children}
      </button>
    ) : (
      <span className={`lp-button ${className}`}>{children}</span>
    );
  const Nav = ({ section, children }) =>
    interactive ? <a href={`#${prefix}-${section}`}>{children}</a> : <span>{children}</span>;
  return (
    <article
      className={`lp-page lp-${theme} lp-${content.variant} ${interactive ? 'is-interactive' : ''}`}
    >
      <header className="lp-header">
        <div className="lp-logo">
          <Icon size={23} />
          <b>{system.name}</b>
        </div>
        <nav aria-label={`Navegação ${system.name}`}>
          <Nav section="services">
            {theme === 'restaurant' ? 'Cardápio' : theme === 'store' ? 'Coleção' : 'Serviços'}
          </Nav>
          <Nav section="about">Sobre</Nav>
          <Nav section="contact">Contato</Nav>
        </nav>
        <Cta className="lp-header-cta">
          {theme === 'restaurant' ? 'Reservar' : theme === 'barber' ? 'Agendar' : 'Vamos conversar'}
          <ArrowUpRight size={14} />
        </Cta>
      </header>
      <section className="lp-hero">
        <div className="lp-hero-copy">
          <span className="lp-eyebrow">{content.eyebrow}</span>
          <Title>
            {content.title[0]}
            <br />
            <em>{content.title[1]}</em>
          </Title>
          <p>{content.intro}</p>
          <div className="lp-hero-actions">
            <Cta
              onClick={
                theme === 'store' && interactive
                  ? () =>
                      document
                        .getElementById(`${prefix}-services`)
                        ?.scrollIntoView({ behavior: 'smooth' })
                  : action
              }
            >
              {content.action}
              <ArrowRight size={17} />
            </Cta>
            <span className="lp-hero-detail">
              <span /> {content.tagline}
            </span>
          </div>
        </div>
        <div className="lp-hero-image">
          <img src={photo.path} alt={photo.alt} loading="lazy" width={1400} height={934} />
          <span className="lp-image-mark">
            <Icon size={24} />
          </span>
        </div>
      </section>
      <section className="lp-services" id={`${prefix}-services`}>
        <div className="lp-section-title">
          <div>
            <span className="lp-eyebrow">PENSADO PARA VOCÊ</span>
            <h2>{content.section}</h2>
          </div>
        </div>
        <div className="lp-service-grid">
          {content.services.map(([title, description], index) => (
            <div className="lp-service-card" key={title}>
              <span className="lp-service-number">
                0{index + 1}
                <ChevronRight size={18} />
              </span>
              <h3>{title}</h3>
              <p>{description}</p>
              {interactive ? (
                <button onClick={action}>
                  Quero conhecer <ArrowUpRight size={15} />
                </button>
              ) : (
                <span className="lp-service-link">
                  Quero conhecer <ArrowUpRight size={15} />
                </span>
              )}
            </div>
          ))}
        </div>
      </section>
      <section className="lp-about" id={`${prefix}-about`}>
        <div className="lp-about-image">
          <img src={photo.path} alt={photo.alt} loading="lazy" width={1400} height={934} />
        </div>
        <div>
          <span className="lp-eyebrow">CONHEÇA A NOSSA PROPOSTA</span>
          <h2>{content.aboutTitle}</h2>
          <p>{content.about}</p>
          <Cta className="lp-secondary">
            Vamos conversar <ArrowUpRight size={16} />
          </Cta>
        </div>
      </section>
      <section className="lp-contact" id={`${prefix}-contact`}>
        <span className="lp-eyebrow">O PRÓXIMO PASSO COMEÇA COM VOCÊ</span>
        <h2>{content.contact}</h2>
        <Cta>
          {content.action}
          <ArrowUpRight size={18} />
        </Cta>
      </section>
      <footer className="lp-footer">
        <span className="lp-logo">
          <Icon size={20} />
          <b>{system.name}</b>
        </span>
        <span>{content.tagline}</span>
      </footer>
      {interactive && contact && (
        <div
          className="lp-modal-overlay"
          onKeyDown={(event) => {
            if (event.key === 'Escape') setContact(false);
          }}
        >
          <div
            className="lp-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Contato demonstrativo"
          >
            <button
              className="lp-close"
              aria-label="Fechar formulário"
              onClick={() => setContact(false)}
            >
              <X size={23} />
            </button>
            {sent ? (
              <div className="lp-success">
                <CheckCircle2 size={46} />
                <h2>Você conheceu o fluxo de contato.</h2>
                <p>Esta é uma demonstração. Nenhuma mensagem ou agendamento foi enviado.</p>
                <button className="lp-button" onClick={() => setContact(false)}>
                  Continuar explorando
                </button>
              </div>
            ) : (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  setSent(true);
                }}
              >
                <span className="lp-eyebrow">VAMOS CONVERSAR</span>
                <h2>{content.action}</h2>
                <p>Experimente o formulário deste modelo com dados fictícios.</p>
                <label>
                  Seu nome
                  <input
                    name="name"
                    required
                    maxLength={100}
                    autoFocus
                    placeholder="Nome de exemplo"
                  />
                </label>
                <label>
                  E-mail
                  <input name="email" type="email" required placeholder="exemplo@email.com" />
                </label>
                <label>
                  O que você tem em mente?
                  <textarea
                    name="message"
                    rows={3}
                    required
                    minLength={10}
                    maxLength={1000}
                    placeholder="Conte um pouco mais…"
                  />
                </label>
                <button type="submit" className="lp-button">
                  Testar envio
                  <ArrowRight size={17} />
                </button>
                <small>Formulário demonstrativo. Seus dados não são enviados.</small>
              </form>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
