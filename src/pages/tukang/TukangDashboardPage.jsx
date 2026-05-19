import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import MaterialIcon from '../../components/MaterialIcon.jsx';
import NotificationPanel from '../../components/NotificationPanel.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getBookingsByTukang } from '../../services/bookingService.js';
import { getTukangProfileByUid } from '../../services/tukangService.js';

const activeStatuses = ['accepted', 'in_progress'];

function TukangDashboardPage() {
  const { currentUser, userData } = useAuth();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
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
        setError('');
        const [profileData, bookingData] = await Promise.all([
          getTukangProfileByUid(currentUser.uid),
          getBookingsByTukang(currentUser.uid),
        ]);

        if (!ignore) {
          setProfile(profileData);
          setBookings(bookingData);
        }
      } catch (dashboardError) {
        if (!ignore) {
          setError('Gagal memuat dashboard tukang.');
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

  const stats = useMemo(
    () => ({
      incomingOrders: bookings.filter((booking) => booking.status === 'pending').length,
      activeOrders: bookings.filter((booking) => activeStatuses.includes(booking.status)).length,
      completedOrders: bookings.filter((booking) => booking.status === 'completed').length,
    }),
    [bookings],
  );

  return (
    <section className="tukang-dashboard">
      <div className="dashboard-hero">
        <div>
          <p className="eyebrow">Tukang</p>
          <h1>Halo, {profile?.name || userData?.name || currentUser?.displayName || 'Tukang'}!</h1>
          <p>Pantau pesanan, status verifikasi, dan performa layanan Anda di DesaFix.</p>
        </div>
        <Link to="/tukang/profile" className="primary-action">
          <MaterialIcon name="account_circle" size="sm" />
          Lengkapi Profil
        </Link>
      </div>

      {error && <p className="form-message error">{error}</p>}

      {!loading && !profile && (
        <div className="profile-warning">
          <strong>Profil tukang belum lengkap.</strong>
          <p>
            Lengkapi profil terlebih dahulu agar customer dapat menemukan layanan Anda.
          </p>
          <Link to="/tukang/profile">
            <MaterialIcon name="engineering" size="sm" />
            Lengkapi Profil Sekarang
          </Link>
        </div>
      )}

      <div className="verification-card">
        <span>
          <MaterialIcon name="verified_user" />
          Status Verifikasi
        </span>
        <strong className={`verification-${profile?.verificationStatus || 'missing'}`}>
          {loading ? 'Memuat...' : profile?.verificationStatus || 'Belum ada profil'}
        </strong>
      </div>

      <div className="stats-grid tukang-stats-grid">
        <article>
          <span>
            <MaterialIcon name="event_note" />
            Pesanan Masuk
          </span>
          <strong>{loading ? '...' : stats.incomingOrders}</strong>
        </article>
        <article>
          <span>
            <MaterialIcon name="hourglass_top" />
            Pesanan Aktif
          </span>
          <strong>{loading ? '...' : stats.activeOrders}</strong>
        </article>
        <article>
          <span>
            <MaterialIcon name="task_alt" />
            Pekerjaan Selesai
          </span>
          <strong>{loading ? '...' : stats.completedOrders}</strong>
        </article>
        <article>
          <span>
            <MaterialIcon name="star" filled />
            Rating Rata-rata
          </span>
          <strong>{loading ? '...' : Number(profile?.ratingAverage || 0).toFixed(1)}</strong>
        </article>
      </div>

      <NotificationPanel receiverUid={currentUser?.uid} />
    </section>
  );
}

export default TukangDashboardPage;
