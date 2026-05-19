import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MaterialIcon from '../../components/MaterialIcon.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getBookingsByCustomer } from '../../services/bookingService.js';
import {
  createReviewForCompletedBooking,
  getReviewsByCustomer,
} from '../../services/reviewService.js';
import { getService } from '../../services/serviceService.js';

const reviewInitialState = {
  rating: '5',
  comment: '',
};

function CustomerHistoryPage() {
  const location = useLocation();
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [serviceMap, setServiceMap] = useState({});
  const [reviewedBookingIds, setReviewedBookingIds] = useState(new Set());
  const [activeReviewBookingId, setActiveReviewBookingId] = useState('');
  const [reviewForm, setReviewForm] = useState(reviewInitialState);
  const [loading, setLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(location.state?.success || '');

  useEffect(() => {
    let ignore = false;

    async function loadHistory() {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const [bookingData, reviewData] = await Promise.all([
          getBookingsByCustomer(currentUser.uid),
          getReviewsByCustomer(currentUser.uid),
        ]);
        const services = await Promise.all(
          bookingData.map((booking) =>
            booking.serviceId ? getService(booking.serviceId) : Promise.resolve(null),
          ),
        );

        if (!ignore) {
          setBookings(bookingData);
          setReviewedBookingIds(new Set(reviewData.map((review) => review.bookingId)));
          setServiceMap(
            services.reduce((map, service) => {
              if (service?.id) {
                map[service.id] = service;
              }
              return map;
            }, {}),
          );
        }
      } catch (historyError) {
        if (!ignore) {
          setError('Gagal memuat riwayat booking.');
          console.error(historyError);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      ignore = true;
    };
  }, [currentUser?.uid]);

  const sortedBookings = useMemo(() => bookings, [bookings]);

  function openReviewForm(bookingId) {
    setActiveReviewBookingId(bookingId);
    setReviewForm(reviewInitialState);
    setError('');
    setSuccess('');
  }

  function handleReviewChange(event) {
    const { name, value } = event.target;
    setReviewForm((current) => ({ ...current, [name]: value }));
  }

  async function handleReviewSubmit(event, booking) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!reviewForm.comment.trim()) {
      setError('Komentar ulasan wajib diisi.');
      return;
    }

    try {
      setSubmittingReview(true);
      await createReviewForCompletedBooking({
        bookingId: booking.id,
        customerUid: currentUser.uid,
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
      });
      setReviewedBookingIds((current) => new Set([...current, booking.id]));
      setActiveReviewBookingId('');
      setReviewForm(reviewInitialState);
      setSuccess('Ulasan berhasil dikirim.');
    } catch (reviewError) {
      setError(reviewError.message || 'Gagal mengirim ulasan.');
    } finally {
      setSubmittingReview(false);
    }
  }

  return (
    <section className="customer-page">
      {success && <p className="form-message success">{success}</p>}
      {error && <p className="form-message error">{error}</p>}
      <div className="page-panel">
        <p className="eyebrow">Customer</p>
        <h1>Riwayat Booking</h1>
        <p>Lihat status pesanan, buka chat, dan beri ulasan untuk pesanan selesai.</p>
      </div>

      <div className="history-list">
        {loading && <p>Memuat riwayat booking...</p>}
        {!loading && !sortedBookings.length && <p>Belum ada booking.</p>}
        {!loading &&
          sortedBookings.map((booking) => {
            const service = serviceMap[booking.serviceId];
            const hasReview = reviewedBookingIds.has(booking.id);
            const canChat = ['accepted', 'in_progress'].includes(booking.status);
            const canReview = booking.status === 'completed' && !hasReview;

            return (
              <article className="history-card" key={booking.id}>
                <div className="history-card-main">
                  <div>
                    <p className="eyebrow">{service?.name || 'Layanan DesaFix'}</p>
                    <h2>{booking.tukangName || 'Tukang DesaFix'}</h2>
                    <p>{booking.address}</p>
                  </div>
                  <span className={`status-badge status-${booking.status}`}>
                    {booking.status}
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

                <div className="history-actions">
                  <Link to={`/customer/booking/${booking.tukangUid}`}>
                    <MaterialIcon name="account_circle" size="sm" />
                    Detail
                  </Link>
                  {canChat && (
                    <Link to={`/customer/chat/${booking.id}`}>
                      <MaterialIcon name="chat" size="sm" />
                      Chat
                    </Link>
                  )}
                  {canReview && (
                    <button type="button" onClick={() => openReviewForm(booking.id)}>
                      <MaterialIcon name="rate_review" size="sm" />
                      Beri Ulasan
                    </button>
                  )}
                  {hasReview && <span className="reviewed-label">Sudah diulas</span>}
                </div>

                {activeReviewBookingId === booking.id && (
                  <form className="review-form" onSubmit={(event) => handleReviewSubmit(event, booking)}>
                    <label>
                      Rating
                      <select name="rating" value={reviewForm.rating} onChange={handleReviewChange}>
                        <option value="5">5 - Sangat baik</option>
                        <option value="4">4 - Baik</option>
                        <option value="3">3 - Cukup</option>
                        <option value="2">2 - Kurang</option>
                        <option value="1">1 - Buruk</option>
                      </select>
                    </label>
                    <label>
                      Komentar
                      <textarea
                        name="comment"
                        value={reviewForm.comment}
                        onChange={handleReviewChange}
                        rows="3"
                        required
                      />
                    </label>
                    <div className="review-form-actions">
                      <button type="submit" disabled={submittingReview}>
                        <MaterialIcon name="save" size="sm" />
                        {submittingReview ? 'Mengirim...' : 'Kirim Ulasan'}
                      </button>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => setActiveReviewBookingId('')}
                      >
                        <MaterialIcon name="cancel" size="sm" />
                        Batal
                      </button>
                    </div>
                  </form>
                )}
              </article>
            );
          })}
      </div>
    </section>
  );
}

export default CustomerHistoryPage;
