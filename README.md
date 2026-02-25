# NeonStream IPTV Worker

A complete Cloudflare Worker project for a **stylish IPTV dashboard** with:

- ✨ Fully refreshed UI/UX (glassmorphism + modern layout)
- 🌞 Day / 🌙 Night theme switching
- ▶️ Smooth HLS playback using `hls.js` with recovery logic
- 🛰️ Secure stream proxying for `.m3u8`, segments, and key URIs
- ☁️ Persistent channel storage in Cloudflare KV

---

## Features

### 1) New visual experience
- Modern two-panel layout (library + player)
- Glass cards, gradient background, and improved visual hierarchy
- Status pills for playback state, quality, and latency

### 2) Day/Night mode
- Theme toggle button in the header
- Theme preference stored in `localStorage`

### 3) Smooth playback and resilience
- HLS.js low-latency mode enabled
- Adaptive quality switching
- Automatic handling for network/media errors (`startLoad`, `recoverMediaError`)
- Native Safari HLS fallback if HLS.js is not supported

### 4) Channel management
- Add and delete channels from the UI
- Save channel list to Cloudflare KV
- Read channel list from KV at page load

### 5) Proxy and CORS bypass
- Proxy endpoint rewrites master/media playlists and key URIs
- Segments and keys are served with CORS-friendly headers
- Maintains query parameters when required by strict providers

---

## Project structure

- `worker.js` — Worker logic + embedded frontend
- `README.md` — This documentation

---

## Requirements

- Cloudflare account
- Wrangler CLI (`npm i -g wrangler`)
- A KV namespace for channels

---

## Setup

### 1) Create KV namespace

```bash
wrangler kv namespace create IPTV_KV
```

Copy the returned namespace id.

### 2) Configure `wrangler.toml`

Create/update your config:

```toml
name = "neonstream-iptv"
main = "worker.js"
compatibility_date = "2025-01-01"

[[kv_namespaces]]
binding = "IPTV_KV"
id = "<YOUR_NAMESPACE_ID>"
```

### 3) Run locally

```bash
wrangler dev
```

Open the local URL and use the UI to add channels.

### 4) Deploy

```bash
wrangler deploy
```

---

## API routes

### `GET /`
Serves the dashboard HTML.

### `GET /api/channels`
Returns channels from KV, or fallback sample channels.

### `POST /api/channels`
Saves the full channel array to KV.

**Payload example**
```json
[
  { "name": "BBC News", "url": "https://example.com/live.m3u8" }
]
```

### `HEAD /api/ping`
Quick health endpoint for latency checks.

### `GET /proxy/:base64/:filename?`
Proxy endpoint for playlists and media segments.

- Decodes URL-safe base64 target URL
- Fetches upstream stream resource
- Rewrites playlist URIs to route all nested resources through proxy

---

## Notes for stream compatibility

- Prefer direct `.m3u8` URLs (master or media playlists).
- Some providers enforce geo/IP restrictions; the Worker can only proxy reachable sources.
- If a stream fails, test the source URL directly first.

---

## Security / operational notes

- This project intentionally keeps write API simple.
- For production hardening, add auth for `POST /api/channels` and optional rate limits.
- Do not store private stream credentials in public repositories.

---

## Troubleshooting

### Channels don't save
- Confirm KV binding is named exactly `IPTV_KV`.
- Check Wrangler logs for Worker errors.

### Black screen / buffering
- Verify stream URL is valid and live.
- Some streams block non-browser clients; proxy headers help but cannot bypass all DRM/protected endpoints.

### Theme not persisting
- Ensure browser allows `localStorage` for the site origin.

---

## License

MIT (see `LICENSE`).
