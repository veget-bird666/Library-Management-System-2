<template>
  <div class="user-profile">
    <div class="profile-header">
      <h1>个人信息</h1>
      <p>查看和管理您的个人资料</p>
    </div>

    <div class="profile-content">
      <div class="profile-card">
        <div class="avatar-section">
          <div class="avatar">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#ecf5ff" />
              <path d="M12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5Z" fill="#409EFF"/>
              <path d="M12 12.9C10 12.9 6.03 13.99 6 15.98C7.29 17.92 9.5 19.2 12 19.2C14.5 19.2 16.71 17.92 18 15.98C17.97 13.99 13.99 12.9 12 12.9Z" fill="#409EFF"/>
            </svg>
          </div>
          <h2>{{ userInfo.nickname || '用户' }}</h2>
          <span class="user-role">普通用户</span>
        </div>

        <div class="info-section">
          <div class="info-grid" v-if="!loading">
            <div class="info-item">
              <label>用户昵称</label>
              <div class="info-value">{{ userInfo.nickname || '未设置' }}</div>
            </div>
            
            <div class="info-item">
              <label>账号</label>
              <div class="info-value">{{ userInfo.user_account }}</div>
            </div>
            
            <div class="info-item">
              <label>所属管理员</label>
              <div class="info-value">{{ adminInfo.admin_nickname || '未分配' }}</div>
            </div>
            
            <div class="info-item">
              <label>管理员账号</label>
              <div class="info-value">{{ userInfo.admin_account || '未分配' }}</div>
            </div>
            
            <div class="info-item">
              <label>用户状态</label>
              <div class="info-value">正常</div>
            </div>
            
            <div class="info-item">
              <label>账号类型</label>
              <div class="info-value">普通用户</div>
            </div>
          </div>
          
          <div v-else class="loading-state">
            <p>正在加载用户信息...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUserInfo, getAdminInfo } from '@/services/api'

const userInfo = ref({
  user_account: '',
  nickname: '',
  admin_account: '',
  admin_nickname: ''
})

const adminInfo = ref({
  admin_account: '',
  admin_nickname: ''
})

const loading = ref(false)

onMounted(async () => {
  await loadUserInfo()
})

const loadUserInfo = async () => {
  try {
    loading.value = true
    // 获取当前用户信息
    const userData = localStorage.getItem('user')
    console.log('localStorage中的用户数据:', userData)
    
    if (userData) {
      const user = JSON.parse(userData)
      console.log('解析后的用户数据:', user)
      
      // 兼容新旧数据格式：优先使用account，如果没有则使用user_account
      const userAccount = user.account || user.user_account
      console.log('准备调用API，用户账号:', userAccount)
      
      if (!userAccount) {
        console.error('无法获取用户账号，请重新登录')
        return
      }
      
      // 调用API获取完整的用户信息
      const userResponse = await getUserInfo(userAccount)
      console.log('API返回的用户信息:', userResponse)
      
      if (userResponse.success) {
        userInfo.value = userResponse.data
        console.log('设置用户信息:', userInfo.value)
        
        // 获取管理员信息
        if (userInfo.value.admin_account) {
          console.log('准备获取管理员信息:', userInfo.value.admin_account)
          const adminResponse = await getAdminInfo(userInfo.value.admin_account)
          console.log('API返回的管理员信息:', adminResponse)
          
          if (adminResponse.success) {
            adminInfo.value = adminResponse.data
            console.log('设置管理员信息:', adminInfo.value)
          }
        }
      } else {
        console.error('获取用户信息失败:', userResponse)
      }
    } else {
      console.log('localStorage中没有用户数据')
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return '未知'
  return new Date(dateString).toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.user-profile {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.profile-header {
  text-align: center;
  margin-bottom: 32px;
}

.profile-header h1 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 8px;
}

.profile-header p {
  color: #666;
  font-size: 1rem;
}

.profile-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.avatar-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 32px;
  text-align: center;
}

.avatar {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.avatar svg {
  width: 60px;
  height: 60px;
}

.avatar-section h2 {
  font-size: 1.5rem;
  margin-bottom: 8px;
  font-weight: 600;
}

.user-role {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.875rem;
}

.info-section {
  padding: 32px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.info-item {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 16px;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item label {
  display: block;
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 6px;
  font-weight: 500;
}

.info-value {
  font-size: 1rem;
  color: #333;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-profile {
    padding: 16px;
  }
  
  .profile-header h1 {
    font-size: 1.5rem;
  }
  
  .avatar-section {
    padding: 32px 24px;
  }
  
  .info-section {
    padding: 24px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.loading-state p {
  font-size: 1rem;
  margin: 0;
}
</style> 