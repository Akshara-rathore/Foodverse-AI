import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import ApiKeyModal from './components/ApiKeyModal';
import AuthModal from './components/AuthModal';

import DashboardPage from './pages/DashboardPage';
import NutritionPage from './pages/NutritionPage';
import FreshnessPage from './pages/FreshnessPage';
import HygienePage from './pages/HygienePage';
import CookingPage from './pages/CookingPage';
import MealPlannerPage from './pages/MealPlannerPage';

import { authApi } from './api/client';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [systemStatus, setSystemStatus] = useState(null);
  const [user, setUser] = useState(null);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const fetchStatus = () => {
    authApi
      .getStatus()
      .then((data) => setSystemStatus(data))
      .catch((err) => console.error('Failed to get status:', err));
  };

  const fetchUser = () => {
    authApi
      .getMe()
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  };

  useEffect(() => {
    fetchStatus();
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('foodverse_token');
    setUser(null);
  };

  return (
    <div className="app-container" id="foodverse-root">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemStatus={systemStatus}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
      />

      {/* Main App Layout */}
      <div className="main-wrapper">
        <Topbar
          activeTab={activeTab}
          systemStatus={systemStatus}
          user={user}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenKeyModal={() => setIsKeyModalOpen(true)}
          onLogout={handleLogout}
        />

        <main className="page-body">
          {activeTab === 'dashboard' && <DashboardPage setActiveTab={setActiveTab} />}
          {activeTab === 'nutrition' && <NutritionPage onOpenKeyModal={() => setIsKeyModalOpen(true)} />}
          {activeTab === 'freshness' && <FreshnessPage onOpenKeyModal={() => setIsKeyModalOpen(true)} />}
          {activeTab === 'hygiene' && <HygienePage onOpenKeyModal={() => setIsKeyModalOpen(true)} />}
          {activeTab === 'cooking' && <CookingPage />}
          {activeTab === 'meals' && <MealPlannerPage />}
        </main>
      </div>

      {/* Modals */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        systemStatus={systemStatus}
        onStatusChange={fetchStatus}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(userData) => setUser(userData)}
      />
    </div>
  );
}
