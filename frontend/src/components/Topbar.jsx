import React from 'react';
import {
  Sparkles,
  Database,
  User,
  Key,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function Topbar({
  activeTab,
  systemStatus,
  user,
  onOpenAuthModal,
  onOpenKeyModal,
  onLogout
}) {
  const titles = {
    dashboard: { title: 'Multimodal Food Intelligence Dashboard', sub: 'Comprehensive food-tech analytics & AI operations' },
    nutrition: { title: 'Food Recognition & Nutrition Analysis', sub: 'Instant calorie estimation, macronutrients & glycemic scoring' },
    freshness: { title: 'Food Freshness & Defect Detection', sub: 'Visual inspection for bruising, discoloration, wilting & mold risk' },
    hygiene: { title: 'Commercial Kitchen Hygiene Monitoring', sub: 'Automated sanitation auditing & HACCP corrective action planning' },
    cooking: { title: 'Smart Cooking Assistant (Chef Auguste)', sub: 'Voice-enabled AI culinary chat, recipes & ingredient substitution' },
    meals: { title: 'Personalized Meal Planner & Grocery Engine', sub: '7-day dietary plan, calorie balancing & categorized shopping lists' },
  };

  const current = titles[activeTab] || { title: 'FoodVerse AI', sub: 'Multimodal Food Intelligence' };
  const isLive = systemStatus?.gemini_configured;

  return (
    <header className="topbar" id="app-topbar">
      <div className="topbar-left">
        <div>
          <h2 className="page-title">{current.title}</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{current.sub}</p>
        </div>
      </div>

      <div className="topbar-right">
        {/* Engine Mode Pill */}
        <button
          id="btn-engine-mode"
          onClick={onOpenKeyModal}
          className={`mode-badge ${isLive ? 'live' : 'demo'}`}
          title="Click to manage Gemini API Key"
        >
          {isLive ? <Zap className="w-3.5 h-3.5 text-emerald-600" /> : <Sparkles className="w-3.5 h-3.5 text-amber-600" />}
          <span>{isLive ? 'Live Gemini AI' : 'Smart Demo Mode'}</span>
        </button>

        {/* Database connectivity pill */}
        <div
          className="mode-badge"
          style={{ background: 'var(--cream-200)', color: 'var(--forest-800)', border: '1px solid var(--border-subtle)' }}
          title={systemStatus?.database_connected ? 'Connected to MongoDB' : 'Running in Resilient Local Storage'}
        >
          <Database className="w-3.5 h-3.5 text-emerald-700" />
          <span style={{ fontSize: '11px' }}>
            {systemStatus?.database_connected ? 'MongoDB' : 'Local JSON DB'}
          </span>
        </div>

        {/* User Account / Auth */}
        {user && user.email !== 'guest@foodverse.ai' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="user-button">
              <div className="avatar-circle">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--forest-900)' }}>
                {user.name}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px' }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            id="btn-login-modal"
            onClick={onOpenAuthModal}
            className="btn btn-secondary btn-sm"
          >
            <User className="w-4 h-4" />
            <span>Sign In / Register</span>
          </button>
        )}
      </div>
    </header>
  );
}
