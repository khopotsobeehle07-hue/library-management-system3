import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM books ORDER BY title');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Book not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { title, author, genre, isbn, quantity } = req.body;
  if (!title || !author || !genre || !isbn || quantity === undefined) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (!Number.isInteger(Number(quantity)) || Number(quantity) < 0) {
    return res.status(400).json({ error: 'Quantity must be a whole number of 0 or more' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO books (title, author, genre, isbn, quantity) VALUES (?, ?, ?, ?, ?)',
      [title, author, genre, isbn, quantity]
    );
    res.status(201).json({ id: result.insertId, title, author, genre, isbn, quantity });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'ISBN already exists' });
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { title, author, genre, isbn, quantity } = req.body;
  if (!title || !author || !genre || !isbn || quantity === undefined) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (!Number.isInteger(Number(quantity)) || Number(quantity) < 0) {
    return res.status(400).json({ error: 'Quantity must be a whole number of 0 or more' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE books SET title = ?, author = ?, genre = ?, isbn = ?, quantity = ? WHERE id = ?',
      [title, author, genre, isbn, quantity, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Book not found' });
    res.json({ id: Number(req.params.id), title, author, genre, isbn, quantity });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'ISBN already exists' });
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM books WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Book not found' });
    res.json({ message: 'Book deleted' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ error: 'Book has transaction history and cannot be deleted' });
    }
    res.status(500).json({ error: err.message });
  }
});

export default router;