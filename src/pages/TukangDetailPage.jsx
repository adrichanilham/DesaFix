import { useParams } from 'react-router-dom';
import MaterialIcon from '../components/MaterialIcon.jsx';

const tukangProfiles = {
  1: {
    name: 'Pak Budi Santoso',
    category: 'Tukang Listrik',
    rating: '4.8',
    location: 'Desa Sukamaju',
    experience: '8 tahun pengalaman',
    price: 'Mulai Rp75.000',
    description:
      'Melayani perbaikan instalasi listrik rumah, lampu, stop kontak, MCB, dan pengecekan gangguan arus.',
  },
  2: {
    name: 'Pak Hasan Wiratama',
    category: 'Tukang Bangunan',
    rating: '4.7',
    location: 'Desa Mekarsari',
    experience: '10 tahun pengalaman',
    price: 'Mulai Rp120.000',
    description:
      'Menerima perbaikan rumah, renovasi ringan, pemasangan keramik, plester, dan perbaikan atap.',
  },
};

function TukangDetailPage() {
  const { id } = useParams();
  const profile = tukangProfiles[id] || {
    name: `Tukang DesaFix ${id}`,
    category: 'Layanan Perbaikan',
    rating: '4.6',
    location: 'Sekitar desa Anda',
    experience: 'Berpengalaman',
    price: 'Harga mengikuti pekerjaan',
    description:
      'Profil publik tukang DesaFix untuk membantu customer melihat layanan, rating, dan informasi dasar sebelum melakukan booking.',
  };

  return (
    <section className="public-page">
      <article className="tukang-profile">
        <div className="profile-avatar" aria-hidden="true">
          <MaterialIcon name="engineering" size="lg" />
        </div>
        <div className="profile-content">
          <p className="eyebrow">{profile.category}</p>
          <h1>{profile.name}</h1>
          <p>{profile.description}</p>
          <div className="profile-stats">
            <div>
              <strong>
                <MaterialIcon name="star" size="sm" filled />
                {profile.rating}
              </strong>
              <span>Rating</span>
            </div>
            <div>
              <strong>
                <MaterialIcon name="location_on" size="sm" />
                {profile.location}
              </strong>
              <span>Area</span>
            </div>
            <div>
              <strong>
                <MaterialIcon name="fact_check" size="sm" />
                {profile.price}
              </strong>
              <span>Estimasi</span>
            </div>
          </div>
        </div>
      </article>

      <section className="content-section">
        <div className="section-heading">
          <p className="eyebrow">Profil</p>
          <h2>Informasi Tukang</h2>
        </div>
        <div className="detail-grid">
          <article>
            <MaterialIcon name="verified_user" className="icon-accent" />
            <h3>Pengalaman</h3>
            <p>{profile.experience}</p>
          </article>
          <article>
            <MaterialIcon name="build" className="icon-accent" />
            <h3>Layanan</h3>
            <p>{profile.category}</p>
          </article>
          <article>
            <MaterialIcon name="calendar_month" className="icon-accent" />
            <h3>Ketersediaan</h3>
            <p>Jadwal dapat dikonfirmasi melalui pemesanan DesaFix.</p>
          </article>
        </div>
      </section>
    </section>
  );
}

export default TukangDetailPage;
