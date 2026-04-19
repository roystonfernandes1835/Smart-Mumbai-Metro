const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

router.get('/analytics', async (req, res) => {
  try {
    // Analytics dashboard data aggregation
    const totalTicketsQuery = await pool.query("SELECT COUNT(*) as count FROM tickets");
    const activeTicketsQuery = await pool.query("SELECT COUNT(*) as count FROM tickets WHERE status = 'active'");
    const totalRevenueQuery = await pool.query("SELECT SUM(fare) as revenue FROM tickets");

    // Passenger traffic by station (count of ENTRY/EXIT logs)
    const trafficQuery = await pool.query(`
      SELECT station_id "name", COUNT(*) as "riders" 
      FROM passenger_logs 
      GROUP BY station_id 
      ORDER BY riders DESC LIMIT 5
    `);

    res.json({
      metrics: {
        totalTickets: parseInt(totalTicketsQuery.rows[0].count, 10),
        activeTickets: parseInt(activeTicketsQuery.rows[0].count, 10),
        revenue: parseFloat(totalRevenueQuery.rows[0].revenue) || 0
      },
      traffic: trafficQuery.rows.map(r => ({ name: r.name, riders: parseInt(r.riders, 10) }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error retrieving analytics' });
  }
});


module.exports = router;
