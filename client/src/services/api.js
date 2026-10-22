import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('talentscout_user');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        if (parsed.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      } catch (e) {
        console.error('Failed to parse user info', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('talentscout_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API Service Methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const playerAPI = {
  getPlayers: (params) => api.get('/players', { params }),
  getPlayerById: (id) => api.get(`/players/${id}`),
  createPlayer: (data) => api.post('/players', data),
  updatePlayer: (id, data) => api.put(`/players/${id}`, data),
  archivePlayer: (id) => api.put(`/players/${id}/archive`),
  deletePlayer: (id) => api.delete(`/players/${id}`),
};

export const coachAPI = {
  getCoaches: () => api.get('/coaches'),
  getCoachById: (id) => api.get(`/coaches/${id}`),
  createCoach: (data) => api.post('/coaches', data),
  updateCoach: (id, data) => api.put(`/coaches/${id}`, data),
  deleteCoach: (id) => api.delete(`/coaches/${id}`),
};

export const sessionAPI = {
  getSessions: (params) => api.get('/sessions', { params }),
  getSessionById: (id) => api.get(`/sessions/${id}`),
  createSession: (data) => api.post('/sessions', data),
  updateSession: (id, data) => api.put(`/sessions/${id}`, data),
  deleteSession: (id) => api.delete(`/sessions/${id}`),
};

export const attendanceAPI = {
  recordAttendance: (sessionId, records) => api.post(`/attendance/session/${sessionId}`, { records }),
  getSessionAttendance: (sessionId) => api.get(`/attendance/session/${sessionId}`),
  getPlayerAttendance: (playerId) => api.get(`/attendance/player/${playerId}`),
  getAttendanceStats: () => api.get('/attendance/stats'),
};

export const evaluationAPI = {
  getEvaluations: (params) => api.get('/evaluations', { params }),
  getEvaluationById: (id) => api.get(`/evaluations/${id}`),
  createEvaluation: (data) => api.post('/evaluations', data),
  updateEvaluation: (id, data) => api.put(`/evaluations/${id}`, data),
  deleteEvaluation: (id) => api.delete(`/evaluations/${id}`),
  compareEvaluations: (payload) => api.post('/evaluations/compare', payload),
};

export const goalAPI = {
  getPlayerGoals: (playerId) => api.get(`/goals/player/${playerId}`),
  createGoal: (data) => api.post('/goals', data),
  updateGoal: (id, data) => api.put(`/goals/${id}`, data),
  deleteGoal: (id) => api.delete(`/goals/${id}`),
};

export const aiAPI = {
  requestAnalysis: (playerId) => api.post(`/ai/analyze/${playerId}`),
  getPlayerAnalyses: (playerId) => api.get(`/ai/player/${playerId}`),
  getAnalysisById: (id) => api.get(`/ai/${id}`),
};

export const academyAPI = {
  getAcademy: () => api.get('/academy'),
  updateAcademy: (data) => api.put('/academy', data),
};

export const statsAPI = {
  getOverview: () => api.get('/stats/overview'),
  getCoachOverview: () => api.get('/stats/coach-overview'),
};

export default api;
