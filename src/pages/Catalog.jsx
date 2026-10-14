import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Search, ArrowUpRight, Sparkles } from 'lucide-react';
import { usePlatform } from '../contexts/PlatformContext';
import SystemCard from '../components/ui/SystemCard';
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
            <span className="eyebrow">UM OLHAR MAIS DE PERTO</span>
            <h1>
              Veja as possibilidades <span>em ação.</span>
            </h1>
            <p>Navegue pelos modelos e encontre o ponto de partida para o seu projeto.</p>
          </div>
          <LaptopShowcase systems={filtered} label="Vitrine de sistemas do catálogo" />
        </div>
      )}
      <div className="catalog-count">
        <span>
          {filtered.length}{' '}
          {filtered.length === 1 ? 'referência encontrada' : 'referências encontradas'}
        </span>
        <span>Todos os modelos são personalizáveis</span>
      </div>
      {filtered.length ? (
        <div className="card-grid catalog-grid">
          {filtered.map((s) => (
            <SystemCard key={s.id} system={s} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Search size={35} />
          <h2>A sua ideia pode ser a próxima.</h2>
          <p>Nenhuma referência corresponde à busca. Experimente outra categoria.</p>
          <button className="button button-outline" onClick={() => setParams({})}>
            Limpar filtros
          </button>
        </div>
      )}
      <div className="info-box">
        Referências ilustrativas. Funcionalidades finais, integrações e prazo serão definidos na
        proposta do seu projeto.
      </div>
      <div className="catalog-conversation">
        <Sparkles size={26} />
        <div>
          <h3>O que você precisa ainda não está aqui?</h3>
          <p>Conte sua ideia. Também criamos sites e sistemas do zero.</p>
        </div>
        <Link to="/solicitar" className="button button-outline">
          Vamos conversar <ArrowUpRight size={17} />
        </Link>
      </div>
    </div>
  );
}
