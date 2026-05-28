import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Coffee, UtensilsCrossed, CakeSlice } from 'lucide-react';

const MENU_SECTIONS = [
  {
    id: 'drinks',
    title: 'Drinks',
    subtitle: 'Coffee, Juices, Mocktails & Milkshakes',
    icon: Coffee,
    items: 'Coffee · Juices · Mocktails · Milkshakes',
  },
  {
    id: 'food',
    title: 'Food',
    subtitle: 'Sushi, Soups, Noodles & Appetizers',
    icon: UtensilsCrossed,
    items: 'Sushi · Soups · Noodles · Appetizers · Rolls',
  },
  {
    id: 'desserts',
    title: 'Desserts',
    subtitle: 'Desserts, Waffles & Sweet Treats',
    icon: CakeSlice,
    items: 'Desserts · Waffles · Ice Cream',
  },
];

const MenuHome = () => {
  return (
    <div className="min-h-screen luxury-page">
      <div className="max-w-lg mx-auto px-5 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14 animate-fade-in">
          <p className="luxury-section-title mb-3">Veto Café & Restaurant</p>
          <h1 className="font-serif text-4xl sm:text-5xl text-white tracking-tight mb-3">
            Menu
          </h1>
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent mx-auto" />
        </div>

        {/* Sections */}
        <div className="space-y-4 animate-slide-up">
          {MENU_SECTIONS.map((section, idx) => (
            <Link
              key={section.id}
              to={`/menu/${section.id}`}
              className="luxury-card-gold block p-5 sm:p-6 group"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-gold-400/[0.06] border border-gold-400/10 flex items-center justify-center shrink-0 group-hover:bg-gold-400/[0.10] transition-colors duration-500">
                  <section.icon className="w-5 h-5 text-gold-400/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-serif text-xl text-white/90 mb-0.5 group-hover:text-gold-300/90 transition-colors duration-500">
                    {section.title}
                  </h2>
                  <p className="text-[13px] text-white/30">{section.subtitle}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gold-400/40 group-hover:text-gold-400/70 group-hover:translate-x-1 transition-all duration-500 shrink-0" />
              </div>
            </Link>
          ))}
        </div>

        {/* Branches */}
        <div className="mt-10 sm:mt-14 text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="luxury-divider mb-6">
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/20 whitespace-nowrap px-3">
              Our Branches
            </span>
          </div>
          <div className="space-y-3">
            <div className="luxury-card p-4">
              <p className="text-gold-400/70 text-sm font-medium mb-1">Gleembay — Alexandria</p>
              <p className="text-white/25 text-xs tracking-wide">01050101097</p>
            </div>
            <div className="luxury-card p-4">
              <p className="text-gold-400/70 text-sm font-medium mb-1">Montaza — Alexandria</p>
              <p className="text-white/25 text-xs tracking-wide">01050101098</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuHome;
