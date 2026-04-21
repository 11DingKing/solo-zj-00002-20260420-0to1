<template>
  <div class="stock-in-container">
    <h2>入库管理</h2>
    
    <el-card>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" style="max-width: 500px">
        <el-form-item label="选择商品" prop="product_id">
          <el-select v-model="form.product_id" placeholder="请选择商品" filterable style="width: 100%">
            <el-option 
              v-for="product in products" 
              :key="product.id" 
              :label="`${product.name} (${product.sku})`" 
              :value="product.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="当前库存">
          <el-input :value="currentStock" disabled placeholder="选择商品后显示">
            <template #append>{{ selectedProduct?.unit }}</template>
          </el-input>
        </el-form-item>
        <el-form-item label="入库数量" prop="quantity">
          <el-input-number v-model="form.quantity" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="供应商" prop="supplier">
          <el-input v-model="form.supplier" placeholder="请输入供应商名称" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">确认入库</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { getProducts, type Product } from '../api/products'
import { stockIn, type StockInData } from '../api/transactions'

const products = ref<Product[]>([])
const loading = ref(false)
const formRef = ref<FormInstance>()

const form = reactive<StockInData>({
  product_id: 0,
  quantity: 1,
  supplier: ''
})

const rules: FormRules = {
  product_id: [{ required: true, message: '请选择商品', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入入库数量', trigger: 'blur' }],
  supplier: [{ required: true, message: '请输入供应商', trigger: 'blur' }]
}

const selectedProduct = computed(() => {
  return products.value.find(p => p.id === form.product_id)
})

const currentStock = computed(() => {
  return selectedProduct.value?.stock ?? 0
})

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

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await stockIn(form)
        if (res.success) {
          ElMessage.success(res.message || '入库成功')
          form.product_id = 0
          form.quantity = 1
          form.supplier = ''
          fetchProducts()
        }
      } catch (error) {
        console.error('Failed to stock in:', error)
      } finally {
        loading.value = false
      }
    }
  })
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.stock-in-container {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
}
</style>
