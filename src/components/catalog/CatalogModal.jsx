import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ExternalLink, Layers, Search, X } from 'lucide-react';
import Preview from '../ui/Preview';
import { safeUrl } from '../../services/api';

export default function CatalogModal({ systems, categories, onClose }) {
  const dialog = useRef(null),
    search = useRef(null);
  const [query, setQuery] = useState(''),
    [category, setCategory] = useState('Todos');
  const published = useMemo(() => systems.filter((item) => item.published), [systems]);
  const filtered = published.filter(
    (item) =>
      (category === 'Todos' || item.category === category) &&
      `${item.name} ${item.category} ${item.description} ${item.features.join(' ')}`
        .toLocaleLowerCase('pt-BR')
        .includes(query.trim().toLocaleLowerCase('pt-BR')),
  );
  useEffect(() => {
    const previous = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const root = document.getElementById('root'),
      previousInert = root?.inert;
    document.body.style.overflow = 'hidden';
    if (root) root.inert = true;
    search.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (root) root.inert = previousInert;
      if (previous?.isConnected) previous.focus?.();
    };
  }, []);
  function keyboard(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;
    const controls = Array.from(
      dialog.current.querySelectorAll(
        'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]',
      ),
    );
    const first = controls[0],
      last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    }
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }
  return createPortal(
    <div
      className="catalog-modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialog}
        className="catalog-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="catalog-modal-title"
        aria-describedby="catalog-modal-description"
        onKeyDown={keyboard}
      >
        <header className="catalog-modal-header">
          <div>
            <span className="catalog-modal-eyebrow">
              <Layers size={16} /> EXPLORE AS POSSIBILIDADES
            </span>
            <h2 id="catalog-modal-title">
              Catálogo completo<span>.</span>
            </h2>
            <p id="catalog-modal-description">
              Modelos demonstrativos personalizáveis. Abra uma landing page ou escolha a referência
              para seu projeto.
            </p>
          </div>
          <button className="catalog-modal-close" aria-label="Fechar catálogo" onClick={onClose}>
            <X size={23} />
          </button>
        </header>
        <div className="catalog-modal-toolbar">
          <label className="catalog-modal-search">
            <Search size={19} />
            <input
              ref={search}
              type="search"
              aria-label="Buscar no catálogo"
              placeholder="Buscar modelo ou segmento…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <select
            aria-label="Categoria do catálogo"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item === 'Todos' ? 'Todos os segmentos' : item}
              </option>
            ))}
          </select>
          <span role="status">
            {filtered.length} {filtered.length === 1 ? 'modelo' : 'modelos'}
          </span>
        </div>
        <div className="catalog-modal-body">
          {filtered.length ? (
            <div className="catalog-modal-grid">
              {filtered.map((item, index) => (
                <article
                  className="catalog-project-card"
                  key={item.id}
                  style={{ '--tile-delay': `${Math.min(index, 5) * 45}ms` }}
                >
                  <a
                    className="catalog-project-image"
                    href={safeUrl(item.demoUrl) || `/modelos/${item.id}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Abrir landing page ${item.name}`}
                  >
                    <Preview system={item} decorative />
                    <span>
                      Explorar página <ExternalLink size={16} />
                    </span>
                  </a>
                  <div className="catalog-project-info">
                    <span>{item.category}</span>
                    <h3>{item.name}</h3>
                    <div>
                      <a
                        href={safeUrl(item.demoUrl) || `/modelos/${item.id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ver landing page <ExternalLink size={14} />
                      </a>
                      <Link to={`/solicitar?modelo=${item.id}`} onClick={onClose}>
                        Usar este modelo <ArrowUpRight size={15} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="catalog-modal-empty">
              <Search size={35} />
              <h3>Nenhum modelo encontrado.</h3>
              <p>Tente outro nome ou segmento.</p>
              <button
                className="button button-outline"
                onClick={() => {
                  setQuery('');
                  setCategory('Todos');
                }}
              >
                Limpar busca
              </button>
            </div>
          )}
        </div>
        <footer className="catalog-modal-footer">
          <span>Quer criar algo diferente?</span>
          <Link to="/solicitar" onClick={onClose}>
            Conte sua ideia <ArrowUpRight size={16} />
          </Link>
        </footer>
      </section>
    </div>,
    document.body,
  );
}
