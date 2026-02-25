/**
 * IPTV Smart Proxy Worker
 * Stylish day/night dashboard + smooth playback + global search + diagnostics.
 */

const HTML_SOURCE = `<!doctype html>
<html lang="en" data-theme="night">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>NeonStream IPTV</title>
  <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
  <style>
    :root,
    html[data-theme="day"] {
      --bg-1: #f8fbff;
      --bg-2: #e9efff;
      --card: rgba(255, 255, 255, 0.75);
      --text: #0f172a;
      --muted: #475569;
      --line: rgba(15, 23, 42, 0.14);
      --accent: #4f46e5;
      --accent2: #06b6d4;
      --shadow: 0 18px 60px rgba(79, 70, 229, 0.2);
      --ok: #16a34a;
      --warn: #d97706;
      --bad: #dc2626;
    }
    html[data-theme="night"] {
      --bg-1: #070a15;
      --bg-2: #111b32;
      --card: rgba(8, 13, 30, 0.72);
      --text: #e2e8f0;
      --muted: #94a3b8;
      --line: rgba(148, 163, 184, 0.2);
      --accent: #8b5cf6;
      --accent2: #06b6d4;
      --shadow: 0 22px 80px rgba(8, 145, 178, 0.2);
      --ok: #4ade80;
      --warn: #fbbf24;
      --bad: #fb7185;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
      color: var(--text);
      min-height: 100vh;
      background: radial-gradient(1000px 800px at 10% -10%, rgba(99,102,241,.22), transparent 60%),
                  radial-gradient(900px 700px at 100% 0, rgba(6,182,212,.18), transparent 55%),
                  linear-gradient(150deg, var(--bg-1), var(--bg-2));
      transition: background .3s ease, color .2s ease;
    }
    .wrap { max-width: 1300px; margin: 0 auto; padding: 1rem; }
    .card {
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: 18px;
      backdrop-filter: blur(16px);
      box-shadow: var(--shadow);
    }
    .header { padding: 1rem; display: flex; justify-content: space-between; gap: .8rem; align-items: center; margin-bottom: 1rem; }
    .brand { display: flex; gap: .7rem; align-items: center; font-weight: 800; }
    .dot { width: 12px; height: 12px; border-radius: 999px; background: linear-gradient(135deg,var(--accent),var(--accent2)); box-shadow: 0 0 18px var(--accent); }
    .muted { color: var(--muted); }
    .btn, .input, .select {
      border: 1px solid var(--line);
      border-radius: 12px;
      background: rgba(255,255,255,.04);
      color: var(--text);
      padding: .62rem .78rem;
      font: inherit;
    }
    .input, .select { width: 100%; }
    .btn { cursor: pointer; }
    .btn:hover { border-color: var(--accent); }
    .btn.primary { border: none; background: linear-gradient(135deg,var(--accent),var(--accent2)); color: #fff; font-weight: 700; }
    .grid { display: grid; grid-template-columns: 360px 1fr; gap: 1rem; }
    .panel { padding: 1rem; }
    .stack { display: grid; gap: .55rem; }
    .channels { margin-top: .8rem; display: grid; gap: .55rem; max-height: 420px; overflow: auto; padding-right: .2rem; }
    .row { border: 1px solid var(--line); border-radius: 12px; padding: .55rem; display: grid; grid-template-columns: 1fr auto auto auto; gap: .35rem; align-items: center; }
    .name { font-weight: 650; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .tiny { font-size: .78rem; }
    .status { margin-top: .7rem; display: flex; gap: .5rem; flex-wrap: wrap; }
    .pill { border: 1px solid var(--line); border-radius: 999px; padding: .24rem .62rem; font-size: .78rem; color: var(--muted); }
    .pill.ok { color: var(--ok); }
    .pill.warn { color: var(--warn); }
    .pill.bad { color: var(--bad); }
    video { width: 100%; aspect-ratio: 16/9; border-radius: 14px; border: 1px solid var(--line); background: #000; }
    .search-wrap { margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed var(--line); }
    .search-head { display: grid; grid-template-columns: 1fr 180px auto; gap: .5rem; }
    .results { margin-top: .75rem; max-height: 300px; overflow: auto; display: grid; gap: .45rem; }
    .result { border: 1px solid var(--line); border-radius: 10px; padding: .45rem .55rem; display:grid; grid-template-columns: 1fr auto; gap:.4rem; align-items:center; }
    .loader { display:none; font-size:.88rem; color: var(--muted); }
    @media (max-width: 1000px) { .grid { grid-template-columns: 1fr; } .search-head { grid-template-columns:1fr; } }
  </style>
</head>
<body>
  <div class="wrap">
    <header class="card header">
      <div class="brand"><span class="dot"></span>NeonStream IPTV <span class="muted">premium control panel</span></div>
      <div style="display:flex; gap:.5rem; flex-wrap:wrap;">
        <button class="btn" id="themeBtn">🌙 Night</button>
        <button class="btn" id="saveBtn">💾 Save</button>
      </div>
    </header>

    <main class="grid">
      <section class="card panel">
        <h3 style="margin:.15rem 0 .25rem">My Channels</h3>
        <p class="muted tiny" style="margin:0 0 .6rem">Add, test, play, and save your channels.</p>
        <div class="stack">
          <input class="input" id="name" placeholder="Channel name" />
          <input class="input" id="url" placeholder="https://...m3u8" dir="ltr" />
          <button class="btn primary" id="addBtn">+ Add Channel</button>
          <div class="loader" id="saveState">Saving...</div>
        </div>
        <div class="channels" id="channels"></div>
      </section>

      <section class="card panel">
        <h3 style="margin:.15rem 0 .25rem">Player</h3>
        <p class="muted tiny" id="playingMeta" style="margin:0 0 .65rem">Select a channel to start playback.</p>
        <video id="video" controls playsinline preload="auto"></video>
        <div class="status">
          <span class="pill" id="qualityPill">Quality: auto</span>
          <span class="pill" id="latencyPill">Latency: --</span>
          <span class="pill" id="statePill">State: idle</span>
        </div>

        <div class="search-wrap">
          <h3 style="margin:.1rem 0 .25rem">Global Search</h3>
          <p class="muted tiny" style="margin:0 0 .55rem">Search channels from IPTV-org and add them instantly.</p>
          <div class="search-head">
            <input class="input" id="searchQuery" placeholder="Search channel name (e.g. BBC, Sports, News)" />
            <select class="select" id="searchCountry"><option value="">All countries</option></select>
            <button class="btn primary" id="searchBtn">Search</button>
          </div>
          <div class="loader" id="searchLoader">Loading global database...</div>
          <div class="results" id="searchResults"></div>
        </div>
      </section>
    </main>
  </div>

<script>
(() => {
  const $ = (id) => document.getElementById(id);
  const state = { channels: [], hls: null, countries: [], streams: null };
  const THEME_KEY = 'ui_theme';

  const escapeHtml = (v) => String(v || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  function encodeB64Url(input) {
    const b64 = btoa(unescape(encodeURIComponent(input)));
    return b64.split('+').join('-').split('/').join('_').replace(/=+$/, '');
  }

  function scoreBadge(ms, segments) {
    if (ms <= 900 && segments >= 3) return { text: 'Excellent', cls: 'ok' };
    if (ms <= 1800 && segments >= 2) return { text: 'Good', cls: 'ok' };
    if (ms <= 3000) return { text: 'Medium', cls: 'warn' };
    return { text: 'Weak', cls: 'bad' };
  }

  function setState(text, kind = '') {
    const el = $('statePill');
    el.textContent = 'State: ' + text;
    el.classList.remove('ok', 'warn', 'bad');
    if (kind) el.classList.add(kind);
  }

  function applyTheme(theme) {
    const normalized = theme === 'day' ? 'day' : 'night';
    document.documentElement.setAttribute('data-theme', normalized);
    localStorage.setItem(THEME_KEY, normalized);
    $('themeBtn').textContent = normalized === 'night' ? '🌙 Night' : '☀️ Day';
  }

  function rowTestText(index) {
    const ch = state.channels[index];
    if (!ch || !ch.test) return '<span class="muted tiny">Not tested</span>';
    const b = scoreBadge(ch.test.proxyPingMs, ch.test.segments);
    return '<span class="pill ' + b.cls + '">' + b.text + ' · ' + ch.test.proxyPingMs + 'ms · seg:' + ch.test.segments + '</span>';
  }

  function renderChannels() {
    const list = $('channels');
    if (!state.channels.length) {
      list.innerHTML = '<p class="muted tiny">No channels yet. Add your first stream.</p>';
      return;
    }
    list.innerHTML = state.channels.map((c, i) =>
      '<div class="row">'
      + '<div><div class="name" title="' + escapeHtml(c.name) + '">' + escapeHtml(c.name) + '</div><div class="muted tiny" dir="ltr" title="' + escapeHtml(c.url) + '">' + escapeHtml(c.url) + '</div>' + rowTestText(i) + '</div>'
      + '<button type="button" class="btn" data-play="' + i + '">▶</button>'
      + '<button type="button" class="btn" data-test="' + i + '">⏱</button>'
      + '<button type="button" class="btn" data-del="' + i + '">✕</button>'
      + '</div>'
    ).join('');
  }

  function setSaving(flag, text) {
    $('saveState').style.display = flag ? 'block' : 'none';
    $('saveState').textContent = text || 'Saving...';
  }

  async function loadChannels() {
    try {
      const res = await fetch('/api/channels', { cache: 'no-store' });
      if (!res.ok) throw new Error('load failed');
      const data = await res.json();
      state.channels = Array.isArray(data) ? data : [];
      renderChannels();
    } catch (e) {
      state.channels = [];
      renderChannels();
      setState('channel load failed', 'bad');
    }
  }

  async function saveChannels() {
    setSaving(true, 'Saving channels...');
    const res = await fetch('/api/channels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state.channels),
    });
    setSaving(false);
    if (!res.ok) throw new Error('Save failed');
  }

  async function addChannel() {
    const name = $('name').value.trim();
    const url = $('url').value.trim();
    if (!name || !url) {
      setState('name/url required', 'warn');
      return;
    }
    state.channels.unshift({ name, url, test: null });
    $('name').value = '';
    $('url').value = '';
    renderChannels();
    try {
      await saveChannels();
      setState('channel added', 'ok');
    } catch {
      setState('save failed', 'bad');
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
    const loop = () => {
      const now = performance.now();
      const drift = Math.max(0, Math.round(now - last - 1000));
      $('latencyPill').textContent = 'Latency: ' + drift + 'ms';
      last = now;
      setTimeout(loop, 1000);
    };
    setTimeout(loop, 1000);
  }

  function playChannel(index) {
    const ch = state.channels[index];
    if (!ch || !ch.url) {
      setState('invalid channel', 'bad');
      return;
    }

    try {
      $('playingMeta').textContent = 'Now playing: ' + ch.name;
      const proxied = '/proxy/' + encodeB64Url(ch.url) + '/' + encodeURIComponent(ch.name || 'stream') + '.m3u8';
      attachSmoothPlayback($('video'), proxied);
    } catch (err) {
      setState('play failed: ' + (err?.message || 'unknown error'), 'bad');
    }
  }

  function attachSmoothPlayback(video, streamUrl) {
    destroyPlayer();
    $('qualityPill').textContent = 'Quality: auto';

    if (typeof Hls !== 'undefined' && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        maxBufferLength: 25,
        backBufferLength: 90,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 8,
        startLevel: -1,
        capLevelToPlayerSize: true,
      });
      state.hls = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
        setState('playing', 'ok');
      });
      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        const level = hls.levels[data.level];
        if (level) $('qualityPill').textContent = 'Quality: ' + (level.height ? level.height + 'p' : 'auto');
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (!data.fatal) return;
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          setState('recovering network', 'warn');
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          setState('recovering media', 'warn');
          hls.recoverMediaError();
        } else {
          destroyPlayer();
          setState('fatal stream error', 'bad');
        }
      });
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.play().catch(() => {});
      setState('playing', 'ok');
      return;
    }

    setState('HLS unsupported', 'bad');
  }

  async function testChannel(index) {
    const ch = state.channels[index];
    if (!ch) return;
    setState('testing channel...', 'warn');
    try {
      const res = await fetch('/test-stream?url=' + encodeURIComponent(ch.url));
      const data = await res.json();
      if (data.status !== 'success') throw new Error(data.error || 'test failed');
      ch.test = { proxyPingMs: data.proxyPingMs, segments: data.segments };
      renderChannels();
      const badge = scoreBadge(data.proxyPingMs, data.segments);
      setState('test: ' + badge.text, badge.cls);
      await saveChannels().catch(() => {});
    } catch (e) {
      ch.test = null;
      renderChannels();
      setState('test failed', 'bad');
    }
  }

  async function ensureSearchData() {
    if (state.streams) return;
    $('searchLoader').style.display = 'block';
    $('searchLoader').textContent = 'Loading global database...';
    const [countriesRes, channelsRes, streamsRes] = await Promise.all([
      fetch('https://iptv-org.github.io/api/countries.json'),
      fetch('https://iptv-org.github.io/api/channels.json'),
      fetch('https://iptv-org.github.io/api/streams.json'),
    ]);
    const countries = await countriesRes.json();
    const channels = await channelsRes.json();
    const streams = await streamsRes.json();

    state.countries = Array.isArray(countries) ? countries : [];
    const streamMap = new Map();
    for (const s of streams || []) {
      if (!s.channel || !s.url || (s.status && s.status !== 'online')) continue;
      if (!streamMap.has(s.channel)) streamMap.set(s.channel, []);
      streamMap.get(s.channel).push(s);
    }

    state.streams = channels
      .filter((c) => streamMap.has(c.id))
      .map((c) => ({
        id: c.id,
        name: c.name,
        country: c.country,
        logo: c.logo,
        streams: streamMap.get(c.id),
      }));

    const select = $('searchCountry');
    const sortedCountries = state.countries.slice().sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    select.innerHTML = '<option value="">All countries</option>' + sortedCountries
      .map((c) => '<option value="' + c.code + '">' + c.name + '</option>')
      .join('');

    $('searchLoader').style.display = 'none';
  }

  async function executeSearch() {
    const q = $('searchQuery').value.trim().toLowerCase();
    const country = $('searchCountry').value;
    if (!q && !country) {
      $('searchResults').innerHTML = '<p class="muted tiny">Enter a search query or choose country.</p>';
      return;
    }

    try {
      await ensureSearchData();
      const rows = state.streams
        .filter((c) => (!q || c.name.toLowerCase().includes(q)) && (!country || c.country === country))
        .slice(0, 120);

      if (!rows.length) {
        $('searchResults').innerHTML = '<p class="muted tiny">No matching channel found.</p>';
        return;
      }

      $('searchResults').innerHTML = rows.map((r) => {
        const stream = r.streams[0];
        const url = stream.url;
        return '<div class="result">'
          + '<div><div class="name">' + escapeHtml(r.name) + '</div><div class="muted tiny">' + (r.country || 'GLOBAL') + '</div></div>'
          + '<button class="btn" data-add-search="' + encodeURIComponent(JSON.stringify({ name: r.name, url })) + '">Add</button>'
          + '</div>';
      }).join('');
    } catch (e) {
      $('searchResults').innerHTML = '<p class="tiny" style="color:var(--bad)">Search failed: ' + escapeHtml(e.message) + '</p>';
    }
  }

  async function addSearchResult(encodedPayload) {
    const payload = JSON.parse(decodeURIComponent(encodedPayload));
    if (!payload?.name || !payload?.url) return;
    state.channels.unshift({ name: payload.name, url: payload.url, test: null });
    renderChannels();
    try {
      await saveChannels();
      setState('channel added from search', 'ok');
    } catch {
      setState('save failed', 'bad');
    }
  }

  $('themeBtn').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'night';
    applyTheme(current === 'night' ? 'day' : 'night');
  });
  $('saveBtn').addEventListener('click', async () => {
    try { await saveChannels(); setState('saved', 'ok'); } catch { setState('save failed', 'bad'); }
  });
  $('addBtn').addEventListener('click', addChannel);
  $('searchBtn').addEventListener('click', executeSearch);
  $('searchQuery').addEventListener('keydown', (e) => { if (e.key === 'Enter') executeSearch(); });
  $('channels').addEventListener('click', async (e) => {
    const p = e.target.closest('[data-play]');
    if (p) return playChannel(Number(p.dataset.play));
    const t = e.target.closest('[data-test]');
    if (t) return testChannel(Number(t.dataset.test));
    const d = e.target.closest('[data-del]');
    if (!d) return;
    state.channels.splice(Number(d.dataset.del), 1);
    renderChannels();
    try { await saveChannels(); setState('deleted', 'ok'); } catch { setState('save failed', 'bad'); }
  });
  $('searchResults').addEventListener('click', (e) => {
    const a = e.target.closest('[data-add-search]');
    if (a) addSearchResult(a.dataset.addSearch);
  });

  $('video').addEventListener('waiting', () => setState('buffering', 'warn'));
  $('video').addEventListener('playing', () => setState('playing', 'ok'));
  $('video').addEventListener('error', () => setState('video error', 'bad'));

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

const urlSafeBase64Encode = (str) => {
  const b64 = btoa(unescape(encodeURIComponent(str)));
  return b64.split('+').join('-').split('/').join('_').replace(/=/g, '');
};
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
            { name: 'NASA TV', url: 'https://ntv1.livestreamingcdn.com/ntv1/playlist.m3u8', test: null },
          ];
          return json(saved ? JSON.parse(saved) : fallback, 200, { 'Cache-Control': 'no-store' });
        }

        if (request.method === 'POST') {
          const body = await request.text();
          if (body.length > 512 * 1024) return json({ error: 'Payload too large' }, 413);
          let parsed;
          try {
            parsed = JSON.parse(body);
          } catch {
            return json({ error: 'Invalid JSON' }, 400);
          }
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

      if (requestUrl.pathname === '/test-stream') {
        const target = requestUrl.searchParams.get('url');
        if (!target) return json({ status: 'error', error: 'Missing url parameter' }, 400);

        try {
          const startedAt = Date.now();
          const upstream = await fetch(target, {
            method: 'GET',
            headers: {
              'User-Agent': request.headers.get('User-Agent') || 'Mozilla/5.0',
              'Accept': 'application/vnd.apple.mpegurl,*/*',
              'Referer': new URL(target).origin + '/',
            },
          });
          const proxyPingMs = Date.now() - startedAt;
          if (!upstream.ok) {
            return json({ status: 'error', error: `HTTP ${upstream.status} ${upstream.statusText}` });
          }
          const text = await upstream.text();
          const segments = (text.match(/#EXTINF:/g) || []).length;
          return json({ status: 'success', proxyPingMs, segments });
        } catch (e) {
          return json({ status: 'error', error: e.message });
        }
      }

      if (requestUrl.pathname.startsWith('/proxy/')) {
        const encoded = requestUrl.pathname.split('/')[2];
        if (!encoded) return new Response('Missing target', { status: 400 });

        let raw;
        try {
          raw = urlSafeBase64Decode(encoded);
        } catch {
          return new Response('Invalid target', { status: 400 });
        }

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
