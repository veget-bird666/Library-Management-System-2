<template>
  <div class="statistics-container">
    <div class="header">
      <h2>借阅统计分析</h2>
      <div class="filter">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="loadStatistics"
        />
      </div>
    </div>

    <div class="statistics-content">
      <div class="chart-container">
        <div ref="pieChartRef" class="pie-chart"></div>
      </div>
      
      <div class="statistics-table">
        <el-table :data="categoryStats" style="width: 100%">
          <el-table-column prop="category" label="图书类别" />
          <el-table-column prop="count" label="借阅次数" />
          <el-table-column prop="percentage" label="占比">
            <template #default="{ row }">
              {{ (row.percentage * 100).toFixed(2) }}%
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import axios from 'axios'

const dateRange = ref([])
const pieChartRef = ref(null)
const categoryStats = ref([])
let chart = null

// 加载统计数据
const loadStatistics = async () => {
  try {
    const [startDate, endDate] = dateRange.value || []
    const response = await axios.get('/api/statistics/borrow-categories', {
      params: {
        startDate,
        endDate
      }
    })
    
    if (response.data.success) {
      categoryStats.value = response.data.data
      updateChart()
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 更新图表
const updateChart = () => {
  if (!chart || !categoryStats.value.length) return

  const option = {
    title: {
      text: '图书借阅类别分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: categoryStats.value.map(item => item.category)
    },
    series: [
      {
        name: '借阅类别',
        type: 'pie',
        radius: '50%',
        data: categoryStats.value.map(item => ({
          name: item.category,
          value: item.count
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  chart.setOption(option)
}

// 初始化图表
const initChart = () => {
  if (pieChartRef.value) {
    chart = echarts.init(pieChartRef.value)
    loadStatistics()
  }
}

onMounted(() => {
  initChart()
  // 设置默认时间范围为最近30天
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)
  dateRange.value = [
    start.toISOString().split('T')[0],
    end.toISOString().split('T')[0]
  ]
})

onUnmounted(() => {
  if (chart) {
    chart.dispose()
    chart = null
  }
})
</script>

<style scoped>
.statistics-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.statistics-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
}

.chart-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.pie-chart {
  width: 100%;
  height: 400px;
}

.statistics-table {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}
</style> 