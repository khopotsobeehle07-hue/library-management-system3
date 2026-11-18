import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, membership_id AS membershipId, role FROM users ORDER BY id'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { name, membershipId, role } = req.body;
  if (!name || !membershipId || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (!['admin', 'librarian', 'member'].includes(role)) {
    return res.status(400).json({ error: 'Role must be admin, librarian, or member' });
  }
  try {
    const [existingNames] = await pool.query(
      'SELECT id FROM users WHERE LOWER(name) = LOWER(?)',
      [name.trim()]
    );
    if (existingNames.length > 0) {
      return res.status(409).json({ error: 'A user with this name already exists' });
    }
    const [result] = await pool.query(
      'INSERT INTO users (name, membership_id, role) VALUES (?, ?, ?)',
      [name, membershipId, role]
    );
    res.status(201).json({ id: result.insertId, name, membershipId, role });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Membership ID already exists' });
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { name, membershipId, role } = req.body;
  if (!name || !membershipId || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (!['admin', 'librarian', 'member'].includes(role)) {
    return res.status(400).json({ error: 'Role must be admin, librarian, or member' });
  }
  try {
    const [existingNames] = await pool.query(
      'SELECT id FROM users WHERE LOWER(name) = LOWER(?) AND id <> ?',
      [name.trim(), req.params.id]
    );
    if (existingNames.length > 0) {
      return res.status(409).json({ error: 'A user with this name already exists' });
    }
    const [result] = await pool.query(
      'UPDATE users SET name = ?, membership_id = ?, role = ? WHERE id = ?',
      [name, membershipId, role, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ id: Number(req.params.id), name, membershipId, role });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Membership ID already exists' });
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;