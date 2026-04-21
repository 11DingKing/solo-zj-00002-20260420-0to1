import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Products from '../views/Products.vue'
import StockIn from '../views/StockIn.vue'
import StockOut from '../views/StockOut.vue'
import Transactions from '../views/Transactions.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { title: '仪表盘' }
  },
  {
    path: '/products',
    name: 'Products',
    component: Products,
    meta: { title: '商品管理' }
  },
  {
    path: '/stock-in',
    name: 'StockIn',
    component: StockIn,
    meta: { title: '入库管理' }
  },
  {
    path: '/stock-out',
    name: 'StockOut',
    component: StockOut,
    meta: { title: '出库管理' }
  },
  {
    path: '/transactions',
    name: 'Transactions',
    component: Transactions,
    meta: { title: '流水查询' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  document.title = (to.meta.title as string) || '库存进销存管理系统'
  next()
})

export default router
