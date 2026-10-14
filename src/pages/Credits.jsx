import { ExternalLink } from 'lucide-react';
import { photos } from '../data/photography';
export default function Credits() {
  return (
    <div className="section page-section">
      <div className="page-intro">
        <span className="eyebrow">FOTOGRAFIA DE VERDADE</span>
        <h1>
          As imagens por trás
          <br />
          <span>das ideias.</span>
        </h1>
        <p>
          Fotografias reais do Unsplash. As imagens ilustram possibilidades de projetos; as pessoas
          e os estabelecimentos fotografados não são apresentados como clientes da SiteFlow.
        </p>
        <a
          href="https://unsplash.com/license"
          className="text-link"
          target="_blank"
          rel="noreferrer"
        >
          Licença Unsplash <ExternalLink size={16} />
        </a>
      </div>
      <div className="credits-grid">
        {Object.entries(photos).map(([key, photo]) => (
          <figure key={key}>
            <img src={photo.path} alt={photo.alt} loading="lazy" />
            <figcaption>
              <b>{photo.author}</b>
              <a href={photo.source} target="_blank" rel="noreferrer">
                Ver fotografia original <ExternalLink size={15} />
              </a>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
