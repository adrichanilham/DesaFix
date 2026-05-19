import { useEffect, useState } from 'react';
import MaterialIcon from '../../components/MaterialIcon.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getCategories } from '../../services/categoryService.js';
import {
  createService,
  deleteService,
  getServicesByTukang,
  updateService,
} from '../../services/serviceService.js';

const emptyServiceForm = {
  categoryId: '',
  name: '',
  description: '',
  price: '',
};

function TukangServicesPage() {
  const { currentUser } = useAuth();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyServiceForm);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadServices() {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [serviceData, categoryData] = await Promise.all([
          getServicesByTukang(currentUser.uid),
          getCategories(),
        ]);

        if (!ignore) {
          setServices(serviceData);
          setCategories(categoryData);
        }
      } catch (loadError) {
        if (!ignore) {
          setError('Gagal memuat layanan.');
          console.error(loadError);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadServices();

    return () => {
      ignore = true;
    };
  }, [currentUser?.uid]);

  function getCategoryName(categoryId) {
    return categories.find((category) => category.id === categoryId)?.name || 'Kategori';
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function resetForm() {
    setForm(emptyServiceForm);
    setEditingId('');
  }

  function validateForm() {
    if (!form.categoryId) return 'Kategori jasa wajib dipilih.';
    if (!form.name.trim()) return 'Nama layanan wajib diisi.';
    if (!form.description.trim()) return 'Deskripsi layanan wajib diisi.';
    if (!form.price || Number(form.price) < 0) return 'Harga layanan wajib diisi.';
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

    try {
      setSaving(true);
      const payload = {
        tukangUid: currentUser.uid,
        categoryId: form.categoryId,
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
      };

      if (editingId) {
        await updateService(editingId, payload);
        setServices((current) =>
          current.map((service) => (service.id === editingId ? { ...service, ...payload } : service)),
        );
        setSuccess('Layanan berhasil diperbarui.');
      } else {
        const createdService = await createService(payload);
        setServices((current) => [createdService, ...current]);
        setSuccess('Layanan berhasil ditambahkan.');
      }

      resetForm();
    } catch (saveError) {
      setError(saveError.message || 'Gagal menyimpan layanan.');
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(service) {
    setEditingId(service.id);
    setForm({
      categoryId: service.categoryId || '',
      name: service.name || '',
      description: service.description || '',
      price: service.price || '',
    });
    setError('');
    setSuccess('');
  }

  async function handleDelete(serviceId) {
    const confirmed = window.confirm('Hapus layanan ini?');
    if (!confirmed) return;

    try {
      await deleteService(serviceId);
      setServices((current) => current.filter((service) => service.id !== serviceId));
      setSuccess('Layanan berhasil dihapus.');
    } catch (deleteError) {
      setError(deleteError.message || 'Gagal menghapus layanan.');
    }
  }

  return (
    <section className="tukang-management-page">
      <div className="page-panel">
        <p className="eyebrow">Tukang</p>
        <h1>Layanan Saya</h1>
        <p>Tambah, edit, dan hapus layanan yang bisa dipesan customer.</p>
      </div>

      {error && <p className="form-message error">{error}</p>}
      {success && <p className="form-message success">{success}</p>}

      <form className="management-form" onSubmit={handleSubmit}>
        <div className="profile-form-grid">
          <label>
            Kategori Jasa
            <select name="categoryId" value={form.categoryId} onChange={handleChange} required>
              <option value="">Pilih kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Nama Layanan
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
        </div>
        <label>
          Deskripsi
          <textarea name="description" value={form.description} onChange={handleChange} rows="3" required />
        </label>
        <label>
          Harga
          <input
            type="number"
            min="0"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
          />
        </label>
        <div className="management-actions">
          <button type="submit" disabled={saving}>
            <MaterialIcon name={editingId ? 'save' : 'add'} size="sm" />
            {saving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tambah Layanan'}
          </button>
          {editingId && (
            <button type="button" className="secondary-button" onClick={resetForm}>
              <MaterialIcon name="cancel" size="sm" />
              Batal Edit
            </button>
          )}
        </div>
      </form>

      <div className="management-list">
        {loading && <p>Memuat layanan...</p>}
        {!loading && !services.length && <p>Belum ada layanan.</p>}
        {!loading &&
          services.map((service) => (
            <article className="management-card" key={service.id}>
              <div>
                <p className="eyebrow">{getCategoryName(service.categoryId)}</p>
                <h2>{service.name}</h2>
                <p>{service.description}</p>
                <strong>Rp{Number(service.price || 0).toLocaleString('id-ID')}</strong>
              </div>
              <div className="management-card-actions">
                <button type="button" onClick={() => handleEdit(service)}>
                  <MaterialIcon name="edit" size="sm" />
                  Edit
                </button>
                <button type="button" className="danger-button" onClick={() => handleDelete(service.id)}>
                  <MaterialIcon name="delete" size="sm" />
                  Hapus
                </button>
              </div>
            </article>
          ))}
      </div>
    </section>
  );
}

export default TukangServicesPage;
