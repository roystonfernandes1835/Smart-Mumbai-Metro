const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-123';

// Mock simple authentication since this is a prototype, keeping it SQLite friendly
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
    
    // check if exists
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
      [name, email, hash, role || 'user']
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const isAdmin = email.toLowerCase() === 'admin@smartrail.com';

    // special admin check
    if (isAdmin && password !== 'mumbaimetro') {
      return res.status(401).json({ error: 'Invalid administrative password' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      if (isAdmin) {
         // Auto-create admin if first time
         const salt = await bcrypt.genSalt(10);
         const hash = await bcrypt.hash('mumbaimetro', salt);
         await pool.query('INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)', ['Admin', 'admin@smartrail.com', hash, 'admin']);
         return res.json({ token: jwt.sign({ id: 99, role: 'admin' }, JWT_SECRET), user: { id: 99, name: 'Admin', email: 'admin@smartrail.com', role: 'admin' } });
      }
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const payload = { id: user.id, name: user.name, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
