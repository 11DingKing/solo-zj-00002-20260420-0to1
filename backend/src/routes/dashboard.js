import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    const [stockValueResult] = await pool.execute(
      'SELECT SUM(cost_price * stock) as total_value FROM products'
    );
    const totalValue = stockValueResult[0].total_value || 0;

    const [todayInResult] = await pool.execute(
      "SELECT COUNT(*) as count FROM inventory_transactions WHERE type = 'in' AND DATE(created_at) = CURDATE()"
    );
    const todayInCount = todayInResult[0].count;

    const [todayOutResult] = await pool.execute(
      "SELECT COUNT(*) as count FROM inventory_transactions WHERE type = 'out' AND DATE(created_at) = CURDATE()"
    );
    const todayOutCount = todayOutResult[0].count;

    res.json({
      success: true,
      data: {
        total_stock_value: parseFloat(totalValue),
        today_in_count: todayInCount,
        today_out_count: todayOutCount
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: '获取统计数据失败' });
  }
});

router.get('/warnings', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM products WHERE stock < 10 ORDER BY stock ASC'
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching stock warnings:', error);
    res.status(500).json({ success: false, message: '获取库存预警失败' });
  }
});

export default router;
