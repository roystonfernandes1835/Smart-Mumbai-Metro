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

    let result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    // Auto-create admin if not exists
    if (result.rows.length === 0 && isAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('mumbaimetro', salt);

      const newUser = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
        ['Admin', 'admin@smartrail.com', hash, 'admin']
      );

      result = newUser;
    }

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    let isMatch = await bcrypt.compare(password, user.password);
    
    // Auto-heal the database if it has the original buggy seed data (plaintext password & wrong role)
    if (!isMatch && isAdmin && password === 'mumbaimetro' && user.password === 'secure') {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('mumbaimetro', salt);
      await pool.query("UPDATE users SET password = $1, role = $2 WHERE email = $3", [hash, 'admin', 'admin@smartrail.com']);
      isMatch = true;
      user.role = 'admin';
    }

    // Secondary auto-heal: if password matched but role is wrong (e.g. they somehow fixed password but not role)
    if (isMatch && isAdmin && user.role !== 'admin') {
      await pool.query("UPDATE users SET role = $1 WHERE email = $2", ['admin', 'admin@smartrail.com']);
      user.role = 'admin';
    }

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const payload = { id: user.id, name: user.name, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
