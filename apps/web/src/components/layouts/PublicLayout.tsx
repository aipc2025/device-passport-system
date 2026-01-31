import { Outlet, Link } from 'react-router-dom';
import { Home, Wrench, LogIn, QrCode } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/auth.store';
import LanguageSwitcher from '../common/LanguageSwitcher';

export default function PublicLayout() {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/luna-logo.png" alt="Luna Industry" className="h-10 w-auto" />
              <span className="text-xl font-bold text-gray-900">{t('common.appName')}</span>
            </Link>

            <nav className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
              >
                <Home className="h-4 w-4" />
                <span>{t('common.home')}</span>
              </Link>
              <Link
                to="/scan"
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
              >
                <QrCode className="h-4 w-4" />
                <span>{t('common.scan')}</span>
              </Link>
              <Link
                to="/service-request"
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
              >
                <Wrench className="h-4 w-4" />
                <span>{t('common.service')}</span>
              </Link>

              <LanguageSwitcher variant="light" />

              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Link to="/dashboard" className="btn-primary">
                    {t('common.dashboard')}
                  </Link>
                  <span className="text-sm text-gray-600">{user?.name}</span>
                  <button
                    onClick={() => logout()}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    {t('common.logout')}
                  </button>
                </div>
              ) : (
                <Link to="/login" className="btn-primary">
                  <LogIn className="h-4 w-4 mr-1" />
                  {t('common.login')}
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
            {t('footer.tagline')}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {t('footer.poweredBy')}
          </p>
        </div>
      </footer>
    </div>
  );
}
