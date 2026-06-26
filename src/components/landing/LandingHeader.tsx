import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import fableadLogo from '../../assets/iamges/fabstudio_logo.png';

interface LandingHeaderProps {
  activePage?: string;
}

const LandingHeader: React.FC<LandingHeaderProps> = ({ activePage = 'home' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();

  const navigation = [
    { name: 'Home', href: '/home', id: 'home' },
    // { name: 'Features', href: '/features', id: 'features' },
    { name: 'About Us', href: '/aboutus', id: 'aboutus' },
    { name: 'Contact', href: '/contact-us', id: 'contactus' },
    { name: 'Pricing', href: '/pricing', id: 'pricing' },
  ];

  const legalNavigation = [
    { name: 'Privacy Policy', href: '/privacy', id: 'privacy' },
    { name: 'Terms & Conditions', href: '/terms', id: 'terms' },
    { name: 'Delete Account', href: '/delete-account', id: 'delete-account' },
  ];

  const handleNavClick = (href: string, closeMobile = false) => {
    navigate(href);
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (closeMobile) setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          {/* Logo */}
          <div className="flex items-center">
            <button onClick={() => handleNavClick('/home')} className="flex items-center space-x-2">
              <img src={fableadLogo} alt="Fab Studio" className="h-24 w-auto" />
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.href)}
                className={`text-base font-medium transition-colors ${
                  activePage === item.id
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/login"
              className="fab-gradient-amber text-primary-foreground px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity shadow-md"
            >
              Sign In
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-4">
              {activePage === 'privacy' || activePage === 'terms' || activePage === 'delete-account' ? (
                <>
                  <span className="text-sm font-medium text-primary">Legal</span>
                  {legalNavigation.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.href, true)}
                      className={`text-sm font-medium transition-colors text-left ${
                        activePage === item.id
                          ? 'text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {item.name}
                    </button>
                  ))}
                </>
              ) : (
                navigation.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.href, true)}
                    className={`text-sm font-medium transition-colors text-left ${
                      activePage === item.id
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {item.name}
                  </button>
                ))
              )}
              <div className="pt-4 border-t border-border flex flex-col space-y-3">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="fab-gradient-amber text-primary-foreground px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity text-center shadow-md"
                >
                  Sign In
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default LandingHeader;
