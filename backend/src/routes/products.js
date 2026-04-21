import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      sql += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }

    sql += ' ORDER BY updated_at DESC';

    const [rows] = await pool.execute(sql, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: '获取商品列表失败' });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT DISTINCT category FROM products ORDER BY category');
    const categories = rows.map(row => row.category);
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: '获取分类列表失败' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: '商品不存在' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, message: '获取商品详情失败' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, sku, category, unit, cost_price, sale_price, stock = 0 } = req.body;

    if (!name || !sku || !category || !unit || cost_price === undefined || sale_price === undefined) {
      return res.status(400).json({ success: false, message: '请填写所有必填字段' });
    }

    const [existing] = await pool.execute('SELECT id FROM products WHERE sku = ?', [sku]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'SKU 编码已存在' });
    }

    const [result] = await pool.execute(
      'INSERT INTO products (name, sku, category, unit, cost_price, sale_price, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, sku, category, unit, parseFloat(cost_price), parseFloat(sale_price), parseInt(stock)]
    );

    res.json({ success: true, data: { id: result.insertId }, message: '商品创建成功' });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: '创建商品失败' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, category, unit, cost_price, sale_price, stock } = req.body;

    const [existing] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: '商品不存在' });
    }

    if (sku && sku !== existing[0].sku) {
      const [skuExisting] = await pool.execute('SELECT id FROM products WHERE sku = ? AND id != ?', [sku, id]);
      if (skuExisting.length > 0) {
        return res.status(400).json({ success: false, message: 'SKU 编码已存在' });
      }
    }

    const updates = [];
    const values = [];

    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (sku !== undefined) { updates.push('sku = ?'); values.push(sku); }
    if (category !== undefined) { updates.push('category = ?'); values.push(category); }
    if (unit !== undefined) { updates.push('unit = ?'); values.push(unit); }
    if (cost_price !== undefined) { updates.push('cost_price = ?'); values.push(parseFloat(cost_price)); }
    if (sale_price !== undefined) { updates.push('sale_price = ?'); values.push(parseFloat(sale_price)); }
    if (stock !== undefined) { updates.push('stock = ?'); values.push(parseInt(stock)); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: '没有要更新的字段' });
    }

    values.push(id);
    await pool.execute(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({ success: true, message: '商品更新成功' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: '更新商品失败' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: '商品不存在' });
    }

    await pool.execute('DELETE FROM products WHERE id = ?', [id]);
    res.json({ success: true, message: '商品删除成功' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: '删除商品失败' });
  }
});

export default router;
