const questions = [
  [
    'Como funciona a SiteFlow?',
    'Você escolhe uma inspiração ou conta uma ideia do zero. Nossa equipe analisa suas necessidades, combina o escopo e desenvolve seu site ou sistema. Depois, a mensalidade mantém o projeto conforme as condições acordadas.',
  ],
  [
    'Os modelos do catálogo são os sites que vou receber?',
    'O catálogo apresenta referências visuais e possibilidades. Seu projeto será adaptado à identidade e às necessidades do seu negócio. As demonstrações atuais são ilustrativas; a entrega e as integrações são definidas no escopo.',
  ],
  [
    'Preciso pagar por cada modelo?',
    'Não. Você contrata o desenvolvimento de um projeto personalizado com manutenção mensal. O catálogo ajuda a escolher uma direção; não é uma loja de arquivos ou de templates.',
  ],
  [
    'O que a mensalidade inclui?',
    'A proposta reúne as condições de manutenção, hospedagem e suporte do seu projeto. Você vê e aprova esses itens antes de contratar. Novas funcionalidades ou mudanças de escopo precisam de uma avaliação.',
  ],
  [
    'Posso pedir um sistema que não aparece no catálogo?',
    'Sim. Conte o que você precisa no formulário, incluindo as funções e os exemplos que tem em mente. Nossa equipe avaliará a viabilidade e o escopo com você.',
  ],
  [
    'Qual é o prazo de entrega? E se eu quiser cancelar?',
    'O prazo depende da complexidade e é definido na proposta. As regras de cancelamento, propriedade do código e transferência do projeto são apresentadas no contrato antes da contratação.',
  ],
];
export default function FAQ() {
  return (
    <section className="section faq-section" id="duvidas">
      <div>
        <span className="eyebrow">SEM COMPLICAÇÃO</span>
        <h2>
          Boa pergunta.
          <br />
          <span>Aqui está a resposta.</span>
        </h2>
        <p>
          Clareza do primeiro contato
          <br />
          ao seu projeto no ar.
        </p>
      </div>
      <div className="faq-list">
        {questions.map(([q, a]) => (
          <details key={q}>
            <summary>
              {q}
              <span>+</span>
            </summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
