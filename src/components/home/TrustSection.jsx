import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, HeartHandshake, MessageCircle, Quote } from 'lucide-react';
import { usePlatform } from '../../contexts/PlatformContext';
export default function TrustSection() {
  const { testimonials } = usePlatform();
  const published = testimonials.filter((item) => item.published && item.authorized);
  return (
    <section className="trust-section" id="clientes">
      <div className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">CLIENTES SATISFEITOS · HISTÓRIAS REAIS</span>
            <h2>
              Confiança se constrói.
              <br />
              <span>Projeto por projeto.</span>
            </h2>
            <p>
              Mais do que colocar um site no ar, queremos construir uma parceria que faça sentido
              para você.
            </p>
          </div>
          <HeartHandshake className="trust-heading-icon" size={52} strokeWidth={1.2} />
        </div>
        {published.length ? (
          <div className="testimonial-grid">
            {published.map((item) => (
              <figure className="testimonial-card" key={item.id}>
                <Quote size={30} />
                <blockquote>{item.quote}</blockquote>
                <figcaption>
                  <span className="client-initials" aria-hidden="true">
                    {item.name
                      .split(' ')
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join('')}
                  </span>
                  <span>
                    <b>{item.name}</b>
                    <small>{item.business}</small>
                  </span>
                  <CheckCircle2 size={18} />
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="trust-invitation">
            <span className="trust-quote" aria-hidden="true">
              “
            </span>
            <div>
              <span className="trust-status">HISTÓRIAS EM CONSTRUÇÃO</span>
              <h3>
                A próxima boa história
                <br />
                pode começar com a sua ideia.
              </h3>
              <p>
                Este espaço é reservado para experiências reais, compartilhadas com autorização de
                quem viveu cada projeto. Enquanto isso, nosso compromisso começa na primeira
                conversa.
              </p>
              <Link to="/solicitar" className="text-link">
                Quero conversar sobre meu projeto <ArrowUpRight size={17} />
              </Link>
            </div>
            <div className="trust-promises">
              <span>
                <MessageCircle /> Atendimento próximo
              </span>
              <span>
                <CheckCircle2 /> Proposta clara
              </span>
              <span>
                <HeartHandshake /> Acompanhamento em cada etapa
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
