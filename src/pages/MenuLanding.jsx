import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Utensils, Fish, Coffee, CakeSlice } from 'lucide-react';

const MenuLanding = () => {
  return (
    <div className="min-h-screen bg-brand-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-800/40 via-brand-900 to-brand-950 px-4 py-12">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-brand-700/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <Link
            to="/"
            className="p-2.5 rounded-xl bg-brand-800/50 text-brand-300 border border-brand-700/50 hover:bg-brand-700/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl text-white">Our Menu</h1>
            <p className="text-brand-400 text-sm mt-1">Veto Café & Restaurant 🧡</p>
          </div>
        </div>

        {/* Two Big Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
          {/* General Menu */}
          <Link
            to="/menu/general"
            className="glass-panel p-8 text-center hover:border-gold-500/40 transition-all duration-300 group"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Coffee className="w-10 h-10 text-gold-400" />
            </div>
            <h2 className="font-serif text-2xl text-white mb-2">Café & Restaurant</h2>
            <p className="text-brand-400 text-sm mb-6 leading-relaxed">
              Coffee, fresh juices, mocktails, milkshakes, desserts, waffles & more.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <span className="px-2.5 py-1 rounded-full bg-brand-800/50 text-brand-300 text-xs border border-brand-700/30">Coffee</span>
              <span className="px-2.5 py-1 rounded-full bg-brand-800/50 text-brand-300 text-xs border border-brand-700/30">Juices</span>
              <span className="px-2.5 py-1 rounded-full bg-brand-800/50 text-brand-300 text-xs border border-brand-700/30">Mocktails</span>
              <span className="px-2.5 py-1 rounded-full bg-brand-800/50 text-brand-300 text-xs border border-brand-700/30">Desserts</span>
            </div>
            <span className="inline-flex items-center gap-2 text-gold-400 font-medium group-hover:gap-3 transition-all">
              Browse Menu
              <span className="text-lg">→</span>
            </span>
          </Link>

          {/* Sushi Menu */}
          <Link
            to="/menu/sushi"
            className="glass-panel p-8 text-center hover:border-rose-500/40 transition-all duration-300 group"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Fish className="w-10 h-10 text-rose-400" />
            </div>
            <h2 className="font-serif text-2xl text-white mb-2">Sushi & Japanese</h2>
            <p className="text-brand-400 text-sm mb-6 leading-relaxed">
              Fresh sushi, sashimi, rolls, and authentic Japanese specialties.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <span className="px-2.5 py-1 rounded-full bg-brand-800/50 text-brand-300 text-xs border border-brand-700/30">Nigiri</span>
              <span className="px-2.5 py-1 rounded-full bg-brand-800/50 text-brand-300 text-xs border border-brand-700/30">Sashimi</span>
              <span className="px-2.5 py-1 rounded-full bg-brand-800/50 text-brand-300 text-xs border border-brand-700/30">Maki Rolls</span>
              <span className="px-2.5 py-1 rounded-full bg-brand-800/50 text-brand-300 text-xs border border-brand-700/30">Special Rolls</span>
            </div>
            <span className="inline-flex items-center gap-2 text-rose-400 font-medium group-hover:gap-3 transition-all">
              Browse Sushi Menu
              <span className="text-lg">→</span>
            </span>
          </Link>
        </div>

        {/* Branches */}
        <div className="mt-10 glass-panel p-6 text-center">
          <h3 className="font-serif text-lg text-white mb-3">Our Branches</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-brand-800/30 rounded-xl p-4">
              <p className="text-gold-400 font-medium mb-1">Gleem Bay — Alexandria</p>
              <p className="text-brand-400 text-sm">📞 01050101097</p>
            </div>
            <div className="bg-brand-800/30 rounded-xl p-4">
              <p className="text-gold-400 font-medium mb-1">Montaza — Alexandria</p>
              <p className="text-brand-400 text-sm">📞 01050101098</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuLanding;
