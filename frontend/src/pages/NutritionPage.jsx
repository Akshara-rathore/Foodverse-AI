import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  UploadCloud,
  Sparkles,
  AlertTriangle,
  Flame,
  PieChart,
  CheckCircle2,
  Clock,
  HeartPulse,
  Leaf,
  Info,
  ShieldCheck,
  Key,
  AlertCircle,
  Play
} from 'lucide-react';
import { nutritionApi } from '../api/client';

export default function NutritionPage({ onOpenKeyModal }) {
  const [presets, setPresets] = useState([]);
  const [activePreset, setActivePreset] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    nutritionApi
      .getPresets()
      .then((data) => {
        setPresets(data || []);
        if (data && data.length > 0) {
          // Pre-load default preset
          handleSelectPreset(data[0]);
        }
      })
      .catch((err) => console.error('Failed to load presets:', err));
    loadHistory();
  }, []);

  const loadHistory = () => {
    nutritionApi
      .getHistory()
      .then((data) => setHistory(data || []))
      .catch(() => {});
  };

  const handleSelectPreset = async (preset) => {
    setActivePreset(preset.id);
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrorMsg(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('preset_id', preset.id);
      const res = await nutritionApi.analyze(formData);
      setResult(res);
      loadHistory();
    } catch (err) {
      console.error('Error analyzing preset:', err);
      setErrorMsg(err.response?.data?.detail || 'Failed to analyze preset');
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
      const res = await nutritionApi.analyze(formData);
      setResult(res);
      loadHistory();
    } catch (err) {
      console.error('Error analyzing uploaded file:', err);
      setErrorMsg(err.response?.data?.detail || err.message || 'Failed to analyze food image.');
    } finally {
      setLoading(false);
    }
  };

  const isApiKeyNotice = result?.status === 'api_key_required' || result?.requires_api_key;
  const isAiError = result?.status === 'ai_error';

  const macros = result?.macros || { calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0 };
  const totalMacroGrams = (macros.protein + macros.carbohydrates + macros.fat) || 1;
  const proteinPct = Math.round((macros.protein / totalMacroGrams) * 100);
  const carbsPct = Math.round((macros.carbohydrates / totalMacroGrams) * 100);
  const fatPct = Math.round((macros.fat / totalMacroGrams) * 100);

  return (
    <div id="nutrition-view">
      {/* Medical Disclaimer Banner */}
      <div className="disclaimer-banner">
        <Info className="disclaimer-icon" />
        <div>
          <strong>Medical & Nutrition Disclaimer:</strong> Nutrition estimations are AI approximations based on visual portion heuristics. They cannot substitute for laboratory bomb calorimetry, chemical assays, or personalized medical dietary advice.
        </div>
      </div>

      {/* Preset Selector Chips */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--forest-900)' }}>
            Instant Sample Scans (Click to test anytime):
          </label>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Zero-setup verified presets</span>
        </div>
        <div className="presets-carousel">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPreset(p)}
              className={`preset-chip ${activePreset === p.id ? 'active' : ''}`}
            >
              <UtensilsCrossed className="w-4 h-4 text-emerald-700" />
              <span>{p.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Upload & Analyze Zone */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div
          className="dropzone"
          onClick={() => document.getElementById('food-file-input').click()}
        >
          <input
            id="food-file-input"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <div className="dropzone-icon-box">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '4px' }}>
            {selectedFile ? selectedFile.name : 'Drop your food photo here or click to browse'}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Supports JPG, PNG, WebP • Analyzes ingredients, portion estimates & calories
          </p>
        </div>

        {/* Selected Image Preview & Action Button */}
        {previewUrl && (
          <div style={{ marginTop: '20px', padding: '16px', background: 'var(--cream-100)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <img
              src={previewUrl}
              alt="Food Preview"
              style={{ maxHeight: '220px', maxWidth: '100%', borderRadius: 'var(--radius-md)', objectFit: 'cover', boxShadow: 'var(--shadow-sm)' }}
            />
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                id="btn-analyze-food"
                onClick={handleAnalyzeClick}
                className="btn btn-primary"
                disabled={loading}
                style={{ padding: '12px 24px', fontSize: '15px' }}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    <span>Analyzing with Vision AI...</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4 text-amber-300" />
                    <span>Analyze Food Image</span>
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

      {/* Network / Execution Error Notice */}
      {errorMsg && (
        <div style={{ padding: '14px 18px', borderRadius: 'var(--radius-md)', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertCircle className="w-5 h-5 text-rose-700 flex-shrink-0" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px' }}>Analysis Request Failed</div>
            <div style={{ fontSize: '13px', marginTop: '2px' }}>{errorMsg}</div>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', background: 'var(--cream-50)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
          <div className="spinner" style={{ margin: '0 auto 16px auto', width: '36px', height: '36px' }}></div>
          <p style={{ fontWeight: 700, color: 'var(--forest-900)', fontSize: '15px' }}>
            Gemini Vision analyzing food composition & portion density...
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Scanning ingredients, estimating protein, carbs, fats, and bioavailable micronutrients
          </p>
        </div>
      )}

      {/* API Key Required Notice Card */}
      {result && isApiKeyNotice && !loading && (
        <div className="card" style={{ background: '#fffbf0', borderColor: '#fed7aa', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Key className="w-6 h-6 text-amber-700" />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#9a3412', marginBottom: '6px' }}>
                {result.title || 'Google Gemini API Key Required for Custom Images'}
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
                    <span>Try Sample Dish: {presets[0].title}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Error Notice Card */}
      {result && isAiError && !loading && (
        <div className="card" style={{ background: '#fef2f2', borderColor: '#fecaca', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <AlertTriangle className="w-6 h-6 text-rose-600 flex-shrink-0" />
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#991b1b' }}>{result.title}</h4>
              <p style={{ fontSize: '13px', color: '#7f1d1d', marginTop: '2px' }}>{result.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Results Display (Shown when successful preset or Gemini result returned) */}
      {result && !isApiKeyNotice && !isAiError && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Result Header Card */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
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
                    {result.is_demo_mode ? 'Sample Scan' : 'Live Gemini Vision AI'}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Meal Type: <strong>{result.meal_type || 'Meal'}</strong>
                  </span>
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--forest-900)' }}>
                  {result.title}
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '780px', lineHeight: 1.5 }}>
                  {result.summary}
                </p>
              </div>

              {/* Health Score Pill */}
              <div
                style={{
                  background: 'var(--mint-50)',
                  border: '1px solid var(--mint-300)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '14px 20px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--forest-700)', textTransform: 'uppercase' }}>
                  Health Score
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, color: 'var(--forest-800)', lineHeight: 1.1 }}>
                  {result.health_score || 85}<span style={{ fontSize: '16px', fontWeight: 600 }}>/100</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--mint-500)', fontWeight: 600 }}>
                  Nutrient Dense
                </div>
              </div>
            </div>

            {/* Macros Bar & Dial Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '14px',
                padding: '20px',
                background: 'var(--cream-100)',
                borderRadius: 'var(--radius-md)',
                marginTop: '12px'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: 'var(--accent-coral)', marginBottom: '4px' }}>
                  <Flame className="w-4 h-4" />
                  <span style={{ fontSize: '12px', fontWeight: 700 }}>Calories</span>
                </div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--forest-900)' }}>
                  {macros.calories}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>kcal</div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#0284c7', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                  Protein
                </div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--forest-900)' }}>
                  {macros.protein}g
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{proteinPct}% ratio</div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#d97706', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                  Carbohydrates
                </div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--forest-900)' }}>
                  {macros.carbohydrates}g
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{carbsPct}% ratio</div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#16a34a', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                  Healthy Fats
                </div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--forest-900)' }}>
                  {macros.fat}g
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{fatPct}% ratio</div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#8b5cf6', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                  Dietary Fiber
                </div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--forest-900)' }}>
                  {macros.fiber}g
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Gut prebiotic</div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--forest-600)', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                  Glycemic Index
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--forest-900)', marginTop: '6px' }}>
                  {result.glycemic_index || 'Medium'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Steady release</div>
              </div>
            </div>

            {/* Macro Visual Distribution Strip */}
            <div style={{ marginTop: '16px' }}>
              <div style={{ height: '12px', borderRadius: 'var(--radius-full)', display: 'flex', overflow: 'hidden' }}>
                <div style={{ width: `${proteinPct}%`, background: '#0284c7' }} title={`Protein: ${proteinPct}%`} />
                <div style={{ width: `${carbsPct}%`, background: '#f59e0b' }} title={`Carbs: ${carbsPct}%`} />
                <div style={{ width: `${fatPct}%`, background: '#16a34a' }} title={`Fat: ${fatPct}%`} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginTop: '6px', color: 'var(--text-secondary)' }}>
                <span>🔵 Protein ({proteinPct}%)</span>
                <span>🟡 Carbs ({carbsPct}%)</span>
                <span>🟢 Fats ({fatPct}%)</span>
              </div>
            </div>
          </div>

          {/* Detected Ingredients Table & Micronutrients */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
            {/* Detected Items */}
            <div className="card">
              <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UtensilsCrossed className="w-4 h-4 text-emerald-800" />
                <span>Detected Ingredients & Portions</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {result.detected_items && result.detected_items.length > 0 ? (
                  result.detected_items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--cream-100)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--forest-900)' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          Portion: {item.portion} • Confidence: {Math.round((item.confidence || 0.9) * 100)}%
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--forest-800)' }}>
                        {item.calories} kcal
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No individual items parsed.</p>
                )}
              </div>
            </div>

            {/* Micronutrients Breakdown */}
            <div className="card">
              <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HeartPulse className="w-4 h-4 text-emerald-800" />
                <span>Key Micronutrients (% Daily Value)</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {result.micronutrients && result.micronutrients.length > 0 ? (
                  result.micronutrients.map((micro, idx) => (
                    <div key={idx} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--forest-900)' }}>{micro.name}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{micro.amount} ({micro.daily_value_pct}% DV)</span>
                      </div>
                      <div style={{ height: '6px', background: 'var(--cream-200)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${Math.min(100, micro.daily_value_pct)}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, var(--mint-400), var(--forest-600))'
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Micronutrients estimated from macro profile.</p>
                )}
              </div>
            </div>
          </div>

          {/* Actionable Health Tips */}
          {result.health_tips && result.health_tips.length > 0 && (
            <div className="card" style={{ background: 'var(--mint-50)', borderColor: 'var(--mint-300)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Leaf className="w-4 h-4 text-emerald-700" />
                <span>Certified Clinical Nutritionist Insights</span>
              </h3>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px', color: 'var(--forest-800)' }}>
                {result.health_tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
