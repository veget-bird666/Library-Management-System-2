<template>
    <div class="content-area">
      <!-- 标题保持原有样式 -->
      <div class="search-bar">
        <h2>用户管理</h2>
      </div>
  
      <!-- 用户列表 -->
      <el-table :data="users" style="width: 100%">
        <el-table-column prop="user_account" label="账号" />
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column prop="user_credit" label="信用分">
          <template #default="{ row }">
            <span :class="{ 'low-credit': row.user_credit < 3 }">{{ row.user_credit }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '已冻结' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" @click="showCreditDialog(row)">
                修改信用分
              </el-button>
              <el-button
                :type="row.status === 1 ? 'danger' : 'success'"
                @click="handleToggleStatus(row)"
              >
                {{ row.status === 1 ? '冻结账号' : '解冻账号' }}
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 修改信用分对话框 -->
      <el-dialog
        v-model="creditDialogVisible"
        title="修改信用分"
        width="30%"
      >
        <el-form :model="creditForm" label-width="100px">
          <el-form-item label="当前信用分">
            <span>{{ selectedUser?.user_credit }}</span>
          </el-form-item>
          <el-form-item label="调整分值">
            <el-input-number
              v-model="creditForm.adjustment"
              :min="-10"
              :max="10"
              :step="1"
              :precision="1"
              :controls-position="'right'"
              style="width: 200px"
            />
            <div class="credit-hint" style="font-size: 12px; color: #909399; margin-top: 5px;">
              提示：正数表示增加信用分，负数表示减少信用分
            </div>
          </el-form-item>
          <el-form-item label="调整后分值" v-if="selectedUser">
            <span :class="{ 'low-credit': getAdjustedCredit < 3 }">
              {{ getAdjustedCredit }}
            </span>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="creditDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="updateCredit">
              确认
            </el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </template>

  <script setup>
  import { ref, onMounted, computed } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { getAllUsers, updateUserCredit, toggleUserStatus } from '../services/api'

  const users = ref([])
  const creditDialogVisible = ref(false)
  const selectedUser = ref(null)
  const creditForm = ref({
    adjustment: 0
  })

  // 计算调整后的信用分
  const getAdjustedCredit = computed(() => {
    if (!selectedUser.value) return 0
    const currentCredit = parseFloat(selectedUser.value.user_credit) || 0
    const adjustment = parseFloat(creditForm.value.adjustment) || 0
    const newCredit = currentCredit + adjustment
    return Math.min(Math.max(newCredit, 0), 10).toFixed(1)
  })

  // 获取用户列表
  const fetchUsers = async () => {
    try {
      const data = await getAllUsers()
      users.value = data
    } catch (error) {
      console.error('Error fetching users:', error)
      ElMessage.error('获取用户列表失败')
    }
  }

  // 显示修改信用分对话框
  const showCreditDialog = (user) => {
    selectedUser.value = user
    creditForm.value = {
      adjustment: 0
    }
    creditDialogVisible.value = true
  }

  // 更新信用分
  const updateCredit = async () => {
    if (!selectedUser.value) return
    
    try {
      const currentCredit = parseFloat(selectedUser.value.user_credit) || 0
      const adjustment = parseFloat(creditForm.value.adjustment) || 0
      // 新的信用分是当前信用分加上调整值
      const newCredit = currentCredit + adjustment
      
      console.log('更新信用分:', {
        currentCredit,
        adjustment,
        newCredit,
        '调整前类型': {
          currentCredit: typeof currentCredit,
          adjustment: typeof adjustment
        }
      })
      
      // 确保最终分数在0-10之间
      const finalCredit = Math.min(Math.max(newCredit, 0), 10)
      
      await updateUserCredit(selectedUser.value.user_account, finalCredit)
      
      ElMessage.success('信用分更新成功')
      creditDialogVisible.value = false
      await fetchUsers()
    } catch (error) {
      console.error('Error updating credit:', error)
      ElMessage.error(error.response?.data?.message || '信用分更新失败')
    }
  }

  // 切换用户状态
  const handleToggleStatus = async (user) => {
    try {
      const action = user.status === 1 ? '冻结' : '解冻'
      await ElMessageBox.confirm(
        `确定要${action}该用户账号吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      
      await toggleUserStatus(user.user_account, user.status === 1 ? 0 : 1)
      
      ElMessage.success(`账号${action}成功`)
      await fetchUsers()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('Error toggling status:', error)
        ElMessage.error(`账号状态修改失败`)
      }
    }
  }

  onMounted(() => {
    fetchUsers()
  })
  </script>
  
  <style scoped>
  /* 保持与图书管理页面一致的布局 */
  content-area {
  padding: 20px;
  min-height: calc(100vh - 60px);
}

.search-bar {
  margin-bottom: 20px;
}

.simple-notice {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 8px;
}

.notice-content {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #909399;
  font-size: 16px;
}

.el-icon-warning-outline {
  font-size: 20px;
  color: #e6a23c;
}

.low-credit {
  color: #f56c6c;
  font-weight: bold;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
  </style>