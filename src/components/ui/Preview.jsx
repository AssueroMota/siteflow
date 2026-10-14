import {
  ArrowUpRight,
  ShoppingBag,
  Scissors,
  Heart,
  BarChart3,
  Calendar,
  LayoutGrid,
  Search,
  Plus,
} from 'lucide-react';
export default function Preview({ system, large = false }) {
  if (system.imageUrl)
    return (
      <div className={`preview preview-image ${large ? 'large' : ''}`}>
        <img src={system.imageUrl} alt={`Referência visual de ${system.name}`} loading="lazy" />
      </div>
    );
  const theme = system.theme || 'landing';
  const icons = {
    barber: Scissors,
    store: ShoppingBag,
    clinic: Heart,
    dashboard: BarChart3,
    agenda: Calendar,
    workspace: LayoutGrid,
  };
  const Icon = icons[theme] || ArrowUpRight;
  const panel = ['dashboard', 'agenda', 'workspace'].includes(theme);
  return (
    <div
      className={`preview ${theme} ${large ? 'large' : ''}`}
      aria-label={`Prévia ilustrativa de ${system.name}`}
    >
      <div className="mock-browser">
        <i />
        <i />
        <i />
        <span>{system.name.toLowerCase().replaceAll(' ', '')}.site</span>
      </div>
      {panel ? (
        <div className="mock-app">
          <aside>
            <Icon size={18} />
            <span />
            <span />
            <span />
            <span />
          </aside>
          <div className="mock-app-body">
            <div className="mock-app-top">
              <b>
                {theme === 'agenda'
                  ? 'Sua semana, organizada.'
                  : theme === 'workspace'
                    ? 'Vamos fazer acontecer.'
                    : 'Visão geral'}
              </b>
              <Search size={12} />
            </div>
            <div className="mock-stats">
              {['Receita', 'Projetos', 'Atividades'].map((t, i) => (
                <div key={t}>
                  <small>{t}</small>
                  <b>{['R$ 24.850', '128', '86%'][i]}</b>
                  <em>↗ {12 + i}%</em>
                </div>
              ))}
            </div>
            <div className="mock-chart">
              <div>
                <b>{theme === 'agenda' ? 'Agendamentos' : 'Desempenho'}</b>
                <small>Esta semana</small>
              </div>
              <div className="bars">
                {[34, 55, 44, 75, 60, 90, 72, 96, 66, 80].map((h, i) => (
                  <i key={i} style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
            <div className="mock-table">
              <span>Atividades recentes</span>
              <i />
              <i />
            </div>
          </div>
        </div>
      ) : (
        <div className="mock-site">
          <div className="mock-nav">
            <b>
              <Icon size={12} /> {system.name}
            </b>
            <span>Sobre　 Serviços　 Contato</span>
          </div>
          <div className="mock-site-content">
            <div>
              <small>
                {theme === 'restaurant'
                  ? 'FEITO COM AFETO'
                  : theme === 'barber'
                    ? 'ESTILO É IDENTIDADE'
                    : theme === 'store'
                      ? 'NOVA COLEÇÃO'
                      : 'PENSADO PARA VOCÊ'}
              </small>
              <h3>
                {{
                  barber: (
                    <>
                      Seu estilo.
                      <br />
                      Sua marca.
                    </>
                  ),
                  restaurant: (
                    <>
                      Sabor que
                      <br />
                      fica na memória.
                    </>
                  ),
                  store: (
                    <>
                      O essencial.
                      <br />
                      Com personalidade.
                    </>
                  ),
                  clinic: (
                    <>
                      Cuidar de você.
                      <br />É a nossa essência.
                    </>
                  ),
                  agency: (
                    <>
                      Ideias que
                      <br />
                      tomam forma.
                    </>
                  ),
                }[theme] || (
                  <>
                    O próximo passo
                    <br />
                    começa aqui.
                  </>
                )}
              </h3>
              <p>Uma experiência feita para o seu dia a dia.</p>
              <span className="mock-button">
                {theme === 'store'
                  ? 'Explorar coleção'
                  : theme === 'restaurant'
                    ? 'Ver cardápio'
                    : 'Conheça mais'}{' '}
                <ArrowUpRight size={10} />
              </span>
            </div>
            <div className="mock-art">
              <div className="art-circle" />
              <Icon className="art-icon" strokeWidth={1} size={95} />
              {theme === 'restaurant' && (
                <>
                  <i className="leaf l1" />
                  <i className="leaf l2" />
                  <i className="leaf l3" />
                </>
              )}
              <span className="art-tag">
                {theme === 'barber'
                  ? 'Feito para você'
                  : theme === 'store'
                    ? 'everyday essentials'
                    : 'Design + experiência'}
              </span>
            </div>
          </div>
          <div className="mock-site-bottom">
            <span>Design responsivo</span>
            <span>Feito para conectar</span>
            <span>Seu negócio, online</span>
          </div>
        </div>
      )}
    </div>
  );
}
