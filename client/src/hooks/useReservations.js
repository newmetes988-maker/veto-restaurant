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
    resetFilters,
  };
};
