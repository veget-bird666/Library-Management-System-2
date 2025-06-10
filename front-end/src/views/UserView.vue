<script setup lang="ts">
import { ref, onMounted } from 'vue'

const username = ref('默认用户')

onMounted(() => {
  const userInfo = localStorage.getItem('user')
  if (userInfo) {
    const user = JSON.parse(userInfo)
    username.value = user.username || user.nickname || '默认用户'
  }
})
</script>

<template>
  <div class="user-home">
    <div class="welcome-section">
      <h1>欢迎使用图书管理系统</h1>
      <p>你好，{{ username }}！这里是系统主页，您可以通过左侧菜单访问各项功能。</p>
    </div>
    
    <div class="feature-cards">
      <div class="card">
        <div class="card-icon">📚</div>
        <h3>图书浏览</h3>
        <p>浏览所有可借阅的图书</p>
        <router-link to="/user/books" class="card-button">立即访问</router-link>
      </div>
      
             <div class="card">
         <div class="card-icon">📖</div>
         <h3>我的借阅</h3>
         <p>查看当前借阅情况</p>
         <router-link to="/user/function2" class="card-button">立即访问</router-link>
       </div>
       
       <div class="card">
         <div class="card-icon">👤</div>
         <h3>个人信息</h3>
         <p>查看和管理个人资料</p>
         <router-link to="/user/profile" class="card-button">立即访问</router-link>
       </div>
    </div>
  </div>
</template>

<style scoped>
.user-home {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  text-align: center;
  margin-bottom: 40px;
  padding: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.welcome-section h1 {
  font-size: 2.5rem;
  margin-bottom: 16px;
  font-weight: 600;
}

.welcome-section p {
  font-size: 1.1rem;
  opacity: 0.9;
  line-height: 1.6;
}

.feature-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 32px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 32px 24px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #f0f0f0;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.card h3 {
  font-size: 1.3rem;
  margin-bottom: 12px;
  color: #333;
  font-weight: 600;
}

.card p {
  color: #666;
  margin-bottom: 20px;
  line-height: 1.5;
}

.card-button {
  display: inline-block;
  padding: 10px 24px;
  background: #409EFF;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.card-button:hover {
  background: #337ecc;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-home {
    padding: 16px;
  }
  
  .welcome-section {
    padding: 24px;
  }
  
  .welcome-section h1 {
    font-size: 1.8rem;
  }
  
  .feature-cards {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .card {
    padding: 24px 20px;
  }
}
</style> 