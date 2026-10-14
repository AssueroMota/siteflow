import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Monitor, Tablet, Smartphone, ArrowLeft, ExternalLink } from 'lucide-react';
import { usePlatform } from '../contexts/PlatformContext';
import { safeUrl } from '../services/api';
import NotFound from './NotFound';
export default function Demo() {
  const { id } = useParams();
  const { systems } = usePlatform();
  const [device, setDevice] = useState('desktop');
  const s = systems.find((x) => x.id === id && x.published);
  if (!s) return <NotFound />;
  const url = safeUrl(s.demoUrl);
  return (
    <div className="demo-page">
      <div className="demo-toolbar">
        <Link to={`/catalogo/${id}`} className="back-link">
          <ArrowLeft size={17} />
          {s.name}
        </Link>
        <div className="device-toggle">
          {[
            [Monitor, 'desktop'],
            [Tablet, 'tablet'],
            [Smartphone, 'mobile'],
          ].map(([Icon, d]) => (
            <button
              className={device === d ? 'active' : ''}
              key={d}
              aria-label={`Visualização ${d}`}
              onClick={() => setDevice(d)}
            >
              <Icon size={20} />
            </button>
          ))}
        </div>
        <Link className="button button-primary small" to={`/solicitar?modelo=${id}`}>
          Quero um projeto assim
        </Link>
      </div>
      <p className="demo-notice">
        {url
          ? 'Demonstração externa cadastrada pela equipe.'
          : 'Landing page demonstrativa. O envio de formulários é simulado.'}
      </p>
      <div className={`demo-viewport ${device}`}>
        <iframe
          title={`Demonstração ${s.name}`}
          src={url || `/modelos/${s.id}?embed=1`}
          sandbox="allow-scripts allow-forms allow-same-origin"
          referrerPolicy="no-referrer"
        />
      </div>
      <a
        href={url || `/modelos/${s.id}`}
        className="text-link demo-external"
        target="_blank"
        rel="noreferrer"
      >
        Abrir landing page em outra aba <ExternalLink size={16} />
      </a>
    </div>
  );
}
