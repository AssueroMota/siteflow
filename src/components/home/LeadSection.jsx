import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, Lightbulb, MessageSquare, Monitor } from 'lucide-react';
export default function LeadSection() {
  return (
    <section className="section lead-section" id="vamos-conversar">
      <div className="lead-content">
        <span className="eyebrow">DO “E SE…” AO “É ISSO!”</span>
        <h2>
          Não precisa ter tudo pronto.
          <br />
          <span>Só precisa dar o primeiro passo.</span>
        </h2>
        <p>
          Uma ideia no papel, um problema para resolver ou um site que precisa evoluir. Conte o seu
          momento e vamos descobrir um caminho para o seu negócio.
        </p>
        <div className="lead-paths">
          <Link to="/solicitar?tipo=novo">
            <Lightbulb size={24} />
            <span>
              <b>Tenho uma ideia nova</b>
              <small>Quero criar um site ou sistema.</small>
            </span>
            <ArrowUpRight size={20} />
          </Link>
          <Link to="/solicitar?tipo=melhorar">
            <Monitor size={24} />
            <span>
              <b>Quero melhorar o que já tenho</b>
              <small>Preciso evoluir meu projeto atual.</small>
            </span>
            <ArrowUpRight size={20} />
          </Link>
        </div>
      </div>
      <aside className="lead-invite">
        <div className="lead-message-icon">
          <MessageSquare size={33} />
        </div>
        <h3>
          Vamos começar
          <br />
          com uma conversa?
        </h3>
        <p>Compartilhe seu negócio, suas referências e o que gostaria que o seu projeto fizesse.</p>
        <Link className="button button-primary" to="/solicitar">
          Contar minha ideia <ArrowUpRight size={19} />
        </Link>
        <span>
          <Check size={16} /> O escopo é alinhado antes da contratação.
        </span>
      </aside>
    </section>
  );
}
