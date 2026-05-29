import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Calendar, Sparkles } from 'lucide-react';

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    setMobileOpen(false);
    if (isHome) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = `/#${id}`;
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-brand-950/90 backdrop-blur-xl border-b border-brand-800/30'
          : isHome ? 'bg-transparent' : 'bg-brand-950/90 backdrop-blur-xl border-b border-brand-800/30'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3">
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
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => scrollTo('events')} className="text-brand-300 hover:text-gold-400 transition-colors text-sm font-medium">
              Events
            </button>
            <button onClick={() => scrollTo('events')} className="text-brand-300 hover:text-gold-400 transition-colors text-sm font-medium">
              Offers
            </button>
            <Link to="/menu" className="text-brand-300 hover:text-gold-400 transition-colors text-sm font-medium">
              Menu
            </Link>
            <a
              href="tel:+201050101098"
              className="flex items-center gap-2 text-gold-400 hover:text-gold-300 transition-colors text-sm font-medium"
            >
              <Phone className="w-4 h-4" />
              +20 10 50101098
            </a>
            <Link
              to="/reserve"
              className="px-4 py-2 rounded-lg bg-gold-500 text-brand-900 text-sm font-semibold hover:bg-gold-400 transition-colors"
            >
              Book Now
            </Link>
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
            <button onClick={() => scrollTo('events')} className="w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg text-brand-300 hover:text-gold-400 hover:bg-brand-800/30 transition-colors text-sm font-medium">
              <Calendar className="w-4 h-4" /> Events & Offers
            </button>
            <Link to="/menu" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-brand-300 hover:text-gold-400 hover:bg-brand-800/30 transition-colors text-sm font-medium">
              <Sparkles className="w-4 h-4" /> Our Menu
            </Link>
            <a href="tel:+201050101098" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-gold-400 hover:bg-brand-800/30 transition-colors text-sm font-medium">
              <Phone className="w-4 h-4" /> +20 10 50101098
            </a>
            <Link to="/reserve" onClick={() => setMobileOpen(false)} className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-gold-500 text-brand-900 font-semibold text-sm mt-2">
              Book Your Table
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
