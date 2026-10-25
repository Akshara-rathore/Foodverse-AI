import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  ChefHat,
  Bookmark,
  Check,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ArrowRight,
  BookOpen,
  Search,
  Clock
} from 'lucide-react';
import { cookingApi } from '../api/client';

export default function CookingPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hello Chef! I am **Chef Auguste**, your multimodal culinary copilot. Ask me how to fix a broken sauce, calculate cooking temperatures, substitute hard-to-find ingredients, or tap the microphone to dictate your kitchen question!'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeRecipe, setActiveRecipe] = useState(null);
  const [activeTimer, setActiveTimer] = useState({ stepIndex: null, secondsLeft: 0, isRunning: false });
  const [isListening, setIsListening] = useState(false);
  const [subSearch, setSubSearch] = useState('');
  const [subResults, setSubResults] = useState(null);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [showCookbook, setShowCookbook] = useState(false);
  const [recipeSavedNotice, setRecipeSavedNotice] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Load saved recipes
    cookingApi.getSavedRecipes().then((data) => setSavedRecipes(data)).catch(() => {});

    // Initialize Web Speech API if supported in browser
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Timer interval countdown
  useEffect(() => {
    let interval = null;
    if (activeTimer.isRunning && activeTimer.secondsLeft > 0) {
      interval = setInterval(() => {
        setActiveTimer((prev) => {
          if (prev.secondsLeft <= 1) {
            clearInterval(interval);
            alert(`Timer complete for Step ${prev.stepIndex + 1}!`);
            return { ...prev, secondsLeft: 0, isRunning: false };
          }
          return { ...prev, secondsLeft: prev.secondsLeft - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer.isRunning, activeTimer.secondsLeft]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported by your current browser.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await cookingApi.chat({
        message: text,
        history: messages.slice(-6)
      });

      const assistantMsg = {
        role: 'assistant',
        content: res.reply,
        suggested_substitutions: res.suggested_substitutions
      };
      setMessages((prev) => [...prev, assistantMsg]);

      if (res.suggested_recipe) {
        setActiveRecipe(res.suggested_recipe);
      }
    } catch (err) {
      console.error('Cooking chat error:', err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Chef, I encountered a temporary disruption. Please ask again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecipe = async (recipe) => {
    try {
      await cookingApi.saveRecipe(recipe);
      setRecipeSavedNotice(true);
      setTimeout(() => setRecipeSavedNotice(false), 3000);
      cookingApi.getSavedRecipes().then((data) => setSavedRecipes(data));
    } catch (err) {
      console.error('Failed to save recipe:', err);
    }
  };

  const handleSearchSubstitution = async (e) => {
    e.preventDefault();
    if (!subSearch.trim()) return;
    try {
      const res = await cookingApi.getSubstitutions({ ingredient: subSearch });
      setSubResults(res);
    } catch (err) {
      console.error('Substitution search error:', err);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const startStepTimer = (stepIndex, durationSeconds) => {
    setActiveTimer({
      stepIndex,
      secondsLeft: durationSeconds || 180,
      isRunning: true
    });
  };

  return (
    <div id="cooking-view" style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(320px, 1fr)', gap: '24px' }}>
      {/* Left Column: Conversational AI Chat */}
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)', minHeight: '620px' }}>
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px' }}>
          {/* Chat Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="card-icon-bubble" style={{ background: '#fae8ff', color: '#86198f' }}>
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Chef Auguste AI</h3>
                <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Master Culinary & Recipe Copilot</span>
              </div>
            </div>

            <button
              onClick={() => setShowCookbook(!showCookbook)}
              className="btn btn-secondary btn-sm"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Cookbook ({savedRecipes.length})</span>
            </button>
          </div>

          {/* Quick Prompt Pills */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '10px' }}>
            <button
              onClick={() => handleSendMessage('Give me a 20-minute creamy Tuscan salmon recipe with steps and timers')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11.5px', whiteSpace: 'nowrap' }}
            >
              🐟 Salmon Skillet
            </button>
            <button
              onClick={() => handleSendMessage('What are the best culinary substitutes for eggs in baking?')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11.5px', whiteSpace: 'nowrap' }}
            >
              🥚 Egg Substitutes
            </button>
            <button
              onClick={() => handleSendMessage('Show me how to make a crispy chickpea green goddess bowl')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11.5px', whiteSpace: 'nowrap' }}
            >
              🥗 Grain Goddess Bowl
            </button>
            <button
              onClick={() => handleSendMessage('What can I substitute for buttermilk in pancakes?')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11.5px', whiteSpace: 'nowrap' }}
            >
              🥛 Buttermilk Swap
            </button>
          </div>

          {/* Messages Stream */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', paddingRight: '6px' }}>
            {messages.map((m, idx) => {
              const isAssistant = m.role === 'assistant';
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignSelf: isAssistant ? 'flex-start' : 'flex-end',
                    maxWidth: '85%'
                  }}
                >
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      background: isAssistant ? 'var(--cream-100)' : 'linear-gradient(135deg, var(--forest-700), var(--forest-600))',
                      color: isAssistant ? 'var(--forest-900)' : '#ffffff',
                      border: isAssistant ? '1px solid var(--border-subtle)' : 'none',
                      fontSize: '13.5px',
                      lineHeight: 1.5,
                      boxShadow: isAssistant ? 'none' : 'var(--shadow-xs)'
                    }}
                  >
                    <div style={{ whiteSpace: 'pre-line' }}>{m.content}</div>

                    {/* Inline substitution preview if returned */}
                    {m.suggested_substitutions && (
                      <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--forest-800)', marginBottom: '6px' }}>
                          Quick Ingredient Matrix:
                        </div>
                        {m.suggested_substitutions.map((sub, sIdx) => (
                          <div key={sIdx} style={{ fontSize: '12px', marginBottom: '4px' }}>
                            • <strong>{sub.substitute}</strong> ({sub.ratio})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px', alignSelf: isAssistant ? 'flex-start' : 'flex-end' }}>
                    {isAssistant ? 'Chef Auguste' : 'You'}
                  </span>
                </div>
              );
            })}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--cream-100)', alignSelf: 'flex-start' }}>
                <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Chef Auguste is composing culinary guidance...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div style={{ marginTop: '14px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
            >
              {/* Voice Input Button */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                className="btn btn-secondary"
                style={{
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  background: isListening ? '#fee2e2' : 'var(--cream-200)',
                  color: isListening ? '#ef4444' : 'var(--forest-800)',
                  border: isListening ? '1px solid #ef4444' : '1px solid var(--border-subtle)'
                }}
                title={isListening ? 'Listening... click to stop' : 'Click to speak via Web Speech voice recognition'}
              >
                {isListening ? <Mic className="w-4 h-4 animate-pulse" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                className="form-input"
                placeholder={isListening ? 'Listening to your voice...' : 'Ask Chef Auguste about a recipe, technique, or swap...'}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                style={{ flex: 1 }}
              />

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !inputText.trim()}
                id="btn-send-chef-msg"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Column: Interactive Recipe Card & Substitution Finder */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Ingredient Substitution Search Box */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Search className="w-4 h-4 text-emerald-800" />
            <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Ingredient Substitution Engine</h4>
          </div>
          <form onSubmit={handleSearchSubstitution} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. egg, buttermilk, heavy cream, soy sauce..."
              value={subSearch}
              onChange={(e) => setSubSearch(e.target.value)}
              style={{ fontSize: '13px' }}
            />
            <button type="submit" className="btn btn-secondary btn-sm">
              Find
            </button>
          </form>

          {subResults && (
            <div style={{ background: 'var(--cream-100)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '8px' }}>
                Substitutes for {subResults.original_ingredient}:
              </div>
              {subResults.options?.map((opt, i) => (
                <div key={i} style={{ fontSize: '12px', marginBottom: '6px', paddingBottom: '6px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--forest-800)' }}>{opt.substitute} ({opt.ratio})</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{opt.flavor_impact} • <em>{opt.best_used_for}</em></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Interactive Step-by-Step Recipe Card */}
        {activeRecipe ? (
          <div className="card" style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mint-500)', textTransform: 'uppercase' }}>
                  {activeRecipe.cuisine} • {activeRecipe.difficulty}
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-900)' }}>
                  {activeRecipe.title}
                </h3>
              </div>
              <button
                onClick={() => handleSaveRecipe(activeRecipe)}
                className="btn btn-secondary btn-sm"
                title="Save to My Cookbook"
              >
                {recipeSavedNotice ? <Check className="w-4 h-4 text-emerald-600" /> : <Bookmark className="w-4 h-4" />}
                <span>{recipeSavedNotice ? 'Saved!' : 'Save'}</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              <span>⏱ Cook: <strong>{activeRecipe.cook_time}</strong></span>
              <span>🔥 <strong>{activeRecipe.calories_per_serving} kcal</strong>/serving</span>
              <span>🍽 Servings: <strong>{activeRecipe.servings}</strong></span>
            </div>

            {/* Ingredients List */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '6px' }}>
                Ingredients Required:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12.5px', color: 'var(--forest-800)' }}>
                {activeRecipe.ingredients?.map((ing, i) => (
                  <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input type="checkbox" style={{ accentColor: 'var(--forest-600)' }} />
                    <span>{ing}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Interactive Steps with Timers */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '10px' }}>
                Step-by-Step Cooking Guide:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activeRecipe.steps?.map((st, i) => {
                  const isCurrentStepTimer = activeTimer.stepIndex === i;
                  return (
                    <div
                      key={i}
                      style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--cream-100)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--forest-700)' }}>
                          Step {st.step_number}
                        </span>

                        {st.timer_seconds && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {isCurrentStepTimer ? (
                              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-coral)' }}>
                                {formatTimer(activeTimer.secondsLeft)}
                              </span>
                            ) : (
                              <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                                {Math.round(st.timer_seconds / 60)}m timer
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                if (isCurrentStepTimer && activeTimer.isRunning) {
                                  setActiveTimer((prev) => ({ ...prev, isRunning: false }));
                                } else if (isCurrentStepTimer && !activeTimer.isRunning && activeTimer.secondsLeft > 0) {
                                  setActiveTimer((prev) => ({ ...prev, isRunning: true }));
                                } else {
                                  startStepTimer(i, st.timer_seconds);
                                }
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '3px 8px', fontSize: '11px' }}
                            >
                              {isCurrentStepTimer && activeTimer.isRunning ? (
                                <Pause className="w-3 h-3" />
                              ) : (
                                <Play className="w-3 h-3" />
                              )}
                              <span>
                                {isCurrentStepTimer && activeTimer.isRunning ? 'Pause' : 'Start'}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>

                      <p style={{ fontSize: '12.5px', color: 'var(--forest-900)', lineHeight: 1.45 }}>
                        {st.instruction}
                      </p>

                      {st.pro_tip && (
                        <div style={{ marginTop: '6px', fontSize: '11.5px', color: 'var(--forest-600)', fontStyle: 'italic', background: 'var(--mint-50)', padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}>
                          💡 <strong>Pro Tip:</strong> {st.pro_tip}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-secondary)' }}>
            <ChefHat className="w-10 h-10 text-emerald-800" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '6px' }}>
              No Active Recipe Selected
            </h4>
            <p style={{ fontSize: '13px' }}>
              Ask Chef Auguste in the chat to create a recipe, or select one of the quick buttons on the left to load interactive timers and steps!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
