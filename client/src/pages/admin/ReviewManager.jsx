import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Trash2, Star, Quote } from 'lucide-react';

const ReviewManager = () => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem('admin_token');

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/reviews/all', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.status === 'success') setReviews(data.data.reviews);
    } catch {}
    setIsLoading(false);
  };

  useEffect(() => { fetchReviews(); }, []);

  const approve = async (id) => {
    try {
      const res = await fetch(`/api/v1/reviews/${id}/approve`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) fetchReviews();
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      const res = await fetch(`/api/v1/reviews/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) fetchReviews();
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
              <h1 className="font-serif text-2xl sm:text-3xl text-white">Review Manager</h1>
              <p className="text-brand-400 text-xs sm:text-sm">Approve or remove customer reviews</p>
            </div>
          </div>
        </div>

        <div className="glass-panel overflow-hidden">
          {isLoading ? <div className="p-12 text-center text-brand-500">Loading...</div> : reviews.length === 0 ? <div className="p-12 text-center text-brand-500">No reviews yet.</div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-brand-800/80 text-brand-300 uppercase text-xs tracking-wider"><tr><th className="px-5 py-3.5">Guest</th><th className="px-5 py-3.5">Rating</th><th className="px-5 py-3.5">Comment</th><th className="px-5 py-3.5">Status</th><th className="px-5 py-3.5 text-center">Actions</th></tr></thead>
                <tbody className="divide-y divide-brand-700/30">
                  {reviews.map((r) => (
                    <tr key={r.id} className="bg-brand-800/20 hover:bg-brand-800/40 transition-colors">
                      <td className="px-5 py-4 font-medium text-white">{r.customer_name}</td>
                      <td className="px-5 py-4"><div className="flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'text-gold-400 fill-gold-400' : 'text-brand-700'}`} />)}</div></td>
                      <td className="px-5 py-4 text-brand-300 max-w-xs truncate">{r.comment}</td>
                      <td className="px-5 py-4">{r.is_approved ? <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">Approved</span> : <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-semibold border border-amber-500/20">Pending</span>}</td>
                      <td className="px-5 py-4"><div className="flex items-center justify-center gap-2">{!r.is_approved && <button onClick={() => approve(r.id)} className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors" title="Approve"><CheckCircle2 className="w-4 h-4" /></button>}<button onClick={() => handleDelete(r.id)} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button></div></td>
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

export default ReviewManager;
