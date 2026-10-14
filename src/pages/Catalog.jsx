import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { usePlatform } from '../contexts/PlatformContext';
import SystemCard from '../components/ui/SystemCard';
export default function Catalog() {
  const { systems, categories } = usePlatform();
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '',
    category = params.get('categoria') || 'Todos',
    sort = params.get('ordem') || 'destaques';
  const change = (key, val) =>
    setParams((p) => {
      const next = new URLSearchParams(p);
      val ? next.set(key, val) : next.delete(key);
      return next;
    });
  const filtered = systems
    .filter(
      (s) =>
        s.published &&
        (category === 'Todos' || s.category === category) &&
        `${s.name} ${s.description} ${s.category}`
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
    <div className="section page-section">
      <div className="page-intro">
        <span className="eyebrow">SEU PONTO DE PARTIDA</span>
        <h1>
          Encontre inspiração.
          <br />
          <span>Crie algo seu.</span>
        </h1>
        <p>
          Sites e sistemas para diferentes negócios. Escolha uma referência e vamos adaptar à sua
          ideia.
        </p>
      </div>
      <div className="catalog-toolbar">
        <label className="search-input">
          <Search size={20} />
          <input
            aria-label="Buscar modelos"
            placeholder="O que você quer criar?"
            value={query}
            onChange={(e) => change('q', e.target.value)}
          />
          {query && (
            <button onClick={() => change('q', '')} aria-label="Limpar busca">
              <X size={16} />
            </button>
          )}
        </label>
        <label className="sort-label">
          <SlidersHorizontal size={18} />
          <select
            aria-label="Ordenar catálogo"
            value={sort}
            onChange={(e) => change('ordem', e.target.value)}
          >
            <option value="destaques">Em destaque</option>
            <option value="nome">Nome: A a Z</option>
            <option value="recentes">Mais recentes</option>
          </select>
        </label>
      </div>
      <div className="category-pills wrap">
        {categories.map((c) => (
          <button
            className={c === category ? 'active' : ''}
            key={c}
            onClick={() => change('categoria', c === 'Todos' ? '' : c)}
          >
            {c}
          </button>
        ))}
      </div>
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
    </div>
  );
}
