import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';

// Layouts
import PublicLayout from './components/layouts/PublicLayout';
import DashboardLayout from './components/layouts/DashboardLayout';

// Public pages
import Home from './pages/Home';
import Scan from './pages/Scan';
import DevicePublic from './pages/DevicePublic';
import ServiceRequest from './pages/ServiceRequest';
import Login from './pages/Login';

// Registration pages
import RegistrationTypeSelection from './pages/registration';
import CompanyRegistration from './pages/registration/CompanyRegistration';
import ExpertRegistration from './pages/registration/ExpertRegistration';
import RegistrationSuccess from './pages/registration/RegistrationSuccess';

// Protected pages
import Dashboard from './pages/admin/Dashboard';
import PassportList from './pages/admin/PassportList';
import PassportCreate from './pages/admin/PassportCreate';
import PassportDetail from './pages/admin/PassportDetail';
import ServiceOrderList from './pages/admin/ServiceOrderList';
import ServiceOrderDetail from './pages/admin/ServiceOrderDetail';
import SupplierList from './pages/admin/SupplierList';
import PendingRegistrations from './pages/admin/PendingRegistrations';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/scan/:code" element={<DevicePublic />} />
          <Route path="/service-request" element={<ServiceRequest />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegistrationTypeSelection />} />
          <Route path="/register/company" element={<CompanyRegistration />} />
          <Route path="/register/expert" element={<ExpertRegistration />} />
          <Route path="/registration/success" element={<RegistrationSuccess />} />
        </Route>

        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/passports" element={<PassportList />} />
          <Route path="/passports/create" element={<PassportCreate />} />
          <Route path="/passports/:id" element={<PassportDetail />} />
          <Route path="/service-orders" element={<ServiceOrderList />} />
          <Route path="/service-orders/:id" element={<ServiceOrderDetail />} />
          <Route path="/suppliers" element={<SupplierList />} />
          <Route path="/registrations" element={<PendingRegistrations />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
