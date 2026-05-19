import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useEffect, useState } from 'react';
import MaterialIcon from '../../components/MaterialIcon.jsx';
import { storage } from '../../firebase/firebaseConfig.js';
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../../services/categoryService.js';
import { getServicesByCategory } from '../../services/serviceService.js';
import { getTukangProfilesByCategory } from '../../services/tukangService.js';

const emptyCategoryForm = {
  name: '',
  description: '',
  iconURL: '',
};
const maxIconSize = 2 * 1024 * 1024;

function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyCategoryForm);
  const [editingId, setEditingId] = useState('');
  const [iconFile, setIconFile] = useState(null);
  const [previewURL, setPreviewURL] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadCategories() {
      try {
        setLoading(true);
        const categoryData = await getCategories();
        if (!ignore) {
          setCategories(categoryData);
        }
      } catch (loadError) {
        if (!ignore) {
          setError('Gagal memuat kategori jasa.');
          console.error(loadError);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      ignore = true;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleIconChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      setIconFile(null);
      setPreviewURL(form.iconURL);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Icon kategori harus berupa gambar.');
      event.target.value = '';
      return;
    }

    if (file.size > maxIconSize) {
      setError('Ukuran icon maksimal 2 MB.');
      event.target.value = '';
      return;
    }

    setError('');
    setIconFile(file || null);
    setPreviewURL(file ? URL.createObjectURL(file) : form.iconURL);
  }

  function resetForm() {
    setForm(emptyCategoryForm);
    setEditingId('');
    setIconFile(null);
    setPreviewURL('');
  }

  async function uploadIcon() {
    if (!iconFile) {
      return form.iconURL;
    }

    const safeName = iconFile.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const iconRef = ref(storage, `categoryIcons/${Date.now()}-${safeName}`);
    await uploadBytes(iconRef, iconFile);
    return getDownloadURL(iconRef);
  }

  function validateForm() {
    if (!form.name.trim()) {
      return 'Nama kategori wajib diisi.';
    }

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
      const iconURL = await uploadIcon();
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        iconURL,
      };

      if (editingId) {
        await updateCategory(editingId, payload);
        setCategories((current) =>
          current.map((category) =>
            category.id === editingId ? { ...category, ...payload } : category,
          ),
        );
        setSuccess('Kategori berhasil diperbarui.');
      } else {
        const createdCategory = await createCategory(payload);
        setCategories((current) => [createdCategory, ...current]);
        setSuccess('Kategori berhasil ditambahkan.');
      }

      resetForm();
    } catch (saveError) {
      setError(saveError.message || 'Gagal menyimpan kategori.');
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(category) {
    setEditingId(category.id);
    setForm({
      name: category.name || '',
      description: category.description || '',
      iconURL: category.iconURL || '',
    });
    setIconFile(null);
    setPreviewURL(category.iconURL || '');
    setError('');
    setSuccess('');
  }

  async function handleDelete(category) {
    try {
      setDeletingId(category.id);
      setError('');
      setSuccess('');

      const [usedServices, usedTukangProfiles] = await Promise.all([
        getServicesByCategory(category.id),
        getTukangProfilesByCategory(category.id),
      ]);
      const usageCount = usedServices.length + usedTukangProfiles.length;
      const message = usageCount
        ? `Kategori "${category.name}" masih digunakan oleh ${usedServices.length} layanan dan ${usedTukangProfiles.length} profil tukang. Menghapus kategori dapat membuat data terkait kehilangan referensi. Tetap hapus?`
        : `Hapus kategori "${category.name}"?`;

      const confirmed = window.confirm(message);
      if (!confirmed) return;

      await deleteCategory(category.id);
      setCategories((current) => current.filter((item) => item.id !== category.id));
      if (editingId === category.id) {
        resetForm();
      }
      setSuccess('Kategori berhasil dihapus.');
    } catch (deleteError) {
      setError(deleteError.message || 'Gagal menghapus kategori.');
    } finally {
      setDeletingId('');
    }
  }

  return (
    <section className="admin-page">
      <div className="page-panel">
        <p className="eyebrow">Admin</p>
        <h1>Kelola Kategori</h1>
        <p>Tambah, edit, hapus, dan unggah icon untuk kategori jasa DesaFix.</p>
      </div>

      {error && <p className="form-message error">{error}</p>}
      {success && <p className="form-message success">{success}</p>}

      <form className="management-form" onSubmit={handleSubmit}>
        <div className="profile-photo-field">
          <div className="category-icon-preview">
            {previewURL ? (
              <img src={previewURL} alt="Icon kategori" />
            ) : (
              <MaterialIcon name="image" size="lg" />
            )}
          </div>
          <label>
            Icon Kategori
            <input type="file" accept="image/*" onChange={handleIconChange} />
          </label>
        </div>

        <label>
          Nama Kategori
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>

        <label>
          Deskripsi
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="3"
          />
        </label>

        <div className="management-actions">
          <button type="submit" disabled={saving}>
            <MaterialIcon name={editingId ? 'save' : 'add'} size="sm" />
            {saving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tambah Kategori'}
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
        {loading && <p>Memuat kategori...</p>}
        {!loading && !categories.length && <p>Belum ada kategori jasa.</p>}
        {!loading &&
          categories.map((category) => (
            <article className="management-card category-card" key={category.id}>
              <div className="category-card-main">
                <div className="category-icon-preview category-icon-small">
                  {category.iconURL ? (
                    <img src={category.iconURL} alt={category.name} />
                  ) : (
                    <MaterialIcon name="category" />
                  )}
                </div>
                <div>
                  <p className="eyebrow">Kategori</p>
                  <h2>{category.name}</h2>
                  <p>{category.description || 'Deskripsi belum diisi.'}</p>
                </div>
              </div>
              <div className="management-card-actions">
                <button type="button" onClick={() => handleEdit(category)}>
                  <MaterialIcon name="edit" size="sm" />
                  Edit
                </button>
                <button
                  type="button"
                  className="danger-button"
                  disabled={deletingId === category.id}
                  onClick={() => handleDelete(category)}
                >
                  <MaterialIcon name="delete" size="sm" />
                  {deletingId === category.id ? 'Memeriksa...' : 'Hapus'}
                </button>
              </div>
            </article>
          ))}
      </div>
    </section>
  );
}

export default AdminCategoriesPage;
