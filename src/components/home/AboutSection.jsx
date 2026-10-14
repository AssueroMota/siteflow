import { Link } from 'react-router-dom';
import { ArrowUpRight, Code2, HeartHandshake, MessageSquare, Sparkles } from 'lucide-react';
import { photos } from '../../data/photography';
export default function AboutSection() {
  return (
    <section className="section about-section" id="quem-somos">
      <div className="about-visual">
        <img
          src={photos.coding.path}
          alt={photos.coding.alt}
          loading="lazy"
          width={1400}
          height={934}
        />
        <div className="about-photo-caption">
          <Code2 size={27} />
          <span>
            Ideias de pessoas.
            <br />
            <b>Soluções para negócios.</b>
          </span>
        </div>
        <span className="about-stamp">
          <Sparkles size={20} /> Perto da sua ideia.
          <br />
          Junto do seu negócio.
        </span>
      </div>
      <div className="about-copy">
        <span className="eyebrow">QUEM SOMOS</span>
        <h2>
          A tecnologia é o meio.
          <br />
          <span>O seu negócio é o motivo.</span>
        </h2>
        <p>
          A SiteFlow conecta a ideia que você tem à presença digital que o seu negócio precisa.
          Criamos sites e sistemas personalizados, com uma conversa próxima e uma proposta clara
          desde o começo.
        </p>
        <p>
          Você participa das decisões, acompanha o desenvolvimento e conta com manutenção mensal
          após a entrega, conforme o que combinarmos na proposta.
        </p>
        <div className="about-values">
          <div>
            <MessageSquare size={22} />
            <span>
              <b>A gente escuta primeiro</b>
              <small>Seu contexto guia cada escolha do projeto.</small>
            </span>
          </div>
          <div>
            <HeartHandshake size={22} />
            <span>
              <b>Clareza para construir confiança</b>
              <small>Escopo, prazo e condições alinhados com você.</small>
            </span>
          </div>
        </div>
        <Link to="/solicitar" className="text-link">
          Vamos conhecer o seu negócio <ArrowUpRight size={18} />
        </Link>
      </div>
    </section>
  );
}
