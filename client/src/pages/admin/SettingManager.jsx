import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, RefreshCw, Globe, Mail, MapPin, Phone } from 'lucide-react';
import { api } from '../../utils/api';

const SOCIAL_PLATFORMS = [
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/...' },
  { key: 'twitter', label: 'X (Twitter)', placeholder: 'https://x.com/...' },
  { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@...' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
];

const SettingManager = () => {
  const [settings, setSettings] = useState({
    socialLinks: {},
    contactPhones: [''],
    contactEmail: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('/admin/settings');
      if (data.status === 'success') {
        const d = data.data;
        setSettings({
          socialLinks: d.socialLinks || {},
          contactPhones: Array.isArray(d.contactPhones) && d.contactPhones.length > 0 ? d.contactPhones : [''],
          contactEmail: d.contactEmail || '',
          address: d.address || '',
        });
      } else {
        setError(data.message || 'Failed to load settings');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSocialChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [key]: value },
    }));
  };

  const handlePhoneChange = (index, value) => {
    setSettings((prev) => {
      const phones = [...prev.contactPhones];
      phones[index] = value;
      return { ...prev, contactPhones: phones };
    });
  };

  const addPhone = () => {
    setSettings((prev) => ({ ...prev, contactPhones: [...prev.contactPhones, ''] }));
  };

  const removePhone = (index) => {
    setSettings((prev) => {
      const phones = prev.contactPhones.filter((_, i) => i !== index);
      return { ...prev, contactPhones: phones.length ? phones : [''] };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      const payload = {
        socialLinks: settings.socialLinks,
        contactPhones: settings.contactPhones.filter((p) => p.trim() !== ''),
        contactEmail: settings.contactEmail,
        address: settings.address,
      };
      const data = await api.patch('/admin/settings', payload);
      if (data.status === 'success') {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.message || 'Failed to save');
      }
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-800/40 via-brand-900 to-brand-950">
      {/* Header */}
      <header className="border-b border-brand-700/30 bg-brand-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-3">
              <Link
                to="/admin"
                className="p-2 rounded-lg text-brand-400 hover:text-white hover:bg-brand-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="font-serif text-base sm:text-lg text-white leading-tight">Settings</h1>
                <p className="text-[10px] text-brand-500 uppercase tracking-wider">Social & Contact</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchSettings}
                disabled={loading}
                className="p-2 rounded-lg text-brand-400 hover:text-white hover:bg-brand-800 transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold-500/15 text-gold-400 border border-gold-500/30 hover:bg-gold-500/25 transition-colors text-sm font-medium disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
            <p className="text-emerald-400 text-sm">Settings saved successfully!</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Social Links */}
          <div className="glass-panel p-6">
            <div className="flex items-center gap-2 mb-5">
              <Globe className="w-4 h-4 text-gold-400" />
              <h2 className="text-white font-medium">Social Media Links</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SOCIAL_PLATFORMS.map((platform) => (
                <div key={platform.key}>
                  <label className="block text-xs text-brand-400 mb-1.5">{platform.label}</label>
                  <input
                    type="url"
                    value={settings.socialLinks[platform.key] || ''}
                    onChange={(e) => handleSocialChange(platform.key, e.target.value)}
                    placeholder={platform.placeholder}
                    className="input-premium w-full text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="glass-panel p-6">
            <div className="flex items-center gap-2 mb-5">
              <Phone className="w-4 h-4 text-gold-400" />
              <h2 className="text-white font-medium">Contact Information</h2>
            </div>

            {/* Phones */}
            <div className="mb-4">
              <label className="block text-xs text-brand-400 mb-2">Phone Numbers</label>
              <div className="space-y-2">
                {settings.contactPhones.map((phone, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => handlePhoneChange(index, e.target.value)}
                      placeholder="e.g. 01050101097"
                      className="input-premium flex-1 text-sm"
                    />
                    <button
                      onClick={() => removePhone(index)}
                      className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addPhone}
                className="mt-2 flex items-center gap-1.5 text-sm text-gold-400 hover:text-gold-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add phone number
              </button>
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-xs text-brand-400 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500" />
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings((prev) => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="hello@veto.restaurant"
                  className="input-premium w-full pl-10 text-sm"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs text-brand-400 mb-1.5">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-brand-500" />
                <textarea
                  value={settings.address}
                  onChange={(e) => setSettings((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="Gleembay / Montaza, Alexandria"
                  rows={2}
                  className="input-premium w-full pl-10 text-sm resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingManager;
