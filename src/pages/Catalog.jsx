import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { usePlatform } from '../contexts/PlatformContext';
import LaptopShowcase from '../components/ui/LaptopShowcase';
export default function Catalog() {
  const { systems } = usePlatform();
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '',
    category = params.get('categoria') || 'Todos',
    sort = params.get('ordem') || 'destaques';
  const filtered = systems
    .filter(
      (s) =>
        s.published &&
        (category === 'Todos' || s.category === category) &&
        `${s.name} ${s.description} ${s.category} ${s.features.join(' ')}`
          .toLocaleLowerCase('pt-BR')
          .includes(query.toLocaleLowerCase('pt-BR')),
    )
    .sort((a, b) =>
      sort === 'nome'
        ? a.name.localeCompare(b.name, 'pt-BR')
        : sort === 'recentes'
          ? String(b.createdAt).localeCompare(String(a.createdAt))
          : Number(b.featured) - Number(a.featured),
    );
  return (
    <div className="section page-section catalog-page">
      {filtered.length > 0 && (
        <div className="catalog-laptop-section">
          <div className="catalog-presentation-title">
            <h1>
              Landing pages para <span>o seu negócio.</span>
            </h1>
            <p>Explore os modelos ou abra uma página para conhecer todos os detalhes.</p>
          </div>
          <LaptopShowcase systems={filtered} label="Vitrine de sistemas do catálogo" />
        </div>
      )}
      {!filtered.length && (
        <div className="empty-state">
          <Search size={35} />
          <h2>A sua ideia pode ser a próxima.</h2>
          <p>Nenhuma referência corresponde à busca. Experimente outra categoria.</p>
          <button className="button button-outline" onClick={() => setParams({})}>
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  );
}
