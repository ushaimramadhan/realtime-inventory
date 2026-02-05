import pool from "../config/db";

export const getProducts = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(result.rows);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
};

export const createProduct = async (req, res) => {
  const { sku, name, price, description, initial_stock } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO products (sku, name, price, description, current_stock) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [sku, name, price, description, initial_stock || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};