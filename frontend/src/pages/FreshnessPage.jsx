import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  UploadCloud,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  Clock,
  ThermometerSnowflake,
  ChefHat,
  Search,
  Info,
  Key
} from 'lucide-react';
import { freshnessApi } from '../api/client';

export default function FreshnessPage({ onOpenKeyModal }) {
  const [presets, setPresets] = useState([]);
  const [activePreset, setActivePreset] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    freshnessApi.getPresets().then((data) => {
      setPresets(data || []);
      if (data && data.length > 0) {
        handleSelectPreset(data[0]);
      }
    }).catch((err) => console.error('Error fetching freshness presets:', err));
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
      const res = await freshnessApi.analyze(formData);
      setResult(res);
    } catch (err) {
      console.error('Error analyzing freshness preset:', err);
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
      const res = await freshnessApi.analyze(formData);
      setResult(res);
    } catch (err) {
      console.error('Error analyzing freshness file:', err);
      setErrorMsg(err.response?.data?.detail || err.message || 'Failed to inspect produce image.');
    } finally {
      setLoading(false);
    }
  };

  const isApiKeyNotice = result?.status === 'api_key_required' || result?.requires_api_key;
  const isAiError = result?.status === 'ai_error';

  const getScoreColor = (score) => {
    if (score >= 80) return { bg: 'var(--mint-100)', text: 'var(--forest-800)', bar: 'var(--mint-400)' };
    if (score >= 50) return { bg: '#fef3c7', text: '#92400e', bar: '#f59e0b' };
    return { bg: '#fee2e2', text: '#991b1b', bar: '#ef4444' };
  };

  const scoreTheme = result && result.freshness_score !== undefined
    ? getScoreColor(result.freshness_score)
    : getScoreColor(85);

  return (
    <div id="freshness-view">
      {/* Prominent Caution Disclaimer Banner */}
      <div className="disclaimer-banner" style={{ background: '#fff7ed', borderColor: '#fdba74', color: '#9a3412' }}>
        <ShieldAlert className="disclaimer-icon" style={{ color: '#ea580c' }} />
        <div>
          <strong>Food Safety & Microbiological Disclaimer:</strong> Visual analysis cannot detect invisible foodborne pathogens (e.g. Salmonella, E. coli, Listeria) or internal toxins. Never consume food that produces an off-odor, exhibits slimy texture, or displays mold growth, regardless of numerical visual score.
        </div>
      </div>

      {/* Preset Produce Scans */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--forest-900)' }}>
            Instant Produce Scans (Explore sample degradation stages):
          </label>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Click to inspect</span>
        </div>
        <div className="presets-carousel">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPreset(p)}
              className={`preset-chip ${activePreset === p.id ? 'active' : ''}`}
            >
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span>{p.item_name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Upload Zone */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div
          className="dropzone"
          onClick={() => document.getElementById('freshness-file-input').click()}
        >
          <input
            id="freshness-file-input"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <div className="dropzone-icon-box" style={{ background: '#fef3c7', color: '#b45309' }}>
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '4px' }}>
            {selectedFile ? selectedFile.name : 'Upload fruits, vegetables, or perishables for visual defect audit'}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Detects skin bruising, ethylene ripening, cellular wilting, and mold-like patterns
          </p>
        </div>

        {/* Selected Image Preview & Action Button */}
        {previewUrl && (
          <div style={{ marginTop: '20px', padding: '16px', background: 'var(--cream-100)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <img
              src={previewUrl}
              alt="Freshness Preview"
              style={{ maxHeight: '220px', maxWidth: '100%', borderRadius: 'var(--radius-md)', objectFit: 'cover', boxShadow: 'var(--shadow-sm)' }}
            />
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                id="btn-analyze-freshness"
                onClick={handleAnalyzeClick}
                className="btn btn-primary"
                disabled={loading}
                style={{ padding: '12px 24px', fontSize: '15px' }}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    <span>Inspecting Produce...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Inspect Produce Freshness</span>
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
            <div style={{ fontWeight: 700, fontSize: '14px' }}>Inspection Failed</div>
            <div style={{ fontSize: '13px', marginTop: '2px' }}>{errorMsg}</div>
          </div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', background: 'var(--cream-50)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
          <div className="spinner" style={{ margin: '0 auto 16px auto', width: '36px', height: '36px' }}></div>
          <p style={{ fontWeight: 700, color: 'var(--forest-900)', fontSize: '15px' }}>
            Inspecting epidermal texture, chlorophyll degradation & senescence biomarkers...
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
                {result.title || 'Google Gemini API Key Required for Custom Produce'}
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
                    <span>Try Sample: {presets[0].item_name}</span>
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
          {/* Main Inspection Card */}
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
                    {result.is_demo_mode ? 'Sample Produce Scan' : 'Live Gemini Vision'}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Category: <strong>{result.category}</strong>
                  </span>
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--forest-900)' }}>
                  {result.item_name}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-full)',
                      background: scoreTheme.bg,
                      color: scoreTheme.text
                    }}
                  >
                    {result.status_label}
                  </span>
                </div>
              </div>

              {/* Gauge Meter Box */}
              <div
                style={{
                  background: scoreTheme.bg,
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px 24px',
                  textAlign: 'center',
                  minWidth: '150px'
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: scoreTheme.text, textTransform: 'uppercase' }}>
                  Freshness Index
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '38px', fontWeight: 800, color: scoreTheme.text, lineHeight: 1.1 }}>
                  {result.freshness_score}%
                </div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: scoreTheme.text }}>
                  Est. Shelf Life:
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--forest-900)' }}>
                  {result.estimated_shelf_life}
                </div>
              </div>
            </div>

            {/* Freshness Progress Bar */}
            <div style={{ marginTop: '8px' }}>
              <div style={{ height: '10px', background: 'var(--cream-200)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${result.freshness_score}%`,
                    height: '100%',
                    background: scoreTheme.bar,
                    transition: 'width 0.5s ease'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Morphological Observations & Anomalies */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
            {/* Visual Anomalies */}
            <div className="card">
              <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Search className="w-4 h-4 text-amber-800" />
                <span>Detected Visual Anomalies</span>
              </h3>
              {result.anomalies && result.anomalies.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {result.anomalies.map((anom, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--cream-100)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-900)' }}>
                          {anom.defect_type}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            background: anom.severity === 'High' ? '#fee2e2' : anom.severity === 'Moderate' ? '#fef3c7' : 'var(--mint-100)',
                            color: anom.severity === 'High' ? '#991b1b' : anom.severity === 'Moderate' ? '#92400e' : 'var(--forest-800)'
                          }}
                        >
                          {anom.severity} Severity
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--forest-700)', fontWeight: 600, marginBottom: '4px' }}>
                        Location: {anom.location}
                      </div>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                        {anom.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  No structural defects or surface bruising detected.
                </p>
              )}
            </div>

            {/* General Observations */}
            <div className="card">
              <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                <span>Morphological Observations</span>
              </h3>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px', color: 'var(--forest-900)' }}>
                {result.observations?.map((obs, idx) => (
                  <li key={idx} style={{ lineHeight: 1.5 }}>{obs}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommendations Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
            {/* Storage Guidance */}
            <div className="card" style={{ background: 'var(--mint-50)', borderColor: 'var(--mint-300)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ThermometerSnowflake className="w-5 h-5 text-emerald-700" />
                <span>Storage & Humidity Protocols</span>
              </h3>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--forest-800)' }}>
                {result.storage_recommendations?.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>

            {/* Culinary Recommendations */}
            <div className="card" style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#92400e', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ChefHat className="w-5 h-5 text-amber-700" />
                <span>Culinary & Safety Recommendations</span>
              </h3>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#78350f' }}>
                {result.culinary_recommendations?.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
