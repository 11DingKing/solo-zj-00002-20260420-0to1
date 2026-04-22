import request from '../utils/request'

export interface Product {
  id: number
  name: string
  sku: string
  category: string
  unit: string
  cost_price: number
  sale_price: number
  stock: number
  created_at: string
  updated_at: string
}

export interface ProductParams {
  category?: string
  search?: string
}

export interface ProductForm {
  name: string
  sku: string
  category: string
  unit: string
  cost_price: number
  sale_price: number
  stock?: number
}

export function getProducts(params?: ProductParams) {
  return request.get('products', { params })
}

export function getProduct(id: number) {
  return request.get(`products/${id}`)
}

export function getCategories() {
  return request.get('products/categories')
}

export function createProduct(data: ProductForm) {
  return request.post('products', data)
}

export function updateProduct(id: number, data: Partial<ProductForm>) {
  return request.put(`products/${id}`, data)
}

export function deleteProduct(id: number) {
  return request.delete(`products/${id}`)
}
