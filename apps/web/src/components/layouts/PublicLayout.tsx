import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Wrench, LogIn, QrCode, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/auth.store';
import LanguageSwitcher from '../common/LanguageSwitcher';
import clsx from 'clsx';

export default function PublicLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

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

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
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

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={clsx(
          'fixed top-16 right-0 bottom-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-200 ease-in-out md:hidden',
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <nav className="flex flex-col p-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-3 px-4 py-3 rounded-md text-gray-700 hover:bg-gray-100"
          >
            <Home className="h-5 w-5" />
            <span>{t('common.home')}</span>
          </Link>
          <Link
            to="/scan"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-3 px-4 py-3 rounded-md text-gray-700 hover:bg-gray-100"
          >
            <QrCode className="h-5 w-5" />
            <span>{t('common.scan')}</span>
          </Link>
          <Link
            to="/service-request"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-3 px-4 py-3 rounded-md text-gray-700 hover:bg-gray-100"
          >
            <Wrench className="h-5 w-5" />
            <span>{t('common.service')}</span>
          </Link>

          <div className="py-2 border-t border-gray-200">
            <LanguageSwitcher variant="light" />
          </div>

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary text-center"
              >
                {t('common.dashboard')}
              </Link>
              <div className="px-4 py-2 text-sm text-gray-600">
                {user?.name}
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-md"
              >
                {t('common.logout')}
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-primary text-center"
            >
              <LogIn className="h-4 w-4 mr-1 inline" />
              {t('common.login')}
            </Link>
          )}
        </nav>
      </div>

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
