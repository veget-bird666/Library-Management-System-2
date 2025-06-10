<template>
  <div class="content-area">
    <!-- 标题 -->
    <div class="header">
      <h2>我的借阅申请</h2>
    </div>

    <!-- 申请列表 -->
    <div class="applications-list">
      <table v-if="applications.length > 0">
        <thead>
          <tr>
            <th>申请ID</th>
            <th>书名</th>
            <th>作者</th>
            <th>出版社</th>
            <th>申请时间</th>
            <th>处理时间</th>
            <th>状态</th>
            <th>管理员备注</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="app in applications" :key="app.application_id">
            <td>{{ app.application_id }}</td>
            <td>{{ app.title }}</td>
            <td>{{ app.author }}</td>
            <td>{{ app.publisher }}</td>
            <td>{{ formatDateTime(app.apply_time) }}</td>
            <td>{{ app.process_time ? formatDateTime(app.process_time) : '-' }}</td>
            <td>
              <span :class="getStatusClass(app.status)">
                {{ getStatusText(app.status) }}
              </span>
            </td>
            <td>{{ app.admin_remark || '-' }}</td>
          </tr>
        </tbody>
      </table>
      
      <div v-else class="empty-state">
        <p>暂无借阅申请记录</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getUserApplications, type BorrowApplication } from '../api/borrow';

const applications = ref<BorrowApplication[]>([]);

// 加载申请数据
const loadApplications = async () => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    const userAccount = userInfo.account || userInfo.user_account;
    if (!userAccount) {
      alert('用户信息不存在，请重新登录');
      return;
    }

    const response = await getUserApplications(userAccount);
    applications.value = response.data;
  } catch (error: any) {
    console.error('加载申请记录失败:', error);
    alert(error.response?.data?.message || '加载失败');
  }
};

// 格式化日期时间
const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString('zh-CN');
};

// 获取状态文本
const getStatusText = (status: number) => {
  switch (status) {
    case 0: return '待处理';
    case 1: return '已批准';
    case 2: return '已拒绝';
    default: return '未知';
  }
};

// 获取状态样式类
const getStatusClass = (status: number) => {
  switch (status) {
    case 0: return 'status-pending';
    case 1: return 'status-approved';
    case 2: return 'status-rejected';
    default: return '';
  }
};

onMounted(loadApplications);
</script>

<style scoped>
.content-area {
  padding: 20px;
}

.header {
  margin-bottom: 20px;
}

.header h2 {
  color: #333;
  margin: 0;
}

.applications-list table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.applications-list th,
.applications-list td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ebeef5;
}

.applications-list th {
  background-color: #f5f6fa;
  font-weight: 600;
  color: #333;
}

.applications-list tr:hover {
  background-color: #f9f9f9;
}

.status-pending {
  color: #e6a23c;
  font-weight: 500;
}

.status-approved {
  color: #67c23a;
  font-weight: 500;
}

.status-rejected {
  color: #f56c6c;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-state p {
  margin: 0;
  font-size: 16px;
}
</style> 