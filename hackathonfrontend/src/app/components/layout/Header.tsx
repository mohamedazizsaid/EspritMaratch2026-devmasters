import { Link, useLocation, useNavigate } from 'react-router';
import { Menu, X, User, LogOut, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { useTranslation } from '../../lib/i18n';

interface HeaderProps {
  isAuthenticated?: boolean;
  userRole?:  'Formateurs' | 'responsableformation' | 'Admin';
  onLogout?: () => void;
}

export function Header({ isAuthenticated = false, userRole, onLogout }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isActive = (path: string) => location.pathname === path;

  const publicLinks = [
    { href: '/', label: t('common.home') },
    { href: '/about', label: t('common.about') },
    { href: '/contact', label: t('common.contact') },
  ];

  const dashboardLink = () => {
    switch (userRole) {
      case 'Formateurs':
        return '/dashboard/instructor';
      case 'responsableformation':
        return '/dashboard/manager';
      case 'Admin':
        return '/dashboard/admin';
      default:
        return '/dashboard/instructor';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label={t('header.mainNav')}>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-primary no-underline hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              aria-label={t('header.backToHome')}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
                <span className="text-lg font-bold" aria-hidden="true">F</span>
              </div>
              <span className="font-bold">FormaPro</span>
            </Link>
          </div>

          {/* Navigation Desktop */}
          <div className="hidden md:flex md:items-center md:gap-8">
            <div className="flex gap-6">
              {publicLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`no-underline transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-2 py-1 ${
                    isActive(link.href)
                      ? 'text-primary font-medium'
                      : 'text-foreground'
                  }`}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Auth buttons */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link to={dashboardLink()}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <User className="h-4 w-4" aria-hidden="true" />
                      <span>{t('common.dashboard')}</span>
                    </Button>
                  </Link>
                  <Link to="/settings/security">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                      <span>2FA</span>
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      onLogout?.();
                      navigate('/');
                    }}
                    className="gap-2"
                    aria-label={t('common.logout')}
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    <span>{t('common.logout')}</span>
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/register">
                    <Button variant="outline" size="sm" className="rounded-xl border-primary/30 text-primary hover:bg-primary/10 transition-all">
                      Devenir Formateur
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="sm" className="rounded-xl shadow-md shadow-primary/20 hover:shadow-lg transition-all">
                      {t('common.login')}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden rounded p-2 text-foreground hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={t('header.mobileMenu')}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <div className="flex flex-col gap-4">
              {publicLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`no-underline px-2 py-2 rounded transition-colors hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    isActive(link.href)
                      ? 'text-primary font-medium bg-accent'
                      : 'text-foreground'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="border-t border-border pt-4 flex flex-col gap-3">
                {isAuthenticated ? (
                  <>
                    <Link to={dashboardLink()} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full gap-2 justify-start">
                        <User className="h-4 w-4" aria-hidden="true" />
                        <span>{t('common.dashboard')}</span>
                      </Button>
                    </Link>
                    <Link to="/settings/security" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full gap-2 justify-start">
                        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                        <span>2FA</span>
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        onLogout?.();
                        setMobileMenuOpen(false);
                        navigate('/');
                      }}
                      className="w-full gap-2 justify-start"
                      aria-label={t('common.logout')}
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      <span>{t('common.logout')}</span>
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full rounded-xl border-primary/30 text-primary">
                        Devenir Formateur
                      </Button>
                    </Link>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button size="sm" className="w-full rounded-xl shadow-md">
                        {t('common.login')}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
