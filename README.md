# NeonStream IPTV Worker

Cloudflare Worker IPTV dashboard with a modern UI, **working day/night switch**, smooth HLS playback, channel diagnostics, and global IPTV search.

## What this build includes

- Modern stylish UI/UX (glassmorphism + responsive layout)
- Day / Night mode toggle with persistent state (`localStorage`)
- Channel add/delete/play with Cloudflare KV persistence
- Stream diagnostics test per channel (`/test-stream`) with quality grading
- Global search from IPTV-org datasets (channels + streams + countries)
- HLS proxy with playlist URI rewriting for segments/keys and CORS-friendly playback

## Files

- `worker.js` — Full Worker backend + embedded frontend
- `README.md` — Setup and usage docs

## Setup

1. Install Wrangler:

```bash
npm i -g wrangler
```

2. Create KV namespace:

```bash
wrangler kv namespace create IPTV_KV
```

3. Configure `wrangler.toml`:

```toml
name = "neonstream-iptv"
main = "worker.js"
compatibility_date = "2025-01-01"

[[kv_namespaces]]
binding = "IPTV_KV"
id = "<YOUR_NAMESPACE_ID>"
```

4. Run locally:

```bash
wrangler dev
```

5. Deploy:

```bash
wrangler deploy
```

## API routes

- `GET /` — dashboard
- `GET /api/channels` — fetch channel list from KV
- `POST /api/channels` — save channel list to KV
- `HEAD /api/ping` — quick ping endpoint
- `GET /test-stream?url=...` — channel diagnostics (ping + segment count)
- `GET /proxy/:base64/:filename?` — proxy stream, rewrite m3u8 URIs

## Notes

- Use direct `.m3u8` URLs where possible.
- Some streams are geoblocked or provider-blocked and may fail regardless of proxy.
- If channels are not saving, verify KV binding name is exactly `IPTV_KV`.

## License

MIT (`LICENSE`).
