import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, RefreshCw, Users, Shield, Mail, Lock, Eye, EyeOff, X } from 'lucide-react';
import { api } from '../../utils/api';

const ROLES = ['owner', 'manager', 'host', 'staff'];

const AdminUserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'staff',
    isActive: true,
  });

  const resetForm = () => {
    setForm({ email: '', password: '', firstName: '', lastName: '', role: 'staff', isActive: true });
    setEditingId(null);
    setShowPassword(false);
    setError(null);
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('/admin/users');
      if (data.status === 'success') {
        setUsers(data.data.users || []);
      } else {
        setError(data.message || 'Failed to load users');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      let data;
      const payload = {
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        role: form.role,
      };
      if (form.password) payload.password = form.password;

      if (editingId) {
        if (form.isActive !== undefined) payload.isActive = form.isActive;
        data = await api.patch(`/admin/users/${editingId}`, payload);
      } else {
        if (!form.password) {
          setError('Password is required for new users');
          setSaving(false);
          return;
        }
        payload.password = form.password;
        data = await api.post('/admin/users', payload);
      }

      if (data.status === 'success') {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        resetForm();
        setShowForm(false);
        fetchUsers();
      } else {
        setError(data.message || 'Failed to save');
      }
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const data = await api.delete(`/admin/users/${id}`);
      if (data.status === 'success') {
        fetchUsers();
      } else {
        setError(data.message || 'Failed to delete');
      }
    } catch {
      setError('Network error');
    }
  };

  const startEdit = (user) => {
    setForm({
      email: user.email || '',
      password: '',
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      role: user.role || 'staff',
      isActive: user.is_active !== false,
    });
    setEditingId(user.id);
    setShowForm(true);
    setShowPassword(false);
    setError(null);
  };

  const startCreate = () => {
    resetForm();
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-brand-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-800/40 via-brand-900 to-brand-950">
      {/* Header */}
      <header className="border-b border-brand-700/30 bg-brand-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-3">
              <Link to="/admin" className="p-2 rounded-lg text-brand-400 hover:text-white hover:bg-brand-800 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="font-serif text-base sm:text-lg text-white leading-tight">Admin Users</h1>
                <p className="text-[10px] text-brand-500 uppercase tracking-wider">Manage Staff & Owners</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchUsers} disabled={loading} className="p-2 rounded-lg text-brand-400 hover:text-white hover:bg-brand-800 transition-colors disabled:opacity-50" title="Refresh">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={startCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold-500/15 text-gold-400 border border-gold-500/30 hover:bg-gold-500/25 transition-colors text-sm font-medium">
                <Plus className="w-4 h-4" /> Add User
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center justify-between">
            <p className="text-red-400 text-sm">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {success && (
          <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
            <p className="text-emerald-400 text-sm">Saved successfully!</p>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="glass-panel p-6 mb-6 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-medium flex items-center gap-2">
                <Shield className="w-4 h-4 text-gold-400" />
                {editingId ? 'Edit User' : 'New User'}
              </h2>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="text-brand-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-brand-400 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500" />
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="user@restaurant.com" required className="input-premium w-full pl-10 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-brand-400 mb-1.5">
                  Password {editingId && <span className="text-brand-600">(leave blank to keep)</span>}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500" />
                  <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editingId ? '••••••••' : 'Min 8 characters'} className="input-premium w-full pl-10 pr-10 text-sm" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-500 hover:text-brand-300">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-brand-400 mb-1.5">First Name</label>
                <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="John" required className="input-premium w-full text-sm" />
              </div>

              <div>
                <label className="block text-xs text-brand-400 mb-1.5">Last Name</label>
                <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Doe" required className="input-premium w-full text-sm" />
              </div>

              <div>
                <label className="block text-xs text-brand-400 mb-1.5">Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input-premium w-full text-sm">
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                  ))}
                </select>
              </div>

              {editingId && (
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-brand-300 cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 rounded border-brand-600 bg-brand-800 text-gold-500 focus:ring-gold-500/50" />
                    Active
                  </label>
                </div>
              )}

              <div className="sm:col-span-2 flex justify-end gap-3">
                <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="px-4 py-2 rounded-lg text-brand-400 hover:text-white hover:bg-brand-800 transition-colors text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gold-500/15 text-gold-400 border border-gold-500/30 hover:bg-gold-500/25 transition-colors text-sm font-medium disabled:opacity-50">
                  <Save className="w-4 h-4" /> {saving ? 'Saving...' : (editingId ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users Table */}
        <div className="glass-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-brand-400 uppercase bg-brand-800/30">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-700/20">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-brand-800/20 transition-colors">
                    <td className="px-4 py-3 text-white font-medium">
                      {u.first_name} {u.last_name}
                    </td>
                    <td className="px-4 py-3 text-brand-400">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                        u.role === 'owner' ? 'bg-gold-500/15 text-gold-400 border border-gold-500/20' :
                        u.role === 'manager' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' :
                        'bg-brand-700/40 text-brand-400 border border-brand-600/30'
                      }`}>
                        <Shield className="w-3 h-3" /> {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs ${u.is_active ? 'text-emerald-400' : 'text-brand-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-400' : 'bg-brand-500'}`} />
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => startEdit(u)} className="p-1.5 rounded-lg text-brand-400 hover:text-gold-400 hover:bg-gold-500/10 transition-colors" title="Edit">
                          <Users className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(u.id)} className="p-1.5 rounded-lg text-brand-400 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-brand-500">
                      No admin users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminUserManager;
