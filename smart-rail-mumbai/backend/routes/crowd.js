const express = require('express');
const router = express.Router();

// Mock route fetching predictions from ML microservice
// For prototype, we proxy to ML service or return mocked array
router.get('/predict/:station', async (req, res) => {
  try {
    // Ideally this would call the Python FastAPI `ml/` service on port 8000
    // let resp = await fetch(`http://127.0.0.1:8000/predict?station=${encodeURIComponent(req.params.station)}`);
    // let data = await resp.json();
    
    // For now, generating dynamic semi-random data to represent model output:
    const baseCrowd = Math.floor(Math.random() * 50) + 20; // 20-70% base
    const trend = Math.random() > 0.5 ? 'increasing' : 'decreasing';
    
    res.json({
      station: req.params.station,
      crowdLevel: baseCrowd,
      trend,
      forecast: Array.from({length: 6}, (_, i) => ({
        time: `${(new Date().getHours() + i) % 24}:00`,
        predicted: Math.min(100, Math.max(0, baseCrowd + (Math.random()*40 - 20)))
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching crowd data' });
  }
});

module.exports = router;
