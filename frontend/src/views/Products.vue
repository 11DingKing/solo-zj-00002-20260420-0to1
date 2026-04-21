<template>
  <div class="products-container">
    <h2>商品管理</h2>
    
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="分类">
        <el-select v-model="searchForm.category" placeholder="全部分类" clearable @change="fetchProducts">
          <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
        </el-select>
      </el-form-item>
      <el-form-item label="名称搜索">
        <el-input v-model="searchForm.search" placeholder="输入商品名称" clearable @clear="fetchProducts" @keyup.enter="fetchProducts">
          <template #append>
            <el-button :icon="Search" @click="fetchProducts" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增商品</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="products" style="width: 100%" border>
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
          <span :class="{ 'stock-warning': row.stock < 10 }">{{ row.stock }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link :icon="Edit" @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" link :icon="Delete" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑商品' : '新增商品'" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="商品名" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名" />
        </el-form-item>
        <el-form-item label="SKU编码" prop="sku">
          <el-input v-model="form.sku" placeholder="请输入SKU编码" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-input v-model="form.category" placeholder="请输入分类" />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="form.unit" placeholder="请输入单位" />
        </el-form-item>
        <el-form-item label="成本价" prop="cost_price">
          <el-input-number v-model="form.cost_price" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="售价" prop="sale_price">
          <el-input-number v-model="form.sale_price" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="初始库存" prop="stock">
          <el-input-number v-model="form.stock" :min="0" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { 
  getProducts, 
  getCategories, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  type Product,
  type ProductForm
} from '../api/products'

const products = ref<Product[]>([])
const categories = ref<string[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref<number | null>(null)
const formRef = ref<FormInstance>()

const searchForm = reactive({
  category: '',
  search: ''
})

const form = reactive<ProductForm>({
  name: '',
  sku: '',
  category: '',
  unit: '',
  cost_price: 0,
  sale_price: 0,
  stock: 0
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入商品名', trigger: 'blur' }],
  sku: [{ required: true, message: '请输入SKU编码', trigger: 'blur' }],
  category: [{ required: true, message: '请输入分类', trigger: 'blur' }],
  unit: [{ required: true, message: '请输入单位', trigger: 'blur' }],
  cost_price: [{ required: true, message: '请输入成本价', trigger: 'blur' }],
  sale_price: [{ required: true, message: '请输入售价', trigger: 'blur' }]
}

const fetchProducts = async () => {
  try {
    const params: any = {}
    if (searchForm.category) params.category = searchForm.category
    if (searchForm.search) params.search = searchForm.search
    
    const res = await getProducts(params)
    if (res.success) {
      products.value = res.data
    }
  } catch (error) {
    console.error('Failed to fetch products:', error)
  }
}

const fetchCategories = async () => {
  try {
    const res = await getCategories()
    if (res.success) {
      categories.value = res.data
    }
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }
}

const resetForm = () => {
  form.name = ''
  form.sku = ''
  form.category = ''
  form.unit = ''
  form.cost_price = 0
  form.sale_price = 0
  form.stock = 0
}

const handleAdd = () => {
  isEdit.value = false
  editId.value = null
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: Product) => {
  isEdit.value = true
  editId.value = row.id
  form.name = row.name
  form.sku = row.sku
  form.category = row.category
  form.unit = row.unit
  form.cost_price = row.cost_price
  form.sale_price = row.sale_price
  form.stock = row.stock
  dialogVisible.value = true
}

const handleDelete = (row: Product) => {
  ElMessageBox.confirm(`确定要删除商品 "${row.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteProduct(row.id)
      if (res.success) {
        ElMessage.success(res.message || '删除成功')
        fetchProducts()
        fetchCategories()
      }
    } catch (error) {
      console.error('Failed to delete product:', error)
    }
  }).catch(() => {})
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        let res
        if (isEdit.value && editId.value) {
          res = await updateProduct(editId.value, form)
        } else {
          res = await createProduct(form)
        }
        
        if (res.success) {
          ElMessage.success(res.message || (isEdit.value ? '更新成功' : '创建成功'))
          dialogVisible.value = false
          fetchProducts()
          fetchCategories()
        }
      } catch (error) {
        console.error('Failed to submit product:', error)
      }
    }
  })
}

onMounted(() => {
  fetchProducts()
  fetchCategories()
})
</script>

<style scoped>
.products-container {
  padding: 20px;
}

.search-form {
  margin-bottom: 20px;
}

.stock-warning {
  color: #f56c6c;
  font-weight: bold;
}

h2 {
  margin-bottom: 20px;
}
</style>
