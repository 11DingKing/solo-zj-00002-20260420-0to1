<template>
  <div class="transactions-container">
    <h2>流水查询</h2>
    
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="开始日期">
        <el-date-picker
          v-model="searchForm.start_date"
          type="date"
          placeholder="选择开始日期"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item label="结束日期">
        <el-date-picker
          v-model="searchForm.end_date"
          type="date"
          placeholder="选择结束日期"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item label="商品">
        <el-select v-model="searchForm.product_id" placeholder="全部商品" clearable filterable style="width: 200px">
          <el-option 
            v-for="product in products" 
            :key="product.id" 
            :label="`${product.name} (${product.sku})`" 
            :value="product.id" 
          />
        </el-select>
      </el-form-item>
      <el-form-item label="类型">
        <el-select v-model="searchForm.type" placeholder="全部类型" clearable style="width: 120px">
          <el-option label="入库" value="in" />
          <el-option label="出库" value="out" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="fetchTransactions">查询</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="transactions" style="width: 100%" border v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="product_name" label="商品名" />
      <el-table-column prop="product_sku" label="SKU" width="120" />
      <el-table-column prop="type" label="类型" width="80">
        <template #default="{ row }">
          <el-tag :type="row.type === 'in' ? 'success' : 'danger'">
            {{ row.type === 'in' ? '入库' : '出库' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="quantity" label="数量" width="100">
        <template #default="{ row }">
          {{ row.quantity }} {{ row.product_unit }}
        </template>
      </el-table-column>
      <el-table-column prop="supplier" label="供应商" width="150">
        <template #default="{ row }">
          {{ row.supplier || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="reason" label="出库原因" width="100">
        <template #default="{ row }">
          {{ row.reason || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="操作时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.created_at) }}
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.page_size"
      :page-sizes="[20, 50, 100]"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="fetchTransactions"
      @current-change="fetchTransactions"
      style="margin-top: 20px; justify-content: flex-end"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getTransactions, type Transaction, type TransactionParams } from '../api/transactions'
import { getProducts, type Product } from '../api/products'

const transactions = ref<Transaction[]>([])
const products = ref<Product[]>([])
const loading = ref(false)

const searchForm = reactive<TransactionParams>({
  start_date: undefined,
  end_date: undefined,
  product_id: undefined,
  type: undefined
})

const pagination = reactive({
  page: 1,
  page_size: 20,
  total: 0
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

const fetchProducts = async () => {
  try {
    const res = await getProducts()
    if (res.success) {
      products.value = res.data
    }
  } catch (error) {
    console.error('Failed to fetch products:', error)
  }
}

const fetchTransactions = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      page_size: pagination.page_size
    }
    
    if (searchForm.start_date) params.start_date = searchForm.start_date
    if (searchForm.end_date) params.end_date = searchForm.end_date
    if (searchForm.product_id) params.product_id = searchForm.product_id
    if (searchForm.type) params.type = searchForm.type
    
    const res = await getTransactions(params)
    if (res.success) {
      transactions.value = res.data.list
      pagination.total = res.data.pagination.total
    }
  } catch (error) {
    console.error('Failed to fetch transactions:', error)
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchForm.start_date = undefined
  searchForm.end_date = undefined
  searchForm.product_id = undefined
  searchForm.type = undefined
  pagination.page = 1
  fetchTransactions()
}

onMounted(() => {
  fetchProducts()
  fetchTransactions()
})
</script>

<style scoped>
.transactions-container {
  padding: 20px;
}

.search-form {
  margin-bottom: 20px;
}

h2 {
  margin-bottom: 20px;
}
</style>
