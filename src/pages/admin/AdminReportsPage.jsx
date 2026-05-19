import { useEffect, useMemo, useState } from 'react';
import MaterialIcon from '../../components/MaterialIcon.jsx';
import { BOOKING_STATUSES, getBookings } from '../../services/bookingService.js';
import { getCategories } from '../../services/categoryService.js';
import { getServices } from '../../services/serviceService.js';
import { getTukangProfiles } from '../../services/tukangService.js';

function formatCurrency(value) {
  return `Rp${Number(value || 0).toLocaleString('id-ID')}`;
}

function downloadCSV(filename, rows) {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`)
        .join(','),
    )
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function AdminReportsPage() {
  const [bookings, setBookings] = useState([]);
  const [tukangProfiles, setTukangProfiles] = useState([]);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadReports() {
      try {
        setLoading(true);
        setError('');
        const [bookingData, tukangData, serviceData, categoryData] = await Promise.all([
          getBookings(),
          getTukangProfiles(),
          getServices(),
          getCategories(),
        ]);

        if (!ignore) {
          setBookings(bookingData);
          setTukangProfiles(tukangData);
          setServices(serviceData);
          setCategories(categoryData);
        }
      } catch (loadError) {
        if (!ignore) {
          setError('Gagal memuat laporan.');
          console.error(loadError);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadReports();

    return () => {
      ignore = true;
    };
  }, []);

  const report = useMemo(() => {
    const completedBookings = bookings.filter((booking) => booking.status === 'completed');
    const bookingsByStatus = BOOKING_STATUSES.reduce((map, status) => {
      map[status] = bookings.filter((booking) => booking.status === status).length;
      return map;
    }, {});
    const verifiedTukang = tukangProfiles.filter(
      (profile) => profile.verificationStatus === 'verified',
    ).length;
    const categoryMap = categories.reduce((map, category) => {
      map[category.id] = category.name;
      return map;
    }, {});
    const serviceMap = services.reduce((map, service) => {
      map[service.id] = service;
      return map;
    }, {});
    const categoryUsage = bookings.reduce((map, booking) => {
      const categoryId = booking.categoryId || serviceMap[booking.serviceId]?.categoryId || 'unknown';
      map[categoryId] = (map[categoryId] || 0) + 1;
      return map;
    }, {});
    const topCategoryEntry = Object.entries(categoryUsage).sort((a, b) => b[1] - a[1])[0];
    const totalCompletedTransaction = completedBookings.reduce(
      (sum, booking) => sum + Number(booking.totalPrice || 0),
      0,
    );

    return {
      totalCompletedBookings: completedBookings.length,
      totalCompletedTransaction,
      bookingsByStatus,
      verifiedTukang,
      topCategoryName: topCategoryEntry
        ? categoryMap[topCategoryEntry[0]] || 'Kategori tidak diketahui'
        : 'Belum ada data',
      topCategoryCount: topCategoryEntry?.[1] || 0,
      platformRevenueEstimation: totalCompletedTransaction * 0.1,
    };
  }, [bookings, categories, services, tukangProfiles]);

  function handleExportCSV() {
    const rows = [
      ['Metrik', 'Nilai'],
      ['Total transaksi selesai', report.totalCompletedBookings],
      ['Nilai transaksi selesai', report.totalCompletedTransaction],
      ['Jumlah tukang verified', report.verifiedTukang],
      ['Kategori paling banyak digunakan', report.topCategoryName],
      ['Jumlah penggunaan kategori teratas', report.topCategoryCount],
      ['Estimasi pendapatan platform 10%', report.platformRevenueEstimation],
      [],
      ['Status booking', 'Jumlah'],
      ...BOOKING_STATUSES.map((status) => [status, report.bookingsByStatus[status] || 0]),
    ];

    downloadCSV('desafix-report.csv', rows);
  }

  return (
    <section className="admin-page">
      <div className="dashboard-hero">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Laporan</h1>
          <p>Ringkasan transaksi, status booking, tukang verified, dan kategori terpopuler.</p>
        </div>
        <button type="button" className="primary-action button-reset" onClick={handleExportCSV}>
          <MaterialIcon name="upload" size="sm" />
          Export CSV
        </button>
      </div>

      {error && <p className="form-message error">{error}</p>}

      <div className="admin-stats-grid">
        <article className="admin-stat-card">
          <span>
            <MaterialIcon name="task_alt" />
            Total Transaksi Selesai
          </span>
          <strong>{loading ? '...' : report.totalCompletedBookings}</strong>
          <p>{formatCurrency(report.totalCompletedTransaction)}</p>
        </article>
        <article className="admin-stat-card">
          <span>
            <MaterialIcon name="verified_user" />
            Tukang Verified
          </span>
          <strong>{loading ? '...' : report.verifiedTukang}</strong>
          <p>Tukang yang lolos verifikasi</p>
        </article>
        <article className="admin-stat-card">
          <span>
            <MaterialIcon name="category" />
            Kategori Terbanyak
          </span>
          <strong className="stat-text">{loading ? '...' : report.topCategoryName}</strong>
          <p>{report.topCategoryCount} booking</p>
        </article>
        <article className="admin-stat-card">
          <span>
            <MaterialIcon name="monitoring" />
            Estimasi Komisi 10%
          </span>
          <strong>{loading ? '...' : formatCurrency(report.platformRevenueEstimation)}</strong>
          <p>Dari booking completed</p>
        </article>
      </div>

      <section className="report-section">
        <div className="section-heading">
          <p className="eyebrow">Status</p>
          <h2>Jumlah Booking per Status</h2>
        </div>
        <div className="status-report-grid">
          {BOOKING_STATUSES.map((status) => (
            <article key={status}>
              <span className={`status-badge status-${status}`}>{status}</span>
              <strong>{loading ? '...' : report.bookingsByStatus[status] || 0}</strong>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

export default AdminReportsPage;
