import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save, Pencil, MessageSquare, Eye, RotateCcw } from 'lucide-react';

const BUILT_IN_TEMPLATES = [
  {
    name: 'reservation_confirmed',
    label: 'Reservation Confirmed',
    description: 'Sent when admin confirms a reservation',
    variables: ['customer_name', 'date', 'time', 'party_size', 'qr_url'],
  },
  {
    name: 'reservation_rejected',
    label: 'Reservation Rejected',
    description: 'Sent when admin rejects a reservation',
    variables: ['customer_name', 'date', 'time'],
  },
  {
    name: 'reservation_cancelled',
    label: 'Reservation Cancelled',
    description: 'Sent when admin cancels a reservation',
    variables: ['customer_name', 'date', 'time'],
  },
];

const MessageTemplateManager = () => {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingName, setEditingName] = useState(null);
  const [body, setBody] = useState('');
  const [preview, setPreview] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const token = localStorage.getItem('admin_token');

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/admin/templates', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === 'success') {
        setTemplates(data.data.templates);
      }
    } catch {}
    setIsLoading(false);
  };

  useEffect(() => { fetchTemplates(); }, []);

  const getTemplateByName = (name) => templates.find((t) => t.name === name);

  const startEditing = (name) => {
    const t = getTemplateByName(name);
    setEditingName(name);
    setBody(t?.body || '');
    setPreview('');
  };

  const cancelEditing = () => {
    setEditingName(null);
    setBody('');
    setPreview('');
  };

  const insertVariable = (variable) => {
    setBody((prev) => prev + `{{${variable}}}`);
  };

  const generatePreview = async () => {
    const meta = BUILT_IN_TEMPLATES.find((t) => t.name === editingName);
    const dummyVars = {};
    meta?.variables.forEach((v) => {
      if (v === 'customer_name') dummyVars[v] = 'Colleen Knight';
      else if (v === 'date') dummyVars[v] = 'Thursday, May 28';
      else if (v === 'time') dummyVars[v] = '10:30 AM';
      else if (v === 'party_size') dummyVars[v] = '2';
      else if (v === 'qr_url') dummyVars[v] = 'https://veto-restaurant.onrender.com/qr/abc123';
      else dummyVars[v] = `[${v}]`;
    });

    try {
      const res = await fetch('/api/v1/admin/templates/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ body, variables: dummyVars }),
      });
      const data = await res.json();
      if (data.status === 'success') setPreview(data.data.rendered);
    } catch {}
  };

  const handleSave = async () => {
    const existing = getTemplateByName(editingName);
    setIsSaving(true);
    try {
      const url = existing
        ? `/api/v1/admin/templates/${existing.id}`
        : '/api/v1/admin/templates';
      const method = existing ? 'PATCH' : 'POST';
      const meta = BUILT_IN_TEMPLATES.find((t) => t.name === editingName);

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: editingName,
          type: 'whatsapp',
          body,
          variables: meta?.variables || [],
        }),
      });
      if (res.ok) {
        cancelEditing();
        fetchTemplates();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to save template');
      }
    } catch { alert('Network error'); }
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-brand-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-800/40 via-brand-900 to-brand-950">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/admin" className="p-2 sm:p-2.5 rounded-xl bg-brand-800/50 text-brand-300 border border-brand-700/50 hover:bg-brand-700/50 transition-colors">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl text-white">Message Templates</h1>
              <p className="text-brand-400 text-xs sm:text-sm">Customize WhatsApp notification messages</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="glass-panel p-12 text-center text-brand-500">Loading templates...</div>
        ) : (
          <div className="space-y-4">
            {BUILT_IN_TEMPLATES.map((meta) => {
              const t = getTemplateByName(meta.name);
              const isEditing = editingName === meta.name;

              return (
                <div key={meta.name} className="glass-panel overflow-hidden">
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <MessageSquare className="w-4 h-4 text-gold-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{meta.label}</h3>
                          <p className="text-xs text-brand-500">{meta.description}</p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {meta.variables.map((v) => (
                              <span key={v} className="px-2 py-0.5 rounded bg-brand-800/60 text-brand-400 text-[10px] font-mono border border-brand-700/30">
                                {'{{'}{v}{'}}'}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {t && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                            Customized
                          </span>
                        )}
                        <button
                          onClick={() => (isEditing ? cancelEditing() : startEditing(meta.name))}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-800/50 text-brand-300 border border-brand-700/50 hover:bg-brand-700/50 transition-colors text-sm"
                        >
                          {isEditing ? <RotateCcw className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                          {isEditing ? 'Cancel' : 'Edit'}
                        </button>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="mt-4 space-y-4 animate-slide-up">
                        {/* Variable buttons */}
                        <div>
                          <label className="text-xs text-brand-500 uppercase tracking-wider mb-2 block">Insert Variable</label>
                          <div className="flex flex-wrap gap-2">
                            {meta.variables.map((v) => (
                              <button
                                key={v}
                                onClick={() => insertVariable(v)}
                                className="px-2.5 py-1 rounded-lg bg-brand-800/60 text-gold-400 text-xs font-mono border border-brand-700/40 hover:bg-brand-700/60 transition-colors"
                              >
                                {'{{'}{v}{'}}'}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Body textarea */}
                        <div>
                          <label className="text-xs text-brand-500 uppercase tracking-wider mb-2 block">Message Body</label>
                          <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            rows={10}
                            className="input-premium w-full font-mono text-sm leading-relaxed"
                            placeholder="Type your message here..."
                          />
                        </div>

                        {/* Preview */}
                        {preview && (
                          <div className="rounded-xl bg-brand-800/40 border border-brand-700/30 p-4">
                            <label className="text-xs text-brand-500 uppercase tracking-wider mb-2 block flex items-center gap-1.5">
                              <Eye className="w-3 h-3" /> Preview
                            </label>
                            <pre className="text-sm text-brand-200 whitespace-pre-wrap font-sans">{preview}</pre>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                          <button
                            onClick={handleSave}
                            disabled={isSaving || !body.trim()}
                            className="btn-primary flex items-center gap-2 disabled:opacity-50"
                          >
                            <Save className="w-4 h-4" />
                            {isSaving ? 'Saving...' : 'Save Template'}
                          </button>
                          <button
                            onClick={generatePreview}
                            disabled={!body.trim()}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-800/50 text-brand-300 border border-brand-700/50 hover:bg-brand-700/50 transition-colors text-sm disabled:opacity-50"
                          >
                            <Eye className="w-4 h-4" />
                            Preview
                          </button>
                        </div>
                      </div>
                    ) : t ? (
                      <div className="mt-3 rounded-xl bg-brand-800/30 border border-brand-700/20 p-4">
                        <pre className="text-sm text-brand-300 whitespace-pre-wrap font-sans">{t.body}</pre>
                      </div>
                    ) : (
                      <div className="mt-3 rounded-xl bg-brand-800/20 border border-dashed border-brand-700/30 p-4 text-center">
                        <p className="text-sm text-brand-500">Using default message. Click Edit to customize.</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageTemplateManager;
