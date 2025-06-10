import axios from 'axios'

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
    const response = await axios.post(`${BASE_URL}/auth/login`, data)
    return response.data
  } catch (error) {
    throw error
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

