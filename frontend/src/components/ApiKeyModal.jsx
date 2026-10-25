import React, { useState } from 'react';
import { Key, Sparkles, CheckCircle2, AlertCircle, X, ExternalLink, ShieldCheck } from 'lucide-react';
import { authApi } from '../api/client';

export default function ApiKeyModal({ isOpen, onClose, systemStatus, onStatusChange }) {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await authApi.updateApiKey(apiKey);
      setMessage(res.message);
      if (onStatusChange) onStatusChange();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update API key');
    } finally {
      setLoading(false);
    }
  };

  const isLive = systemStatus?.gemini_configured;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="card-icon-bubble">
              <Key className="w-5 h-5 text-emerald-800" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>AI Engine & API Credentials</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Google Gemini Vision & Multimodal Processing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status card */}
        <div style={{
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          background: isLive ? 'var(--mint-50)' : '#fff8ed',
          border: isLive ? '1px solid var(--mint-300)' : '1px solid #fed7aa',
          marginBottom: '20px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          {isLive ? (
            <ShieldCheck className="w-6 h-6 text-emerald-700 flex-shrink-0" />
          ) : (
            <Sparkles className="w-6 h-6 text-amber-700 flex-shrink-0" />
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', color: isLive ? 'var(--forest-800)' : '#9a3412' }}>
              {isLive ? 'Live Gemini AI Mode Active' : 'Smart Demo Mode Active (Sample Data)'}
            </div>
            <div style={{ fontSize: '12.5px', color: isLive ? 'var(--forest-600)' : '#b45309' }}>
              {isLive
                ? `Multimodal queries are processed using Google Gemini (${systemStatus?.gemini_model || 'gemini-1.5-flash'}).`
                : 'The application runs with realistic sample food scans, nutritional profiles, and kitchen audits without requiring any paid API key.'}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="input-gemini-key">
              Google Gemini API Key
            </label>
            <input
              id="input-gemini-key"
              type="password"
              className="form-input"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '6px' }}>
              Leave blank and click Save to return to Smart Demo Mode anytime.
            </p>
          </div>

          {message && (
            <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--mint-50)', color: 'var(--forest-800)', fontSize: '13px', marginBottom: '16px', border: '1px solid var(--mint-200)', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: '#fef2f2', color: '#991b1b', fontSize: '13px', marginBottom: '16px', border: '1px solid #fecaca', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <AlertCircle className="w-4 h-4 text-rose-700" />
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Close
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner"></span> : 'Update AI Engine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
