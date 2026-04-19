const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');

function genId() { return "T" + Date.now() + Math.floor(Math.random() * 9999); }

// Book a ticket (Requires Auth)
router.post('/book', auth, async (req, res) => {
  try {
    const { lineId, fromStation, toStation, passengers, cls, fare } = req.body;
    const ticketId = genId();

    await pool.query(
      'INSERT INTO tickets (id, user_id, line_id, from_station, to_station, passengers, cls, fare, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [ticketId, req.user.id, lineId, fromStation, toStation, passengers, cls, fare, 'active']
    );

    res.json({ message: 'Ticket booked successfully', id: ticketId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get User's tickets
router.get('/user', auth, async (req, res) => {
  try {
    const tickets = await pool.query(
      'SELECT id, line_id as "lineId", from_station as "from", to_station as "to", passengers, cls, fare, status, created_at as date FROM tickets WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    const formatted = tickets.rows.map(t => ({
      ...t,
      date: new Date(t.date).toLocaleDateString("en-GB")
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
