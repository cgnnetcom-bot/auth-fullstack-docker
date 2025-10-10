import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Enviar cookies com as requisições
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response, // Passa respostas de sucesso adiante
  async (error) => {
    const originalRequest = error.config;

    // Se o erro for 401 e não for uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Marca para evitar loop infinito

      try {
        // Tenta obter um novo access token
        const { data } = await api.post('/auth/refresh-token');
        const { accessToken } = data;

        // Armazena o novo token
        localStorage.setItem('token', accessToken);

        // Atualiza o header da requisição original e a re-executa
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Se o refresh falhar, desloga o usuário
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Para todos os outros erros, apenas rejeita
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  signup: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/signup', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  forgotPassword: (data: { email: string }) =>
    api.post('/auth/forgot-password', data),

  verifyCode: (data: { email: string; code: string }) =>
    api.post('/auth/verify-code', data),

  resetPassword: (data: { resetToken: string; newPassword: string }) =>
    api.post('/auth/reset-password', data),

  logout: () => api.post('/auth/logout'),
};

// User endpoints
export const userAPI = {
  getMe: () => api.get('/me'),
};
