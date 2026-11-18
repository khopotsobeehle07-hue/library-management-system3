import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, book_id AS bookId, book_title AS bookTitle, type, quantity,
              member, recorded_by AS recordedBy, created_at AS date
       FROM transactions
       ORDER BY created_at DESC, id DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { bookId, type, quantity, member, recordedBy } = req.body;
  const qty = Number(quantity);
  if (!bookId || !['borrow', 'add'].includes(type) || !qty || qty < 1) {
    return res.status(400).json({ error: 'bookId, type (borrow/add) and quantity are required' });
  }
  let conn;
  try {
    conn = await pool.getConnection();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query('SELECT title, quantity FROM books WHERE id = ? FOR UPDATE', [bookId]);
    if (rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Book not found' });
    }
    const newQuantity = type === 'borrow' ? rows[0].quantity - qty : rows[0].quantity + qty;
    if (newQuantity < 0) {
      await conn.rollback();
      return res.status(400).json({ error: 'Not enough copies in stock' });
    }
    await conn.query('UPDATE books SET quantity = ? WHERE id = ?', [newQuantity, bookId]);
    const [result] = await conn.query(
      `INSERT INTO transactions (book_id, book_title, type, quantity, member, recorded_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [bookId, rows[0].title, type, qty, member || '', recordedBy || '']
    );
    await conn.commit();
    res.status(201).json({ id: result.insertId, bookId, type, quantity: qty, stock: newQuantity });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

export default router;