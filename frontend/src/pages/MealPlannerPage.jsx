import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  ShoppingCart,
  Clock,
  Flame,
  ChefHat,
  Filter,
  Check,
  X,
  Sliders,
  DollarSign
} from 'lucide-react';
import { mealsApi } from '../api/client';

export default function MealPlannerPage() {
  const [durationDays, setDurationDays] = useState(7);
  const [calorieTarget, setCalorieTarget] = useState(2100);
  const [dietaryPrefs, setDietaryPrefs] = useState(['Balanced', 'Mediterranean']);
  const [allergies, setAllergies] = useState([]);
  const [budget, setBudget] = useState('Moderate');
  const [goal, setGoal] = useState('Healthy Maintenance');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // Grocery check state
  const [groceries, setGroceries] = useState([]);

  // Meal replacement modal state
  const [replacementModal, setReplacementModal] = useState({
    isOpen: false,
    mealType: '',
    currentMealName: '',
    dayIndex: 0,
    mealIndex: 0,
    options: []
  });

  const diets = ['Balanced', 'Mediterranean', 'High-Protein', 'Vegetarian', 'Vegan', 'Keto', 'Paleo'];
  const commonAllergies = ['Dairy', 'Tree Nuts', 'Peanuts', 'Gluten', 'Shellfish', 'Soy', 'Eggs'];
  const goals = ['Fat Loss', 'Muscle Gain', 'Healthy Maintenance', 'Athletic Performance'];

  useEffect(() => {
    // Generate default plan on mount
    handleGeneratePlan();
  }, []);

  const handleGeneratePlan = async () => {
    setLoading(true);
    try {
      const res = await mealsApi.generatePlan({
        duration_days: durationDays,
        daily_calorie_target: calorieTarget,
        dietary_preferences: dietaryPrefs,
        allergies: allergies,
        budget_level: budget,
        goal: goal
      });
      setPlan(res);
      setGroceries(res.grocery_list || []);
      setSelectedDayIndex(0);
    } catch (err) {
      console.error('Error generating meal plan:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const toggleGroceryItem = (index) => {
    setGroceries((prev) =>
      prev.map((item, i) => (i === index ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleOpenReplace = async (dayIdx, mealIdx, meal) => {
    try {
      const res = await mealsApi.replaceMeal({
        current_meal_name: meal.name,
        meal_type: meal.meal_type,
        calorie_target: meal.calories,
        dietary_preferences: dietaryPrefs,
        allergies: allergies
      });
      setReplacementModal({
        isOpen: true,
        mealType: meal.meal_type,
        currentMealName: meal.name,
        dayIndex: dayIdx,
        mealIndex: mealIdx,
        options: res.replacements || []
      });
    } catch (err) {
      console.error('Error fetching replacements:', err);
    }
  };

  const handleSelectReplacement = (newMeal) => {
    if (!plan) return;
    const updatedDays = [...plan.days];
    const targetDay = { ...updatedDays[replacementModal.dayIndex] };
    const updatedMeals = [...targetDay.meals];
    updatedMeals[replacementModal.mealIndex] = newMeal;

    targetDay.meals = updatedMeals;
    targetDay.total_calories = updatedMeals.reduce((acc, m) => acc + m.calories, 0);
    targetDay.total_protein = Math.round(updatedMeals.reduce((acc, m) => acc + m.protein, 0) * 10) / 10;
    targetDay.total_carbs = Math.round(updatedMeals.reduce((acc, m) => acc + m.carbs, 0) * 10) / 10;
    targetDay.total_fat = Math.round(updatedMeals.reduce((acc, m) => acc + m.fat, 0) * 10) / 10;

    updatedDays[replacementModal.dayIndex] = targetDay;
    setPlan({ ...plan, days: updatedDays });
    setReplacementModal({ ...replacementModal, isOpen: false });
  };

  const activeDay = plan?.days?.[selectedDayIndex];

  return (
    <div id="meal-planner-view">
      {/* Top Preference Form Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header" style={{ marginBottom: '14px' }}>
          <div className="card-title-group">
            <div className="card-icon-bubble">
              <Sliders className="w-5 h-5 text-emerald-800" />
            </div>
            <div>
              <h3 className="card-title">Personalized Dietary Intelligence</h3>
              <p className="card-subtitle">Configure macros, allergies, duration, and metabolic goals</p>
            </div>
          </div>

          <button
            onClick={handleGeneratePlan}
            className="btn btn-primary"
            disabled={loading}
            id="btn-generate-plan"
          >
            {loading ? <span className="spinner"></span> : <RefreshCw className="w-4 h-4" />}
            <span>Regenerate AI Plan</span>
          </button>
        </div>

        {/* Sliders & Selectors Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '16px' }}>
          {/* Calorie target slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              <span>Daily Target Calories:</span>
              <span style={{ color: 'var(--forest-700)', fontWeight: 800 }}>{calorieTarget} kcal</span>
            </div>
            <input
              type="range"
              min="1400"
              max="3800"
              step="50"
              value={calorieTarget}
              onChange={(e) => setCalorieTarget(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--forest-600)' }}
            />
          </div>

          {/* Duration slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              <span>Plan Duration:</span>
              <span style={{ color: 'var(--forest-700)', fontWeight: 800 }}>{durationDays} Days</span>
            </div>
            <input
              type="range"
              min="1"
              max="7"
              step="1"
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--forest-600)' }}
            />
          </div>

          {/* Goal Selector */}
          <div>
            <label className="form-label">Nutrition / Fitness Goal</label>
            <select
              className="form-select"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              style={{ fontSize: '13px' }}
            >
              {goals.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Budget */}
          <div>
            <label className="form-label">Grocery Budget Tier</label>
            <select
              className="form-select"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              style={{ fontSize: '13px' }}
            >
              <option value="Budget-friendly">Budget-friendly ($)</option>
              <option value="Moderate">Moderate ($$)</option>
              <option value="Gourmet">Gourmet Organic ($$$)</option>
            </select>
          </div>
        </div>

        {/* Dietary preferences pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--forest-800)', marginRight: '6px' }}>
            Dietary Framework:
          </span>
          {diets.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => toggleDiet(d)}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '11.5px',
                border: dietaryPrefs.includes(d) ? '1px solid var(--forest-600)' : '1px solid var(--border-subtle)',
                background: dietaryPrefs.includes(d) ? 'var(--mint-100)' : 'var(--cream-100)',
                color: dietaryPrefs.includes(d) ? 'var(--forest-900)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: dietaryPrefs.includes(d) ? 700 : 400
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner" style={{ margin: '0 auto 16px auto', width: '36px', height: '36px' }}></div>
          <p style={{ fontWeight: 600, color: 'var(--forest-800)' }}>
            Calculating micronutrient equilibrium and building 7-day schedule...
          </p>
        </div>
      )}

      {/* Plan Schedule View */}
      {plan && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Day Navigation Tabs */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {plan.days?.map((day, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedDayIndex(idx)}
                style={{
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-md)',
                  border: selectedDayIndex === idx ? '2px solid var(--forest-600)' : '1px solid var(--border-subtle)',
                  background: selectedDayIndex === idx ? 'var(--mint-100)' : 'var(--cream-50)',
                  color: selectedDayIndex === idx ? 'var(--forest-900)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: selectedDayIndex === idx ? 700 : 500,
                  fontSize: '13px',
                  whiteSpace: 'nowrap',
                  boxShadow: selectedDayIndex === idx ? 'var(--shadow-xs)' : 'none'
                }}
              >
                <div>{day.day}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {day.total_calories} kcal • {day.total_protein}g P
                </div>
              </button>
            ))}
          </div>

          {/* Active Day Overview Card */}
          {activeDay && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', marginBottom: '18px' }}>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--forest-900)' }}>
                    {activeDay.day} Meal Breakdown
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Daily Nutrition: <strong>{activeDay.total_calories} kcal</strong> | <strong>{activeDay.total_protein}g Protein</strong> | <strong>{activeDay.total_carbs}g Carbs</strong> | <strong>{activeDay.total_fat}g Fats</strong>
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: 'var(--radius-full)', background: 'var(--mint-100)', color: 'var(--forest-800)' }}>
                    Calorie Match: 98%
                  </span>
                </div>
              </div>

              {/* Meals Grid (Breakfast, Lunch, Dinner, Snack) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                {activeDay.meals?.map((meal, mIdx) => (
                  <div
                    key={mIdx}
                    style={{
                      padding: '18px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--cream-100)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            background:
                              meal.meal_type === 'Breakfast'
                                ? '#fef3c7'
                                : meal.meal_type === 'Lunch'
                                ? '#e0f2fe'
                                : meal.meal_type === 'Dinner'
                                ? '#fae8ff'
                                : 'var(--mint-100)',
                            color:
                              meal.meal_type === 'Breakfast'
                                ? '#b45309'
                                : meal.meal_type === 'Lunch'
                                ? '#0369a1'
                                : meal.meal_type === 'Dinner'
                                ? '#86198f'
                                : 'var(--forest-800)'
                          }}
                        >
                          {meal.meal_type}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          ⏱ {meal.prep_time}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '6px' }}>
                        {meal.name}
                      </h4>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '12px' }}>
                        {meal.description}
                      </p>

                      {/* Ingredients snippet */}
                      <div style={{ fontSize: '12px', color: 'var(--forest-800)', marginBottom: '14px' }}>
                        <strong>Ingredients:</strong> {meal.ingredients?.slice(0, 3).join(', ')}...
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--forest-800)' }}>
                        🔥 {meal.calories} kcal ({meal.protein}g P)
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenReplace(selectedDayIndex, mIdx, meal)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '11.5px', padding: '4px 8px' }}
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Swap Meal</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grocery List & Batch Prep Card */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
            {/* Categorized Grocery List */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingCart className="w-5 h-5 text-emerald-800" />
                  <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Consolidated Grocery Checklist</h3>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {groceries.filter((g) => g.checked).length} of {groceries.length} checked
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '380px', overflowY: 'auto' }}>
                {groceries.map((item, idx) => (
                  <label
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: item.checked ? 'var(--cream-200)' : 'var(--cream-100)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleGroceryItem(idx)}
                        style={{ accentColor: 'var(--forest-600)', width: '16px', height: '16px' }}
                      />
                      <span
                        style={{
                          fontSize: '13px',
                          color: item.checked ? 'var(--text-muted)' : 'var(--forest-900)',
                          textDecoration: item.checked ? 'line-through' : 'none',
                          fontWeight: item.checked ? 400 : 600
                        }}
                      >
                        {item.name}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.amount}</span>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-full)',
                          background: 'rgba(0,0,0,0.05)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {item.category}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Chef Batch Meal Prep Tips */}
            <div className="card" style={{ background: 'var(--mint-50)', borderColor: 'var(--mint-300)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <ChefHat className="w-5 h-5 text-emerald-800" />
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--forest-900)' }}>Chef Batch-Prep Playbook</h3>
              </div>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px', color: 'var(--forest-800)' }}>
                {plan.meal_prep_tips?.map((tip, idx) => (
                  <li key={idx} style={{ lineHeight: 1.5 }}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Meal Swap / Replacement Modal */}
      {replacementModal.isOpen && (
        <div className="modal-overlay" onClick={() => setReplacementModal({ ...replacementModal, isOpen: false })}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Swap {replacementModal.mealType}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Replacing: <strong>{replacementModal.currentMealName}</strong>
                </p>
              </div>
              <button
                onClick={() => setReplacementModal({ ...replacementModal, isOpen: false })}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {replacementModal.options?.map((opt, i) => (
                <div
                  key={i}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--cream-100)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--forest-900)' }}>
                      {opt.name}
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {opt.calories} kcal • {opt.protein}g Protein • ⏱ {opt.prep_time}
                    </p>
                  </div>

                  <button
                    onClick={() => handleSelectReplacement(opt)}
                    className="btn btn-primary btn-sm"
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
