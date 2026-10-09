# IPTV Studio Pro

Persian RTL IPTV dashboard on a Cloudflare Worker: playlist import, live channel search, channel logos, CORS proxy playback, cloud save, and a server-side password gate.

Live: `https://iptv.nitroping.ir`

## What it does

- Imports M3U/M3U8 playlists from a URL or an uploaded file (`/api/parse`)
- Searches the live iptv-org catalog, tests each stream, and shows quality, country, and logo (`/api/search`)
- Plays HLS through hls.js, with an optional Cloudflare CORS proxy that rewrites playlist URIs (`/proxy`)
- Saves custom channels, favorites, and playlists to D1 automatically when they are added or removed
- Resolves missing channel logos from Wikipedia
- Requires a password before any page, API, or proxy response is served

## Files

- `src/index.js` — Worker backend and the embedded frontend
- `wrangler.toml` — Worker name, D1 binding, and the `iptv.nitroping.ir` route
- `package.json` — `wrangler dev` and `wrangler deploy` scripts

## Setup

```bash
npm install
npx wrangler login
npx wrangler d1 create iptv_db
```

Put the returned database id in `wrangler.toml`, then:

```bash
npx wrangler deploy
```

The D1 tables (`custom_channels`, `favorites`, `playlists`) are created automatically on the first request.

## Access

The site is gated by a password checked on the Worker. Until the password is accepted the browser only receives the login page, so the app cannot be reached by editing the page. The session cookie is `HttpOnly`, `Secure`, and lasts 30 days. The password is stored only as a SHA-256 hash.

## Notes

- The `/proxy` endpoint fetches whatever HTTP(S) URL it is given, so keep the password gate on.
- Channel search loads the iptv-org streams, channels, and logos catalogs into Worker memory and caches them for six hours.
- Some streams are geoblocked or reject the proxy and will fail regardless.

## License

MIT (`LICENSE`).
