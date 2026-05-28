import React, { useEffect, useState, useCallback } from 'react';
import { LogOut, Filter, Search, RefreshCw, Calendar, Users, Package, Layers, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import ReservationTable from './ReservationTable';
import StatusBadge from './StatusBadge';
import { api } from '../../utils/api';

const STATUS_TABS = [
  { key: '', label: 'All', color: 'text-brand-200' },
  { key: 'pending', label: 'Pending', color: 'text-amber-400' },
  { key: 'confirmed', label: 'Confirmed', color: 'text-emerald-400' },
  { key: 'completed', label: 'Completed', color: 'text-blue-400' },
  { key: 'rejected', label: 'Rejected', color: 'text-red-400' },
];

const AdminDashboard = ({ user, onLogout }) => {
  const [reservations, setReservations] = useState([]);
  const [meta, setMeta] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(null);
  const [error, setError] = useState(null);

  const fetchReservations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', page);
      params.set('limit', '20');
      if (statusFilter) params.set('status', statusFilter);
      if (dateFilter) params.set('date', dateFilter);
      if (searchQuery) params.set('search', searchQuery);

      const data = await api.get(`/admin/reservations?${params.toString()}`);
      if (data.status === 'success') {
        setReservations(data.data.reservations);
        setMeta(data.meta);
      } else {
        setError(data.message || 'Failed to load reservations');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, dateFilter, searchQuery, page]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleStatusChange = async (id, newStatus) => {
    setIsUpdating(id);
    try {
      const data = await api.patch(`/admin/reservations/${id}/status`, { status: newStatus });
      if (data.status === 'success') {
        setReservations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus, qr_code: data.data.reservation.qr_code } : r))
        );
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch {
      alert('Network error');
    } finally {
      setIsUpdating(null);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const stats = [
    { label: 'Today', icon: Calendar, value: reservations.filter((r) => {
      const d = new Date(r.scheduled_at);
      const t = new Date();
      return d.toDateString() === t.toDateString();
    }).length },
    { label: 'Pending', icon: Users, value: reservations.filter((r) => r.status === 'pending').length },
  ];

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-800/40 via-brand-900 to-brand-950">
      {/* Top Bar */}
      <header className="border-b border-brand-700/30 bg-brand-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gold-400" />
              </div>
              <div>
                <h1 className="font-serif text-base sm:text-lg text-white leading-tight">Reservations</h1>
                <p className="text-[10px] text-brand-500 uppercase tracking-wider hidden sm:block">Management</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/admin/categories"
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-800/50 text-brand-300 border border-brand-700/50 hover:bg-brand-700/50 hover:text-white transition-colors text-sm"
              >
                <Layers className="w-4 h-4" />
                Categories
              </Link>
              <Link
                to="/admin/products"
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-800/50 text-brand-300 border border-brand-700/50 hover:bg-brand-700/50 hover:text-white transition-colors text-sm"
              >
                <Package className="w-4 h-4" />
                Products
              </Link>
              <div className="hidden sm:flex items-center gap-2 text-sm text-brand-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                {user?.firstName} {user?.lastName}
              </div>
              <button
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="sm:hidden p-2 rounded-lg text-brand-400 hover:text-white hover:bg-brand-800 transition-colors"
              >
                {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <button
                onClick={onLogout}
                className="hidden sm:block p-2 rounded-lg text-brand-400 hover:text-white hover:bg-brand-800 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          {mobileNavOpen && (
            <div className="sm:hidden pb-3 border-t border-brand-700/30 pt-2 animate-fade-in">
              <div className="flex flex-col gap-1.5">
                <Link
                  to="/admin/categories"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-brand-300 hover:text-white hover:bg-brand-800/50 transition-colors text-sm"
                >
                  <Layers className="w-4 h-4" />
                  Categories
                </Link>
                <Link
                  to="/admin/products"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-brand-300 hover:text-white hover:bg-brand-800/50 transition-colors text-sm"
                >
                  <Package className="w-4 h-4" />
                  Products
                </Link>
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-brand-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  {user?.firstName} {user?.lastName}
                </div>
                <button
                  onClick={() => { setMobileNavOpen(false); onLogout(); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="glass-panel p-4">
              <div className="flex items-center gap-2 text-brand-500 mb-1">
                <s.icon className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider">{s.label}</span>
              </div>
              <div className="text-2xl font-semibold text-white">{s.value}</div>
            </div>
          ))}
          <div className="glass-panel p-4">
            <div className="flex items-center gap-2 text-brand-500 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider">Total</span>
            </div>
            <div className="text-2xl font-semibold text-white">{meta?.total || 0}</div>
          </div>
          <div className="glass-panel p-4">
            <div className="flex items-center gap-2 text-brand-500 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider">Upcoming</span>
            </div>
            <div className="text-2xl font-semibold text-white">
              {reservations.filter((r) => new Date(r.scheduled_at) > new Date()).length}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status Tabs */}
          <div className="flex-1 flex flex-wrap gap-2">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setStatusFilter(tab.key); setPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === tab.key
                    ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30'
                    : 'bg-brand-800/40 text-brand-400 border border-brand-700/30 hover:bg-brand-700/40 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Date */}
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500" />
              <input
                type="text"
                placeholder="Search guest..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="input-premium pl-10 text-sm py-2.5 min-w-[180px]"
              />
            </div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
              className="input-premium text-sm py-2.5 [color-scheme:dark]"
            />
            <button
              onClick={fetchReservations}
              disabled={isLoading}
              className="p-2.5 rounded-lg bg-brand-800/50 text-brand-300 border border-brand-700/50 hover:bg-brand-700/50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Table */}
        <ReservationTable
          reservations={reservations}
          meta={meta}
          onPageChange={handlePageChange}
          onStatusChange={handleStatusChange}
          isUpdating={isUpdating}
        />
      </main>
    </div>
  );
};

export default AdminDashboard;
