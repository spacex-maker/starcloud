import axios from 'axios';

// 定义默认配置
const DEFAULT_CONFIG = {
  baseURL: process.env.REACT_APP_API_BASE_URL || 'https://.protx.cn/',
  timeout: 15000,
};

// 创建 axios 实例
const instance = axios.create({
  baseURL: localStorage.getItem('apiBaseUrl') || DEFAULT_CONFIG.baseURL,
  timeout: DEFAULT_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// 导出默认配置供其他模块使用
export const API_CONFIG = DEFAULT_CONFIG;

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 添加请求日志
    console.log('Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    });

    // 从 localStorage 获取 token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    // 添加响应日志
    console.log('Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });

    return response;
  },
  (error) => {
    console.error('Response Error:', error);
    const { response } = error;
    
    if (response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (response) {
      switch (response.status) {
        case 403:
          console.error('没有权限访问该资源');
          break;
        case 404:
          console.error('请求的资源不存在');
          break;
        case 500:
          console.error('服务器错误');
          break;
        default:
          console.error('发生错误:', response.data?.message || '未知错误');
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('网络错误，无法连接到服务器');
    } else {
      // 请求配置出错
      console.error('请求配置错误:', error.message);
    }

    return Promise.reject(error);
  }
);

// 添加请求测试方法
export const testConnection = async () => {
  try {
    const response = await instance.get('/health-check');
    return response.status === 200;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
};

export default instance; 