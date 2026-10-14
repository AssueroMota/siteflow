import {
  Search,
  SlidersHorizontal,
  X,
  LayoutGrid,
  Scissors,
  Utensils,
  ShoppingBag,
  Rocket,
  HeartPulse,
  CalendarDays,
  ChartNoAxesCombined,
  Building2,
  Boxes,
} from 'lucide-react';
const icons = {
  Todos: LayoutGrid,
  Barbearias: Scissors,
  Restaurantes: Utensils,
  'Lojas Virtuais': ShoppingBag,
  'Landing Pages': Rocket,
  Clínicas: HeartPulse,
  Agendamentos: CalendarDays,
  Dashboards: ChartNoAxesCombined,
  'Sites Institucionais': Building2,
  'Outros Sistemas': Boxes,
};
export default function CatalogFilters({
  query,
  category,
  sort,
  categories,
  systems,
  onChange,
  onReset,
}) {
  const published = systems.filter((s) => s.published);
  return (
    <section className="catalog-filter-panel" aria-label="Filtros do catálogo">
      <div className="filter-panel-heading">
        <span>
          <SlidersHorizontal size={18} /> Encontre o seu próximo projeto
        </span>
        <small>{published.length} possibilidades para explorar</small>
      </div>
      <div className="catalog-toolbar">
        <div className="catalog-search-field">
          <label htmlFor="catalog-search">O que seu negócio precisa?</label>
          <div className="search-input">
            <Search size={21} />
            <input
              id="catalog-search"
              aria-label="Buscar modelos"
              placeholder="Busque por nome, área ou funcionalidade…"
              value={query}
              onChange={(event) => onChange('q', event.target.value)}
            />
            {query && (
              <button type="button" onClick={() => onChange('q', '')} aria-label="Limpar busca">
                <X size={18} />
              </button>
            )}
          </div>
        </div>
        <div className="catalog-sort-field">
          <label htmlFor="catalog-sort">Ordenar por</label>
          <div className="catalog-sort-control">
            <SlidersHorizontal size={19} />
            <select
              id="catalog-sort"
              aria-label="Ordenar catálogo"
              value={sort}
              onChange={(event) => onChange('ordem', event.target.value)}
            >
              <option value="destaques">Em destaque</option>
              <option value="nome">Nome: A a Z</option>
              <option value="recentes">Mais recentes</option>
            </select>
          </div>
        </div>
      </div>
      <div className="catalog-category-label">Explore por segmento</div>
      <div className="category-pills wrap catalog-categories" aria-label="Categorias">
        {categories.map((c) => {
          const Icon = icons[c] || Boxes;
          const count =
            c === 'Todos' ? published.length : published.filter((s) => s.category === c).length;
          return (
            <button
              key={c}
              type="button"
              aria-label={c}
              aria-pressed={c === category}
              className={c === category ? 'active' : ''}
              onClick={() => onChange('categoria', c === 'Todos' ? '' : c)}
            >
              <Icon size={17} />
              <span>{c}</span>
              <span className="category-count" aria-hidden="true">
                {count}
              </span>
            </button>
          );
        })}
      </div>
      {(query || category !== 'Todos' || sort !== 'destaques') && (
        <div className="catalog-active-filter">
          <span>
            {category === 'Todos' ? 'Todas as categorias' : category}
            {query && ` · Busca: “${query}”`}
          </span>
          <button type="button" onClick={onReset}>
            <X size={14} /> Restaurar catálogo
          </button>
        </div>
      )}
    </section>
  );
}
