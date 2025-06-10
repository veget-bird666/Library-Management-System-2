<template>
  <div class="admin-profile">
    <div class="profile-header">
      <h1>管理员信息</h1>
      <p>查看和管理您的管理员资料</p>
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
          <h2>{{ adminInfo.admin_nickname || '管理员' }}</h2>
          <span class="admin-role">系统管理员</span>
        </div>

        <div class="info-section" v-if="!loading">
          <div class="basic-info">
            <h3>基本信息</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>管理员昵称</label>
                <div class="info-value">{{ adminInfo.admin_nickname || '未设置' }}</div>
              </div>
              
              <div class="info-item">
                <label>管理员账号</label>
                <div class="info-value">{{ adminInfo.admin_account }}</div>
              </div>
              
              <div class="info-item">
                <label>账号类型</label>
                <div class="info-value">系统管理员</div>
              </div>
              
              <div class="info-item">
                <label>管理员状态</label>
                <div class="info-value">正常</div>
              </div>
            </div>
          </div>

          <div class="managed-users">
            <h3>管理的用户 ({{ managedUsers.length }})</h3>
            <div class="users-list">
              <div v-if="managedUsers.length === 0" class="empty-state">
                <p>暂无管理的用户</p>
              </div>
              <div v-else class="user-cards">
                <div 
                  v-for="user in managedUsers" 
                  :key="user.user_account" 
                  class="user-card"
                >
                  <div class="user-avatar">
                    <svg viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="#f0f9ff" />
                      <path d="M12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5Z" fill="#0ea5e9"/>
                      <path d="M12 12.9C10 12.9 6.03 13.99 6 15.98C7.29 17.92 9.5 19.2 12 19.2C14.5 19.2 16.71 17.92 18 15.98C17.97 13.99 13.99 12.9 12 12.9Z" fill="#0ea5e9"/>
                    </svg>
                  </div>
                  <div class="user-info">
                    <div class="user-name">{{ user.nickname }}</div>
                    <div class="user-id">账号: {{ user.user_account }}</div>
                    <div class="user-status">状态: 正常</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="loading-state">
          <p>正在加载管理员信息...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAdminInfo, getManagedUsers } from '@/services/api'
import { useRouter } from 'vue-router'

const adminInfo = ref({
  admin_account: '',
  admin_nickname: ''
})

const managedUsers = ref([])
const loading = ref(false)
const router = useRouter()

onMounted(async () => {
  await loadAdminInfo()
})

const loadAdminInfo = async () => {
  try {
    loading.value = true
    // 获取当前管理员信息
    const userData = localStorage.getItem('user')
    console.log('管理员localStorage中的用户数据:', userData)
    
    if (userData) {
      const user = JSON.parse(userData)
      console.log('管理员解析后的用户数据:', user)
      
      if (!user.isAdmin) {
        console.error('非管理员用户，请重新登录')
        router.push('/')
        return
      }
      
      // 兼容新旧数据格式：优先使用account，如果没有则使用admin_account  
      const adminAccount = user.account || user.admin_account
      console.log('准备调用管理员API，账号:', adminAccount)
      
      if (!adminAccount) {
        console.error('无法获取管理员账号，请重新登录')
        router.push('/')
        return
      }
      
      // 调用API获取完整的管理员信息
      const adminResponse = await getAdminInfo(adminAccount)
      console.log('API返回的管理员信息:', adminResponse)
      
      if (adminResponse.success) {
        adminInfo.value = adminResponse.data
        console.log('设置管理员信息:', adminInfo.value)
        
        // 获取管理的用户列表
        console.log('准备获取管理的用户列表:', adminAccount)
        const usersResponse = await getManagedUsers(adminAccount)
        console.log('API返回的用户列表:', usersResponse)
        
        if (usersResponse.success) {
          managedUsers.value = usersResponse.data
          console.log('设置管理的用户列表:', managedUsers.value)
        }
      } else {
        console.error('获取管理员信息失败:', adminResponse)
      }
    } else {
      console.log('localStorage中没有管理员数据')
    }
  } catch (error) {
    console.error('加载管理员信息失败:', error)
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
.admin-profile {
  padding: 20px;
  max-width: 1000px;
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
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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

.admin-role {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.875rem;
}

.info-section {
  padding: 32px;
}

.basic-info {
  margin-bottom: 40px;
}

.basic-info h3 {
  font-size: 1.25rem;
  color: #333;
  margin-bottom: 20px;
  border-bottom: 2px solid #409EFF;
  padding-bottom: 8px;
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

.managed-users h3 {
  font-size: 1.25rem;
  color: #333;
  margin-bottom: 20px;
  border-bottom: 2px solid #409EFF;
  padding-bottom: 8px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.user-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.user-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid #e9ecef;
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.user-avatar svg {
  width: 30px;
  height: 30px;
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.user-id {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 2px;
}

.user-join-date {
  font-size: 0.75rem;
  color: #999;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-profile {
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
  
  .user-cards {
    grid-template-columns: 1fr;
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