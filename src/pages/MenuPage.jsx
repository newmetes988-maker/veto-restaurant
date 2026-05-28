import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Fish, Coffee, CupSoda, IceCream, CakeSlice, Search, ShoppingBag } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: ShoppingBag },
  { id: 'sushi', label: 'Sushi', icon: Fish },
  { id: 'coffee', label: 'Coffee', icon: Coffee },
  { id: 'juices', label: 'Fresh Juices', icon: CupSoda },
  { id: 'mocktails', label: 'Mocktails', icon: CupSoda },
  { id: 'milkshake', label: 'Milkshakes', icon: IceCream },
  { id: 'dessert', label: 'Desserts', icon: CakeSlice },
  { id: 'waffle', label: 'Waffles', icon: CakeSlice },
];

const MENU_ITEMS = [
  // SUSHI
  { id: 1, name: 'Salmon Nigiri', category: 'sushi', price: 185, description: 'Fresh salmon on seasoned rice', badge: 'Popular' },
  { id: 2, name: 'Tuna Sashimi', category: 'sushi', price: 220, description: 'Premium bluefin tuna slices' },
  { id: 3, name: 'California Roll', category: 'sushi', price: 165, description: 'Crab, avocado, cucumber, tobiko' },
  { id: 4, name: 'Dragon Roll', category: 'sushi', price: 245, description: 'Shrimp tempura, eel, avocado, unagi sauce', badge: 'Chef Pick' },
  { id: 5, name: 'Spicy Tuna Roll', category: 'sushi', price: 175, description: 'Spicy tuna, cucumber, sesame' },
  { id: 6, name: 'Ebi Tempura Roll', category: 'sushi', price: 195, description: 'Crispy shrimp tempura roll' },
  { id: 7, name: 'Salmon Avocado Roll', category: 'sushi', price: 180, description: 'Fresh salmon with creamy avocado' },
  { id: 8, name: 'Mixed Sashimi Platter', category: 'sushi', price: 450, description: 'Assorted premium sashimi selection', badge: 'For 2' },
  { id: 9, name: 'Volcano Roll', category: 'sushi', price: 260, description: 'Baked seafood topped roll' },
  { id: 10, name: 'Miso Soup', category: 'sushi', price: 55, description: 'Traditional Japanese miso with tofu' },
  { id: 11, name: 'Edamame', category: 'sushi', price: 75, description: 'Steamed soybeans with sea salt' },
  { id: 12, name: 'Gyoza (6 pcs)', category: 'sushi', price: 120, description: 'Pan-fried chicken dumplings' },

  // COFFEE
  { id: 20, name: 'Espresso', category: 'coffee', price: 57 },
  { id: 21, name: 'Espresso Doppio', category: 'coffee', price: 83 },
  { id: 22, name: 'Macchiato', category: 'coffee', price: 64 },
  { id: 23, name: 'Cortado', category: 'coffee', price: 70 },
  { id: 24, name: 'Americano', category: 'coffee', price: 95 },
  { id: 25, name: 'Cappuccino', category: 'coffee', price: 102 },
  { id: 26, name: 'Cafe Latte', category: 'coffee', price: 108 },
  { id: 27, name: 'Cafe Mocha', category: 'coffee', price: 134 },
  { id: 28, name: 'White Mocha', category: 'coffee', price: 147 },
  { id: 29, name: 'Lotus Mocha', category: 'coffee', price: 147 },
  { id: 30, name: 'Spanish Latte', category: 'coffee', price: 128 },
  { id: 31, name: 'Flat White', category: 'coffee', price: 108 },
  { id: 32, name: 'Turkish Coffee', category: 'coffee', price: 108 },
  { id: 33, name: 'French Coffee', category: 'coffee', price: 102 },
  { id: 34, name: 'Nutella Coffee', category: 'coffee', price: 160 },
  { id: 35, name: 'Caramel Latte', category: 'coffee', price: 121 },
  { id: 36, name: 'Pistachio Espresso', category: 'coffee', price: 172 },

  // FRESH JUICES
  { id: 40, name: 'Mango', category: 'juices', price: 109 },
  { id: 41, name: 'Strawberry', category: 'juices', price: 102 },
  { id: 42, name: 'Guava', category: 'juices', price: 102 },
  { id: 43, name: 'Orange', category: 'juices', price: 102 },
  { id: 44, name: 'Lemon', category: 'juices', price: 89 },
  { id: 45, name: 'Lemon Mint', category: 'juices', price: 96 },
  { id: 46, name: 'Beets & Carrots', category: 'juices', price: 96 },
  { id: 47, name: 'Orange & Carrots', category: 'juices', price: 109 },
  { id: 48, name: 'Sweet & Spicy', category: 'juices', price: 109 },
  { id: 49, name: 'Banana & Dates', category: 'juices', price: 160 },
  { id: 50, name: 'Prickly Pear', category: 'juices', price: 109 },
  { id: 51, name: 'Watermelon', category: 'juices', price: 128 },
  { id: 52, name: 'Florida Mango', category: 'juices', price: 102, description: 'Cocktail' },
  { id: 53, name: 'Hawai Mango', category: 'juices', price: 127 },
  { id: 54, name: 'Pina Colada', category: 'juices', price: 153 },
  { id: 55, name: 'Key West', category: 'juices', price: 140 },

  // MOCKTAILS
  { id: 60, name: 'Mojito Classic', category: 'mocktails', price: 166 },
  { id: 61, name: 'Crazy Watermelon', category: 'mocktails', price: 166 },
  { id: 62, name: 'Forest Peach Mojito', category: 'mocktails', price: 166 },
  { id: 63, name: 'Passion Tango', category: 'mocktails', price: 179 },
  { id: 64, name: 'Lemonade Pineapple', category: 'mocktails', price: 160 },
  { id: 65, name: 'Black Tea Lemonade', category: 'mocktails', price: 134 },
  { id: 66, name: 'Bahama Apple Mint', category: 'mocktails', price: 146 },
  { id: 67, name: 'Sun Shine', category: 'mocktails', price: 153 },
  { id: 68, name: 'Sun Rise', category: 'mocktails', price: 121 },
  { id: 69, name: 'Cherry Cola', category: 'mocktails', price: 121 },
  { id: 70, name: 'Dragon Kiss', category: 'mocktails', price: 223 },
  { id: 71, name: 'Paradise', category: 'mocktails', price: 160 },
  { id: 72, name: 'Africano', category: 'mocktails', price: 147 },
  { id: 73, name: 'Crazy Mango', category: 'mocktails', price: 160 },
  { id: 74, name: 'Tropicana', category: 'mocktails', price: 127 },
  { id: 75, name: 'Blushing Fruit', category: 'mocktails', price: 217 },

  // MILKSHAKES
  { id: 80, name: 'Mango Milkshake', category: 'milkshake', price: 211 },
  { id: 81, name: 'Strawberry Milkshake', category: 'milkshake', price: 211 },
  { id: 82, name: 'Chocolate Milkshake', category: 'milkshake', price: 211 },
  { id: 83, name: 'Vanilla Milkshake', category: 'milkshake', price: 211 },
  { id: 84, name: 'Salted Caramel Milkshake', category: 'milkshake', price: 223 },
  { id: 85, name: 'Lotus Milkshake', category: 'milkshake', price: 223 },
  { id: 86, name: 'Nutella Milkshake', category: 'milkshake', price: 223 },
  { id: 87, name: 'Oreo Milkshake', category: 'milkshake', price: 217 },
  { id: 88, name: 'Brownie Milkshake', category: 'milkshake', price: 223 },
  { id: 89, name: 'Peanut Banana Shake', category: 'milkshake', price: 223 },
  { id: 90, name: 'Blueberry Milkshake', category: 'milkshake', price: 223 },
  { id: 91, name: 'Pistachio Milkshake', category: 'milkshake', price: 223 },
  { id: 92, name: 'Red Velvet Milkshake', category: 'milkshake', price: 223 },

  // DESSERTS
  { id: 100, name: 'Brownies', category: 'dessert', price: 185 },
  { id: 101, name: 'Molten Cake', category: 'dessert', price: 211 },
  { id: 102, name: 'San Sebastian', category: 'dessert', price: 160 },
  { id: 103, name: 'Fudge', category: 'dessert', price: 185 },
  { id: 104, name: 'Red Velvet', category: 'dessert', price: 198 },
  { id: 105, name: 'Despacito', category: 'dessert', price: 185 },
  { id: 106, name: 'Kinder Cake', category: 'dessert', price: 185 },
  { id: 107, name: 'Oreo Cake', category: 'dessert', price: 185 },
  { id: 108, name: 'Fruit Platter', category: 'dessert', price: 351 },

  // WAFFLES
  { id: 110, name: 'Waffle White Oreo', category: 'waffle', price: 223 },
  { id: 111, name: 'Waffle Mixican', category: 'waffle', price: 223 },
  { id: 112, name: 'Waffle Mix Chocolate', category: 'waffle', price: 243 },
  { id: 113, name: 'Waffle Pistachio', category: 'waffle', price: 281 },
  { id: 114, name: 'Waffle Nutella', category: 'waffle', price: 243 },
  { id: 115, name: 'Pancake White Oreo', category: 'waffle', price: 182 },
  { id: 116, name: 'Pancake Mixican', category: 'waffle', price: 182 },
  { id: 117, name: 'Pancake Mix Chocolate', category: 'waffle', price: 198 },
  { id: 118, name: 'Pancake Pistachio', category: 'waffle', price: 231 },
  { id: 119, name: 'Pancake Nutella', category: 'waffle', price: 198 },
];

const MenuPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = MENU_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatPrice = (price) => `${price.toFixed(2)} EGP`;

  return (
    <div className="min-h-screen bg-brand-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-800/40 via-brand-900 to-brand-950">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-brand-700/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
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

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-500" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-premium pl-11 w-full"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30'
                  : 'bg-brand-800/40 text-brand-400 border border-brand-700/30 hover:bg-brand-700/40 hover:text-white'
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-up">
          {filteredItems.length === 0 && (
            <div className="col-span-full text-center py-16 text-brand-500">
              No items found.
            </div>
          )}

          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="glass-panel p-5 hover:border-gold-500/30 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-white group-hover:text-gold-400 transition-colors">
                      {item.name}
                    </h3>
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded-full bg-gold-500/15 text-gold-400 text-[10px] font-semibold uppercase tracking-wider border border-gold-500/20">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-brand-500 text-xs mt-1">{item.description}</p>
                  )}
                </div>
                <span className="text-gold-400 font-semibold whitespace-nowrap ml-3">
                  {formatPrice(item.price)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center glass-panel p-8">
          <p className="text-brand-400 mb-4">Ready to order? Reserve your table now.</p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Reserve a Table
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MenuPage;
