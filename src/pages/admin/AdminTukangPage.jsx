import { useEffect, useMemo, useState } from 'react';
import MaterialIcon from '../../components/MaterialIcon.jsx';
import { getCategories } from '../../services/categoryService.js';
import { createNotification } from '../../services/notificationService.js';
import {
  getTukangProfiles,
  rejectTukangProfile,
  updateTukangActiveStatus,
  verifyTukangProfile,
} from '../../services/tukangService.js';

function AdminTukangPage() {
  const [profiles, setProfiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadTukang() {
      try {
        setLoading(true);
        const [profileData, categoryData] = await Promise.all([
          getTukangProfiles(),
          getCategories(),
        ]);
        if (!ignore) {
          setProfiles(profileData);
          setCategories(categoryData);
        }
      } catch (loadError) {
        if (!ignore) {
          setError('Gagal memuat daftar tukang.');
          console.error(loadError);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadTukang();

    return () => {
      ignore = true;
    };
  }, []);

  const categoryMap = useMemo(
    () =>
      categories.reduce((map, category) => {
        map[category.id] = category.name;
        return map;
      }, {}),
    [categories],
  );

  const filteredProfiles = useMemo(
    () =>
      statusFilter
        ? profiles.filter((profile) => profile.verificationStatus === statusFilter)
        : profiles,
    [profiles, statusFilter],
  );

  function updateProfileState(profileId, patch) {
    setProfiles((current) =>
      current.map((profile) => (profile.id === profileId ? { ...profile, ...patch } : profile)),
    );
    setSelectedProfile((current) =>
      current?.id === profileId ? { ...current, ...patch } : current,
    );
  }

  async function handleVerify(profile) {
    const confirmed = window.confirm(`Verifikasi tukang ${profile.name}?`);
    if (!confirmed) return;

    try {
      setUpdatingId(profile.id);
      setError('');
      setSuccess('');
      await verifyTukangProfile(profile.id);
      await createNotification({
        receiverUid: profile.uid,
        title: 'Profil tukang diverifikasi',
        message: 'Profil Anda sudah diverifikasi admin dan aktif tampil di pencarian customer.',
        type: 'verification',
        readStatus: false,
      });
      updateProfileState(profile.id, {
        verificationStatus: 'verified',
        activeStatus: true,
      });
      setSuccess('Tukang berhasil diverifikasi dan diaktifkan.');
    } catch (verifyError) {
      setError(verifyError.message || 'Gagal memverifikasi tukang.');
    } finally {
      setUpdatingId('');
    }
  }

  async function handleReject(profile) {
    const confirmed = window.confirm(`Tolak verifikasi tukang ${profile.name}?`);
    if (!confirmed) return;

    try {
      setUpdatingId(profile.id);
      setError('');
      setSuccess('');
      await rejectTukangProfile(profile.id);
      await createNotification({
        receiverUid: profile.uid,
        title: 'Verifikasi profil ditolak',
        message: 'Profil tukang Anda ditolak admin. Perbarui data profil lalu ajukan kembali.',
        type: 'verification',
        readStatus: false,
      });
      updateProfileState(profile.id, {
        verificationStatus: 'rejected',
        activeStatus: false,
      });
      setSuccess('Verifikasi tukang ditolak dan status dinonaktifkan.');
    } catch (rejectError) {
      setError(rejectError.message || 'Gagal menolak verifikasi tukang.');
    } finally {
      setUpdatingId('');
    }
  }

  async function handleToggleActive(profile) {
    const nextStatus = !profile.activeStatus;
    const confirmed = window.confirm(
      `${nextStatus ? 'Aktifkan' : 'Nonaktifkan'} tukang ${profile.name}?`,
    );
    if (!confirmed) return;

    try {
      setUpdatingId(profile.id);
      setError('');
      setSuccess('');
      await updateTukangActiveStatus(profile.id, nextStatus);
      updateProfileState(profile.id, { activeStatus: nextStatus });
      setSuccess('Status aktif tukang berhasil diperbarui.');
    } catch (activeError) {
      setError(activeError.message || 'Gagal memperbarui status aktif tukang.');
    } finally {
      setUpdatingId('');
    }
  }

  return (
    <section className="admin-page">
      <div className="page-panel">
        <p className="eyebrow">Admin</p>
        <h1>Kelola Tukang</h1>
        <p>Review profil tukang, verifikasi, tolak, dan atur status aktif.</p>
      </div>

      {error && <p className="form-message error">{error}</p>}
      {success && <p className="form-message success">{success}</p>}

      <div className="admin-filter-bar">
        <label>
          Status Verifikasi
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">Semua status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>
      </div>

      <div className="admin-split">
        <div className="admin-table-list">
          {loading && <p>Memuat tukang...</p>}
          {!loading && !filteredProfiles.length && <p>Tidak ada profil tukang.</p>}
          {!loading &&
            filteredProfiles.map((profile) => (
              <article className="admin-list-card" key={profile.id}>
                <div>
                  <p className="eyebrow">{categoryMap[profile.categoryId] || 'Kategori'}</p>
                  <h2>{profile.name || 'Tanpa nama'}</h2>
                  <p>{profile.serviceArea || profile.address || 'Area belum diisi'}</p>
                  <span className={`status-badge status-${profile.verificationStatus}`}>
                    {profile.verificationStatus}
                  </span>
                </div>
                <div className="admin-card-side">
                  <button type="button" onClick={() => setSelectedProfile(profile)}>
                    <MaterialIcon name="account_circle" size="sm" />
                    Detail
                  </button>
                  <button
                    type="button"
                    disabled={updatingId === profile.id}
                    onClick={() => handleVerify(profile)}
                  >
                    <MaterialIcon name="verified_user" size="sm" />
                    Verifikasi
                  </button>
                  <button
                    type="button"
                    className="danger-button"
                    disabled={updatingId === profile.id}
                    onClick={() => handleReject(profile)}
                  >
                    <MaterialIcon name="cancel" size="sm" />
                    Tolak
                  </button>
                  <button
                    type="button"
                    className={profile.activeStatus ? 'danger-button' : ''}
                    disabled={updatingId === profile.id}
                    onClick={() => handleToggleActive(profile)}
                  >
                    <MaterialIcon
                      name={profile.activeStatus ? 'cancel' : 'check_circle'}
                      size="sm"
                    />
                    {profile.activeStatus ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                </div>
              </article>
            ))}
        </div>

        <aside className="admin-detail-panel">
          {selectedProfile ? (
            <>
              <div className="admin-detail-photo">
                {selectedProfile.photoURL ? (
                  <img src={selectedProfile.photoURL} alt={selectedProfile.name} />
                ) : (
                  <MaterialIcon name="engineering" size="lg" />
                )}
              </div>
              <p className="eyebrow">{categoryMap[selectedProfile.categoryId] || 'Kategori'}</p>
              <h2>{selectedProfile.name}</h2>
              <p>{selectedProfile.description || 'Deskripsi belum diisi.'}</p>
              <dl>
                <div>
                  <dt>HP</dt>
                  <dd>{selectedProfile.phone || '-'}</dd>
                </div>
                <div>
                  <dt>Alamat</dt>
                  <dd>{selectedProfile.address || '-'}</dd>
                </div>
                <div>
                  <dt>Skill</dt>
                  <dd>{selectedProfile.skill || '-'}</dd>
                </div>
                <div>
                  <dt>Pengalaman</dt>
                  <dd>{selectedProfile.experience || '-'}</dd>
                </div>
                <div>
                  <dt>Area Layanan</dt>
                  <dd>{selectedProfile.serviceArea || '-'}</dd>
                </div>
                <div>
                  <dt>Estimasi Harga</dt>
                  <dd>{selectedProfile.priceEstimation || '-'}</dd>
                </div>
                <div>
                  <dt>Status Aktif</dt>
                  <dd>{selectedProfile.activeStatus ? 'Aktif' : 'Tidak aktif'}</dd>
                </div>
              </dl>
            </>
          ) : (
            <p>Pilih salah satu tukang untuk melihat detail profil.</p>
          )}
        </aside>
      </div>
    </section>
  );
}

export default AdminTukangPage;
