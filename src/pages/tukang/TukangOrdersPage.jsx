import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MaterialIcon from '../../components/MaterialIcon.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getBookingsByTukang, updateBookingStatus } from '../../services/bookingService.js';
import { createNotification } from '../../services/notificationService.js';

const statusLabels = {
  pending: 'Pending',
  accepted: 'Diterima',
  rejected: 'Ditolak',
  in_progress: 'Dikerjakan',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};

const statusMessages = {
  accepted: 'Pesanan Anda diterima oleh tukang.',
  rejected: 'Pesanan Anda ditolak oleh tukang.',
  in_progress: 'Pesanan Anda sedang dikerjakan.',
  completed: 'Pesanan Anda sudah diselesaikan.',
};

const confirmationMessages = {
  accepted: 'Terima pesanan ini?',
  rejected: 'Tolak pesanan ini?',
  in_progress: 'Ubah status pesanan menjadi sedang dikerjakan?',
  completed: 'Selesaikan pesanan ini?',
};

function TukangOrdersPage() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadOrders() {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const bookingData = await getBookingsByTukang(currentUser.uid);
        if (!ignore) {
          setBookings(bookingData);
        }
      } catch (loadError) {
        if (!ignore) {
          setError('Gagal memuat pesanan masuk.');
          console.error(loadError);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      ignore = true;
    };
  }, [currentUser?.uid]);

  function getAvailableActions(status) {
    if (status === 'pending') {
      return [
        { label: 'Terima', nextStatus: 'accepted' },
        { label: 'Tolak', nextStatus: 'rejected', danger: true },
      ];
    }

    if (status === 'accepted') {
      return [{ label: 'Mulai Kerjakan', nextStatus: 'in_progress' }];
    }

    if (status === 'in_progress') {
      return [{ label: 'Selesaikan', nextStatus: 'completed' }];
    }

    return [];
  }

  async function handleStatusChange(booking, nextStatus) {
    const confirmed = window.confirm(confirmationMessages[nextStatus]);
    if (!confirmed) return;

    try {
      setUpdatingId(booking.id);
      setError('');
      setSuccess('');
      await updateBookingStatus(booking.id, nextStatus);
      await createNotification({
        receiverUid: booking.customerUid,
        title: 'Status pesanan diperbarui',
        message: statusMessages[nextStatus],
        type: 'booking',
        readStatus: false,
      });
      setBookings((current) =>
        current.map((item) => (item.id === booking.id ? { ...item, status: nextStatus } : item)),
      );
      setSuccess('Status pesanan berhasil diperbarui.');
    } catch (updateError) {
      setError(updateError.message || 'Gagal memperbarui status pesanan.');
    } finally {
      setUpdatingId('');
    }
  }

  return (
    <section className="tukang-management-page">
      <div className="page-panel">
        <p className="eyebrow">Tukang</p>
        <h1>Pesanan Masuk</h1>
        <p>Kelola pesanan customer dan perbarui status pekerjaan.</p>
      </div>

      {error && <p className="form-message error">{error}</p>}
      {success && <p className="form-message success">{success}</p>}

      <div className="orders-list">
        {loading && <p>Memuat pesanan...</p>}
        {!loading && !bookings.length && <p>Belum ada pesanan untuk Anda.</p>}
        {!loading &&
          bookings.map((booking) => (
            <article className="order-card" key={booking.id}>
              <div className="history-card-main">
                <div>
                  <p className="eyebrow">{booking.customerName || 'Customer'}</p>
                  <h2>{booking.problemDescription || 'Pesanan jasa'}</h2>
                  <p>{booking.address}</p>
                </div>
                <span className={`status-badge status-${booking.status}`}>
                  {statusLabels[booking.status] || booking.status}
                </span>
              </div>

              <div className="history-info-grid">
                <div>
                  <span>Tanggal dan Jam</span>
                  <strong>
                    <MaterialIcon name="calendar_month" size="sm" />
                    {booking.bookingDate} {booking.bookingTime}
                  </strong>
                </div>
                <div>
                  <span>Total Harga</span>
                  <strong>Rp{Number(booking.totalPrice || 0).toLocaleString('id-ID')}</strong>
                </div>
              </div>

              <div className="order-actions">
                <Link to={`/tukang/chat/${booking.id}`}>
                  <MaterialIcon name="chat" size="sm" />
                  Chat
                </Link>
                {getAvailableActions(booking.status).map((action) => (
                  <button
                    key={action.nextStatus}
                    type="button"
                    className={action.danger ? 'danger-button' : ''}
                    disabled={updatingId === booking.id}
                    onClick={() => handleStatusChange(booking, action.nextStatus)}
                  >
                    <MaterialIcon
                      name={action.danger ? 'cancel' : action.nextStatus === 'completed' ? 'task_alt' : 'check_circle'}
                      size="sm"
                    />
                    {updatingId === booking.id ? 'Memproses...' : action.label}
                  </button>
                ))}
              </div>
            </article>
          ))}
      </div>
    </section>
  );
}

export default TukangOrdersPage;
