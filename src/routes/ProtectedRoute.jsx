import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getDashboardPath } from '../utils/roleRedirect.js';

function ProtectedRoute({ allowedRoles, children }) {
  const { currentUser, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className="app-shell">
        <section className="page-panel">
          <p>Memuat sesi...</p>
        </section>
      </main>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(role)) {
    return <Navigate to={getDashboardPath(role)} replace />;
  }

  return children;
}

export default ProtectedRoute;
