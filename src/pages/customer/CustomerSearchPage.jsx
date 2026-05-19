import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MaterialIcon from '../../components/MaterialIcon.jsx';
import { getCategories } from '../../services/categoryService.js';
import { getAvailableTukangProfiles } from '../../services/tukangService.js';

function CustomerSearchPage() {
  const location = useLocation();
  const [tukangProfiles, setTukangProfiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    name: '',
    categoryId: location.state?.categoryId || '',
    serviceArea: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadSearchData() {
      try {
        setLoading(true);
        const [profiles, categoryData] = await Promise.all([
          getAvailableTukangProfiles(),
          getCategories(),
        ]);

        if (!ignore) {
          setTukangProfiles(profiles);
          setCategories(categoryData);
        }
      } catch (searchError) {
        if (!ignore) {
          setError('Gagal memuat daftar tukang.');
          console.error(searchError);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadSearchData();

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

  const filteredTukang = useMemo(() => {
    const nameKeyword = filters.name.trim().toLowerCase();
    const areaKeyword = filters.serviceArea.trim().toLowerCase();

    return tukangProfiles.filter((profile) => {
      const matchesName = profile.name?.toLowerCase().includes(nameKeyword);
      const matchesCategory = filters.categoryId ? profile.categoryId === filters.categoryId : true;
      const matchesArea = areaKeyword
        ? profile.serviceArea?.toLowerCase().includes(areaKeyword) ||
          profile.address?.toLowerCase().includes(areaKeyword)
        : true;

      return matchesName && matchesCategory && matchesArea;
    });
  }, [filters, tukangProfiles]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  return (
    <section className="customer-page">
      <div className="page-panel">
        <p className="eyebrow">Customer</p>
        <h1>Cari Tukang</h1>
        <p>Cari tukang verified yang aktif berdasarkan nama, kategori, atau area layanan.</p>
      </div>

      <form className="search-panel">
        <label>
          Nama Tukang
          <input
            type="search"
            name="name"
            value={filters.name}
            onChange={handleChange}
            placeholder="Contoh: Budi"
          />
        </label>
        <label>
          Kategori
          <select name="categoryId" value={filters.categoryId} onChange={handleChange}>
            <option value="">Semua kategori</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Lokasi atau Area Layanan
          <input
            type="search"
            name="serviceArea"
            value={filters.serviceArea}
            onChange={handleChange}
            placeholder="Contoh: Sukamaju"
          />
        </label>
      </form>

      {error && <p className="form-message error">{error}</p>}

      <div className="tukang-card-grid">
        {loading && <p>Memuat daftar tukang...</p>}
        {!loading &&
          filteredTukang.map((profile) => (
            <article className="tukang-card" key={profile.id}>
              <div className="tukang-photo">
                {profile.photoURL ? (
                  <img src={profile.photoURL} alt={profile.name} />
                ) : (
                  <MaterialIcon name="engineering" size="lg" />
                )}
              </div>
              <div className="tukang-card-body">
                <p className="eyebrow">{categoryMap[profile.categoryId] || 'Kategori'}</p>
                <h2>{profile.name}</h2>
                <p>{profile.serviceArea || profile.address || 'Area layanan belum diisi.'}</p>
                <div className="tukang-meta">
                  <span>
                    <MaterialIcon name="fact_check" size="sm" />
                    {profile.priceEstimation || 'Harga menyesuaikan'}
                  </span>
                  <span>
                    <MaterialIcon name="star" size="sm" filled />
                    Rating {Number(profile.ratingAverage || 0).toFixed(1)}
                  </span>
                </div>
                <div className="tukang-actions">
                  <Link to={`/tukang/${profile.id}`}>
                    <MaterialIcon name="account_circle" size="sm" />
                    Detail
                  </Link>
                  <Link to={`/customer/booking/${profile.uid}`}>
                    <MaterialIcon name="event_note" size="sm" />
                    Pesan Jasa
                  </Link>
                </div>
              </div>
            </article>
          ))}
        {!loading && !filteredTukang.length && (
          <p>Tidak ada tukang verified dan aktif yang cocok dengan pencarian.</p>
        )}
      </div>
    </section>
  );
}

export default CustomerSearchPage;
