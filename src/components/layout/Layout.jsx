import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowUpRight, Zap, Menu, X, CheckCircle2 } from 'lucide-react';
import { usePlatform } from '../../contexts/PlatformContext';
export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="SiteFlow início">
      <span>
        <Zap size={23} fill="currentColor" />
      </span>
      siteflow<span className="logo-dot">.</span>
    </Link>
  );
}
export default function Layout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { demo, user, toast, error, loading } = usePlatform();
  useEffect(() => {
    setOpen(false);
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);
  return (
    <>
      <div className="announcement">
        Sua ideia. Nosso próximo projeto.{' '}
        <Link to="/solicitar">
          Vamos criar juntos <ArrowUpRight size={13} />
        </Link>
      </div>
      <header className="header">
        <div className="header-inner">
          <Logo />
          <button
            className="mobile-menu icon-button"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
          >
            {open ? <X /> : <Menu />}
          </button>
          <nav className={open ? 'nav open' : 'nav'} aria-label="Menu principal">
            <NavLink end to="/">
              Início
            </NavLink>
            <NavLink to="/catalogo">Explore o catálogo</NavLink>
            <Link to="/#como-funciona">Como funciona</Link>
            <NavLink to="/mensalidade">Mensalidade</NavLink>
          </nav>
          <div className="header-actions">
            <Link className="login-link" to={user ? '/painel' : '/entrar'}>
              {user ? 'Meu painel' : 'Entrar'}
            </Link>
            <Link className="button button-dark small" to="/solicitar">
              Quero meu projeto <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </header>
      {demo && (
        <div className="demo-label">
          <span /> Ambiente demonstrativo · Catálogo e valores ilustrativos
        </div>
      )}
      <main id="main">
        {loading ? (
          <div className="empty-state">Carregando a plataforma…</div>
        ) : error ? (
          <div className="empty-state">
            <h1>Não foi possível carregar</h1>
            <p>{error}</p>
            <button className="button button-primary" onClick={() => window.location.reload()}>
              Tentar novamente
            </button>
          </div>
        ) : (
          <Outlet />
        )}
      </main>
      <footer className="footer">
        <div className="footer-top">
          <div>
            <Logo />
            <p>
              Você imagina.
              <br />A gente faz acontecer.
            </p>
          </div>
          <div>
            <b>Explore</b>
            <Link to="/catalogo">Catálogo de inspirações</Link>
            <Link to="/mensalidade">Manutenção mensal</Link>
            <Link to="/solicitar">Solicitar um projeto</Link>
          </div>
          <div>
            <b>Sua jornada</b>
            <Link to="/#como-funciona">Como funciona</Link>
            <Link to="/painel">Área do cliente</Link>
            <Link to="/#duvidas">Perguntas frequentes</Link>
          </div>
          <div className="footer-note">
            <span>VAMOS TIRAR DO PAPEL?</span>
            <Link to="/solicitar">
              Sua próxima
              <br />
              ideia começa aqui. <ArrowUpRight />
            </Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} SiteFlow. Feito para dar vida a ideias.</span>
          <Link to="/termos">Termos e privacidade</Link>
          <Link to="/creditos">Créditos das fotos</Link>
          {demo && <Link to="/admin">Explorar painel demo</Link>}
        </div>
      </footer>
      {toast && (
        <div role="status" className="toast">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}
    </>
  );
}
