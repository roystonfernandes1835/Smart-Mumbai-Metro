const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// Validate QR Code
router.post('/validate', async (req, res) => {
  try {
    const { ticketId, stationId, actionType } = req.body;
    // Expected actionType: 'ENTRY' or 'EXIT'

    const result = await pool.query('SELECT * FROM tickets WHERE id = $1', [ticketId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Ticket not found' });
    
    const ticket = result.rows[0];
    if (ticket.status !== 'active') return res.status(400).json({ error: 'Ticket already used or expired' });

    // Log the passenger movement
    await pool.query(
      'INSERT INTO passenger_logs (ticket_id, station_id, action_type) VALUES ($1, $2, $3)',
      [ticketId, stationId, actionType]
    );

    // If EXIT, mark ticket as used
    if (actionType === 'EXIT') {
      await pool.query('UPDATE tickets SET status = $1 WHERE id = $2', ['used', ticketId]);
    }

    // After logging, we simulate a crowd metric update and broadcast it
    if (req.io) {
      // Very naiive crowd calc: random high/med/low for demo purposes, triggered by scan
      const levels = ['LOW', 'MEDIUM', 'HIGH'];
      const randLevel = levels[Math.floor(Math.random() * levels.length)];
      req.io.emit('crowd_update', { stationId, level: randLevel, action: actionType });
    }

    res.json({ message: `Ticket validated for ${actionType} at ${stationId}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error parsing QR' });
  }
});

module.exports = router;
