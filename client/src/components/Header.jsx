import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Phone, MapPin } from 'lucide-react';

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-brand-950/90 backdrop-blur-xl border-b border-brand-800/30'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gold-500/15 border border-gold-500/25 flex items-center justify-center shrink-0">
              <span className="font-serif text-gold-400 text-sm sm:text-lg font-bold">V</span>
            </div>
            <div>
              <h1 className="font-serif text-base sm:text-xl text-white tracking-wide leading-tight">
                Veto Café & Restaurant
              </h1>
              <p className="text-[10px] sm:text-xs text-brand-400 tracking-widest uppercase hidden sm:block">
                Buffet · Café · Sushi
              </p>
            </div>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/menu"
              className="text-brand-300 hover:text-gold-400 transition-colors text-sm font-medium"
            >
              Our Menu
            </Link>
            <a
              href="tel:+201050101098"
              className="flex items-center gap-2 text-gold-400 hover:text-gold-300 transition-colors text-sm font-medium"
            >
              <Phone className="w-4 h-4" />
              +20 10 50101098
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-brand-300 hover:text-white hover:bg-brand-800/50 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-brand-950/95 backdrop-blur-xl border-t border-brand-800/30 animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            <Link
              to="/menu"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-brand-300 hover:text-gold-400 hover:bg-brand-800/30 transition-colors text-sm font-medium"
            >
              Our Menu
            </Link>
            <a
              href="tel:+201050101098"
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-gold-400 hover:bg-brand-800/30 transition-colors text-sm font-medium"
            >
              <Phone className="w-4 h-4" />
              +20 10 50101098
            </a>
            <div className="flex items-center gap-2 px-3 py-2 text-brand-500 text-xs">
              <MapPin className="w-3.5 h-3.5" />
              Gleem Bay · Montaza, Alexandria
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
