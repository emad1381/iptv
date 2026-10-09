const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>IPTV Studio & Dynamic Torrent Player</title>
  <!-- Google Fonts & Icons -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700;900&family=Vazirmatn:wght@300;400;700;900&display=swap" rel="stylesheet">
  <!-- Players & Torrent Libraries -->
  <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
  <style>
    :root {
      color-scheme: dark;
      --bg-base: #080710;
      --bg-surface: rgba(18, 16, 35, 0.65);
      --bg-surface-solid: #110e24;
      --text-main: #f3f4f6;
      --text-muted: #9ca3af;
      --accent-blue: #3b82f6;
      --accent-violet: #8b5cf6;
      --accent-cyan: #06b6d4;
      --accent-green: #10b981;
      --accent-red: #ef4444;
      --accent-amber: #f59e0b;
      --border-color: rgba(255, 255, 255, 0.08);
      --border-hover: rgba(59, 130, 246, 0.4);
      --glass-glow-blue: rgba(59, 130, 246, 0.15);
      --glass-glow-violet: rgba(139, 92, 246, 0.15);
      --font-fa: 'Vazirmatn', 'Inter', Tahoma, sans-serif;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      min-height: 100vh;
      font-family: var(--font-fa);
      background: var(--bg-base);
      color: var(--text-main);
      overflow-x: hidden;
      line-height: 1.5;
    }

    /* Ambient Background Glows */
    .ambient-glow {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      overflow: hidden;
    }

    .ambient-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(140px);
      opacity: 0.35;
      animation: float-glow 25s ease-in-out infinite alternate;
    }

    .ambient-orb:nth-child(1) {
      width: 700px;
      height: 700px;
      background: radial-gradient(circle, var(--accent-blue) 0%, transparent 70%);
      top: -200px;
      right: -100px;
      animation-delay: 0s;
    }

    .ambient-orb:nth-child(2) {
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, var(--accent-violet) 0%, transparent 70%);
      bottom: -150px;
      left: -150px;
      animation-delay: -5s;
    }

    .ambient-orb:nth-child(3) {
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, var(--accent-cyan) 0%, transparent 70%);
      top: 30%;
      left: 20%;
      animation-delay: -10s;
    }

    @keyframes float-glow {
      0% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(80px, -50px) scale(1.1); }
      100% { transform: translate(-40px, 60px) scale(0.95); }
    }

    /* Particles Canvas overlay */
    canvas#particlesCanvas {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
    }

    /* Main Grid Layout */
    .app-container {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: 420px 1fr;
      gap: 20px;
      min-height: 100vh;
      max-height: 100vh;
      padding: 20px;
    }

    /* Premium Glass Container Base */
    .glass-card {
      background: rgba(14, 12, 28, 0.96);
      border: 1px solid var(--border-color);
      border-radius: 24px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    /* Sidebar Styles */
    .sidebar {
      max-height: calc(100vh - 40px);
    }

    .brand {
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      gap: 16px;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, transparent 100%);
    }

    .brand-logo {
      width: 52px;
      height: 52px;
      border-radius: 16px;
      background: linear-gradient(135deg, var(--accent-blue), var(--accent-violet));
      display: grid;
      place-items: center;
      font-weight: 900;
      font-size: 20px;
      color: #fff;
      box-shadow: 0 8px 24px rgba(59, 130, 246, 0.35);
      animation: logo-pulse 4s ease-in-out infinite;
    }

    @keyframes logo-pulse {
      0%, 100% { box-shadow: 0 8px 24px rgba(59, 130, 246, 0.35); }
      50% { box-shadow: 0 8px 32px rgba(139, 92, 246, 0.5); }
    }

    .brand-info h1 {
      font-size: 18px;
      font-weight: 900;
      background: linear-gradient(90deg, #fff, #e2e8f0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.3px;
    }

    .brand-info p {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    /* Custom form elements */
    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    input {
      width: 100%;
      border: 1px solid var(--border-color);
      background: rgba(8, 7, 16, 0.6);
      color: var(--text-main);
      border-radius: 14px;
      padding: 12px 16px;
      font-family: var(--font-fa);
      font-size: 13.5px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    input:focus {
      border-color: var(--accent-blue);
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
      background: rgba(8, 7, 16, 0.85);
      outline: none;
    }

    .btn {
      border: none;
      border-radius: 14px;
      padding: 12px 20px;
      color: #fff;
      font-family: var(--font-fa);
      font-weight: 700;
      font-size: 13.5px;
      cursor: pointer;
      background: linear-gradient(135deg, var(--accent-blue), var(--accent-violet));
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.25);
      transition: all 0.25s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      text-decoration: none;
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 24px rgba(59, 130, 246, 0.4);
      filter: brightness(1.1);
    }

    .btn:active {
      transform: translateY(0);
      filter: brightness(0.95);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      box-shadow: none;
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: var(--border-hover);
      box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
    }

    .btn-danger {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.25);
      color: #fca5a5;
      box-shadow: none;
    }

    .btn-danger:hover {
      background: rgba(239, 68, 68, 0.25);
      border-color: rgba(239, 68, 68, 0.4);
      box-shadow: 0 6px 15px rgba(239, 68, 68, 0.15);
    }

    .panel {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .grid-row {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 10px;
    }

    .file-upload-btn {
      position: relative;
      overflow: hidden;
    }

    .file-upload-btn input[type="file"] {
      position: absolute;
      inset: 0;
      opacity: 0;
      cursor: pointer;
    }

    /* Stats Grid */
    .stats-container {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }

    .stat-box {
      background: rgba(8, 7, 16, 0.4);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 10px;
      text-align: center;
      transition: all 0.25s ease;
    }

    .stat-box:hover {
      border-color: var(--border-hover);
      background: rgba(8, 7, 16, 0.6);
      transform: translateY(-1px);
    }

    .stat-box .value {
      font-size: 20px;
      font-weight: 900;
      font-family: 'Inter', sans-serif;
      background: linear-gradient(135deg, var(--accent-cyan), var(--accent-blue));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: block;
    }

    .stat-box .label {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    /* Toolbar & Category tabs */
    .filter-tabs {
      display: flex;
      gap: 8px;
    }

    .pill-tab {
      border: 1px solid var(--border-color);
      background: rgba(255, 255, 255, 0.03);
      color: var(--text-muted);
      border-radius: 20px;
      padding: 6px 14px;
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.25s ease;
      font-family: var(--font-fa);
    }

    .pill-tab:hover {
      border-color: var(--border-hover);
      color: var(--text-main);
    }

    .pill-tab.active {
      background: linear-gradient(135deg, var(--accent-blue), var(--accent-violet));
      color: #fff;
      border-color: transparent;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .group-scroller {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 6px;
      scrollbar-width: thin;
      scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
      direction: ltr; /* keep scrollbar on same side */
    }

    .group-scroller::-webkit-scrollbar {
      height: 4px;
    }
    .group-scroller::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.15);
      border-radius: 2px;
    }

    .group-pill {
      white-space: nowrap;
      direction: rtl;
    }

    /* Channel List Area */
    .channel-list-container {
      flex: 1;
      overflow-y: auto;
      padding: 16px 20px;
      scrollbar-width: thin;
      scrollbar-color: rgba(255, 255, 255, 0.12) transparent;
      will-change: scroll-position;
      transform: translate3d(0, 0, 0);
    }

    .channel-list-container::-webkit-scrollbar {
      width: 6px;
    }
    .channel-list-container::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.12);
      border-radius: 4px;
    }

    .channel-item {
      display: grid;
      grid-template-columns: 50px 1fr auto;
      gap: 14px;
      align-items: center;
      padding: 10px 12px;
      margin-bottom: 10px;
      border: 1px solid var(--border-color);
      background: rgba(8, 7, 16, 0.3);
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      will-change: transform;
      transform: translate3d(0, 0, 0);
    }

    .channel-item:hover {
      transform: translateX(-4px) translateY(-1px);
      border-color: rgba(59, 130, 246, 0.45);
      background: rgba(8, 7, 16, 0.6);
      box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
    }

    .channel-item.active {
      border-color: var(--accent-green);
      background: rgba(16, 185, 129, 0.08);
      box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.2);
    }

    .channel-logo-wrapper {
      width: 50px;
      height: 50px;
      border-radius: 12px;
      background: rgba(8, 7, 16, 0.8);
      border: 1px solid var(--border-color);
      display: grid;
      place-items: center;
      overflow: hidden;
    }

    .channel-logo {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .channel-logo.fallback {
      display: none;
    }

    .channel-logo-text {
      font-size: 14px;
      font-weight: 700;
      color: var(--accent-blue);
    }

    .channel-details {
      min-width: 0;
    }

    .channel-name {
      font-size: 13.5px;
      font-weight: 700;
      color: var(--text-main);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .channel-group {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 3px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .fav-btn {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      background: rgba(245, 158, 11, 0.05);
      border: 1px solid rgba(245, 158, 11, 0.15);
      color: var(--accent-amber);
      font-size: 16px;
      cursor: pointer;
      display: grid;
      place-items: center;
      transition: all 0.2s ease;
    }

    .fav-btn:hover {
      background: rgba(245, 158, 11, 0.2);
      transform: scale(1.1);
    }

    .fav-btn.is-fav {
      background: var(--accent-amber);
      color: #000;
      border-color: transparent;
      box-shadow: 0 4px 10px rgba(245, 158, 11, 0.35);
    }

    .ping-btn {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      background: rgba(249, 115, 22, 0.05);
      border: 1px solid rgba(249, 115, 22, 0.15);
      color: #f97316; /* Orange */
      font-size: 14px;
      cursor: pointer;
      display: grid;
      place-items: center;
      transition: all 0.2s ease;
      font-family: 'Inter', sans-serif;
      font-weight: 700;
    }

    .ping-btn:hover {
      background: rgba(249, 115, 22, 0.2);
      transform: scale(1.1);
    }
    
    .ping-btn.loading {
      color: var(--accent-amber);
    }
    
    .ping-btn.success {
      color: #10b981;
      background: rgba(16, 185, 129, 0.08);
      border-color: rgba(16, 185, 129, 0.2);
      font-size: 10px;
      width: auto;
      padding: 0 8px;
    }

    .ping-btn.error {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.08);
      border-color: rgba(239, 68, 68, 0.2);
      font-size: 10px;
      width: auto;
      padding: 0 8px;
    }

    .delete-channel-btn {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      background: rgba(239, 68, 68, 0.05);
      border: 1px solid rgba(239, 68, 68, 0.15);
      color: #ef4444;
      font-size: 14px;
      cursor: pointer;
      display: grid;
      place-items: center;
      transition: all 0.2s ease;
    }

    .delete-channel-btn:hover {
      background: rgba(239, 68, 68, 0.18);
      border-color: #ef4444;
      box-shadow: 0 4px 10px rgba(239, 68, 68, 0.25);
      transform: scale(1.1);
    }
    
    .channel-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Main Stage Layout */
    .main-stage {
      max-height: calc(100vh - 40px);
      display: grid;
      grid-template-rows: auto 1fr;
    }

    .top-header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, transparent 100%);
    }

    .stream-info h2 {
      font-size: 18px;
      font-weight: 900;
      color: var(--text-main);
    }

    .stream-info p {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 3px;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.2);
      color: #a7f3d0;
      padding: 6px 14px;
      border-radius: 99px;
      font-size: 12px;
      font-weight: 700;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent-green);
      box-shadow: 0 0 10px var(--accent-green);
      animation: blink 2s ease-in-out infinite;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    /* Viewport Area */
    .viewport {
      padding: 24px;
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 24px;
      overflow: hidden;
      height: 100%;
    }

    .viewport-player-column,
    .viewport-controls-column {
      display: flex;
      flex-direction: column;
      gap: 20px;
      overflow-y: auto;
      height: 100%;
      padding-left: 4px;
      scrollbar-width: thin;
      scrollbar-color: rgba(255, 255, 255, 0.12) transparent;
      will-change: scroll-position;
      transform: translate3d(0, 0, 0);
    }

    .viewport-player-column::-webkit-scrollbar,
    .viewport-controls-column::-webkit-scrollbar {
      width: 6px;
    }
    .viewport-player-column::-webkit-scrollbar-thumb,
    .viewport-controls-column::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.12);
      border-radius: 4px;
    }

    /* Stack utility cards vertically in the left column on desktop */
    .viewport-controls-column .utility-sections {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* Interactive Player Container */
    .player-card {
      position: relative;
      background: #000;
      border-radius: 20px;
      overflow: hidden;
      border: 1px solid var(--border-color);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
      min-height: 450px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .player-card::before {
      content: '';
      position: absolute;
      inset: -1px;
      border-radius: 21px;
      background: linear-gradient(135deg, var(--accent-blue), var(--accent-violet), var(--accent-cyan));
      z-index: -1;
      opacity: 0.25;
      animation: border-glow-shift 12s linear infinite;
    }

    @keyframes border-glow-shift {
      0% { filter: hue-rotate(0deg); }
      100% { filter: hue-rotate(360deg); }
    }

    video {
      display: block;
      width: 100%;
      height: auto;
      max-height: 520px;
      background: #000;
      outline: none;
    }

    /* Stream State Banner */
    .meta-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%);
      border: 1px solid var(--border-color);
      border-radius: 18px;
      padding: 16px 20px;
    }

    .meta-content {
      min-width: 0;
    }

    .meta-content h3 {
      font-size: 15px;
      font-weight: 800;
      color: var(--text-main);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .meta-content p {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      direction: ltr;
      text-align: right;
    }

    /* Proxy Controller Tool */
    .proxy-control-box {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(255, 255, 255, 0.03);
      padding: 8px 16px;
      border-radius: 12px;
      border: 1px solid var(--border-color);
      flex-shrink: 0;
    }

    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 46px;
      height: 24px;
    }

    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      inset: 0;
      background-color: rgba(255, 255, 255, 0.15);
      transition: .3s;
      border-radius: 24px;
    }

    .slider:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: .3s;
      border-radius: 50%;
    }

    input:checked + .slider {
      background-gradient: linear-gradient(135deg, var(--accent-blue), var(--accent-cyan));
      background-color: var(--accent-blue);
    }

    input:checked + .slider:before {
      transform: translateX(22px);
    }

    .toggle-label {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-main);
      user-select: none;
      cursor: pointer;
      white-space: nowrap;
    }

    /* Channel finder */
    .finder-card { gap: 14px; }
    .finder-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
    .finder-head h3 {
      background: linear-gradient(90deg, var(--accent-cyan), var(--accent-blue));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .finder-form { display: grid; grid-template-columns: 1fr auto; gap: 8px; }
    .finder-hint { font-size: 11px; color: var(--text-muted); line-height: 1.6; }
    .finder-results { display: flex; flex-direction: column; gap: 8px; max-height: 460px; overflow-y: auto; padding-left: 2px; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.12) transparent; }
    .finder-result {
      display: grid;
      grid-template-columns: 46px 1fr auto;
      gap: 12px;
      align-items: center;
      padding: 10px 12px;
      border: 1px solid var(--border-color);
      border-radius: 16px;
      background: rgba(8, 7, 16, 0.45);
      transition: border-color .2s ease, transform .2s ease;
    }
    .finder-result:hover { border-color: var(--border-hover); transform: translateY(-1px); }
    .finder-logo { width: 46px; height: 46px; border-radius: 12px; object-fit: contain; background: rgba(255,255,255,.04); border: 1px solid var(--border-color); }
    .finder-logo-fallback { display: grid; place-items: center; font-weight: 800; color: var(--accent-cyan); font-size: 15px; }
    .finder-name { font-size: 13px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .finder-meta { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 5px; }
    .finder-chip { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 99px; border: 1px solid var(--border-color); color: var(--text-muted); font-family: 'Inter', sans-serif; }
    .finder-chip.ok { color: #6ee7b7; border-color: rgba(16,185,129,.4); background: rgba(16,185,129,.1); }
    .finder-chip.warn { color: #fcd34d; border-color: rgba(245,158,11,.4); background: rgba(245,158,11,.1); }
    .finder-chip.bad { color: #fca5a5; border-color: rgba(239,68,68,.4); background: rgba(239,68,68,.1); }
    .finder-actions { display: flex; flex-direction: column; gap: 6px; }
    .finder-actions .btn { padding: 7px 12px; font-size: 11.5px; border-radius: 10px; white-space: nowrap; }
    .finder-empty { text-align: center; color: var(--text-muted); font-size: 12px; padding: 18px 8px; border: 1px dashed rgba(255,255,255,.1); border-radius: 14px; }

    /* Forms Area */
    .utility-sections {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .utility-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .utility-card h3 {
      font-size: 14.5px;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .utility-card h3.torrent-title {
      background: linear-gradient(90deg, #f97316, #ef4444);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    /* Torrent dashboard UI */
    .torrent-dashboard {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .progress-bar-container {
      height: 8px;
      background: rgba(8, 7, 16, 0.5);
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid var(--border-color);
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--accent-blue), var(--accent-cyan));
      border-radius: 6px;
      width: 0%;
      transition: width 0.4s ease;
    }

    .torrent-metrics {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }

    .metric-item {
      background: rgba(8, 7, 16, 0.4);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 8px;
      text-align: center;
    }

    .metric-item .val {
      display: block;
      font-size: 13px;
      font-weight: 800;
      color: var(--accent-cyan);
      font-family: 'Inter', sans-serif;
    }

    .metric-item .lbl {
      font-size: 9px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    /* Torrent Multi-File Explorer */
    .torrent-files-explorer {
      background: rgba(8, 7, 16, 0.5);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      max-height: 180px;
      overflow-y: auto;
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .torrent-file-row {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 10px;
      align-items: center;
      padding: 6px 10px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid transparent;
      transition: all 0.2s ease;
    }

    .torrent-file-row:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: var(--border-color);
    }

    .torrent-file-row.playing {
      border-color: rgba(59, 130, 246, 0.4);
      background: rgba(59, 130, 246, 0.08);
    }

    .torrent-file-name {
      font-size: 11.5px;
      font-weight: 600;
      color: var(--text-main);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: right;
      direction: ltr;
    }

    .torrent-file-size {
      font-size: 10px;
      color: var(--text-muted);
      font-family: 'Inter', sans-serif;
    }

    .torrent-play-sub-btn {
      padding: 4px 10px;
      font-size: 10px;
      border-radius: 8px;
    }

    /* Empty states */
    .empty-state {
      min-height: 220px;
      border: 2px dashed rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      display: grid;
      place-items: center;
      text-align: center;
      color: var(--text-muted);
      padding: 24px;
      background: rgba(255, 255, 255, 0.01);
      transition: all 0.3s ease;
    }

    .empty-state:hover {
      border-color: rgba(59, 130, 246, 0.25);
      background: rgba(59, 130, 246, 0.01);
    }

    .empty-state h4 {
      font-size: 15px;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 6px;
    }

    .empty-state p {
      font-size: 12px;
      max-width: 240px;
    }

    /* Notifications & Logs footer */
    .status-bar {
      margin-top: auto;
      font-size: 12px;
      color: var(--text-muted);
      min-height: 18px;
      transition: all 0.3s ease;
      word-break: break-all;
    }

    /* Transitions & Animations */
    .fade-in {
      animation: anim-fade-in 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    @keyframes anim-fade-in {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Mobile Navigation Bar (hidden on desktop) */
    .mobile-nav-bar {
      display: none;
    }

    /* Responsive adjustments - Tablet */
    @media (max-width: 1100px) {
      .app-container {
        grid-template-columns: 1fr;
        max-height: none;
        overflow-y: auto;
      }
      .sidebar { max-height: none; }
      .main-stage { max-height: none; }
      video { max-height: 480px; }
      .viewport {
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        height: auto;
      }
      .viewport-player-column,
      .viewport-controls-column {
        overflow-y: visible;
        height: auto;
        padding-left: 0;
      }
      .viewport-controls-column .utility-sections {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }
    }

    /* ======= MOBILE PREMIUM LAYOUT ======= */
    @media (max-width: 768px) {
      .app-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        height: 100dvh;
        max-height: 100vh;
        max-height: 100dvh;
        padding: 0;
        gap: 0;
        overflow: hidden;
      }

      /* Player pinned at top */
      .main-stage {
        order: -1;
        max-height: none;
        border-radius: 0;
        border: none;
        box-shadow: none;
        flex-shrink: 0;
        overflow: visible;
      }

      .main-stage .top-header { display: none; }

      .main-stage .viewport {
        padding: 0;
        gap: 0;
        display: flex;
        flex-direction: column;
        height: auto;
        overflow: visible;
        grid-template-columns: 1fr;
      }

      .viewport-player-column {
        overflow: visible;
        height: auto;
        padding: 0;
        gap: 0;
      }

      .player-card {
        min-height: 0;
        border-radius: 0;
        border: none;
        box-shadow: none;
        aspect-ratio: 16 / 9;
        max-height: 56.25vw;
      }

      .player-card::before { display: none; }

      video { max-height: 56.25vw; }

      #webtorPlayerContainer { min-height: 200px !important; }

      #playerPlaceholder { border-radius: 0 !important; }

      .meta-banner { display: none; }

      /* Controls column hidden by default on mobile */
      .viewport-controls-column {
        display: none;
        overflow-y: auto;
        height: auto;
        padding: 12px;
      }

      /* Mobile nav bar */
      .mobile-nav-bar {
        display: flex !important;
        order: 0;
        flex-shrink: 0;
        background: rgba(14, 12, 28, 0.98);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border-top: 1px solid var(--border-color);
        border-bottom: 1px solid var(--border-color);
        padding: 4px 6px;
        gap: 4px;
        z-index: 10;
      }

      .mobile-nav-btn {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2px;
        padding: 8px 4px;
        border: none;
        background: transparent;
        color: var(--text-muted);
        font-family: var(--font-fa);
        font-size: 10px;
        font-weight: 700;
        cursor: pointer;
        border-radius: 10px;
        transition: all 0.25s ease;
        -webkit-tap-highlight-color: transparent;
      }

      .mobile-nav-btn .nav-icon {
        font-size: 18px;
        line-height: 1;
      }

      .mobile-nav-btn.active {
        color: #fff;
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
        box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.3), 0 2px 8px rgba(59, 130, 246, 0.15);
      }

      /* Sidebar fills remaining space */
      .sidebar {
        order: 1;
        flex: 1;
        min-height: 0;
        border-radius: 0;
        border: none;
        box-shadow: none;
        max-height: none;
        overflow: hidden;
      }

      .sidebar .brand { display: none; }

      .sidebar .panel { padding: 10px 12px; }

      .channel-list-container { padding: 8px 10px; }

      .channel-item {
        grid-template-columns: 40px 1fr auto;
        gap: 10px;
        padding: 8px 10px;
        margin-bottom: 6px;
        border-radius: 12px;
      }

      .channel-logo-wrapper {
        width: 40px;
        height: 40px;
        border-radius: 10px;
      }

      .channel-name { font-size: 12.5px; }
      .channel-group { font-size: 10px; }

      .fav-btn, .ping-btn, .delete-channel-btn {
        width: 28px;
        height: 28px;
        border-radius: 8px;
        font-size: 12px;
      }

      .channel-actions { gap: 4px; }

      .stats-container { gap: 6px; }

      .stat-box {
        padding: 8px;
        border-radius: 12px;
      }

      .stat-box .value { font-size: 16px; }
      .stat-box .label { font-size: 10px; }

      .filter-tabs { gap: 3px; flex-wrap: wrap; }

      .pill-tab {
        padding: 5px 10px;
        font-size: 11px;
        border-radius: 16px;
      }

      .utility-sections {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .utility-card {
        padding: 14px;
        border-radius: 14px;
        gap: 10px;
      }

      .utility-card h3 { font-size: 13px; }

      input {
        padding: 10px 12px;
        border-radius: 12px;
        font-size: 13px;
      }

      .btn {
        padding: 10px 16px;
        border-radius: 12px;
        font-size: 12.5px;
      }

      .glass-card {
        border-radius: 0;
        box-shadow: none;
      }

      .empty-state {
        min-height: 160px;
        padding: 16px;
      }

      .torrent-metrics { grid-template-columns: repeat(2, 1fr); }

      /* ===== Mobile Tab Visibility Rules ===== */

      /* Tab: Channels (default) */
      .app-container[data-mobile-tab="channels"] #sidebarImportPanel { display: none !important; }
      .app-container[data-mobile-tab="channels"] #sidebarFiltersPanel { display: flex; }
      .app-container[data-mobile-tab="channels"] #channelsListContainer { display: block; }
      .app-container[data-mobile-tab="channels"] .viewport-controls-column { display: none; }

      /* Tab: Import/Playlists */
      .app-container[data-mobile-tab="import"] #sidebarImportPanel { display: flex !important; flex-direction: column; gap: 12px; }
      .app-container[data-mobile-tab="import"] #sidebarFiltersPanel { display: flex !important; }
      .app-container[data-mobile-tab="import"] #channelsListContainer { flex: 1; overflow-y: auto; }
      .app-container[data-mobile-tab="import"] .viewport-controls-column { display: none; }

      /* Tab: Tools */
      .app-container[data-mobile-tab="tools"] .sidebar { display: none !important; }
      .app-container[data-mobile-tab="tools"] .main-stage {
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }
      .app-container[data-mobile-tab="tools"] .viewport {
        flex: 1;
        overflow-y: auto;
        min-height: 0;
      }
      .app-container[data-mobile-tab="tools"] .viewport-controls-column {
        display: flex !important;
        flex-direction: column;
        gap: 12px;
        padding: 12px;
      }
      .app-container[data-mobile-tab="tools"] .viewport-controls-column .utility-sections {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      /* Reduce ambient effects for mobile performance */
      .ambient-orb {
        opacity: 0.12;
        filter: blur(80px);
      }

      #particlesCanvas { display: none; }
    }
  </style>
</head>
<body>
  <!-- Ambient animations -->
  <div class="ambient-glow">
    <div class="ambient-orb"></div>
    <div class="ambient-orb"></div>
    <div class="ambient-orb"></div>
  </div>
  <canvas id="particlesCanvas"></canvas>

  <div class="app-container" data-mobile-tab="channels">
    <!-- Sidebar: Playlist Manager and Search -->
    <aside class="sidebar glass-card fade-in">
      <header class="brand">
        <div class="brand-logo">IP</div>
        <div class="brand-info">
          <h1>IPTV Studio Pro</h1>
          <p>Cloudflare Media Engine</p>
        </div>
      </header>

      <!-- Section: Imports -->
      <section class="panel" id="sidebarImportPanel">
        <form id="playlistUrlForm" class="grid-row">
          <input id="playlistInputUrl" type="url" class="ltr" placeholder="لینک پلی‌لیست M3U8 / M3U..." autocomplete="off">
          <button class="btn" type="submit">دریافت</button>
        </form>
        <button class="btn btn-secondary file-upload-btn">
          آپلود فایل پلی‌لیست
          <input id="playlistFileInput" type="file" accept=".m3u,.m3u8,text/plain">
        </button>
        
        <input id="searchChannelInput" placeholder="جستجوی کانال یا دسته‌بندی...">
        
        <!-- Live statistics dashboard -->
        <div class="stats-container">
          <div class="stat-box">
            <span class="value" id="statsChannels">0</span>
            <span class="label">کانال‌ها</span>
          </div>
          <div class="stat-box">
            <span class="value" id="statsGroups">0</span>
            <span class="label">دسته‌ها</span>
          </div>
          <div class="stat-box">
            <span class="value" id="statsFavs">0</span>
            <span class="label">علاقه‌مندی‌ها</span>
          </div>
        </div>
      </section>

      <!-- Section: Filters & Tabs -->
      <section class="panel" id="sidebarFiltersPanel" style="gap: 8px;">
        <div class="filter-tabs" style="display: flex; gap: 4px; align-items: center; width: 100%;">
          <button id="tabAllBtn" class="pill-tab active">کانال‌ها</button>
          <button id="tabFavsBtn" class="pill-tab">ستاره‌دار</button>
          <button id="tabPlaylistsBtn" class="pill-tab">لیست‌ها</button>
          <button id="clearPlaylistBtn" class="pill-tab btn-danger" style="margin-right: auto; padding: 6px 8px; font-size: 11px;">پاکسازی</button>
        </div>
        <div id="playlistGroupsScroller" class="group-scroller"></div>
      </section>

      <!-- Section: Channels List -->
      <section id="channelsListContainer" class="channel-list-container"></section>
    </aside>

    <!-- Mobile Navigation Bar -->
    <nav class="mobile-nav-bar" id="mobileNavBar">
      <button class="mobile-nav-btn active" data-mobile-tab="channels" onclick="switchMobileTab('channels')">
        <span class="nav-icon">📺</span>
        <span>کانال‌ها</span>
      </button>
      <button class="mobile-nav-btn" data-mobile-tab="import" onclick="switchMobileTab('import')">
        <span class="nav-icon">📥</span>
        <span>لیست‌ها</span>
      </button>
      <button class="mobile-nav-btn" data-mobile-tab="tools" onclick="switchMobileTab('tools')">
        <span class="nav-icon">🛠️</span>
        <span>ابزارها</span>
      </button>
    </nav>

    <!-- Main Stage: Player & Torrent Controls -->
    <main class="main-stage glass-card fade-in" style="animation-delay: 0.1s;">
      <header class="top-header">
        <div class="stream-info" style="display:flex; flex-direction:column; gap:6px;">
          <h2 id="currentStreamTitle">هیچ کانالی انتخاب نشده است</h2>
          <p id="currentStreamSub">برای پخش، یک لینک مستقیم اضافه کنید یا پلی‌لیست را ایمپورت کنید.</p>
          
          <!-- External Player Quick Links (Visible on Mobile & Desktop) -->
          <div id="externalPlayerControls" style="display:none; align-items:center; gap:8px; flex-wrap:wrap; margin-top:4px;">
            <span style="font-size:11.5px; color:var(--text-muted);">پخش خارجی:</span>
            <a id="vlcLink" href="#" class="btn" style="padding:2px 8px; font-size:11px; display:inline-flex; align-items:center; gap:4px; background:rgba(249,115,22,0.15); border:1px solid rgba(249,115,22,0.3); color:#f97316; border-radius:4px; text-decoration:none; height:24px; line-height:20px;">
              🍊 VLC
            </a>
            <button id="copyStreamUrlBtn" class="btn" style="padding:2px 8px; font-size:11px; display:inline-flex; align-items:center; gap:4px; background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.3); color:#10b981; border-radius:4px; height:24px; line-height:20px; cursor:pointer;">
              📋 کپی لینک
            </button>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <span class="status-badge">
            <span class="status-dot"></span>
            <span id="backendStatusLabel">کلادفلر آنلاین</span>
          </span>
          <a href="/logout" class="btn btn-secondary" style="padding:7px 14px; font-size:12px;">خروج</a>
        </div>
      </header>

      <section class="viewport">
        <!-- ستون راست: پلیر و بنر جریان -->
        <div class="viewport-player-column">
          <!-- Live Player Card -->
          <div class="player-card" style="position: relative;" id="playerCardContainer">
            <video id="iptvVideoPlayer" style="display:none; width:100%; height:100%; object-fit:contain;" controls playsinline preload="auto" crossorigin="anonymous"></video>
            <div id="webtorPlayerContainer" style="display:none; width:100%; min-height: 430px; border-radius: 12px; overflow:hidden;"></div>
            
            <!-- Pulse play placeholder -->
            <div id="playerPlaceholder" style="position:absolute; inset:0; background:radial-gradient(circle at center, rgba(31,41,55,0.4) 0%, rgba(8,7,16,0.95) 100%); display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:2; border-radius:20px;">
              <div class="pulse-play-icon" style="width: 70px; height: 70px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-blue), var(--accent-violet)); display: grid; place-items: center; box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4); margin-bottom:16px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:#fff; margin-left: 4px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              </div>
              <h4 style="color:var(--text-main); font-size:15px; font-weight:800; margin-bottom:4px;">آماده پخش جریان رسانه</h4>
              <p style="color:var(--text-muted); font-size:12px;">یک کانال را از لیست انتخاب کنید یا آدرس مستقیم وارد کنید</p>
            </div>

            <div id="playerErrorOverlay" style="display:none; position:absolute; inset:0; background:rgba(8, 7, 16, 0.95); flex-direction:column; align-items:center; justify-content:center; padding:24px; text-align:center; z-index:10; border-radius:20px; border:1px solid rgba(239,68,68,0.25);">
              <span style="font-size:32px; margin-bottom:8px; filter: drop-shadow(0 0 10px rgba(239,68,68,0.4));">⚠️</span>
              <h4 style="color:#ef4444; font-size:14px; font-weight:800; margin-bottom:6px;">خطا در دریافت یا پخش جریان ویدیو</h4>
              <p id="playerErrorMessage" style="color:#d1d5db; font-size:12px; max-width:380px; line-height:1.6; margin-bottom:12px;"></p>
              
              <!-- Quick external player links on playback error -->
              <div id="errorExternalPlayerBox" style="display:none; margin-bottom:16px; padding:10px; background:rgba(255,255,255,0.03); border-radius:8px; border:1px solid rgba(255,255,255,0.05); flex-direction:column; align-items:center; gap:8px;">
                <span style="font-size:11.5px; color:var(--text-muted); line-height:1.5;">اگر ویدیو در مرورگر پخش نشد، روی دکمه‌های زیر بزنید:</span>
                <div style="display:flex; gap:8px;">
                  <a id="errorVlcLink" href="#" class="btn" style="padding:4px 10px; font-size:11px; display:inline-flex; align-items:center; gap:4px; background:rgba(249,115,22,0.2); border:1px solid rgba(249,115,22,0.4); color:#f97316; border-radius:4px; text-decoration:none;">
                    🍊 VLC
                  </a>
                  <button id="errorCopyUrlBtn" class="btn" style="padding:4px 10px; font-size:11px; display:inline-flex; align-items:center; gap:4px; background:rgba(16,185,129,0.2); border:1px solid rgba(16,185,129,0.4); color:#10b981; border-radius:4px; cursor:pointer;">
                    📋 کپی لینک
                  </button>
                </div>
              </div>

              <div style="display:flex; gap:10px;">
                <button class="btn" onclick="retryCurrentPlayback()" style="padding:6px 16px; font-size:11.5px; background:linear-gradient(135deg, #f97316, #ef4444); border:none;">تلاش مجدد</button>
                <button class="btn btn-secondary" onclick="hidePlayerError()" style="padding:6px 16px; font-size:11.5px;">بستن پیام</button>
              </div>
            </div>
          </div>

          <!-- Media Context Banner & Proxy control -->
          <div class="meta-banner">
            <div class="meta-content">
              <h3 id="bannerTitle">آماده پخش جریان رسانه</h3>
              <p id="bannerUrl" class="ltr">No Stream Active</p>
            </div>
          </div>
        </div>

        <!-- ستون چپ: فرم‌های کنترل و ابزارها -->
        <div class="viewport-controls-column">
          <!-- Channel finder -->
          <div class="utility-card finder-card">
            <div class="finder-head">
              <h3>جستجوی کانال در وب</h3>
              <span class="finder-chip" id="finderCount">آماده</span>
            </div>
            <form id="finderForm" class="finder-form">
              <input id="finderQuery" placeholder="نام کانال، مثلاً Iran International یا منوتو" autocomplete="off">
              <button type="submit" class="btn" id="finderSubmit">جستجو</button>
            </form>
            <p class="finder-hint">از کاتالوگ زندهٔ iptv-org جستجو می‌کند، هر نتیجه را روی سرور تست می‌کند و فقط استریم سالم را به لیست اضافه می‌کند.</p>
            <div class="finder-results" id="finderResults"></div>
          </div>

          <!-- Interactive Utilities Forms Grid -->
          <div class="utility-sections">
             <!-- Form: Direct Streaming -->
             <div class="utility-card">
               <h3>جریان رسانه مستقیم</h3>
               <form id="directStreamForm" style="display:flex; flex-direction:column; gap:10px;">
                 <input id="directStreamUrlInput" type="url" class="ltr" placeholder="آدرس مستقیم جریان (M3U8, MP4, MP3)..." required autocomplete="off">
                 <input id="directStreamNameInput" placeholder="نام کانال (اختیاری)">
                 <button type="submit" class="btn" style="width:100%;">پخش و افزودن به لیست</button>
               </form>

              <!-- Proxy CORS Control -->
              <div class="utility-card">
                <h3>تنظیمات پروکسی CORS</h3>
                <div class="proxy-control-box">
                  <label class="toggle-switch">
                    <input type="checkbox" id="proxyToggleSwitch">
                    <span class="slider"></span>
                  </label>
                  <span class="toggle-label" id="proxyLabel">پروکسی CORS فعال</span>
                </div>
                <p style="font-size: 11px; color: var(--text-muted); line-height: 1.4; margin-top: 4px;">
                  فعالسازی پروکسی کلادفلر برای دور زدن محدودیتهای CORS و پخش جریانهای غیرقابل دسترس در مرورگر.
                </p>
              </div>

               <div class="status-bar" id="appStatusBar"></div>
             </div>

            <!-- Form: Dynamic Torrent/Magnet Streaming -->
            <div class="utility-card">
              <h3 class="torrent-title">استریم پیشرفته تورنت (WebTorrent + Cloud)</h3>
              <div class="grid-row" style="grid-template-columns: 1fr;">
                <input id="torrentUrlInput" type="text" class="ltr" placeholder="مگنت (Magnet) یا آدرس فایل تورنت">
              </div>
              <div class="grid-row" style="grid-template-columns: 1fr 1fr;">
                <button id="playTorrentBtn" class="btn" style="background: linear-gradient(135deg, #8b5cf6, #3b82f6); box-shadow: 0 6px 20px rgba(59, 130, 246, 0.25);">پخش تورنت YTS</button>
                <button id="playBrowserTorrentBtn" class="btn" style="background: linear-gradient(135deg, #f97316, #ef4444); box-shadow: 0 6px 20px rgba(249, 115, 22, 0.25);">WebTorrent آزمایشی</button>
              </div>
              <div class="grid-row" style="grid-template-columns: 1fr;">
                <button class="btn btn-secondary file-upload-btn" style="padding: 12px; background: rgba(139, 92, 246, 0.1); border-color: rgba(139, 92, 246, 0.25); color: #c084fc;">
                  آپلود و پخش فایل .torrent
                  <input id="torrentFileInput" type="file" accept=".torrent">
                </button>
              </div>
              <p style="font-size: 11px; color: var(--text-muted); line-height: 1.4; margin-top: 4px;">
                ⚠️ توجه: پخش تورنت در مرورگر به علت محدودیت‌های امنیتی شبکه‌ای، فقط با تورنت‌هایی کار می‌کند که دارای کلاینت‌های پشتیبان WebRTC (مانند WebTorrent Desktop یا سیدرهای هیبرید) باشند. اگر تعداد پیرها روی ۰ باقی ماند، از فایل‌های سازگار یا لینک‌های مستقیم استفاده کنید.
              </p>
              
              <!-- WebTorrent interactive Dashboard -->
              <div class="torrent-dashboard" id="torrentDashboard" style="display: none;">
                <div class="progress-bar-container">
                  <div id="torrentProgressFill" class="progress-fill"></div>
                </div>
                <div class="torrent-metrics">
                  <div class="metric-item">
                    <span class="val" id="valTorrentProgress">0%</span>
                    <span class="lbl">پیشرفت</span>
                  </div>
                  <div class="metric-item">
                    <span class="val" id="valTorrentPeers">0</span>
                    <span class="lbl">پیرها (Peers)</span>
                  </div>
                  <div class="metric-item">
                    <span class="val" id="valTorrentDownSpeed">0B/s</span>
                    <span class="lbl">دانلود</span>
                  </div>
                  <div class="metric-item">
                    <span class="val" id="valTorrentUpSpeed">0B/s</span>
                    <span class="lbl">آپلود</span>
                  </div>
                </div>
                <p class="status-bar" id="torrentStatusBar" style="color: var(--accent-amber); font-weight: 700;"></p>
                
                <!-- Multi-File Explorer list in Torrent -->
                <div class="torrent-files-explorer" id="torrentFileExplorerContainer">
                  <!-- Javascript will render files here -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>

  <script>
    // Particle network background animation
    (function() {
      const canvas = document.getElementById('particlesCanvas');
      const ctx = canvas.getContext('2d');
      let width, height, particles = [];

      function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }

      function init() {
        resize();
        particles = [];
        const count = Math.min(60, Math.floor(width / 25));
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2 + 0.5,
            dx: (Math.random() - 0.5) * 0.4,
            dy: (Math.random() - 0.5) * 0.4,
            opacity: Math.random() * 0.4 + 0.1
          });
        }
      }

      function draw() {
        ctx.clearRect(0, 0, width, height);
        for (const p of particles) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = \`rgba(148, 163, 184, \${p.opacity})\`;
          ctx.fill();

          p.x += p.dx;
          p.y += p.dy;

          if (p.x < 0 || p.x > width) p.dx = -p.dx;
          if (p.y < 0 || p.y > height) p.dy = -p.dy;
        }

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 130) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = \`rgba(148, 163, 184, \${(1 - dist / 130) * 0.08})\`;
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }
        }
        requestAnimationFrame(draw);
      }

      window.addEventListener('resize', () => {
        resize();
        init();
      });
      init();
      draw();
    })();

    // Application state
    const appState = {
      channels: [],
      savedPlaylists: [],
      activeGroup: '__all__',
      searchQuery: '',
      favorites: new Set(JSON.parse(localStorage.getItem('iptv-favorites-v2') || '[]')),
      showFavoritesOnly: false,
      activeTab: 'channels', // 'channels' or 'playlists'
      hlsInstance: null,
      activeStreamUrl: null,
      proxyEnabled: JSON.parse(localStorage.getItem('proxy-enabled-v2') || 'false'),
      activeTorrent: null,
      renderLimit: 50
    };

    let torrentClient = null;

    // Helper functions
    const getEl = id => document.getElementById(id);
    const updateStatus = text => getEl('appStatusBar').textContent = text || '';
    const updateTorrentStatus = text => getEl('torrentStatusBar').textContent = text || '';

    // Initialize UI Toggle state
    getEl('proxyToggleSwitch').checked = appState.proxyEnabled;

    async function saveFavorites() {
      localStorage.setItem('iptv-favorites-v2', JSON.stringify([...appState.favorites]));
      updateStatistics();
      try {
        await fetch('/api/sync/favorites', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ favorites: [...appState.favorites] })
        });
      } catch(e) {
        console.error('Failed to sync favorites to D1:', e);
      }
    }

    function updateStatistics() {
      getEl('statsChannels').textContent = appState.channels.length;
      getEl('statsGroups').textContent = getGroupsList().length;
      getEl('statsFavs').textContent = appState.favorites.size;
    }

    function setFilterMode(mode) {
      appState.showFavoritesOnly = (mode === 'favs');
      if (mode === 'all') appState.activeGroup = '__all__';
      
      getEl('tabAllBtn').classList.toggle('active', !appState.showFavoritesOnly && appState.activeGroup === '__all__' && appState.activeTab === 'channels');
      getEl('tabFavsBtn').classList.toggle('active', appState.showFavoritesOnly && appState.activeTab === 'channels');
      getEl('tabPlaylistsBtn').classList.toggle('active', appState.activeTab === 'playlists');
    }

    function getGroupsList() {
      const groups = new Map();
      for (const ch of appState.channels) {
        const groupName = ch.group || 'دسته‌بندی نشده';
        groups.set(groupName, (groups.get(groupName) || 0) + 1);
      }
      return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    }

    function renderGroupTabs() {
      const container = getEl('playlistGroupsScroller');
      container.innerHTML = '';

      if (appState.channels.length === 0) return;

      let groups = getGroupsList();
      if (appState.searchQuery) {
        const query = appState.searchQuery.toLowerCase();
        groups = groups.filter(([groupName]) => groupName.toLowerCase().includes(query));
      }
      
      // All tab
      const allBtn = document.createElement('button');
      allBtn.className = 'pill-tab group-pill ' + (appState.activeGroup === '__all__' && !appState.showFavoritesOnly ? 'active' : '');
      allBtn.textContent = \`همه کانال‌ها (\${appState.channels.length})\`;
      allBtn.onclick = () => {
        appState.activeGroup = '__all__';
        appState.showFavoritesOnly = false;
        appState.renderLimit = 50;
        renderChannelsList();
        renderGroupTabs();
      };
      container.appendChild(allBtn);

      // Groups lists
      for (const [groupName, count] of groups) {
        const btn = document.createElement('button');
        btn.className = 'pill-tab group-pill ' + (appState.activeGroup === groupName && !appState.showFavoritesOnly ? 'active' : '');
        btn.textContent = \`\${groupName} (\${count})\`;
        btn.onclick = () => {
          appState.activeGroup = groupName;
          appState.showFavoritesOnly = false;
          renderChannelsList();
          renderGroupTabs();
        };
        container.appendChild(btn);
      }
    }

    function filterChannels() {
      let filtered = appState.channels;
      
      if (appState.showFavoritesOnly) {
        filtered = filtered.filter(ch => appState.favorites.has(ch.url));
      } else if (appState.activeGroup !== '__all__') {
        filtered = filtered.filter(ch => (ch.group || 'دسته‌بندی نشده') === appState.activeGroup);
      }

      if (appState.searchQuery) {
        const query = appState.searchQuery.toLowerCase();
        filtered = filtered.filter(ch => 
          (ch.name || '').toLowerCase().includes(query) || 
          (ch.group || '').toLowerCase().includes(query)
        );
      }

      return filtered;
    }

    function renderChannelsList() {
      const container = getEl('channelsListContainer');
      container.innerHTML = '';

      const list = filterChannels();

      if (!list.length) {
        container.innerHTML = \`
          <div class="empty-state fade-in">
            <div>
              <h4>هیچ کانالی یافت نشد</h4>
              <p>فیلترها را تغییر دهید یا لیست جدیدی ایمپورت کنید.</p>
            </div>
          </div>
        \`;
        return;
      }

      const slice = list.slice(0, appState.renderLimit);
      appendChannelItems(slice);

      container.onscroll = () => {
        if (container.scrollTop + container.clientHeight >= container.scrollHeight - 50) {
          if (appState.renderLimit < list.length) {
            const oldLimit = appState.renderLimit;
            appState.renderLimit += 50;
            const nextSlice = list.slice(oldLimit, appState.renderLimit);
            appendChannelItems(nextSlice);
          }
        }
      };
    }

    function appendChannelItems(items) {
      const container = getEl('channelsListContainer');
      
      for (const ch of items) {
        const item = document.createElement('article');
        item.className = 'channel-item fade-in' + (appState.activeStreamUrl === ch.url ? ' active' : '');
        
        const logoWrapper = document.createElement('div');
        logoWrapper.className = 'channel-logo-wrapper';
        
        if (ch.logo) {
          const img = document.createElement('img');
          img.className = 'channel-logo';
          img.src = ch.logo;
          img.loading = 'lazy';
          
          const textFallback = document.createElement('span');
          textFallback.className = 'channel-logo-text';
          textFallback.textContent = (ch.name || '?').charAt(0).toUpperCase();
          logoWrapper.appendChild(textFallback);

          img.onload = () => {
            textFallback.style.display = 'none';
          };
          img.onerror = () => {
            img.style.display = 'none';
            textFallback.style.display = 'block';
          };
          logoWrapper.appendChild(img);
        } else {
          const textFallback = document.createElement('span');
          textFallback.className = 'channel-logo-text';
          textFallback.textContent = (ch.name || '?').charAt(0).toUpperCase();
          logoWrapper.appendChild(textFallback);
        }

        const details = document.createElement('div');
        details.className = 'channel-details';
        
        const name = document.createElement('div');
        name.className = 'channel-name';
        name.textContent = ch.name;
        
        const group = document.createElement('div');
        group.className = 'channel-group';
        group.textContent = ch.group || 'دسته‌بندی نشده';
        
        details.appendChild(name);
        details.appendChild(group);

        const actions = document.createElement('div');
        actions.className = 'channel-actions';

        const pingBtn = document.createElement('button');
        pingBtn.className = 'ping-btn';
        pingBtn.innerHTML = '⚡';
        pingBtn.title = 'تست پینگ و وضعیت کانال';
        pingBtn.onclick = (e) => {
          e.stopPropagation();
          testChannelPing(ch.url, pingBtn);
        };

        const fav = document.createElement('button');
        fav.className = 'fav-btn' + (appState.favorites.has(ch.url) ? ' is-fav' : '');
        fav.innerHTML = appState.favorites.has(ch.url) ? '&#9733;' : '&#9734;';
        fav.onclick = (e) => {
          e.stopPropagation();
          if (appState.favorites.has(ch.url)) {
            appState.favorites.delete(ch.url);
            fav.className = 'fav-btn';
            fav.innerHTML = '&#9734;';
          } else {
            appState.favorites.add(ch.url);
            fav.className = 'fav-btn is-fav';
            fav.innerHTML = '&#9733;';
          }
          saveFavorites();
        };

        actions.appendChild(pingBtn);
        actions.appendChild(fav);

        if (ch.group === 'سفارشی') {
          const deleteBtn = document.createElement('button');
          deleteBtn.className = 'delete-channel-btn';
          deleteBtn.innerHTML = '🗑️';
          deleteBtn.title = 'حذف کانال سفارشی';
          deleteBtn.onclick = (e) => {
            e.stopPropagation();
            if (!confirm('کانال «' + ch.name + '» حذف و از ذخیره ابری هم پاک شود؟')) return;
            removeCustomChannel(ch.url);
          };
          actions.appendChild(deleteBtn);
        }

        item.onclick = () => {
          playChannel(ch);
        };

        item.appendChild(logoWrapper);
        item.appendChild(details);
        item.appendChild(actions);
        container.appendChild(item);
      }
    }

    function renderSavedPlaylistsList() {
      const container = getEl('channelsListContainer');
      container.innerHTML = '';
      
      if (!appState.savedPlaylists.length) {
        container.innerHTML = \`
          <div class="empty-state fade-in" style="padding: 40px 20px; text-align: center; color: var(--text-muted);">
            <div>
              <h4 style="color: var(--text-main); margin-bottom: 8px;">هیچ پلی‌لیستی ذخیره نشده است</h4>
              <p style="font-size: 12px;">یک فایل پلی‌لیست آپلود کنید یا آدرس آن را وارد کنید.</p>
            </div>
          </div>
        \`;
        return;
      }

      for (const pl of appState.savedPlaylists) {
        const item = document.createElement('article');
        item.className = 'channel-item fade-in';
        item.style.display = 'grid';
        item.style.gridTemplateColumns = '1fr auto';
        item.style.alignItems = 'center';
        
        const details = document.createElement('div');
        details.className = 'channel-details';
        
        const name = document.createElement('div');
        name.className = 'channel-name';
        name.textContent = pl.name || 'لیست بدون نام';
        
        const count = document.createElement('div');
        count.className = 'channel-group';
        count.textContent = pl.channels.length + ' کانال' + (pl.url ? ' (آدرس آنلاین)' : ' (فایل محلی)');
        
        details.appendChild(name);
        details.appendChild(count);
        
        const actions = document.createElement('div');
        actions.className = 'channel-actions';

        const loadBtn = document.createElement('button');
        loadBtn.className = 'ping-btn success';
        loadBtn.textContent = 'لود';
        loadBtn.style.width = 'auto';
        loadBtn.style.padding = '0 10px';
        loadBtn.title = 'بارگذاری این پلی‌لیست';
        loadBtn.onclick = (e) => {
          e.stopPropagation();
          const customList = JSON.parse(localStorage.getItem('iptv-custom-channels-v2') || '[]');
          appState.channels = [...customList, ...pl.channels];
          getEl('currentStreamTitle').textContent = pl.name || 'لیست لود شده';
          getEl('currentStreamSub').textContent = pl.url || 'محتوای فایل محلی';
          appState.activeTab = 'channels';
          setFilterMode('all');
          updateStatistics();
          renderGroupTabs();
          renderChannelsList();
          updateStatus('پلی‌لیست "' + pl.name + '" با موفقیت بارگذاری شد.');
        };

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-channel-btn';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.title = 'حذف پلی‌لیست';
        deleteBtn.onclick = (e) => {
          e.stopPropagation();
          if (confirm('آیا از حذف پلی‌لیست "' + pl.name + '" مطمئن هستید؟')) {
            appState.savedPlaylists = appState.savedPlaylists.filter(p => p.id !== pl.id);
            localStorage.setItem('iptv-saved-playlists-v2', JSON.stringify(appState.savedPlaylists));
            
            const customList = JSON.parse(localStorage.getItem('iptv-custom-channels-v2') || '[]');
            appState.channels = [...customList];
            
            renderSavedPlaylistsList();
            updateStatistics();
            renderGroupTabs();
            updateStatus('پلی‌لیست حذف شد.');
          }
        };

        actions.appendChild(loadBtn);
        actions.appendChild(deleteBtn);
        
        item.appendChild(details);
        item.appendChild(actions);
        container.appendChild(item);
      }
    }

    function cleanVideoFilename(filename) {
      // Remove file extensions
      let name = filename.replace(/\.(mkv|mp4|avi|mov|flv|wmv|webm|ts|m3u8|mpg|mpeg|3gp|m4v)$/i, '');
      
      // Common technical terms to remove (case insensitive)
      const removeTerms = [
        '1080p', '720p', '480p', '2160p', '4320p',
        'x264', 'x265', 'h264', 'h265', 'hevc', 'avc', 'vp9', 'av1',
        'webrip', 'web-dl', 'web dl', 'bluray', 'bdrip', 'brrip', 'dvdrip', 'dvdscr', 'hdtv', 'pdtv', 'dsr',
        'softsub', 'hardsub', 'dubbed', 'subbed', 'dub', 'sub',
        'donyayeserial', 'donyaye serial', 'donyaye', 'dlcenter', 'dl center',
        'yts', 'yify', 'ettv', 'rargb', 'rargbt', 'eztv', 'amzn', 'nf', 'hulu', 'dsnp',
        'repack', 'proper', 'rerip', 'extended', 'uncut', 'directors cut', 'theatrical cut',
        'dts', 'ac3', 'aac', 'ddp5 1', 'dd5 1', '5 1', '7 1',
        'hdr', 'hdr10', 'hdr10plus', 'dolby vision', 'dv', 'atmos',
        'xvid', 'divx', 'mpeg2',
        'yuv420p', 'yuv444p', '10bit', '8bit',
        'aac2 0', 'aac', 'opus', 'flac',
        'h 264', 'h 265', 'x 264', 'x 265',
        'web', 'dl', 'rip', 'bluray', 'dvd', 'hd', 'sd'
      ];
      
      // Remove terms by replacing them with spaces
      removeTerms.forEach(term => {
        const lowerTerm = term.toLowerCase();
        let index = name.toLowerCase().indexOf(lowerTerm);
        while (index !== -1) {
          // Check word boundaries
          const before = index > 0 ? name[index - 1] : ' ';
          const after = index + lowerTerm.length < name.length ? name[index + lowerTerm.length] : ' ';
          if (/[^a-zA-Z0-9]/.test(before) && /[^a-zA-Z0-9]/.test(after)) {
            name = name.substring(0, index) + ' ' + name.substring(index + lowerTerm.length);
            index = name.toLowerCase().indexOf(lowerTerm, index);
          } else {
            index = name.toLowerCase().indexOf(lowerTerm, index + 1);
          }
        }
      });
      
      // Remove extra spaces, dots, underscores, brackets, parentheses
      name = name.replace(/[._()\\[\\]-]/g, ' ');
      name = name.replace(/\\s+/g, ' ').trim();
      
      // Remove leading/trailing junk
      name = name.replace(/^\\s*[\\|\\-:;,]\\s*/, '');
      name = name.replace(/\\s*[\\|\\-:;,]\\s*$/, '');
      
      // Capitalize first letter of each word
      name = name.toLowerCase().replace(/\\b\\w/g, char => char.toUpperCase());
      
      return name;
    }

    function resolveSmartChannelName(url, providedName) {
      let cleanProvided = cleanVideoFilename(providedName || '');
      
      // Try to extract name from URL filename
      try {
        const parsed = new URL(url);
        const pathParts = parsed.pathname.split('/');
        let filename = pathParts[pathParts.length - 1] || '';
        if (!filename && pathParts.length > 1) {
          filename = pathParts[pathParts.length - 2];
        }
        if (filename) {
          try {
            filename = decodeURIComponent(filename);
          } catch(e) {}
          filename = filename.split('?')[0];
          
          let cleanUrlName = cleanVideoFilename(filename);
          if (cleanUrlName && cleanUrlName.length > 2) {
            // Check if cleanProvided is just tech jargon (e.g. starts with numbers/specs or contains no actual name words)
            const isGeneric = /^(1080p|720p|480p|2160p|web|dl|x264|x265|hevc|softsub|hardsub|dubbed|donyayeserial|mkv|mp4|avi|mov|stream|direct|channel|tv|live)/i.test(cleanProvided.toLowerCase()) || 
                              cleanProvided.length < 3 ||
                              cleanProvided.toLowerCase() === 'softsub donyayeserial' ||
                              cleanProvided.toLowerCase() === 'donyayeserial';
            
            if (isGeneric || (cleanUrlName.includes(' ') && !cleanProvided.includes(' '))) {
              return cleanUrlName;
            }
            return cleanProvided;
          }
        }
      } catch(e) {}
      
      return cleanProvided || providedName || 'جریان مستقیم';
    }

    function extractChannelNameFromUrl(url) {
      const lowercaseUrl = url.toLowerCase();
      if (lowercaseUrl.includes('iranintl') || lowercaseUrl.includes('iran-intl') || lowercaseUrl.includes('ایران اینترنشنال')) {
        return 'ایران اینترنشنال';
      }
      if (lowercaseUrl.includes('manoto') || lowercaseUrl.includes('منوتو')) {
        return 'منوتو';
      }
      if (lowercaseUrl.includes('bbc') || lowercaseUrl.includes('بی‌بی‌سی')) {
        return 'BBC Persian';
      }
      if (lowercaseUrl.includes('voa') || lowercaseUrl.includes('صدای آمریکا')) {
        return 'VOA Persian';
      }
      if (lowercaseUrl.includes('gem') || lowercaseUrl.includes('جم')) {
        return 'شبکه جم';
      }
      if (lowercaseUrl.includes('mtv') || lowercaseUrl.includes('ام تی وی')) {
        return 'MTV ایران';
      }
      if (lowercaseUrl.includes('tmn') || lowercaseUrl.includes('تی ام ان')) {
        return 'TMN';
      }
      if (lowercaseUrl.includes('aparat') || lowercaseUrl.includes('آپارات')) {
        return 'آپارات';
      }
      if (lowercaseUrl.includes('namava') || lowercaseUrl.includes('نماوا')) {
        return 'نماوا';
      }
      if (lowercaseUrl.includes('filimo') || lowercaseUrl.includes('فیلیمو')) {
        return 'فیلیمو';
      }
      
      // Extract filename from URL
      try {
        const parsed = new URL(url);
        const pathname = parsed.pathname;
        const segments = pathname.split('/');
        let lastSegment = segments.pop() || '';
        if (!lastSegment && segments.length > 0) {
          lastSegment = segments.pop();
        }
        if (lastSegment) {
          try {
            lastSegment = decodeURIComponent(lastSegment);
          } catch (e) {}
          lastSegment = lastSegment.split('?')[0];
          
          // Clean video filename
          const cleanedName = cleanVideoFilename(lastSegment);
          if (cleanedName && cleanedName.length > 2) {
            return cleanedName;
          }
        }
      } catch(e) {}
      
      return '';
    }

    async function testChannelPing(chUrl, btn) {
      btn.className = 'ping-btn loading';
      btn.textContent = '...';
      
      const start = performance.now();
      const testUrl = '/proxy?url=' + encodeURIComponent(chUrl);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      
      try {
        const response = await fetch(testUrl, {
          method: 'GET',
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        const duration = Math.round(performance.now() - start);
        
        if (response.ok) {
          btn.className = 'ping-btn success';
          btn.textContent = duration + 'ms';
        } else {
          btn.className = 'ping-btn error';
          btn.textContent = 'Error ' + response.status;
        }
      } catch (e) {
        clearTimeout(timeoutId);
        btn.className = 'ping-btn error';
        btn.textContent = 'Offline';
      }
    }

    function getPlaylistNameFromUrl(url, fallbackCount) {
      try {
        const parsed = new URL(url);
        const pathname = parsed.pathname;
        const segments = pathname.split('/');
        let lastSegment = segments.pop() || '';
        if (!lastSegment && segments.length > 0) {
          lastSegment = segments.pop();
        }
        if (lastSegment) {
          try {
            lastSegment = decodeURIComponent(lastSegment);
          } catch (e) {}
          lastSegment = lastSegment.split('?')[0];
          const nameWithoutExt = lastSegment.replace(/\.(m3u8?|txt|list|cfg|json)$/i, '');
          if (nameWithoutExt.trim().length > 1) {
            return nameWithoutExt.trim();
          }
        }
      } catch (e) {}
      return 'لیست آنلاین ' + fallbackCount;
    }

    async function loadPlaylistFromUrl(url) {
      updateStatus('در حال بارگیری لیست از سرور...');
      try {
        const response = await fetch('/api/parse', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ url })
        });
        
        let data;
        if (!response.ok) {
          const serverErrData = await response.json().catch(() => ({}));
          const errMsg = serverErrData.error || 'سرور پلی‌لیست را لود نکرد';
          
          // Fallback 1: Try api.allorigins.win (Bypasses browser Mixed Content block and Cloudflare IP block)
          updateStatus('سرور کلادفلر مسدود شد. در حال تلاش برای بارگیری از پروکسی کمکی کلاینت...');
          try {
            const allOriginsUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url);
            const clientRes = await fetch(allOriginsUrl);
            if (!clientRes.ok) throw new Error('HTTP Status ' + clientRes.status);
            const text = await clientRes.text();
            updateStatus('لیست با موفقیت دریافت شد. در حال پردازش در سرور...');
            
            const file = new File([text], 'remote_playlist.m3u', { type: 'text/plain' });
            await loadPlaylistFromFile(file);
            return;
          } catch (proxyErr) {
            // Fallback 2: Direct browser fetch (works only if URL is HTTPS and CORS is open)
            updateStatus('پروکسی کمکی خطا داد. در حال تلاش برای دانلود مستقیم در مرورگر...');
            try {
              const clientRes = await fetch(url);
              if (!clientRes.ok) throw new Error('HTTP Status ' + clientRes.status);
              const text = await clientRes.text();
              updateStatus('لیست دانلود شد. در حال پردازش در سرور...');
              
              const file = new File([text], 'remote_playlist.m3u', { type: 'text/plain' });
              await loadPlaylistFromFile(file);
              return;
            } catch (clientErr) {
              throw new Error(errMsg + ' (بارگیری کمکی و مستقیم مرورگر مسدود شدند. لطفا فایل را دستی دانلود و آپلود کنید.)');
            }
          }
        } else {
          data = await response.json();
        }
        
        const customList = JSON.parse(localStorage.getItem('iptv-custom-channels-v2') || '[]');
        appState.channels = [...customList, ...data.channels];
        appState.activeGroup = '__all__';
        appState.showFavoritesOnly = false;
        
        updateStatus('تعداد ' + data.count + ' کانال با موفقیت لود شد.');
        updateStatistics();
        renderGroupTabs();
        renderChannelsList();

        // Save locally to savedPlaylists list
        const plName = data.playlistName || getPlaylistNameFromUrl(url, appState.savedPlaylists.length + 1);
        const newPlay = {
          id: Date.now(),
          name: plName,
          url: url,
          channels: data.channels
        };
        appState.savedPlaylists = appState.savedPlaylists.filter(p => p.url !== url);
        appState.savedPlaylists.push(newPlay);
        localStorage.setItem('iptv-saved-playlists-v2', JSON.stringify(appState.savedPlaylists));
      } catch (err) {
        updateStatus('خطا در بارگیری: ' + err.message);
      }
    }

    async function loadPlaylistFromFile(file) {
      updateStatus('در حال پردازش فایل پلی‌لیست...');
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/parse', {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'فایل خوانده نشد');
        
        const customList = JSON.parse(localStorage.getItem('iptv-custom-channels-v2') || '[]');
        appState.channels = [...customList, ...data.channels];
        appState.activeGroup = '__all__';
        appState.showFavoritesOnly = false;
        
        updateStatus('تعداد ' + data.count + ' کانال با موفقیت از فایل لود شد.');
        updateStatistics();
        renderGroupTabs();
        renderChannelsList();

        // Save locally to savedPlaylists list
        const newPlay = {
          id: Date.now(),
          name: file.name,
          url: '',
          channels: data.channels
        };
        appState.savedPlaylists.push(newPlay);
        localStorage.setItem('iptv-saved-playlists-v2', JSON.stringify(appState.savedPlaylists));
      } catch (err) {
        updateStatus('خطا در پردازش فایل: ' + err.message);
      }
    }

    function updateExternalPlayerLinks(url) {
      const container = getEl('externalPlayerControls');
      const vlc = getEl('vlcLink');
      const copyBtn = getEl('copyStreamUrlBtn');
      
      const errorContainer = getEl('errorExternalPlayerBox');
      const errorVlc = getEl('errorVlcLink');
      const errorCopyBtn = getEl('errorCopyUrlBtn');
      
      if (!url || url === 'No Stream Active' || url.startsWith('magnet:')) {
        container.style.display = 'none';
        errorContainer.style.display = 'none';
        return;
      }
      
      // Build absolute playable URL using worker proxy if enabled (preserves CORS/proxy settings)
      const playableUrl = appState.proxyEnabled
        ? new URL('/proxy?url=' + encodeURIComponent(url), window.location.origin).href
        : url;
        
      // Determine URL schemes based on platform
      const isIOS = /iPad|iPhone|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isAndroid = /Android/i.test(navigator.userAgent);
      
      let vlcUrl = 'vlc://' + playableUrl;
      if (isIOS) {
        vlcUrl = 'vlc-x-callback://x-callback-url/stream?url=' + encodeURIComponent(playableUrl);
      } else if (isAndroid) {
        const urlObj = new URL(playableUrl);
        const urlWithoutProto = urlObj.host + urlObj.pathname + urlObj.search;
        const scheme = urlObj.protocol.replace(':', '');
        vlcUrl = 'intent://' + urlWithoutProto + '#Intent;scheme=' + scheme + ';package=org.videolan.vlc;action=android.intent.action.VIEW;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dorg.videolan.vlc;end';
      }
      
      vlc.href = vlcUrl;
      errorVlc.href = vlcUrl;
      
      // Copy-to-clipboard logic
      const copyToClipboard = async (btn) => {
        try {
          await navigator.clipboard.writeText(playableUrl);
          const orig = btn.innerHTML;
          btn.innerHTML = '✅ کپی شد';
          btn.style.background = 'rgba(16,185,129,0.3)';
          setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; }, 2000);
          updateStatus('لینک استریم (با تنظیمات پروکسی) در کلیپ‌بورد کپی شد. آن را در VLC پیست کنید.');
        } catch (e) {
          const ta = document.createElement('textarea');
          ta.value = playableUrl;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          const orig = btn.innerHTML;
          btn.innerHTML = '✅ کپی شد';
          setTimeout(() => { btn.innerHTML = orig; }, 2000);
          updateStatus('لینک استریم در کلیپ‌بورد کپی شد. آن را در VLC پیست کنید.');
        }
      };
      
      copyBtn.onclick = (e) => { e.preventDefault(); copyToClipboard(copyBtn); };
      errorCopyBtn.onclick = (e) => { e.preventDefault(); copyToClipboard(errorCopyBtn); };
      
      container.style.display = 'flex';
      
      // Show the quick launch error box for unsupported formats on mobile devices
      const urlLower = url.toLowerCase();
      const isUnsupportedFormat = urlLower.includes('.mkv') || urlLower.includes('.avi') || urlLower.includes('.webm') || urlLower.includes('.flv');
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isUnsupportedFormat && isMobile) {
        errorContainer.style.display = 'flex';
      } else {
        errorContainer.style.display = 'none';
      }
    }

    function playChannel(ch) {
      appState.activeStreamUrl = ch.url;
      getEl('currentStreamTitle').textContent = ch.name;
      getEl('currentStreamSub').textContent = 'دسته‌بندی: ' + (ch.group || 'دسته‌بندی نشده');
      
      getEl('bannerTitle').textContent = ch.name;
      getEl('bannerUrl').textContent = ch.url;
      updateExternalPlayerLinks(ch.url);
      
      // iOS MKV redirection logic
      const isIOS = /iPad|iPhone|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const urlLower = ch.url.toLowerCase();
      const isUnsupportedIOSFormat = urlLower.includes('.mkv') || urlLower.includes('.avi') || urlLower.includes('.webm') || urlLower.includes('.flv');
      
      if (isIOS && isUnsupportedIOSFormat) {
        // Build absolute playable URL using worker proxy if enabled
        const playableUrl = appState.proxyEnabled
          ? new URL('/proxy?url=' + encodeURIComponent(ch.url), window.location.origin).href
          : ch.url;
          
        const vlcUrl = 'vlc-x-callback://x-callback-url/stream?url=' + encodeURIComponent(playableUrl);
        
        // Show redirect message overlay
        showPlayerError('فرمت این ویدیو توسط آیفون پشتیبانی نمی‌شود. در حال انتقال خودکار به اپلیکیشن VLC (مطمئن شوید VLC نصب است)...');
        
        // Add a prompt/button in case redirect is blocked
        const errorMsgEl = getEl('playerErrorMessage');
        errorMsgEl.innerHTML = 'فرمت این ویدیو توسط آیفون پشتیبانی نمی‌شود.<br>' +
          '<strong style="color:#ef4444;">در حال انتقال خودکار به VLC...</strong><br><br>' +
          '<span style="font-size:11.5px; color:#9ca3af;">(اگر پیغام خطا دریافت کردید، مطمئن شوید اپلیکیشن VLC را از App Store نصب کرده‌اید)</span><br><br>' +
          'اگر انتقال خودکار انجام نشد، دکمه‌های زیر را بزنید:<br><br>' +
          '<a href="' + vlcUrl + '" class="btn" style="padding:6px 18px; font-size:12px; background:#f97316; border:none; text-decoration:none; display:inline-flex; align-items:center; gap:6px; border-radius:6px; color:#fff;">🍊 باز کردن در VLC</a>' +
          '<button id="errorRedirectCopyBtn" class="btn" style="padding:6px 18px; font-size:12px; background:#10b981; border:none; color:#fff; margin-right:8px; border-radius:6px; cursor:pointer;">📋 کپی لینک</button>';
        
        const copyToClipboardDirect = async (text) => {
          try {
            await navigator.clipboard.writeText(text);
            updateStatus('لینک استریم در کلیپ‌بورد کپی شد.');
          } catch (e) {
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            updateStatus('لینک استریم در کلیپ‌بورد کپی شد.');
          }
        };
        
        getEl('errorRedirectCopyBtn').onclick = (e) => {
          e.preventDefault();
          copyToClipboardDirect(playableUrl);
        };
        
        // Hide native player and show overlay
        getEl('iptvVideoPlayer').style.display = 'none';
        getEl('playerPlaceholder').style.display = 'none';
        getEl('playerErrorOverlay').style.display = 'flex';
        
        // Perform auto-redirect
        setTimeout(() => {
          window.location.href = vlcUrl;
        }, 1500);
        
        renderChannelsList();
        return; // Stop execution, do not try to play in browser
      }
      
      const realStreamUrl = appState.proxyEnabled ? '/proxy?url=' + encodeURIComponent(ch.url) : ch.url;
      executeVideoPlayback(realStreamUrl, ch.url);
      renderChannelsList();
    }

    function executeVideoPlayback(playableUrl, originalUrl) {
      const video = getEl('iptvVideoPlayer');
      updateStatus('در حال آماده‌سازی پلیر...');
      hidePlayerError();
      getEl('playerPlaceholder').style.display = 'none';
      video.style.display = 'block';
      
      if (appState.hlsInstance) {
        appState.hlsInstance.destroy();
        appState.hlsInstance = null;
      }
      
      video.pause();
      video.removeAttribute('src');
      video.load();

      video.onerror = () => {
        if (video.error) {
          let msg = 'اتصال مستقیم برقرار نشد. احتمالاً نیاز به فعال‌سازی پروکسی CORS دارید یا آدرس مسدود شده است.';
          if (video.error.code === 4) {
            msg = 'فرمت ویدیو پشتیبانی نمی‌شود یا گواهی امنیتی SSL سرور میزبان باطل شده است (ERR_CERT_REVOKED).';
          }
          showPlayerError(msg);
        }
      };

      // Detection for HLS stream
      const isHls = playableUrl.toLowerCase().includes('.m3u8') || originalUrl.toLowerCase().includes('.m3u8');

      if (window.Hls && Hls.isSupported() && isHls) {
        appState.hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          maxBufferSize: 60 * 1024 * 1024,
          liveSyncDurationCount: 3,
          progressive: false,
          nudgeMaxRetries: 10,
          nudgeDelay: 0.5,
          xhrSetup: function(xhr, url) {
            xhr.withCredentials = false;
          }
        });
        appState.hlsInstance.loadSource(playableUrl);
        appState.hlsInstance.attachMedia(video);
        
        appState.hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
          updateStatus('در حال پخش جریان HLS...');
          video.play().catch(e => {
            updateStatus('مرورگر پخش خودکار را متوقف کرد. کلید Play را فشار دهید.');
          });
        });

        appState.hlsInstance.on(Hls.Events.ERROR, function (event, data) {
          if (data.fatal) {
            switch(data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                updateStatus('خطای شبکه HLS. تلاش برای فعال‌سازی پروکسی...');
                // Fallback automatically to proxy if not already on proxy
                if (!appState.proxyEnabled && !playableUrl.startsWith('/proxy')) {
                  const fallbackUrl = '/proxy?url=' + encodeURIComponent(originalUrl);
                  console.log("HLS Network Error, falling back to proxy:", fallbackUrl);
                  executeVideoPlayback(fallbackUrl, originalUrl);
                } else {
                  updateStatus('خطای شبکه بحرانی در دریافت ویدیو.');
                  showPlayerError('خطای شبکه دیتای جریان ویدیو. سرور پاسخ نمی‌دهد یا پروکسی کلادفلر مسدود شده است.');
                }
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                updateStatus('خطای رسانه در دیکود فایل. در حال تلاش برای بازسازی...');
                appState.hlsInstance.recoverMediaError();
                break;
              default:
                updateStatus('عدم امکان اجرای ویدیو به علت خطای غیرمنتظره.');
                break;
            }
          }
        });
      } else {
        // Native browser player fallback (For MP4, WebM, or Safari native HLS)
        video.src = playableUrl;
        video.play()
          .then(() => updateStatus('در حال پخش مستقیم...'))
          .catch(err => {
            updateStatus('برای شروع جریان، دکمه پخش پلیر را فشار دهید.');
          });
      }
    }

    function showPlayerError(msg) {
      getEl('playerErrorOverlay').style.display = 'flex';
      getEl('playerErrorMessage').textContent = msg;
    }

    function hidePlayerError() {
      getEl('playerErrorOverlay').style.display = 'none';
    }

    window.retryCurrentPlayback = function() {
      if (appState.activeStreamUrl) {
        hidePlayerError();
        const realStreamUrl = appState.proxyEnabled ? '/proxy?url=' + encodeURIComponent(appState.activeStreamUrl) : appState.activeStreamUrl;
        executeVideoPlayback(realStreamUrl, appState.activeStreamUrl);
      }
    };

    window.hidePlayerError = hidePlayerError;

    // Torrent WebTorrent Integration
    function cleanupActiveTorrent() {
      if (torrentClient) {
        try {
          updateTorrentStatus('در حال بستن کلاینت قبلی...');
          torrentClient.destroy();
        } catch (e) {
          console.error("Error destroying client:", e);
        }
        torrentClient = null;
      }
      getEl('torrentDashboard').style.display = 'none';
      getEl('torrentFileExplorerContainer').innerHTML = '';
    }

    function playTorrentCloud(magnetUrl) {
      cleanupActiveTorrent();
      getEl('torrentDashboard').style.display = 'block';
      getEl('currentStreamTitle').textContent = 'پلیر اختصاصی تورنت YTS';
      getEl('currentStreamSub').textContent = 'پخش ابری داخل رابط اختصاصی Worker';
      getEl('bannerTitle').textContent = 'Torrent Cloud Player';
      getEl('bannerUrl').textContent = magnetUrl;
      updateExternalPlayerLinks(magnetUrl);
      const nativeVideo = getEl('iptvVideoPlayer');
      if (nativeVideo && typeof nativeVideo.pause === 'function') nativeVideo.pause();
      nativeVideo.style.display = 'none';

      const container = getEl('webtorPlayerContainer');
      container.style.display = 'block';
      container.innerHTML = '<div style="padding:24px;color:#e5e7eb;text-align:center">در حال بارگذاری پلیر ابری تورنت...</div>';

      updateCloudTorrentMetrics(magnetUrl);

      function initWebtor() {
        window.webtor = window.webtor || [];
        container.innerHTML = '';
        window.webtor.push({
          id: 'webtorPlayerContainer',
          magnet: magnetUrl,
          width: '100%',
          height: '430px',
          controls: true,
          lang: 'fa',
          i18n: { en: { common: { "prepare to play": "در حال آماده‌سازی پخش" } } },
          on: function(e) {
            if (!e || !e.name) return;
            if (e.name === 'prepared') updateTorrentStatus('فایل آماده پخش است. دکمه Play را بزنید.');
            if (e.name === 'error') updateTorrentStatus('خطای پلیر ابری: اگر فایل کمیاب است چند دقیقه صبر کنید یا تورنت دیگری تست کنید.');
          }
        });
        updateTorrentStatus('تورنت به پلیر ابری ارسال شد. برای YTS این روش درست است چون UDP/TCP سمت سرور انجام می‌شود.');
      }

      // Lazy-load Webtor SDK only when needed
      if (window.webtor && window.webtor._loaded) {
        initWebtor();
      } else {
        const sdkScript = document.createElement('script');
        sdkScript.src = 'https://cdn.jsdelivr.net/npm/@webtor/embed-sdk-js/dist/index.min.js';
        sdkScript.charset = 'utf-8';
        sdkScript.onload = function() {
          window.webtor = window.webtor || [];
          window.webtor._loaded = true;
          initWebtor();
        };
        sdkScript.onerror = function() {
          container.innerHTML = '<div style="padding:24px;color:#f87171;text-align:center">خطا در بارگذاری پلیر ابری. لطفاً دوباره تلاش کنید.</div>';
          updateTorrentStatus('خطا در بارگذاری SDK پلیر ابری.');
        };
        document.head.appendChild(sdkScript);
      }
    }

    function initAndStreamTorrent(torrentIdentifier) {
      cleanupActiveTorrent();
      getEl('iptvVideoPlayer').style.display = 'block';
      getEl('webtorPlayerContainer').style.display = 'none';
      getEl('webtorPlayerContainer').innerHTML = '';
      if (!window.WebTorrent) {
        updateTorrentStatus('WebTorrent مرورگر هنوز لود نشده است. این حالت فقط برای تورنت‌های WebRTC مناسب است، نه YTS.');
      }
      
      getEl('torrentDashboard').style.display = 'block';
      updateTorrentStatus('در حال اتصال به شبکه تورنت و یافتن پیرها...');
      getEl('torrentProgressFill').style.width = '0%';
      getEl('valTorrentProgress').textContent = '0%';
      getEl('valTorrentPeers').textContent = '0';
      getEl('valTorrentDownSpeed').textContent = '0 B/s';
      getEl('valTorrentUpSpeed').textContent = '0 B/s';
      
      // Only WSS trackers work in browser (UDP/TCP are blocked by browser security)
      const webrtcTrackers = [
        'wss://tracker.openwebtorrent.com',
        'wss://tracker.btorrent.xyz',
        'wss://tracker.webtorrent.dev'
      ];

      const torrentOptions = {
        announce: webrtcTrackers
      };

      torrentClient = new WebTorrent();
      
      torrentClient.add(torrentIdentifier, torrentOptions, function(torrent) {
        updateTorrentStatus('دریافت متادیتا انجام شد. آنالیز فایل‌های ویدیویی...');
        
        // Filter out playable video files
        const videoExtensions = ['.mp4', '.mkv', '.avi', '.webm', '.mov', '.m4v', '.ts', '.mp3', '.wav'];
        const files = torrent.files.filter(f => videoExtensions.some(ext => f.name.toLowerCase().endsWith(ext)));

        if (!files.length) {
          updateTorrentStatus('هیچ فایل ویدیویی یا صوتی قابل پخشی در تورنت یافت نشد.');
          return;
        }

        // Render multi-file Explorer in UI
        const fileExplorer = getEl('torrentFileExplorerContainer');
        fileExplorer.innerHTML = '';
        
        files.forEach((file, index) => {
          const row = document.createElement('div');
          row.className = 'torrent-file-row';
          row.id = \`torrent-file-\${index}\`;

          const name = document.createElement('span');
          name.className = 'torrent-file-name';
          name.textContent = file.name;

          const size = document.createElement('span');
          size.className = 'torrent-file-size';
          size.textContent = formatBytes(file.length);

          const playBtn = document.createElement('button');
          playBtn.className = 'btn torrent-play-sub-btn';
          playBtn.textContent = 'پخش این فایل';
          playBtn.onclick = () => {
            // Unmark all playing files
            document.querySelectorAll('.torrent-file-row').forEach(el => el.classList.remove('playing'));
            row.classList.add('playing');
            
            getEl('currentStreamTitle').textContent = file.name;
            getEl('currentStreamSub').textContent = \`پخش از تورنت: \${torrent.name}\`;
            
            getEl('bannerTitle').textContent = file.name;
            getEl('bannerUrl').textContent = \`تورنت: \${file.path}\`;

            updateStatus('بافرینگ تورنت شروع شد...');
            
            // Clean HLS
            if (appState.hlsInstance) {
              appState.hlsInstance.destroy();
              appState.hlsInstance = null;
            }
            const video = getEl('iptvVideoPlayer');
            video.pause();
            video.removeAttribute('src');

            file.renderTo(video, { autoplay: true }, function(err) {
              if (err) {
                if (err.message.includes('play()') || err.name === 'NotAllowedError' || err.message.includes('pause()')) {
                  updateTorrentStatus('در حال بافرینگ و استریم تورنت... در صورت عدم پخش خودکار، دکمه Play را بزنید.');
                } else {
                  updateTorrentStatus('خطا در پخش فایل در پلیر: ' + err.message);
                }
              } else {
                updateTorrentStatus('در حال استریم ویدیو از تورنت...');
              }
            });
          };

          row.appendChild(name);
          row.appendChild(size);
          row.appendChild(playBtn);
          fileExplorer.appendChild(row);

          // Auto-play the first/largest file initially
          if (index === 0) {
            playBtn.click();
          }
        });

        // Set tracking interval
        const trackingInterval = setInterval(() => {
          if (!torrentClient || torrent.destroyed) {
            clearInterval(trackingInterval);
            return;
          }

          const progressPct = (torrent.progress * 100).toFixed(1);
          getEl('torrentProgressFill').style.width = progressPct + '%';
          getEl('valTorrentProgress').textContent = progressPct + '%';
          getEl('valTorrentPeers').textContent = torrent.numPeers;
          getEl('valTorrentDownSpeed').textContent = formatBytes(torrent.downloadSpeed) + '/s';
          getEl('valTorrentUpSpeed').textContent = formatBytes(torrent.uploadSpeed) + '/s';

          if (torrent.progress >= 1.0) {
            updateTorrentStatus('فایل تورنت کاملاً دانلود و آماده است.');
            clearInterval(trackingInterval);
          }
        }, 1000);
      });

      torrentClient.on('error', function(err) {
        updateTorrentStatus('خطای تورنت: ' + err.message);
      });
    }

    function formatBytes(bytes) {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // UI Event Listeners
    getEl('playlistUrlForm').onsubmit = e => {
      e.preventDefault();
      const url = getEl('playlistInputUrl').value.trim();
      if (url) {
        loadPlaylistFromUrl(url);
      }
    };

    getEl('playlistFileInput').onchange = e => {
      const file = e.target.files[0];
      if (file) {
        loadPlaylistFromFile(file);
      }
    };

    getEl('searchChannelInput').oninput = e => {
      appState.searchQuery = e.target.value;
      appState.renderLimit = 50;
      renderChannelsList();
      renderGroupTabs();
    };

    getEl('tabAllBtn').onclick = () => {
      appState.activeTab = 'channels';
      setFilterMode('all');
      appState.renderLimit = 50;
      renderChannelsList();
    };

    getEl('tabFavsBtn').onclick = () => {
      appState.activeTab = 'channels';
      setFilterMode('favs');
      appState.renderLimit = 50;
      renderChannelsList();
    };

    getEl('tabPlaylistsBtn').onclick = () => {
      appState.activeTab = 'playlists';
      setFilterMode('playlists');
      renderSavedPlaylistsList();
    };

    getEl('clearPlaylistBtn').onclick = () => {
      if (!confirm('همه کانال‌ها و پلی‌لیست‌ها پاک و از ذخیره ابری هم حذف شوند؟')) return;
      appState.channels = [];
      localStorage.setItem('iptv-custom-channels-v2', '[]');
      appState.savedPlaylists = [];
      localStorage.setItem('iptv-saved-playlists-v2', '[]');
      fetch('/api/sync/clear-playlist', { method: 'POST' }).catch(() => {});
      appState.activeGroup = '__all__';
      appState.showFavoritesOnly = false;
      appState.activeStreamUrl = null;
      if (appState.hlsInstance) {
        appState.hlsInstance.destroy();
        appState.hlsInstance = null;
      }
      getEl('iptvVideoPlayer').style.display = 'none';
      getEl('iptvVideoPlayer').removeAttribute('src');
      getEl('iptvVideoPlayer').load();
      getEl('playerPlaceholder').style.display = 'flex';
      getEl('currentStreamTitle').textContent = 'هیچ کانالی انتخاب نشده است';
      getEl('currentStreamSub').textContent = 'برای پخش، یک لینک مستقیم اضافه کنید یا پلی‌لیست را ایمپورت کنید.';
      hidePlayerError();
      updateStatus('همه کانال‌ها و پلی‌لیست‌ها پاک و از ذخیره ابری حذف شدند.');
      updateStatistics();
      renderGroupTabs();
      if (appState.activeTab === 'playlists') {
        renderSavedPlaylistsList();
      } else {
        renderChannelsList();
      }
    };

    getEl('proxyToggleSwitch').onchange = e => {
      appState.proxyEnabled = e.target.checked;
      localStorage.setItem('proxy-enabled-v2', JSON.stringify(appState.proxyEnabled));
      
      // If playing a stream, re-play with/without proxy
      if (appState.activeStreamUrl) {
        updateStatus('تغییر وضعیت پروکسی... بارگذاری مجدد جریان.');
        const realStreamUrl = appState.proxyEnabled ? '/proxy?url=' + encodeURIComponent(appState.activeStreamUrl) : appState.activeStreamUrl;
        executeVideoPlayback(realStreamUrl, appState.activeStreamUrl);
      }
    };



    getEl('directStreamForm').onsubmit = async e => {
      e.preventDefault();
      const url = getEl('directStreamUrlInput').value.trim();
      let displayName = getEl('directStreamNameInput').value.trim();

      if (url) {
        displayName = resolveSmartChannelName(url, displayName);

        // Auto-refine channel name based on URL stream identifier
        const refinedName = extractChannelNameFromUrl(url);
        if (refinedName) {
          if (displayName.startsWith('جریان مستقیم') || displayName === 'ایران' || displayName === 'اینترنشنال' || displayName === 'international') {
            displayName = refinedName;
          }
        }

        const autoLogo = extractLogoAutomatically(url, displayName);

        const newChannel = {
          name: displayName,
          url: url,
          logo: autoLogo,
          group: 'سفارشی'
        };

        const exists = appState.channels.find(ch => ch.url === url);
        if (!exists) {
          appState.channels.unshift(newChannel);
          
          const customList = JSON.parse(localStorage.getItem('iptv-custom-channels-v2') || '[]');
          customList.unshift(newChannel);
          localStorage.setItem('iptv-custom-channels-v2', JSON.stringify(customList));
          persistCustomChannel(newChannel);

          updateStatistics();

          // Async background fetch to search for actual TV channel logo from Wikipedia/Google Images
          fetch('/api/logo-search?q=' + encodeURIComponent(displayName) + '&url=' + encodeURIComponent(url))
            .then(r => r.json())
            .then(res => {
              if (res && res.logo) {
                const chRef = appState.channels.find(ch => ch.url === url);
                if (chRef) {
                  chRef.logo = res.logo;
                  const customs = JSON.parse(localStorage.getItem('iptv-custom-channels-v2') || '[]');
                  const idx = customs.findIndex(c => c.url === url);
                  if (idx !== -1) {
                    customs[idx].logo = res.logo;
                    localStorage.setItem('iptv-custom-channels-v2', JSON.stringify(customs));
                    persistCustomChannel(customs[idx]);
                  }
                  renderChannelsList();
                }
              }
            })
            .catch(err => console.error('Logo search error:', err));
        }

        appState.activeGroup = 'سفارشی';
        appState.showFavoritesOnly = false;
        appState.renderLimit = 50;

        renderGroupTabs();
        renderChannelsList();

        playChannel(exists || newChannel);

        getEl('directStreamUrlInput').value = '';
        getEl('directStreamNameInput').value = '';
        updateStatus('کانال اضافه، در کلادفلر ذخیره و پخش شد.');
      }
    };

    getEl('playTorrentBtn').onclick = () => {
      const target = getEl('torrentUrlInput').value.trim();
      if (target) {
        playTorrentCloud(target);
      }
    };

    getEl('playBrowserTorrentBtn').onclick = async () => {
      const target = getEl('torrentUrlInput').value.trim();
      if (!target) return;
      updateTorrentStatus('در حال بارگذاری WebTorrent مرورگر... توجه: این حالت برای YTS معمولاً کار نمی‌کند.');
      if (!window.WebTorrent) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/npm/webtorrent@latest/webtorrent.min.js';
          s.onload = resolve;
          s.onerror = () => reject(new Error('WebTorrent لود نشد'));
          document.head.appendChild(s);
        }).catch(err => updateTorrentStatus(err.message));
      }
      if (window.WebTorrent) initAndStreamTorrent(target);
    };

    getEl('torrentFileInput').onchange = async e => {
      const file = e.target.files[0];
      if (!file) return;
      
      updateTorrentStatus('در حال آپلود فایل تورنت به ورکر برای استخراج مگنت...');
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/torrent', {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error || 'پاسخ نامعتبر ورکر');
        
        updateTorrentStatus('فایل تورنت پردازش شد. پخش ابری تورنت شروع می‌شود...');
        getEl('torrentUrlInput').value = data.magnet;
        playTorrentCloud(data.magnet);
      } catch (err) {
        updateTorrentStatus('خطای پردازش فایل تورنت: ' + err.message);
      }
    };

    function extractInfoHash(magnetOrUrl) {
      if (!magnetOrUrl) return null;
      const match = magnetOrUrl.match(/btih:([a-fA-F0-9]{40}|[2-7a-zA-Z]{32})/);
      if (match) return match[1].toLowerCase();
      const hexMatch = magnetOrUrl.match(/^[a-fA-F0-9]{40}$/);
      if (hexMatch) return magnetOrUrl.toLowerCase();
      return null;
    }

    async function fetchTorrentPeerMetrics(infoHash) {
      if (!infoHash) return null;
      
      // Try Apibay first
      try {
        const res = await fetch(\`https://apibay.org/q.php?h=\${infoHash}\`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.info_hash && data.info_hash !== '0000000000000000000000000000000000000000') {
            const seeds = parseInt(data.seeders) || 0;
            const peers = parseInt(data.leechers) || 0;
            return { seeds, peers, source: 'Apibay' };
          }
        }
      } catch (e) {
        console.error('Apibay fetch error:', e);
      }
      
      // Try YTS API next
      try {
        const res = await fetch(\`https://yts.mx/api/v2/list_movies.json?query_term=\${infoHash}\`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.data && data.data.movies && data.data.movies.length > 0) {
            const movie = data.data.movies[0];
            const torrent = movie.torrents.find(t => t.hash.toLowerCase() === infoHash.toLowerCase());
            if (torrent) {
              return {
                seeds: parseInt(torrent.seeds) || 0,
                peers: parseInt(torrent.peers) || 0,
                source: 'YTS'
              };
            }
          }
        }
      } catch (e) {
        console.error('YTS API fetch error:', e);
      }
      
      return null;
    }

    async function updateCloudTorrentMetrics(magnetUrl) {
      const infoHash = extractInfoHash(magnetUrl);
      if (!infoHash) return;
      
      getEl('valTorrentProgress').textContent = 'آماده';
      getEl('valTorrentPeers').textContent = '...';
      getEl('valTorrentDownSpeed').textContent = 'ابری';
      getEl('valTorrentUpSpeed').textContent = 'ابری';
      updateTorrentStatus('در حال استعلام وضعیت سیدرها و لیچرها از تراکرها...');
      
      const metrics = await fetchTorrentPeerMetrics(infoHash);
      if (metrics) {
        getEl('valTorrentPeers').textContent = metrics.seeds + ' / ' + metrics.peers;
        updateTorrentStatus('سیدها: ' + metrics.seeds + ' | لیچرها: ' + metrics.peers + ' (دریافت از ' + metrics.source + ')');
      } else {
        getEl('valTorrentPeers').textContent = 'نامشخص';
        updateTorrentStatus('امکان دریافت تعداد سیدرها وجود نداشت. برای فایل‌های جدید عادی است.');
      }
    }

    function compressChannels(channels) {
      if (!Array.isArray(channels)) return [];
      return channels.map(ch => [ch.name, ch.url, ch.logo || '', ch.group || '']);
    }

    function decompressChannels(channels) {
      if (!Array.isArray(channels)) return [];
      return channels.map(ch => {
        if (Array.isArray(ch)) {
          return { name: ch[0], url: ch[1], logo: ch[2], group: ch[3] };
        }
        return ch;
      });
    }

    function extractLogoAutomatically(streamUrl, streamName) {
      const name = (streamName || '').toLowerCase().trim();
      
      const logoMap = [
        { keys: ['iran international', 'ایران اینترنشنال', 'اینترنشنال', 'international'], logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Iran_International_logo.svg/246px-Iran_International_logo.svg.png' },
        { keys: ['manoto', 'منوتو'], logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Manoto_logo.svg/200px-Manoto_logo.svg.png' },
        { keys: ['bbc persian', 'bbc', 'بی بی سی'], logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/BBC_World_News_Persian_logo.svg/250px-BBC_World_News_Persian_logo.svg.png' },
        { keys: ['voa', 'صدای آمریکا'], logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/VOA_Persian_Logo.svg/220px-VOA_Persian_Logo.svg.png' },
        { keys: ['radio javan', 'رادیو جوان', 'rj'], logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Radio_javan_logo.png/200px-Radio_javan_logo.png' },
        { keys: ['pmc', 'پی ام سی'], logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/PMC_TV_logo.png' },
        { keys: ['gem tv', 'gem', 'جم'], logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/GEM_TV_logo.png/200px-GEM_TV_logo.png' },
        { keys: ['varzesh', 'ورزش'], logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/IRIB_Varzesh_logo_2016.svg' },
        { keys: ['nasim', 'نسیم'], logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/IRIB_Nasim_logo.svg' },
        { keys: ['pooya', 'پویا', 'nahal', 'نهال', 'koodak'], logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/IRIB_Koodak_logo_2016.svg' },
        { keys: ['namayesh', 'نمایش'], logo: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/IRIB_Namayesh_logo.svg' },
        { keys: ['tamasha', 'تماشا'], logo: 'https://upload.wikimedia.org/wikipedia/commons/3/36/IRIB_Tamasha_logo.svg' },
        { keys: ['mostanad', 'مستند'], logo: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/IRIB_Mostanad_logo_2016.svg' },
        { keys: ['khabar', 'خبر'], logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/IRIB_Khabar_logo_2016.svg' },
        { keys: ['ifilm', 'آیفیلم', 'ایفیلم'], logo: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/IFilm_logo_2013.svg' },
        { keys: ['irib tv1', 'یک', 'شبکه یک'], logo: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/IRIB_TV1_logo_2016.svg' },
        { keys: ['irib tv2', 'دو', 'شبکه دو'], logo: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/IRIB_TV2_logo_2016.svg' },
        { keys: ['irib tv3', 'سه', 'شبکه سه'], logo: 'https://upload.wikimedia.org/wikipedia/commons/2/27/IRIB_TV3_logo_2016.svg' }
      ];

      for (const entry of logoMap) {
        if (entry.keys.some(key => name.includes(key))) {
          return entry.logo;
        }
      }

      try {
        const parsed = new URL(streamUrl);
        return 'https://www.google.com/s2/favicons?sz=64&domain=' + parsed.hostname;
      } catch (e) {
        return '';
      }
    }

    function persistCustomChannel(channel) {
      return fetch('/api/sync/custom-channels', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(channel)
      }).then(response => {
        if (!response.ok) throw new Error('cloud save failed');
      }).catch(() => {
        updateStatus('ذخیره ابری «' + channel.name + '» انجام نشد. اتصال را بررسی کنید.');
      });
    }

    function removeCustomChannel(url) {
      appState.channels = appState.channels.filter(item => item.url !== url);
      const customs = JSON.parse(localStorage.getItem('iptv-custom-channels-v2') || '[]');
      localStorage.setItem('iptv-custom-channels-v2', JSON.stringify(customs.filter(item => item.url !== url)));
      if (appState.favorites.has(url)) {
        appState.favorites.delete(url);
        saveFavorites();
      }
      updateStatistics();
      renderGroupTabs();
      renderChannelsList();
      updateStatus('کانال حذف و از ذخیره ابری پاک شد.');
      fetch('/api/sync/delete-custom-channel', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url })
      }).catch(() => updateStatus('حذف از ذخیره ابری انجام نشد.'));
    }

    async function fetchChannelLogo(name, url) {
      try {
        const response = await fetch('/api/logo-search?q=' + encodeURIComponent(name) + '&url=' + encodeURIComponent(url || ''));
        const data = await response.json();
        return data && data.logo ? data.logo : '';
      } catch (e) {
        return '';
      }
    }

    function rememberChannelLogo(url, logo) {
      const apply = list => list.map(ch => ch.url === url ? { ...ch, logo } : ch);
      appState.channels = apply(appState.channels);
      const customs = JSON.parse(localStorage.getItem('iptv-custom-channels-v2') || '[]');
      const updated = apply(customs);
      localStorage.setItem('iptv-custom-channels-v2', JSON.stringify(updated));
      renderChannelsList();
      const saved = updated.find(ch => ch.url === url);
      if (saved) persistCustomChannel(saved);
    }

    function repairMissingLogos() {
      for (const ch of appState.channels) {
        if (ch.logo && !ch.logo.includes('favicons')) continue;
        const fallback = extractLogoAutomatically(ch.url, ch.name);
        if (fallback && !fallback.includes('favicons')) {
          rememberChannelLogo(ch.url, fallback);
          continue;
        }
        fetchChannelLogo(ch.name, ch.url).then(logo => {
          if (logo) rememberChannelLogo(ch.url, logo);
        });
      }
    }

    function autoCleanCustomChannels() {
      const customs = JSON.parse(localStorage.getItem('iptv-custom-channels-v2') || '[]');
      let changed = false;
      const cleaned = customs.map(ch => {
        let nameChanged = false;
        let cleanedName = resolveSmartChannelName(ch.url, ch.name);
        
        if (cleanedName !== ch.name) {
          nameChanged = true;
        }
        
        // If logo is empty, or is a favicon, or name changed, trigger search
        const needsLogoSearch = !ch.logo || ch.logo.includes('favicons') || nameChanged;
        
        if (nameChanged || needsLogoSearch) {
          changed = true;
          
          fetch('/api/logo-search?q=' + encodeURIComponent(cleanedName) + '&url=' + encodeURIComponent(ch.url))
            .then(r => r.json())
            .then(res => {
              if (res && res.logo) {
                // Update in active memory
                const chRef = appState.channels.find(c => c.url === ch.url);
                if (chRef) {
                  chRef.logo = res.logo;
                  chRef.name = cleanedName;
                }
                // Save back to local storage
                const latestCustoms = JSON.parse(localStorage.getItem('iptv-custom-channels-v2') || '[]');
                const idx = latestCustoms.findIndex(c => c.url === ch.url);
                if (idx !== -1) {
                  latestCustoms[idx].logo = res.logo;
                  latestCustoms[idx].name = cleanedName;
                  localStorage.setItem('iptv-custom-channels-v2', JSON.stringify(latestCustoms));
                }
                renderChannelsList();
              }
            }).catch(e => console.error(e));
            
          return { ...ch, name: cleanedName };
        }
        return ch;
      });

      if (changed) {
        localStorage.setItem('iptv-custom-channels-v2', JSON.stringify(cleaned));
        
        // Update in appState
        const otherChannels = appState.channels.filter(c => c.group !== 'سفارشی');
        appState.channels = [...cleaned, ...otherChannels];
        renderChannelsList();
      }
    }

    // Load state from localstorage and D1 Database
    async function initRestore() {
      const localFavs = JSON.parse(localStorage.getItem('iptv-favorites-v2') || '[]');
      appState.favorites = new Set(localFavs);
      
      const localCustom = JSON.parse(localStorage.getItem('iptv-custom-channels-v2') || '[]');
      if (localCustom.length > 0) {
        appState.channels = [...localCustom];
      }
      autoCleanCustomChannels();

      const localPlaylists = JSON.parse(localStorage.getItem('iptv-saved-playlists-v2') || '[]');
      appState.savedPlaylists = localPlaylists;
      
      updateStatistics();
      renderGroupTabs();
      renderChannelsList();
      repairMissingLogos();

      try {
        updateStatus('در حال همگام‌سازی با پایگاه داده کلاد... ');
        const res = await fetch('/api/sync');
        if (res.ok) {
          const syncData = await res.json();
          if (syncData.success) {
            if (syncData.favorites) {
              appState.favorites = new Set(syncData.favorites);
              localStorage.setItem('iptv-favorites-v2', JSON.stringify(syncData.favorites));
            }

            const customList = syncData.custom_channels || [];
            localStorage.setItem('iptv-custom-channels-v2', JSON.stringify(customList));
            autoCleanCustomChannels();

            let mergedChannels = [...customList];
            if (syncData.playlists && syncData.playlists.length > 0) {
              const decompressedPlaylists = syncData.playlists.map(pl => ({
                id: pl.id || Date.now() + Math.random(),
                name: pl.name,
                url: pl.url,
                channels: decompressChannels(pl.channels)
              }));
              appState.savedPlaylists = decompressedPlaylists;
              localStorage.setItem('iptv-saved-playlists-v2', JSON.stringify(decompressedPlaylists));

              // Auto-load the first playlist by default
              const firstPl = decompressedPlaylists[0];
              mergedChannels = [...mergedChannels, ...firstPl.channels];

              getEl('currentStreamTitle').textContent = firstPl.name || 'لیست لود شده';
              getEl('currentStreamSub').textContent = firstPl.url || 'محتوای پایگاه داده کلاد';
              getEl('bannerTitle').textContent = firstPl.name || 'IPTV Stream';
              getEl('bannerUrl').textContent = firstPl.url || '';
              updateExternalPlayerLinks(firstPl.url || '');
            } else {
              appState.savedPlaylists = [];
              localStorage.setItem('iptv-saved-playlists-v2', '[]');
            }

            appState.channels = mergedChannels;
            updateStatus('همگام‌سازی با پایگاه داده کلادفلر انجام شد.');
            updateStatistics();
            renderGroupTabs();
            renderChannelsList();
            repairMissingLogos();
          }
        }
      } catch(e) {
        console.error('D1 sync error:', e);
        updateStatus('خطا در همگام‌سازی با سرور. از حافظه محلی استفاده می‌شود.');
      }
    }

    const finderState = { results: [], busy: false };

    function finderChip(text, kind) {
      return '<span class="finder-chip' + (kind ? ' ' + kind : '') + '">' + text + '</span>';
    }

    function renderFinderResults() {
      const box = getEl('finderResults');
      const count = getEl('finderCount');
      if (!finderState.results.length) {
        count.textContent = 'آماده';
        return;
      }
      const online = finderState.results.filter(r => r.status === 'online').length;
      count.textContent = online + ' سالم از ' + finderState.results.length;
      box.innerHTML = '';
      for (const r of finderState.results) {
        const row = document.createElement('article');
        row.className = 'finder-result fade-in';

        const logo = document.createElement('div');
        logo.className = 'finder-logo finder-logo-fallback';
        logo.textContent = (r.title || '?').charAt(0).toUpperCase();
        if (r.logo) {
          const img = document.createElement('img');
          img.className = 'finder-logo';
          img.alt = '';
          img.src = r.logo;
          img.onerror = () => img.replaceWith(logo);
          row.appendChild(img);
        } else {
          row.appendChild(logo);
        }

        const info = document.createElement('div');
        info.style.minWidth = '0';
        const name = document.createElement('div');
        name.className = 'finder-name';
        name.textContent = r.title;
        const meta = document.createElement('div');
        meta.className = 'finder-meta';
        const statusKind = r.status === 'online' ? 'ok' : r.status === 'testing' ? 'warn' : 'bad';
        const statusText = r.status === 'online'
          ? 'سالم · ' + r.pingMs + 'ms'
          : r.status === 'testing' ? 'در حال تست' : 'پاسخ نداد';
        meta.innerHTML = finderChip(statusText, statusKind)
          + (r.quality ? finderChip(r.quality) : '')
          + (r.country ? finderChip(r.country) : '');
        info.appendChild(name);
        info.appendChild(meta);

        const actions = document.createElement('div');
        actions.className = 'finder-actions';
        const playBtn = document.createElement('button');
        playBtn.className = 'btn';
        playBtn.type = 'button';
        playBtn.textContent = 'پخش';
        playBtn.disabled = r.status !== 'online';
        playBtn.onclick = () => playChannel({ name: r.title, url: r.url, group: 'جستجو', logo: r.logo || '' });

        const addBtn = document.createElement('button');
        addBtn.className = 'btn btn-secondary';
        addBtn.type = 'button';
        const already = appState.channels.some(ch => ch.url === r.url);
        addBtn.textContent = already ? 'اضافه شد' : 'افزودن';
        addBtn.disabled = r.status !== 'online' || already;
        addBtn.onclick = () => addFoundChannel(r, addBtn);

        actions.appendChild(playBtn);
        actions.appendChild(addBtn);
        row.appendChild(info);
        row.appendChild(actions);
        box.appendChild(row);
      }
    }

    function addFoundChannel(result, button) {
      const channel = {
        name: result.title,
        url: result.url,
        logo: result.logo || extractLogoAutomatically(result.url, result.title),
        group: 'سفارشی'
      };
      const customs = JSON.parse(localStorage.getItem('iptv-custom-channels-v2') || '[]');
      if (!customs.some(ch => ch.url === channel.url)) {
        customs.unshift(channel);
        localStorage.setItem('iptv-custom-channels-v2', JSON.stringify(customs));
      }
      if (!appState.channels.some(ch => ch.url === channel.url)) {
        appState.channels.unshift(channel);
      }
      updateStatistics();
      renderGroupTabs();
      renderChannelsList();
      button.textContent = 'اضافه شد';
      button.disabled = true;
      updateStatus('«' + channel.name + '» اضافه و در کلادفلر ذخیره شد.');
      persistCustomChannel(channel);
    }

    async function runChannelSearch(event) {
      event.preventDefault();
      if (finderState.busy) return;
      const query = getEl('finderQuery').value.trim();
      const box = getEl('finderResults');
      if (query.length < 2) {
        box.innerHTML = '<div class="finder-empty">حداقل دو حرف بنویس.</div>';
        return;
      }
      finderState.busy = true;
      getEl('finderSubmit').disabled = true;
      getEl('finderCount').textContent = 'جستجو...';
      box.innerHTML = '<div class="finder-empty">در حال پیدا کردن و تست استریم‌ها...</div>';
      try {
        const response = await fetch('/api/search?q=' + encodeURIComponent(query));
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'جستجو ناموفق بود');
        finderState.results = data.results || [];
        if (!finderState.results.length) {
          getEl('finderCount').textContent = 'بدون نتیجه';
          box.innerHTML = '<div class="finder-empty">کانالی با این نام پیدا نشد.</div>';
        } else {
          renderFinderResults();
          updateStatus(data.online + ' استریم سالم از ' + data.total + ' نتیجه پیدا شد.');
        }
      } catch (err) {
        getEl('finderCount').textContent = 'خطا';
        box.innerHTML = '<div class="finder-empty">جستجو انجام نشد: ' + err.message + '</div>';
      } finally {
        finderState.busy = false;
        getEl('finderSubmit').disabled = false;
      }
    }

    getEl('finderForm').addEventListener('submit', runChannelSearch);

    // Mobile tab switching
    window.switchMobileTab = function(tabName) {
      const container = document.querySelector('.app-container');
      container.setAttribute('data-mobile-tab', tabName);
      const navBtns = document.querySelectorAll('.mobile-nav-btn');
      navBtns.forEach(function(btn) {
        btn.classList.toggle('active', btn.getAttribute('data-mobile-tab') === tabName);
      });
    };

    initRestore();
  </script>
</body>
</html>`;

let dbMigrated = false;
let dbMigrationError = null;
let catalogCache = null;
let catalogLoadedAt = 0;

async function loadCatalog() {
  if (catalogCache && Date.now() - catalogLoadedAt < 6 * 60 * 60 * 1000) return catalogCache;
  const [streamsRes, channelsRes, logosRes] = await Promise.all([
    fetch('https://iptv-org.github.io/api/streams.json'),
    fetch('https://iptv-org.github.io/api/channels.json'),
    fetch('https://iptv-org.github.io/api/logos.json')
  ]);
  if (!streamsRes.ok) throw new Error('Catalog unavailable: streams ' + streamsRes.status);
  const streams = await streamsRes.json();
  const channels = channelsRes.ok ? await channelsRes.json() : [];
  const logos = logosRes.ok ? await logosRes.json() : [];
  const logoByChannel = new Map();
  for (const logo of Array.isArray(logos) ? logos : []) {
    if (!logo.channel || !logo.url) continue;
    const current = logoByChannel.get(logo.channel);
    const rank = logoRank(logo);
    if (!current || rank > current.rank) logoByChannel.set(logo.channel, { url: logo.url, rank });
  }
  catalogCache = {
    streams: Array.isArray(streams) ? streams.filter(item => item && item.url && item.title) : [],
    channels: Array.isArray(channels) ? channels : [],
    logoByChannel
  };
  catalogLoadedAt = Date.now();
  return catalogCache;
}

async function testStream(stream, channels) {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  let status = 'offline';
  try {
    const response = await fetch(stream.url, {
      method: 'GET',
      headers: {
        'User-Agent': 'VLC/3.0.20 LibVLC/3.0.20',
        'Accept': 'application/vnd.apple.mpegurl, application/x-mpegURL, */*'
      },
      redirect: 'follow',
      signal: controller.signal
    });
    if (response.ok) {
      const sample = await response.text();
      status = sample.includes('#EXTM3U') ? 'online' : 'offline';
    }
  } catch (e) {
    status = 'offline';
  } finally {
    clearTimeout(timer);
  }

  const meta = channels.find(channel => channel.id === stream.channel) || {};
  const country = Array.isArray(meta.country) ? meta.country[0] : (meta.country || '');
  const catalogLogo = stream.channel && catalogCache ? catalogCache.logoByChannel.get(stream.channel) : null;
  const logo = (catalogLogo && catalogLogo.url) || (status === 'online' ? await lookupLogo(stream.title) : '');
  return {
    title: stream.title,
    url: stream.url,
    quality: stream.quality || '',
    country: typeof country === 'string' ? country : '',
    logo,
    status,
    pingMs: Date.now() - started
  };
}

function logoRank(logo) {
  const area = (Number(logo.width) || 0) * (Number(logo.height) || 0);
  const sizeScore = area >= 120 * 60 && area <= 1400 * 700 ? 4 : area > 0 ? 1 : 0;
  return (logo.in_use ? 5 : 0) + (logo.format === 'PNG' ? 2 : 0) + sizeScore;
}

async function lookupLogo(name) {
  try {
    const endpoint = 'https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=thumbnail&pithumbsize=200&generator=search&gsrlimit=1&gsrsearch=' + encodeURIComponent(name);
    const response = await fetch(endpoint, { headers: { 'User-Agent': 'IPTVPlayer/1.0' } });
    if (!response.ok) return '';
    const data = await response.json();
    const pages = data.query && data.query.pages ? Object.values(data.query.pages) : [];
    return pages[0] && pages[0].thumbnail ? pages[0].thumbnail.source : '';
  } catch (e) {
    return '';
  }
}

const GATE_HASH = '8f8c1675b4502e5d0c06b7c31dd1e22f98893de2aa644006acdb72a8586834b8';
const GATE_COOKIE = 'iptv_gate';
const GATE_TTL = 60 * 60 * 24 * 30;

function hexToBytes(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}

function bytesToHex(bytes) {
  return [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sha256Hex(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return bytesToHex(new Uint8Array(digest));
}

function safeEqual(a, b) {
  const left = hexToBytes(a);
  const right = hexToBytes(b);
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i++) diff |= left[i] ^ right[i];
  return diff === 0;
}

async function gateToken() {
  return sha256Hex('iptv-gate-v1:' + GATE_HASH);
}

function readCookie(request, name) {
  const header = request.headers.get('Cookie') || '';
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return '';
}

async function hasGateAccess(request) {
  const given = readCookie(request, GATE_COOKIE);
  if (!given) return false;
  return safeEqual(given, await gateToken());
}

function gatePage(message) {
  const notice = message
    ? '<p class="gate-error">رمز نادرست است. دوباره تلاش کنید.</p>'
    : '';
  const page = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>ورود</title>
  <style>
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    body {
      margin: 0; min-height: 100vh; display: grid; place-items: center;
      font-family: Tahoma, sans-serif; color: #f3f4f6;
      background: radial-gradient(900px 500px at 80% -10%, rgba(59,130,246,.28), transparent 60%),
                  radial-gradient(700px 500px at 0 100%, rgba(139,92,246,.22), transparent 55%), #080710;
    }
    form {
      width: min(420px, calc(100% - 32px)); padding: 32px 28px;
      background: rgba(14,12,28,.94); border: 1px solid rgba(255,255,255,.08);
      border-radius: 24px; box-shadow: 0 24px 70px rgba(0,0,0,.5);
      display: flex; flex-direction: column; gap: 14px;
    }
    .mark { width: 52px; height: 52px; border-radius: 16px; display: grid; place-items: center;
      background: linear-gradient(135deg,#3b82f6,#8b5cf6); font-weight: 900; }
    h1 { margin: 0; font-size: 20px; }
    p { margin: 0; color: #9ca3af; font-size: 13px; line-height: 1.7; }
    input { width: 100%; border: 1px solid rgba(255,255,255,.1); background: rgba(8,7,16,.7);
      color: #fff; border-radius: 14px; padding: 13px 15px; font: inherit; font-size: 15px; }
    input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59,130,246,.16); }
    button { border: 0; border-radius: 14px; padding: 13px; color: #fff; font: inherit; font-weight: 800;
      cursor: pointer; background: linear-gradient(135deg,#3b82f6,#8b5cf6); }
    .gate-error { color: #fca5a5; background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.25);
      border-radius: 12px; padding: 8px 12px; }
  </style>
</head>
<body>
  <form method="POST" action="/login" autocomplete="off">
    <div class="mark">IP</div>
    <h1>ورود به IPTV Studio</h1>
    <p>برای دیدن صفحه و استفاده از پخش، جستجو و پروکسی باید رمز را وارد کنید.</p>
    ${notice}
    <input type="password" name="password" placeholder="رمز عبور" autofocus required>
    <button type="submit">ورود</button>
  </form>
</body>
</html>`;
  return new Response(page, {
    status: message ? 401 : 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex, nofollow'
    }
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/login' && request.method === 'POST') {
      const form = await request.formData().catch(() => null);
      const password = form ? String(form.get('password') || '') : '';
      const passwordHash = await sha256Hex(password);
      if (safeEqual(passwordHash, GATE_HASH)) {
        const token = await gateToken();
        return new Response(null, {
          status: 303,
          headers: {
            'Location': '/',
            'Set-Cookie': `${GATE_COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${GATE_TTL}`
          }
        });
      }
      return gatePage(true);
    }

    if (url.pathname === '/logout') {
      return new Response(null, {
        status: 303,
        headers: {
          'Location': '/',
          'Set-Cookie': `${GATE_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`
        }
      });
    }

    if (!(await hasGateAccess(request))) {
      if (url.pathname.startsWith('/api/') || url.pathname === '/proxy') {
        return json({ error: 'login required' }, 401);
      }
      return gatePage(false);
    }

    // Auto-migrate tables if not exists (runs once per isolate cold start)
    if (!dbMigrated && env.iptv_db) {
      try {
        await env.iptv_db.exec(`CREATE TABLE IF NOT EXISTS custom_channels (url TEXT PRIMARY KEY, name TEXT, logo TEXT, group_name TEXT);`);
        await env.iptv_db.exec(`CREATE TABLE IF NOT EXISTS favorites (url TEXT PRIMARY KEY);`);
        await env.iptv_db.exec(`CREATE TABLE IF NOT EXISTS playlists (id INTEGER PRIMARY KEY, name TEXT, url TEXT, channels_json TEXT);`);
        dbMigrated = true;
        dbMigrationError = null;
      } catch (dbErr) {
        console.error('D1 database migration error:', dbErr);
        dbMigrationError = dbErr.message + '\n' + dbErr.stack;
      }
    }

    // Serves Favicon to avoid 404 console errors
    if (url.pathname === '/favicon.ico' && request.method === 'GET') {
      const svgFavicon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">📺</text></svg>';
      return new Response(svgFavicon, {
        headers: {
          'content-type': 'image/svg+xml',
          'cache-control': 'public, max-age=86400'
        }
      });
    }

    // Serves Front UI
    if (url.pathname === '/' && request.method === 'GET') {
      return new Response(html, {
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
        }
      });
    }

    // Health Check Endpoint
    if (url.pathname === '/api/health' && request.method === 'GET') {
      return json({ status: 'ok', worker: 'IPTV Cloudflare Engine' });
    }

    // Sync state endpoint
    if (url.pathname === '/api/sync' && request.method === 'GET') {
      try {
        if (!env.iptv_db) throw new Error('Database binding missing');
        if (dbMigrationError) throw new Error('D1 Migration Failed: ' + dbMigrationError);
        const customRes = await env.iptv_db.prepare("SELECT * FROM custom_channels").all();
        const custom_channels = (customRes.results || []).map(r => ({
          url: r.url,
          name: r.name,
          logo: r.logo,
          group: r.group_name || 'سفارشی'
        }));

        const favRes = await env.iptv_db.prepare("SELECT url FROM favorites").all();
        const favorites = (favRes.results || []).map(r => r.url);

        const playRes = await env.iptv_db.prepare("SELECT * FROM playlists").all();
        const playlists = (playRes.results || []).map(p => {
          let chList = [];
          try {
            chList = JSON.parse(p.channels_json);
          } catch (e) { }
          return {
            id: p.id,
            name: p.name,
            url: p.url,
            channels: chList
          };
        });

        return json({
          success: true,
          favorites,
          custom_channels,
          playlists
        });
      } catch (e) {
        return json({ success: false, error: e.message, stack: e.stack }, 500);
      }
    }

    // Sync favorites endpoint
    if (url.pathname === '/api/sync/favorites' && request.method === 'POST') {
      try {
        if (!env.iptv_db) throw new Error('Database binding missing');
        const body = await request.json();
        const favorites = body.favorites || [];

        const statements = [
          env.iptv_db.prepare("DELETE FROM favorites")
        ];

        for (const favUrl of favorites) {
          statements.push(env.iptv_db.prepare("INSERT OR IGNORE INTO favorites (url) VALUES (?)").bind(favUrl));
        }

        await env.iptv_db.batch(statements);
        return json({ success: true });
      } catch (e) {
        return json({ success: false, error: e.message }, 500);
      }
    }

    // Sync custom channels endpoint
    if (url.pathname === '/api/sync/custom-channels' && request.method === 'POST') {
      try {
        if (!env.iptv_db) throw new Error('Database binding missing');
        const ch = await request.json();
        if (!ch.url) throw new Error('Missing channel URL');

        await env.iptv_db.prepare(
          "INSERT OR REPLACE INTO custom_channels (url, name, logo, group_name) VALUES (?, ?, ?, ?)"
        ).bind(ch.url, ch.name, ch.logo, ch.group || 'سفارشی').run();

        return json({ success: true });
      } catch (e) {
        return json({ success: false, error: e.message }, 500);
      }
    }

    // Clear custom channels table endpoint (used in Cloud Save transaction)
    if (url.pathname === '/api/sync/clear-custom-channels' && request.method === 'POST') {
      try {
        if (!env.iptv_db) throw new Error('Database binding missing');
        await env.iptv_db.prepare("DELETE FROM custom_channels").run();
        return json({ success: true });
      } catch (e) {
        return json({ success: false, error: e.message }, 500);
      }
    }

    // Clear playlists table endpoint (used in Cloud Save transaction)
    if (url.pathname === '/api/sync/clear-playlists' && request.method === 'POST') {
      try {
        if (!env.iptv_db) throw new Error('Database binding missing');
        await env.iptv_db.prepare("DELETE FROM playlists").run();
        return json({ success: true });
      } catch (e) {
        return json({ success: false, error: e.message }, 500);
      }
    }

    // Sync delete custom channel endpoint
    if (url.pathname === '/api/sync/delete-custom-channel' && request.method === 'POST') {
      try {
        if (!env.iptv_db) throw new Error('Database binding missing');
        const body = await request.json();
        if (!body.url) throw new Error('Missing channel URL');

        await env.iptv_db.prepare("DELETE FROM custom_channels WHERE url = ?").bind(body.url).run();
        return json({ success: true });
      } catch (e) {
        return json({ success: false, error: e.message }, 500);
      }
    }

    // Sync active playlist endpoint
    if (url.pathname === '/api/sync/playlist' && request.method === 'POST') {
      try {
        if (!env.iptv_db) throw new Error('Database binding missing');
        const body = await request.json();
        const name = body.name || 'لیست بدون نام';
        const playlistUrl = body.url || '';
        const channelsJson = JSON.stringify(body.channels || []);

        await env.iptv_db.prepare(
          "INSERT INTO playlists (name, url, channels_json) VALUES (?, ?, ?)"
        ).bind(name, playlistUrl, channelsJson).run();

        return json({ success: true });
      } catch (e) {
        return json({ success: false, error: e.message }, 500);
      }
    }

    // Clear playlist/custom channels endpoint (full purge)
    if (url.pathname === '/api/sync/clear-playlist' && request.method === 'POST') {
      try {
        if (!env.iptv_db) throw new Error('Database binding missing');
        await env.iptv_db.batch([
          env.iptv_db.prepare("DELETE FROM playlists"),
          env.iptv_db.prepare("DELETE FROM custom_channels")
        ]);
        return json({ success: true });
      } catch (e) {
        return json({ success: false, error: e.message }, 500);
      }
    }

    // Live channel search across the iptv-org catalog, with a real stream test
    if (url.pathname === '/api/search' && request.method === 'GET') {
      try {
        const query = (url.searchParams.get('q') || '').trim().toLowerCase();
        if (query.length < 2) return json({ error: 'Query too short' }, 400);
        const words = query.split(/\s+/).filter(Boolean);
        const { streams, channels } = await loadCatalog();

        const scored = [];
        for (const stream of streams) {
          const title = String(stream.title || '');
          const haystack = (title + ' ' + (stream.channel || '')).toLowerCase();
          if (!words.every(word => haystack.includes(word))) continue;
          const exact = title.toLowerCase() === query ? 4 : title.toLowerCase().startsWith(query) ? 2 : 0;
          const qualityRank = { '2160p': 4, '1080p': 3, '720p': 2, '480p': 1 }[stream.quality] || 0;
          const httpsBonus = String(stream.url || '').startsWith('https:') ? 1 : 0;
          scored.push({ stream, score: exact * 10 + qualityRank + httpsBonus });
        }
        scored.sort((a, b) => b.score - a.score);

        const seen = new Set();
        const candidates = [];
        for (const item of scored) {
          if (seen.has(item.stream.url)) continue;
          seen.add(item.stream.url);
          candidates.push(item.stream);
          if (candidates.length === 6) break;
        }

        const tested = await Promise.all(candidates.map(stream => testStream(stream, channels)));
        tested.sort((a, b) => (a.status === 'online' ? 0 : 1) - (b.status === 'online' ? 0 : 1) || a.pingMs - b.pingMs);
        return json({
          query,
          total: tested.length,
          online: tested.filter(item => item.status === 'online').length,
          results: tested
        });
      } catch (e) {
        return json({ error: e.message || 'Search failed' }, 500);
      }
    }

    // Auto-search Logo from Wikipedia, TVmaze & Google Images API
    if (url.pathname === '/api/logo-search' && request.method === 'GET') {
      try {
        const q = url.searchParams.get('q') || '';
        const streamUrl = url.searchParams.get('url') || '';
        if (!q) return json({ logo: '' });

        // Clean query to strip season/episode patterns (e.g. "Cape Fear S01E01" -> "Cape Fear")
        let cleanQ = q.replace(/s\d{1,2}e\d{1,2}/i, '')
          .replace(/season\s*\d+/i, '')
          .replace(/episode\s*\d+/i, '')
          .replace(/\s+/g, ' ')
          .trim();

        // 1. Try TVmaze by IMDB ID first if present in the URL
        let imdbMatch = streamUrl.match(/tt\d{7,10}/);
        if (imdbMatch) {
          try {
            const tvmazeUrl = `https://api.tvmaze.com/lookup/shows?imdb=${imdbMatch[0]}`;
            const res = await fetch(tvmazeUrl);
            if (res.ok) {
              const data = await res.json();
              if (data && data.image && data.image.medium) {
                return json({ logo: data.image.medium });
              }
            }
          } catch (e) { }
        }

        // 2. Try TVmaze single search by show name
        if (cleanQ) {
          try {
            const tvmazeUrl = `https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(cleanQ)}`;
            const res = await fetch(tvmazeUrl);
            if (res.ok) {
              const data = await res.json();
              if (data && data.image && data.image.medium) {
                return json({ logo: data.image.medium });
              }
            }
          } catch (e) { }
        }

        // 3. Try Persian Wikipedia search first (highly accurate for official TV channel logos)
        try {
          const faUrl = `https://fa.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=thumbnail&pithumbsize=300&generator=search&gsrsearch=${encodeURIComponent(cleanQ || q)}&gsrlimit=1`;
          const res = await fetch(faUrl, { headers: { 'User-Agent': 'IPTVPlayer/1.0' } });
          const data = await res.json();
          if (data && data.query && data.query.pages) {
            const pages = Object.values(data.query.pages);
            if (pages.length > 0 && pages[0].thumbnail && pages[0].thumbnail.source) {
              return json({ logo: pages[0].thumbnail.source });
            }
          }
        } catch (e) { }

        // 4. Try English Wikipedia search next
        try {
          const enUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=thumbnail&pithumbsize=300&generator=search&gsrsearch=${encodeURIComponent(cleanQ || q)}&gsrlimit=1`;
          const res = await fetch(enUrl, { headers: { 'User-Agent': 'IPTVPlayer/1.0' } });
          const data = await res.json();
          if (data && data.query && data.query.pages) {
            const pages = Object.values(data.query.pages);
            if (pages.length > 0 && pages[0].thumbnail && pages[0].thumbnail.source) {
              return json({ logo: pages[0].thumbnail.source });
            }
          }
        } catch (e) { }

        // 5. Fallback to Google Images search
        try {
          const searchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent((cleanQ || q) + ' logo png')}`;
          const response = await fetch(searchUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36'
            }
          });
          const html = await response.text();

          const matches = [...html.matchAll(/https:\/\/encrypted-tbn0\.gstatic\.com\/images\?q=tbn:[^"&';\s]+/g)];
          if (matches && matches.length > 0) {
            return json({ logo: matches[0][0] });
          }
        } catch (e) { }

        return json({ logo: '' });
      } catch (e) {
        return json({ success: false, error: e.message, stack: e.stack }, 500);
      }
    }

    // Secure Streaming CORS / Range Proxy
    if (url.pathname === '/proxy' && (request.method === 'GET' || request.method === 'OPTIONS')) {
      return await handleProxy(request);
    }

    // Parsing M3U / M3U8 API
    if (url.pathname === '/api/parse' && request.method === 'POST') {
      try {
        const { playlist, playlistUrl } = await readPlaylist(request);
        const parsed = parseM3U(playlist, playlistUrl);
        return json(parsed);
      } catch (error) {
        return json({ error: error.message || 'M3U Parse failed' }, 400);
      }
    }

    // Torrent parsing logic API (returns magnet & list of files inside .torrent)
    if (url.pathname === '/api/torrent' && request.method === 'POST') {
      try {
        const type = request.headers.get('content-type') || '';
        let torrentBuf;
        if (type.includes('multipart/form-data')) {
          const form = await request.formData();
          const file = form.get('file');
          if (!file || typeof file === 'string') throw new Error('No torrent file uploaded');
          torrentBuf = new Uint8Array(await file.arrayBuffer());
        } else {
          torrentBuf = new Uint8Array(await request.arrayBuffer());
        }
        const magnetData = await torrentToMagnet(torrentBuf);
        return json(magnetData);
      } catch (error) {
        return json({ error: error.message || 'Torrent processing failed' }, 400);
      }
    }

    // 404
    return new Response('Route Not Found', { status: 404 });
  }
};

// CORS Proxy Handler with full Range requests support
async function handleProxy(request) {
  const url = new URL(request.url);
  let targetUrlStr = url.searchParams.get('url');

  if (!targetUrlStr) {
    return new Response('Missing required target "url" query parameter', {
      status: 400,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }

  // De-encode URL if double-encoded
  try {
    targetUrlStr = decodeURIComponent(targetUrlStr);
  } catch (e) { }

  let targetUrl;
  try {
    targetUrl = new URL(targetUrlStr);
  } catch (e) {
    return new Response('Invalid stream target URL structure', {
      status: 400,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }

  // Security: only proxy standard web resources
  if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') {
    return new Response('Only HTTP & HTTPS protocols are supported for proxying', {
      status: 400,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }

  // Handle Options preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '86400',
      }
    });
  }

  // Setup proxy forward headers
  const forwardHeaders = new Headers();

  // Forward browser range headers (CRITICAL for media seekability/seek controls)
  const rangeHeader = request.headers.get('Range');
  if (rangeHeader) {
    forwardHeaders.set('Range', rangeHeader);
  }

  // Desktop user-agent emulation
  forwardHeaders.set('User-Agent', request.headers.get('User-Agent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  forwardHeaders.set('Accept', '*/*');

  // Clean up origin to avoid target rejecting CORS requests
  forwardHeaders.set('Origin', targetUrl.origin);
  forwardHeaders.set('Referer', targetUrl.origin + '/');

  let upstreamResponse;
  let fetchFailed = false;

  try {
    upstreamResponse = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: forwardHeaders,
      redirect: 'follow'
    });

    if (upstreamResponse.status === 525 || upstreamResponse.status === 526 || upstreamResponse.status === 502 || upstreamResponse.status === 530) {
      fetchFailed = true;
    }
  } catch (err) {
    fetchFailed = true;
  }

  if (fetchFailed && targetUrl.protocol === 'https:') {
    try {
      const httpUrl = new URL(targetUrl.toString());
      httpUrl.protocol = 'http:';
      upstreamResponse = await fetch(httpUrl.toString(), {
        method: request.method,
        headers: forwardHeaders,
        redirect: 'follow'
      });
      targetUrl = httpUrl;
    } catch (err2) {
      return new Response('Proxy connection failed (HTTPS/HTTP fallback): ' + err2.message, {
        status: 502,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }
  } else if (fetchFailed) {
    const statusVal = upstreamResponse ? upstreamResponse.status : 502;
    const statusTextVal = upstreamResponse ? upstreamResponse.statusText : 'Connection Error';
    return new Response('Proxy connection failed: ' + statusTextVal, {
      status: statusVal,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    // Construct response headers
    const corsHeaders = new Headers();

    // Copy safe response headers from upstream
    const safeHeaders = [
      'content-type',
      'content-length',
      'content-range',
      'accept-ranges',
      'content-encoding',
      'cache-control',
      'expires'
    ];

    for (const [key, value] of upstreamResponse.headers.entries()) {
      if (safeHeaders.includes(key.toLowerCase())) {
        corsHeaders.set(key, value);
      }
    }

    // Set CORS headers
    corsHeaders.set('Access-Control-Allow-Origin', '*');
    corsHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    corsHeaders.set('Access-Control-Allow-Headers', '*');
    corsHeaders.set('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');

    const contentType = upstreamResponse.headers.get('content-type') || '';
    const isM3U8 = targetUrl.pathname.toLowerCase().includes('.m3u8') ||
      targetUrl.pathname.toLowerCase().includes('.m3u') ||
      contentType.toLowerCase().includes('mpegurl') ||
      contentType.toLowerCase().includes('application/x-mpegurl');

    if (isM3U8 && upstreamResponse.status >= 200 && upstreamResponse.status < 300) {
      const manifestText = await upstreamResponse.text();
      const proxyBase = new URL(request.url).origin + '/proxy?url=';
      const finalBaseUrl = upstreamResponse.url || targetUrl.toString();
      const rewrittenText = rewriteM3U8(manifestText, finalBaseUrl, proxyBase);

      corsHeaders.delete('content-length');
      corsHeaders.delete('content-encoding');

      return new Response(rewrittenText, {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        headers: corsHeaders
      });
    }



    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: corsHeaders
    });
  } catch (err) {
    return new Response('Proxy connection failed: ' + err.message, {
      status: 502,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
}

// Read Playlist Content or retrieve from URL
async function readPlaylist(request) {
  const type = request.headers.get('content-type') || '';
  let playlistText = '';
  let playlistUrl = '';

  if (type.includes('multipart/form-data')) {
    const form = await request.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string') throw new Error('Invalid playlist file');
    playlistText = await file.text();
  } else {
    const body = await request.json().catch(() => null);
    if (!body?.url) throw new Error('No URL provided in JSON request body');

    playlistUrl = body.url;
    const target = new URL(playlistUrl);
    if (!['http:', 'https:'].includes(target.protocol)) throw new Error('HTTP/HTTPS required for fetching remote playlist');

    // Using VLC User-Agent to bypass security/agent filters on IPTV panels (e.g. Xtream Codes 403 Forbidden)
    const response = await fetch(target.toString(), {
      headers: {
        'User-Agent': 'VLC/3.0.20 LibVLC/3.0.20',
        'Accept': 'application/vnd.apple.mpegurl, application/x-mpegURL, audio/mpegurl, text/plain, */*'
      }
    });

    if (!response.ok) throw new Error('Failed to fetch remote playlist. HTTP Status: ' + response.status);
    playlistText = await response.text();
  }

  return { playlist: playlistText, playlistUrl };
}

// Parse M3U/M3U8 file & Resolve Relative Paths
function parseM3U(text, baseUrl = '') {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/);
  const channels = [];
  let currentInfo = null;
  let lastGroup = '';
  let playlistName = '';

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // Check for M3U playlist name header
    if (line.startsWith('#PLAYLIST:')) {
      playlistName = line.slice(10).trim();
      continue;
    }

    if (line.startsWith('#EXTM3U')) {
      const nameMatch = line.match(/name=["']([^"']+)["']/i);
      if (nameMatch) {
        playlistName = nameMatch[1].trim();
      }
      continue;
    }

    if (line.startsWith('#EXTINF:')) {
      currentInfo = parseExtinfLine(line);
      continue;
    }

    if (line.startsWith('#EXTGRP:')) {
      lastGroup = line.slice(8).trim();
      if (currentInfo && !currentInfo.group) currentInfo.group = lastGroup;
      continue;
    }

    if (!line.startsWith('#') && currentInfo) {
      const group = cleanVal(currentInfo.group || lastGroup || 'دسته‌بندی نشده');
      let streamUrl = line;

      // Handle relative URLs inside playlist using baseUrl if available
      if (baseUrl && !streamUrl.startsWith('http://') && !streamUrl.startsWith('https://') && !streamUrl.startsWith('rtmp://') && !streamUrl.startsWith('rtsp://') && !streamUrl.startsWith('magnet:')) {
        try {
          streamUrl = new URL(streamUrl, baseUrl).toString();
        } catch (e) {
          // ignore parsing error, keep relative path
        }
      }

      channels.push({
        id: String(channels.length + 1),
        name: cleanVal(currentInfo.name || currentInfo.tvgName || 'بدون نام'),
        url: streamUrl,
        logo: currentInfo.logo || '',
        group,
        tvgId: currentInfo.tvgId || '',
        tvgName: currentInfo.tvgName || ''
      });
      currentInfo = null;
    }
  }

  // Extract name from baseUrl if not found in content headers
  if (!playlistName && baseUrl) {
    try {
      const parsed = new URL(baseUrl);
      const pathname = parsed.pathname;
      const segments = pathname.split('/');
      let lastSegment = segments.pop() || '';
      if (!lastSegment && segments.length > 0) {
        lastSegment = segments.pop();
      }
      if (lastSegment) {
        try {
          lastSegment = decodeURIComponent(lastSegment);
        } catch (e) { }
        lastSegment = lastSegment.split('?')[0];
        const nameWithoutExt = lastSegment.replace(/\.(m3u8?|txt|list|cfg|json)$/i, '');
        if (nameWithoutExt.trim().length > 1) {
          playlistName = nameWithoutExt.trim();
        }
      }
    } catch (e) { }
  }

  const groupMap = new Map();
  for (const ch of channels) {
    groupMap.set(ch.group, (groupMap.get(ch.group) || 0) + 1);
  }
  const groups = [...groupMap.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name));

  return { count: channels.length, groups, channels, playlistName };
}

function parseExtinfLine(line) {
  const payload = line.slice(8);
  const commaIdx = payload.lastIndexOf(',');
  const attributes = commaIdx >= 0 ? payload.slice(0, commaIdx) : payload;
  const name = commaIdx >= 0 ? payload.slice(commaIdx + 1).trim() : '';
  const parsedAttr = {};

  const regex = /([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s,]*))/g;
  let match;
  while ((match = regex.exec(attributes))) {
    parsedAttr[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? '';
  }

  return {
    name: name || parsedAttr['tvg-name'] || parsedAttr.name || '',
    logo: parsedAttr['tvg-logo'] || parsedAttr.logo || '',
    group: parsedAttr['group-title'] || parsedAttr.group || '',
    tvgId: parsedAttr['tvg-id'] || '',
    tvgName: parsedAttr['tvg-name'] || ''
  };
}

function cleanVal(val) {
  return String(val || '').replace(/\s+/g, ' ').trim();
}

// Convert a .torrent file Buffer into a WebTorrent compatible Magnet Link
async function torrentToMagnet(buf) {
  const decoded = bdecode(buf, 0);
  const info = decoded.value['info'];
  if (!info) throw new Error('Invalid Torrent file: No info dictionary found');

  const infoStart = findInfoIndex(buf);
  if (infoStart === -1) throw new Error('Invalid Torrent file: Cannot locate info dictionary start');

  const infoEncoded = bencodeSlice(buf, infoStart);

  // Calculate SHA-1 Hash using Web Crypto API (Standard and safe inside isolates)
  const hashBuffer = await crypto.subtle.digest('SHA-1', infoEncoded);
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  const name = info['name'] ? new TextDecoder().decode(info['name']) : 'Unnamed Torrent';

  // Only include working WSS trackers for browser WebTorrent compatibility
  const trackers = [
    'wss://tracker.openwebtorrent.com',
    'wss://tracker.btorrent.xyz',
    'wss://tracker.webtorrent.dev'
  ];

  if (decoded.value['announce']) {
    const mainAnnounce = new TextDecoder().decode(decoded.value['announce']);
    if (!trackers.includes(mainAnnounce)) trackers.push(mainAnnounce);
  }

  if (decoded.value['announce-list']) {
    for (const tier of decoded.value['announce-list']) {
      for (const t of tier) {
        const item = new TextDecoder().decode(t);
        if (!trackers.includes(item)) trackers.push(item);
      }
    }
  }

  // Construct Magnet link URI
  let magnet = 'magnet:?xt=urn:btih:' + hashHex + '&dn=' + encodeURIComponent(name);
  for (const tr of trackers) {
    magnet += '&tr=' + encodeURIComponent(tr);
  }

  // Gather list of internal files
  const filesList = [];
  if (info['files']) {
    for (const f of info['files']) {
      const pathParts = f['path'].map(part => new TextDecoder().decode(part));
      filesList.push({
        name: pathParts.join('/'),
        length: f['length'] || 0
      });
    }
  } else {
    filesList.push({
      name,
      length: info['length'] || 0
    });
  }

  return {
    magnet,
    name,
    infoHash: hashHex,
    filesCount: filesList.length,
    files: filesList,
    trackersCount: trackers.length
  };
}

// Bdecoding Helpers
function bdecode(buf, pos) {
  if (buf[pos] === 0x64) { // 'd' -> dictionary
    pos++;
    const dict = {};
    while (buf[pos] !== 0x65) { // 'e'
      const key = bdecode(buf, pos);
      pos = key.end;
      const keyStr = new TextDecoder().decode(key.value);
      const val = bdecode(buf, pos);
      pos = val.end;
      dict[keyStr] = val.value;
    }
    return { value: dict, end: pos + 1 };
  }
  if (buf[pos] === 0x6c) { // 'l' -> list
    pos++;
    const list = [];
    while (buf[pos] !== 0x65) { // 'e'
      const item = bdecode(buf, pos);
      pos = item.end;
      list.push(item.value);
    }
    return { value: list, end: pos + 1 };
  }
  if (buf[pos] === 0x69) { // 'i' -> integer
    pos++;
    let end = pos;
    while (buf[end] !== 0x65) end++;
    const num = parseInt(new TextDecoder().decode(buf.slice(pos, end)));
    return { value: num, end: end + 1 };
  }

  // String case: <length>:<bytes>
  let colonPos = pos;
  while (buf[colonPos] !== 0x3a) colonPos++;
  const len = parseInt(new TextDecoder().decode(buf.slice(pos, colonPos)));
  const start = colonPos + 1;
  return { value: buf.slice(start, start + len), end: start + len };
}

function findInfoIndex(buf) {
  const prefix = new TextEncoder().encode('4:info');
  for (let i = 0; i < buf.length - prefix.length; i++) {
    let match = true;
    for (let j = 0; j < prefix.length; j++) {
      if (buf[i + j] !== prefix[j]) {
        match = false;
        break;
      }
    }
    if (match) return i + prefix.length;
  }
  return -1;
}

function bencodeSlice(buf, pos) {
  if (buf[pos] === 0x64) {
    const start = pos;
    pos++;
    while (buf[pos] !== 0x65) {
      pos = bdecodeSkip(buf, pos);
      pos = bdecodeSkip(buf, pos);
    }
    return buf.slice(start, pos + 1);
  }
  const decoded = bdecode(buf, pos);
  return buf.slice(pos, decoded.end);
}

function bdecodeSkip(buf, pos) {
  if (buf[pos] === 0x64) {
    pos++;
    while (buf[pos] !== 0x65) {
      pos = bdecodeSkip(buf, pos);
      pos = bdecodeSkip(buf, pos);
    }
    return pos + 1;
  }
  if (buf[pos] === 0x6c) {
    pos++;
    while (buf[pos] !== 0x65) {
      pos = bdecodeSkip(buf, pos);
    }
    return pos + 1;
  }
  if (buf[pos] === 0x69) {
    pos++;
    while (buf[pos] !== 0x65) pos++;
    return pos + 1;
  }
  let colonPos = pos;
  while (buf[colonPos] !== 0x3a) colonPos++;
  const len = parseInt(new TextDecoder().decode(buf.slice(pos, colonPos)));
  return colonPos + 1 + len;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'cache-control': 'no-store'
    }
  });
}

function resolveUrl(relUrl, baseUrl) {
  try {
    return new URL(relUrl, baseUrl).toString();
  } catch (e) {
    return relUrl;
  }
}

function rewriteM3U8(text, baseUrl, proxyBase) {
  const lines = text.split(/\r?\n/);
  const rewrittenLines = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return line;

    if (trimmed.startsWith('#')) {
      return line.replace(/URI="([^"]+)"/g, (match, uri) => {
        if (uri.startsWith('data:') || uri.startsWith('javascript:')) return match;
        const absolute = resolveUrl(uri, baseUrl);
        const proxied = proxyBase + encodeURIComponent(absolute);
        return `URI="${proxied}"`;
      });
    }

    // Direct URL line
    const absolute = resolveUrl(trimmed, baseUrl);
    return proxyBase + encodeURIComponent(absolute);
  });
  return rewrittenLines.join('\n');
}

