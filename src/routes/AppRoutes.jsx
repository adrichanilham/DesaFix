import { Route, Routes } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import PublicLayout from '../layouts/PublicLayout.jsx';
import AdminBookingsPage from '../pages/admin/AdminBookingsPage.jsx';
import AdminCategoriesPage from '../pages/admin/AdminCategoriesPage.jsx';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage.jsx';
import AdminReportsPage from '../pages/admin/AdminReportsPage.jsx';
import AdminTukangPage from '../pages/admin/AdminTukangPage.jsx';
import AdminUsersPage from '../pages/admin/AdminUsersPage.jsx';
import LoginPage from '../pages/auth/LoginPage.jsx';
import RegisterPage from '../pages/auth/RegisterPage.jsx';
import CustomerBookingPage from '../pages/customer/CustomerBookingPage.jsx';
import CustomerChatPage from '../pages/customer/CustomerChatPage.jsx';
import CustomerDashboardPage from '../pages/customer/CustomerDashboardPage.jsx';
import CustomerHistoryPage from '../pages/customer/CustomerHistoryPage.jsx';
import CustomerSearchPage from '../pages/customer/CustomerSearchPage.jsx';
import HomePage from '../pages/HomePage.jsx';
import ServicesPage from '../pages/ServicesPage.jsx';
import TukangDetailPage from '../pages/TukangDetailPage.jsx';
import TukangChatPage from '../pages/tukang/TukangChatPage.jsx';
import TukangDashboardPage from '../pages/tukang/TukangDashboardPage.jsx';
import TukangOrdersPage from '../pages/tukang/TukangOrdersPage.jsx';
import TukangProfilePage from '../pages/tukang/TukangProfilePage.jsx';
import TukangSchedulePage from '../pages/tukang/TukangSchedulePage.jsx';
import TukangServicesPage from '../pages/tukang/TukangServicesPage.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/tukang/:id" element={<TukangDetailPage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <DashboardLayout role="customer" />
          </ProtectedRoute>
        }
      >
        <Route path="/customer/dashboard" element={<CustomerDashboardPage />} />
        <Route path="/customer/search" element={<CustomerSearchPage />} />
        <Route path="/customer/booking/:tukangId" element={<CustomerBookingPage />} />
        <Route path="/customer/history" element={<CustomerHistoryPage />} />
        <Route path="/customer/chat/:bookingId" element={<CustomerChatPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRoles={['tukang']}>
            <DashboardLayout role="tukang" />
          </ProtectedRoute>
        }
      >
        <Route path="/tukang/dashboard" element={<TukangDashboardPage />} />
        <Route path="/tukang/profile" element={<TukangProfilePage />} />
        <Route path="/tukang/services" element={<TukangServicesPage />} />
        <Route path="/tukang/schedule" element={<TukangSchedulePage />} />
        <Route path="/tukang/orders" element={<TukangOrdersPage />} />
        <Route path="/tukang/chat/:bookingId" element={<TukangChatPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout role="admin" />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/tukang" element={<AdminTukangPage />} />
        <Route path="/admin/categories" element={<AdminCategoriesPage />} />
        <Route path="/admin/bookings" element={<AdminBookingsPage />} />
        <Route path="/admin/reports" element={<AdminReportsPage />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
