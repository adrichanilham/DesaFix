import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useEffect, useState } from 'react';
import MaterialIcon from '../../components/MaterialIcon.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { storage } from '../../firebase/firebaseConfig.js';
import { getCategories } from '../../services/categoryService.js';
import {
  createTukangProfile,
  getTukangProfileByUid,
  updateTukangProfile,
} from '../../services/tukangService.js';

const initialForm = {
  name: '',
  phone: '',
  address: '',
  categoryId: '',
  skill: '',
  description: '',
  experience: '',
  serviceArea: '',
  priceEstimation: '',
  photoURL: '',
};
const maxImageSize = 2 * 1024 * 1024;

function TukangProfilePage() {
  const { currentUser, userData } = useAuth();
  const [profile, setProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [photoFile, setPhotoFile] = useState(null);
  const [previewURL, setPreviewURL] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadProfileForm() {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const [profileData, categoryData] = await Promise.all([
          getTukangProfileByUid(currentUser.uid),
          getCategories(),
        ]);

        if (!ignore) {
          setProfile(profileData);
          setCategories(categoryData);
          setForm({
            name: profileData?.name || userData?.name || currentUser.displayName || '',
            phone: profileData?.phone || userData?.phone || '',
            address: profileData?.address || userData?.address || '',
            categoryId: profileData?.categoryId || '',
            skill: profileData?.skill || '',
            description: profileData?.description || '',
            experience: profileData?.experience || '',
            serviceArea: profileData?.serviceArea || '',
            priceEstimation: profileData?.priceEstimation || '',
            photoURL: profileData?.photoURL || '',
          });
          setPreviewURL(profileData?.photoURL || '');
        }
      } catch (profileError) {
        if (!ignore) {
          setError('Gagal memuat profil tukang.');
          console.error(profileError);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadProfileForm();

    return () => {
      ignore = true;
    };
  }, [currentUser?.uid, currentUser?.displayName, userData?.address, userData?.name, userData?.phone]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      setPhotoFile(null);
      setPreviewURL(form.photoURL);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('File foto harus berupa gambar.');
      event.target.value = '';
      return;
    }

    if (file.size > maxImageSize) {
      setError('Ukuran foto maksimal 2 MB.');
      event.target.value = '';
      return;
    }

    setError('');
    setPhotoFile(file || null);
    setPreviewURL(file ? URL.createObjectURL(file) : form.photoURL);
  }

  function validateForm() {
    if (!form.name.trim()) return 'Nama wajib diisi.';
    if (!form.phone.trim()) return 'Nomor HP wajib diisi.';
    if (!form.address.trim()) return 'Alamat wajib diisi.';
    if (!form.categoryId) return 'Kategori jasa wajib dipilih.';
    if (!form.skill.trim()) return 'Skill wajib diisi.';
    if (!form.description.trim()) return 'Deskripsi wajib diisi.';
    if (!form.experience.trim()) return 'Pengalaman wajib diisi.';
    if (!form.serviceArea.trim()) return 'Area layanan wajib diisi.';
    if (!form.priceEstimation.trim()) return 'Estimasi harga wajib diisi.';
    return '';
  }

  async function uploadProfilePhoto() {
    if (!photoFile) {
      return form.photoURL;
    }

    const extension = photoFile.name.split('.').pop() || 'jpg';
    const photoRef = ref(storage, `tukangProfiles/${currentUser.uid}/profile.${extension}`);
    await uploadBytes(photoRef, photoFile);
    return getDownloadURL(photoRef);
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
      const photoURL = await uploadProfilePhoto();
      const payload = {
        uid: currentUser.uid,
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        categoryId: form.categoryId,
        skill: form.skill.trim(),
        description: form.description.trim(),
        experience: form.experience.trim(),
        serviceArea: form.serviceArea.trim(),
        priceEstimation: form.priceEstimation.trim(),
        photoURL,
      };

      if (profile?.id) {
        await updateTukangProfile(profile.id, payload);
        setProfile((current) => ({ ...current, ...payload }));
        setSuccess('Profil tukang berhasil diperbarui.');
      } else {
        const createdProfile = await createTukangProfile({
          ...payload,
          verificationStatus: 'pending',
          activeStatus: false,
        });
        setProfile(createdProfile);
        setSuccess('Profil berhasil dibuat dan menunggu verifikasi admin.');
      }

      setForm((current) => ({ ...current, photoURL }));
      setPreviewURL(photoURL);
      setPhotoFile(null);
    } catch (saveError) {
      setError(saveError.message || 'Gagal menyimpan profil tukang.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p>Memuat profil tukang...</p>;
  }

  return (
    <section className="tukang-profile-page">
      <div className="page-panel">
        <p className="eyebrow">Tukang</p>
        <h1>Profil Tukang</h1>
        <p>
          Lengkapi data layanan Anda. Profil baru akan berstatus pending dan belum
          aktif sampai diverifikasi admin.
        </p>
      </div>

      {error && <p className="form-message error">{error}</p>}
      {success && <p className="form-message success">{success}</p>}

      {profile && (
        <div className="verification-card">
          <span>
            <MaterialIcon name="verified_user" />
            Status Verifikasi
          </span>
          <strong className={`verification-${profile.verificationStatus}`}>
            {profile.verificationStatus}
          </strong>
          <span>
            <MaterialIcon name="fact_check" />
            Status Aktif
          </span>
          <strong className={profile.activeStatus ? 'verification-verified' : 'verification-pending'}>
            {profile.activeStatus ? 'Aktif' : 'Tidak aktif'}
          </strong>
        </div>
      )}

      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="profile-photo-field">
          <div className="profile-photo-preview">
            {previewURL ? (
              <img src={previewURL} alt="Foto profil tukang" />
            ) : (
              <MaterialIcon name="image" size="lg" />
            )}
          </div>
          <label>
            Foto Profil
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
          </label>
        </div>

        <div className="profile-form-grid">
          <label>
            Nama
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            Nomor HP
            <input name="phone" value={form.phone} onChange={handleChange} required />
          </label>
        </div>

        <label>
          Alamat
          <textarea name="address" value={form.address} onChange={handleChange} rows="3" required />
        </label>

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
            Estimasi Harga
            <input
              name="priceEstimation"
              value={form.priceEstimation}
              onChange={handleChange}
              placeholder="Contoh: Mulai Rp75.000"
              required
            />
          </label>
        </div>

        <label>
          Skill
          <input
            name="skill"
            value={form.skill}
            onChange={handleChange}
            placeholder="Contoh: Instalasi listrik rumah"
            required
          />
        </label>

        <label>
          Deskripsi
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="4"
            required
          />
        </label>

        <div className="profile-form-grid">
          <label>
            Pengalaman
            <input
              name="experience"
              value={form.experience}
              onChange={handleChange}
              placeholder="Contoh: 5 tahun"
              required
            />
          </label>
          <label>
            Area Layanan
            <input
              name="serviceArea"
              value={form.serviceArea}
              onChange={handleChange}
              placeholder="Contoh: Desa Sukamaju dan sekitarnya"
              required
            />
          </label>
        </div>

        <button type="submit" disabled={saving}>
          <MaterialIcon name="save" size="sm" />
          {saving ? 'Menyimpan...' : profile ? 'Simpan Perubahan' : 'Buat Profil'}
        </button>
      </form>
    </section>
  );
}

export default TukangProfilePage;
