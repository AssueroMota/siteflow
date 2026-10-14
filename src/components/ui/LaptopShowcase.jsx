import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import Preview from './Preview';

export default function LaptopShowcase({
  systems,
  compact = false,
  label = 'Apresentação dos sistemas',
}) {
  const items = systems.filter((s) => s.published);
  const [selected, setSelected] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const startX = useRef(null);
  const index = Math.max(
    0,
    items.findIndex((s) => s.id === selected),
  );
  const system = items[index];
  const ids = items.map((s) => s.id).join('|');
  const running = playing && !hovered && !focused && !hidden && items.length > 1;

  useEffect(() => {
    const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    setPlaying(!preference?.matches);
    const reduce = (event) => {
      if (event.matches) setPlaying(false);
    };
    const visibility = () => setHidden(document.hidden);
    preference?.addEventListener?.('change', reduce);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      preference?.removeEventListener?.('change', reduce);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);

  useEffect(() => {
    if (!running) return;
    const list = ids.split('|');
    const timer = setInterval(
      () =>
        setSelected((previous) => {
          const current = Math.max(0, list.indexOf(previous));
          return list[(current + 1) % list.length];
        }),
      7000,
    );
    return () => clearInterval(timer);
  }, [running, ids]);

  if (!system) return null;
  const move = (direction) => {
    setPlaying(false);
    setSelected(items[(index + direction + items.length) % items.length].id);
  };
  return (
    <section
      className={`laptop-showcase ${compact ? 'compact' : ''}`}
      role="region"
      aria-label={label}
      aria-roledescription="carrossel"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          move(1);
        }
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          move(-1);
        }
      }}
    >
      <div
        className="laptop-stage"
        onPointerDown={(event) => {
          startX.current = event.clientX;
        }}
        onPointerUp={(event) => {
          if (startX.current !== null && Math.abs(event.clientX - startX.current) > 60)
            move(event.clientX < startX.current ? 1 : -1);
          startX.current = null;
        }}
        onPointerCancel={() => {
          startX.current = null;
        }}
      >
        <div className="laptop-glow" aria-hidden="true" />
        <div className="laptop-lid">
          <div className="laptop-camera" aria-hidden="true" />
          <div className="laptop-display" aria-live={running ? 'off' : 'polite'} aria-atomic="true">
            <div className="laptop-slide" key={system.id}>
              <Preview system={system} large />
            </div>
          </div>
          <div className="laptop-chin" aria-hidden="true">
            SITEFLOW
          </div>
        </div>
        <div className="laptop-base" aria-hidden="true">
          <span />
        </div>
        <div className="laptop-foot" aria-hidden="true" />
      </div>
      <div className="showcase-controls">
        <button
          className="carousel-arrow"
          aria-label="Sistema anterior"
          onClick={() => move(-1)}
          disabled={items.length < 2}
        >
          <ChevronLeft size={20} />
        </button>
        <div className="carousel-dots" aria-label="Escolher sistema">
          {items.map((item, i) => (
            <button
              key={item.id}
              className={i === index ? 'active' : ''}
              aria-label={`Mostrar ${item.name}`}
              aria-current={i === index ? 'true' : undefined}
              onClick={() => {
                setPlaying(false);
                setSelected(item.id);
              }}
            >
              <span />
            </button>
          ))}
        </div>
        <button
          className="carousel-arrow"
          aria-label="Próximo sistema"
          onClick={() => move(1)}
          disabled={items.length < 2}
        >
          <ChevronRight size={20} />
        </button>
        {items.length > 1 && (
          <button
            className="carousel-play"
            onClick={() => setPlaying(!playing)}
            aria-label={
              playing ? 'Pausar apresentação automática' : 'Iniciar apresentação automática'
            }
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
        )}
      </div>
      <div className="showcase-info">
        <div>
          <span className="showcase-index">
            {String(index + 1).padStart(2, '0')}{' '}
            <span>/ {String(items.length).padStart(2, '0')}</span>
          </span>
          <span className="showcase-category">{system.category}</span>
          <h3>{system.name}</h3>
          <p>{system.description}</p>
        </div>
        <div className="showcase-detail">
          <div className="showcase-features">
            {system.features.slice(0, 3).map((feature) => (
              <span key={feature}>
                <Check size={15} />
                {feature}
              </span>
            ))}
          </div>
          <Link className="button button-primary" to={`/solicitar?modelo=${system.id}`}>
            Quero um projeto assim <ArrowUpRight size={17} />
          </Link>
          <Link className="showcase-details-link" to={`/catalogo/${system.id}`}>
            Conhecer este modelo <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
      {!compact && (
        <p className="showcase-disclaimer">
          Referências personalizáveis do catálogo. Demonstrações reais podem ser acessadas na página
          de cada sistema quando cadastradas.
        </p>
      )}
    </section>
  );
}
