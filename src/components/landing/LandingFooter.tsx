import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import fableadLogo from '../../assets/iamges/fabstudio_logo.png';

const LandingFooter: React.FC = () => {
  const navigate = useNavigate();

  const handleNavClick = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return (
    <footer className="bg-fab-navy text-primary-foreground border-t border-primary-foreground/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 xl:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 xl:gap-12">
          {/* Logo and Tagline Section */}
          <div className="space-y-6">
            <Link to="/" className="inline-block group">
              <div className="bg-white rounded-2xl p-2.5 inline-flex shadow-lg shadow-black/20 group-hover:scale-105 transition-transform duration-300">
                <img src={fableadLogo} alt="Fab Studio" className="h-14 w-auto" />
              </div>
            </Link>
            <p className="text-primary-foreground/70 text-lg leading-relaxed max-w-xs">
              Elevating photography delivery with seamless, high-performance technology.
            </p>
            <div className="flex space-x-4">
              {[
              
                { 
                  icon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-8.74h-2.94v-3.403h2.94v-2.511c0-2.91 1.777-4.496 4.375-4.496 1.244 0 2.315.093 2.626.134v3.044l-1.802.001c-1.412 0-1.686.671-1.686 1.656v2.172h3.369l-.438 3.403h-2.931v8.74h6.066c.732 0 1.325-.593 1.325-1.325v-21.351c0-.732-.593-1.325-1.325-1.325z"/>
                    </svg>
                  ), 
                  href: "https://www.facebook.com/fableaddevelopers", 
                  label: "Facebook" 
                },
                { 
                  icon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  ), 
                  href: "https://www.linkedin.com/in/fablead-developers-technolab-0b8a07143?originalSubdomain=in", label: "LinkedIn" 
                },
                { 
                  icon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  ), 
                  href: "https://x.com/fablead_tech", label: "Twitter" 
                },
                {
                  icon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  ),
                  href: "https://www.instagram.com/fablead_technolab?igsh=MTZndnBocXp1NWxpNg==",
                  label: "Instagram"
                },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-primary-foreground/10 text-white flex items-center justify-center hover:bg-fab-amber hover:text-fab-navy transition-all duration-300 group"
                  aria-label={social.label}
                >
                  <div className="group-hover:scale-110 transition-transform">
                    {social.icon}
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-white">Product</h3>
            <ul className="space-y-4">
              {[
                // { name: "Features", path: "/features" },
                { name: "Pricing", path: "/pricing" },
                { name: "About Us", path: "/aboutus" },
                { name: "Contact Us", path: "/contact-us" },
              ].map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => handleNavClick(link.path)}
                    className="text-primary-foreground/70 hover:text-fab-amber flex items-center group transition-colors"
                  >
                    <ArrowRight size={14} className="mr-2 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-white">Legal</h3>
            <ul className="space-y-4">
              {[
                { name: "Privacy Policy", path: "/privacy" },
                { name: "Terms & Conditions", path: "/terms" },
                { name: "Delete Account", path: "/delete-account" },
                { name: "Help Center", path: "/contact-us" },
              ].map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => handleNavClick(link.path)}
                    className="text-primary-foreground/70 hover:text-fab-amber flex items-center group transition-colors"
                  >
                    <ArrowRight size={14} className="mr-2 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4 min-w-0">
            <h3 className="text-xl font-bold mb-6 text-white">Get in Touch</h3>

            {/* Email */}
            <div className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-2xl p-4 flex items-start space-x-3 min-w-0">
              <div className="bg-primary-foreground/10 rounded-full p-2 flex-shrink-0">
                <Mail className="h-5 w-5 text-[hsl(var(--fab-amber))]" />
              </div>
              <div className="min-w-0 overflow-hidden">
                <p className="text-white font-semibold text-sm">Email Us</p>
                <p className="text-primary-foreground/50 text-xs mb-1">Get in touch via email</p>
                <a href="mailto:support@fableadstudio.com" className="text-[hsl(var(--fab-amber))] hover:underline text-sm font-medium break-all">
                  info@fableadtechnolabs.com
                </a>
              </div>
            </div>

            {/* Address */}
            <div className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-2xl p-4 flex items-start space-x-3 min-w-0">
              <div className="bg-primary-foreground/10 rounded-full p-2 flex-shrink-0">
                <MapPin className="h-5 w-5 text-[hsl(var(--fab-amber))]" />
              </div>
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm">Our Address</p>
                <p className="text-primary-foreground/50 text-xs mb-1">Come visit us</p>
                <address className="not-italic text-primary-foreground/80 text-sm leading-relaxed">
                  A-5001, Ascon Plaza, Adajan, Surat,Gujarat 395009 – India
                </address>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-primary-foreground/10 text-center text-primary-foreground/50 text-md">
          <p>&copy; {new Date().getFullYear()} <a href="https://www.fableadtechnolabs.com/" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--fab-amber))] hover:underline font-medium">Fablead Studio</a>. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
