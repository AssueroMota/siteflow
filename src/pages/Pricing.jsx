import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, ShieldCheck, MessageSquare, Sparkles } from 'lucide-react';
import { usePlatform } from '../contexts/PlatformContext';
import { money, safeUrl } from '../services/api';
import FAQ from '../components/ui/FAQ';
export default function Pricing() {
  const { offer, demo } = usePlatform();
  const checkout = safeUrl(offer.checkoutUrl);
  return (
    <>
      <div className="section page-section">
        <div className="page-intro centered">
          <span className="eyebrow">UM PROJETO SEU. CUIDADO CONTÍNUO.</span>
          <h1>
            Você pensa no negócio.
            <br />
            <span>A gente cuida do digital.</span>
          </h1>
          <p>Desenvolvimento personalizado e uma mensalidade para manter o seu site ou sistema.</p>
        </div>
        <div className="pricing-layout">
          <div className="pricing-story">
            <Sparkles size={38} />
            <h2>
              Da primeira ideia
              <br />
              ao próximo capítulo.
            </h2>
            <p>
              Escolha uma inspiração no catálogo ou comece do zero. Antes de contratar, vamos
              alinhar o escopo, as condições e o prazo do seu projeto.
            </p>
            {[
              ['01', 'Briefing e proposta', 'Entendemos o que seu negócio precisa.'],
              ['02', 'Criação e aprovação', 'Design e desenvolvimento com a sua participação.'],
              ['03', 'Manutenção mensal', 'Seu projeto recebe o cuidado combinado na proposta.'],
            ].map(([n, t, d]) => (
              <div className="pricing-step" key={n}>
                <span>{n}</span>
                <div>
                  <b>{t}</b>
                  <p>{d}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="pricing-card">
            <span className="pill">MENSALIDADE DE MANUTENÇÃO</span>
            <h2>{offer.title}</h2>
            <div className="price">
              <b>{money(offer.price)}</b>
              <span>/mês</span>
            </div>
            {demo && (
              <small className="price-note">Valor ilustrativo, configurável pela equipe.</small>
            )}
            <hr />
            {[
              'Projeto com sua identidade',
              'Escopo definido em conjunto',
              'Layout para desktop e celular',
              'Manutenção conforme proposta',
              'Acompanhamento pela área do cliente',
            ].map((t) => (
              <p className="check-line" key={t}>
                <Check size={18} />
                {t}
              </p>
            ))}
            <Link className="button button-primary" to="/solicitar">
              Solicitar meu projeto <ArrowUpRight size={18} />
            </Link>
            {checkout && !demo && (
              <a href={checkout} className="button button-outline" target="_blank" rel="noreferrer">
                Assinar após aprovar a proposta <ArrowUpRight size={18} />
              </a>
            )}
            <small>
              Contratação após aprovação da proposta. Sem cobrança individual por modelo do
              catálogo.
            </small>
          </div>
        </div>
        <div className="terms-grid">
          <div>
            <MessageSquare />
            <h3>Sobre o suporte</h3>
            <p>{offer.support}</p>
          </div>
          <div>
            <ShieldCheck />
            <h3>Condições claras</h3>
            <p>{offer.license}</p>
            <p>{offer.access}</p>
          </div>
        </div>
      </div>
      <FAQ />
    </>
  );
}
