import axios from 'axios';

export const SESSION_KEY = 'nt_auth_session';

export const getStoredSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const api = axios.create({ baseURL: '/api' });

// Tự gắn JWT vào mọi request
api.interceptors.request.use((config) => {
  const token = getStoredSession()?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Token hết hạn / tài khoản không còn hiệu lực -> đăng xuất và về trang đăng nhập
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const isLoginCall = String(error.config?.url || '').startsWith('/auth/login');
    if (error.response?.status === 401 && !isLoginCall && getStoredSession()) {
      localStorage.removeItem(SESSION_KEY);
      window.location.assign('/login');
    }
    return Promise.reject(error);
  }
);

// Lấy thông báo lỗi thân thiện từ phản hồi của server
export const getApiError = (error) => ({
  message: error?.response?.data?.message || 'Không kết nối được máy chủ. Vui lòng thử lại.',
  errors: error?.response?.data?.errors || {},
});

export default api;
