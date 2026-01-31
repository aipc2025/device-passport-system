import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  LogOut,
  Building2,
  UserCheck,
  Store,
  FileText,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  User,
  Briefcase,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/auth.store';
import { UserRole } from '@device-passport/shared';
import LanguageSwitcher from '../common/LanguageSwitcher';
import clsx from 'clsx';

interface NavItem {
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  children?: { name: string; href: string }[];
  hideForExpert?: boolean; // Hide this item for expert users
  expertOnly?: boolean; // Only show this item for expert users
}

export default function DashboardLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasRole, isExpert } = useAuthStore();
  const [expandedSections, setExpandedSections] = useState<string[]>(['marketplace', 'supplier', 'buyer', 'expert']);

  const toggleSection = (name: string) => {
    setExpandedSections((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const navigation: NavItem[] = [
    { name: t('common.dashboard'), href: '/dashboard', icon: LayoutDashboard, roles: [UserRole.CUSTOMER] },
    { name: t('nav.devicePassports'), href: '/passports', icon: Package, roles: [UserRole.CUSTOMER], hideForExpert: true },
    { name: t('nav.serviceOrders'), href: '/service-orders', icon: ClipboardList, roles: [UserRole.CUSTOMER] },
    {
      name: t('nav.marketplace'),
      icon: Store,
      roles: [UserRole.CUSTOMER],
      hideForExpert: true,
      children: [
        { name: t('nav.products'), href: '/marketplace/products' },
        { name: t('nav.rfqs'), href: '/marketplace/rfqs' },
      ],
    },
    {
      name: t('role.supplier'),
      icon: Building2,
      roles: [UserRole.CUSTOMER],
      hideForExpert: true,
      children: [
        { name: t('nav.myProducts'), href: '/supplier/products' },
        { name: t('nav.publishProduct'), href: '/supplier/products/publish' },
        { name: t('nav.supplierMatches'), href: '/supplier/matches' },
      ],
    },
    {
      name: t('role.buyer'),
      icon: FileText,
      roles: [UserRole.CUSTOMER],
      hideForExpert: true,
      children: [
        { name: t('nav.myRfqs'), href: '/buyer/rfqs' },
        { name: t('nav.createRfq'), href: '/buyer/rfqs/create' },
        { name: t('nav.buyerMatches'), href: '/buyer/matches' },
      ],
    },
    { name: t('nav.inquiries'), href: '/inquiries', icon: MessageSquare, roles: [UserRole.CUSTOMER], hideForExpert: true },
    // Expert-specific menu items
    {
      name: t('nav.expert', 'Expert'),
      icon: User,
      roles: [UserRole.CUSTOMER],
      expertOnly: true,
      children: [
        { name: t('nav.expertProfile', 'My Profile'), href: '/expert/profile' },
        { name: t('nav.serviceRecords', 'Service Records'), href: '/expert/service-records' },
        { name: t('nav.expertMatches', 'Matches'), href: '/expert/matches' },
      ],
    },
    { name: t('nav.serviceHall', 'Service Hall'), href: '/expert/service-hall', icon: Briefcase, roles: [UserRole.CUSTOMER], expertOnly: true },
    { name: t('nav.suppliers'), href: '/suppliers', icon: Building2, roles: [UserRole.ADMIN] },
    { name: t('nav.registrations'), href: '/registrations', icon: UserCheck, roles: [UserRole.ADMIN] },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userIsExpert = isExpert();
  const filteredNav = navigation.filter((item) => {
    // Check role requirement
    if (!hasRole(item.roles)) return false;
    // Hide items marked as hideForExpert when user is expert
    if (userIsExpert && item.hideForExpert) return false;
    // Only show items marked as expertOnly when user is expert
    if (item.expertOnly && !userIsExpert) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gray-900">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-4 bg-gray-800">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <img src="/luna-logo.png" alt="Luna Industry" className="h-8 w-auto" />
              <span className="text-lg font-bold text-white">{t('common.appName')}</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {filteredNav.map((item) => {
              if (item.children) {
                const isExpanded = expandedSections.includes(item.name);
                const isChildActive = item.children.some((child) =>
                  location.pathname.startsWith(child.href)
                );
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => toggleSection(item.name)}
                      className={clsx(
                        'w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                        isChildActive
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      )}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      <span className="flex-1 text-left">{item.name}</span>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="ml-8 mt-1 space-y-1">
                        {item.children.map((child) => {
                          const isActive = location.pathname === child.href;
                          return (
                            <Link
                              key={child.href}
                              to={child.href}
                              className={clsx(
                                'block px-3 py-2 rounded-md text-sm transition-colors',
                                isActive
                                  ? 'bg-gray-700 text-white'
                                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                              )}
                            >
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const isActive = location.pathname.startsWith(item.href!);
              return (
                <Link
                  key={item.name}
                  to={item.href!}
                  className={clsx(
                    'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  )}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Language Switcher */}
          <div className="px-4 py-2 border-t border-gray-700">
            <LanguageSwitcher variant="dark" />
          </div>

          {/* User menu */}
          <div className="border-t border-gray-700 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
                title={t('common.logout')}
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        {/* Top bar */}
        <header className="bg-white shadow-sm h-16 flex items-center px-6">
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {t('common.backToPublicSite')}
          </Link>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
