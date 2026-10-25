import React, { useState } from 'react';
import { User, Lock, Mail, CheckCircle2, AlertCircle, X, Utensils } from 'lucide-react';
import { authApi } from '../api/client';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dietaryPrefs, setDietaryPrefs] = useState(['Balanced']);
  const [allergies, setAllergies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const diets = ['Balanced', 'Mediterranean', 'High-Protein', 'Vegetarian', 'Vegan', 'Keto', 'Paleo'];
  const commonAllergies = ['Dairy', 'Tree Nuts', 'Peanuts', 'Gluten', 'Shellfish', 'Soy', 'Eggs'];

  const toggleDiet = (d) => {
    setDietaryPrefs((prev) =>
      prev.includes(d) ? prev.filter((item) => item !== d) : [...prev, d]
    );
  };

  const toggleAllergy = (a) => {
    setAllergies((prev) =>
      prev.includes(a) ? prev.filter((item) => item !== a) : [...prev, a]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let res;
      if (isRegister) {
        res = await authApi.register({
          name,
          email,
          password,
          dietary_preferences: dietaryPrefs,
          allergies
        });
      } else {
        res = await authApi.login({ email, password });
      }

      if (res.access_token) {
        localStorage.setItem('foodverse_token', res.access_token);
        if (onAuthSuccess) onAuthSuccess(res.user);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800 }}>
              {isRegister ? 'Create FoodVerse Account' : 'Welcome Back'}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {isRegister ? 'Personalize your culinary & nutritional intelligence' : 'Access your saved scans, meal plans and recipes'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', background: 'var(--cream-200)', borderRadius: 'var(--radius-md)', padding: '4px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(null); }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              background: !isRegister ? '#fff' : 'transparent',
              color: !isRegister ? 'var(--forest-900)' : 'var(--text-secondary)',
              boxShadow: !isRegister ? 'var(--shadow-xs)' : 'none'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(null); }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              background: isRegister ? '#fff' : 'transparent',
              color: isRegister ? 'var(--forest-900)' : 'var(--text-secondary)',
              boxShadow: isRegister ? 'var(--shadow-xs)' : 'none'
            }}
          >
            Register
          </button>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: '#fef2f2', color: '#991b1b', fontSize: '13px', marginBottom: '16px', border: '1px solid #fecaca', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <AlertCircle className="w-4 h-4 text-rose-700 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Chef Alex Carter"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {isRegister && (
            <>
              <div className="form-group" style={{ marginTop: '14px' }}>
                <label className="form-label">Dietary Preferences</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {diets.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDiet(d)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '12px',
                        border: dietaryPrefs.includes(d) ? '1px solid var(--forest-600)' : '1px solid var(--border-subtle)',
                        background: dietaryPrefs.includes(d) ? 'var(--mint-100)' : 'var(--cream-100)',
                        color: dietaryPrefs.includes(d) ? 'var(--forest-900)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontWeight: dietaryPrefs.includes(d) ? 600 : 400
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Known Allergies / Sensitivities</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {commonAllergies.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAllergy(a)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '12px',
                        border: allergies.includes(a) ? '1px solid #e76f51' : '1px solid var(--border-subtle)',
                        background: allergies.includes(a) ? '#ffebe6' : 'var(--cream-100)',
                        color: allergies.includes(a) ? '#c0392b' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontWeight: allergies.includes(a) ? 600 : 400
                      }}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div style={{ marginTop: '24px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? <span className="spinner"></span> : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
