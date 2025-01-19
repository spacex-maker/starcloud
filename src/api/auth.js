import axios from './axios';

export const auth = {
  // 登录
  login: async (data) => {
    try {
      const response = await axios.post('/productx/user/login', {
        username: data.email,
        password: data.password
      });
      
      if (response.data.success) {
        // 保存 token
        localStorage.setItem('token', response.data.data);
        // 设置 axios 默认 header
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.data}`;
      }
      
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '登录失败'
      };
    }
  },

  // 注册
  register: async (data) => {
    try {
      const response = await axios.post('/auth/register', data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '注册失败'
      };
    }
  },

  // 发送验证码
  sendVerificationCode: (email) => {
    return axios.post('/auth/verification-code', { email });
  },

  // 验证邮箱验证码
  verifyCode: (email, code) => {
    return axios.post('/auth/verify-code', { email, code });
  },

  // 退出登录
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    window.location.href = '/login';
  },

  // 获取用户信息
  getUserInfo: async () => {
    try {
      const response = await axios.get('/productx/user/user-detail');
      if (response.data.success) {
        // 保存用户信息到 localStorage
        localStorage.setItem('userInfo', JSON.stringify(response.data.data));
      }
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '获取用户信息失败'
      };
    }
  },

  // 刷新 token
  refreshToken: () => {
    return axios.post('/auth/refresh-token');
  }
}; 