import { Link } from 'react-router-dom';
import MaterialIcon from '../components/MaterialIcon.jsx';

const services = [
  {
    name: 'Tukang Listrik',
    description: 'Perbaikan instalasi listrik, stop kontak, lampu, dan pengecekan arus.',
    icon: 'electric_bolt',
  },
  {
    name: 'Tukang Bangunan',
    description: 'Perbaikan rumah, renovasi ringan, dinding, lantai, dan atap.',
    icon: 'construction',
  },
  {
    name: 'Servis Pompa Air',
    description: 'Pengecekan pompa air, pipa, sumur, dan aliran air rumah.',
    icon: 'water_pump',
  },
  {
    name: 'Servis Motor',
    description: 'Perawatan motor, perbaikan ringan, dan pengecekan kendaraan harian.',
    icon: 'two_wheeler',
  },
  {
    name: 'Servis Elektronik',
    description: 'Perbaikan alat elektronik rumah tangga seperti kipas, TV, dan speaker.',
    icon: 'devices',
  },
];

function ServicesPage() {
  return (
    <section className="public-page">
      <div className="page-panel">
        <p className="eyebrow">Layanan</p>
        <h1>Kategori Layanan DesaFix</h1>
        <p>
          Pilih kategori jasa yang dibutuhkan, lalu lihat tukang yang tersedia
          di sekitar desa Anda.
        </p>
      </div>

      <div className="service-list">
        {services.map((service, index) => (
          <article className="service-row" key={service.name}>
            <div>
              <span className="service-number">
                <MaterialIcon name={service.icon} />
                {String(index + 1).padStart(2, '0')}
              </span>
              <h2>{service.name}</h2>
              <p>{service.description}</p>
            </div>
            <Link to={`/tukang/${index + 1}`}>
              Lihat Contoh Tukang
              <MaterialIcon name="arrow_forward" size="sm" />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ServicesPage;
