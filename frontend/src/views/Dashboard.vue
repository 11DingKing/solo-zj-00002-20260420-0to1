<template>
  <div class="dashboard-container">
    <h2>仪表盘</h2>
    
    <el-row :gutter="20" class="stats-row">
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #409eff">
            <el-icon :size="30"><Money /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">库存总值</div>
            <div class="stat-value">¥{{ stats.total_stock_value?.toFixed(2) || '0.00' }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #67c23a">
            <el-icon :size="30"><Plus /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">今日入库笔数</div>
            <div class="stat-value">{{ stats.today_in_count || 0 }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #f56c6c">
            <el-icon :size="30"><Minus /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">今日出库笔数</div>
            <div class="stat-value">{{ stats.today_out_count || 0 }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="warning-card">
      <template #header>
        <div class="card-header">
          <span>库存预警 (库存低于 10)</span>
          <el-tag type="danger" v-if="warnings.length > 0">{{ warnings.length }} 件商品</el-tag>
        </div>
      </template>
      
      <el-table :data="warnings" style="width: 100%" border v-if="warnings.length > 0">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="商品名" />
        <el-table-column prop="sku" label="SKU编码" />
        <el-table-column prop="category" label="分类" />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="cost_price" label="成本价" width="100">
          <template #default="{ row }">¥{{ row.cost_price }}</template>
        </el-table-column>
        <el-table-column prop="sale_price" label="售价" width="100">
          <template #default="{ row }">¥{{ row.sale_price }}</template>
        </el-table-column>
        <el-table-column prop="stock" label="当前库存" width="100">
          <template #default="{ row }">
            <span class="stock-warning">{{ row.stock }}</span>
          </template>
        </el-table-column>
      </el-table>
      
      <el-empty description="暂无库存预警" v-else />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getDashboardStats, getStockWarnings, type DashboardStats } from '../api/dashboard'
import type { Product } from '../api/products'
import { Money, Plus, Minus } from '@element-plus/icons-vue'

const stats = reactive<DashboardStats>({
  total_stock_value: 0,
  today_in_count: 0,
  today_out_count: 0
})

const warnings = ref<Product[]>([])

const fetchStats = async () => {
  try {
    const res = await getDashboardStats()
    if (res.success) {
      stats.total_stock_value = res.data.total_stock_value
      stats.today_in_count = res.data.today_in_count
      stats.today_out_count = res.data.today_out_count
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  }
}

const fetchWarnings = async () => {
  try {
    const res = await getStockWarnings()
    if (res.success) {
      warnings.value = res.data
    }
  } catch (error) {
    console.error('Failed to fetch warnings:', error)
  }
}

onMounted(() => {
  fetchStats()
  fetchWarnings()
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
}

.stat-icon {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 20px;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stock-warning {
  color: #f56c6c;
  font-weight: bold;
  background: #fef0f0;
  padding: 4px 8px;
  border-radius: 4px;
}
</style>
