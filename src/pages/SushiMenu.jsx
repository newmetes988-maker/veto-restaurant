import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Fish, Search, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

const SUSHI_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'soups', label: 'Soups' },
  { id: 'noodles', label: 'Noodles' },
  { id: 'appetizers', label: 'Appetizers' },
  { id: 'gunkan', label: 'Gunkan' },
  { id: 'temaki', label: 'Temaki' },
  { id: 'oshi', label: 'Oshi' },
  { id: 'nigiri', label: 'Nigiri' },
  { id: 'sashimi', label: 'Sashimi' },
  { id: 'maki', label: 'Maki & Ura' },
  { id: 'special', label: 'Special Rolls' },
  { id: 'fried', label: 'Fried Rolls' },
  { id: 'dynamite', label: 'Dynamite & Bermuda' },
  { id: 'fire', label: 'Fire & Baked' },
  { id: 'poke', label: 'Poké' },
  { id: 'combos', label: 'Combos' },
];

const SUSHI_ITEMS = [
  // ========== SOUPS ==========
  { id: 1, name: 'Miso Soup (شوربة ميسو)', category: 'soups', price: 175, description: 'Tofu + miso paste + wakame + sesame + hondashi + green onion' },
  { id: 2, name: 'Tom Yum (شوربة توم يوم)', category: 'soups', price: 215, description: 'Shrimp + crab + wakame + hondashi + tom yum paste + ginger' },
  { id: 3, name: 'Shifudo Soup (شوربة سيفود)', category: 'soups', price: 223, description: 'Shrimp + calamari + mussels + cheddar cheese' },

  // ========== NOODLES ==========
  { id: 10, name: 'Shrimp Noodles (نودلز الجمبري)', category: 'noodles', price: 259 },
  { id: 11, name: 'Fried Shrimp Noodles (نودلز الجمبري المقلي)', category: 'noodles', price: 263, badge: 'New', description: 'Served with cocktail sauce' },
  { id: 12, name: 'Chicken Noodles (نودلز الدجاج)', category: 'noodles', price: 236 },
  { id: 13, name: 'Fried Chicken Noodles (نودلز الدجاج المقلي)', category: 'noodles', price: 241, badge: 'New', description: 'Served with cocktail sauce' },
  { id: 14, name: 'Crab Noodles (نودلز الكابوريا)', category: 'noodles', price: 215 },
  { id: 15, name: 'Seafood Noodles (نودلز سي فود)', category: 'noodles', price: 281 },
  { id: 16, name: 'Vegetable Noodles (نودلز الخضار)', category: 'noodles', price: 149 },

  // ========== APPETIZERS ==========
  { id: 20, name: 'All Stars Shrimp', category: 'appetizers', price: 307, badge: 'New', description: 'Fried seasoned shrimp with spicy mayo + sesame + green onion' },
  { id: 21, name: 'Golden Shrimps (4 pcs)', category: 'appetizers', price: 193, description: 'Golden fried seasoned shrimp with cocktail sauce' },
  { id: 22, name: 'Shrimp Fingers (2 pcs)', category: 'appetizers', price: 193, description: 'Shrimp + smoked salmon + cheddar + sweet chili sauce' },
  { id: 23, name: 'Golden Salmon Shrimps (4 pcs)', category: 'appetizers', price: 271, description: 'Fried shrimp roll + salmon with teriyaki + sweet chili' },
  { id: 24, name: 'Shrimp Bonbon (4 pcs)', category: 'appetizers', price: 193, description: 'Shrimp + red cheddar + mozzarella + cheddar sauce' },
  { id: 25, name: 'Shrimp Spring Rolls (4 pcs)', category: 'appetizers', price: 175, description: 'Shrimp spring rolls + sweet chili sauce' },
  { id: 26, name: 'Vegetables Spring Rolls (4 pcs)', category: 'appetizers', price: 127, description: 'Vegetable spring rolls + sweet chili sauce' },
  { id: 27, name: 'Fried Crab Sticks (4 pcs)', category: 'appetizers', price: 127, badge: 'New', description: 'Seasoned fried crab sticks with sweet chili sauce' },
  { id: 28, name: 'Samurai Sticks (4 pcs)', category: 'appetizers', price: 197, badge: 'New', description: 'Shrimp wrapped in spring roll with sweet chili sauce' },
  { id: 29, name: 'Fried Calamari', category: 'appetizers', price: 175, description: 'Crispy seasoned calamari with cocktail + sweet chili sauce' },
  { id: 30, name: 'Shrimp Konafa (4 pcs)', category: 'appetizers', price: 223, description: 'Shrimp roll + crispy konafa + sweet chili sauce' },

  // ========== GUNKAN (Per Piece) ==========
  { id: 40, name: 'Smoked Salmon Cheese', category: 'gunkan', price: 78, description: 'Per piece' },
  { id: 41, name: 'Salmon Cheese', category: 'gunkan', price: 78, description: 'Per piece' },
  { id: 42, name: 'Salmon Cheese Cashew', category: 'gunkan', price: 96, badge: 'New', description: 'Per piece' },
  { id: 43, name: 'Hot Tuna', category: 'gunkan', price: 86, description: 'Per piece' },
  { id: 44, name: 'Crispy Salmon Avocado', category: 'gunkan', price: 78, description: 'Per piece' },
  { id: 45, name: 'Caviar', category: 'gunkan', price: 86, description: 'Per piece' },

  // ========== TEMAKI (Per Piece) ==========
  { id: 50, name: 'Spicy Salmon Temaki', category: 'temaki', price: 166, description: 'Per piece' },
  { id: 51, name: 'Spicy Tuna Temaki', category: 'temaki', price: 184, description: 'Per piece' },
  { id: 52, name: 'Crab Temaki', category: 'temaki', price: 122, description: 'Per piece' },
  { id: 53, name: 'Shrimp Temaki', category: 'temaki', price: 149, description: 'Per piece' },
  { id: 54, name: 'Spicy Fried Shrimp Temaki', category: 'temaki', price: 157, badge: 'New', description: 'Per piece' },
  { id: 55, name: 'Fried Crab Temaki', category: 'temaki', price: 127, badge: 'New', description: 'Per piece' },

  // ========== OSHI (3 Pieces) ==========
  { id: 60, name: 'Salmon Oshi', category: 'oshi', price: 127, description: '3 pieces' },
  { id: 61, name: 'Shrimp Oshi', category: 'oshi', price: 122, description: '3 pieces' },
  { id: 62, name: 'Tuna Oshi', category: 'oshi', price: 140, description: '3 pieces' },
  { id: 63, name: 'Crab Oshi', category: 'oshi', price: 105, description: '3 pieces' },
  { id: 64, name: 'Fried Salmon Oshi', category: 'oshi', price: 127, description: '3 pieces' },
  { id: 65, name: 'Shrimp Tempura Oshi', category: 'oshi', price: 122, description: '3 pieces' },
  { id: 66, name: 'Spicy Tuna Oshi', category: 'oshi', price: 184, description: '3 pieces' },

  // ========== SUSHI PLETO ==========
  { id: 70, name: 'Sushi-Pleto Salmón', category: 'special', price: 381, badge: 'New', description: 'Inside: spicy crab mix + cream cheese | Outside: cucumber + salmon + sesame + green onion | Sauce: tabasco + sweet chili' },
  { id: 71, name: 'Sushi-Pleto Shrimp', category: 'special', price: 350, badge: 'New', description: 'Inside: crab mix + cream cheese | Outside: cucumber + shrimp + sesame + green onion | Sauce: spicy mayo + sweet chili' },

  // ========== NIGIRI (Per Piece) ==========
  { id: 80, name: 'Salmon Nigiri', category: 'nigiri', price: 48, description: 'Per piece' },
  { id: 81, name: 'Fried Salmon Nigiri', category: 'nigiri', price: 48, description: 'Per piece' },
  { id: 82, name: 'Tuna Nigiri', category: 'nigiri', price: 48, description: 'Per piece' },
  { id: 83, name: 'Shrimp Nigiri', category: 'nigiri', price: 43, description: 'Per piece' },
  { id: 84, name: 'Shrimp Tempura Nigiri', category: 'nigiri', price: 43, description: 'Per piece' },
  { id: 85, name: 'Crab Nigiri', category: 'nigiri', price: 43, description: 'Per piece' },
  { id: 86, name: 'Fried Crab Nigiri', category: 'nigiri', price: 43, description: 'Per piece' },
  { id: 87, name: 'Octopus Nigiri', category: 'nigiri', price: 48, description: 'Per piece' },
  { id: 88, name: 'Squid Nigiri', category: 'nigiri', price: 43, description: 'Per piece' },
  { id: 89, name: 'Eel Nigiri', category: 'nigiri', price: 52, description: 'Per piece' },
  { id: 90, name: 'White Fish Nigiri', category: 'nigiri', price: 48, description: 'Per piece' },
  // Nigiri Special
  { id: 91, name: 'Volcano Salmon Nigiri', category: 'nigiri', price: 52, description: 'Special - Per piece' },
  { id: 92, name: 'Avocado Salmon Nigiri', category: 'nigiri', price: 52, description: 'Special - Per piece' },
  { id: 93, name: 'Salmon Cheddar Nigiri', category: 'nigiri', price: 52, description: 'Special - Per piece' },
  { id: 94, name: 'Seared Salmon Nigiri', category: 'nigiri', price: 52, description: 'Special - Per piece' },
  { id: 95, name: 'Volcano Shrimp Nigiri', category: 'nigiri', price: 52, description: 'Special - Per piece' },
  { id: 96, name: 'Shrimp Cheddar Nigiri', category: 'nigiri', price: 52, description: 'Special - Per piece' },
  { id: 97, name: 'Shrimp Mozzarella Nigiri', category: 'nigiri', price: 48, description: 'Special - Per piece' },
  { id: 98, name: 'Tuna Cheddar Nigiri', category: 'nigiri', price: 61, description: 'Special - Per piece' },
  { id: 99, name: 'Spicy Tuna Nigiri', category: 'nigiri', price: 61, description: 'Special - Per piece' },
  { id: 100, name: 'Seared Tuna Nigiri', category: 'nigiri', price: 61, description: 'Special - Per piece' },
  { id: 101, name: 'Crab Cheddar Nigiri', category: 'nigiri', price: 43, description: 'Special - Per piece' },
  { id: 102, name: 'Avocado Crab Nigiri', category: 'nigiri', price: 43, description: 'Special - Per piece' },
  { id: 103, name: 'Salmon Crispy Rice Nigiri', category: 'nigiri', price: 61, description: 'Special - Per piece' },
  { id: 104, name: 'Shrimp Crispy Rice Nigiri', category: 'nigiri', price: 53, description: 'Special - Per piece' },
  { id: 105, name: 'Tuna Crispy Rice Nigiri', category: 'nigiri', price: 65, description: 'Special - Per piece' },

  // ========== SASHIMI (3 Pieces) ==========
  { id: 110, name: 'Salmon Sashimi', category: 'sashimi', price: 122, description: '3 pieces' },
  { id: 111, name: 'Tuna Sashimi', category: 'sashimi', price: 140, description: '3 pieces' },
  { id: 112, name: 'Octopus Sashimi', category: 'sashimi', price: 122, description: '3 pieces' },
  { id: 113, name: 'Shrimp Sashimi', category: 'sashimi', price: 114, description: '3 pieces' },
  { id: 114, name: 'Crab Sashimi', category: 'sashimi', price: 101, description: '3 pieces' },
  { id: 115, name: 'White Fish Sashimi', category: 'sashimi', price: 114, description: '3 pieces' },
  { id: 116, name: 'Eel Sashimi', category: 'sashimi', price: 153, description: '3 pieces' },
  { id: 117, name: 'Squid Sashimi', category: 'sashimi', price: 105, description: '3 pieces' },
  // Sashimi Special
  { id: 118, name: 'Salmon Kiwi Sashimi', category: 'sashimi', price: 131, description: 'Special - 3 pieces' },
  { id: 119, name: 'Seared Salmon Sashimi', category: 'sashimi', price: 131, description: 'Special - 3 pieces' },
  { id: 120, name: 'Seared Tuna Sashimi', category: 'sashimi', price: 153, description: 'Special - 3 pieces' },
  { id: 121, name: 'Tuna Pineapple Sashimi', category: 'sashimi', price: 153, description: 'Special - 3 pieces' },
  { id: 122, name: 'Crab Special Sashimi', category: 'sashimi', price: 114, description: 'Special - 3 pieces' },
  { id: 123, name: 'New Style Salmon Sashimi', category: 'sashimi', price: 131, description: 'Special - 3 pieces' },
  { id: 124, name: 'New Style Tuna Sashimi', category: 'sashimi', price: 153, description: 'Special - 3 pieces' },

  // ========== HOSO MAKI (6 Pieces) ==========
  { id: 130, name: 'Hoso Shrimp Tempura Maki', category: 'maki', price: 157, description: '6 pieces' },
  { id: 131, name: 'Hoso Shrimp Maki', category: 'maki', price: 157, description: '6 pieces' },
  { id: 132, name: 'Hoso Avocado Maki', category: 'maki', price: 78, description: '6 pieces' },
  { id: 133, name: 'Hoso Cucumber Maki', category: 'maki', price: 74, description: '6 pieces' },
  { id: 134, name: 'Hoso Salmon Maki', category: 'maki', price: 157, description: '6 pieces' },
  { id: 135, name: 'Hoso Tuna Maki', category: 'maki', price: 179, description: '6 pieces' },
  { id: 136, name: 'Hoso Crab Maki', category: 'maki', price: 144, description: '6 pieces' },
  { id: 137, name: 'Hoso Eel Maki', category: 'maki', price: 184, description: '6 pieces' },

  // ========== FUTO MAKI (4-8 Pieces) ==========
  { id: 140, name: 'Protein Roll', category: 'maki', price: 205, description: '4 pcs | Inside: salmon + tuna + cream cheese + avocado | Sauce: teriyaki' },
  { id: 141, name: 'Protein Roll (8 pcs)', category: 'maki', price: 390, description: '8 pcs | Inside: salmon + tuna + cream cheese + avocado | Sauce: teriyaki' },
  { id: 142, name: 'Katsu Roll', category: 'maki', price: 205, badge: 'New', description: '4 pcs | Inside: salmon + crab + avocado | Outside: pineapple + cream cheese | Sauce: teriyaki + passion fruit' },
  { id: 143, name: 'Katsu Roll (8 pcs)', category: 'maki', price: 390, badge: 'New', description: '8 pcs | Inside: salmon + crab + avocado | Outside: pineapple + cream cheese | Sauce: teriyaki + passion fruit' },
  { id: 144, name: 'Kingdom Futomaki Roll', category: 'maki', price: 210, description: '4 pcs | Inside: shrimp tempura + fried crab + fried eel + avocado + cream cheese | Sauce: teriyaki + lemon mayo + tabasco' },
  { id: 145, name: 'Kingdom Futomaki Roll (8 pcs)', category: 'maki', price: 412, description: '8 pcs | Inside: shrimp tempura + fried crab + fried eel + avocado + cream cheese | Sauce: teriyaki + lemon mayo + tabasco' },

  // ========== MAKI ROLLS (4-8 Pieces) ==========
  { id: 150, name: 'Shrimp Maki Roll (4 pcs)', category: 'maki', price: 157 },
  { id: 151, name: 'Shrimp Maki Roll (8 pcs)', category: 'maki', price: 302 },
  { id: 152, name: 'Salmon Maki Roll (4 pcs)', category: 'maki', price: 157 },
  { id: 153, name: 'Salmon Maki Roll (8 pcs)', category: 'maki', price: 302 },
  { id: 154, name: 'Tuna Maki Roll (4 pcs)', category: 'maki', price: 171 },
  { id: 155, name: 'Tuna Maki Roll (8 pcs)', category: 'maki', price: 315 },
  { id: 156, name: 'Shrimp Tempura Maki Roll (4 pcs)', category: 'maki', price: 157 },
  { id: 157, name: 'Shrimp Tempura Maki Roll (8 pcs)', category: 'maki', price: 302 },
  { id: 158, name: 'Crab Maki Roll (4 pcs)', category: 'maki', price: 144 },
  { id: 159, name: 'Crab Maki Roll (8 pcs)', category: 'maki', price: 276 },
  { id: 160, name: 'Eel Maki Roll (4 pcs)', category: 'maki', price: 184 },
  { id: 161, name: 'Eel Maki Roll (8 pcs)', category: 'maki', price: 355 },

  // ========== URA MAKI (4-8 Pieces) ==========
  { id: 170, name: 'Ura Shrimp (4 pcs)', category: 'maki', price: 157 },
  { id: 171, name: 'Ura Shrimp (8 pcs)', category: 'maki', price: 202 },
  { id: 172, name: 'Ura Salmon (4 pcs)', category: 'maki', price: 157 },
  { id: 173, name: 'Ura Salmon (8 pcs)', category: 'maki', price: 202 },
  { id: 174, name: 'Ura Tuna (4 pcs)', category: 'maki', price: 157 },
  { id: 175, name: 'Ura Tuna (8 pcs)', category: 'maki', price: 333 },
  { id: 176, name: 'Ura Shrimp Tempura (4 pcs)', category: 'maki', price: 157 },
  { id: 177, name: 'Ura Shrimp Tempura (8 pcs)', category: 'maki', price: 202 },
  { id: 178, name: 'Ura Salmon Cheese (4 pcs)', category: 'maki', price: 157 },
  { id: 179, name: 'Ura Salmon Cheese (8 pcs)', category: 'maki', price: 202 },
  { id: 180, name: 'Ura California (4 pcs)', category: 'maki', price: 171 },
  { id: 181, name: 'Ura California (8 pcs)', category: 'maki', price: 315 },

  // ========== DYNAMITE ROLLS (4-8 Pieces) ==========
  { id: 190, name: 'Dynamite Shrimp Tempura (4 pcs)', category: 'dynamite', price: 193, description: 'Inside: shrimp tempura + cream cheese + cucumber/avocado | Outside: salmon | Sauce: teriyaki' },
  { id: 191, name: 'Dynamite Shrimp Tempura (8 pcs)', category: 'dynamite', price: 364, description: 'Inside: shrimp tempura + cream cheese + cucumber/avocado | Outside: salmon | Sauce: teriyaki' },
  { id: 192, name: 'Dynamite Salmon (4 pcs)', category: 'dynamite', price: 197, description: 'Inside: salmon + cream cheese + cucumber/avocado | Outside: salmon | Sauce: teriyaki' },
  { id: 193, name: 'Dynamite Salmon (8 pcs)', category: 'dynamite', price: 381, description: 'Inside: salmon + cream cheese + cucumber/avocado | Outside: salmon | Sauce: teriyaki' },
  { id: 194, name: 'Dynamite Tuna (4 pcs)', category: 'dynamite', price: 205, description: 'Inside: tuna + cream cheese + cucumber/avocado | Outside: tuna | Sauce: teriyaki' },
  { id: 195, name: 'Dynamite Tuna (8 pcs)', category: 'dynamite', price: 390, description: 'Inside: tuna + cream cheese + cucumber/avocado | Outside: tuna | Sauce: teriyaki' },
  { id: 196, name: 'Dynamite Mix (4 pcs)', category: 'dynamite', price: 205, description: 'Inside: salmon + shrimp tempura + cream cheese + cucumber/avocado | Outside: salmon | Sauce: teriyaki' },
  { id: 197, name: 'Dynamite Mix (8 pcs)', category: 'dynamite', price: 390, description: 'Inside: salmon + shrimp tempura + cream cheese + cucumber/avocado | Outside: salmon | Sauce: teriyaki' },

  // ========== BERMUDA ROLLS (4-8 Pieces) ==========
  { id: 200, name: 'Hanami (4 pcs)', category: 'dynamite', price: 193, description: 'Inside: salmon + shrimp tempura + cucumber/avocado | Outside: crispy rice + cream cheese | Sauce: teriyaki' },
  { id: 201, name: 'Hanami (8 pcs)', category: 'dynamite', price: 364, description: 'Inside: salmon + shrimp tempura + cucumber/avocado | Outside: crispy rice + cream cheese | Sauce: teriyaki' },
  { id: 202, name: 'Crispy B (4 pcs)', category: 'dynamite', price: 193, description: 'Inside: shrimp tempura + cream cheese + cucumber/avocado | Outside: salmon + crispy rice | Sauce: teriyaki' },
  { id: 203, name: 'Crispy B (8 pcs)', category: 'dynamite', price: 364, description: 'Inside: shrimp tempura + cream cheese + cucumber/avocado | Outside: salmon + crispy rice | Sauce: teriyaki' },
  { id: 204, name: 'Smoked (4 pcs)', category: 'dynamite', price: 197, description: 'Inside: shrimp tempura + cream cheese + cucumber/avocado | Outside: smoked salmon' },
  { id: 205, name: 'Smoked (8 pcs)', category: 'dynamite', price: 381, description: 'Inside: shrimp tempura + cream cheese + cucumber/avocado | Outside: smoked salmon' },
  { id: 206, name: 'Tuna B (4 pcs)', category: 'dynamite', price: 197, description: 'Inside: shrimp tempura + cream cheese + cucumber/avocado | Outside: tuna + crispy rice | Sauce: teriyaki' },
  { id: 207, name: 'Tuna B (8 pcs)', category: 'dynamite', price: 381, description: 'Inside: shrimp tempura + cream cheese + cucumber/avocado | Outside: tuna + crispy rice | Sauce: teriyaki' },

  // ========== BAKED ROLLS (4-8 Pieces) ==========
  { id: 210, name: 'Crab Addict (4 pcs)', category: 'fire', price: 184, description: 'Inside: crab + cream cheese | Outside: crab mix with mozzarella | Sauce: teriyaki' },
  { id: 211, name: 'Crab Addict (8 pcs)', category: 'fire', price: 355, description: 'Inside: crab + cream cheese | Outside: crab mix with mozzarella | Sauce: teriyaki' },
  { id: 212, name: 'Las Vegas (4 pcs)', category: 'fire', price: 193, description: 'Inside: crab + cucumber/avocado | Outside: special mix with mozzarella | Sauce: sesame mayo + sriracha' },
  { id: 213, name: 'Las Vegas (8 pcs)', category: 'fire', price: 364, description: 'Inside: crab + cucumber/avocado | Outside: special mix with mozzarella | Sauce: sesame mayo + sriracha' },

  // ========== FIRE ROLLS (4-8 Pieces) ==========
  { id: 220, name: 'Chilling (4 pcs)', category: 'fire', price: 205, badge: 'New', description: 'Inside: fried crab + cream cheese + cucumber/avocado | Outside: salmon + lemon slices | Sauce: tabasco + sweet chili' },
  { id: 221, name: 'Chilling (8 pcs)', category: 'fire', price: 390, badge: 'New', description: 'Inside: fried crab + cream cheese + cucumber/avocado | Outside: salmon + lemon slices | Sauce: tabasco + sweet chili' },
  { id: 222, name: 'Havana (4 pcs)', category: 'fire', price: 205, description: 'Inside: shrimp tempura + crab + cream cheese + cucumber/avocado | Outside: smoked salmon + cheddar | Sauce: teriyaki' },
  { id: 223, name: 'Havana (8 pcs)', category: 'fire', price: 390, description: 'Inside: shrimp tempura + crab + cream cheese + cucumber/avocado | Outside: smoked salmon + cheddar | Sauce: teriyaki' },
  { id: 224, name: 'Seared Tuna Roll (4 pcs)', category: 'fire', price: 205, badge: 'New', description: 'Inside: fried shrimp + cream cheese + cucumber/avocado | Outside: seared tuna | Sauce: ponzu' },
  { id: 225, name: 'Seared Tuna Roll (8 pcs)', category: 'fire', price: 390, badge: 'New', description: 'Inside: fried shrimp + cream cheese + cucumber/avocado | Outside: seared tuna | Sauce: ponzu' },
  { id: 226, name: 'Aburi Salmon Tuna Roll (4 pcs)', category: 'fire', price: 258, badge: 'New', description: 'Inside: salmon + tuna + cream cheese + avocado/cucumber | Outside: aburi salmon + aburi tuna | Sauce: spicy mayo + teriyaki' },
  { id: 227, name: 'Aburi Salmon Tuna Roll (8 pcs)', category: 'fire', price: 490, badge: 'New', description: 'Inside: salmon + tuna + cream cheese + avocado/cucumber | Outside: aburi salmon + aburi tuna | Sauce: spicy mayo + teriyaki' },
  { id: 228, name: 'Spicy Shrimp (4 pcs)', category: 'fire', price: 205, description: 'Inside: shrimp tempura + cream cheese + cucumber/avocado | Outside: boiled shrimp | Sauce: spicy mayo' },
  { id: 229, name: 'Spicy Shrimp (8 pcs)', category: 'fire', price: 390, description: 'Inside: shrimp tempura + cream cheese + cucumber/avocado | Outside: boiled shrimp | Sauce: spicy mayo' },
  { id: 230, name: 'Bomb (4 pcs)', category: 'fire', price: 205, description: 'Inside: crab + shrimp tempura + tuna | Outside: salmon | Sauce: spicy mayo' },
  { id: 231, name: 'Bomb (8 pcs)', category: 'fire', price: 390, description: 'Inside: crab + shrimp tempura + tuna | Outside: salmon | Sauce: spicy mayo' },

  // ========== SPECIAL ROLLS (4-8 Pieces) ==========
  { id: 240, name: 'Philadelphia (4 pcs)', category: 'special', price: 206, description: 'Inside: salmon + cream cheese + cucumber/avocado | Outside: smoked salmon + sesame | Sauce: teriyaki' },
  { id: 241, name: 'Philadelphia (8 pcs)', category: 'special', price: 390, description: 'Inside: salmon + cream cheese + cucumber/avocado | Outside: smoked salmon + sesame | Sauce: teriyaki' },
  { id: 242, name: 'New Style Philadelphia (4 pcs)', category: 'special', price: 184, description: 'Inside: shrimp tempura + cucumber/avocado | Outside: smoked salmon + cream cheese | Sauce: teriyaki' },
  { id: 243, name: 'New Style Philadelphia (8 pcs)', category: 'special', price: 355, description: 'Inside: shrimp tempura + cucumber/avocado | Outside: smoked salmon + cream cheese | Sauce: teriyaki' },
  { id: 244, name: 'California (4 pcs)', category: 'special', price: 197, description: 'Inside: crab + salmon + cucumber/avocado | Outside: caviar' },
  { id: 245, name: 'California (8 pcs)', category: 'special', price: 381, description: 'Inside: crab + salmon + cucumber/avocado | Outside: caviar' },
  { id: 246, name: 'New Style California (4 pcs)', category: 'special', price: 184, description: 'Inside: crab + shrimp tempura + cream cheese + cucumber/avocado | Outside: caviar | Sauce: spicy mayo' },
  { id: 247, name: 'New Style California (8 pcs)', category: 'special', price: 355, description: 'Inside: crab + shrimp tempura + cream cheese + cucumber/avocado | Outside: caviar | Sauce: spicy mayo' },
  { id: 248, name: 'Crispy Shrimp Avocado (4 pcs)', category: 'special', price: 193, description: 'Inside: shrimp tempura + cream cheese + avocado | Outside: crispy rice | Sauce: teriyaki' },
  { id: 249, name: 'Crispy Shrimp Avocado (8 pcs)', category: 'special', price: 364, description: 'Inside: shrimp tempura + cream cheese + avocado | Outside: crispy rice | Sauce: teriyaki' },
  { id: 250, name: 'Crispy Salmon Avocado (4 pcs)', category: 'special', price: 180, badge: 'New', description: 'Inside: salmon + cream cheese + avocado | Outside: crispy rice | Sauce: teriyaki' },
  { id: 251, name: 'Crispy Salmon Avocado (8 pcs)', category: 'special', price: 345, badge: 'New', description: 'Inside: salmon + cream cheese + avocado | Outside: crispy rice | Sauce: teriyaki' },
  { id: 252, name: 'Osaka (4 pcs)', category: 'special', price: 179, badge: 'New', description: 'Inside: spicy crab mix + cream cheese + avocado + crispy fried shrimp | Sauce: teriyaki + spicy mayo' },
  { id: 253, name: 'Osaka (8 pcs)', category: 'special', price: 381, badge: 'New', description: 'Inside: spicy crab mix + cream cheese + avocado + crispy fried shrimp | Sauce: teriyaki + spicy mayo' },
  { id: 254, name: 'Rainbow (4 pcs)', category: 'special', price: 184, description: 'Inside: crab + cucumber/avocado | Outside: salmon + tuna + boiled shrimp + avocado | Sauce: teriyaki' },
  { id: 255, name: 'Rainbow (8 pcs)', category: 'special', price: 381, description: 'Inside: crab + cucumber/avocado | Outside: salmon + tuna + boiled shrimp + avocado | Sauce: teriyaki' },
  { id: 256, name: 'Alaska (4 pcs)', category: 'special', price: 148, description: 'Inside: salmon + shrimp + cream cheese + cucumber/avocado | Outside: sesame mix + caviar | Sauce: teriyaki' },
  { id: 257, name: 'Alaska (8 pcs)', category: 'special', price: 355, description: 'Inside: salmon + shrimp + cream cheese + cucumber/avocado | Outside: sesame mix + caviar | Sauce: teriyaki' },
  { id: 258, name: 'Golden (4 pcs)', category: 'special', price: 197, description: 'Inside: shrimp tempura + avocado | Outside: salmon + panko + black sesame | Sauce: spicy mayo + teriyaki' },
  { id: 259, name: 'Golden (8 pcs)', category: 'special', price: 381, description: 'Inside: shrimp tempura + avocado | Outside: salmon + panko + black sesame | Sauce: spicy mayo + teriyaki' },
  { id: 260, name: 'Power (4 pcs)', category: 'special', price: 205, description: 'Inside: chopped spicy salmon + cucumber/avocado | Outside: mixed spicy salmon | Sauce: spicy mayo + teriyaki' },
  { id: 261, name: 'Power (8 pcs)', category: 'special', price: 390, description: 'Inside: chopped spicy salmon + cucumber/avocado | Outside: mixed spicy salmon | Sauce: spicy mayo + teriyaki' },
  { id: 262, name: 'Picasso (4 pcs)', category: 'special', price: 197, description: 'Inside: fried peppers + carrot + onion | Outside: crispy shrimp + green onion + sesame mix | Sauce: teriyaki + lemon mayo' },
  { id: 263, name: 'Picasso (8 pcs)', category: 'special', price: 381, description: 'Inside: fried peppers + carrot + onion | Outside: crispy shrimp + green onion + sesame mix | Sauce: teriyaki + lemon mayo' },
  { id: 264, name: 'Flare Gun (4 pcs)', category: 'special', price: 197, description: 'Inside: salmon + shrimp tempura + cream cheese + cucumber/avocado | Outside: avocado + togarashi | Sauce: spicy mayo' },
  { id: 265, name: 'Flare Gun (8 pcs)', category: 'special', price: 381, description: 'Inside: salmon + shrimp tempura + cream cheese + cucumber/avocado | Outside: avocado + togarashi | Sauce: spicy mayo' },
  { id: 266, name: 'Togarashi (4 pcs)', category: 'special', price: 197, description: 'Inside: shrimp tempura + cucumber/avocado | Outside: salmon + avocado + togarashi | Sauce: spicy mayo + tabasco' },
  { id: 267, name: 'Togarashi (8 pcs)', category: 'special', price: 381, description: 'Inside: shrimp tempura + cucumber/avocado | Outside: salmon + avocado + togarashi | Sauce: spicy mayo + tabasco' },
  { id: 268, name: 'Hurricane (4 pcs)', category: 'special', price: 184, description: 'Inside: vegetable tempura | Outside: spicy crab salad + dill + glass noodles | Sauce: spicy mayo + cheddar' },
  { id: 269, name: 'Hurricane (8 pcs)', category: 'special', price: 355, description: 'Inside: vegetable tempura | Outside: spicy crab salad + dill + glass noodles | Sauce: spicy mayo + cheddar' },
  { id: 270, name: 'Hot Cheetos (4 pcs)', category: 'special', price: 184, description: 'Inside: shrimp tempura + cream cheese + cucumber/avocado | Outside: hot cheetos crumbs + jalapeño | Sauce: tabasco + spicy mayo' },
  { id: 271, name: 'Hot Cheetos (8 pcs)', category: 'special', price: 355, description: 'Inside: shrimp tempura + cream cheese + cucumber/avocado | Outside: hot cheetos crumbs + jalapeño | Sauce: tabasco + spicy mayo' },
  { id: 272, name: 'The Last Samurai (4 pcs)', category: 'special', price: 197, description: 'Inside: cream cheese + cucumber/avocado | Outside: teriyaki shrimp + sesame | Sauce: sesame sauce' },
  { id: 273, name: 'The Last Samurai (8 pcs)', category: 'special', price: 381, description: 'Inside: cream cheese + cucumber/avocado | Outside: teriyaki shrimp + sesame | Sauce: sesame sauce' },
  { id: 274, name: 'Pink Panther (4 pcs)', category: 'special', price: 195, description: 'Inside: shrimp tempura + cream cheese + avocado | Outside: chopped crab + salmon | Sauce: sesame mayo + sriracha' },
  { id: 275, name: 'Pink Panther (8 pcs)', category: 'special', price: 370, description: 'Inside: shrimp tempura + cream cheese + avocado | Outside: chopped crab + salmon | Sauce: sesame mayo + sriracha' },
  { id: 276, name: 'Dragon (4 pcs)', category: 'special', price: 197, description: 'Inside: eel + cucumber/avocado | Outside: avocado + sesame | Sauce: teriyaki' },
  { id: 277, name: 'Dragon (8 pcs)', category: 'special', price: 381, description: 'Inside: eel + cucumber/avocado | Outside: avocado + sesame | Sauce: teriyaki' },
  { id: 278, name: 'Spicy Tuna Roll (4 pcs)', category: 'special', price: 205, description: 'Inside: shrimp tempura + crab + cucumber/avocado | Outside: spicy tuna slices with sriracha + green onion' },
  { id: 279, name: 'Spicy Tuna Roll (8 pcs)', category: 'special', price: 390, description: 'Inside: shrimp tempura + crab + cucumber/avocado | Outside: spicy tuna slices with sriracha + green onion' },
  { id: 280, name: 'Red Dragon (4 pcs)', category: 'special', price: 197, badge: 'New', description: 'Inside: cream cheese + cucumber/avocado | Outside: tuna + crispy panko | Sauce: teriyaki + cheddar' },
  { id: 281, name: 'Red Dragon (8 pcs)', category: 'special', price: 381, badge: 'New', description: 'Inside: cream cheese + cucumber/avocado | Outside: tuna + crispy panko | Sauce: teriyaki + cheddar' },
  { id: 282, name: 'Crazy Pineapple (4 pcs)', category: 'special', price: 197, badge: 'New', description: 'Inside: shrimp tempura + avocado | Outside: pineapple + cream cheese | Sauce: passion fruit' },
  { id: 283, name: 'Crazy Pineapple (8 pcs)', category: 'special', price: 381, badge: 'New', description: 'Inside: shrimp tempura + avocado | Outside: pineapple + cream cheese | Sauce: passion fruit' },
  { id: 284, name: 'Red Philli (4 pcs)', category: 'special', price: 197, description: 'Inside: tuna + cream cheese + cucumber/avocado | Outside: tuna + caviar | Sauce: spicy mayo' },
  { id: 285, name: 'Red Philli (8 pcs)', category: 'special', price: 390, description: 'Inside: tuna + cream cheese + cucumber/avocado | Outside: tuna + caviar | Sauce: spicy mayo' },
  { id: 286, name: 'Crab Tempura (4 pcs)', category: 'special', price: 185, badge: 'New', description: 'Inside: shrimp tempura + cucumber/avocado + fresh fruits + cream cheese | Outside: crab tempura | Sauce: teriyaki + passion fruit' },
  { id: 287, name: 'Crab Tempura (8 pcs)', category: 'special', price: 360, badge: 'New', description: 'Inside: shrimp tempura + cucumber/avocado + fresh fruits + cream cheese | Outside: crab tempura | Sauce: teriyaki + passion fruit' },
  { id: 288, name: 'Cashew Roll (4 pcs)', category: 'special', price: 205, badge: 'New', description: 'Inside: fried crab + fried salmon + cucumber/avocado | Outside: cream cheese + cashew | Sauce: teriyaki' },
  { id: 289, name: 'Cashew Roll (8 pcs)', category: 'special', price: 390, badge: 'New', description: 'Inside: fried crab + fried salmon + cucumber/avocado | Outside: cream cheese + cashew | Sauce: teriyaki' },

  // ========== FRIED ROLLS (6 Pieces) ==========
  { id: 300, name: 'Crunchy Spicy Lemon', category: 'fried', price: 219, description: '6 pcs | Inside: shrimp tempura + salmon + cream cheese | Outside: green onion | Sauce: spicy mayo + lemon mayo' },
  { id: 301, name: 'Hot Lemon Tempura', category: 'fried', price: 205, badge: 'New', description: '6 pcs | Inside: shrimp tempura + salmon + cream cheese | Outside: green onion | Sauce: spicy mayo + ponzu' },
  { id: 302, name: 'Hot Halloween', category: 'fried', price: 223, description: '6 pcs | Inside: salmon + crab + cream cheese | Outside: caviar + green onion | Sauce: spicy mayo + lemon mayo' },
  { id: 303, name: 'Electric', category: 'fried', price: 228, description: '6 pcs | Inside: shrimp tempura + crab + cream cheese | Outside: caviar paste | Sauce: teriyaki + sriracha' },
  { id: 304, name: 'Red Kraken', category: 'fried', price: 219, description: '6 pcs | Inside: shrimp tempura + cheddar | Outside: green onion | Sauce: spicy mayo + sriracha + tabasco' },
  { id: 305, name: 'Black Kraken', category: 'fried', price: 219, description: '6 pcs | Inside: salmon + cream cheese | Outside: green onion + sesame | Sauce: teriyaki' },
  { id: 306, name: 'Spider', category: 'fried', price: 228, description: '6 pcs | Inside: salmon + shrimp tempura + cream cheese | Outside: panko crumbs + caviar | Sauce: sesame mayo + kalamata olives' },
  { id: 307, name: 'Crunchy', category: 'fried', price: 197, description: '6 pcs | Inside: cream cheese | Outside: panko | Sauce: spicy mayo' },
  { id: 308, name: 'Sakura', category: 'fried', price: 232, badge: 'New', description: '6 pcs | Inside: eel + shrimp tempura + cheddar | Outside: pineapple | Sauce: passion fruit' },
  { id: 309, name: 'Hot Calamari', category: 'fried', price: 219, badge: 'New', description: '6 pcs | Inside: fried calamari + cream cheese | Outside: caviar + green onion + panko | Sauce: teriyaki + spicy mayo' },
  { id: 310, name: 'Hot Dynamite Salmon', category: 'fried', price: 236, description: '6 pcs | Inside: salmon + avocado + cream cheese | Outside: fried salmon | Sauce: spicy mayo + teriyaki' },
  { id: 311, name: 'Sunset', category: 'fried', price: 236, description: '6 pcs | Inside: salmon | Outside: fried salmon + cheddar | Sauce: spicy mayo + teriyaki' },
  { id: 312, name: 'Volcano', category: 'fried', price: 228, description: '6 pcs | Inside: crab + shrimp tempura + cream cheese | Outside: smoked salmon + cheddar | Sauce: spicy mayo + lemon mayo' },
  { id: 313, name: 'Tiger', category: 'fried', price: 219, description: '6 pcs | Inside: shrimp tempura + cream cheese | Outside: smoked salmon | Sauce: teriyaki' },
  { id: 314, name: 'Godzilla', category: 'fried', price: 197, description: '6 pcs | Inside: crab + cream cheese + smoked salmon | Outside: chopped crab | Sauce: teriyaki + sriracha' },
  { id: 315, name: 'Shrimp Addict', category: 'fried', price: 236, description: '6 pcs | Inside: shrimp tempura + cream cheese | Outside: boiled shrimp | Sauce: spicy mayo + sweet chili + teriyaki' },
  { id: 316, name: 'Salmon Addict', category: 'fried', price: 197, description: '6 pcs | Inside: salmon + cream cheese + avocado | Outside: green onion | Sauce: teriyaki + spicy mayo + tabasco' },
  { id: 317, name: 'Golden Amazing', category: 'fried', price: 219, description: '6 pcs | Inside: shrimp tempura + salmon + cheddar | Outside: kalamata olives + spicy mayo' },
  { id: 318, name: 'Crazy Smokey', category: 'fried', price: 236, badge: 'New', description: '6 pcs | Inside: smoked salmon + fried shrimp + cream cheese + avocado | Outside: caviar | Sauce: cheddar + teriyaki' },
  { id: 319, name: 'Spicy Parmesan', category: 'fried', price: 254, description: '6 pcs | Inside: shrimp tempura + crab + mushroom + cream cheese | Outside: green onion | Sauce: teriyaki + hot parmesan' },
  { id: 320, name: 'Cheetos Flamin', category: 'fried', price: 236, badge: 'New', description: '6 pcs | Inside: salmon + shrimp tempura + cream cheese + avocado | Outside: hot cheetos crumbs + jalapeño | Sauce: tabasco + spicy mayo' },
  { id: 321, name: 'Jory', category: 'fried', price: 236, description: '6 pcs | Inside: crab + salmon | Outside: green onion + cream cheese | Sauce: spicy mayo' },
  { id: 322, name: 'Jalapeno Doritos', category: 'fried', price: 205, description: '6 pcs | Inside: fried crab | Outside: jalapeño + doritos | Sauce: spicy mayo + tabasco' },
  { id: 323, name: 'Super Crunchy', category: 'fried', price: 219, badge: 'New', description: '6 pcs | Inside: crab + shrimp tempura + cream cheese | Outside: spring roll + sesame | Sauce: teriyaki' },

  // ========== POKÉ BOWLS ==========
  { id: 400, name: 'Salmon Bowl', category: 'poke', price: 338, description: 'Salmon with your choice of 5 toppings + 2 sauces' },
  { id: 401, name: 'Tuna Bowl', category: 'poke', price: 355, description: 'Tuna with your choice of 5 toppings + 2 sauces' },
  { id: 402, name: 'Shrimp Bowl', category: 'poke', price: 325, description: 'Shrimp with your choice of 5 toppings + 2 sauces' },
  { id: 403, name: 'Chicken Bowl', category: 'poke', price: 285, description: 'Chicken with your choice of 5 toppings + 2 sauces' },
  { id: 404, name: 'The Kingdom', category: 'poke', price: 618, description: 'Salmon + tuna + caviar + shrimp + crab with your choice of 5 toppings + 2 sauces' },

  // ========== COMBOS ==========
  { id: 500, name: 'Combo 12 Pieces', category: 'combos', price: 373, description: 'Regular: 2 rolls | Special: 1 roll (8 pcs) + 2 nigiri | Mix: 1 roll (6 pcs) + half roll (4 pcs) + 2 nigiri' },
  { id: 501, name: 'Combo 18 Pieces', category: 'combos', price: 566, description: 'Regular: 3 rolls | Special: 2 rolls (16 pcs) | Mix: 2 rolls (12 pcs) + half roll (4 pcs) + 2 nigiri' },
  { id: 502, name: 'Combo 24 Pieces', category: 'combos', price: 724, description: 'Regular: 4 rolls | Special: 2 rolls (16 pcs) + 2 half rolls (8 pcs) | Mix: 2 rolls (12 pcs) + 3 half rolls (12 pcs)' },
  { id: 503, name: 'Combo 30 Pieces', category: 'combos', price: 868, description: 'Regular: 5 rolls | Special: 3 rolls (24 pcs) + 1 half roll (4 pcs) + 2 nigiri | Mix: 3 rolls (18 pcs) + 3 half rolls (12 pcs)' },
  { id: 504, name: 'Combo 42 Pieces', category: 'combos', price: 1163, description: 'Regular: 7 rolls | Special: 4 rolls (32 pcs) + 2 half rolls (8 pcs) + 2 nigiri | Mix: 4 rolls (24 pcs) + 2 rolls (16 pcs) + 2 nigiri' },
  { id: 505, name: 'Combo 54 Pieces', category: 'combos', price: 1439, description: 'Regular: 9 rolls | Special: 5 rolls (40 pcs) + 3 half rolls (12 pcs) + 2 nigiri | Mix: 5 rolls (30 pcs) + 3 rolls (24 pcs)' },
  { id: 506, name: 'Combo 66 Pieces', category: 'combos', price: 1737, description: 'Regular: 11 rolls | Special: 7 rolls (56 pcs) + 2 half rolls (8 pcs) + 2 nigiri | Mix: 6 rolls (36 pcs) + 3 rolls (24 pcs) + 1 half roll (4 pcs) + 2 nigiri' },
  { id: 507, name: 'Combo 84 Pieces', category: 'combos', price: 2176, description: 'Regular: 14 rolls | Special: 9 rolls (72 pcs) + 3 half rolls (12 pcs) | Mix: 7 rolls (42 pcs) + 5 rolls (40 pcs) + 2 nigiri' },
  { id: 508, name: 'Combo 102 Pieces', category: 'combos', price: 2597, description: 'Regular: 17 rolls | Special: 10 rolls (80 pcs) + 5 half rolls (20 pcs) + 2 nigiri | Mix: 9 rolls (54 pcs) + 6 rolls (48 pcs)' },
];

