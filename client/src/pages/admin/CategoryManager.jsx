import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, X, Save, Layers } from 'lucide-react';

const ICONS = [
  'soup', 'noodles', 'appetizer', 'gunkan', 'temaki', 'oshi',
  'nigiri', 'sashimi', 'maki', 'special', 'fried', 'dynamite',
  'fire', 'poke', 'combos', 'coffee', 'juices', 'mocktails',
  'milkshake', 'dessert', 'waffle', 'utensils', 'cup', 'cake',
  'fish', 'flame', 'star',
];

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', nameAr: '', slug: '', icon: 'utensils', sortOrder: 0, isActive: true,
  });

  const token = localStorage.getItem('admin_token');

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/categories');
      const data = await res.json();
      if (data.status === 'success') setCategories(data.data.categories);
    } catch {}
    setIsLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const resetForm = () => {
    setFormData({ name: '', nameAr: '', slug: '', icon: 'utensils', sortOrder: 0, isActive: true });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId ? `/api/v1/admin/categories/${editingId}` : '/api/v1/admin/categories';
    const method = editingId ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          ...formData,
          sortOrder: parseInt(formData.sortOrder, 10) || 0,
        }),
      });
      if (res.ok) { resetForm(); fetchCategories(); }
      else {
        const err = await res.json();
        alert(err.message || 'Failed to save category');
      }
    } catch { alert('Network error'); }
  };

  const handleEdit = (cat) => {
    setFormData({
      name: cat.name,
      nameAr: cat.name_ar || '',
      slug: cat.slug,
      icon: cat.icon || 'utensils',
      sortOrder: cat.sort_order,
      isActive: cat.is_active,
    });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? Products using it will need to be reassigned.')) return;
    try {
      const res = await fetch(`/api/v1/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) fetchCategories();
      else {
        const err = await res.json();
        alert(err.message || 'Failed to delete');
      }
    } catch {}
  };

  return (
    <div className="min-h-screen bg-brand-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-800/40 via-brand-900 to-brand-950">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/admin" className="p-2 sm:p-2.5 rounded-xl bg-brand-800/50 text-brand-300 border border-brand-700/50 hover:bg-brand-700/50 transition-colors">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl text-white">Category Manager</h1>
              <p className="text-brand-400 text-xs sm:text-sm">Customize menu section names & order</p>
            </div>
          </div>
          <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn-primary flex items-center gap-2">
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Cancel' : 'Add Category'}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="glass-panel p-6 mb-8 animate-slide-up space-y-4">
            <h3 className="font-serif text-xl text-white mb-4">{editingId ? 'Edit Category' : 'New Category'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-brand-300 mb-1">Name (EN) *</label>
                <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-premium" />
              </div>
              <div>
                <label className="block text-sm text-brand-300 mb-1">Name (AR) *</label>
                <input required value={formData.nameAr} onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })} className="input-premium" dir="rtl" />
              </div>
              <div>
                <label className="block text-sm text-brand-300 mb-1">Slug *</label>
                <input required value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} className="input-premium" placeholder="e.g. special-rolls" />
              </div>
              <div>
                <label className="block text-sm text-brand-300 mb-1">Sort Order</label>
                <input type="number" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })} className="input-premium" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-brand-300 mb-2">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        formData.icon === icon
                          ? 'bg-gold-500/15 text-gold-400 border-gold-500/30'
                          : 'bg-brand-800/40 text-brand-400 border-brand-700/30 hover:bg-brand-700/40 hover:text-white'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button type="submit" className="btn-primary flex items-center gap-2">
                <Save className="w-4 h-4" />
                {editingId ? 'Update Category' : 'Create Category'}
              </button>
              <label className="flex items-center gap-2 text-brand-300 text-sm cursor-pointer">
                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4 rounded accent-gold-500" />
                Active
              </label>
            </div>
          </form>
        )}

        {/* Categories Table */}
        <div className="glass-panel overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-brand-500">Loading...</div>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center text-brand-500">No categories yet. Add your first section!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-brand-800/80 text-brand-300 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Order</th>
                    <th className="px-5 py-3.5">Name (EN)</th>
                    <th className="px-5 py-3.5">Name (AR)</th>
                    <th className="px-5 py-3.5">Slug</th>
                    <th className="px-5 py-3.5">Icon</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-700/30">
                  {categories.map((c) => (
                    <tr key={c.id} className="bg-brand-800/20 hover:bg-brand-800/40 transition-colors">
                      <td className="px-5 py-4 text-brand-400">{c.sort_order}</td>
                      <td className="px-5 py-4 font-medium text-white">{c.name}</td>
                      <td className="px-5 py-4 text-brand-300">{c.name_ar}</td>
                      <td className="px-5 py-4 text-brand-400 text-xs font-mono">{c.slug}</td>
                      <td className="px-5 py-4 text-brand-400 text-xs">{c.icon}</td>
                      <td className="px-5 py-4">
                        {c.is_active ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">Active</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-brand-700/40 text-brand-400 text-[10px] font-semibold border border-brand-600/30">Inactive</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEdit(c)} className="p-2 rounded-lg bg-brand-700/40 hover:bg-brand-700/70 text-brand-300 transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
