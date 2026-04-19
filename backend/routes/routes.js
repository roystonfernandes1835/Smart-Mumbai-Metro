const express = require('express');
const router = express.Router();

router.get('/suggest', async (req, res) => {
  try {
    const { source, destination } = req.query;
    if(!source || !destination) return res.status(400).json({error: "Source and destination required"});

    // Proxy request to Python ML FastAPI service on port 8000
    // We will use standard fetch (Node 18+)
    const mlResponse = await fetch(`http://127.0.0.1:8000/api/routes/suggest?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}`);
    
    if (!mlResponse.ok) throw new Error("ML Service error");

    const data = await mlResponse.json();
    res.json(data);

  } catch (err) {
    console.error('Route Engine proxy error:', err);
    // Fallback response if ML service is down
    res.status(503).json({ 
      error: 'Route engine unavailable', 
      fallback: [{
        path: [req.query.source, req.query.destination],
        score: 100,
        type: "Direct (Fallback)"
      }]
    });
  }
});

module.exports = router;
