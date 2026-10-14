import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Zap } from 'lucide-react';
import { usePlatform } from '../contexts/PlatformContext';
export default function Auth() {
  const { login, demo } = usePlatform();
  const navigate = useNavigate();
  const [register, setRegister] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [verification, setVerification] = useState(false);
  async function submit(e) {
    e.preventDefault();
    const f = new FormData(e.target);
    setBusy(true);
    setError('');
    try {
      const result = await login(
        f.get('email'),
        f.get('password'),
        register ? f.get('name') : undefined,
      );
      if (result.verificationRequired) {
        setVerification(true);
        setRegister(false);
      } else navigate('/painel');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="section auth-layout">
      <div className="auth-story">
        <Zap size={45} />
        <h1>
          Sua ideia.
          <br />
          Seu projeto.
          <br />
          <i>Seu espaço.</i>
        </h1>
        <p>Acompanhe cada etapa e encontre tudo que precisa em um lugar.</p>
      </div>
      <form className="auth-form" onSubmit={submit}>
        {verification && (
          <div className="info-box" role="status">
            Enviamos um link de confirmação para seu e-mail. Confirme seu endereço antes de entrar.
          </div>
        )}
        <span className="eyebrow">BOM TER VOCÊ AQUI</span>
        <h2>{register ? 'Crie sua conta' : 'Entre no seu espaço'}</h2>
        <p>{register ? 'Acompanhe seu projeto de perto.' : 'Vamos continuar de onde paramos.'}</p>
        {register && (
          <label>
            Nome
            <input name="name" required maxLength={100} autoComplete="name" />
          </label>
        )}
        <label>
          E-mail
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label>
          Senha
          <input
            name="password"
            type="password"
            required
            minLength={10}
            maxLength={128}
            autoComplete={register ? 'new-password' : 'current-password'}
          />
          <small>Mínimo de 10 caracteres.</small>
        </label>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        {demo && (
          <div className="info-box">
            Demonstração local: não há autenticação real. Use um e-mail de exemplo e uma senha
            fictícia.
          </div>
        )}
        <button type="submit" disabled={busy} className="button button-primary full">
          {busy ? 'Aguarde…' : register ? 'Criar minha conta' : 'Entrar'}
          <ArrowUpRight size={17} />
        </button>
        <p className="auth-switch">
          {register ? 'Já tem uma conta?' : 'Primeira vez por aqui?'}{' '}
          <button
            type="button"
            onClick={() => {
              setRegister(!register);
              setError('');
            }}
          >
            {register ? 'Entrar' : 'Criar conta'}
          </button>
        </p>
        <Link className="back-link" to="/solicitar">
          Só quero contar minha ideia primeiro →
        </Link>
      </form>
    </div>
  );
}
