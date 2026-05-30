import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { useAdminStore } from '../store/useAdminStore';

export const useReservations = () => {
  const addToast = useAdminStore((state) => state.addToast);
  const [reservations, setReservations] = useState([]);
  const [meta, setMeta] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(null);

  const fetchReservations = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page);
      params.set('limit', '20');
      if (statusFilter) params.set('status', statusFilter);
      if (dateFilter) params.set('date', dateFilter);
      if (searchQuery) params.set('search', searchQuery);

      const data = await api.get(`/admin/reservations?${params.toString()}`);
      if (data.status === 'success') {
        setReservations(data.data.reservations || []);
        setMeta(data.meta);
      } else {
        addToast(data.message || 'Failed to load reservations', 'error');
      }
    } catch {
      addToast('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, dateFilter, searchQuery, page, addToast]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleStatusChange = useCallback(async (id, newStatus) => {
    setIsUpdating(id);
    try {
      const data = await api.patch(`/admin/reservations/${id}/status`, { status: newStatus });
      if (data.status === 'success') {
        setReservations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus, qr_code: data.data.reservation.qr_code } : r))
        );
        addToast(`Reservation ${newStatus}`, 'success');
      } else {
        addToast(data.message || 'Failed to update status', 'error');
      }
    } catch {
      addToast('Network error', 'error');
    } finally {
      setIsUpdating(null);
    }
  }, [addToast]);

  const resetFilters = useCallback(() => {
    setStatusFilter('');
    setSearchQuery('');
    setDateFilter('');
    setPage(1);
  }, []);

  const handleDelete = useCallback(async (id) => {
    try {
      const data = await api.delete(`/admin/reservations/${id}`);
      if (data.status === 'success') {
        setReservations((prev) => prev.filter((r) => r.id !== id));
        setMeta((prev) => prev ? { ...prev, total: prev.total - 1 } : prev);
        addToast('Reservation deleted', 'success');
      } else {
        addToast(data.message || 'Failed to delete', 'error');
      }
    } catch {
      addToast('Network error', 'error');
    }
  }, [addToast]);

  const handleClearAll = useCallback(async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.set('dateTo', filters.dateTo);
      const data = await api.delete(`/admin/reservations?${params.toString()}`);
      if (data.status === 'success') {
        setReservations([]);
        setMeta((prev) => prev ? { ...prev, total: 0 } : prev);
        addToast(`${data.data?.deletedCount || 0} reservations cleared`, 'success');
      } else {
        addToast(data.message || 'Failed to clear', 'error');
      }
    } catch {
      addToast('Network error', 'error');
    }
  }, [addToast]);

  return {
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
    handleDelete,
    handleClearAll,
    resetFilters,
  };
};
