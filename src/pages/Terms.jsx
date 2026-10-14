import { usePlatform } from '../contexts/PlatformContext';
export default function Terms() {
  const { demo, offer } = usePlatform();
  return (
    <article className="section page-section legal">
      <span className="eyebrow">CLAREZA EM CADA ETAPA</span>
      <h1>Termos e privacidade</h1>
      {demo && (
        <div className="info-box">
          Ambiente demonstrativo. Estes textos descrevem o funcionamento da aplicação e precisam ser
          complementados pelos dados e pelo contrato da empresa antes da operação comercial.
        </div>
      )}
      <h2>O serviço</h2>
      <p>
        A SiteFlow recebe solicitações de sites e sistemas personalizados. O catálogo contém
        inspirações visuais, não produtos para download. O escopo, o prazo, a manutenção e o valor
        são apresentados na proposta antes da contratação.
      </p>
      <h2>Manutenção e cancelamento</h2>
      <p>{offer.support}</p>
      <p>{offer.access}</p>
      <p>{offer.license}</p>
      <h2>Dados da solicitação</h2>
      <p>
        O formulário coleta nome, e-mail, telefone opcional, negócio e informações do projeto para
        permitir a análise e o contato. Não inclua senhas ou dados sensíveis. Na demonstração, as
        solicitações e configurações ficam no armazenamento deste navegador e podem ser removidas
        limpando os dados do site.
      </p>
      <h2>Conta e pagamentos</h2>
      <p>
        Na versão conectada, as senhas são armazenadas como hashes no servidor e a sessão utiliza
        cookies. O pagamento é realizado no checkout configurado, sem coleta de cartão neste site. O
        status financeiro depende de notificações validadas do processador, nunca apenas do retorno
        do checkout.
      </p>
      <h2>Antes da operação comercial</h2>
      <p>
        A empresa deve publicar sua identificação, contato do responsável pelos dados, canais para
        solicitações de privacidade, prazo de retenção e contrato com as condições de manutenção,
        cancelamento e propriedade do projeto.
      </p>
    </article>
  );
}
