import { ArrowUpRight, Zap } from 'lucide-react';
import { themePhotos, photos } from '../../data/photography';
const headlines = {
  barber: ['Presença.', 'Estilo. Atitude.'],
  restaurant: ['Uma experiência', 'que dá água na boca.'],
  store: ['Sua próxima', 'melhor escolha.'],
  clinic: ['Cuidado que', 'conecta pessoas.'],
  dashboard: ['Mais clareza.', 'Melhores decisões.'],
  landing: ['Sua próxima ideia.', 'Em outra dimensão.'],
  agenda: ['Seu tempo.', 'Bem cuidado.'],
  agency: ['Marcas fortes.', 'Presença de verdade.'],
  workspace: ['Grandes ideias', 'acontecem juntas.'],
};
export default function Preview({ system, large = false }) {
  const theme = system.theme || 'landing';
  const photo = themePhotos[theme] || photos.development;
  if (system.imageUrl)
    return (
      <div className={`preview preview-image ${large ? 'large' : ''}`}>
        <img
          src={system.imageUrl}
          alt={`Referência visual de ${system.name}`}
          loading="lazy"
          decoding="async"
        />
      </div>
    );
  const headline = headlines[theme] || headlines.landing;
  return (
    <div
      className={`preview photo-preview photo-${theme} ${large ? 'large' : ''}`}
      aria-label={`Conceito visual de ${system.name} com fotografia real`}
    >
      <div className="photo-browser">
        <span className="browser-dots">
          <i />
          <i />
          <i />
        </span>
        <span>CONCEITO DE SITE · {system.category.toUpperCase()}</span>
        <ArrowUpRight size={12} />
      </div>
      <div className="photo-scene">
        <img
          className="scene-photo"
          src={photo.path}
          alt={photo.alt}
          loading="lazy"
          decoding="async"
          width={1400}
          height={934}
        />
        <div className="photo-shade" />
        <div className="photo-site-header">
          <b>
            <Zap size={13} />
            {system.name}
          </b>
          <span>
            Feito para conectar <ArrowUpRight size={11} />
          </span>
        </div>
        <div className="photo-site-copy">
          <span className="photo-kicker">{system.category.toUpperCase()}</span>
          <h3>
            {headline[0]}
            <br />
            <em>{headline[1]}</em>
          </h3>
          <span className="photo-site-cta">
            Conheça a experiência <ArrowUpRight size={13} />
          </span>
        </div>
        <div className="photo-site-footer">
          <span>DESIGN QUE FAZ A DIFERENÇA</span>
          <span>01 — SITEFLOW</span>
        </div>
      </div>
    </div>
  );
}
