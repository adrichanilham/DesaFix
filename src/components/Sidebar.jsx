import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import MaterialIcon from './MaterialIcon.jsx';

const sidebarMenus = {
  admin: [
    { label: 'Dashboard', to: '/admin/dashboard', icon: 'dashboard' },
    { label: 'Kelola User', to: '/admin/users', icon: 'group' },
    { label: 'Kelola Tukang', to: '/admin/tukang', icon: 'engineering' },
    { label: 'Kategori Jasa', to: '/admin/categories', icon: 'category' },
    { label: 'Pemesanan', to: '/admin/bookings', icon: 'event_note' },
    { label: 'Laporan', to: '/admin/reports', icon: 'monitoring' },
  ],
  customer: [
    { label: 'Dashboard', to: '/customer/dashboard', icon: 'dashboard' },
    { label: 'Cari Tukang', to: '/customer/search', icon: 'search' },
    { label: 'Riwayat Pesanan', to: '/customer/history', icon: 'event_note' },
  ],
  tukang: [
    { label: 'Dashboard', to: '/tukang/dashboard', icon: 'dashboard' },
    { label: 'Profil Tukang', to: '/tukang/profile', icon: 'account_circle' },
    { label: 'Layanan Saya', to: '/tukang/services', icon: 'build' },
    { label: 'Jadwal Kerja', to: '/tukang/schedule', icon: 'calendar_month' },
    { label: 'Pesanan Masuk', to: '/tukang/orders', icon: 'event_note' },
  ],
};

function Sidebar({ role }) {
  const { logout, userData } = useAuth();
  const navigate = useNavigate();
  const menus = sidebarMenus[role] || [];

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <NavLink to="/" className="brand">
          <span className="brand-mark">
            <MaterialIcon name="build" filled />
          </span>
          DesaFix
        </NavLink>
        <p>{userData?.name || role}</p>
      </div>
      <nav className="sidebar-nav" aria-label={`Menu ${role}`}>
        {menus.map((item) => (
          <NavLink key={item.to} to={item.to}>
            <MaterialIcon name={item.icon} size="sm" />
            {item.label}
          </NavLink>
        ))}
        <button type="button" onClick={handleLogout}>
          <MaterialIcon name="logout" size="sm" />
          Logout
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;
