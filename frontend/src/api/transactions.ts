import request from '../utils/request'

export interface Transaction {
  id: number
  product_id: number
  type: 'in' | 'out'
  quantity: number
  supplier?: string
  reason?: string
  created_at: string
  product_name: string
  product_sku: string
  product_category: string
  product_unit: string
}

export interface TransactionParams {
  start_date?: string
  end_date?: string
  product_id?: number
  type?: 'in' | 'out'
  page?: number
  page_size?: number
}

export interface StockInData {
  product_id: number
  quantity: number
  supplier: string
}

export interface StockOutData {
  product_id: number
  quantity: number
  reason: string
}

export function stockIn(data: StockInData) {
  return request.post('transactions/in', data)
}

export function stockOut(data: StockOutData) {
  return request.post('transactions/out', data)
}

export function getTransactions(params?: TransactionParams) {
  return request.get('transactions', { params })
}
