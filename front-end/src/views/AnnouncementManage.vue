<template>
  <div class="content-area">
    <div class="announcement-header">
      <h2>公告管理</h2>
      <button class="btn-primary" @click="showPublishForm = true">发布新公告</button>
    </div>

    <!-- 发布公告表单 -->
    <div v-if="showPublishForm" class="publish-form">
      <h3>发布新公告</h3>
      <textarea 
        v-model="newAnnouncement" 
        placeholder="请输入公告内容..."
        rows="4"
      ></textarea>
      <div class="form-actions">
        <button class="btn-primary" @click="publishAnnouncement">发布</button>
        <button class="btn-secondary" @click="showPublishForm = false">取消</button>
      </div>
    </div>

    <!-- 公告列表 -->
    <div class="announcements-list">
      <div v-for="announcement in announcements" :key="announcement.announce_id" class="announcement-item">
        <div class="announcement-content">
          <p>{{ announcement.content }}</p>
          <div class="announcement-meta">
            <span>发布时间: {{ formatDate(announcement.publish_time) }}</span>
            <button class="btn-danger" @click="deleteAnnouncement(announcement.announce_id)">删除</button>
          </div>
        </div>
      </div>
      <div v-if="announcements.length === 0" class="no-announcements">
        暂无公告
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '../api/announcement'

const announcements = ref([])
const showPublishForm = ref(false)
const newAnnouncement = ref('')

// 获取所有公告
const fetchAnnouncements = async () => {
  try {
    const response = await getAnnouncements()
    announcements.value = response.data
  } catch (error) {
    alert('获取公告列表失败')
    console.error('Error fetching announcements:', error)
  }
}

// 发布新公告
const publishAnnouncement = async () => {
  if (!newAnnouncement.value.trim()) {
    alert('请输入公告内容')
    return
  }

  try {
    await createAnnouncement(newAnnouncement.value)
    showPublishForm.value = false
    newAnnouncement.value = ''
    await fetchAnnouncements()
    alert('公告发布成功')
  } catch (error) {
    alert('发布公告失败')
    console.error('Error publishing announcement:', error)
  }
}

// 删除公告
const handleDeleteAnnouncement = async (announceId: number) => {
  if (!confirm('确定要删除这条公告吗？')) return

  try {
    await deleteAnnouncement(announceId)
    await fetchAnnouncements()
    alert('公告删除成功')
  } catch (error) {
    alert('删除公告失败')
    console.error('Error deleting announcement:', error)
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchAnnouncements()
})
</script>

<style scoped>
.content-area {
  padding: 20px;
  min-height: calc(100vh - 60px);
}

.announcement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.publish-form {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.publish-form textarea {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 10px;
}

.announcements-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.announcement-item {
  background-color: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.announcement-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.announcement-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9em;
  color: #666;
}

.no-announcements {
  text-align: center;
  padding: 20px;
  color: #666;
  font-style: italic;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-secondary {
  background-color: #9e9e9e;
  color: white;
}

.btn-danger {
  background-color: #f44336;
  color: white;
}

button:hover {
  opacity: 0.9;
}
</style>