// src/components/admin/Sidebar.vue
<template>
  <div class="sidebar">
    <div class="logo">
      <img src="@/assets/logo.svg" alt="Logo" class="logo-img" />
      <span>图书管理</span>
    </div>
    <div class="menu">
      <div class="menu-group">
        <div class="menu-title">功能管理</div>
        <div class="menu-items">
          <router-link to="/admin/applications" class="menu-item" active-class="active">
            <i class="icon application-icon"></i><span>申请管理</span>
          </router-link>
          <router-link to="/admin/borrow" class="menu-item" active-class="active">
            <i class="icon borrow-icon"></i><span>借阅管理</span>
          </router-link>
          <router-link to="/admin/books" class="menu-item" active-class="active">
            <i class="icon book-icon"></i><span>图书管理</span>
          </router-link>
          <router-link to="/admin/readers" class="menu-item" active-class="active">
            <i class="icon reader-icon"></i><span>读者管理</span>
          </router-link>
          <router-link to="/admin/announcements" class="menu-item" active-class="active">
            <i class="icon announcement-icon"></i><span>公告管理</span>
          </router-link>
        </div>
      </div>
      <div class="menu-group">
        <div class="menu-title">统计分析</div>
        <div class="menu-items">
          <router-link to="/admin/statistics" class="menu-item" active-class="active">
            <i class="icon stats-icon"></i><span>统计分析</span>
          </router-link>
        </div>
      </div>
      <div class="menu-group">
        <div class="menu-title">个人中心</div>
        <div class="menu-items">
          <router-link to="/admin/profile" class="menu-item" active-class="active">
            <i class="icon profile-icon"></i><span>个人信息</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 此处如有需要可加入逻辑，例如响应式高亮处理
</script>

<style scoped>
.sidebar {
  width: 240px;
  background-color: #1e2837;
  color: white;
  padding: 20px 0;
  height: 100vh;
  overflow-y: auto;
}

.logo {
  display: flex;
  align-items: center;
  padding: 0 20px;
  margin-bottom: 30px;
}

.logo-img {
  width: 32px;
  height: 32px;
  margin-right: 10px;
  filter: brightness(0) invert(1); /* 将 SVG 转为白色 */
}

.logo span {
  font-size: 18px;
  font-weight: 500;
}

.menu-group {
  margin-bottom: 20px;
}

.menu-title {
  padding: 10px 20px;
  color: #8c8c8c;
  font-size: 14px;
}

.menu-items {
  padding: 0 10px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 10px;
  color: #a6b0cf;
  text-decoration: none;
  border-radius: 5px;
  margin: 2px 0;
  transition: all 0.3s ease;
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.menu-item.active {
  background-color: #409EFF;
  color: white;
}

.menu-item i {
  margin-right: 10px;
  font-size: 16px;
}

.menu-item span {
  font-size: 14px;
}

/* 图标样式 */
.icon {
  width: 16px;
  height: 16px;
  display: inline-block;
  margin-right: 8px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  opacity: 0.7;
}

.menu-item:hover .icon,
.menu-item.active .icon {
  opacity: 1;
}

.application-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z'/%3E%3C/svg%3E");
}

.borrow-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z'/%3E%3C/svg%3E");
}

.book-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z'/%3E%3C/svg%3E");
}

.reader-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E");
}

.announcement-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z'/%3E%3C/svg%3E");
}

.stats-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z'/%3E%3C/svg%3E");
}

.profile-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E");
}
</style>