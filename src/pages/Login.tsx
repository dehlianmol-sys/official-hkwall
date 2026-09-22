import { useEffect, useState } from 'react';
import { Link, useNavigate } from '@/lib/router-compat';
import { useStore } from '@/lib/store';
import { useToast } from '@/lib/toast';
import { APP_LOGO, APP_LOGO_FALLBACK } from '@/lib/brand';
import AppSplash from '@/components/AppSplash';
import CachedImage from '@/components/CachedImage';

export default function Login({ showSplash = false }: { showSplash?: boolean }) {
  const { login } = useStore();
  const navigate = useNavigate();
  const toast = useToast();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [splash, setSplash] = useState(showSplash);

  useEffect(() => {
    if (!showSplash) return;
    const timer = window.setTimeout(() => setSplash(false), 1500);
    return () => window.clearTimeout(timer);
  }, [showSplash]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    setError('');
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) return setError('Enter a 10-digit phone number.');
    if (!password) return setError('Enter your password.');
    if (!agreed) return setError('Please agree to the User Privacy Agreement.');
    setLoading(true);
    try {
      const result = await login(digits, password);
      if (!result.ok || !result.user) return setError(result.message);
      toast('Sign in successful', 'success');
      await new Promise((resolve) => window.setTimeout(resolve, 850));
      navigate(result.user.role === 'user' ? '/' : '/admin');
    } finally {
      setLoading(false);
    }
  };

  if (splash) return <AppSplash />;

  return (
    <main className="hk-auth hk-login-page">
      <h1 className="sr-only">Sign In to HK Wallet</h1>
      <div className="hk-brand"><CachedImage src={APP_LOGO} fallbackSrc={APP_LOGO_FALLBACK} cacheKey="app-logo-v2" alt="HK Wallet" /></div>
      <form className="hk-login-form" onSubmit={submit} noValidate>
        <div className="hk-fields">
          <div className="hk-input-shell">
            <svg className="hk-field-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="8" r="2.5"/><path d="M5.3 18.5v-1A4.5 4.5 0 0 1 9.8 13h4.4a4.5 4.5 0 0 1 4.5 4.5v1"/></svg>
            <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="Phone" maxLength={10} required />
          </div>
          <div className="hk-input-shell">
            <svg className="hk-field-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="12" rx="1"/><path d="M7 10V6a5 5 0 0 1 10 0v4M12 15v3"/></svg>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" placeholder="Password" required />
          </div>
        </div>
        <div className="hk-options">
          <Link to="/register">Register</Link>
          <label><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember Me</label>
        </div>
        <label className="hk-agreement"><input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} /> Agree <span>“User Privacy Agreement”</span></label>
        {error && <p className="hk-error">{error}</p>}
        <button className="hk-primary" type="submit" disabled={loading}>{loading ? 'Loading' : 'Sign In'}</button>
        <div className="hk-forgot"><Link to="/reset-password">Forget Password</Link></div>
      </form>
      <span className="hk-version">v1.1.9</span>
      {loading && <div className="hk-loading-overlay"><div className="hk-loading-box"><span className="hk-mini-spinner" /><span>Loading</span></div></div>}
    </main>
  );
}