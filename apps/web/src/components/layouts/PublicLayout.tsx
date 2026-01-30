import { Outlet, Link } from 'react-router-dom';
import { QrCode, Home, Wrench, LogIn } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

export default function PublicLayout() {
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <QrCode className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Device Passport</span>
            </Link>

            <nav className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              <Link
                to="/scan"
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
              >
                <QrCode className="h-4 w-4" />
                <span>Scan</span>
              </Link>
              <Link
                to="/service-request"
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
              >
                <Wrench className="h-4 w-4" />
                <span>Service</span>
              </Link>

              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Link to="/dashboard" className="btn-primary">
                    Dashboard
                  </Link>
                  <span className="text-sm text-gray-600">{user?.name}</span>
                  <button
                    onClick={() => logout()}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link to="/login" className="btn-primary">
                  <LogIn className="h-4 w-4 mr-1" />
                  Login
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            Device Passport Traceability System - Full Lifecycle Equipment Management
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Powered by MedTech Industrial
          </p>
        </div>
      </footer>
    </div>
  );
}
