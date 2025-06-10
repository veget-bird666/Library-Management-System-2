<template>
  <div class="content-area">
    <!-- 标题 -->
    <div class="header">
      <h2>借阅申请管理</h2>
      <div class="stats">
        <span>待处理申请: {{ applications.length }}</span>
      </div>
    </div>

    <!-- 申请列表 -->
    <div class="applications-list">
      <table v-if="applications.length > 0">
        <thead>
          <tr>
            <th>申请ID</th>
            <th>用户</th>
            <th>书名</th>
            <th>作者</th>
            <th>出版社</th>
            <th>申请时间</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="app in applications" :key="app.application_id">
            <td>{{ app.application_id }}</td>
            <td>{{ app.user_nickname }} ({{ app.user_account }})</td>
            <td>{{ app.title }}</td>
            <td>{{ app.author }}</td>
            <td>{{ app.publisher }}</td>
            <td>{{ formatDateTime(app.apply_time) }}</td>
            <td>
              <span class="status-pending">待处理</span>
            </td>
            <td>
              <div class="action-buttons">
                <button 
                  class="btn btn-approve" 
                  @click="handleApprove(app.application_id)"
                >
                  批准
                </button>
                <button 
                  class="btn btn-reject" 
                  @click="handleReject(app.application_id)"
                >
                  拒绝
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-else class="empty-state">
        <p>暂无待处理的借阅申请</p>
      </div>
    </div>

    <!-- 拒绝申请对话框 -->
    <div v-if="showRejectDialog" class="dialog-overlay" @click="closeRejectDialog">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h3>拒绝申请</h3>
          <button class="dialog-close" @click="closeRejectDialog">×</button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label>拒绝原因:</label>
            <textarea 
              v-model="rejectRemark" 
              placeholder="请输入拒绝原因（可选）"
              rows="4"
            ></textarea>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-secondary" @click="closeRejectDialog">取消</button>
          <button class="btn btn-reject" @click="confirmReject">确认拒绝</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getAdminApplications, processApplication, type BorrowApplication } from '../api/borrow';
import { useRouter } from 'vue-router';

const router = useRouter();
const applications = ref<BorrowApplication[]>([]);
const showRejectDialog = ref(false);
const rejectRemark = ref('');
const currentApplicationId = ref<number | null>(null);

// 加载申请数据
const loadApplications = async () => {
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

    const response = await getAdminApplications(adminAccount);
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

// 处理批准申请
const handleApprove = async (applicationId: number) => {
  if (!confirm('确认批准该借阅申请？')) return;
  
  try {
    await processApplication(applicationId, 1);
    alert('申请已批准');
    loadApplications(); // 重新加载列表
  } catch (error: any) {
    console.error('批准申请失败:', error);
    alert(error.response?.data?.message || '操作失败');
  }
};

// 处理拒绝申请
const handleReject = (applicationId: number) => {
  currentApplicationId.value = applicationId;
  showRejectDialog.value = true;
};

// 确认拒绝申请
const confirmReject = async () => {
  if (!currentApplicationId.value) return;
  
  try {
    await processApplication(currentApplicationId.value, 2, rejectRemark.value);
    alert('申请已拒绝');
    closeRejectDialog();
    loadApplications(); // 重新加载列表
  } catch (error: any) {
    console.error('拒绝申请失败:', error);
    alert(error.response?.data?.message || '操作失败');
  }
};

// 关闭拒绝对话框
const closeRejectDialog = () => {
  showRejectDialog.value = false;
  rejectRemark.value = '';
  currentApplicationId.value = null;
};

onMounted(loadApplications);
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

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.btn-approve {
  background-color: #67c23a;
  color: white;
}

.btn-approve:hover {
  background-color: #5daf34;
}

.btn-reject {
  background-color: #f56c6c;
  color: white;
}

.btn-reject:hover {
  background-color: #f45454;
}

.btn-secondary {
  background-color: #e4e7ed;
  color: #606266;
}

.btn-secondary:hover {
  background-color: #d3d4d6;
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

/* 对话框样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  min-width: 400px;
  max-width: 90vw;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 0;
}

.dialog-header h3 {
  margin: 0;
  color: #333;
}

.dialog-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-close:hover {
  color: #666;
}

.dialog-body {
  padding: 20px;
}

.dialog-footer {
  padding: 0 20px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  box-sizing: border-box;
}

.form-group textarea:focus {
  outline: none;
  border-color: #409eff;
}
</style> 