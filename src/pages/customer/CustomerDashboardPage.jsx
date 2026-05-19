import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import MaterialIcon from '../../components/MaterialIcon.jsx';
import NotificationPanel from '../../components/NotificationPanel.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getBookingsByCustomer } from '../../services/bookingService.js';
import { getCategories } from '../../services/categoryService.js';

const activeStatuses = ['pending', 'accepted', 'confirmed', 'in_progress'];

function CustomerDashboardPage() {
  const { currentUser, userData } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadDashboard() {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [bookingData, categoryData] = await Promise.all([
          getBookingsByCustomer(currentUser.uid),
          getCategories(),
        ]);

        if (!ignore) {
          setBookings(bookingData);
          setCategories(categoryData);
        }
      } catch (dashboardError) {
        if (!ignore) {
          setError('Gagal memuat dashboard customer.');
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
  }, [currentUser?.uid]);

  const activeBookings = useMemo(
    () => bookings.filter((booking) => activeStatuses.includes(booking.status)),
    [bookings],
  );

  const recommendedCategories = categories.slice(0, 5);

  return (
    <section className="customer-page">
      <div className="dashboard-hero">
        <div>
          <p className="eyebrow">Customer</p>
          <h1>Halo, {userData?.name || currentUser?.displayName || 'Customer'}!</h1>
          <p>Temukan tukang terpercaya dan pantau pesanan Anda dari dashboard ini.</p>
        </div>
        <Link to="/customer/search" className="primary-action">
          <MaterialIcon name="search" size="sm" />
          Cari Tukang
        </Link>
      </div>

      {error && <p className="form-message error">{error}</p>}

      <div className="stats-grid">
        <article>
          <span>
            <MaterialIcon name="event_note" />
            Jumlah Pesanan
          </span>
          <strong>{loading ? '...' : bookings.length}</strong>
        </article>
        <article>
          <span>
            <MaterialIcon name="hourglass_top" />
            Pesanan Aktif
          </span>
          <strong>{loading ? '...' : activeBookings.length}</strong>
        </article>
      </div>

      <NotificationPanel receiverUid={currentUser?.uid} />

      <section className="content-section">
        <div className="section-heading">
          <p className="eyebrow">Rekomendasi</p>
          <h2>Kategori Layanan</h2>
        </div>
        <div className="dashboard-category-grid">
          {recommendedCategories.length ? (
            recommendedCategories.map((category) => (
              <Link key={category.id} to="/customer/search" state={{ categoryId: category.id }}>
                <MaterialIcon name="category" className="icon-accent" />
                <strong>{category.name}</strong>
                <span>{category.description || 'Cari tukang untuk kategori ini.'}</span>
              </Link>
            ))
          ) : (
            <p>Belum ada kategori layanan yang tersedia.</p>
          )}
        </div>
      </section>
    </section>
  );
}

export default CustomerDashboardPage;
