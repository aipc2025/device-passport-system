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

// Marketplace pages
import MarketplaceHome from './pages/marketplace';
import ProductList from './pages/marketplace/ProductList';
import ProductDetail from './pages/marketplace/ProductDetail';
import RFQList from './pages/marketplace/RFQList';
import RFQDetail from './pages/marketplace/RFQDetail';

// Supplier pages
import MyProducts from './pages/supplier/MyProducts';
import PublishProduct from './pages/supplier/PublishProduct';
import SupplierMatches from './pages/supplier/SupplierMatches';

// Buyer pages
import MyRFQs from './pages/buyer/MyRFQs';
import CreateRFQ from './pages/buyer/CreateRFQ';
import BuyerMatches from './pages/buyer/BuyerMatches';

// Inquiry pages
import InquiryList from './pages/inquiries/InquiryList';
import InquiryDetail from './pages/inquiries/InquiryDetail';
import CreateInquiry from './pages/inquiries/CreateInquiry';

// Matching pages
import MatchDetail from './pages/matching/MatchDetail';

// Expert pages
import { ExpertDashboard, ExpertProfile, ExpertPassport, ServiceRecords, ExpertMatches, ServiceHall } from './pages/expert';

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

          {/* Marketplace routes */}
          <Route path="/marketplace" element={<MarketplaceHome />} />
          <Route path="/marketplace/products" element={<ProductList />} />
          <Route path="/marketplace/products/:id" element={<ProductDetail />} />
          <Route path="/marketplace/rfqs" element={<RFQList />} />
          <Route path="/marketplace/rfqs/:id" element={<RFQDetail />} />

          {/* Supplier routes */}
          <Route path="/supplier/products" element={<MyProducts />} />
          <Route path="/supplier/products/publish" element={<PublishProduct />} />
          <Route path="/supplier/matches" element={<SupplierMatches />} />

          {/* Buyer routes */}
          <Route path="/buyer/rfqs" element={<MyRFQs />} />
          <Route path="/buyer/rfqs/create" element={<CreateRFQ />} />
          <Route path="/buyer/matches" element={<BuyerMatches />} />

          {/* Inquiry routes */}
          <Route path="/inquiries" element={<InquiryList />} />
          <Route path="/inquiries/create" element={<CreateInquiry />} />
          <Route path="/inquiries/:id" element={<InquiryDetail />} />

          {/* Match detail */}
          <Route path="/matching/:id" element={<MatchDetail />} />

          {/* Expert routes */}
          <Route path="/expert" element={<ExpertDashboard />} />
          <Route path="/expert/dashboard" element={<ExpertDashboard />} />
          <Route path="/expert/profile" element={<ExpertProfile />} />
          <Route path="/expert/passport" element={<ExpertPassport />} />
          <Route path="/expert/service-records" element={<ServiceRecords />} />
          <Route path="/expert/matches" element={<ExpertMatches />} />
          <Route path="/expert/service-hall" element={<ServiceHall />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
