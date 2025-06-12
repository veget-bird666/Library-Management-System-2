import axios from 'axios'

// 创建axios实例
const request = axios.create({
  baseURL: 'http://localhost:3000', // 后端服务器地址
  timeout: 5000 // 请求超时时间
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 从localStorage获取用户信息
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}')
    // token 直接从 localStorage 获取
    const token = localStorage.getItem('token')
    
    if (token) {
      // 如果有token，添加到请求头
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  error => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授权，清除token并跳转到登录页
          localStorage.removeItem('user')
          window.location.href = '/'
          break
        case 403:
          // 权限不足
          alert('没有权限执行此操作')
          break
        case 404:
          // 资源不存在
          alert('请求的资源不存在')
          break
        case 500:
          // 服务器错误
          alert('服务器错误，请稍后重试')
          break
        default:
          alert(error.response.data.message || '请求失败，请重试')
      }
    } else {
      // 网络错误
      alert('网络错误，请检查网络连接')
    }
    return Promise.reject(error)
  }
)

export default request 