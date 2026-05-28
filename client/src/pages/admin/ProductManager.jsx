import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, X, Save, ImageIcon } from 'lucide-react';

const BADGES = ['', 'New', 'Popular', 'Spicy', 'Hot'];

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', nameAr: '', description: '', descriptionAr: '',
    price: '', category: '', imageUrl: '', badge: '', isActive: true
  });

  const token = localStorage.getItem('admin_token');

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/products');
      const data = await res.json();
      if (data.status === 'success') setProducts(data.data.products);
    } catch {}
    setIsLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/v1/categories');
      const data = await res.json();
      if (data.status === 'success') {
        setCategories(data.data.categories);
        if (data.data.categories.length > 0 && !formData.category) {
          setFormData((prev) => ({ ...prev, category: data.data.categories[0].name }));
        }
      }
    } catch {}
  };

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  const resetForm = () => {
    setFormData({ name: '', nameAr: '', description: '', descriptionAr: '', price: '', category: categories[0]?.name || '', imageUrl: '', badge: '', isActive: true });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId ? `/api/v1/admin/products/${editingId}` : '/api/v1/admin/products';
    const method = editingId ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
        }),
      });
      if (res.ok) { resetForm(); fetchProducts(); }
      else { alert('Failed to save product'); }
    } catch { alert('Network error'); }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      nameAr: product.name_ar || '',
      description: product.description || '',
      descriptionAr: product.description_ar || '',
      price: product.price,
      category: product.category,
      imageUrl: product.image_url || '',
      badge: product.badge || '',
      isActive: product.is_active,
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      const res = await fetch(`/api/v1/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) fetchProducts();
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
              <h1 className="font-serif text-2xl sm:text-3xl text-white">Product Manager</h1>
              <p className="text-brand-400 text-xs sm:text-sm">Add, edit, or remove menu items</p>
            </div>
          </div>
          <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn-primary flex items-center gap-2">
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Cancel' : 'Add Product'}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="glass-panel p-6 mb-8 animate-slide-up space-y-4">
            <h3 className="font-serif text-xl text-white mb-4">{editingId ? 'Edit Product' : 'New Product'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-brand-300 mb-1">Name (EN) *</label>
                <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-premium" />
              </div>
              <div>
                <label className="block text-sm text-brand-300 mb-1">Name (AR)</label>
                <input value={formData.nameAr} onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })} className="input-premium" dir="rtl" />
              </div>
              <div>
                <label className="block text-sm text-brand-300 mb-1">Price (EGP) *</label>
                <input required type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="input-premium" />
              </div>
              <div>
                <label className="block text-sm text-brand-300 mb-1">Category *</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="input-premium appearance-none">
                  {categories.length === 0 && <option>Loading...</option>}
                  {categories.map((c) => <option key={c.id} value={c.name}>{c.name} ({c.name_ar})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-brand-300 mb-1">Badge</label>
                <select value={formData.badge} onChange={(e) => setFormData({ ...formData, badge: e.target.value })} className="input-premium appearance-none">
                  {BADGES.map((b) => <option key={b} value={b}>{b || 'None'}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-brand-300 mb-1">Image URL</label>
                <input value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} placeholder="https://..." className="input-premium" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-brand-300 mb-1">Description (EN)</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} className="input-premium resize-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-brand-300 mb-1">Description (AR)</label>
                <textarea value={formData.descriptionAr} onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })} rows={2} className="input-premium resize-none" dir="rtl" />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button type="submit" className="btn-primary flex items-center gap-2">
                <Save className="w-4 h-4" />
                {editingId ? 'Update Product' : 'Create Product'}
              </button>
              <label className="flex items-center gap-2 text-brand-300 text-sm cursor-pointer">
                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4 rounded accent-gold-500" />
                Active
              </label>
            </div>
          </form>
        )}

        {/* Products Table */}
        <div className="glass-panel overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-brand-500">Loading...</div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-brand-500">No products yet. Add your first item!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-brand-800/80 text-brand-300 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Name</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Price</th>
                    <th className="px-5 py-3.5">Badge</th>
                    <th className="px-5 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-700/30">
                  {products.map((p) => (
                    <tr key={p.id} className="bg-brand-800/20 hover:bg-brand-800/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-medium text-white">{p.name}</div>
                        {p.name_ar && <div className="text-xs text-brand-500">{p.name_ar}</div>}
                      </td>
                      <td className="px-5 py-4 text-brand-300">{p.category}</td>
                      <td className="px-5 py-4 text-gold-400 font-semibold">{parseFloat(p.price).toFixed(2)} EGP</td>
                      <td className="px-5 py-4">
                        {p.badge && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 text-[10px] font-semibold uppercase border border-rose-500/20">{p.badge}</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEdit(p)} className="p-2 rounded-lg bg-brand-700/40 hover:bg-brand-700/70 text-brand-300 transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
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

export default ProductManager;
