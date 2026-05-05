// server.js — PulseIO heart rate monitor backend
// Deploy to Railway / Render, then point your ESP32's POST_URL here.

const express = require('express');
const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());                  // parse JSON bodies from ESP32
app.use(express.static('public'));        // serve dashboard at GET /
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/heartbeat_dashboard_2.html');
});  

// ── In-memory store (last 500 readings) ──────────────────────────────────────
const MAX_HISTORY = 500;
const readings = [];

// ── POST /api/heartbeat ───────────────────────────────────────────────────────
// Called by ESP32 every 5 s:  { "bpm": 72.4, "avg_bpm": 74 }
app.post('/api/heartbeat', (req, res) => {
  const { bpm, avg_bpm } = req.body;

  if (typeof bpm !== 'number' || typeof avg_bpm !== 'number') {
    return res.status(400).json({ error: 'bpm and avg_bpm must be numbers' });
  }
  if (bpm < 20 || bpm > 300 || avg_bpm < 20 || avg_bpm > 300) {
    return res.status(422).json({ error: 'BPM values out of plausible range' });
  }

  const entry = { bpm, avg_bpm, ts: new Date().toISOString() };
  readings.push(entry);
  if (readings.length > MAX_HISTORY) readings.shift();

  console.log(`[heartbeat] bpm=${bpm} avg=${avg_bpm}`);
  res.status(201).json({ ok: true, received: entry });
});

// ── GET /api/heartbeat ────────────────────────────────────────────────────────
// Returns last N readings.  Usage: GET /api/heartbeat?limit=50
app.get('/api/heartbeat', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, MAX_HISTORY);
  res.json(readings.slice(-limit));
});

// ── GET /api/heartbeat/latest ─────────────────────────────────────────────────
// Returns only the most recent reading — polled by the dashboard every 2 s.
app.get('/api/heartbeat/latest', (req, res) => {
  if (readings.length === 0) return res.status(404).json({ error: 'No data yet' });
  res.json(readings[readings.length - 1]);
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;   // Railway injects PORT automatically
app.listen(PORT, () => console.log(`PulseIO listening on port ${PORT}`));
