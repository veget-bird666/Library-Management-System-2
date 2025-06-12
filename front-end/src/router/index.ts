import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import UserView from '../views/UserView.vue'
import AdminLayout from '../layout/AdminLayout.vue'
import Books from '../views/Books.vue'
import UserBooks from '../views/UserBooks.vue'
import UserLayout from '@/layout/UserLayout.vue'
import Borrow from '@/views/Borrow.vue'
import UserManage from '@/views/UserManage.vue'
import AnnouncementManage from '@/views/AnnouncementManage.vue'
import UserBorrow from '@/views/UserBorrow.vue'
import UserAnnouncement from '@/views/UserAnnouncement.vue'
import UserProfile from '@/views/UserProfile.vue'
import AdminProfile from '@/views/AdminProfile.vue'
import Statistics from '@/views/Statistics.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminLayout,
      meta: { requiresAdmin: true },
      children: [
        {
          path: 'applications',
          name: 'admin-applications',
          component: () => import('../views/AdminApplications.vue')
        },
        {
          path: 'borrow',
          name: 'admin-borrow',
          component:Borrow
        },
        {
          path: 'books',
          name: 'admin-books',
          component: Books,
        },
        {
          path: 'readers',
          name: 'admin-readers',
          component: UserManage
        },
        {
          path: 'announcements',
          name: 'admin-announcements',
          component: AnnouncementManage
        },
        {
          path: 'statistics',
          name: 'admin-statistics',
          component: Statistics
        },
        {
          path: 'profile',
          name: 'admin-profile',
          component: AdminProfile
        }
      ]
    },
    {
      path: '/user',
      name: 'user',
      component: UserLayout,
      children: [
        {
          path: '',
          name: 'user-home',
          component: UserView
        },
        {
          path: 'books',
          name: 'user-books',
          component: UserBooks
        },
        {
          path: 'applications',
          name: 'user-applications',
          component: () => import('../views/UserApplications.vue')
        },
        {
          path: 'borrow',
          name: 'user-borrow',
          component: UserBorrow
        },
        {
          path: 'announcements',
          name: 'user-announcements',
          component: UserAnnouncement
        },
        {
          path: 'profile',
          name: 'user-profile',
          component: UserProfile
        }
      ]
    }
  ]
})

// 添加路由守卫
router.beforeEach((to, from, next) => {
  // 检查路由是否需要管理员权限
  if (to.matched.some(record => record.meta.requiresAdmin)) {
    // 获取用户信息
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}')
    if (!userInfo.isAdmin) {
      // 如果不是管理员，重定向到登录页
      next('/')
      return
    }
  }
  next()
})

export default router
