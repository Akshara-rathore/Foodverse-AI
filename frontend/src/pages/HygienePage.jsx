import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  UploadCloud,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Printer,
  Download,
  Building2,
  AlertCircle,
  FileText,
  BadgeAlert,
  Key
} from 'lucide-react';
import { hygieneApi } from '../api/client';

export default function HygienePage({ onOpenKeyModal }) {
  const [presets, setPresets] = useState([]);
  const [activePreset, setActivePreset] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    hygieneApi.getPresets().then((data) => {
      setPresets(data || []);
      if (data && data.length > 0) {
        handleSelectPreset(data[0]);
      }
    }).catch((err) => console.error('Error fetching hygiene presets:', err));
  }, []);

  const handleSelectPreset = async (preset) => {
    setActivePreset(preset.id);
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrorMsg(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('preset_id', preset.id);
      const res = await hygieneApi.analyze(formData);
      setResult(res);
    } catch (err) {
      console.error('Error analyzing hygiene preset:', err);
      setErrorMsg(err.response?.data?.detail || 'Failed to inspect preset');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setActivePreset(null);
      setErrorMsg(null);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleAnalyzeClick = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const res = await hygieneApi.analyze(formData);
      setResult(res);
    } catch (err) {
      console.error('Error analyzing hygiene file:', err);
      setErrorMsg(err.response?.data?.detail || err.message || 'Failed to audit kitchen image.');
    } finally {
      setLoading(false);
    }
  };

  const isApiKeyNotice = result?.status === 'api_key_required' || result?.requires_api_key;
  const isAiError = result?.status === 'ai_error';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="hygiene-view">
      {/* Official Health Inspection Disclaimer */}
      <div className="disclaimer-banner">
        <ShieldCheck className="disclaimer-icon" style={{ color: '#0369a1' }} />
        <div>
          <strong>Regulatory Compliance Disclaimer:</strong> This automated visual hygiene audit is intended solely for internal quality assurance and staff coaching. It does not replace official municipal health department inspections, ATP surface swab testing, or certified HACCP verification audits.
        </div>
      </div>

      {/* Preset Audit Scans */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--forest-900)' }}>
            Preset Commercial Kitchen Inspections:
          </label>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Click to load station audit</span>
        </div>
        <div className="presets-carousel">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPreset(p)}
              className={`preset-chip ${activePreset === p.id ? 'active' : ''}`}
            >
              <Building2 className="w-4 h-4 text-sky-700" />
              <span>{p.facility_area}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Upload Dropzone */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div
          className="dropzone"
          onClick={() => document.getElementById('hygiene-file-input').click()}
        >
          <input
            id="hygiene-file-input"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <div className="dropzone-icon-box" style={{ background: '#e0f2fe', color: '#0369a1' }}>
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '4px' }}>
            {selectedFile ? selectedFile.name : 'Upload kitchen station or prep line photo for sanitation audit'}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Audits surface cleanliness, PPE attire, cutting board separation, and trash overflow
          </p>
        </div>

        {/* Selected Image Preview & Action Button */}
        {previewUrl && (
          <div style={{ marginTop: '20px', padding: '16px', background: 'var(--cream-100)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <img
              src={previewUrl}
              alt="Kitchen Preview"
              style={{ maxHeight: '220px', maxWidth: '100%', borderRadius: 'var(--radius-md)', objectFit: 'cover', boxShadow: 'var(--shadow-sm)' }}
            />
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                id="btn-analyze-hygiene"
                onClick={handleAnalyzeClick}
                className="btn btn-primary"
                disabled={loading}
                style={{ padding: '12px 24px', fontSize: '15px' }}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    <span>Auditing Kitchen Station...</span>
                  </>
                ) : (
                  <>
                    <ClipboardCheck className="w-4 h-4 text-emerald-300" />
                    <span>Audit Kitchen Hygiene</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setErrorMsg(null);
                }}
                className="btn btn-secondary btn-sm"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {errorMsg && (
        <div style={{ padding: '14px 18px', borderRadius: 'var(--radius-md)', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertCircle className="w-5 h-5 text-rose-700 flex-shrink-0" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px' }}>Hygiene Audit Failed</div>
            <div style={{ fontSize: '13px', marginTop: '2px' }}>{errorMsg}</div>
          </div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', background: 'var(--cream-50)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
          <div className="spinner" style={{ margin: '0 auto 16px auto', width: '36px', height: '36px' }}></div>
          <p style={{ fontWeight: 700, color: 'var(--forest-900)', fontSize: '15px' }}>
            Auditing commercial surfaces, sanitization buckets & cross-contamination controls...
          </p>
        </div>
      )}

      {/* API Key Notice */}
      {result && isApiKeyNotice && !loading && (
        <div className="card" style={{ background: '#fffbf0', borderColor: '#fed7aa', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Key className="w-6 h-6 text-amber-700" />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#9a3412', marginBottom: '6px' }}>
                {result.title || 'Google Gemini API Key Required for Live Kitchen Audits'}
              </h3>
              <p style={{ fontSize: '13.5px', color: '#7c2d12', lineHeight: 1.5, marginBottom: '14px' }}>
                {result.message}
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {onOpenKeyModal && (
                  <button onClick={onOpenKeyModal} className="btn btn-primary btn-sm">
                    <Key className="w-3.5 h-3.5" />
                    <span>Enter Gemini API Key</span>
                  </button>
                )}
                {presets.length > 0 && (
                  <button onClick={() => handleSelectPreset(presets[0])} className="btn btn-secondary btn-sm">
                    <span>Try Sample: {presets[0].facility_area}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result Display */}
      {result && !isApiKeyNotice && !isAiError && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Main Audit Summary Card */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-full)',
                      background: result.is_demo_mode ? '#fff3e6' : 'var(--mint-100)',
                      color: result.is_demo_mode ? '#b05a18' : 'var(--forest-800)',
                      border: result.is_demo_mode ? '1px solid #ffd4b3' : '1px solid var(--mint-300)'
                    }}
                  >
                    {result.is_demo_mode ? 'Sample Station Audit' : 'Live Gemini Vision Audit'}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Inspection Area: <strong>{result.facility_area}</strong>
                  </span>
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--forest-900)' }}>
                  {result.grade}
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '780px', lineHeight: 1.5 }}>
                  {result.summary}
                </p>
              </div>

              {/* Action Buttons & Score Box */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <button onClick={handlePrint} className="btn btn-secondary btn-sm" id="btn-print-audit">
                  <Printer className="w-4 h-4" />
                  <span>Print Audit</span>
                </button>

                <div
                  style={{
                    background: 'var(--mint-50)',
                    border: '1px solid var(--mint-300)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px 24px',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--forest-700)', textTransform: 'uppercase' }}>
                    Hygiene Score
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '38px', fontWeight: 800, color: 'var(--forest-800)', lineHeight: 1.1 }}>
                    {result.hygiene_score}<span style={{ fontSize: '18px', fontWeight: 600 }}>/100</span>
                  </div>
                  <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--mint-500)' }}>
                    HACCP Compliant
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Badges Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '8px' }}>
              <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--cream-100)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>CROSS-CONTAMINATION RISK</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: result.cross_contamination_risk === 'Low' ? '#16a34a' : '#d97706', marginTop: '2px' }}>
                  {result.cross_contamination_risk}
                </div>
              </div>

              <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--cream-100)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>SANITIZATION COMPLIANCE</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: result.sanitization_compliance === 'Good' ? '#16a34a' : '#d97706', marginTop: '2px' }}>
                  {result.sanitization_compliance}
                </div>
              </div>
            </div>
          </div>

          {/* Inspection Checklist */}
          <div className="card">
            <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ClipboardCheck className="w-5 h-5 text-emerald-800" />
              <span>Inspection Category Findings</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {result.checklist?.map((item, idx) => {
                const isCompliant = item.status === 'Compliant';
                const isCritical = item.status === 'Critical Risk';
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--cream-100)',
                      border: '1px solid var(--border-subtle)',
                      gap: '14px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: '240px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-900)' }}>
                          {item.category}
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                        {item.observation}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-full)',
                          background: isCompliant ? 'var(--mint-100)' : isCritical ? '#fee2e2' : '#fef3c7',
                          color: isCompliant ? 'var(--forest-800)' : isCritical ? '#991b1b' : '#92400e'
                        }}
                      >
                        {item.status}
                      </span>
                      {item.risk_level && item.risk_level !== 'None' && (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          ({item.risk_level} Risk)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Prioritized Corrective Action Plan */}
          <div className="card">
            <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BadgeAlert className="w-5 h-5 text-amber-700" />
              <span>Prioritized HACCP Corrective Action Plan</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {result.corrective_actions?.map((action, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: action.priority === 'Immediate' ? '#fff7ed' : 'var(--cream-100)',
                    border: action.priority === 'Immediate' ? '1px solid #fdba74' : '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          background: action.priority === 'Immediate' ? '#ef4444' : action.priority === 'Short-term' ? '#f59e0b' : 'var(--mint-400)',
                          color: '#fff'
                        }}
                      >
                        {action.priority} Priority
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--forest-900)' }}>
                        Target: {action.target_area}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                      {action.action}
                    </p>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.04)', padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}>
                    Responsible: <strong>{action.responsible_role}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
