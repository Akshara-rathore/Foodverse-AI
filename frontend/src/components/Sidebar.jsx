import React from 'react';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Sparkles,
  ClipboardCheck,
  Bot,
  CalendarDays,
  Settings,
  Leaf,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, systemStatus, onOpenKeyModal }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'nutrition', label: 'Food Nutrition AI', icon: UtensilsCrossed, badge: 'Multimodal' },
    { id: 'freshness', label: 'Freshness Detection', icon: Sparkles, badge: 'Vision' },
    { id: 'hygiene', label: 'Hygiene Auditor', icon: ClipboardCheck, badge: 'Audit' },
    { id: 'cooking', label: 'Smart Chef AI', icon: Bot, badge: 'Voice/Chat' },
    { id: 'meals', label: 'Meal Planner', icon: CalendarDays, badge: '7-Day' },
  ];

  const isLive = systemStatus?.gemini_configured;

  return (
    <aside className="sidebar" id="main-sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon-wrapper">
          <Leaf className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="brand-title">FoodVerse AI</h1>
          <p className="brand-subtitle">Multimodal Intelligence</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">Core Modules</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon className="nav-icon" />
              <span>{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </button>
          );
        })}

        <div className="nav-section-title" style={{ marginTop: '16px' }}>System</div>
        <button
          id="nav-settings"
          onClick={onOpenKeyModal}
          className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
        >
          <Settings className="nav-icon" />
          <span>AI & Settings</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <div
          className="demo-status-pill"
          onClick={onOpenKeyModal}
          style={{ cursor: 'pointer' }}
          title="Click to configure Gemini API Key"
        >
          <span className={`pulse-dot ${isLive ? 'live' : 'demo'}`}></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: '12px' }}>
              {isLive ? 'Gemini 1.5 Flash' : 'Smart Demo Engine'}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>
              {isLive ? 'Live Multimodal AI' : 'Sample Data Active'}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-white/50" />
        </div>
      </div>
    </aside>
  );
}
