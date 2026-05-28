import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="w-full py-4 sm:py-6 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gold-500 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-brand-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h1 className="font-serif text-lg sm:text-xl lg:text-2xl text-white tracking-wide">
              Veto Café & Restaurant
            </h1>
            <p className="text-[10px] sm:text-xs text-brand-400 tracking-widest uppercase hidden sm:block">Buffet · Café · Restaurant</p>
          </div>
        </div>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-4">
          <Link
            to="/menu"
            className="flex items-center gap-2 text-brand-300 hover:text-gold-400 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Menu
          </Link>
          <a
            href="tel:+201050101098"
            className="flex items-center gap-2 text-brand-300 hover:text-gold-400 transition-colors text-sm"
          >
            <Phone className="w-4 h-4" />
            +20 10 50101098
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="sm:hidden p-2 rounded-lg text-brand-300 hover:text-white hover:bg-brand-800/50 transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden mt-3 pb-2 border-t border-brand-700/30 pt-3 animate-fade-in">
          <div className="flex flex-col gap-2">
            <Link
              to="/menu"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-brand-300 hover:text-gold-400 hover:bg-brand-800/30 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Menu
            </Link>
            <a
              href="tel:+201050101098"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-brand-300 hover:text-gold-400 hover:bg-brand-800/30 transition-colors text-sm"
            >
              <Phone className="w-4 h-4" />
              +20 10 50101098
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
