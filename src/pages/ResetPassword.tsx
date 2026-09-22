import { useState } from 'react';
import { Link } from '@/lib/router-compat';

export default function ResetPassword() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState('');

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('Password reset service will be available soon.');
  };

  return (
    <main className="hk-auth hk-auth-form-page">
      <header className="hk-auth-header">
        <Link className="hk-auth-back" to="/login" aria-label="Back to Sign In">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 5-7 7 7 7M3 12h19" /></svg>
        </Link>
        <h1>Reset Password</h1>
        <span />
      </header>
      <form className="hk-auth-form" onSubmit={submit} noValidate>
        <div className="hk-fields">
          <div className="hk-input-shell hk-phone-shell">
            <svg className="hk-field-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 16.4v3a2 2 0 0 1-2.2 2A19.7 19.7 0 0 1 2.6 5.2 2 2 0 0 1 4.6 3h3l2 5-2.2 2.2a15 15 0 0 0 6.4 6.4L16 14.4z" /></svg>
            <span className="hk-prefix">+91</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="Phone" required />
          </div>
          <div className="hk-input-shell">
            <svg className="hk-field-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="12" rx="1" /><path d="M7 10V6a5 5 0 0 1 10 0v4M12 15v3" /></svg>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="new-password" placeholder="New Password" minLength={6} required />
          </div>
          <div className="hk-input-shell hk-otp-shell">
            <svg className="hk-field-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 4.5h20v15H2zM2 5l10 7L22 5" /></svg>
            <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="OTP Code" required />
            <button className="hk-send" type="button" onClick={() => setStatus('Password reset SMS will be connected later.')}>Send</button>
          </div>
        </div>
        <button className="hk-primary" type="submit">Reset Password</button>
        {status && <p className="hk-status">{status}</p>}
      </form>
    </main>
  );
}