<template>
  <div class="content-area">
    <div class="announcement-header">
      <h2>系统公告</h2>
    </div>

    <!-- 公告列表 -->
    <div class="announcements-list">
      <div v-for="announcement in announcements" :key="announcement.announce_id" class="announcement-item">
        <div class="announcement-content">
          <p>{{ announcement.content }}</p>
          <div class="announcement-meta">
            <span>发布时间: {{ formatDate(announcement.publish_time) }}</span>
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
import { getAnnouncements } from '../api/announcement'

const announcements = ref([])

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
  margin-bottom: 20px;
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
  font-size: 0.9em;
  color: #666;
}

.no-announcements {
  text-align: center;
  padding: 20px;
  color: #666;
  font-style: italic;
}
</style>