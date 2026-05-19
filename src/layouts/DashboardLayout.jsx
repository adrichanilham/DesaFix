import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';

function DashboardLayout({ role }) {
  return (
    <div className="dashboard-layout">
      <Sidebar role={role} />
      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
