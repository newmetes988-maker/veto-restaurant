import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LogOut, Search, RefreshCw, Calendar, Users, Package, Layers,
  MessageSquare, Star, Percent, Ticket, Menu, X, Settings, Shield,
} from 'lucide-react';
import { useReservations } from '../../hooks/useReservations';
import { useAdminStore } from '../../store/useAdminStore';
import ReservationTable from './ReservationTable';
import { SkeletonStats, SkeletonTable } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';

const STATUS_TABS = [
  { key: '', label: 'All', color: 'text-brand-200' },
  { key: 'pending', label: 'Pending', color: 'text-amber-400' },
  { key: 'confirmed', label: 'Confirmed', color: 'text-emerald-400' },
  { key: 'completed', label: 'Completed', color: 'text-blue-400' },
  { key: 'rejected', label: 'Rejected', color: 'text-red-400' },
];

const NAV_LINKS = [
  { to: '/admin/categories', icon: Layers, label: 'Categories' },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/templates', icon: MessageSquare, label: 'Templates' },
  { to: '/admin/events', icon: Ticket, label: 'Events' },
  { to: '/admin/offers', icon: Percent, label: 'Offers' },
  { to: '/admin/reviews', icon: Star, label: 'Reviews' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
  { to: '/admin/users', icon: Shield, label: 'Users' },
];

const AdminDashboard = ({ user, onLogout }) => {
  const {
    reservations,
    meta,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    dateFilter,
    setDateFilter,
    page,
    setPage,
    isLoading,
    isUpdating,
    fetchReservations,
    handleStatusChange,
    resetFilters,
  } = useReservations();

  const addToast = useAdminStore((state) => state.addToast);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const stats = [
    {
      label: 'Today',
      icon: Calendar,
      value: reservations.filter((r) => {
        const d = new Date(r.scheduled_at);
        const t = new Date();
        return d.toDateString() === t.toDateString();
      }).length,
    },
    { label: 'Pending', icon: Users, value: reservations.filter((r) => r.status === 'pending').length },
    { label: 'Total', icon: Users, value: meta?.total || 0 },
    {
      label: 'Upcoming',
      icon: Calendar,
      value: reservations.filter((r) => new Date(r.scheduled_at) > new Date()).length,
    },
  ];

  const handlePageChange = (newPage) => setPage(newPage);

  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--color-bg-primary)' }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-30 border-b backdrop-blur-md"
        style={{
          background: 'rgba(5,5,5,0.85)',
          borderColor: 'var(--color-border-default)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center border"
                style={{
                  background: 'rgba(212,175,55,0.08)',
                  borderColor: 'rgba(212,175,55,0.15)',
                }}
              >
                <Users className="w-5 h-5" style={{ color: 'var(--color-text-gold)' }} />
              </div>
              <div>
                <h1 className="font-serif text-base sm:text-lg text-white leading-tight">Reservations</h1>
                <p className="text-[10px] uppercase tracking-wider hidden sm:block" style={{ color: 'var(--color-text-muted)' }}>
                  Management
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.50)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.50)';
                  }}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
              <div className="hidden sm:flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                {user?.firstName} {user?.lastName}
              </div>
              <button
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="sm:hidden p-2 rounded-lg transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <button
                onClick={onLogout}
                className="hidden sm:block p-2 rounded-lg transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          {mobileNavOpen && (
            <div
              className="sm:hidden pb-3 pt-2 animate-fade-in"
              style={{ borderTop: '1px solid var(--color-border-default)' }}
            >
              <div className="flex flex-col gap-1.5">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileNavOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
                    style={{ color: 'rgba(255,255,255,0.50)' }}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                ))}
                <div className="flex items-center gap-2 px-3 py-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  {user?.firstName} {user?.lastName}
                </div>
                <button
                  onClick={() => { setMobileNavOpen(false); onLogout(); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 transition-colors"
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
        {isLoading && !reservations.length ? (
          <SkeletonStats />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="p-4 rounded-2xl backdrop-blur-sm border"
                style={{
                  background: 'var(--color-bg-glass)',
                  borderColor: 'var(--color-border-default)',
                }}
              >
                <div className="flex items-center gap-2 mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  <s.icon className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wider">{s.label}</span>
                </div>
                <div className="text-2xl font-semibold text-white">{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex flex-wrap gap-2">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setStatusFilter(tab.key); setPage(1); }}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: statusFilter === tab.key ? 'rgba(212,175,55,0.10)' : 'rgba(255,255,255,0.03)',
                  color: statusFilter === tab.key ? 'var(--color-text-gold)' : 'rgba(255,255,255,0.45)',
                  border: `1px solid ${statusFilter === tab.key ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Search guest..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="text-sm py-2.5 min-w-[180px] pl-10 pr-4 rounded-xl outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: '#fff',
                }}
              />
            </div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
              className="text-sm py-2.5 px-3 rounded-xl outline-none"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                color: '#fff',
                colorScheme: 'dark',
              }}
            />
            <button
              onClick={fetchReservations}
              disabled={isLoading}
              className="p-2.5 rounded-xl transition-colors disabled:opacity-50"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.50)',
              }}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Table */}
        {isLoading && !reservations.length ? (
          <SkeletonTable />
        ) : reservations.length === 0 ? (
          <EmptyState />
        ) : (
          <ReservationTable
            reservations={reservations}
            meta={meta}
            onPageChange={handlePageChange}
            onStatusChange={handleStatusChange}
            isUpdating={isUpdating}
          />
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
