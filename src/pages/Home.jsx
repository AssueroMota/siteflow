import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  Code2,
  Check,
  ShieldCheck,
  Headphones,
  Rocket,
  Paintbrush,
  MessageSquare,
  Monitor,
  Smartphone,
} from 'lucide-react';
import { photos } from '../data/photography';
import { usePlatform } from '../contexts/PlatformContext';
import { money } from '../services/api';
import LaptopShowcase from '../components/ui/LaptopShowcase';
import AboutSection from '../components/home/AboutSection';
import TrustSection from '../components/home/TrustSection';
import LeadSection from '../components/home/LeadSection';
import FAQ from '../components/ui/FAQ';
export default function Home() {
  const { systems, offer, demo } = usePlatform();
  const visible = systems.filter((s) => s.published);
  return (
    <>
      <section className="hero section">
        <div className="hero-copy">
          <span className="pill">
            <span /> GRANDES IDEIAS MERECEM SAIR DO PAPEL
          </span>
          <h1>
            Sua ideia.
            <br />
            Um site{' '}
            <span className="neon-word">
              fora do
              <br />
              comum.
            </span>
          </h1>
          <p>
            Um site com a sua cara. Um sistema do seu jeito.
            <br className="desktop-break" /> Conte sua ideia, deixe a criação com a gente e mantenha
            tudo funcionando com uma mensalidade.
          </p>
          <div className="hero-actions">
            <Link to="/solicitar" className="button button-primary">
              Vamos criar meu projeto <ArrowUpRight size={19} />
            </Link>
            <Link to="/catalogo" className="button button-outline">
              Explorar catálogo <ArrowRight size={17} />
            </Link>
          </div>
          <div className="hero-checks">
            <span>
              <Check size={15} /> Feito para o seu negócio
            </span>
            <span>
              <Check size={15} /> Manutenção mensal
            </span>
          </div>
        </div>
        <div className="hero-visual hero-visual-neon">
          <figure className="hero-photo">
            <img
              src={photos.studio.path}
              alt={photos.studio.alt}
              fetchPriority="high"
              width={1400}
              height={2489}
            />
            <figcaption>
              <span>DA PRIMEIRA IDEIA AO PROJETO NO AR</span>
              <b>
                O digital pode
                <br />
                ir muito além<span>.</span>
              </b>
            </figcaption>
          </figure>
          <div className="floating-label top-label">
            <Sparkles size={20} /> Sua marca em outra dimensão
          </div>
          <div className="floating-label bottom-label">
            <span className="status-dot" />
            <div>
              <b>Seu próximo projeto</b>
              <small>começa com uma conversa.</small>
            </div>
            <ArrowUpRight size={19} />
          </div>
        </div>
      </section>
      <section className="promise-strip">
        <span>
          <Code2 /> Sites & sistemas
        </span>
        <span>
          <Paintbrush /> Design personalizado
        </span>
        <span>
          <Smartphone /> Em qualquer tela
        </span>
        <span>
          <Headphones /> Suporte de verdade
        </span>
        <span>
          <ShieldCheck /> Manutenção contínua
        </span>
      </section>
      <section className="section showcase" id="catalogo">
        <div className="section-heading">
          <div>
            <h2>
              Landing pages com <span>identidade.</span>
            </h2>
            <p>Abra os modelos para conhecer a página completa.</p>
          </div>
          <Link className="text-link" to="/catalogo">
            Ver catálogo completo <ArrowUpRight size={18} />
          </Link>
        </div>
        <LaptopShowcase systems={visible} label="Conheça nossos modelos no laptop" />
      </section>
      <AboutSection />
      <section className="process-section" id="como-funciona">
        <div className="section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">DA CONVERSA AO PRIMEIRO CLIQUE</span>
              <h2>
                Menos complicação.
                <br />
                <span>Mais realização.</span>
              </h2>
            </div>
            <p>
              Você cuida do seu negócio.
              <br />A gente cuida da parte digital.
            </p>
          </div>
          <div className="process-grid">
            {[
              [
                MessageSquare,
                '01',
                'Conte sua ideia',
                'Escolha uma referência ou descreva o que você precisa. Queremos conhecer o seu negócio.',
              ],
              [
                Paintbrush,
                '02',
                'A gente cria para você',
                'Com o escopo alinhado, transformamos sua ideia em um projeto com a sua identidade.',
              ],
              [
                Rocket,
                '03',
                'Seu projeto ganha vida',
                'Você acompanha, aprova e vê seu site ou sistema chegar ao mundo.',
              ],
              [
                ShieldCheck,
                '04',
                'A gente continua junto',
                'A mensalidade mantém o projeto com manutenção e suporte conforme sua proposta.',
              ],
            ].map(([Icon, n, t, d]) => (
              <div className="process-card" key={n}>
                <div>
                  <span className="process-icon">
                    <Icon size={23} />
                  </span>
                  <span className="step-number">{n}</span>
                </div>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section service-section">
        <div className="service-art">
          <img
            className="service-photo"
            src={photos.development.path}
            alt={photos.development.alt}
            loading="lazy"
            width={1400}
            height={934}
          />
          <span className="service-sticker">É sobre o seu negócio.</span>
          <div className="service-window">
            <div>
              <span />
              <span />
              <span />
            </div>
            <Code2 size={54} />
            <h3>
              Uma ideia.
              <br />
              Infinitas possibilidades<span>.</span>
            </h3>
            <div className="service-tags">
              <span>Design</span>
              <span>Desenvolvimento</span>
              <span>Cuidado</span>
            </div>
          </div>
          <div className="service-mini">
            <Monitor size={25} />
            <b>Pronto para crescer com você</b>
            <ArrowUpRight />
          </div>
          <span className="service-star">✳</span>
        </div>
        <div>
          <span className="eyebrow">SEU NEGÓCIO NÃO É UM MOLDE</span>
          <h2>
            Por que seu site
            <br />
            deveria <span>ser?</span>
          </h2>
          <p className="body-large">
            O catálogo inspira. A sua necessidade guia. Criamos uma experiência que faz sentido para
            quem você é e para onde quer chegar.
          </p>
          <div className="benefit-list">
            <div>
              <Paintbrush />
              <span>
                <b>A sua identidade em cada detalhe</b>
                <p>Cores, conteúdo e estrutura pensados para sua marca.</p>
              </span>
            </div>
            <div>
              <Code2 />
              <span>
                <b>Funcionalidades com propósito</b>
                <p>O que seu negócio precisa, definido em conjunto.</p>
              </span>
            </div>
            <div>
              <Headphones />
              <span>
                <b>Uma equipe para continuar com você</b>
                <p>Acompanhamento e manutenção após a entrega.</p>
              </span>
            </div>
          </div>
          <Link to="/solicitar" className="text-link">
            Vamos falar sobre sua ideia <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
      <TrustSection />
      <LeadSection />
      <section className="section">
        <div className="offer-banner">
          <div>
            <span className="eyebrow">CRIAÇÃO + CUIDADO CONTÍNUO</span>
            <h2>
              Seu projeto no ar.
              <br />
              Sua cabeça <span>no negócio.</span>
            </h2>
            <p>Conte com a gente para criar e manter sua presença digital.</p>
            <div className="offer-checks">
              <span>
                <Check /> Projeto personalizado
              </span>
              <span>
                <Check /> Manutenção e suporte
              </span>
            </div>
          </div>
          <div className="offer-banner-price">
            <span>Manutenção mensal{demo ? ' · valor ilustrativo' : ''}</span>
            <div>
              <b>{money(offer.price)}</b>
              <span>/mês</span>
            </div>
            <p>Escopo e condições definidos na proposta.</p>
            <Link to="/solicitar" className="button button-primary">
              Quero tirar minha ideia do papel <ArrowUpRight size={18} />
            </Link>
            <Link className="light-link" to="/mensalidade">
              Entenda como funciona
            </Link>
          </div>
        </div>
      </section>
      <FAQ />
      <section className="final-cta">
        <span>O PRÓXIMO GRANDE PROJETO PODE SER O SEU</span>
        <h2>
          Vamos fazer <i>acontecer?</i>
        </h2>
        <Link className="button button-dark" to="/solicitar">
          Conte sua ideia <ArrowUpRight size={19} />
        </Link>
        <span className="cta-star">✳</span>
      </section>
    </>
  );
}
