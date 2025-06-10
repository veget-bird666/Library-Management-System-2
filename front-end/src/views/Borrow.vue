<template>
  <div class="content-area">
    <!-- 标题 -->
    <div class="header">
      <h2>借阅管理</h2>
      <div class="stats">
        <span>总记录数: {{ records.length }}</span>
        <span class="divider">|</span>
        <span>在借: {{ records.filter(r => r.status === 1).length }}</span>
        <span class="divider">|</span>
        <span>已归还: {{ records.filter(r => r.status === 2).length }}</span>
      </div>
    </div>

    <!-- 借阅记录列表 -->
    <div class="records-list">
      <table v-if="records.length > 0">
        <thead>
          <tr>
            <th>记录ID</th>
            <th>用户</th>
            <th>书名</th>
            <th>作者</th>
            <th>借书时间</th>
            <th>应还时间</th>
            <th>实际还书时间</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in records" :key="record.record_id">
            <td>{{ record.record_id }}</td>
            <td>{{ record.user_nickname }} ({{ record.user_account }})</td>
            <td>{{ record.title }}</td>
            <td>{{ record.author }}</td>
            <td>{{ formatDateTime(record.borrow_time) }}</td>
            <td>{{ formatDate(record.should_return_time) }}</td>
            <td>{{ record.return_time ? formatDateTime(record.return_time) : '-' }}</td>
            <td>
              <span :class="getStatusClass(record.status)">
                {{ getStatusText(record.status) }}
              </span>
            </td>
            <td>
              <button 
                v-if="record.status === 1" 
                class="btn btn-return" 
                @click="handleReturn(record.record_id)"
              >
                还书
              </button>
              <span v-else class="no-action">-</span>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-else class="empty-state">
        <p>暂无借阅记录</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getAdminBorrowRecords, returnBook, type BorrowRecord } from '../api/borrow';
import { useRouter } from 'vue-router';

const router = useRouter();
const records = ref<BorrowRecord[]>([]);

// 加载借阅记录
const loadRecords = async () => {
  try {
    const adminInfo = JSON.parse(localStorage.getItem('user') || '{}');
    if (!adminInfo.isAdmin) {
      alert('非管理员用户，请重新登录');
      router.push('/');
      return;
    }

    const adminAccount = adminInfo.account || adminInfo.admin_account;
    if (!adminAccount) {
      alert('管理员信息不存在，请重新登录');
      router.push('/');
      return;
    }

    const response = await getAdminBorrowRecords(adminAccount);
    records.value = response.data;
  } catch (error: any) {
    console.error('加载借阅记录失败:', error);
    alert(error.response?.data?.message || '加载失败');
  }
};

// 处理还书
const handleReturn = async (recordId: number) => {
  if (!confirm('确认该图书已归还？')) return;
  
  try {
    await returnBook(recordId);
    alert('图书归还成功');
    loadRecords(); // 重新加载列表
  } catch (error: any) {
    console.error('归还图书失败:', error);
    alert(error.response?.data?.message || '操作失败');
  }
};

// 格式化日期时间
const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString('zh-CN');
};

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN');
};

// 获取状态文本
const getStatusText = (status: number) => {
  switch (status) {
    case 1: return '在借';
    case 2: return '已归还';
    case 3: return '逾期';
    default: return '未知';
  }
};

// 获取状态样式类
const getStatusClass = (status: number) => {
  switch (status) {
    case 1: return 'status-borrowed';
    case 2: return 'status-returned';
    case 3: return 'status-overdue';
    default: return '';
  }
};

onMounted(loadRecords);
</script>
  
<style scoped>
.content-area {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  color: #333;
  margin: 0;
}

.stats {
  color: #666;
  font-size: 14px;
}

.stats .divider {
  margin: 0 8px;
  color: #ddd;
}

.records-list table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.records-list th,
.records-list td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ebeef5;
}

.records-list th {
  background-color: #f5f6fa;
  font-weight: 600;
  color: #333;
}

.records-list tr:hover {
  background-color: #f9f9f9;
}

.status-borrowed {
  color: #409eff;
  font-weight: 500;
}

.status-returned {
  color: #67c23a;
  font-weight: 500;
}

.status-overdue {
  color: #f56c6c;
  font-weight: 500;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.btn-return {
  background-color: #409eff;
  color: white;
}

.btn-return:hover {
  background-color: #337ecc;
}

.no-action {
  color: #c0c4cc;
  font-style: italic;
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