import pool from "../config/db";

export const createTransaction = async (req, res) => {
  const { product_id, type, quantity, notes } = req.body;

  if (!product_id || !['IN', 'OUT'].includes(type) || quantity <= 0) {
    return res.status(400).json({ error: 'Invalid input data'});
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const productRes = await client.query('SELECT current_stock FROM products WHERE id = $1', [product_id]);
    if (productRes.rows.length === 0) throw new Error('Product not found');

    const currentStock = productRes.rows[0].current_stock;

    if (type === 'OUT' && currentStock < quantity) {
      throw new Error('Insufficient stock');
    }

    const insertTrxText = `
      INSERT INTO transactions (product_id, type, quantity, notes)
      VALUES ($1, $2, $3, $4) RETURNING *
    `;
    const newTrx = await client.query(insertTrxText, [product_id, type, quantity, notes]);

    const updateStockText = type === 'IN'
      ? 'UPDATE products SET current_stock = current_stock + $1 WHERE id = $2'
      : 'UPDATE products SET current_stock = current_stock - $1 WHERE id = $2';

    await client.query(updateStockText, [quantity, product_id]);

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Transaction success',
      data: newTrx.rows[0]
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message});
  } finally {
    client.release();
  }
};