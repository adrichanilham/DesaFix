import { useEffect, useMemo, useState } from 'react';
import MaterialIcon from '../../components/MaterialIcon.jsx';
import { getUsers, updateUserActiveStatus } from '../../services/userService.js';

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadUsers() {
      try {
        setLoading(true);
        const userData = await getUsers();
        if (!ignore) {
          setUsers(userData);
        }
      } catch (loadError) {
        if (!ignore) {
          setError('Gagal memuat daftar user.');
          console.error(loadError);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      ignore = true;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesKeyword =
        !keyword ||
        user.name?.toLowerCase().includes(keyword) ||
        user.email?.toLowerCase().includes(keyword);
      const matchesRole = roleFilter ? user.role === roleFilter : true;
      return matchesKeyword && matchesRole;
    });
  }, [roleFilter, search, users]);

  async function handleToggleActive(user) {
    const currentStatus = user.activeStatus ?? true;
    const nextStatus = !currentStatus;
    const confirmed = window.confirm(
      `${nextStatus ? 'Aktifkan' : 'Nonaktifkan'} user ${user.name || user.email}?`,
    );
    if (!confirmed) return;

    try {
      setUpdatingId(user.uid);
      setError('');
      setSuccess('');
      await updateUserActiveStatus(user.uid, nextStatus);
      setUsers((current) =>
        current.map((item) =>
          item.uid === user.uid ? { ...item, activeStatus: nextStatus } : item,
        ),
      );
      setSuccess('Status user berhasil diperbarui.');
    } catch (updateError) {
      setError(updateError.message || 'Gagal memperbarui status user.');
    } finally {
      setUpdatingId('');
    }
  }

  return (
    <section className="admin-page">
      <div className="page-panel">
        <p className="eyebrow">Admin</p>
        <h1>Kelola Pengguna</h1>
        <p>Cari user, filter berdasarkan role, dan atur status aktif akun.</p>
      </div>

      {error && <p className="form-message error">{error}</p>}
      {success && <p className="form-message success">{success}</p>}

      <div className="admin-filter-bar">
        <label>
          Cari Nama atau Email
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari user..."
          />
        </label>
        <label>
          Role
          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
            <option value="">Semua role</option>
            <option value="customer">Customer</option>
            <option value="tukang">Tukang</option>
            <option value="admin">Admin</option>
          </select>
        </label>
      </div>

      <div className="admin-table-list">
        {loading && <p>Memuat user...</p>}
        {!loading && !filteredUsers.length && <p>Tidak ada user yang cocok.</p>}
        {!loading &&
          filteredUsers.map((user) => {
            const activeStatus = user.activeStatus ?? true;
            return (
              <article className="admin-list-card" key={user.uid}>
                <div>
                  <p className="eyebrow">{user.role || 'user'}</p>
                  <h2>{user.name || 'Tanpa nama'}</h2>
                  <p>Email  : {user.email} <br /> No hp : {user.phone || 'Nomor HP belum diisi'}</p>
                </div>
                <div className="admin-card-side">
                  <span className={`status-badge ${activeStatus ? 'status-completed' : 'status-cancelled'}`}>
                    {activeStatus ? 'Aktif' : 'Nonaktif'}
                  </span>
                  <button
                    type="button"
                    className={activeStatus ? 'danger-button' : ''}
                    disabled={updatingId === user.uid}
                    onClick={() => handleToggleActive(user)}
                  >
                    <MaterialIcon
                      name={activeStatus ? 'cancel' : 'check_circle'}
                      size="sm"
                    />
                    {updatingId === user.uid
                      ? 'Memproses...'
                      : activeStatus
                        ? 'Nonaktifkan'
                        : 'Aktifkan'}
                  </button>
                </div>
              </article>
            );
          })}
      </div>
    </section>
  );
}

export default AdminUsersPage;
