import { Link } from 'react-router-dom';
import MaterialIcon from '../components/MaterialIcon.jsx';

const serviceCategories = [
  { name: 'Tukang Listrik', icon: 'electric_bolt' },
  { name: 'Tukang Bangunan', icon: 'construction' },
  { name: 'Servis Pompa Air', icon: 'water_pump' },
  { name: 'Servis Motor', icon: 'two_wheeler' },
  { name: 'Servis Elektronik', icon: 'devices' },
];

const advantages = [
  { label: 'Tukang terpercaya', icon: 'verified_user' },
  { label: 'Harga lebih transparan', icon: 'fact_check' },
  { label: 'Bisa melihat rating', icon: 'star' },
  { label: 'Pemesanan mudah', icon: 'event_note' },
  { label: 'Cocok untuk masyarakat desa', icon: 'favorite' },
];

const steps = [
  {
    title: 'Pilih layanan',
    description: 'Cari kategori jasa yang sesuai dengan kebutuhan perbaikan.',
    icon: 'category',
  },
  {
    title: 'Lihat profil tukang',
    description: 'Bandingkan keahlian, rating, dan area layanan sebelum memesan.',
    icon: 'account_circle',
  },
  {
    title: 'Buat pesanan',
    description: 'Kirim detail pekerjaan lalu tunggu konfirmasi dari tukang.',
    icon: 'event_note',
  },
];

function HomePage() {
  return (
    <div className="public-page">
      <section className="hero public-hero">
        <div>
          <p className="eyebrow">DesaFix</p>
          <h1>Cari Tukang Terpercaya di Sekitar Desa Anda</h1>
          <p>
            DesaFix membantu warga desa menemukan tukang yang sesuai kebutuhan,
            melihat layanan yang tersedia, dan melakukan pemesanan dengan lebih
            mudah.
          </p>
          <nav className="quick-links" aria-label="Aksi utama">
            <Link to="/services" className="primary-link">
              <MaterialIcon name="search" size="sm" />
              Cari Tukang
            </Link>
            <Link to="/register">
              <MaterialIcon name="engineering" size="sm" />
              Daftar Sebagai Tukang
            </Link>
          </nav>
        </div>
        <div className="hero-summary" aria-label="Ringkasan DesaFix">
          <MaterialIcon name="category" size="lg" className="icon-accent" />
          <strong>5+</strong>
          <span>Kategori layanan siap dicari dari satu tempat.</span>
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <p className="eyebrow">Kategori</p>
          <h2>Kategori Layanan</h2>
        </div>
        <div className="card-grid">
          {serviceCategories.map((category) => (
            <Link className="service-card" key={category.name} to="/services">
              <MaterialIcon name={category.icon} size="lg" className="icon-accent" />
              <span>{category.name}</span>
              <small>Lihat tukang tersedia</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <p className="eyebrow">Keunggulan</p>
          <h2>Kenapa Memakai DesaFix?</h2>
        </div>
        <div className="feature-list">
          {advantages.map((advantage) => (
            <div className="feature-item" key={advantage.label}>
              <MaterialIcon name={advantage.icon} filled className="icon-accent" />
              <p>{advantage.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <p className="eyebrow">Cara Kerja</p>
          <h2>Cara Kerja Aplikasi</h2>
        </div>
        <div className="steps-grid">
          {steps.map((step) => (
            <article className="step-card" key={step.title}>
              <span>
                <MaterialIcon name={step.icon} />
              </span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
