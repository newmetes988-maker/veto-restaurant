import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, X, Save, Percent } from 'lucide-react';

const OfferManager = () => {
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', discountPercent: '', discountAmount: '', code: '',
    imageUrl: '', startDate: '', endDate: '', terms: '', isFeatured: false, isActive: true,
  });

  const token = localStorage.getItem('admin_token');

  const fetchOffers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/offers', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.status === 'success') setOffers(data.data.offers);
    } catch {}
    setIsLoading(false);
  };

  useEffect(() => { fetchOffers(); }, []);

  const resetForm = () => {
    setFormData({ title: '', description: '', discountPercent: '', discountAmount: '', code: '', imageUrl: '', startDate: '', endDate: '', terms: '', isFeatured: false, isActive: true });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId ? `/api/v1/offers/${editingId}` : '/api/v1/offers';
    const method = editingId ? 'PATCH' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...formData,
          discountPercent: parseInt(formData.discountPercent) || 0,
          discountAmount: parseFloat(formData.discountAmount) || 0,
        }),
      });
      if (res.ok) { resetForm(); fetchOffers(); }
      else alert('Failed to save offer');
    } catch { alert('Network error'); }
  };

  const handleEdit = (o) => {
    setFormData({
      title: o.title, description: o.description || '', discountPercent: o.discount_percent || '',
      discountAmount: o.discount_amount || '', code: o.code || '', imageUrl: o.image_url || '',
      startDate: o.start_date ? o.start_date.slice(0, 10) : '', endDate: o.end_date ? o.end_date.slice(0, 10) : '',
      terms: o.terms || '', isFeatured: o.is_featured, isActive: o.is_active,
    });
    setEditingId(o.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this offer?')) return;
    try {
      const res = await fetch(`/api/v1/offers/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) fetchOffers();
    } catch {}
  };

  return (
    <div className="min-h-screen bg-brand-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-800/40 via-brand-900 to-brand-950">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/admin" className="p-2 sm:p-2.5 rounded-xl bg-brand-800/50 text-brand-300 border border-brand-700/50 hover:bg-brand-700/50 transition-colors">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl text-white">Offer Manager</h1>
              <p className="text-brand-400 text-xs sm:text-sm">Manage promotions & discounts</p>
            </div>
          </div>
          <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn-primary flex items-center gap-2">
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Cancel' : 'Add Offer'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="glass-panel p-6 mb-8 animate-slide-up space-y-4">
            <h3 className="font-serif text-xl text-white mb-4">{editingId ? 'Edit Offer' : 'New Offer'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm text-brand-300 mb-1">Title *</label><input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="input-premium" /></div>
              <div><label className="block text-sm text-brand-300 mb-1">Code</label><input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="PROMO20" className="input-premium" /></div>
              <div><label className="block text-sm text-brand-300 mb-1">Discount %</label><input type="number" value={formData.discountPercent} onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })} className="input-premium" /></div>
              <div><label className="block text-sm text-brand-300 mb-1">Discount Amount</label><input type="number" value={formData.discountAmount} onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })} className="input-premium" /></div>
              <div><label className="block text-sm text-brand-300 mb-1">Start Date</label><input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="input-premium [color-scheme:dark]" /></div>
              <div><label className="block text-sm text-brand-300 mb-1">End Date</label><input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="input-premium [color-scheme:dark]" /></div>
              <div><label className="block text-sm text-brand-300 mb-1">Image URL</label><input value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} placeholder="https://..." className="input-premium" /></div>
              <div className="flex items-center gap-4 pt-6">
                <label className="flex items-center gap-2 text-brand-300 text-sm cursor-pointer"><input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} className="w-4 h-4 rounded accent-gold-500" />Featured</label>
                <label className="flex items-center gap-2 text-brand-300 text-sm cursor-pointer"><input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4 rounded accent-gold-500" />Active</label>
              </div>
              <div className="md:col-span-2"><label className="block text-sm text-brand-300 mb-1">Description</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} className="input-premium resize-none" /></div>
              <div className="md:col-span-2"><label className="block text-sm text-brand-300 mb-1">Terms</label><textarea value={formData.terms} onChange={(e) => setFormData({ ...formData, terms: e.target.value })} rows={2} className="input-premium resize-none" /></div>
            </div>
            <button type="submit" className="btn-primary flex items-center gap-2"><Save className="w-4 h-4" />{editingId ? 'Update Offer' : 'Create Offer'}</button>
          </form>
        )}

        <div className="glass-panel overflow-hidden">
          {isLoading ? <div className="p-12 text-center text-brand-500">Loading...</div> : offers.length === 0 ? <div className="p-12 text-center text-brand-500">No offers yet.</div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-brand-800/80 text-brand-300 uppercase text-xs tracking-wider"><tr><th className="px-5 py-3.5">Title</th><th className="px-5 py-3.5">Discount</th><th className="px-5 py-3.5">Code</th><th className="px-5 py-3.5">Status</th><th className="px-5 py-3.5 text-center">Actions</th></tr></thead>
                <tbody className="divide-y divide-brand-700/30">
                  {offers.map((o) => (
                    <tr key={o.id} className="bg-brand-800/20 hover:bg-brand-800/40 transition-colors">
                      <td className="px-5 py-4"><div className="font-medium text-white">{o.title}</div>{o.is_featured && <span className="text-[10px] text-gold-400">★ Featured</span>}</td>
                      <td className="px-5 py-4 text-gold-400">{o.discount_percent > 0 ? `${o.discount_percent}%` : `${o.discount_amount} EGP`}</td>
                      <td className="px-5 py-4 text-brand-300 font-mono text-xs">{o.code || '-'}</td>
                      <td className="px-5 py-4">{o.is_active ? <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">Active</span> : <span className="px-2 py-0.5 rounded-full bg-brand-700/40 text-brand-400 text-[10px] font-semibold border border-brand-600/30">Inactive</span>}</td>
                      <td className="px-5 py-4"><div className="flex items-center justify-center gap-2"><button onClick={() => handleEdit(o)} className="p-2 rounded-lg bg-brand-700/40 hover:bg-brand-700/70 text-brand-300 transition-colors"><Pencil className="w-4 h-4" /></button><button onClick={() => handleDelete(o.id)} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button></div></td>
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

export default OfferManager;
