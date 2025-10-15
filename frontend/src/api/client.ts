import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// --- Event Emitter Logic ---
// Merged here to break circular dependency
type EventCallback = (...args: any[]) => void;
class EventEmitter {
  private events: { [key: string]: EventCallback[] } = {};
  on(event: string, callback: EventCallback) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  }
  emit(event: string, ...args: any[]) {
    this.events[event]?.forEach(callback => callback(...args));
  }
}
export const authEventEmitter = new EventEmitter();
// --- End of Event Emitter Logic ---

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Enviar cookies com as requisições
  headers: {
    'Content-Type': 'application/json',
  },
});

// Instância separada do Axios APENAS para o refresh token, para evitar loop no interceptor
const axiosForRefresh = axios.create({
  baseURL: API_URL,
  withCredentials: true,
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

    // Tenta o refresh apenas se o erro for 401, não for uma retentativa,
    // e a requisição original tinha um token (indicando que o usuário estava logado).
    const hasAuthHeader = !!originalRequest.headers.Authorization;

    if (error.response?.status === 401 && hasAuthHeader && !originalRequest._retry) {
      originalRequest._retry = true; // Marca para evitar loop infinito

      try {
        // Tenta obter um novo access token
        const { data } = await axiosForRefresh.post('/auth/refresh-token');
        const { accessToken } = data;

        // Armazena o novo token
        localStorage.setItem('token', accessToken);

        // Atualiza o header da requisição original e a re-executa
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Se o refresh falhar, o token é inválido. Limpa-o imediatamente.
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Emite um evento para o AuthContext atualizar o estado da UI.
        authEventEmitter.emit('auth:logout');
        
        // Importante: Tenta a requisição original novamente sem autenticação.
        // Isso permite que rotas públicas funcionem mesmo se um token expirado foi enviado.
        delete originalRequest.headers.Authorization;
        // Em vez de reenviar a 'originalRequest' que pode ter outras configurações,
        // fazemos uma nova chamada limpa para a mesma URL, preservando os parâmetros.
        return api.get(originalRequest.url!, { params: originalRequest.params });
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

export default api;
