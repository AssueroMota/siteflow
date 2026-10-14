import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { api } from '../services/api';
import { usePlatform } from '../contexts/PlatformContext';
export default function VerifyEmail() {
  const { demo } = usePlatform();
  const [busy, setBusy] = useState(false),
    [done, setDone] = useState(false),
    [error, setError] = useState('');
  async function verify() {
    setBusy(true);
    setError('');
    try {
      await api('/auth/verify', {
        method: 'POST',
        body: JSON.stringify({ token: window.location.hash.slice(1) }),
      });
      window.history.replaceState(null, '', '/confirmar-email');
      setDone(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="section empty-state">
      <MailCheck size={45} />
      <h1>{done ? 'E-mail confirmado!' : 'Confirme seu e-mail'}</h1>
      <p>
        {done
          ? 'Agora você pode entrar para acompanhar seu projeto.'
          : 'Confirme seu endereço para acessar sua conta e seu histórico.'}
      </p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {done ? (
        <Link to="/entrar" className="button button-primary">
          Entrar na minha conta
        </Link>
      ) : (
        <button disabled={busy || demo} className="button button-primary" onClick={verify}>
          {busy ? 'Confirmando…' : 'Confirmar meu e-mail'}
        </button>
      )}
      {demo && <p>Confirmação disponível apenas na versão conectada.</p>}
    </div>
  );
}
