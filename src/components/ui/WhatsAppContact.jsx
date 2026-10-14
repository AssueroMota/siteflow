import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, ClipboardList, X } from 'lucide-react';
import { usePlatform } from '../../contexts/PlatformContext';
import { useCatalogModal } from '../../contexts/CatalogModalContext';
import { projectMessage, whatsappLink } from '../../../shared/contact';

export function WhatsAppIcon({ size = 25 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.52 3.48A11.88 11.88 0 0 0 12.05 0C5.46 0 .1 5.35.1 11.94c0 2.1.55 4.15 1.6 5.96L0 24l6.26-1.64a11.96 11.96 0 0 0 5.78 1.47h.01c6.59 0 11.95-5.35 11.95-11.94 0-3.19-1.24-6.18-3.48-8.41ZM12.05 21.8a9.9 9.9 0 0 1-5.05-1.38l-.36-.21-3.72.98.99-3.63-.24-.37a9.9 9.9 0 0 1-1.52-5.25c0-5.47 4.45-9.92 9.93-9.92a9.85 9.85 0 0 1 7.02 2.91 9.85 9.85 0 0 1 2.9 7.02c0 5.47-4.46 9.85-9.95 9.85Zm5.44-7.39c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.48.71.3 1.27.48 1.71.61.72.23 1.37.2 1.89.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
    </svg>
  );
}

export default function WhatsAppContact() {
  const { offer, systems } = usePlatform();
  const { catalogOpen } = useCatalogModal();
  const location = useLocation();
  const [params] = useSearchParams();
  const [open, setOpen] = useState(false);
  const container = useRef(null),
    trigger = useRef(null),
    close = useRef(null);
  const modelId =
    params.get('modelo') || location.pathname.match(/^\/(?:catalogo|demo)\/([^/]+)/)?.[1];
  const model = systems.find((item) => item.id === modelId && item.published);
  const url = whatsappLink(offer.whatsapp, projectMessage(model?.name));
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search, catalogOpen]);
  useEffect(() => {
    if (!open) return;
    close.current?.focus();
    function outside(event) {
      if (!container.current?.contains(event.target)) setOpen(false);
    }
    function escape(event) {
      if (event.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
    }
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);
  return (
    <div className="whatsapp-widget" ref={container}>
      {open && (
        <section
          className="whatsapp-panel"
          role="dialog"
          aria-labelledby="whatsapp-title"
          id="whatsapp-panel"
        >
          <header>
            <span>
              <WhatsAppIcon size={23} /> Vamos conversar
            </span>
            <button
              ref={close}
              type="button"
              aria-label="Fechar contato"
              onClick={() => {
                setOpen(false);
                trigger.current?.focus();
              }}
            >
              <X size={20} />
            </button>
          </header>
          <div className="whatsapp-panel-body">
            <span className="eyebrow">DO SEU JEITO. COM A NOSSA AJUDA.</span>
            <h2 id="whatsapp-title">Sua ideia começa com um “olá”.</h2>
            <p>
              Conte o que seu negócio precisa. Vamos conversar sobre as possibilidades e os próximos
              passos.
            </p>
            {model && (
              <p className="contact-reference">
                Referência escolhida: <b>{model.name}</b>
              </p>
            )}
            {url ? (
              <a
                className="button whatsapp-action"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon size={20} /> Abrir WhatsApp <ArrowUpRight size={18} />
              </a>
            ) : (
              <p>
                O atendimento por WhatsApp será disponibilizado em breve. Você já pode enviar sua
                ideia pelo formulário.
              </p>
            )}
            <Link
              className="contact-form-link"
              to={model ? `/solicitar?modelo=${encodeURIComponent(model.id)}` : '/solicitar'}
              onClick={() => setOpen(false)}
            >
              <ClipboardList size={17} /> Prefiro preencher o formulário
            </Link>
            <small>
              {url
                ? 'A conversa abre no WhatsApp. Você revisa a mensagem antes de enviar.'
                : 'Descreva o projeto para iniciar a conversa.'}
            </small>
          </div>
        </section>
      )}
      <button
        ref={trigger}
        type="button"
        className="whatsapp-fab"
        aria-label={open ? 'Fechar atendimento pelo WhatsApp' : 'Conversar pelo WhatsApp'}
        aria-expanded={open}
        aria-controls={open ? 'whatsapp-panel' : undefined}
        aria-haspopup="dialog"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={28} /> : <WhatsAppIcon size={30} />}
        <span>Vamos conversar?</span>
      </button>
    </div>
  );
}
