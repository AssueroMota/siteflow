import { useState } from 'react';
import { CheckCircle2, Pencil, Plus, Quote, Save, Trash2, X } from 'lucide-react';
import { usePlatform } from '../../contexts/PlatformContext';
const blank = () => ({
  id: crypto.randomUUID(),
  name: '',
  business: '',
  quote: '',
  consentNote: '',
  authorized: false,
  published: false,
});
export default function TestimonialsEditor() {
  const { testimonials, saveTestimonials } = usePlatform();
  const [form, setForm] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [remove, setRemove] = useState(null);
  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (form.published && !form.authorized)
        throw new Error('Confirme a autorização do cliente antes de publicar.');
      await saveTestimonials([
        ...testimonials.filter((item) => item.id !== form.id),
        {
          ...form,
          name: form.name.trim(),
          business: form.business.trim(),
          quote: form.quote.trim(),
        },
      ]);
      setForm(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function deleteItem(id) {
    setBusy(true);
    setError('');
    try {
      await saveTestimonials(testimonials.filter((item) => item.id !== id));
      setRemove(null);
      if (form?.id === id) setForm(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="testimonials-editor">
      <div className="testimonial-editor-intro">
        <Quote size={31} />
        <div>
          <h2>Experiências reais, com autorização.</h2>
          <p>
            Cadastre os relatos dos seus clientes. Somente depoimentos autorizados e publicados
            aparecem na página inicial.
          </p>
        </div>
        <button
          className="button button-primary"
          onClick={() => {
            setForm(blank());
            setError('');
          }}
        >
          <Plus size={18} /> Novo depoimento
        </button>
      </div>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {form && (
        <form className="admin-form testimonial-editor-form" onSubmit={save}>
          <div className="testimonial-form-title">
            <h3>
              {testimonials.some((item) => item.id === form.id)
                ? 'Editar depoimento'
                : 'Cadastrar depoimento'}
            </h3>
            <button
              type="button"
              className="icon-button"
              aria-label="Fechar cadastro de depoimento"
              onClick={() => setForm(null)}
            >
              <X size={20} />
            </button>
          </div>
          <div className="form-row">
            <label>
              Nome do cliente
              <input
                required
                maxLength={100}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label>
              Negócio ou identificação pública
              <input
                required
                maxLength={150}
                value={form.business}
                onChange={(e) => setForm({ ...form, business: e.target.value })}
              />
            </label>
          </div>
          <label>
            Depoimento real do cliente
            <textarea
              required
              minLength={20}
              maxLength={1500}
              rows={4}
              value={form.quote}
              onChange={(e) => setForm({ ...form, quote: e.target.value })}
              placeholder="Transcreva o relato autorizado do cliente…"
            />
          </label>
          <label>
            Origem da autorização (uso interno)
            <input
              maxLength={500}
              value={form.consentNote || ''}
              onChange={(e) => setForm({ ...form, consentNote: e.target.value })}
              placeholder="Ex.: autorização recebida por e-mail, com data"
            />
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.authorized}
              onChange={(e) =>
                setForm({
                  ...form,
                  authorized: e.target.checked,
                  published: e.target.checked ? form.published : false,
                })
              }
            />
            Tenho autorização do cliente para publicar este relato.
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.published}
              disabled={!form.authorized}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            Publicar na página inicial
          </label>
          <button className="button button-primary" disabled={busy}>
            <Save size={17} /> Salvar depoimento
          </button>
        </form>
      )}
      <div className="testimonial-admin-list">
        {testimonials.map((item) => (
          <article key={item.id}>
            <div>
              <span className="status-badge">
                {item.published && item.authorized ? 'Publicado' : 'Rascunho'}
              </span>
              {item.authorized && (
                <span className="testimonial-authorized">
                  <CheckCircle2 size={14} /> Autorizado
                </span>
              )}
            </div>
            <blockquote>{item.quote}</blockquote>
            <b>{item.name}</b>
            <p>{item.business}</p>
            <div className="testimonial-actions">
              <button
                className="button button-outline small"
                onClick={() => {
                  setForm({ ...item });
                  setError('');
                }}
              >
                <Pencil size={15} /> Editar
              </button>
              {remove === item.id ? (
                <>
                  <button
                    className="danger-button"
                    disabled={busy}
                    onClick={() => deleteItem(item.id)}
                  >
                    Confirmar exclusão
                  </button>
                  <button onClick={() => setRemove(null)}>Cancelar</button>
                </>
              ) : (
                <button
                  className="icon-button"
                  aria-label={`Excluir depoimento de ${item.name}`}
                  onClick={() => setRemove(item.id)}
                >
                  <Trash2 size={17} />
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
      {!testimonials.length && !form && (
        <div className="panel-empty">
          <Quote size={39} />
          <h3>Uma boa experiência merece ser compartilhada.</h3>
          <p>Adicione um relato real e autorizado para inaugurar a seção de clientes.</p>
        </div>
      )}
    </div>
  );
}
