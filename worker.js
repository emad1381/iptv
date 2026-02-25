/**
 * IPTV Smart Proxy Worker
 * Modern day/night UI, smooth HLS playback, and channel management via KV.
 */

const HTML_SOURCE = `<!doctype html>
<html lang="en" data-theme="night">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>NeonStream IPTV</title>
  <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
  <style>
    :root {
      --bg: #f6f8ff;
      --bg-2: #ebefff;
      --card: rgba(255,255,255,.72);
      --text: #0f172a;
      --muted: #475569;
      --line: rgba(15, 23, 42, .14);
      --accent: #4f46e5;
      --accent-2: #06b6d4;
      --danger: #ef4444;
      --shadow: 0 18px 60px rgba(79,70,229,.2);
    }
    html[data-theme="night"] {
      --bg: #070a15;
      --bg-2: #10172a;
      --card: rgba(9,14,30,.68);
      --text: #e2e8f0;
      --muted: #94a3b8;
      --line: rgba(148,163,184,.2);
      --accent: #8b5cf6;
      --accent-2: #06b6d4;
      --danger: #fb7185;
      --shadow: 0 22px 80px rgba(8,145,178,.2);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      color: var(--text);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
      background: radial-gradient(1200px 1200px at 10% -10%, rgba(79,70,229,.22), transparent 60%),
                  radial-gradient(900px 900px at 100% 0, rgba(6,182,212,.14), transparent 55%),
                  linear-gradient(145deg, var(--bg), var(--bg-2));
      transition: background .35s ease, color .2s ease;
    }
    .wrap { max-width: 1200px; margin: 0 auto; padding: 1.2rem; }
    .card {
      backdrop-filter: blur(18px);
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: 20px;
      box-shadow: var(--shadow);
    }
    .header { display: flex; gap: .75rem; align-items: center; justify-content: space-between; padding: 1rem 1.1rem; margin-bottom: 1rem; }
    .brand { display: flex; align-items: center; gap: .75rem; font-weight: 700; }
    .dot { width: 12px; height: 12px; border-radius: 50%; background: linear-gradient(120deg,var(--accent),var(--accent-2)); box-shadow: 0 0 24px var(--accent); }
    .toolbar { display: flex; gap: .55rem; flex-wrap: wrap; }
    button, input {
      border: 1px solid var(--line);
      color: var(--text);
      background: rgba(255,255,255,.04);
      border-radius: 12px;
      padding: .62rem .82rem;
      font: inherit;
    }
    input { width: 100%; }
    button { cursor: pointer; transition: transform .15s ease, border-color .2s ease, background .25s ease; }
    button:hover { transform: translateY(-1px); border-color: var(--accent); }
    button.primary { background: linear-gradient(130deg,var(--accent),var(--accent-2)); border-color: transparent; color: #fff; font-weight: 600; }
    button.ghost { background: transparent; }
    .layout { display: grid; gap: 1rem; grid-template-columns: 350px 1fr; }
    .panel { padding: 1rem; }
    .muted { color: var(--muted); font-size: .92rem; }
    .stack { display: grid; gap: .65rem; }
    .row { display: grid; grid-template-columns: 1fr auto auto; gap: .5rem; align-items: center; border: 1px solid var(--line); border-radius: 14px; padding: .55rem .65rem; }
    .name { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .player { aspect-ratio: 16/9; width: 100%; border-radius: 16px; background: #000; border: 1px solid var(--line); }
    .status { margin-top: .6rem; display: flex; justify-content: space-between; gap: .5rem; flex-wrap: wrap; }
    .pill { border: 1px solid var(--line); border-radius: 999px; padding: .3rem .65rem; font-size: .8rem; color: var(--muted); }
    .live { color: #22c55e; }
    .danger { color: var(--danger); }
    @media (max-width: 980px) { .layout { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="wrap">
    <header class="card header">
      <div class="brand"><span class="dot"></span>NeonStream IPTV <span class="muted">stylish + smooth</span></div>
      <div class="toolbar">
        <button class="ghost" id="themeBtn">🌙 Night</button>
        <button class="ghost" id="saveBtn">💾 Save</button>
      </div>
    </header>

    <main class="layout">
      <section class="card panel">
        <h3 style="margin:.2rem 0 .4rem">Channel Library</h3>
        <p class="muted" style="margin:0 0 .75rem">Manage your playlist and play instantly through secure proxy.</p>

        <div class="stack" style="margin-bottom:.75rem">
          <input id="name" placeholder="Channel name (e.g. BBC News)" />
          <input id="url" placeholder="HLS URL (https://...m3u8)" dir="ltr" />
          <button class="primary" id="addBtn">＋ Add channel</button>
        </div>

        <div class="stack" id="channels"></div>
      </section>

      <section class="card panel">
        <h3 style="margin:.2rem 0 .4rem">Player</h3>
        <p class="muted" id="playingMeta" style="margin:0 0 .8rem">Pick a channel to start playback.</p>
        <video id="video" class="player" controls playsinline preload="auto"></video>
        <div class="status">
          <span class="pill" id="qualityPill">Quality: auto</span>
          <span class="pill" id="latencyPill">Latency: --</span>
          <span class="pill" id="statePill">State: idle</span>
        </div>
      </section>
    </main>
  </div>

<script>
(() => {
  const $ = (id) => document.getElementById(id);
  const state = { channels: [], hls: null, playingIndex: -1 };

  const THEME_KEY = 'ui_theme';

  function encodeB64Url(input) {
    return btoa(unescape(encodeURIComponent(input))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    $('themeBtn').textContent = theme === 'night' ? '🌙 Night' : '☀️ Day';
  }

  function setStatus(text, type = 'idle') {
    const pill = $('statePill');
    pill.textContent = 'State: ' + text;
    pill.classList.toggle('live', type === 'live');
    pill.classList.toggle('danger', type === 'error');
  }

  function renderChannels() {
    const list = $('channels');
    if (!state.channels.length) {
      list.innerHTML = '<p class="muted">No channels yet. Add your first stream above.</p>';
      return;
    }
    list.innerHTML = state.channels.map((c, i) => 
      '<div class="row">' +
      '<div><div class="name" title="' + c.name + '">' + c.name + '</div><div class="muted" style="font-size:.8rem" dir="ltr">' + c.url + '</div></div>' +
      '<button data-play="' + i + '">▶</button>' +
      '<button data-del="' + i + '">✕</button>' +
      '</div>'
    ).join('');
  }

  async function loadChannels() {
    try {
      const res = await fetch('/api/channels', { cache: 'no-store' });
      const data = await res.json();
      state.channels = Array.isArray(data) ? data : [];
      renderChannels();
    } catch {
      state.channels = [];
      renderChannels();
      setStatus('load failed', 'error');
    }
  }

  async function saveChannels() {
    const res = await fetch('/api/channels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state.channels)
    });
    if (!res.ok) throw new Error('Save failed');
  }

  async function addChannel() {
    const name = $('name').value.trim();
    const url = $('url').value.trim();
    if (!name || !url) return;
    state.channels.unshift({ name, url });
    $('name').value = '';
    $('url').value = '';
    renderChannels();
    try {
      await saveChannels();
      setStatus('saved');
    } catch {
      setStatus('save failed', 'error');
    }
  }

  function destroyPlayer() {
    if (state.hls) {
      state.hls.destroy();
      state.hls = null;
    }
    $('video').src = '';
  }

  function startLatencyLoop() {
    let last = performance.now();
    const tick = () => {
      const now = performance.now();
      const drift = Math.max(0, Math.round(now - last - 1000));
      $('latencyPill').textContent = 'Latency: ' + drift + 'ms';
      last = now;
      if (!document.hidden) setTimeout(tick, 1000);
    };
    setTimeout(tick, 1000);
  }

  function attachSmoothPlayback(video, streamUrl) {
    destroyPlayer();
    $('qualityPill').textContent = 'Quality: auto';

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        maxBufferLength: 24,
        maxMaxBufferLength: 90,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 8,
        capLevelToPlayerSize: true,
        startLevel: -1,
      });
      state.hls = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
        setStatus('playing', 'live');
      });
      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        const level = hls.levels[data.level];
        if (level) $('qualityPill').textContent = 'Quality: ' + (level.height ? (level.height + 'p') : 'auto');
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setStatus('recovering…', 'error');
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
          else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
          else { destroyPlayer(); setStatus('stopped', 'error'); }
        }
      });
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.play().catch(() => {});
      setStatus('playing', 'live');
    } else {
      setStatus('HLS unsupported', 'error');
    }
  }

  function playChannel(index) {
    const item = state.channels[index];
    if (!item) return;
    state.playingIndex = index;
    $('playingMeta').textContent = 'Now playing: ' + item.name;
    const proxy = '/proxy/' + encodeB64Url(item.url) + '/' + encodeURIComponent(item.name) + '.m3u8';
    attachSmoothPlayback($('video'), proxy);
  }

  $('themeBtn').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'night';
    applyTheme(current === 'night' ? 'day' : 'night');
  });
  $('saveBtn').addEventListener('click', async () => {
    try { await saveChannels(); setStatus('saved'); } catch { setStatus('save failed', 'error'); }
  });
  $('addBtn').addEventListener('click', addChannel);
  $('channels').addEventListener('click', async (e) => {
    const p = e.target.closest('[data-play]');
    if (p) return playChannel(Number(p.dataset.play));
    const d = e.target.closest('[data-del]');
    if (!d) return;
    state.channels.splice(Number(d.dataset.del), 1);
    renderChannels();
    try { await saveChannels(); setStatus('saved'); } catch { setStatus('save failed', 'error'); }
  });

  $('video').addEventListener('waiting', () => setStatus('buffering…'));
  $('video').addEventListener('playing', () => setStatus('playing', 'live'));
  $('video').addEventListener('error', () => setStatus('video error', 'error'));

  applyTheme(localStorage.getItem(THEME_KEY) || 'night');
  loadChannels();
  startLatencyLoop();
})();
</script>
</body>
</html>`;

