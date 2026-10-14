import { Link } from 'react-router-dom';
import { ArrowUpRight, Monitor, Check } from 'lucide-react';
import Preview from './Preview';
export default function SystemCard({ system }) {
  return (
    <article className="system-card">
      <Link className="card-preview-link" to={`/catalogo/${system.id}`}>
        <Preview system={system} />
        {system.featured && <span className="featured-badge">✦ Em destaque</span>}
      </Link>
      <div className="card-content">
        <div className="card-category">
          {system.category}
          <span>Personalizável</span>
        </div>
        <Link className="card-title" to={`/catalogo/${system.id}`}>
          {system.name}
          <ArrowUpRight size={20} />
        </Link>
        <p>{system.description}</p>
        <div className="card-features">
          {system.features.slice(0, 2).map((f) => (
            <span key={f}>
              <Check size={12} />
              {f}
            </span>
          ))}
        </div>
        <div className="card-bottom">
          <Link to={`/catalogo/${system.id}`}>
            Ver detalhes <ArrowUpRight size={14} />
          </Link>
          <Link to={`/demo/${system.id}`}>
            <Monitor size={14} /> Demonstração
          </Link>
        </div>
      </div>
    </article>
  );
}
