<template>
  <div class="content-area">
    <!-- 标题 -->
    <div class="search-bar">
      <h2>图书浏览</h2>
    </div>

    <!-- 图书列表 -->
    <div class="borrow-list">
      <table>
        <thead>
          <tr>
            <th>ISBN</th>
            <th>书名</th>
            <th>作者</th>
            <th>出版社</th>
            <th>年份</th>
            <th>分类</th>
            <th>定价</th>
            <th>语言</th>
            <th>可借状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="book in books" :key="book.book_id">
            <td>{{ book.book_id }}</td>
            <td>{{ book.title }}</td>
            <td>{{ book.author }}</td>
            <td>{{ book.publisher }}</td>
            <td>{{ book.publication_year }}</td>
            <td>{{ book.category }}</td>
            <td>{{ Number(book.price).toFixed(2) }}</td>
            <td>{{ book.language }}</td>
            <td>
              <span :class="book.available === 1 ? 'status-available' : 'status-unavailable'">
                {{ book.available === 1 ? '可借' : '已借出' }}
              </span>
            </td>
            <td>
              <button 
                class="action-btn borrow" 
                @click="handleBorrow(book.book_id)"
                :disabled="book.available !== 1"
              >
                {{ book.available === 1 ? '借阅申请' : '不可借' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页保持原样 -->
    <div class="pagination">
      <button 
        :disabled="pagination.page === 1" 
        @click="changePage(pagination.page - 1)"
      >
        上一页
      </button>
      <span>第 {{ pagination.page }} / {{ pagination.totalPages }} 页</span>
      <button 
        :disabled="pagination.page === pagination.totalPages" 
        @click="changePage(pagination.page + 1)"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchBooks, type Book } from '../api/userBook'; // 使用用户图书API
import { createBorrowApplication } from '../api/borrow';

// 保持原始分页逻辑
const books = ref<Book[]>([]);
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 1,
});

// 加载数据逻辑不变
const load = async () => {
  try {
    const resp = await fetchBooks({
      page: pagination.value.page,
      size: pagination.value.pageSize
    });
    
    books.value = resp.data;
    pagination.value = resp.pagination;
  } catch (error) {
    console.error('加载失败:', error);
  }
};

onMounted(load);

// 分页切换逻辑保留
const changePage = (p: number) => {
  pagination.value.page = p;
  load();
};

// 新增借阅处理
const handleBorrow = async (bookId: string) => {
  if (!confirm('确认申请借阅该图书？')) return;
  try {
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    const userAccount = userInfo.account || userInfo.user_account;
    if (!userAccount) {
      alert('用户信息不存在，请重新登录');
      return;
    }

    await createBorrowApplication(bookId, userAccount);
    alert('借阅申请提交成功');
    
    // 重新加载图书列表以更新状态
    load();
  } catch (err: any) {
    console.error('操作失败:', err);
    alert(err.response?.data?.message || '借阅申请失败');
  }
};
</script>

<style scoped>
/* 保留原有样式，仅修改按钮颜色 */
.action-btn.borrow {
  background: #67C23A;  /* 新的绿色色值 */
  /* 保持其他样式完全一致 */
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.3s;
}

.action-btn.borrow:hover {
  background: #5daf34;  /* 加深的绿色 */
  /* 原效果保留 */
  opacity: 0.9;
}

.action-btn.borrow:disabled {
  background: #c0c4cc;
  cursor: not-allowed;
}

/* 移除原删除按钮样式 */
.action-btn.delete { 
  display: none;
}

/* 其他样式保持完全一致 */
.content-area { padding: 20px; }
.search-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.borrow-list table { width: 100%; border-collapse: collapse; }
.borrow-list th, .borrow-list td { padding: 8px; border: 1px solid #ebeef5; text-align: left; }
.pagination { margin: 10px 0; text-align: center; }
.pagination button { margin: 0 5px; padding: 4px 8px; }

.status-available {
  color: #67C23A;
  font-weight: 500;
}

.status-unavailable {
  color: #F56C6C;
  font-weight: 500;
}
</style>