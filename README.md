# PulseIO — ESP32 Heart Rate Monitor

ESP32 + MAX30102 → HTTP POST → Express server → live dashboard in any browser.

## Repo structure

```
pulseio/
├── server.js                        ← Express backend + API endpoints
├── package.json
├── .gitignore
└── public/
    └── heartbeat_dashboard_2.html   ← dashboard, served at GET /
```

## Deploy to Railway (free)

1. Push this repo to GitHub
2. Go to railway.app → New Project → Deploy from GitHub repo → pick this repo
3. Railway auto-detects Node.js and runs `npm start`
4. Copy the generated URL (e.g. `https://pulseio-production.up.railway.app`)

## Configure the ESP32

Open `heartbeat4_esp32.ino` and set:

```cpp
const char* POST_URL = "https://pulseio-production.up.railway.app/api/heartbeat";
```

Flash the sketch. On first boot the ESP32 creates a WiFi hotspot called **PulseIO-Setup** —
connect to it from your phone and enter your home WiFi credentials. After that it reconnects automatically.

## Open the dashboard

Visit `https://pulseio-production.up.railway.app/` in any browser.
The Server URL field is pre-filled with `/api/heartbeat/latest`. Click **Connect ESP32**.

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/heartbeat` | ESP32 posts `{ bpm, avg_bpm }` here |
| GET | `/api/heartbeat/latest` | Dashboard polls this every 2 s |
| GET | `/api/heartbeat?limit=50` | Last N readings |
