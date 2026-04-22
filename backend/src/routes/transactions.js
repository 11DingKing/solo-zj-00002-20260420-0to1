import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

router.post('/in', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { product_id, quantity, supplier } = req.body;

    if (!product_id || !quantity || !supplier) {
      return res.status(400).json({ success: false, message: '请填写所有必填字段' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ success: false, message: '入库数量必须大于 0' });
    }

    await connection.beginTransaction();

    const [productRows] = await connection.execute(
      'SELECT * FROM products WHERE id = ? FOR UPDATE',
      [product_id]
    );

    if (productRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: '商品不存在' });
    }

    const newStock = productRows[0].stock + parseInt(quantity);
    await connection.execute(
      'UPDATE products SET stock = ? WHERE id = ?',
      [newStock, product_id]
    );

    await connection.execute(
      'INSERT INTO inventory_transactions (product_id, type, quantity, supplier) VALUES (?, ?, ?, ?)',
      [product_id, 'in', parseInt(quantity), supplier]
    );

    await connection.commit();
    res.json({ success: true, message: '入库成功' });
  } catch (error) {
    await connection.rollback();
    console.error('Error in stock in:', error);
    res.status(500).json({ success: false, message: '入库失败' });
  } finally {
    connection.release();
  }
});

router.post('/out', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { product_id, quantity, reason } = req.body;

    if (!product_id || !quantity || !reason) {
      return res.status(400).json({ success: false, message: '请填写所有必填字段' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ success: false, message: '出库数量必须大于 0' });
    }

    const validReasons = ['销售', '损耗', '退货'];
    if (!validReasons.includes(reason)) {
      return res.status(400).json({ success: false, message: '无效的出库原因' });
    }

    await connection.beginTransaction();

    const [productRows] = await connection.execute(
      'SELECT * FROM products WHERE id = ? FOR UPDATE',
      [product_id]
    );

    if (productRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: '商品不存在' });
    }

    const currentStock = productRows[0].stock;
    const requiredQuantity = parseInt(quantity);

    if (currentStock < requiredQuantity) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `库存不足，当前库存：${currentStock}，需要：${requiredQuantity}，差：${requiredQuantity - currentStock}`
      });
    }

    const newStock = currentStock - requiredQuantity;
    await connection.execute(
      'UPDATE products SET stock = ? WHERE id = ?',
      [newStock, product_id]
    );

    await connection.execute(
      'INSERT INTO inventory_transactions (product_id, type, quantity, reason) VALUES (?, ?, ?, ?)',
      [product_id, 'out', requiredQuantity, reason]
    );

    await connection.commit();
    res.json({ success: true, message: '出库成功' });
  } catch (error) {
    await connection.rollback();
    console.error('Error in stock out:', error);
    res.status(500).json({ success: false, message: '出库失败' });
  } finally {
    connection.release();
  }
});

router.get('/', async (req, res) => {
  try {
    const { start_date, end_date, product_id, type, page = 1, page_size = 20 } = req.query;
    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(page_size);
    const offset = (pageNum - 1) * pageSizeNum;

    let countSql = 'SELECT COUNT(*) as total FROM inventory_transactions WHERE 1=1';
    let dataSql = `
      SELECT 
        it.*,
        p.name as product_name,
        p.sku as product_sku,
        p.category as product_category,
        p.unit as product_unit
      FROM inventory_transactions it
      LEFT JOIN products p ON it.product_id = p.id
      WHERE 1=1
    `;
    const params = [];
    const countParams = [];

    if (start_date) {
      countSql += ' AND DATE(it.created_at) >= ?';
      dataSql += ' AND DATE(it.created_at) >= ?';
      params.push(start_date);
      countParams.push(start_date);
    }

    if (end_date) {
      countSql += ' AND DATE(it.created_at) <= ?';
      dataSql += ' AND DATE(it.created_at) <= ?';
      params.push(end_date);
      countParams.push(end_date);
    }

    if (product_id) {
      countSql += ' AND it.product_id = ?';
      dataSql += ' AND it.product_id = ?';
      params.push(product_id);
      countParams.push(product_id);
    }

    if (type && ['in', 'out'].includes(type)) {
      countSql += ' AND it.type = ?';
      dataSql += ' AND it.type = ?';
      params.push(type);
      countParams.push(type);
    }

    dataSql += ' ORDER BY it.created_at DESC LIMIT ? OFFSET ?';
    params.push(pageSizeNum, offset);

    const [countResult] = await pool.query(countSql, countParams);
    const total = countResult[0].total;

    const [rows] = await pool.query(dataSql, params);

    res.json({
      success: true,
      data: {
        list: rows,
        pagination: {
          page: pageNum,
          page_size: pageSizeNum,
          total: total,
          total_pages: Math.ceil(total / pageSizeNum)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ success: false, message: '获取流水记录失败' });
  }
});

export default router;
