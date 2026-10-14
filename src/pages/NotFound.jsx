import { Link } from 'react-router-dom';
export default function NotFound() {
  return (
    <div className="section empty-state">
      <span className="eyebrow">404 · UM CAMINHO DIFERENTE</span>
      <h1>Essa página saiu do mapa.</h1>
      <p>Mas a sua próxima ideia ainda está por aqui.</p>
      <Link className="button button-primary" to="/catalogo">
        Explorar catálogo
      </Link>
    </div>
  );
}