const SushiMenu = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = SUSHI_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatPrice = (price) => `${price.toFixed(2)} EGP`;

  return (
    <div className="min-h-screen bg-brand-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-800/40 via-brand-900 to-brand-950">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-brand-700/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/menu"
            className="p-2.5 rounded-xl bg-brand-800/50 text-brand-300 border border-brand-700/50 hover:bg-brand-700/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <Fish className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h1 className="font-serif text-3xl text-white">Sushi & Japanese</h1>
              <p className="text-brand-400 text-sm">Veto Café & Restaurant 🧡</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-500" />
          <input
            type="text"
            placeholder="Search sushi items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-premium pl-11 w-full"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {SUSHI_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  : 'bg-brand-800/40 text-brand-400 border border-brand-700/30 hover:bg-brand-700/40 hover:text-white'
              }`}
            >
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
              className="glass-panel p-5 hover:border-rose-500/30 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-white group-hover:text-rose-400 transition-colors">
                      {item.name}
                    </h3>
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 text-[10px] font-semibold uppercase tracking-wider border border-rose-500/20">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-brand-500 text-xs mt-1 leading-relaxed">{item.description}</p>
                  )}
                </div>
                <span className="text-rose-400 font-semibold whitespace-nowrap ml-3">
                  {formatPrice(item.price)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="mt-10 glass-panel p-5 text-center">
          <p className="text-brand-400 text-sm mb-1">Prices exclude taxes and service.</p>
          <p className="text-brand-500 text-xs">Customize your combo from 90% of our sushi rolls!</p>
        </div>

        {/* Bottom CTA */}
        <div className="mt-6 text-center">
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Reserve a Table
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SushiMenu;
