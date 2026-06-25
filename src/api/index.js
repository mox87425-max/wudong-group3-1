import axios from 'axios';

const request = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
});

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

request.interceptors.response.use(
  (response) => {
    const { code, message, data } = response.data;
    if (code === 200 || code === 0) {
      return data;
    }
    if (code === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(new Error(message || '请求失败'));
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default request;
