import { Link, useLocation, useNavigate } from 'react-router';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';

interface HeaderProps {
  isAuthenticated?: boolean;
  userRole?:  'Formateurs' | 'responsableformation' | 'Admin';
  onLogout?: () => void;
}

export function Header({ isAuthenticated = false, userRole, onLogout }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const publicLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/about', label: 'À propos' },
    { href: '/contact', label: 'Contact' },
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
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Navigation principale">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-primary no-underline hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              aria-label="Retour à l'accueil"
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
                      <span>Tableau de bord</span>
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
                    aria-label="Se déconnecter"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    <span>Déconnexion</span>
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Connexion
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm">
                      S'inscrire
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
            aria-label="Menu de navigation"
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
                        <span>Tableau de bord</span>
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
                      aria-label="Se déconnecter"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      <span>Déconnexion</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full">
                        Connexion
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button size="sm" className="w-full">
                        S'inscrire
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
