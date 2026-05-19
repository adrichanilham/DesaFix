import { useEffect, useState } from 'react';
import MaterialIcon from '../../components/MaterialIcon.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  createSchedule,
  deleteSchedule,
  getSchedulesByTukang,
  updateSchedule,
} from '../../services/scheduleService.js';

const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const emptyScheduleForm = {
  day: 'Senin',
  startTime: '',
  endTime: '',
  availableStatus: 'true',
};

function TukangSchedulePage() {
  const { currentUser } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [form, setForm] = useState(emptyScheduleForm);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadSchedules() {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const scheduleData = await getSchedulesByTukang(currentUser.uid);
        if (!ignore) {
          setSchedules(scheduleData);
        }
      } catch (loadError) {
        if (!ignore) {
          setError('Gagal memuat jadwal kerja.');
          console.error(loadError);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadSchedules();

    return () => {
      ignore = true;
    };
  }, [currentUser?.uid]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function resetForm() {
    setForm(emptyScheduleForm);
    setEditingId('');
  }

  function validateForm() {
    if (!form.day) return 'Hari wajib dipilih.';
    if (!form.startTime) return 'Jam mulai wajib diisi.';
    if (!form.endTime) return 'Jam selesai wajib diisi.';
    if (form.startTime >= form.endTime) return 'Jam selesai harus setelah jam mulai.';
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
        day: form.day,
        startTime: form.startTime,
        endTime: form.endTime,
        availableStatus: form.availableStatus === 'true',
      };

      if (editingId) {
        await updateSchedule(editingId, payload);
        setSchedules((current) =>
          current.map((schedule) => (schedule.id === editingId ? { ...schedule, ...payload } : schedule)),
        );
        setSuccess('Jadwal berhasil diperbarui.');
      } else {
        const createdSchedule = await createSchedule(payload);
        setSchedules((current) => [createdSchedule, ...current]);
        setSuccess('Jadwal berhasil ditambahkan.');
      }

      resetForm();
    } catch (saveError) {
      setError(saveError.message || 'Gagal menyimpan jadwal.');
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(schedule) {
    setEditingId(schedule.id);
    setForm({
      day: schedule.day || 'Senin',
      startTime: schedule.startTime || '',
      endTime: schedule.endTime || '',
      availableStatus: String(schedule.availableStatus ?? true),
    });
    setError('');
    setSuccess('');
  }

  async function handleDelete(scheduleId) {
    const confirmed = window.confirm('Hapus jadwal ini?');
    if (!confirmed) return;

    try {
      await deleteSchedule(scheduleId);
      setSchedules((current) => current.filter((schedule) => schedule.id !== scheduleId));
      setSuccess('Jadwal berhasil dihapus.');
    } catch (deleteError) {
      setError(deleteError.message || 'Gagal menghapus jadwal.');
    }
  }

  return (
    <section className="tukang-management-page">
      <div className="page-panel">
        <p className="eyebrow">Tukang</p>
        <h1>Jadwal Kerja</h1>
        <p>Atur hari dan jam kerja agar customer tahu kapan Anda tersedia.</p>
      </div>

      {error && <p className="form-message error">{error}</p>}
      {success && <p className="form-message success">{success}</p>}

      <form className="management-form" onSubmit={handleSubmit}>
        <div className="profile-form-grid">
          <label>
            Hari
            <select name="day" value={form.day} onChange={handleChange} required>
              {days.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select name="availableStatus" value={form.availableStatus} onChange={handleChange}>
              <option value="true">Tersedia</option>
              <option value="false">Tidak tersedia</option>
            </select>
          </label>
        </div>
        <div className="profile-form-grid">
          <label>
            Jam Mulai
            <input type="time" name="startTime" value={form.startTime} onChange={handleChange} required />
          </label>
          <label>
            Jam Selesai
            <input type="time" name="endTime" value={form.endTime} onChange={handleChange} required />
          </label>
        </div>
        <div className="management-actions">
          <button type="submit" disabled={saving}>
            <MaterialIcon name={editingId ? 'save' : 'add'} size="sm" />
            {saving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tambah Jadwal'}
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
        {loading && <p>Memuat jadwal...</p>}
        {!loading && !schedules.length && <p>Belum ada jadwal kerja.</p>}
        {!loading &&
          schedules.map((schedule) => (
            <article className="management-card" key={schedule.id}>
              <div>
                <p className="eyebrow">{schedule.day}</p>
                <h2>
                  <MaterialIcon name="schedule" size="sm" />
                  {schedule.startTime} - {schedule.endTime}
                </h2>
                <p>{schedule.availableStatus ? 'Tersedia' : 'Tidak tersedia'}</p>
              </div>
              <div className="management-card-actions">
                <button type="button" onClick={() => handleEdit(schedule)}>
                  <MaterialIcon name="edit" size="sm" />
                  Edit
                </button>
                <button type="button" className="danger-button" onClick={() => handleDelete(schedule.id)}>
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

export default TukangSchedulePage;
