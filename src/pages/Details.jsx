import { Link, useParams } from 'react-router-dom';
import {
  Check,
  ArrowUpRight,
  Monitor,
  Smartphone,
  Tablet,
  ArrowLeft,
  Code2,
  Paintbrush,
} from 'lucide-react';
import { usePlatform } from '../contexts/PlatformContext';
import Preview from '../components/ui/Preview';
import NotFound from './NotFound';
import { themePhotos } from '../data/photography';
export default function Details() {
  const { id } = useParams();
  const { systems } = usePlatform();
  const s = systems.find((s) => s.id === id && s.published);
  if (!s) return <NotFound />;
  return (
    <div className="section page-section">
      <Link className="back-link" to="/catalogo">
        <ArrowLeft size={16} /> Voltar ao catálogo
      </Link>
      <div className="detail-heading">
        <div>
          <span className="eyebrow">{s.category.toUpperCase()} · REFERÊNCIA PERSONALIZÁVEL</span>
          <h1>
            {s.name}
            <span>.</span>
          </h1>
          <p>{s.description}</p>
        </div>
        <Link to={`/solicitar?modelo=${s.id}`} className="button button-primary">
          Quero um projeto assim <ArrowUpRight size={18} />
        </Link>
      </div>
      <div className="detail-preview">
        <Preview system={s} large />
      </div>
      {!s.imageUrl && themePhotos[s.theme] && (
        <div className="photo-attribution">
          Fotografia real usada como referência de design.{' '}
          <a href={themePhotos[s.theme].source} target="_blank" rel="noreferrer">
            Ver foto original no Unsplash
          </a>{' '}
          · <Link to="/creditos">Créditos e fontes</Link>
        </div>
      )}
      <div className="detail-grid">
        <div>
          <h2>
            Uma inspiração.
            <br />
            <span>Com a sua identidade.</span>
          </h2>
          <p>
            Use o {s.name} como ponto de partida. Nossa equipe adapta o design, os conteúdos e as
            funcionalidades às necessidades do seu negócio, com escopo definido junto com você.
          </p>
          <h3>O que podemos construir</h3>
          <div className="feature-grid">
            {s.features.map((f) => (
              <span key={f}>
                <Check size={18} />
                {f}
              </span>
            ))}
          </div>
          <h3>Pensado para todas as telas</h3>
          <div className="device-list">
            <span>
              <Monitor /> Desktop
            </span>
            <span>
              <Tablet /> Tablet
            </span>
            <span>
              <Smartphone /> Celular
            </span>
          </div>
          <h3>Tecnologias da referência</h3>
          <div className="tech-tags">
            {s.technologies.map((t) => (
              <span key={t}>
                <Code2 size={14} />
                {t}
              </span>
            ))}
          </div>
          <p className="muted">
            Integrações e tecnologias do projeto final dependem da proposta aprovada.
          </p>
        </div>
        <aside className="detail-aside">
          <Paintbrush size={30} />
          <h3>Gostou desse caminho?</h3>
          <p>
            Conte o que gostaria de mudar, adicionar ou personalizar. Vamos desenhar seu projeto
            juntos.
          </p>
          <Link to={`/solicitar?modelo=${s.id}`} className="button button-primary">
            Usar como inspiração <ArrowUpRight size={16} />
          </Link>
          <Link to={`/demo/${s.id}`} className="button button-outline">
            <Monitor size={17} /> Ver demonstração
          </Link>
          <small>Você contrata um projeto com manutenção mensal. Não há compra de templates.</small>
        </aside>
      </div>
    </div>
  );
}
