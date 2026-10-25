import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

// Attach JWT token to requests if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('foodverse_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  getMe: () => api.get('/auth/me').then((r) => r.data),
  getStatus: () => api.get('/auth/status').then((r) => r.data),
  updateApiKey: (apiKey) => api.post('/auth/api-key', { api_key: apiKey }).then((r) => r.data),
};

export const nutritionApi = {
  analyze: (formData) =>
    api.post('/nutrition/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
  getPresets: () => api.get('/nutrition/presets').then((r) => r.data),
  getHistory: () => api.get('/nutrition/history').then((r) => r.data),
};

export const freshnessApi = {
  analyze: (formData) =>
    api.post('/freshness/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
  getPresets: () => api.get('/freshness/presets').then((r) => r.data),
  getHistory: () => api.get('/freshness/history').then((r) => r.data),
};

export const hygieneApi = {
  analyze: (formData) =>
    api.post('/hygiene/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
  getPresets: () => api.get('/hygiene/presets').then((r) => r.data),
  getHistory: () => api.get('/hygiene/history').then((r) => r.data),
};

export const cookingApi = {
  chat: (data) => api.post('/cooking/chat', data).then((r) => r.data),
  getSubstitutions: (data) => api.post('/cooking/substitutions', data).then((r) => r.data),
  saveRecipe: (recipe) => api.post('/cooking/save-recipe', recipe).then((r) => r.data),
  getSavedRecipes: () => api.get('/cooking/saved-recipes').then((r) => r.data),
};

export const mealsApi = {
  generatePlan: (data) => api.post('/meals/generate', data).then((r) => r.data),
  replaceMeal: (data) => api.post('/meals/replace', data).then((r) => r.data),
  getSavedPlans: () => api.get('/meals/saved').then((r) => r.data),
};

export const dashboardApi = {
  getSummary: () => api.get('/dashboard/summary').then((r) => r.data),
};

export default api;
