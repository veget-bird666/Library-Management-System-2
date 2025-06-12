import axios from 'axios'

// 配置axios默认值
axios.defaults.baseURL = 'http://localhost:5173'
axios.defaults.withCredentials = true // 允许跨域请求携带凭证

// 添加请求拦截器
axios.interceptors.request.use(
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

const BASE_URL = '/api'

interface RegisterData {
  username: string
  email: string
  password: string
  isAdmin: boolean
}

interface LoginData {
  email: string
  password: string
  isAdmin: boolean
}

// 用户信息接口
interface UserInfo {
  user_account: string
  nickname: string
  admin_account: string
  admin_nickname?: string
  user_credit?: number
  status?: number
}

// 管理员信息接口
interface AdminInfo {
  admin_account: string
  admin_nickname: string
}

// 管理的用户信息接口
interface ManagedUser {
  user_account: string
  nickname: string
  user_credit: number
  status: number
}

export const register = async (data: RegisterData) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const login = async (data: LoginData) => {
  try {
    console.log('发送登录请求，数据：', data);
    console.log('请求URL：', `${BASE_URL}/auth/login`);
    const response = await axios.post(`${BASE_URL}/auth/login`, data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    console.log('登录响应：', response.data);
    return response.data;
  } catch (error: any) {
    console.error('登录错误：', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config
    });
    throw error;
  }
}

// 获取用户详细信息
export const getUserInfo = async (userAccount: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/auth/user/${userAccount}`)
    return response.data
  } catch (error) {
    throw error
  }
}

// 获取管理员详细信息
export const getAdminInfo = async (adminAccount: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/auth/admin/${adminAccount}`)
    return response.data
  } catch (error) {
    throw error
  }
}

// 获取管理员管理的用户列表
export const getManagedUsers = async (adminAccount: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/auth/admin/${adminAccount}/users`)
    return response.data
  } catch (error) {
    throw error
  }
}

// 获取所有用户列表（管理员）
export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/admin/users`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// 更新用户信用分（管理员）
export const updateUserCredit = async (userAccount: string, newCredit: number) => {
  try {
    const response = await axios.post(`${BASE_URL}/admin/update-credit`, {
      userAccount,
      newCredit
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// 更新用户状态（管理员）
export const toggleUserStatus = async (userAccount: string, status: number) => {
  try {
    const response = await axios.post(`${BASE_URL}/admin/toggle-user-status`, {
      userAccount,
      status
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// 获取用户信用分
export const getUserCredit = async (userAccount: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/users/${userAccount}/credit`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 登出
export const logout = () => {
  localStorage.removeItem('token');
} 

