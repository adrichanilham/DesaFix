import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MaterialIcon from '../../components/MaterialIcon.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { createBooking } from '../../services/bookingService.js';
import { getCategory } from '../../services/categoryService.js';
import { createNotification } from '../../services/notificationService.js';
import { getServicesByTukang } from '../../services/serviceService.js';
import { getTukangProfile, getTukangProfileByUid } from '../../services/tukangService.js';

function CustomerBookingPage() {
  const { tukangId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  const [tukang, setTukang] = useState(null);
  const [category, setCategory] = useState(null);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    serviceId: '',
    bookingDate: '',
    bookingTime: '',
    address: userData?.address || '',
    problemDescription: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setForm((current) => ({
      ...current,
      address: current.address || userData?.address || '',
    }));
  }, [userData?.address]);

  useEffect(() => {
    let ignore = false;

    async function loadBookingData() {
      try {
        setLoading(true);
        setError('');

        let profile = await getTukangProfile(tukangId);
        if (!profile) {
          profile = await getTukangProfileByUid(tukangId);
        }

        if (!profile) {
          throw new Error('Profil tukang tidak ditemukan.');
        }

        const [serviceData, categoryData] = await Promise.all([
          getServicesByTukang(profile.uid),
          profile.categoryId ? getCategory(profile.categoryId) : Promise.resolve(null),
        ]);

        if (!ignore) {
          setTukang(profile);
          setServices(serviceData);
          setCategory(categoryData);
          setForm((current) => ({
            ...current,
            serviceId: current.serviceId || serviceData[0]?.id || '',
          }));
        }
      } catch (bookingError) {
        if (!ignore) {
          setError(bookingError.message || 'Gagal memuat data booking.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadBookingData();

    return () => {
      ignore = true;
    };
  }, [tukangId]);

  const selectedService = useMemo(
    () => services.find((service) => service.id === form.serviceId),
    [form.serviceId, services],
  );

  const totalPrice = Number(selectedService?.price || 0);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function validateForm() {
    if (!tukang) return 'Profil tukang belum tersedia.';
    if (!currentUser?.uid) return 'Anda harus login sebagai customer.';
    if (!form.serviceId) return 'Pilih layanan terlebih dahulu.';
    if (!form.bookingDate) return 'Tanggal booking wajib diisi.';
    if (!form.bookingTime) return 'Jam booking wajib diisi.';
    if (!form.address.trim()) return 'Alamat pelanggan wajib diisi.';
    if (!form.problemDescription.trim()) return 'Deskripsi masalah wajib diisi.';
    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const confirmed = window.confirm('Kirim pesanan ini ke tukang?');
    if (!confirmed) return;

    try {
      setSubmitting(true);
      const booking = await createBooking({
        customerUid: currentUser.uid,
        tukangUid: tukang.uid,
        serviceId: selectedService.id,
        categoryId: selectedService.categoryId || tukang.categoryId,
        customerName: userData?.name || currentUser.displayName || currentUser.email,
        tukangName: tukang.name,
        bookingDate: form.bookingDate,
        bookingTime: form.bookingTime,
        address: form.address.trim(),
        problemDescription: form.problemDescription.trim(),
        status: 'pending',
        totalPrice,
      });

      await createNotification({
        receiverUid: tukang.uid,
        title: 'Pesanan jasa baru',
        message: `${userData?.name || 'Customer'} mengirim pesanan untuk ${selectedService.name}.`,
        type: 'booking',
        readStatus: false,
      });

      setSuccess('Pesanan berhasil dibuat. Mengarahkan ke riwayat pesanan...');
      setTimeout(() => {
        navigate('/customer/history', {
          replace: true,
          state: {
            success: 'Pesanan berhasil dibuat dan menunggu konfirmasi tukang.',
            bookingId: booking.id,
          },
        });
      }, 900);
    } catch (submitError) {
      setError(submitError.message || 'Gagal membuat pesanan.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p>Memuat form booking...</p>;
  }

  return (
    <section className="customer-page">
      <div className="page-panel">
        <p className="eyebrow">Customer</p>
        <h1>Pesan Jasa Tukang</h1>
        <p>Pilih layanan, tentukan jadwal, lalu kirim detail masalah kepada tukang.</p>
      </div>

      {error && <p className="form-message error">{error}</p>}
      {success && <p className="form-message success">{success}</p>}

      {tukang && (
        <article className="booking-tukang-card">
          <div className="tukang-photo booking-photo">
            {tukang.photoURL ? (
              <img src={tukang.photoURL} alt={tukang.name} />
            ) : (
              <MaterialIcon name="engineering" size="lg" />
            )}
          </div>
          <div>
            <p className="eyebrow">{category?.name || 'Tukang DesaFix'}</p>
            <h2>{tukang.name}</h2>
            <p>{tukang.description || tukang.skill || 'Profil tukang DesaFix.'}</p>
            <div className="tukang-meta">
              <span>
                <MaterialIcon name="location_on" size="sm" />
                {tukang.serviceArea || tukang.address || 'Area belum diisi'}
              </span>
              <span>
                <MaterialIcon name="star" size="sm" filled />
                Rating {Number(tukang.ratingAverage || 0).toFixed(1)}
              </span>
              <span>
                <MaterialIcon name="fact_check" size="sm" />
                {tukang.priceEstimation || 'Harga mengikuti layanan'}
              </span>
            </div>
          </div>
        </article>
      )}

      <form className="booking-form" onSubmit={handleSubmit}>
        <label>
          Pilihan Layanan
          <select name="serviceId" value={form.serviceId} onChange={handleChange} required>
            <option value="">Pilih layanan</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} - Rp{Number(service.price || 0).toLocaleString('id-ID')}
              </option>
            ))}
          </select>
        </label>

        <div className="booking-form-grid">
          <label>
            Tanggal Booking
            <input
              type="date"
              name="bookingDate"
              value={form.bookingDate}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Jam Booking
            <input
              type="time"
              name="bookingTime"
              value={form.bookingTime}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <label>
          Alamat Pelanggan
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            rows="3"
            required
          />
        </label>

        <label>
          Deskripsi Masalah
          <textarea
            name="problemDescription"
            value={form.problemDescription}
            onChange={handleChange}
            rows="4"
            placeholder="Jelaskan kerusakan atau kebutuhan jasa secara singkat."
            required
          />
        </label>

        <div className="booking-summary">
          <span>
            <MaterialIcon name="fact_check" />
            Estimasi Total Harga
          </span>
          <strong>Rp{totalPrice.toLocaleString('id-ID')}</strong>
        </div>

        <button type="submit" disabled={submitting || !services.length}>
          <MaterialIcon name="event_note" size="sm" />
          {submitting ? 'Mengirim Pesanan...' : 'Kirim Pesanan'}
        </button>
      </form>
    </section>
  );
}

export default CustomerBookingPage;
