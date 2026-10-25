import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Sparkles,
  ClipboardCheck,
  Bot,
  CalendarDays,
  TrendingUp,
  Activity,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Award,
  Clock,
  ChevronRight
} from 'lucide-react';
import { dashboardApi } from '../api/client';

export default function DashboardPage({ setActiveTab }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .getSummary()
      .then((data) => setSummary(data))
      .catch((err) => console.error('Failed to load dashboard summary:', err))
      .finally(() => setLoading(false));
  }, []);

  const metrics = summary?.metrics || {
    total_analyses: 24,
    food_scans: 12,
    freshness_checks: 7,
    hygiene_audits: 5,
    saved_recipes_count: 2,
    active_meal_plans: 1
  };

  const weeklyTrends = summary?.weekly_trends || [
    { day: 'Mon', calories: 2040, protein: 142, carbs: 195, fat: 68 },
    { day: 'Tue', calories: 1980, protein: 150, carbs: 180, fat: 62 },
    { day: 'Wed', calories: 2150, protein: 138, carbs: 210, fat: 74 },
    { day: 'Thu', calories: 2020, protein: 160, carbs: 175, fat: 65 },
    { day: 'Fri', calories: 2200, protein: 145, carbs: 225, fat: 72 },
    { day: 'Sat', calories: 2280, protein: 130, carbs: 240, fat: 80 },
    { day: 'Sun', calories: 2050, protein: 155, carbs: 185, fat: 66 }
  ];

  const recent = summary?.recent_activity || [];
  const recipes = summary?.recommended_recipes || [];

  return (
    <div id="dashboard-view">
      {/* Top Welcome / Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--forest-800) 0%, var(--forest-700) 60%, var(--forest-600) 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px 36px',
          color: '#ffffff',
          marginBottom: '28px',
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '680px' }}>
          <span
            style={{
              display: 'inline-block',
              background: 'rgba(82, 183, 136, 0.25)',
              color: 'var(--mint-200)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '12px'
            }}
          >
            Multimodal Food Intelligence Platform
          </span>
          <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: 800, marginBottom: '10px' }}>
            Empower Your Kitchen with Vision & AI
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '14px', lineHeight: 1.6, marginBottom: '20px' }}>
            Scan culinary dishes for exact nutrition macros, evaluate agricultural freshness & decay risks, conduct HACCP kitchen hygiene audits, and generate custom meal plans.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('nutrition')}
              className="btn btn-mint"
              id="hero-scan-food"
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Scan Food Image</span>
            </button>
            <button
              onClick={() => setActiveTab('cooking')}
              className="btn"
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}
            >
              <Bot className="w-4 h-4" />
              <span>Ask Cooking Assistant</span>
            </button>
          </div>
        </div>

        {/* Decorative graphic glow */}
        <div
          style={{
            position: 'absolute',
            right: '-40px',
            bottom: '-40px',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(82, 183, 136, 0.3) 0%, rgba(27, 67, 50, 0) 70%)',
            pointerEvents: 'none'
          }}
        />
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'var(--mint-100)', color: 'var(--forest-700)' }}>
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="metric-val">{metrics.total_analyses}</div>
            <div className="metric-lbl">Total AI Analyses</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: '#e0f2fe', color: '#0369a1' }}>
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <div className="metric-val">{metrics.food_scans}</div>
            <div className="metric-lbl">Food Nutrition Scans</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: '#fef3c7', color: '#b45309' }}>
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="metric-val">{metrics.freshness_checks}</div>
            <div className="metric-lbl">Freshness Checks</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: '#fce7f3', color: '#be185d' }}>
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="metric-val">{metrics.hygiene_audits}</div>
            <div className="metric-lbl">Hygiene Audits</div>
          </div>
        </div>
      </div>

      {/* 5 Core Feature Quick-Access Cards */}
      <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Core Multimodal Capabilities</h3>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>5 integrated modules</span>
      </div>

      <div className="features-grid">
        {/* Feature 1 */}
        <div className="feature-card" onClick={() => setActiveTab('nutrition')} id="card-feature-nutrition">
          <span className="feature-tag" style={{ background: 'var(--mint-100)', color: 'var(--forest-800)' }}>
            Multimodal Vision
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div className="card-icon-bubble" style={{ background: 'var(--mint-100)' }}>
              <UtensilsCrossed className="w-5 h-5 text-emerald-800" />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 700 }}>Food Recognition</h4>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', flex: 1 }}>
            Upload dish photos to detect ingredients, calories, protein, carbs, fats, fiber, and glycemic load.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--forest-700)' }}>
            <span>Analyze dish</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Feature 2 */}
        <div className="feature-card" onClick={() => setActiveTab('freshness')} id="card-feature-freshness">
          <span className="feature-tag" style={{ background: '#fef3c7', color: '#92400e' }}>
            Visual Safety
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div className="card-icon-bubble" style={{ background: '#fef3c7' }}>
              <Sparkles className="w-5 h-5 text-amber-800" />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 700 }}>Freshness Detection</h4>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', flex: 1 }}>
            Inspect produce for bruising, discoloration, mold mycelium, and wilting with shelf-life guidance.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--forest-700)' }}>
            <span>Inspect freshness</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Feature 3 */}
        <div className="feature-card" onClick={() => setActiveTab('hygiene')} id="card-feature-hygiene">
          <span className="feature-tag" style={{ background: '#e0f2fe', color: '#075985' }}>
            HACCP Inspection
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div className="card-icon-bubble" style={{ background: '#e0f2fe' }}>
              <ClipboardCheck className="w-5 h-5 text-sky-800" />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 700 }}>Hygiene Monitoring</h4>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', flex: 1 }}>
            Audit restaurant kitchens and prep stations for sanitization, cross-contamination, and attire.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--forest-700)' }}>
            <span>Audit kitchen</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Feature 4 */}
        <div className="feature-card" onClick={() => setActiveTab('cooking')} id="card-feature-cooking">
          <span className="feature-tag" style={{ background: '#fae8ff', color: '#86198f' }}>
            Voice & Chat
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div className="card-icon-bubble" style={{ background: '#fae8ff' }}>
              <Bot className="w-5 h-5 text-fuchsia-800" />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 700 }}>Smart Cooking Assistant</h4>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', flex: 1 }}>
            Voice-enabled culinary AI generating step-by-step cooking cards with timers and ingredient substitutes.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--forest-700)' }}>
            <span>Open chef chat</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Feature 5 */}
        <div className="feature-card" onClick={() => setActiveTab('meals')} id="card-feature-meals">
          <span className="feature-tag" style={{ background: '#dcfce7', color: '#166534' }}>
            Dietary Engine
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div className="card-icon-bubble" style={{ background: '#dcfce7' }}>
              <CalendarDays className="w-5 h-5 text-emerald-800" />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 700 }}>Personalized Meal Planner</h4>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', flex: 1 }}>
            Generate 7-day personalized meal calendars, macro targets, 1-click meal swaps, and organized groceries.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--forest-700)' }}>
            <span>Build meal plan</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Analytics & Activity Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        {/* Weekly Nutrition Chart Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon-bubble">
                <TrendingUp className="w-5 h-5 text-emerald-800" />
              </div>
              <div>
                <h3 className="card-title">Weekly Calorie & Macro Intake</h3>
                <p className="card-subtitle">Daily intake vs 2,100 kcal target</p>
              </div>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--mint-500)', background: 'var(--mint-100)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
              On Target (94%)
            </span>
          </div>

          {/* SVG Bar Chart */}
          <div style={{ padding: '10px 0 20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '180px', gap: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
              {weeklyTrends.map((d) => {
                const heightPct = Math.min(100, (d.calories / 2500) * 100);
                const isOver = d.calories > 2150;
                return (
                  <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      {d.calories}
                    </div>
                    <div
                      style={{
                        width: '100%',
                        maxWidth: '38px',
                        height: `${heightPct}%`,
                        background: isOver
                          ? 'linear-gradient(180deg, var(--accent-sand), var(--accent-coral))'
                          : 'linear-gradient(180deg, var(--mint-400), var(--forest-600))',
                        borderRadius: '6px 6px 0 0',
                        transition: 'height 0.4s ease'
                      }}
                      title={`${d.day}: ${d.calories} kcal (Protein: ${d.protein}g, Carbs: ${d.carbs}g, Fat: ${d.fat}g)`}
                    />
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--forest-900)' }}>
                      {d.day}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--forest-600)' }} />
                <span>Optimal (1900 - 2150 kcal)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--accent-coral)' }} />
                <span>Calorie Surplus</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Multimodal Activity Feed */}
        <div className="card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon-bubble">
                <Clock className="w-5 h-5 text-emerald-800" />
              </div>
              <div>
                <h3 className="card-title">Recent Intelligence Scans</h3>
                <p className="card-subtitle">Latest multimodal scans across all modules</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recent.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', padding: '24px' }}>
                No recent activity scans recorded.
              </p>
            ) : (
              recent.map((act, i) => (
                <div
                  key={act.id || i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--cream-100)',
                    border: '1px solid var(--border-subtle)',
                    transition: 'transform 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background:
                          act.type === 'nutrition'
                            ? 'var(--mint-100)'
                            : act.type === 'freshness'
                            ? '#fef3c7'
                            : '#e0f2fe',
                        color:
                          act.type === 'nutrition'
                            ? 'var(--forest-700)'
                            : act.type === 'freshness'
                            ? '#b45309'
                            : '#0369a1'
                      }}
                    >
                      {act.type === 'nutrition' && <UtensilsCrossed className="w-4 h-4" />}
                      {act.type === 'freshness' && <Sparkles className="w-4 h-4" />}
                      {act.type === 'hygiene' && <ClipboardCheck className="w-4 h-4" />}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-900)' }}>
                        {act.title}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {act.subtitle}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '11px',
                        fontWeight: 700,
                        background:
                          act.score >= 80 ? 'var(--mint-100)' : act.score >= 60 ? '#fef3c7' : '#fee2e2',
                        color:
                          act.score >= 80 ? 'var(--forest-800)' : act.score >= 60 ? '#92400e' : '#991b1b'
                      }}
                    >
                      Score: {act.score}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recommended Recipes Carousel */}
      <div className="card">
        <div className="card-header">
          <div className="card-title-group">
            <div className="card-icon-bubble">
              <Award className="w-5 h-5 text-emerald-800" />
            </div>
            <div>
              <h3 className="card-title">Chef-Curated Signature Recipes</h3>
              <p className="card-subtitle">Scientifically balanced for micronutrient density</p>
            </div>
          </div>
          <button onClick={() => setActiveTab('cooking')} className="btn btn-outline btn-sm">
            <span>Explore All Recipes</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
          {recipes.map((rec) => (
            <div
              key={rec.id}
              style={{
                borderRadius: 'var(--radius-md)',
                background: 'var(--cream-100)',
                border: '1px solid var(--border-subtle)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {rec.dietary_tags?.map((t) => (
                    <span
                      key={t}
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--mint-100)',
                        color: 'var(--forest-800)'
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '6px' }}>
                  {rec.title}
                </h4>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
                  {rec.description}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span>⏱ {rec.cook_time}</span>
                  <span>🔥 {rec.calories_per_serving} kcal</span>
                </div>
                <button
                  onClick={() => setActiveTab('cooking')}
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '12px' }}
                >
                  View Steps & Timer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
