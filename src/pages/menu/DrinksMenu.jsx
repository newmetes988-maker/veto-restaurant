import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';

const DRINK_SLUGS = ['coffee', 'juices', 'mocktails', 'milkshake'];

const DrinksMenu = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/products?isActive=true').then((r) => r.json()),
      fetch('/api/v1/categories?isActive=true').then((r) => r.json()),
    ]).then(([prodData, catData]) => {
      if (prodData.status === 'success') {
        const filtered = prodData.data.products.filter((p) => {
          const cat = catData.data?.categories?.find((c) => c.name === p.category);
          return cat && DRINK_SLUGS.includes(cat.slug);
        });
        setProducts(filtered);
      }
      if (catData.status === 'success') {
        const drinkCats = catData.data.categories.filter((c) => DRINK_SLUGS.includes(c.slug));
        setCategories(drinkCats);
      }
      setIsLoading(false);
    });
  }, []);

  const filtered = products.filter((p) => {
    const matchCat = activeCat === 'all' || p.category === activeCat;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const grouped = filtered.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="min-h-screen luxury-page flex items-center justify-center">
        <div className="w-8 h-8 border border-gold-400/20 border-t-gold-400/60 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen luxury-page">
      <div className="max-w-lg mx-auto px-5 py-6 sm:py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 animate-fade-in">
          <Link
            to="/menu"
            className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-gold-400/70 hover:border-gold-400/20 transition-all duration-300 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <p className="luxury-section-title mb-0.5">Menu</p>
            <h1 className="font-serif text-2xl sm:text-3xl text-white tracking-tight">Drinks</h1>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6 animate-slide-up" style={{ animationDelay: '0.05s' }}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input
            type="text"
            placeholder="Search drinks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="luxury-search pl-11 text-sm"
          />
        </div>

        {/* Category Capsules */}
        <div className="flex gap-2 overflow-x-auto pb-6 mb-6 scrollbar-hide animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <button
            onClick={() => setActiveCat('all')}
            className={activeCat === 'all' ? 'luxury-capsule-active' : 'luxury-capsule'}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.name)}
              className={activeCat === cat.name ? 'luxury-capsule-active' : 'luxury-capsule'}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Items Feed */}
        <div className="space-y-8 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              {/* Category Divider */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1.5 h-1.5 rounded-full bg-gold-400/40" />
                <h2 className="text-[11px] font-medium uppercase tracking-[0.25em] text-gold-400/50">
                  {category}
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-gold-400/20 to-transparent" />
              </div>

              {/* Items */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="luxury-card p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap mb-1">
                          <h3 className="luxury-item-name">{item.name}</h3>
                          {item.badge && (
                            <span className="luxury-badge">{item.badge}</span>
                          )}
                        </div>
                        {item.description && (
                          <p className="luxury-item-desc">{item.description}</p>
                        )}
                      </div>
                      <span className="luxury-price font-serif text-lg sm:text-xl font-semibold whitespace-nowrap shrink-0 pt-0.5">
                        {parseFloat(item.price).toFixed(0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-white/20 text-sm">No drinks found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DrinksMenu;
