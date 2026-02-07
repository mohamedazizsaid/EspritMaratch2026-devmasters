import { Link } from 'react-router';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useTranslation } from '../../lib/i18n';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 z-flow-grid">
          {/* À propos */}
          <div>
            <h3 className="mb-4">FormaPro</h3>
            <p className="text-muted-foreground">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="mb-4">{t('footer.navigation')}</h4>
            <ul className="space-y-3" role="list">
              <li>
                <Link 
                  to="/" 
                  className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-1"
                >
                  {t('common.home')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-1"
                >
                  {t('common.about')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-1"
                >
                  {t('common.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h4 className="mb-4">{t('footer.legal')}</h4>
            <ul className="space-y-3" role="list">
              <li>
                <Link 
                  to="/privacy" 
                  className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-1"
                >
                  {t('footer.privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-1"
                >
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/accessibility" 
                  className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-1"
                >
                  {t('footer.a11yStatement')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4">{t('common.contact')}</h4>
            <ul className="space-y-3" role="list">
              <li className="flex items-start gap-2">
                <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" aria-hidden="true" />
                <a 
                  href="mailto:contact@formapro.fr" 
                  className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-1"
                >
                  contact@formapro.fr
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" aria-hidden="true" />
                <a 
                  href="tel:+33123456789" 
                  className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-1"
                >
                  +33 1 23 45 67 89
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-muted-foreground">
                  123 Avenue de l'Éducation<br />
                  75001 Paris, France
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 text-center text-muted-foreground">
          <p>
            &copy; {currentYear} FormaPro. {t('footer.allRightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
}