const json = (data, status = 200, extraHeaders = {}) => new Response(JSON.stringify(data), {
  status,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    ...extraHeaders,
  },
});

const urlSafeBase64Encode = (str) => btoa(unescape(encodeURIComponent(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
const urlSafeBase64Decode = (str) => {
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  return decodeURIComponent(escape(atob(b64)));
};

export default {
  async fetch(request, env) {
    const requestUrl = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    try {
      if (request.method === 'HEAD' && requestUrl.pathname === '/api/ping') {
        return new Response(null, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-store',
          },
        });
      }

      if (requestUrl.pathname === '/api/channels') {
        const kv = env.IPTV_KV;
        if (!kv) return json({ error: 'KV not configured. Bind IPTV_KV in wrangler.' }, 500);

        if (request.method === 'GET') {
          const saved = await kv.get('saved_channels');
          const fallback = [
            { name: 'NASA TV', url: 'https://ntv1.livestreamingcdn.com/ntv1/playlist.m3u8' },
          ];
          return json(saved ? JSON.parse(saved) : fallback, 200, { 'Cache-Control': 'no-store' });
        }

        if (request.method === 'POST') {
          const body = await request.text();
          if (body.length > 512 * 1024) return json({ error: 'Payload too large' }, 413);
          let parsed;
          try { parsed = JSON.parse(body); } catch { return json({ error: 'Invalid JSON' }, 400); }
          if (!Array.isArray(parsed)) return json({ error: 'Expected an array' }, 400);
          await kv.put('saved_channels', JSON.stringify(parsed));
          return json({ success: true });
        }

        return json({ error: 'Method Not Allowed' }, 405);
      }

      if (requestUrl.pathname === '/' || requestUrl.pathname === '/index.html') {
        return new Response(HTML_SOURCE, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          },
        });
      }

      if (requestUrl.pathname.startsWith('/proxy/')) {
        const encoded = requestUrl.pathname.split('/')[2];
        if (!encoded) return new Response('Missing target', { status: 400 });

        let raw;
        try { raw = urlSafeBase64Decode(encoded); } catch { return new Response('Invalid target', { status: 400 }); }

        const targetUrl = new URL(raw);
        const headers = new Headers();
        headers.set('User-Agent', request.headers.get('User-Agent') || 'Mozilla/5.0');
        headers.set('Referer', targetUrl.origin + '/');
        headers.set('Accept', request.headers.get('Accept') || '*/*');
        const range = request.headers.get('Range');
        if (range) headers.set('Range', range);

        const upstream = await fetch(targetUrl.toString(), { method: request.method, headers, redirect: 'follow' });
        if (!upstream.ok) {
          return new Response(`Upstream error: ${upstream.status}`, {
            status: 502,
            headers: { 'Access-Control-Allow-Origin': '*' },
          });
        }

        const contentType = (upstream.headers.get('content-type') || '').toLowerCase();
        const isM3u8 = contentType.includes('mpegurl') || targetUrl.pathname.endsWith('.m3u8');
        const responseHeaders = new Headers(upstream.headers);
        responseHeaders.set('Access-Control-Allow-Origin', '*');
        responseHeaders.set('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS');
        responseHeaders.set('Access-Control-Allow-Headers', '*');

        if (!isM3u8) {
          return new Response(upstream.body, {
            status: upstream.status,
            statusText: upstream.statusText,
            headers: responseHeaders,
          });
        }

        const finalUrl = upstream.url;
        const finalObj = new URL(finalUrl);
        let playlist = await upstream.text();
        const toAbsolute = (uri) => new URL(uri, finalUrl);

        playlist = playlist
          .replace(/(URI=")(.*?)(")/gi, (m, p1, uri, p3) => {
            try {
              if (uri.startsWith('data:') || uri.startsWith('blob:')) return m;
              const abs = toAbsolute(uri);
              if (finalObj.search && !abs.search) abs.search = finalObj.search;
              const proxied = `/proxy/${urlSafeBase64Encode(abs.toString())}/${abs.pathname.split('/').pop() || 'key.key'}`;
              return `${p1}${proxied}${p3}`;
            } catch {
              return m;
            }
          })
          .replace(/^([^#\s][^\r\n]*)/gm, (line) => {
            const v = line.trim();
            if (!v || v.startsWith('data:') || v.startsWith('blob:')) return line;
            try {
              const abs = toAbsolute(v);
              if (finalObj.search && !abs.search) abs.search = finalObj.search;
              return `/proxy/${urlSafeBase64Encode(abs.toString())}/${abs.pathname.split('/').pop() || 'segment.ts'}`;
            } catch {
              return line;
            }
          });

        responseHeaders.set('Content-Type', 'application/vnd.apple.mpegurl');
        responseHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        return new Response(playlist, { status: 200, headers: responseHeaders });
      }

      return new Response('Not Found', { status: 404 });
    } catch (error) {
      return new Response(`Service Error: ${error.message}`, {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }
  },
};
