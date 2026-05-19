import { useEffect, useMemo, useState } from 'react';
import MaterialIcon from '../../components/MaterialIcon.jsx';
import { BOOKING_STATUSES, getBookings } from '../../services/bookingService.js';
import { getServices } from '../../services/serviceService.js';

function formatCurrency(value) {
  return `Rp${Number(value || 0).toLocaleString('id-ID')}`;
}

function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    date: '',
    customerName: '',
    tukangName: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadBookings() {
      try {
        setLoading(true);
        setError('');
        const [bookingData, serviceData] = await Promise.all([getBookings(), getServices()]);

        if (!ignore) {
          setBookings(bookingData);
          setServices(serviceData);
        }
      } catch (loadError) {
        if (!ignore) {
          setError('Gagal memuat data booking.');
          console.error(loadError);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadBookings();

    return () => {
      ignore = true;
    };
  }, []);

  const serviceMap = useMemo(
    () =>
      services.reduce((map, service) => {
        map[service.id] = service;
        return map;
      }, {}),
    [services],
  );

  const filteredBookings = useMemo(() => {
    const customerKeyword = filters.customerName.trim().toLowerCase();
    const tukangKeyword = filters.tukangName.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesStatus = filters.status ? booking.status === filters.status : true;
      const matchesDate = filters.date ? booking.bookingDate === filters.date : true;
      const matchesCustomer = customerKeyword
        ? booking.customerName?.toLowerCase().includes(customerKeyword)
        : true;
      const matchesTukang = tukangKeyword
        ? booking.tukangName?.toLowerCase().includes(tukangKeyword)
        : true;

      return matchesStatus && matchesDate && matchesCustomer && matchesTukang;
    });
  }, [bookings, filters]);

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  return (
    <section className="admin-page">
      <div className="page-panel">
        <p className="eyebrow">Admin</p>
        <h1>Kelola Booking</h1>
        <p>Lihat semua booking dan filter berdasarkan status, tanggal, customer, atau tukang.</p>
      </div>

      {error && <p className="form-message error">{error}</p>}

      <div className="admin-filter-bar admin-filter-grid-4">
        <label>
          Status
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">Semua status</option>
            {BOOKING_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tanggal
          <input type="date" name="date" value={filters.date} onChange={handleFilterChange} />
        </label>
        <label>
          Nama Customer
          <input
            type="search"
            name="customerName"
            value={filters.customerName}
            onChange={handleFilterChange}
            placeholder="Cari customer..."
          />
        </label>
        <label>
          Nama Tukang
          <input
            type="search"
            name="tukangName"
            value={filters.tukangName}
            onChange={handleFilterChange}
            placeholder="Cari tukang..."
          />
        </label>
      </div>

      <div className="admin-table-list">
        {loading && <p>Memuat booking...</p>}
        {!loading && !filteredBookings.length && <p>Tidak ada booking yang cocok.</p>}
        {!loading &&
          filteredBookings.map((booking) => (
            <article className="admin-list-card" key={booking.id}>
              <div>
                <p className="eyebrow">{serviceMap[booking.serviceId]?.name || 'Layanan DesaFix'}</p>
                <h2>{booking.customerName || 'Customer'} ke {booking.tukangName || 'Tukang'}</h2>
                <p>
                  <MaterialIcon name="calendar_month" size="sm" />
                  {booking.bookingDate} {booking.bookingTime}
                </p>
                <p>{booking.address}</p>
              </div>
              <div className="admin-card-side">
                <span className={`status-badge status-${booking.status}`}>{booking.status}</span>
                <strong>{formatCurrency(booking.totalPrice)}</strong>
              </div>
            </article>
          ))}
      </div>
    </section>
  );
}

export default AdminBookingsPage;
