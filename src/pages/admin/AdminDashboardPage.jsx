import { useEffect, useMemo, useState } from 'react';
import MaterialIcon from '../../components/MaterialIcon.jsx';
import { getBookings } from '../../services/bookingService.js';
import { getCategories } from '../../services/categoryService.js';
import { getUsers } from '../../services/userService.js';

function AdminDashboardPage() {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError('');
        const [userData, bookingData, categoryData] = await Promise.all([
          getUsers(),
          getBookings(),
          getCategories(),
        ]);

        if (!ignore) {
          setUsers(userData);
          setBookings(bookingData);
          setCategories(categoryData);
        }
      } catch (dashboardError) {
        if (!ignore) {
          setError('Gagal memuat dashboard admin.');
          console.error(dashboardError);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      ignore = true;
    };
  }, []);

  const stats = useMemo(
    () => [
      {
        label: 'Total Users',
        icon: 'group',
        value: users.length,
        description: 'Semua akun terdaftar',
      },
      {
        label: 'Total Customer',
        icon: 'person',
        value: users.filter((user) => user.role === 'customer').length,
        description: 'Akun pengguna jasa',
      },
      {
        label: 'Total Tukang',
        icon: 'engineering',
        value: users.filter((user) => user.role === 'tukang').length,
        description: 'Akun penyedia jasa',
      },
      {
        label: 'Total Booking',
        icon: 'event_note',
        value: bookings.length,
        description: 'Semua pesanan masuk',
      },
      {
        label: 'Booking Selesai',
        icon: 'task_alt',
        value: bookings.filter((booking) => booking.status === 'completed').length,
        description: 'Pesanan yang selesai',
      },
      {
        label: 'Kategori Jasa',
        icon: 'category',
        value: categories.length,
        description: 'Kategori layanan aktif',
      },
    ],
    [bookings, categories, users],
  );

  return (
    <section className="admin-dashboard">
      <div className="page-panel">
        <p className="eyebrow">Admin</p>
        <h1>Dashboard Admin</h1>
        <p>Pantau ringkasan pengguna, booking, dan kategori layanan DesaFix.</p>
      </div>

      {error && <p className="form-message error">{error}</p>}

      <div className="admin-stats-grid">
        {stats.map((stat) => (
          <article className="admin-stat-card" key={stat.label}>
            <span>
              <MaterialIcon name={stat.icon} />
              {stat.label}
            </span>
            <strong>{loading ? '...' : stat.value}</strong>
            <p>{stat.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default AdminDashboardPage;
