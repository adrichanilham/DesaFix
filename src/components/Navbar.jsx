import { NavLink } from 'react-router-dom';
import MaterialIcon from './MaterialIcon.jsx';

function Navbar() {
  return (
    <header className="navbar">
      <NavLink to="/" className="brand">
        <span className="brand-mark">
          <MaterialIcon name="build" filled />
        </span>
        DesaFix
      </NavLink>
      <nav className="navbar-links" aria-label="Navigasi publik">
        <NavLink to="/">
          <MaterialIcon name="home" size="sm" />
          Beranda
        </NavLink>
        <NavLink to="/services">
          <MaterialIcon name="category" size="sm" />
          Layanan
        </NavLink>
        <NavLink to="/login">
          <MaterialIcon name="login" size="sm" />
          Masuk
        </NavLink>
        <NavLink to="/register">
          <MaterialIcon name="person_add" size="sm" />
          Daftar
        </NavLink>
      </nav>
    </header>
  );
}

export default Navbar;
