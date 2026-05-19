import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import MaterialIcon from '../../components/MaterialIcon.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getDashboardPath } from '../../utils/roleRedirect.js';

const demoAccounts = [
  {
    role: 'Login admin',
    icon: 'admin_panel_settings',
    username: 'andi@gmail.com',
    password: '102030',
  },
  {
    role: 'Login Customer',
    icon: 'person',
    username: 'Budi@gmail.com',
    password: '123456',
  },
  {
    role: 'Login Tukang',
    icon: 'engineering',
    username: 'Joko@gmail.com',
    password: '123456',
  },
];

function LoginPage() {
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setStatus('');

    if (!form.email.trim()) {
      setError('Email wajib diisi.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError('Format email tidak valid.');
      return;
    }

    if (!form.password) {
      setError('Password wajib diisi.');
      return;
    }

    setSubmitting(true);

    try {
      const result = await login(form.email.trim(), form.password);
      const fallbackPath = getDashboardPath(result.userData?.role);
      navigate(location.state?.from?.pathname || fallbackPath, { replace: true });
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetPassword() {
    setError('');
    setStatus('');

    if (!form.email.trim()) {
      setError('Isi email terlebih dahulu untuk reset password.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError('Format email tidak valid.');
      return;
    }

    try {
      await resetPassword(form.email.trim());
      setStatus('Link reset password sudah dikirim ke email.');
    } catch (resetError) {
      setError(resetError.message);
    }
  }

  return (
    <section className="login-page">
      <div className="page-panel auth-panel">
        <p className="eyebrow">Auth</p>
        <h1>Login</h1>
        <p>Masuk sebagai customer, tukang, atau admin yang sudah dibuat.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </label>

          {error && <p className="form-message error">{error}</p>}
          {status && <p className="form-message success">{status}</p>}

          <button type="submit" disabled={submitting}>
            <MaterialIcon name="login" size="sm" />
            {submitting ? 'Memproses...' : 'Login'}
          </button>
          <button type="button" className="text-button" onClick={handleResetPassword}>
            <MaterialIcon name="alternate_email" size="sm" />
            Reset password
          </button>
        </form>

        <p className="auth-switch">
          Belum punya akun? <Link to="/register">Daftar di sini</Link>
        </p>
      </div>

      <aside className="demo-accounts" aria-label="Akun demo">
        <div className="demo-accounts-header">
          <MaterialIcon name="account_circle" filled />
          <h2>Akun Demo</h2>
        </div>
        <div className="demo-account-list">
          {demoAccounts.map((account) => (
            <article className="demo-account-card" key={account.role}>
              <h3>
                <MaterialIcon name={account.icon} size="sm" />
                {account.role}
              </h3>
              <p>
                <span>username :</span>
                <strong>{account.username}</strong>
              </p>
              <p>
                <span>password :</span>
                <strong>{account.password}</strong>
              </p>
            </article>
          ))}
        </div>
      </aside>
    </section>
  );
}

export default LoginPage;
