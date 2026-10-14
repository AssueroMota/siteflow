import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { usePlatform } from '../contexts/PlatformContext';
import LandingPage from '../components/landing/LandingPage';
import NotFound from './NotFound';
export default function LandingDemo() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { systems, loading, error } = usePlatform();
  const system = systems.find((item) => item.id === id && item.published);
  if (loading) return <div className="empty-state">Carregando landing page…</div>;
  if (error)
    return (
      <div className="empty-state">
        <h1>Não foi possível abrir a landing page.</h1>
        <p>{error}</p>
      </div>
    );
  if (!system) return <NotFound />;
  return (
    <>
      {params.get('embed') !== '1' && (
        <div className="landing-demo-banner">
          <Link to="/catalogo">
            <ArrowLeft size={16} /> Voltar aos modelos
          </Link>
          <span>Landing page demonstrativa</span>
          <Link to={`/solicitar?modelo=${system.id}`}>
            Quero uma página assim <ArrowUpRight size={16} />
          </Link>
        </div>
      )}
      <LandingPage key={system.id} system={system} interactive />
    </>
  );
}
