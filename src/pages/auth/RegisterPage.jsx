import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MaterialIcon from '../../components/MaterialIcon.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getDashboardPath } from '../../utils/roleRedirect.js';

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: 'customer',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function validateForm() {
    if (!form.name.trim()) return 'Nama wajib diisi.';
    if (!form.email.trim()) return 'Email wajib diisi.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return 'Format email tidak valid.';
    }
    if (form.password.length < 6) return 'Password minimal 6 karakter.';
    if (!form.phone.trim()) return 'Nomor telepon wajib diisi.';
    if (!/^[0-9+\-\s]{8,20}$/.test(form.phone.trim())) {
      return 'Nomor telepon tidak valid.';
    }
    if (!form.address.trim()) return 'Alamat wajib diisi.';
    if (!['customer', 'tukang'].includes(form.role)) {
      return 'Role pendaftaran hanya boleh customer atau tukang.';
    }
    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      const result = await register({
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      });
      navigate(getDashboardPath(result.userData.role), { replace: true });
    } catch (registerError) {
      setError(registerError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="page-panel auth-panel">
      <p className="eyebrow">Auth</p>
      <h1>Register</h1>
      <p>Daftar sebagai customer atau tukang. Admin dibuat manual di Firestore.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Nama
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            autoComplete="name"
            required
          />
        </label>
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
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>
        <label>
          Nomor Telepon
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            autoComplete="tel"
            required
          />
        </label>
        <label>
          Alamat
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            rows="3"
            required
          />
        </label>
        <label>
          Role
          <select name="role" value={form.role} onChange={handleChange} required>
            <option value="customer">Customer</option>
            <option value="tukang">Tukang</option>
          </select>
        </label>

        {error && <p className="form-message error">{error}</p>}

        <button type="submit" disabled={submitting}>
          <MaterialIcon name="person_add" size="sm" />
          {submitting ? 'Memproses...' : 'Register'}
        </button>
      </form>

      <p className="auth-switch">
        Sudah punya akun? <Link to="/login">Login di sini</Link>
      </p>
    </section>
  );
}

export default RegisterPage;
