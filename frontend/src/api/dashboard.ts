import request from '../utils/request'

export interface DashboardStats {
  total_stock_value: number
  today_in_count: number
  today_out_count: number
}

export function getDashboardStats() {
  return request.get('dashboard/stats')
}

export function getStockWarnings() {
  return request.get('dashboard/warnings')
}
