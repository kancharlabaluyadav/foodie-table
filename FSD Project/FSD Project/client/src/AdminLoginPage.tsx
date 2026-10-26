import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context';

export function AdminLoginPage() {
  const { user, ready, adminLogin } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [hasError, setHasError] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const fields = new FormData(form);
    setSending(true); setMessage('Signing you in…'); setHasError(false);
    try {
      await adminLogin(String(fields.get('username') || ''), String(fields.get('password') || ''));
      navigate('/admin', { replace: true });
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : 'The admin sign-in could not be completed.');
      setHasError(true);
    } finally {
      setSending(false);
    }
  }

  if (!ready) return <div className="section-wrap page-content narrow-content"><p className="quiet-message">Checking your session…</p></div>;
  if (user?.role === 'admin' || user?.role === 'manager') return <div className="section-wrap page-content narrow-content admin-login-page"><p className="eyebrow">FOODIE TABLE · STAFF</p><h1>You’re signed in.</h1><p>Continue to the restaurant service desk.</p><Link className="button button-reserve" to={user.role === 'manager' ? '/manager' : '/admin'}>Open staff desk</Link></div>;

  return (
    <div className="section-wrap page-content narrow-content admin-login-page">
      <p className="eyebrow">FOODIE TABLE · STAFF</p>
      <h1>Staff sign in.</h1>
      <p className="admin-login-lede">Use the username and password issued by the website administrator. Customer accounts use a separate sign-in.</p>
      <section className="form-card admin-login-card">
        {message && <p className={'notice' + (hasError ? ' is-error' : ' is-success')} role="status" aria-live="polite">{message}</p>}
        <form onSubmit={submit}>
          <label htmlFor="admin-username">Username</label>
          <input id="admin-username" name="username" type="text" autoComplete="username" minLength={3} maxLength={32} pattern="[A-Za-z0-9._-]{3,32}" spellCheck={false} autoCapitalize="none" required />
          <label htmlFor="admin-password">Password</label>
          <input id="admin-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" maxLength={200} required />
          <button className="password-toggle" type="button" aria-controls="admin-password" aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? 'Hide password' : 'Show password'}</button>
          <button className="button button-reserve button-full" type="submit" disabled={sending}>{sending ? 'Signing in…' : 'Sign in to staff desk'}</button>
        </form>
      </section>
      <Link className="text-link admin-customer-link" to="/account">Customer sign in</Link>
    </div>
  );
}
