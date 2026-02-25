/**
 * IPTV Smart Proxy (Cloudflare Worker)
 * 
 * Features:
 * - Stunning Dark/Glassmorphism UI with Vazirmatn RTL font
 * - Cloudflare KV persistent channel storage
 * - HLS Proxy with CORS bypass and stream URI rewriting
 * - Built-in Web Player (hls.js) with quality selector
 * - Global IPTV Search Engine (iptv-org database)
 * - Advanced Connection Testing with speed scoring
 * 
 * Author: AI Assistant
 */

const HTML_SOURCE = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>پنل مدیریت تلویزیون (IPTV Proxy)</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%230f172a'/%3E%3Cstop offset='100%25' stop-color='%231e293b'/%3E%3C/linearGradient%3E%3ClinearGradient id='g1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%2338bdf8'/%3E%3Cstop offset='100%25' stop-color='%236366f1'/%3E%3C/linearGradient%3E%3Cfilter id='glow'%3E%3CfeGaussianBlur stdDeviation='1.5' result='blur'/%3E%3CfeMerge%3E%3CfeMergeNode in='blur'/%3E%3CfeMergeNode in='SourceGraphic'/%3E%3C/feMerge%3E%3C/filter%3E%3C/defs%3E%3Crect width='64' height='64' rx='14' fill='url(%23bg)'/%3E%3Crect x='6' y='12' width='52' height='36' rx='5' fill='none' stroke='url(%23g1)' stroke-width='2.5'/%3E%3Crect x='9' y='15' width='46' height='30' rx='3' fill='%230f1f3a'/%3E%3Cpolygon points='24,22 24,42 44,32' fill='url(%23g1)' filter='url(%23glow)'/%3E%3Crect x='20' y='51' width='24' height='3' rx='1.5' fill='url(%23g1)' opacity='0.6'/%3E%3C/svg%3E">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Vazirmatn', 'Tahoma', 'sans-serif'],
          }
        }
      }
    }
  </script>
  <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
  <style>
    @import url('https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css');
    body {
      font-family: 'Vazirmatn', Tahoma, sans-serif;
      background: #0f172a;
      background-image: radial-gradient(circle at top right, #1e293b 0%, #0f172a 100%);
      color: #f1f5f9;
      min-height: 100vh;
      min-height: 100dvh;
      overflow-x: hidden;
    }
    .glass {
      background: rgba(30, 41, 59, 0.6);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      -webkit-transform: translateZ(0); /* Fix for Safari blur rendering */
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 1rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .input-glass {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: white;
      transition: all 0.3s ease;
    }
    .input-glass:focus {
      outline: none;
      border-color: #38bdf8;
      box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
    }
    .player-overlay { background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(8px); }
    /* Hide native video spinners and poster overlay to only show custom UI */
    video::-internal-media-controls-overlay-cast-button { display: none; }
    video::-webkit-media-controls-overlay-play-button { display: none !important; }
    video::-webkit-media-controls-panel { z-index: 10; }
    video::-webkit-media-controls-loading-panel { display: none !important; }
    video::placeholder, video::-webkit-media-controls-start-playback-button { display: none !important; }
    
    /* Custom Scrollbar */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(56, 189, 248, 0.3); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(56, 189, 248, 0.6); }
    * { scrollbar-width: thin; scrollbar-color: rgba(56,189,248,0.3) transparent; }
    
    .custom-dropdown-content { max-height: 300px; overflow-y: auto; }
    
    /* Smooth transitions for cards */
    .channel-card { transition: transform 0.2s ease, border-color 0.2s ease; }
    .channel-card:hover { transform: translateY(-2px); }
    
    /* Hide scrollbar for internal dialogs if needed but keep functional */
    .hide-scrollbar::-webkit-scrollbar { width: 0px; background: transparent; }
    .hide-scrollbar { scrollbar-width: none; }
    
    /* Android TV / Keyboard Focus Styles */
    a:focus-visible, button:focus-visible, input:focus-visible, select:focus-visible, .cursor-pointer:focus-visible {
      outline: 3px solid #38bdf8 !important;
      outline-offset: 2px !important;
      box-shadow: 0 0 15px rgba(56, 189, 248, 0.6) !important;
      transition: all 0.2s ease;
      z-index: 50;
    }
  </style>
</head>
<body class="p-4 md:p-8">

  <div class="max-w-6xl mx-auto">
    <!-- Header -->
    <header class="flex flex-col md:flex-row justify-between items-center mb-10 p-6 glass">
      <div class="flex items-center gap-4 mb-4 md:mb-0">
        <div class="w-14 h-14 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-500/30">
           <svg class="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" fill-rule="evenodd"></path></svg>
        </div>
        <div>
          <h1 class="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-400">پنل استریم آی‌پی‌تی‌وی</h1>
          <div class="flex items-center gap-3 mt-1">
            <p class="text-sm text-slate-400">مدیریت شبکه‌ها، دور زدن فیلترینگ و خطای CORS</p>
            <span class="bg-indigo-500/20 text-indigo-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-indigo-500/30 tracking-widest" dir="ltr">STREAM CORE v1.0.1</span>
          </div>
        </div>
      </div>
        <button onclick="openPingModal()" id="wifi-indicator" class="bg-slate-800 hover:bg-slate-700 text-slate-400 px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-medium border border-slate-700" title="وضعیت اتصال سرور">
          <svg id="wifi-icon" class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <!-- Default connecting state (1 bar) -->
            <path d="M12 21a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
          <span id="wifi-ping-text" class="text-xs font-bold font-mono tracking-wider hidden sm:block" dir="ltr">-- ms</span>
        </button>
        <div class="h-10 w-px bg-slate-700 hidden sm:block mx-1 my-auto"></div>
        <button onclick="openSearchModal()" class="bg-slate-700 hover:bg-slate-600 text-white px-5 py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-medium shadow-lg shadow-slate-900/30 border border-slate-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          جستجوی جهانی
        </button>
        <button onclick="openModal()" class="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-medium shadow-lg shadow-indigo-500/30">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          افزودن دستی
        </button>
      </div>
    </header>

    <!-- Global Loading Status -->
    <div id="sync-status" class="fixed bottom-4 right-4 bg-slate-800 text-slate-300 px-4 py-2 rounded-xl text-sm font-medium border border-slate-700 shadow-xl flex items-center gap-2 transition-opacity opacity-0 pointer-events-none z-50">
       <svg class="animate-spin w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
       در حال همگام‌سازی...
    </div>

    <!-- Channels List -->
    <main>
      <div id="empty-state" class="hidden text-center py-20 px-4 glass">
        <div class="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path></svg>
        </div>
        <h2 class="text-2xl font-bold text-slate-300">هیچ شبکه‌ای یافت نشد!</h2>
        <p class="text-slate-500 mt-3 text-lg">برای شروع، روی دکمه "افزودن شبکه جدید" در بالا کلیک کنید.</p>
      </div>
      
      <div id="channel-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"></div>
    </main>
  </div>

  <div id="search-modal" class="fixed inset-0 z-50 hidden player-overlay flex flex-col items-center justify-center p-4">
    <div class="glass w-full max-w-5xl h-[min(90dvh,800px)] flex flex-col rounded-2xl overflow-hidden relative">
      <!-- Search Header -->
      <div class="bg-slate-800/90 p-6 border-b border-slate-700">
        <div class="flex justify-between items-center mb-5">
          <h3 class="text-xl font-bold flex items-center gap-2">
            <svg class="w-6 h-6 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3"></path></svg>
            جستجوی پیشرفته IPTV
          </h3>
          <button onclick="closeSearchModal()" class="text-slate-400 hover:text-white transition-colors bg-slate-700 p-2 rounded-lg"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
        </div>
        
        <form id="search-form" onsubmit="executeSearch(event)" class="flex flex-col md:flex-row gap-4 relative">
          <input type="text" id="search-query" tabindex="0" class="flex-[3] input-glass px-4 py-3 rounded-xl placeholder-slate-400" placeholder="نام شبکه را جستجو کنید... (مثل BBC, IRIB)">
          
          <!-- Custom Country Select -->
          <div class="relative flex-[1]" id="country-dropdown-wrapper">
             <div class="input-glass px-4 py-3 rounded-xl cursor-pointer flex justify-between items-center text-slate-300" tabindex="0" onkeydown="if(event.key==='Enter') toggleCountryDropdown()" onclick="toggleCountryDropdown()">
                 <span id="country-dropdown-label">همه کشورها</span>
                 <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
             </div>
             <input type="hidden" id="search-country" value="">
             <div id="country-dropdown-menu" class="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl hidden z-40 flex flex-col p-2">
                 <input type="text" id="country-search-input" class="input-glass w-full px-3 py-2 rounded-lg text-sm mb-2" placeholder="جستجوی کشور..." oninput="filterCountries()">
                 <div id="country-list" class="custom-dropdown-content flex flex-col gap-1">
                     <!-- Populated by JS -->
                 </div>
             </div>
          </div>

          <button type="submit" class="bg-sky-600 hover:bg-sky-500 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2">
            جستجو
          </button>
        </form>
      </div>

      <!-- Search Results Area -->
      <div class="flex-1 overflow-y-auto p-6 bg-slate-900/50" id="search-results">
        <div class="h-full flex flex-col items-center justify-center text-slate-500">
           <svg class="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
           <p class="text-lg">جستجو در بین بیش از ۳۰,۰۰۰ شبکه تلویزیونی رایگان در جهان</p>
        </div>
      </div>
      
      <!-- Search Loader Overlay -->
      <div id="search-loader" class="absolute inset-0 bg-slate-900/80 backdrop-blur-sm hidden flex-col items-center justify-center z-10">
         <svg class="animate-spin h-12 w-12 text-sky-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
         <p class="text-sky-400 font-bold" id="search-loader-text">در حال اتصال به دیتابیس جهانی...</p>
      </div>
    </div>
  </div>

  <!-- Add/Edit Modal -->
  <div id="channel-modal" class="fixed inset-0 z-50 hidden player-overlay flex items-center justify-center p-4">
    <div class="glass w-full max-w-lg p-8 rounded-2xl" id="modal-content">
      <div class="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
        <h3 class="text-xl font-bold" id="modal-title">افزودن شبکه جدید</h3>
        <button onclick="closeModal()" class="text-slate-400 hover:text-white transition-colors p-2 -mr-2 rounded-lg"><svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
      </div>
      <form id="channel-form" onsubmit="saveChannel(event)">
        <input type="hidden" id="channel-id">
        <div class="mb-5">
          <label class="block text-sm font-medium text-slate-300 mb-2">نام شبکه</label>
          <input type="text" id="channel-name" required class="w-full input-glass px-4 py-3 rounded-lg" placeholder="مثال: شبکه ورزشی">
        </div>
        <div class="mb-6">
          <label class="block text-sm font-medium text-slate-300 mb-2">آدرس استریم (M3U8)</label>
          <input type="url" id="channel-url" required class="w-full input-glass px-4 py-3 rounded-lg text-left" dir="ltr" placeholder="https://example.com/live.m3u8">
        </div>
        <div class="flex gap-3">
          <button type="submit" class="flex-1 bg-sky-600 hover:bg-sky-500 text-white px-4 py-3 rounded-xl transition-colors font-semibold shadow-lg shadow-sky-600/30">ذخیره شبکه</button>
          <button type="button" onclick="closeModal()" class="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-xl transition-colors font-medium">انصراف</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Player Modal -->
  <div id="player-modal" class="fixed inset-0 z-50 hidden player-overlay flex flex-col items-center justify-center p-4">
    <div class="w-full max-w-5xl glass overflow-hidden flex flex-col rounded-2xl relative">
      <div class="bg-slate-800/80 p-5 flex justify-between items-center border-b border-slate-700">
        <h3 class="font-bold text-lg flex items-center gap-3">
          <span class="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]"></span>
          <span id="playing-title" class="text-white">درحال پخش...</span>
        </h3>
        <div class="flex items-center gap-3">
          <div class="relative hidden" id="quality-selector-container">
             <button onclick="toggleQualityMenu()" class="flex items-center gap-2 bg-slate-700/80 hover:bg-slate-600 text-sm font-medium text-white px-3 py-1.5 rounded-lg transition-colors border border-slate-600">
               <svg class="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
               <span id="current-quality-label">خودکار</span>
             </button>
             <div id="quality-menu" class="absolute top-10 left-0 w-32 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl hidden z-50 overflow-hidden flex flex-col py-1">
               <!-- Auto injected by JS -->
             </div>
          </div>
          <button onclick="copyProxyLink()" id="copy-proxy-btn" class="bg-slate-700 hover:bg-slate-600 p-2 rounded-lg transition-colors text-slate-400 hover:text-white border border-slate-600 hidden md:block" title="کپی لینک پروکسی شده">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          </button>
          
          <button onclick="toggleDebugger()" id="debug-toggle-btn" class="bg-slate-700 hover:bg-slate-600 p-2 rounded-lg transition-colors text-slate-400 hover:text-white border border-slate-600 hidden md:block" title="نمایش لاگ هوشمند">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
          </button>

          <button onclick="openDiagnosticModal()" class="bg-indigo-600/20 hover:bg-indigo-500/30 text-indigo-400 p-2 rounded-lg transition-colors border border-indigo-500/30 flex items-center justify-center relative group z-50 pointer-events-auto cursor-pointer" title="عیب‌یابی اتصال پخش">
            <!-- Pulsing ring effect on hover -->
            <span class="absolute inset-0 rounded-lg ring-2 ring-indigo-500/0 group-hover:ring-indigo-500/50 transition-all duration-300"></span>
            
            <svg class="w-6 h-6 z-10" fill="currentColor" viewBox="0 0 24 24">
              <!-- Animated WiFi Signal -->
              <path class="animate-pulse" d="M12 21a2 2 0 100-4 2 2 0 000 4z M8.5 16.5a5 5 0 017 0l1.4-1.4a7 7 0 00-9.9 0L8.5 16.5z M5 13.1a10 10 0 0114 0l1.4-1.4a12 12 0 00-16.8 0L5 13.1z M1.4 9.5a15 15 0 0121.2 0l1.4-1.4a17 17 0 00-24 0L1.4 9.5z" />
            </svg>
          </button>
          
          <button onclick="closePlayer()" class="bg-slate-700 hover:bg-red-500/80 p-2 rounded-lg transition-colors text-white z-50">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
      </div>
      <div class="w-full bg-black relative aspect-video flex items-center justify-center">
        <div id="loading-spinner" class="absolute hidden">
           <svg class="animate-spin h-10 w-10 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        </div>
        <video id="video-element" class="w-full h-full" controls autoplay playsinline></video>
      </div>
      </div>
      
      <!-- Smart Video Debugger (Hidden by default) -->
      <div id="video-debugger" class="w-full h-48 bg-black/90 border-t border-slate-700 overflow-y-auto hidden flex-col p-3 font-mono text-xs leading-5">
        <div class="text-slate-400 border-b border-slate-800 pb-2 mb-2 flex justify-between items-center sticky top-0 bg-black/90">
           <span>لاگ‌های سیستم پخش (Smart Debugger)</span>
           <button onclick="clearDebugger()" class="hover:text-white px-2 py-0.5 rounded bg-slate-800">پاک کردن</button>
        </div>
        <div id="debugger-logs" class="space-y-1"></div>
      </div>
    </div>
  </div>

  <!-- Test Connection Modal -->
  <div id="test-modal" class="fixed inset-0 z-[60] hidden player-overlay flex flex-col items-center justify-center p-4">
    <div class="glass w-full max-w-md max-h-[90dvh] overflow-y-auto p-8 rounded-2xl text-center relative hide-scrollbar">
      <!-- Decorator -->
      <div class="absolute top-0 left-0 w-full h-1 bg-slate-700">
         <div id="test-progress" class="h-full bg-sky-500 w-0 transition-all duration-300"></div>
      </div>
      
      <!-- Close Button (X) -->
      <button onclick="closeTestModal()" class="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 w-10 h-10 flex items-center justify-center rounded-full transition-colors z-[70] p-2 focus:outline-none">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
      
      <h3 class="text-xl font-bold mb-4 mt-2" id="test-title">بررسی ارتباط شبکه‌...</h3>
      <div class="w-20 h-20 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-slate-700 relative shadow-inner">
        <div id="test-spinner" class="absolute inset-0 rounded-full border-t-2 border-sky-500 animate-spin hidden"></div>
        <svg id="test-icon" class="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
      </div>
      <p id="test-status" class="text-slate-300 mb-6 font-medium">در حال آماده سازی...</p>
      
      <div id="test-details" class="bg-slate-900/40 p-5 rounded-xl text-right mb-6 hidden border border-slate-700/50 shadow-inner">
      </div>
    </div>
  </div>

  <!-- Ping/Connection Details Modal -->
  <div id="ping-modal" class="fixed inset-0 z-50 hidden player-overlay flex flex-col items-center justify-center p-4">
    <div class="glass w-full max-w-sm p-6 rounded-2xl text-center relative overflow-hidden">
      <button onclick="closePingModal()" class="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 w-10 h-10 flex items-center justify-center rounded-full transition-colors z-[70] p-2 focus:outline-none">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
      
      <div class="w-16 h-16 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700 relative shadow-inner">
        <svg id="ping-modal-icon" class="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21a2 2 0 100-4 2 2 0 000 4z" /></svg>
      </div>
      
      <h3 class="text-xl font-bold mb-1 text-white">کیفیت اتصال به سرور</h3>
      <p class="text-xs text-slate-400 mb-6 font-mono">Cloudflare Edge Network</p>
      
      <div class="bg-slate-900/50 p-4 rounded-xl text-right border border-slate-700/50 shadow-inner space-y-3">
        <div class="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
          <span class="text-slate-400">وضعیت پینگ:</span>
          <span id="ping-modal-value" class="font-bold flex items-center gap-2" dir="ltr">- ms</span>
        </div>
        <div class="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
          <span class="text-slate-400">دیتاسنتر متصل (Colo):</span>
          <span id="ping-modal-colo" class="font-bold text-indigo-400 font-mono">-</span>
        </div>
        <div class="flex justify-between items-center text-sm">
          <span class="text-slate-400">کشور (IP):</span>
          <span id="ping-modal-country" class="font-bold text-sky-400 font-mono">-</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Channel Diagnostic Modal -->
  <div id="channel-diagnostic-modal" class="fixed inset-0 z-[70] hidden player-overlay flex flex-col items-center justify-center p-4">
    <div class="glass w-full max-w-lg p-6 rounded-2xl relative">
      <button onclick="closeDiagnosticModal()" class="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 w-10 h-10 flex items-center justify-center rounded-full transition-colors z-[80] p-2 focus:outline-none">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>

      <div class="text-center mb-6">
        <h3 class="text-xl font-bold text-white mb-2">عیب‌یابی اتصال شبکه</h3>
        <p class="text-sm text-slate-400">بررسی وضعیت ارتباط بین کلودفلر و سرور اصلی تلویزیون</p>
      </div>

      <!-- Network Flow Diagram -->
      <div class="flex items-center justify-between bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 mb-6">
         <div class="flex flex-col items-center gap-2">
            <div class="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center border border-indigo-500/50"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>
            <span class="text-xs text-slate-300 font-medium">شما</span>
         </div>
         
         <!-- Link 1 (User to CF) -->
         <div class="flex-1 flex flex-col items-center px-2">
            <span id="diag-ping-user" class="text-xs md:text-sm text-sky-400 font-mono mb-1 font-bold bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/50">-- ms</span>
            <div class="w-full h-1 bg-gradient-to-l from-indigo-500/50 to-sky-500/50 rounded-full relative overflow-hidden"><div class="absolute inset-0 bg-sky-400/30 w-1/2 animate-[progress_1s_ease-in-out_infinite]"></div></div>
         </div>

         <div class="flex flex-col items-center gap-2">
            <div class="w-10 h-10 bg-sky-500/20 text-sky-400 rounded-full flex items-center justify-center border border-sky-500/50">
               <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" /></svg>
            </div>
            <span class="text-xs text-slate-300 font-medium font-mono" id="diag-cf-colo">Cloudflare</span>
         </div>
         
         <!-- Link 2 (CF to Origin) -->
         <div class="flex-1 flex flex-col items-center px-2">
            <span id="diag-ping-origin" class="text-xs md:text-sm text-yellow-500 font-mono mb-1 font-bold bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/50">درحال تست...</span>
            <div id="diag-link-origin" class="w-full h-1 bg-slate-700 mt-1 rounded-full relative overflow-hidden"><div class="absolute inset-0 bg-yellow-500/50 w-full animate-pulse"></div></div>
         </div>

         <div class="flex flex-col items-center gap-2">
            <div class="w-10 h-10 bg-slate-800 text-slate-400 rounded-full flex items-center justify-center border border-slate-700" id="diag-origin-icon">
               <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path></svg>
            </div>
            <span class="text-xs text-slate-300 font-medium">سرور تی‌وی</span>
         </div>
      </div>

      <!-- Results Area -->
      <div id="diag-results" class="bg-slate-900/40 p-5 rounded-xl text-right border border-slate-700/50 shadow-inner h-48 overflow-y-auto hide-scrollbar relative">
         <div id="diag-spinner" class="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm z-10">
            <svg class="animate-spin w-8 h-8 text-sky-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
         </div>
         <div id="diag-content" class="text-sm text-slate-300 space-y-3 hidden">
         </div>
      </div>
    </div>
  </div>

  <style>
    @keyframes progress { 0% { transform: translateX(200%); } 100% { transform: translateX(-200%); } }
  </style>

  <script>
    let channels = [];
    let currentHls = null;
    let _videoPlayingHandler = null;
    let _videoWaitingHandler = null;
    let lastPingState = { ping: 0, colo: '-', country: '-', hdrs: false };

    const escapeHtml = (str) => {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    };

    const urlSafeBase64Encode = (str) => {
      return btoa(unescape(encodeURIComponent(str))).replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=/g, '');
    };

    function getProxyUrl(targetUrl) {
      const origin = window.location.origin;
      const encoded = urlSafeBase64Encode(targetUrl);
      return \`\${origin}/proxy/\${encoded}/stream.m3u8\`;
    }
    
    // --- Cloudflare KV Syncing ---
    function showSyncStatus(isSyncing, errorMsg = null) {
        const el = document.getElementById('sync-status');
        if (isSyncing) {
            el.innerHTML = \`<svg class="animate-spin w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> در حال دریافت از سرور...\`;
            el.classList.replace('opacity-0', 'opacity-100');
        } else if (errorMsg) {
            el.innerHTML = \`<svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg> \${errorMsg}\`;
            setTimeout(() => el.classList.replace('opacity-100', 'opacity-0'), 3000);
        } else {
            el.innerHTML = \`<svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> با سرور همگام شد\`;
            setTimeout(() => el.classList.replace('opacity-100', 'opacity-0'), 2000);
        }
    }

    async function loadChannelsFromServer() {
        showSyncStatus(true);
        try {
            const res = await fetch('/api/channels');
            if (res.ok) {
                channels = await res.json();
                renderChannels();
                showSyncStatus(false);
            } else {
                throw new Error('خطا در دریافت شبکه‌ها');
            }
        } catch (e) {
            console.error(e);
            showSyncStatus(false, 'ارتباط با سرور قطع است');
        }
    }

    async function saveChannelsToServer() {
        showSyncStatus(true);
        try {
            const res = await fetch('/api/channels', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(channels),
                credentials: 'same-origin'
            });
            if (res.ok) {
                showSyncStatus(false);
            } else if (res.status === 401) {
                throw new Error('کلید دسترسی نامعتبر است');
            } else {
                throw new Error('خطا در ذخیره رسانه');
            }
        } catch (e) {
            console.error(e);
            showSyncStatus(false, e.message || 'خطا در ذخیره‌سازی ابری');
        }
    }
    // ----------------------------

    function renderChannels() {
      const grid = document.getElementById('channel-grid');
      const emptyState = document.getElementById('empty-state');
      
      if (channels.length === 0) {
        grid.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
      }
      
      emptyState.classList.add('hidden');
      grid.innerHTML = channels.map((ch, idx) => \`
        <div class="glass p-6 rounded-2xl flex flex-col justify-between channel-card relative overflow-hidden h-full">
          <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sky-500/10 to-transparent rounded-bl-full -z-10"></div>
          <div>
            <div class="w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center text-sky-400 mb-5 border border-slate-700 shadow-inner">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-3">\${escapeHtml(ch.name)}</h3>
            <p class="text-xs text-slate-400 break-all bg-slate-900/50 p-3 rounded-lg block leading-relaxed border border-slate-800 shadow-inner" dir="ltr">\${escapeHtml(ch.url)}</p>
          </div>
          <div class="flex gap-2 mt-6">
            <button onclick="playChannel(\${idx})" class="flex-[2] bg-green-500/10 text-green-400 hover:bg-green-600 hover:text-white border border-green-500/30 font-bold py-3 min-h-[44px] rounded-xl transition-colors flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" fill-rule="evenodd"></path></svg>
              پخش
            </button>
            <button onclick="testChannel(\${idx})" class="flex-[1] bg-yellow-500/10 text-yellow-500 hover:bg-yellow-600 hover:text-white border border-yellow-500/30 p-2 min-h-[44px] min-w-[44px] rounded-xl transition-colors flex items-center justify-center" title="تست اتصال (Streaming Test)">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            </button>
            <button onclick="editChannel(\${idx})" class="flex-[1] bg-slate-700/50 hover:bg-sky-600 hover:text-white text-slate-300 p-2 min-h-[44px] min-w-[44px] rounded-xl transition-colors flex items-center justify-center border border-slate-600" title="ویرایش">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            </button>
            <button onclick="deleteChannel(\${idx})" class="flex-[1] bg-red-500/10 hover:bg-red-600 hover:text-white text-red-500 hover:text-white p-2 min-h-[44px] min-w-[44px] border border-red-500/20 rounded-xl transition-colors flex items-center justify-center" title="حذف">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </div>
      \`).join('');
    }

    function openModal() {
      document.getElementById('channel-modal').classList.remove('hidden');
      document.getElementById('modal-title').innerText = 'افزودن شبکه جدید';
      document.getElementById('channel-form').reset();
      document.getElementById('channel-id').value = '';
      setTimeout(() => document.getElementById('channel-name').focus(), 100);
    }

    function closeModal() {
      document.getElementById('channel-modal').classList.add('hidden');
    }

    async function saveChannel(e) {
      e.preventDefault();
      const id = document.getElementById('channel-id').value;
      const name = document.getElementById('channel-name').value;
      const url = document.getElementById('channel-url').value;

      if (id) {
        channels[id] = { name, url };
      } else {
        channels.push({ name, url });
      }

      closeModal();
      renderChannels();
      await saveChannelsToServer();
    }

    function editChannel(idx) {
      document.getElementById('channel-modal').classList.remove('hidden');
      document.getElementById('modal-title').innerText = 'ویرایش شبکه';
      document.getElementById('channel-id').value = idx;
      document.getElementById('channel-name').value = channels[idx].name;
      document.getElementById('channel-url').value = channels[idx].url;
    }

    async function deleteChannel(idx) {
      if(confirm('آیا از حذف این شبکه اطمینان دارید؟')) {
        channels.splice(idx, 1);
        renderChannels();
        await saveChannelsToServer();
      }
    }

    function copyProxyLink() {
      if (!window.currentPlayingUrl) return;
      const proxyUrl = window.location.origin + getProxyUrl(window.currentPlayingUrl);
      navigator.clipboard.writeText(proxyUrl).then(() => {
        const btn = document.getElementById('copy-proxy-btn');
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
        setTimeout(() => { btn.innerHTML = originalHtml; }, 2000);
      }).catch(err => {
        let textarea = document.createElement("textarea");
        textarea.value = proxyUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('لینک کپی شد: ' + proxyUrl);
      });
    }

    let window_stallGuardInterval = null;
    let window_levelSwitchResetTimeout = null;
    let window_levelSwitchCount = 0;

    function playChannel(idx) {
      const channel = channels[idx];
      const proxyUrl = getProxyUrl(channel.url);
      window.currentPlayingUrl = channel.url; // Track for diagnostics
      
      document.getElementById('playing-title').innerText = channel.name;
      document.getElementById('player-modal').classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      
      // Reset quality UI
      document.getElementById('quality-selector-container').classList.add('hidden');
      document.getElementById('quality-menu').classList.add('hidden');
      document.getElementById('current-quality-label').innerText = 'خودکار';
      
      const video = document.getElementById('video-element');
      const loader = document.getElementById('loading-spinner');
      loader.classList.remove('hidden');
      
      // BUG FIX: Remove old listeners to prevent memory leak from stacking
      if (_videoPlayingHandler) video.removeEventListener('playing', _videoPlayingHandler);
      if (_videoWaitingHandler) video.removeEventListener('waiting', _videoWaitingHandler);
      _videoPlayingHandler = () => loader.classList.add('hidden');
      _videoWaitingHandler = () => loader.classList.remove('hidden');
      video.addEventListener('playing', _videoPlayingHandler);
      video.addEventListener('waiting', _videoWaitingHandler);
      
      if (Hls.isSupported()) {
        if (currentHls) currentHls.destroy();
        currentHls = new Hls({
           debug: false,
           enableWorker: true,
           lowLatencyMode: true,
           
           maxBufferLength: 15,
           maxMaxBufferLength: 40,
           maxBufferHole: 0.3,
           backBufferLength: 20,
           
           liveSyncDurationCount: 3,
           liveMaxLatencyDurationCount: 4,
           maxLiveSyncPlaybackRate: 1.5,
           
           maxAudioFramesDrift: 1,
           stretchShortVideoTrack: false,
           nudgeMaxRetry: 5,
           nudgeOffset: 0.1,
           
           enableSoftwareAES: true,
           
           startLevel: -1,
           autoLevelCapping: -1, // We will manually lock this after first parsing for diagnostic stability
           abrEwmaDefaultEstimate: 2000000,
           abrBandWidthFactor: 0.85,
           abrBandWidthUpFactor: 0.6,
           abrMaxWithRealBitrate: true,
           
           fragLoadingTimeOut: 20000,
           manifestLoadingTimeOut: 20000,
           levelLoadingTimeOut: 20000,
           
           fragLoadingMaxRetry: 8,
           levelLoadingMaxRetry: 8,
           manifestLoadingMaxRetry: 8
        });
        
        appendDebugLog("HLS.js player initialized", "info");
        
        currentHls.loadSource(proxyUrl);
        currentHls.attachMedia(video);

        // ABR Stability Tracker
        currentHls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
          window_levelSwitchCount++;
          appendDebugLog("Switched quality level to " + data.level, "info");
          if (window_levelSwitchCount > 5) {
            appendDebugLog("Quality thrashing detected. Locking level for 30s.", "warn");
            currentHls.autoLevelCapping = data.level; // lock it
            setTimeout(() => {
              if (currentHls) currentHls.autoLevelCapping = -1; // unlock
              window_levelSwitchCount = 0;
            }, 30000);
          }
          if (window_levelSwitchResetTimeout) clearTimeout(window_levelSwitchResetTimeout);
          window_levelSwitchResetTimeout = setTimeout(() => { window_levelSwitchCount = 0; }, 20000);
        });

        // Smart Stall & Recovery Guard
        if (window_stallGuardInterval) clearInterval(window_stallGuardInterval);
        
        let lastStuckTime = -1;
        let actualStallTicks = 0;
        let hasPlayedAtLeastOnce = false;

        window_stallGuardInterval = setInterval(() => {
          if (!video) return;

          // 1 & 5) Stall detection MUST NOT run if paused (e.g. autoplay blocked) or if playback hasn't started yet
          if (video.paused || (!hasPlayedAtLeastOnce && video.currentTime === 0)) {
             actualStallTicks = 0;
             lastStuckTime = video.currentTime;
             return; 
          }

          if (video.currentTime > 0 && !video.paused) hasPlayedAtLeastOnce = true;

          // 2) Trigger ONLY if: playing, time frozen, and waiting for buffer explicitly
          if (video.currentTime === lastStuckTime && video.readyState < 3) {
             actualStallTicks++;
             
             // 4) First attempt gentle recovery
             if (actualStallTicks === 4) {
                appendDebugLog("Media stall detected (4s), attempting gentle recovery...", "warn");
                if (currentHls) currentHls.recoverMediaError();
             }
             
             // 4 & 3) Only reinitialize if recover fails AND cooldown allows it
             if (actualStallTicks >= 10) {
                const now = Date.now();
                const lastReinit = window.lastHlsReinitTime || 0;
                
                if (now - lastReinit > 15000) { // 15 seconds cooldown
                    appendDebugLog("Critical network deadlock (10s), safely re-initializing stream", "error");
                    window.lastHlsReinitTime = now;
                    actualStallTicks = 0;
                    hasPlayedAtLeastOnce = false; // Reset to require fresh start
                    if (currentHls) {
                       currentHls.destroy();
                       // Avoid locking the main thread, give it a moment to clear memory
                       setTimeout(() => { playChannel(idx); }, 500);
                    }
                } else {
                    if (actualStallTicks % 5 === 0) {
                        appendDebugLog("Stall persists, but in 15s cooldown. Waiting...", "warn");
                    }
                }
             }
          } else {
             actualStallTicks = 0;
          }
          lastStuckTime = video.currentTime;
        }, 1000);
        
        currentHls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          if (data.levels && data.levels.length > 1) {
            setupQualityMenu(data.levels);
          }
          // The autoplay promise is intentionally unhandled here since 
          // user interaction normally opens this modal anyway.
          let playPromise = video.play();
          if (playPromise !== undefined) {
             playPromise.catch(_ => {
                appendDebugLog("Autoplay policy blocked playback, waiting for user interaction.", "warn");
             });
          }
        });
        // --- Fragment Diagnostic Logging ---
        currentHls.on(Hls.Events.FRAG_LOADING, (event, data) => {
            if (data.frag) data.frag._reqStartTime = performance.now();
            let sn = data.frag ? data.frag.sn : 'unknown';
            appendDebugLog("▶ Req Start: Frag sn " + sn, "info");
        });

        currentHls.on(Hls.Events.FRAG_LOADED, (event, data) => {
            if (!data.frag || !data.frag._reqStartTime) return;
            const now = performance.now();
            const totalDuration = Math.round(now - data.frag._reqStartTime);
            let firstByte = 0;
            if (data.stats && data.stats.tfirst && data.stats.trequest) {
                firstByte = Math.round(data.stats.tfirst - data.stats.trequest);
            }
            const sizeKB = data.stats ? Math.round(data.stats.total / 1024) : 0;
            
            appendDebugLog("✔ Frag sn " + data.frag.sn + " Loaded | TTFB: " + firstByte + " ms | Total: " + totalDuration + " ms | Size: " + sizeKB + " KB", "success");
        });

        // ✅ Proactive A/V sync guardian: pause → wait for buffers → resume
        let _avSyncCorrecting = false;
        currentHls.on(Hls.Events.FRAG_BUFFERED, () => {
          try {
            if (!video || video.readyState < 2 || _avSyncCorrecting || video.paused) return;
            const buffered = video.buffered;
            if (buffered.length === 0) return;
            const bufStart = buffered.start(0);
            const currentTime = video.currentTime;
            
            // Safeguard: If buffered range start is greater than currentTime + 0.3s
            if (bufStart > currentTime + 0.3) {
              _avSyncCorrecting = true;
              video.pause();
              video.currentTime = bufStart + 0.05;
              setTimeout(() => {
                  video.play().catch(() => {});
                  _avSyncCorrecting = false;
              }, 50);
            }
          } catch (_) { _avSyncCorrecting = false; }
        });
        
        currentHls.on(Hls.Events.ERROR, (event, data) => {
          let errCode = data.response ? 'HTTP ' + data.response.code : '';
          
          if (data.details === Hls.ErrorDetails.FRAG_LOAD_TIMEOUT) {
              let sn = data.frag ? data.frag.sn : 'unknown';
              appendDebugLog("FRAG TIMEOUT: sn " + sn + " aborted due to fragLoadTimeOut!", "error");
          } else if (data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR) {
              appendDebugLog("BUFFER STALLED: Output buffer empty!", "warn");
          }
          
          if (data.fatal) {
              appendDebugLog("FATAL HLS Error: " + data.type + " - " + data.details + " " + errCode, "error");
              if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                  appendDebugLog("Network error detected, attempting recovery...", "warn");
                  currentHls.startLoad();
              } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                  appendDebugLog("Media layout error detected, recovering...", "warn");
                  currentHls.recoverMediaError();
              } else {
                  appendDebugLog('Unrecoverable fatal error. Destroying HLS instance.', "error");
                  currentHls.destroy();
              }
          } else {
              // Non-fatal errors, specifically ignoring the ones we already explicitly logged
              if (data.details !== Hls.ErrorDetails.FRAG_LOAD_TIMEOUT && data.details !== Hls.ErrorDetails.BUFFER_STALLED_ERROR) {
                  if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                      appendDebugLog("Network Warning: " + data.details + " " + errCode, "warn");
                  } else {
                      appendDebugLog("HLS Event: " + data.details, "info");
                  }
              }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = proxyUrl;
        video.play().catch(e => console.log("Autoplay blocked", e));
      } else {
        alert("پخش کننده HLS در مرورگر شما پشتیبانی نمی‌شود.");
      }
    }

    function toggleQualityMenu() {
       const menu = document.getElementById('quality-menu');
       menu.classList.toggle('hidden');
    }

    function setupQualityMenu(levels) {
       document.getElementById('quality-selector-container').classList.remove('hidden');
       const menu = document.getElementById('quality-menu');
       
       let html = \`<button onclick="setQuality(-1)" class="text-right px-4 py-2 hover:bg-slate-700 text-white text-sm transition-colors border-b border-slate-700/50">خودکار</button>\`;
       
       // Sort from highest to lowest quality
       const sortedLevels = levels.map((l, i) => ({...l, originalIndex: i}))
                                 .sort((a,b) => b.height - a.height);

       sortedLevels.forEach(level => {
          let label = level.height ? level.height + 'p' : Math.round(level.bitrate / 1024) + ' Kbps';
          html += \`<button onclick="setQuality(\${level.originalIndex}, '\${label}')" class="text-right px-4 py-3 hover:bg-slate-700 text-slate-300 border-b border-slate-700/50 text-sm transition-colors">\${label}</button>\`;
       });
       menu.innerHTML = html;
    }

    function setQuality(levelIndex, label = 'خودکار') {
       if (currentHls) {
          currentHls.currentLevel = levelIndex;
          document.getElementById('current-quality-label').innerText = label;
          document.getElementById('quality-menu').classList.add('hidden');
       }
    }

    function closePlayer() {
      document.getElementById('player-modal').classList.add('hidden');
      document.body.style.overflow = 'auto';
      document.getElementById('quality-menu').classList.add('hidden');
      document.getElementById('loading-spinner').classList.add('hidden');
      document.getElementById('channel-diagnostic-modal').classList.add('hidden');
      document.getElementById('video-debugger').classList.add('hidden');
      document.getElementById('debug-toggle-btn').classList.remove('bg-sky-600', 'text-white', 'border-sky-500');
      
      const video = document.getElementById('video-element');
      video.pause();
      video.removeAttribute('src');
      video.load();
      
      // Cleanup Memory Leaks
      if (currentHls) {
        currentHls.destroy();
        currentHls = null;
      }
      if (_videoPlayingHandler) { video.removeEventListener('playing', _videoPlayingHandler); _videoPlayingHandler = null; }
      if (_videoWaitingHandler) { video.removeEventListener('waiting', _videoWaitingHandler); _videoWaitingHandler = null; }
      if (window_stallGuardInterval) { clearInterval(window_stallGuardInterval); window_stallGuardInterval = null; }
      if (window_levelSwitchResetTimeout) { clearTimeout(window_levelSwitchResetTimeout); window_levelSwitchResetTimeout = null; }
      
      
    }

    // --- SMART DEBUGGER LOGIC ---
    function toggleDebugger() {
      const dbg = document.getElementById('video-debugger');
      const btn = document.getElementById('debug-toggle-btn');
      if (dbg.classList.contains('hidden')) {
        dbg.classList.remove('hidden');
        btn.classList.add('bg-sky-600', 'text-white', 'border-sky-500');
        dbg.scrollTop = dbg.scrollHeight;
      } else {
        dbg.classList.add('hidden');
        btn.classList.remove('bg-sky-600', 'text-white', 'border-sky-500');
      }
    }

    function clearDebugger() {
      document.getElementById('debugger-logs').innerHTML = '';
    }

    function appendDebugLog(msg, level) {
      if (!level) level = 'info';
      const logs = document.getElementById('debugger-logs');
      if (!logs) return;
      const t = new Date().toLocaleTimeString('en-US', {hour12:false, hour:'2-digit', minute:'2-digit', second:'2-digit'});
      let cssClass = "text-slate-300";
      let prefix = "[INFO]";
      if (level === 'error') { cssClass = "text-red-400 bg-red-500/10 px-1 py-0.5 rounded"; prefix = "[ERR!]"; }
      if (level === 'warn')  { cssClass = "text-yellow-400"; prefix = "[WARN]"; }
      if (level === 'success') { cssClass = "text-green-400"; prefix = "[ OK ]"; }
      
      const div = document.createElement('div');
      div.className = "break-all " + cssClass;
      div.innerText = t + " " + prefix + " " + msg;
      logs.appendChild(div);
      
      const dbg = document.getElementById('video-debugger');
      if (dbg && !dbg.classList.contains('hidden')) {
         dbg.scrollTop = dbg.scrollHeight;
      }
      if (logs.childNodes.length > 100) {
         logs.removeChild(logs.firstChild);
      }
    }

    // --- Global Search Logic ---
    let globalChannelsDB = [];
    let globalStreamsDB = [];
    let globalCountriesDB = [];
    let searchDatabasesLoaded = false;

    function openSearchModal() {
        document.getElementById('search-modal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        ensureSearchDatabases();
    }
    
    function closeSearchModal() {
        document.getElementById('search-modal').classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    // Country Dropdown Logic
    function toggleCountryDropdown() {
        const menu = document.getElementById('country-dropdown-menu');
        menu.classList.toggle('hidden');
        if (!menu.classList.contains('hidden')) {
            document.getElementById('country-search-input').focus();
        }
    }

    function selectCountry(code, name) {
        document.getElementById('search-country').value = code;
        document.getElementById('country-dropdown-label').innerText = name;
        document.getElementById('country-dropdown-menu').classList.add('hidden');
    }

    function filterCountries() {
        const query = document.getElementById('country-search-input').value.toLowerCase();
        const items = document.querySelectorAll('.country-item');
        items.forEach(item => {
            if (item.innerText.toLowerCase().includes(query)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
        const wrapper = document.getElementById('country-dropdown-wrapper');
        const menu = document.getElementById('country-dropdown-menu');
        if (wrapper && !wrapper.contains(e.target)) {
            menu.classList.add('hidden');
        }
    });

    async function ensureSearchDatabases() {
        if (searchDatabasesLoaded) return true;
        const loader = document.getElementById('search-loader');
        const loaderText = document.getElementById('search-loader-text');
        
        loader.classList.remove('hidden');
        loader.style.display = 'flex';
        
        try {
            loaderText.innerText = "در حال دریافت لیست کشورها...";
            const coRes = await fetch('https://iptv-org.github.io/api/countries.json');
            globalCountriesDB = await coRes.json();
            
            const list = document.getElementById('country-list');
            let coHtml = \`<div class="country-item px-3 py-3 cursor-pointer hover:bg-slate-700 border-t border-slate-700/50 rounded-lg text-slate-300" onclick="selectCountry('', 'همه کشورها')">همه کشورها</div>\`;
            globalCountriesDB.forEach(c => {
                coHtml += \`<div class="country-item px-3 py-3 cursor-pointer hover:bg-slate-700 border-t border-slate-700/50 rounded-lg text-slate-300 flex justify-between" onclick="selectCountry('\${c.code}', '\${escapeHtml(c.name)}')"><span>\${escapeHtml(c.name)}</span><span class="text-slate-500 text-xs">\${c.code}</span></div>\`;
            });
            list.innerHTML = coHtml;

            // Fetch channels and streams in parallel for speed
            loaderText.innerText = "در حال دریافت دیتابیس شبکه‌ها و استریم‌ها...";
            const [chRes, stRes] = await Promise.all([
                fetch('https://iptv-org.github.io/api/channels.json'),
                fetch('https://iptv-org.github.io/api/streams.json')
            ]);
            globalChannelsDB = await chRes.json();
            globalStreamsDB = await stRes.json();
            
            // Build a hash-map index for O(1) stream lookups instead of O(N) per channel
            window._streamIndex = {};
            globalStreamsDB.forEach(s => {
                if (!window._streamIndex[s.channel]) window._streamIndex[s.channel] = [];
                window._streamIndex[s.channel].push(s);
            });
            
            searchDatabasesLoaded = true;
            document.getElementById('search-query').focus();
            return true;
        } catch (err) {
            console.error(err);
            alert('متاسفانه ارتباط با دیتابیس جهانی برقرار نشد. لطفا VPN خود را بررسی کنید.');
            return false;
        } finally {
            loader.classList.add('hidden');
            loader.style.display = '';
        }
    }

    async function executeSearch(e) {
        e.preventDefault();
        const query = document.getElementById('search-query').value.toLowerCase().trim();
        const country = document.getElementById('search-country').value.toLowerCase();
        
        if (!query && !country) {
            alert('لطفاً حداقل نام شبکه یا کشور را مشخص کنید.');
            return;
        }

        const success = await ensureSearchDatabases();
        if (!success) return;

        const resultsContainer = document.getElementById('search-results');
        resultsContainer.innerHTML = \`<div class="flex justify-center py-10"><svg class="animate-spin h-8 w-8 text-sky-500" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" class="opacity-75"></path></svg></div>\`;

        setTimeout(() => {
            // Filter Channels
            const matchedChannels = globalChannelsDB.filter(ch => {
                const matchName = ch.name ? ch.name.toLowerCase().includes(query) : false;
                const matchCountry = country ? (ch.country && ch.country.toLowerCase() === country) : true;
                return (!query || matchName) && matchCountry;
            });

            // Use indexed stream lookup (O(1) per channel instead of O(N))
            let finalResults = [];
            matchedChannels.forEach(ch => {
                const streams = window._streamIndex[ch.id] || [];
                if (streams.length > 0) {
                    streams.forEach(stream => {
                        finalResults.push({
                            name: ch.name + (stream.resolution ? \` [\${stream.resolution}] \` : ''),
                            url: stream.url,
                            country: ch.country,
                            logo: ch.logo
                        });
                    });
                }
            });

            // Render Results
            if (finalResults.length === 0) {
                resultsContainer.innerHTML = \`<div class="text-center py-10 text-slate-400">هیچ شبکه‌ی فعالی برای این جستجو یافت نشد 😔</div>\`;
                return;
            }

            // Limit to top 50 to prevent DOM lag
            const displayResults = finalResults.slice(0, 50);

            let html = '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">';
            displayResults.forEach((res, index) => {
                const safeUrl = res.url.replace(/'/g, "&apos;").replace(/"/g, "&quot;");
                const safeName = res.name.replace(/'/g, "&apos;").replace(/"/g, "&quot;");
                
                html += \`
                <div class="bg-slate-800 border border-slate-700 p-4 rounded-xl flex flex-col justify-between hover:border-sky-500 transition-colors">
                    <div class="flex items-start gap-3 mb-4">
                        <div class="w-12 h-12 flex-shrink-0 bg-slate-900 border border-slate-700 rounded overflow-hidden flex items-center justify-center text-slate-600 text-[10px] font-bold relative">
                            <span class="absolute z-0">TV</span>
                            <img src="\${res.logo || ''}" onerror="this.style.display='none'" onload="this.style.display='block'; this.style.backgroundColor='transparent';" class="w-full h-full object-contain relative z-10" style="display:none;">
                        </div>
                        <div class="overflow-hidden">
                            <h4 class="font-bold text-white truncate text-left" dir="ltr">\${res.name}</h4>
                            <span class="inline-block px-2 text-[10px] bg-slate-700 text-slate-300 rounded uppercase font-bold mt-1">\${res.country || 'GLOBAL'}</span>
                        </div>
                    </div>
                    <div class="text-xs text-slate-500 truncate mb-4" dir="ltr">\${res.url}</div>
                    
                    <div class="flex gap-2.5">
                        <button onclick="testArbitraryUrl('\${safeUrl}', '\${safeName}')" class="flex-1 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-500 hover:text-white border border-yellow-500/30 font-medium py-2 min-h-[44px] rounded-lg transition-colors text-sm flex items-center justify-center gap-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                            تست
                        </button>
                        <button onclick="addAndSyncGlobal('\${safeName}', '\${safeUrl}')" class="flex-[1.5] bg-sky-600 hover:bg-sky-500 text-white font-medium py-2 min-h-[44px] rounded-lg transition-colors text-sm flex items-center justify-center gap-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                            افزودن و ذخیره
                        </button>
                    </div>
                </div>
                \`;
            });
            html += '</div>';
            
            if (finalResults.length > 50) {
                html += \`<div class="text-center mt-6 text-sm text-slate-400">نمایش ۵۰ نتیجه از \${finalResults.length} نتیجه. برای دقت بیشتر نام را کامل‌تر جستجو کنید.</div>\`;
            }
            
            resultsContainer.innerHTML = html;
        }, 100);
    }
    
    async function testArbitraryUrl(rawUrl, name) {
        // We reuse the existing modal but calculate proxy directly
        const proxyUrl = getProxyUrl(rawUrl);
        runConnectionTest(proxyUrl, name);
    }
    
    async function testChannel(idx) {
      const channel = channels[idx];
      const proxyUrl = getProxyUrl(channel.url);
      runConnectionTest(proxyUrl, channel.name);
    }

    async function runConnectionTest(proxyUrl, channelName) {
      const modal = document.getElementById('test-modal');
      const title = document.getElementById('test-title');
      const status = document.getElementById('test-status');
      const icon = document.getElementById('test-icon');
      const spinner = document.getElementById('test-spinner');
      const details = document.getElementById('test-details');
      const progress = document.getElementById('test-progress');
      
      // Close Search modal temporarily if it's open, or render over it using z-index
      
      modal.classList.remove('hidden');
      title.innerText = \`بررسی \${channelName}\`;
      status.innerText = "ارسال درخواست به Cloudflare...";
      status.className = "text-sky-400 font-medium mb-6";
      spinner.classList.remove('hidden');
      icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>';
      icon.className = "w-10 h-10 text-sky-400";
      details.classList.add('hidden');
      progress.style.width = '30%';
      progress.className = 'h-full bg-sky-500 transition-all duration-300';

      try {
        const startTime = Date.now();
        const response = await fetch(proxyUrl, { method: 'GET' });
        progress.style.width = '70%';
        
        const ping = Date.now() - startTime;
        status.innerText = "در حال تحلیل پاسخ استریم...";
        
        if (response.ok) {
           const text = await response.text();
           progress.style.width = '100%';
           
           if (text.includes('#EXTM3U')) {
              spinner.classList.add('hidden');
              icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>';
              icon.className = "w-10 h-10 text-green-500 flex-shrink-0";
              status.innerText = "ارتباط کاملاً سالم است!";
              status.className = "text-green-400 font-bold mb-6 text-xl";
              
              // Parse Quality & Bandwidth
              let qualities = [];
              const lines = text.split('\\n');
              for (let line of lines) {
                 if (line.startsWith('#EXT-X-STREAM-INF:')) {
                    let resMatch = line.match(/RESOLUTION=(\\d+x\\d+)/);
                    let bwMatch = line.match(/BANDWIDTH=(\\d+)/);
                    
                    let res = resMatch ? resMatch[1] : null;
                    let bw = bwMatch ? parseInt(bwMatch[1]) : null;
                    
                    if (res || bw) {
                       let bwStr = bw ? Math.round(bw / 1024) + ' Kbps' : '';
                       let qualityName = 'کیفیت ناشناس';
                       
                       if (res) {
                          qualityName = res.split('x')[1] + 'p';
                       } else if (bw) {
                          if (bw >= 4000000) qualityName = '1080p (تخمینی)';
                          else if (bw >= 2000000) qualityName = '720p (تخمینی)';
                          else if (bw >= 1000000) qualityName = '480p (تخمینی)';
                          else qualityName = '360p (تخمینی)';
                       }
                       
                       qualities.push(\`<li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-sky-500"></span><span dir="ltr" class="text-slate-300 font-mono">\${qualityName}\${bwStr ? ' - ' + bwStr : ''}</span></li>\`);
                    }
                 }
              }
              
              const uniqueQualities = [...new Set(qualities)];
              let qualityHtml = "";
              if (uniqueQualities.length > 0) {
                 qualityHtml = \`<div class="mt-4"><span class="text-slate-300 font-bold text-sm block mb-2 px-1">کیفیت‌های موجود دَر پلی‌لیست:</span><ul class="space-y-1.5 text-sm bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">\${uniqueQualities.join('')}</ul></div>\`;
              } else if (text.includes('#EXTINF:')) {
                 qualityHtml = \`<div class="mt-4 text-sm text-yellow-400 bg-yellow-400/10 p-3 rounded-lg border border-yellow-400/20 text-center font-medium">این یک استریم مستقیم (بدون کیفیت‌های متغیر) است.</div>\`;
              }

              // Advanced Check: Try to fetch the actual stream or variant playlist
              status.innerText = "در حال شبیه‌سازی پخش و تست سرعت...";
              let streamHealthHtml = "";
              let speedScore = "نامشخص";
              let speedColor = "text-slate-400";

              try {
                  const linesArr = text.split('\\n');
                  let targetUrlToTest = null;
                  let isSubPlaylist = false;
                  
                  // Find the first URL (either a .ts segment or a sub-playlist)
                  for (let i = 0; i < linesArr.length; i++) {
                      let l = linesArr[i].trim();
                      if (l && !l.startsWith('#')) {
                          targetUrlToTest = l;
                          // Check if previous line was STREAM-INF (means this is a sub-playlist, not a segment)
                          if (i > 0 && linesArr[i-1].includes('#EXT-X-STREAM-INF')) {
                              isSubPlaylist = true;
                          }
                          break;
                      }
                  }

                  if (targetUrlToTest) {
                      let testUrl = targetUrlToTest;
                      if (!testUrl.startsWith('http')) {
                          if (testUrl.startsWith('//')) testUrl = window.location.protocol + testUrl;
                          else if (testUrl.startsWith('/')) testUrl = window.location.origin + testUrl;
                          else testUrl = window.location.origin + '/' + testUrl;
                      }
                      
                      // Step 1: Fetch the sub-playlist or first segment
                      const tStart = Date.now();
                      const tRes = await fetch(testUrl, { method: 'GET' });
                      const tTime = Date.now() - tStart;
                      
                      if (tRes.ok) {
                          let segmentTime = tTime;
                          
                          // Step 2: If this was a sub-playlist, dig deeper to test actual segment
                          if (isSubPlaylist) {
                              try {
                                  const subText = await tRes.text();
                                  const subLines = subText.split('\\n');
                                  let segUrl = null;
                                  for (let j = subLines.length - 1; j >= 0; j--) {
                                      let sl = subLines[j].trim();
                                      if (sl && !sl.startsWith('#')) { segUrl = sl; break; }
                                  }
                                  if (segUrl) {
                                      if (!segUrl.startsWith('http')) {
                                          // Resolve relative to sub-playlist URL
                                          let subBase = testUrl.substring(0, testUrl.lastIndexOf('/'));
                                          segUrl = segUrl.startsWith('/') ? new URL(testUrl).origin + segUrl : subBase + '/' + segUrl;
                                      }
                                      const segStart = Date.now();
                                      const segRes = await fetch(segUrl, { method: 'GET' });
                                      segmentTime = Date.now() - segStart;
                                      if (!segRes.ok) segmentTime = tTime; // Fallback
                                  }
                              } catch (_) { /* Use sub-playlist time as fallback */ }
                          }
                          
                          // Score based on actual segment download time
                          if (segmentTime < 600) { speedScore = "عالی (پرسرعت)"; speedColor = "text-green-400"; }
                          else if (segmentTime < 2000) { speedScore = "خوب (پایدار)"; speedColor = "text-sky-400"; }
                          else if (segmentTime < 5000) { speedScore = "متوسط (احتمال بافرینگ)"; speedColor = "text-yellow-400"; }
                          else { speedScore = "ضعیف / افت فریم"; speedColor = "text-red-400"; }

                          // Determine recommended quality
                          let recommendedQuality = 'خودکار (Auto)';
                          if (segmentTime > 5000) recommendedQuality = '240p';
                          else if (segmentTime > 3000) recommendedQuality = '360p';
                          else if (segmentTime > 1500) recommendedQuality = '480p';
                          else recommendedQuality = 'بالاترین کیفیت';
                          
                          streamHealthHtml = \`<div class="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg mt-2 mb-2">
                              <div class="flex justify-between items-center text-sm border-b border-slate-700/50 pb-2.5 mb-2.5">
                                  <span class="text-slate-400 font-medium">وضعیت پخش:</span>
                                  <span class="font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded flex items-center gap-1">قابل پخش <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg></span>
                              </div>
                              <div class="flex justify-between items-center text-sm border-b border-slate-700/50 pb-2.5 mb-2.5">
                                  <span class="text-slate-400 font-medium">پینگ پلی‌لیست (اتصال اولیه):</span>
                                  <span class="font-bold text-slate-200" dir="ltr">\${ping} ms</span>
                              </div>
                              <div class="flex justify-between items-center text-sm border-b border-slate-700/50 pb-2.5 mb-2.5">
                                  <span class="text-slate-400 font-medium">سرعت دانلود سگمنت:</span>
                                  <div class="flex items-center gap-2" dir="ltr">
                                      <span class="font-bold \${speedColor}">\${speedScore}</span>
                                      <span class="text-slate-400 font-mono text-xs w-12 text-right">(\${segmentTime}ms)</span>
                                  </div>
                              </div>
                              <div class="flex justify-between items-center text-sm">
                                  <span class="text-slate-400 font-medium">کیفیت پیشنهادی:</span>
                                  <span class="font-bold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/20">\${recommendedQuality}</span>
                              </div>
                          </div>\`;
                      } else {
                          streamHealthHtml = \`<div class="bg-red-500/10 p-4 rounded-xl border border-red-500/30 text-sm text-right mt-2">
      <div class="font-bold text-red-400 flex items-center gap-2 mb-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg> خطای فیک‌لینک</div>
      <p class="text-red-200/80 leading-relaxed">پلی‌لیست M3U8 وجود دارد، اما سرور اصلی اجازه دانلود استریم (ویدیو) را نمی‌دهد. پخش نخواهد شد.</p>
  </div>\`;
                      }
                  }
              } catch (e) {
                  console.error("Advanced test failed", e);
                  streamHealthHtml = \`<div class="bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/30 text-sm text-right mt-2">
                      <div class="font-bold text-yellow-500 flex items-center gap-2 mb-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> تست عمیق ناموفق شد</div>
                      <p class="text-yellow-200/80 leading-relaxed">سرور به درخواست شبیه‌سازی پخش پاسخ نداد. ممکن است پخش با مشکل مواجه شود.</p>
                  </div>\`;
              }
              
              details.innerHTML = \`
                <div class="flex flex-col items-center justify-center mb-4 pb-4 border-b border-slate-700/50">
                   <div class="bg-green-500/10 text-green-400 px-4 py-1.5 rounded-full text-sm font-bold border border-green-500/20 mb-2 shadow-[0_0_10px_rgba(74,222,128,0.1)]" dir="ltr">SUCCESS \${ping}ms</div>
                   <div class="text-slate-400 text-xs font-mono">سایز هدر دریافت شده: \${text.length} بایت</div>
                </div>
                \${streamHealthHtml}
                \${qualityHtml}
              \`;
              details.classList.remove('hidden');
           } else {
              throw new Error("پاسخ سرور M3U8 معتبر نیست! احتمالاً مسدود یا از دسترس خارج شده است.");
           }
        } else {
           throw new Error(\`خطای \${response.status}: \${response.statusText}\`);
        }
      } catch (err) {
        progress.style.width = '100%';
        progress.classList.replace('bg-sky-500', 'bg-red-500');
        spinner.classList.add('hidden');
        icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>';
        icon.className = "w-10 h-10 text-red-500";
        status.innerText = "ارتباط ناموفق بود!";
        status.className = "text-red-400 font-bold mb-6 text-xl";
        details.innerHTML = \`<strong class="text-red-400">ERROR</strong><br/>دلیل: \${err.message}\`;
        details.classList.remove('hidden');
      }
    }
    
    async function addAndSyncGlobal(name, url) {
        // Prevent duplicates
        if (channels.find(ch => ch.url === url)) {
            alert('این شبکه از قبل در لیست شما وجود دارد.');
            return;
        }
        
        channels.push({ name, url });
        renderChannels();
        
        // Show success animation on the button click target
        alert(\`شبکه "\${name}" با موفقیت اضافه شد.\`);
        
        await saveChannelsToServer();
    }

    function closeTestModal() {
      document.getElementById('test-modal').classList.add('hidden');
      setTimeout(() => {
          document.getElementById('test-progress').style.width = '0%';
      }, 300);
    }

    // --- DIAGNOSTIC MODAL LOGIC ---
    function openDiagnosticModal() {
       if (!window.currentPlayingUrl) return;
       
       document.getElementById('channel-diagnostic-modal').classList.remove('hidden');
       runChannelDiagnostic(window.currentPlayingUrl);
       
       // Live Polling
       if (window.diagnosticInterval) clearInterval(window.diagnosticInterval);
       window.diagnosticInterval = setInterval(() => {
           runChannelDiagnostic(window.currentPlayingUrl, true);
       }, 4000); // 4 seconds interval
    }

    function closeDiagnosticModal() {
       document.getElementById('channel-diagnostic-modal').classList.add('hidden');
       if (window.diagnosticInterval) clearInterval(window.diagnosticInterval);
    }

    async function runChannelDiagnostic(url, isLiveUpdate = false) {
       const originPingStr = document.getElementById('diag-ping-origin');
       const originLink = document.getElementById('diag-link-origin');
       const originIcon = document.getElementById('diag-origin-icon');
       const content = document.getElementById('diag-content');
       
       if (!isLiveUpdate) {
           document.getElementById('diag-spinner').classList.remove('hidden');
           content.classList.add('hidden');
           originPingStr.innerText = "درحال تست...";
           originPingStr.className = "text-xs md:text-sm text-yellow-500 font-mono mb-1 font-bold bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/50";
           originLink.innerHTML = '<div class="absolute inset-0 bg-yellow-500/50 w-full animate-pulse"></div>';
           originIcon.className = "w-10 h-10 bg-slate-800 text-slate-400 rounded-full flex items-center justify-center border border-slate-700";
       }
       
       document.getElementById('diag-ping-user').innerText = \`\${lastPingState.ping > 0 ? lastPingState.ping + 'ms' : '...'}\`;
       document.getElementById('diag-cf-colo').innerText = lastPingState.colo !== '-' ? lastPingState.colo : 'Cloudflare';

       try {
         const response = await fetch(\`/test-stream?url=\${encodeURIComponent(url)}\`);
         const data = await response.json();
         
         if (!isLiveUpdate) {
             document.getElementById('diag-spinner').classList.add('hidden');
             content.classList.remove('hidden');
         }
         
         if (data.status === 'success') {
            const ms = data.proxyPingMs || 0;
            originPingStr.innerText = \`\${ms} ms\`;
            
            let color = "text-green-400";
            let linkBg = "bg-green-500/50";
            let iconCls = "bg-green-500/20 text-green-400 border-green-500/50";
            if (ms > 800) { color = "text-yellow-500"; linkBg = "bg-yellow-500/50"; iconCls = "bg-yellow-500/20 text-yellow-500 border-yellow-500/50"; }
            if (ms > 2000) { color = "text-orange-500"; linkBg = "bg-orange-500/50"; iconCls = "bg-orange-500/20 text-orange-500 border-orange-500/50"; }
            
            originPingStr.className = \`text-xs md:text-sm \${color} font-mono mb-1 font-bold bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/50\`;
            originLink.innerHTML = \`<div class="absolute inset-0 \${linkBg} w-1/2 animate-[progress_1.5s_ease-in-out_infinite]"></div>\`;
            originIcon.className = \`w-10 h-10 rounded-full flex items-center justify-center border \${iconCls}\`;

            content.innerHTML = \`
              <div class="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-3">
                 <strong class="text-green-400 block mb-1">✅ ارتباط سرور کلودفلر با سرور تلویزیون برقرار است</strong>
                 پاسخ‌دهی سرور اصلی در \${ms} میلی‌ثانیه انجام شد و فایل M3U8 شامل \${data.segments > 0 ? data.segments + ' سگمنت ویدیویی' : 'ساختار چندکیفیتی'} است.
              </div>
              <div class="bg-slate-800/80 rounded-lg p-3 border border-slate-700/50 text-xs text-slate-300 leading-relaxed">
                 <strong class="text-white block mb-2 border-b border-slate-700 pb-1">نتیجه‌گیری:</strong>
                 \${lastPingState.ping > 500 ? '<p class="text-orange-400 mb-1">• سرعت اتصال <b>شما تا کلودفلر</b> ضعیف است. در صورت قطعی، مشکل از اینترنت محلی یا فیلترینگ است.</p>' : ''}
                 \${ms > 1500 ? '<p class="text-yellow-400 mb-1">• سرعت اتصال <b>کلودفلر تا سرور اصلی</b> کند است. ممکن است پخش با افت کیفیت مواجه شود.</p>' : ''}
                 \${(lastPingState.ping <= 500 && ms <= 1500) ? '<p class="text-green-400">تمام لینک‌های ارتباطی در وضعیت مطلوب هستند و پخش باید بدون مشکل انجام شود.</p>' : ''}
              </div>
            \`;
         } else {
            originPingStr.innerText = "قطعی ❌";
            originPingStr.className = "text-xs md:text-sm text-red-500 font-mono mb-1 font-bold bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/50";
            originLink.innerHTML = '<div class="absolute inset-0 bg-red-500 w-full"></div>';
            originIcon.className = "w-10 h-10 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center border border-red-500/50";
            
            content.innerHTML = \`
              <div class="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                 <strong class="text-red-400 block mb-1">❌ سرور اصلی پاسخ نمی‌دهد</strong>
                 این شبکه تلویزیونی از دسترس خارج شده، مسدود است، یا آدرس آن منقضی شده است.
                 <div class="mt-2 text-xs bg-black/30 p-2 rounded text-red-300 font-mono overflow-auto max-h-20" dir="ltr">\${data.error || 'Connection Timeout'}</div>
              </div>
            \`;
         }
       } catch(e) {
          if (window.diagnosticInterval) clearInterval(window.diagnosticInterval);
          document.getElementById('diag-spinner').classList.add('hidden');
          originPingStr.innerText = "خطا";
          originPingStr.className = "text-xs md:text-sm text-red-500 font-mono mb-1 font-bold bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/50";
          originLink.innerHTML = '<div class="absolute inset-0 bg-red-500 w-full"></div>';
          content.classList.remove('hidden');
          content.innerHTML = \`
              <div class="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400">
                 خطا در انجام تست. لطفا مجددا تلاش کنید.
              </div>\`;
       }
    }

    // --- WIFI PING MONITOR ---
    function updateWifiIcon(ping, err = false) {
       const icon = document.getElementById('wifi-icon');
       const btn = document.getElementById('wifi-indicator');
       const modalIcon = document.getElementById('ping-modal-icon');
       const modalVal = document.getElementById('ping-modal-value');
       const pingTxt = document.getElementById('wifi-ping-text');
       
       if (err) {
          const p = "M12 21a2 2 0 100-4 2 2 0 000 4z M2.1 9.3l1.5 1.5m16.8-1.5l1.5-1.5M4.9 12.1l1.5 1.5m11.2-1.5l1.5-1.5";
          icon.innerHTML = \`<path d="\${p}" />\`;
          modalIcon.innerHTML = \`<path d="\${p}" />\`;
          btn.className = "bg-red-500/10 text-red-400 px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-medium border border-red-500/30";
          modalVal.innerHTML = \`<span class="text-red-400">قطعی ارتباط ❌</span>\`;
          modalIcon.className = "w-8 h-8 text-red-400";
          if (pingTxt) pingTxt.innerText = "Error";
          return;
       }

       let p = ""; let cls = ""; let mCls = ""; let txt = \`\${ping} ms\`;
       // 4 bars (excellent < 100ms)
       if (ping < 100) {
           p = "M12 21a2 2 0 100-4 2 2 0 000 4z M8.5 16.5a5 5 0 017 0l1.4-1.4a7 7 0 00-9.9 0L8.5 16.5z M5 13.1a10 10 0 0114 0l1.4-1.4a12 12 0 00-16.8 0L5 13.1z M1.4 9.5a15 15 0 0121.2 0l1.4-1.4a17 17 0 00-24 0L1.4 9.5z";
           cls = "bg-green-500/10 text-green-400 border border-green-500/30";
           mCls = "w-8 h-8 text-green-400";
           txt = \`\${ping} ms <span class="bg-green-500/20 text-green-400 text-[10px] px-1.5 py-0.5 rounded uppercase">عالی</span>\`;
       } 
       // 3 bars (good < 250ms)
       else if (ping < 250) {
           p = "M12 21a2 2 0 100-4 2 2 0 000 4z M8.5 16.5a5 5 0 017 0l1.4-1.4a7 7 0 00-9.9 0L8.5 16.5z M5 13.1a10 10 0 0114 0l1.4-1.4a12 12 0 00-16.8 0L5 13.1z";
           cls = "bg-sky-500/10 text-sky-400 border border-sky-500/30";
           mCls = "w-8 h-8 text-sky-400";
           txt = \`\${ping} ms <span class="bg-sky-500/20 text-sky-400 text-[10px] px-1.5 py-0.5 rounded uppercase">خوب</span>\`;
       }
       // 2 bars (fair < 500ms)
       else if (ping < 500) {
           p = "M12 21a2 2 0 100-4 2 2 0 000 4z M8.5 16.5a5 5 0 017 0l1.4-1.4a7 7 0 00-9.9 0L8.5 16.5z";
           cls = "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30";
           mCls = "w-8 h-8 text-yellow-500";
           txt = \`\${ping} ms <span class="bg-yellow-500/20 text-yellow-500 text-[10px] px-1.5 py-0.5 rounded uppercase">متوسط</span>\`;
       }
       // 1 bar (poor >= 500ms)
       else {
           p = "M12 21a2 2 0 100-4 2 2 0 000 4z";
           cls = "bg-orange-500/10 text-orange-400 border border-orange-500/30";
           mCls = "w-8 h-8 text-orange-400";
           txt = \`\${ping} ms <span class="bg-orange-500/20 text-orange-400 text-[10px] px-1.5 py-0.5 rounded uppercase">ضعیف</span>\`;
       }
       
       icon.innerHTML = \`<path d="\${p}" />\`;
       modalIcon.innerHTML = \`<path d="\${p}" />\`;
       btn.className = \`hover:opacity-80 px-3 py-2 sm:px-4 sm:py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-medium \${cls}\`;
       modalVal.innerHTML = txt;
       modalIcon.className = mCls;
       if (pingTxt) pingTxt.innerText = \`\${ping} ms\`;
       
       if (lastPingState.hdrs) {
           document.getElementById('ping-modal-colo').innerText = lastPingState.colo;
           document.getElementById('ping-modal-country').innerText = lastPingState.country;
       }
    }

    async function measurePing() {
       try {
           const start = performance.now();
           // We use a tiny endpoint that returns empty to calculate accurate network ping to CF edge
           const res = await fetch('/api/ping', { method: 'HEAD', cache: 'no-store' });
           const end = performance.now();
           if (res.ok) {
               lastPingState.ping = Math.round(end - start);
               lastPingState.colo = res.headers.get('cf-ray')?.split('-')[1] || res.headers.get('x-cf-colo') || 'Unknown';
               lastPingState.country = res.headers.get('x-cf-country') || 'Unknown';
               lastPingState.hdrs = true;
               updateWifiIcon(lastPingState.ping);
           } else { throw new Error(); }
       } catch (e) {
           updateWifiIcon(0, true);
       }
    }

    function startPingMonitor() {
       measurePing();
       setInterval(measurePing, 5000); // Check every 5 seconds
    }

    function openPingModal() {
       measurePing(); // force immediate refresh
       document.getElementById('ping-modal').classList.remove('hidden');
    }
    function closePingModal() {
       document.getElementById('ping-modal').classList.add('hidden');
    }
    // --- END WIFI PING ---

    // Keyboard: ESC to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const testModal = document.getElementById('test-modal');
            const playerModal = document.getElementById('player-modal');
            const searchModal = document.getElementById('search-modal');
            const channelModal = document.getElementById('channel-modal');
            const pingModal = document.getElementById('ping-modal');
            const diagModal = document.getElementById('channel-diagnostic-modal');
            
            if (!diagModal.classList.contains('hidden')) { closeDiagnosticModal(); return; }
            if (!testModal.classList.contains('hidden')) { closeTestModal(); return; }
            if (!playerModal.classList.contains('hidden')) { closePlayer(); return; }
            if (!channelModal.classList.contains('hidden')) { closeModal(); return; }
            if (!searchModal.classList.contains('hidden')) { closeSearchModal(); return; }
            if (!pingModal.classList.contains('hidden')) { closePingModal(); return; }
        }
    });

    // Load from CF KV on boot
    window.addEventListener('DOMContentLoaded', () => {
      loadChannelsFromServer();
      startPingMonitor();
    });
  </script>
</body>
</html>`;

// ============================================
// 🌍 WORKER ENTRY
// ============================================

const urlSafeBase64Encode = (str) => {
  return btoa(unescape(encodeURIComponent(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

const urlSafeBase64Decode = (str) => {
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  return decodeURIComponent(escape(atob(b64)));
};

export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Max-Age": "86400",
        }
      });
    }

    try {
      const requestUrl = new URL(request.url);
      const apiSecret = env.API_SECRET || null; // Set this in CF Worker env vars!

      // Helper: Check API auth via cookie or header
      const isAuthorized = () => {
        if (!apiSecret) return true; // No secret set = anyone can access (user's choice)
        const cookieHeader = request.headers.get('Cookie') || '';
        const tokenFromCookie = cookieHeader.split(';').map(c => c.trim()).find(c => c.startsWith('api_token='));
        if (tokenFromCookie && tokenFromCookie.split('=')[1] === apiSecret) return true;
        const tokenFromHeader = request.headers.get('X-API-Token');
        if (tokenFromHeader === apiSecret) return true;
        return false;
      };

      // 0. Tiny Ping Endpoint for Wifi Monitor
      if (request.method === 'HEAD' && requestUrl.pathname === '/api/ping') {
        return new Response(null, {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "X-CF-Colo": request.cf?.colo || 'N/A',
            "X-CF-Country": request.cf?.country || 'N/A',
            "Cache-Control": "no-store, no-cache, must-revalidate"
          }
        });
      }

      // 1. CF KV Built-in Database API Routes
      if (requestUrl.pathname === '/api/channels') {
        const kv = env.IPTV_KV;
        if (!kv) {
          return new Response(JSON.stringify({ error: "KV not configured" }), {
            status: 500, headers: { "Content-Type": "application/json; charset=utf-8" }
          });
        }

        if (request.method === 'GET') {
          const data = await kv.get("saved_channels");
          const fallbackData = [
            { name: "Demo Sport", url: "https://live.presstv.ir/hls" },
            { name: "Demo Movies", url: "https://familyhls.avatv.live/hls/playlist.m3u8" }
          ];
          return new Response(data || JSON.stringify(fallbackData), {
            headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
          });
        }

        if (request.method === 'POST') {
          // SECURITY: Authenticate write operations
          if (!isAuthorized()) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
              status: 401, headers: { "Content-Type": "application/json; charset=utf-8" }
            });
          }

          // SECURITY: Limit body size to 512KB to prevent KV abuse
          const body = await request.text();
          if (body.length > 512 * 1024) {
            return new Response(JSON.stringify({ error: "Payload too large" }), {
              status: 413, headers: { "Content-Type": "application/json; charset=utf-8" }
            });
          }

          // Validate JSON
          try { JSON.parse(body); } catch {
            return new Response(JSON.stringify({ error: "Invalid JSON" }), {
              status: 400, headers: { "Content-Type": "application/json; charset=utf-8" }
            });
          }

          await kv.put("saved_channels", body);
          return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json; charset=utf-8" }
          });
        }
      }

      // 2. Auth Login Endpoint (sets cookie)
      if (requestUrl.pathname === '/api/auth') {
        if (request.method === 'POST') {
          const { token } = await request.json().catch(() => ({}));
          if (!apiSecret || token === apiSecret) {
            return new Response(JSON.stringify({ success: true }), {
              headers: {
                "Content-Type": "application/json",
                "Set-Cookie": `api_token=${apiSecret || 'open'}; Path=/; HttpOnly; SameSite=Strict; Max-Age=31536000`
              }
            });
          }
          return new Response(JSON.stringify({ error: "Wrong token" }), { status: 401, headers: { "Content-Type": "application/json" } });
        }
      }

      // 3. Return Dashboard UI
      if (requestUrl.pathname === '/' || requestUrl.pathname === '/index.html') {
        return new Response(HTML_SOURCE, {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
            "X-Content-Type-Options": "nosniff",
            "Referrer-Policy": "no-referrer",
            "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
            // Auto-set auth cookie for the dashboard visitor if secret is set
            ...(apiSecret ? { "Set-Cookie": `api_token=${apiSecret}; Path=/; HttpOnly; SameSite=Strict; Max-Age=31536000` } : {})
          }
        });
      }

      // 4. Test Stream Route (Diagnostic)
      if (requestUrl.pathname === '/test-stream') {
        const targetUrl = requestUrl.searchParams.get('url');
        if (!targetUrl) {
          return new Response(JSON.stringify({ status: 'error', error: 'Missing url parameter' }), {
            status: 400, headers: { "Content-Type": "application/json; charset=utf-8" }
          });
        }
        try {
          const startTime = Date.now();
          const targetRes = await fetch(targetUrl, {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': '*/*'
            }
          });
          const proxyPingMs = Date.now() - startTime;

          if (!targetRes.ok) {
            return new Response(JSON.stringify({ status: 'error', error: `HTTP ${targetRes.status} ${targetRes.statusText}` }), {
              headers: { "Content-Type": "application/json; charset=utf-8" }
            });
          }

          const text = await targetRes.text();
          const segments = (text.match(/#EXTINF:/g) || []).length;

          return new Response(JSON.stringify({
            status: 'success',
            proxyPingMs,
            segments
          }), {
            headers: { "Content-Type": "application/json; charset=utf-8" }
          });
        } catch (e) {
          return new Response(JSON.stringify({ status: 'error', error: e.message }), {
            headers: { "Content-Type": "application/json; charset=utf-8" }
          });
        }
      }

      // 5. Handle Proxy Route
      if (requestUrl.pathname.startsWith('/proxy/')) {
        const parts = requestUrl.pathname.split('/');
        const encodedParam = parts[2]; // /proxy/THIS_PART/...

        if (!encodedParam) {
          return new Response("Missing Target Data", { status: 400 });
        }

        let targetUrlStr;
        try {
          targetUrlStr = urlSafeBase64Decode(encodedParam);
        } catch {
          return new Response("Invalid URL Encoding", { status: 400 });
        }

        const targetUrl = new URL(targetUrlStr);

        // Map request headers cleanly
        const headers = new Headers();
        const clientUserAgent = request.headers.get("User-Agent");
        headers.set("User-Agent", clientUserAgent || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
        headers.set("Referer", targetUrl.origin + "/"); // Prevents most hotlink blocks
        headers.set("Accept", request.headers.get("Accept") || "*/*");
        headers.set("Connection", "keep-alive");

        const rangeHeader = request.headers.get("Range");
        if (rangeHeader) {
          headers.set("Range", rangeHeader);
        }

        const upstreamResponse = await fetch(targetUrl.toString(), {
          method: request.method,
          headers: headers,
          redirect: 'follow'
        });

        if (!upstreamResponse.ok) {
          return new Response(`Upstream Error ${upstreamResponse.status}: ${upstreamResponse.statusText}`, {
            status: 502,
            headers: { "Access-Control-Allow-Origin": "*" }
          });
        }

        const contentType = upstreamResponse.headers.get("content-type") || "";
        const isM3U8 = contentType.toLowerCase().includes("mpegurl") || targetUrl.pathname.endsWith(".m3u8");

        const finalUrlStr = upstreamResponse.url;
        const parentUrlObj = new URL(finalUrlStr);
        let returnHeaders = new Headers(upstreamResponse.headers);

        // Setup Cross-Origin Headers for Web Players
        returnHeaders.set("Access-Control-Allow-Origin", "*");
        returnHeaders.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
        returnHeaders.set("Access-Control-Allow-Headers", "*");
        returnHeaders.delete("content-security-policy");
        returnHeaders.delete("x-frame-options");

        // Process Playlists (.m3u8)
        if (isM3U8) {
          returnHeaders.set("Content-Type", "application/vnd.apple.mpegurl");
          returnHeaders.set("Cache-Control", "no-cache, no-store, must-revalidate");

          let textContent = await upstreamResponse.text();

          // Helper to safely construct full URLs from M3U8 relative paths
          const getAbsoluteUrl = (uri) => {
            try {
              return new URL(uri, finalUrlStr);
            } catch (e) {
              const fallbackDir = finalUrlStr.substring(0, finalUrlStr.lastIndexOf('/') + 1) || parentUrlObj.origin;
              return new URL(uri, fallbackDir);
            }
          };

          // Replace embedded URIs (keys, segments) smartly via Regex
          textContent = textContent.replace(/(URI=")([^"]+)(")/gi, (match, prefix, uri, suffix) => {
            if (uri.startsWith('data:') || uri.startsWith('blob:')) return match;
            try {
              const absoluteUrlObj = getAbsoluteUrl(uri);
              if (parentUrlObj.search && !absoluteUrlObj.search) {
                absoluteUrlObj.search = parentUrlObj.search;
              }
              const encoded = urlSafeBase64Encode(absoluteUrlObj.toString());
              const filename = absoluteUrlObj.pathname.split('/').pop() || 'key.key';
              return `${prefix}/proxy/${encoded}/${filename}${suffix}`;
            } catch (e) { return match; }
          }).replace(/^([^#\s][^\r\n]*)/gm, (match, line) => {
            line = line.trim();
            if (!line || line.startsWith('data:') || line.startsWith('blob:')) return match;
            try {
              const absoluteUrlObj = getAbsoluteUrl(line);
              // Re-apply query parameters of parent logic for strict providers
              if (parentUrlObj.search && !absoluteUrlObj.search) {
                absoluteUrlObj.search = parentUrlObj.search;
              }
              const encoded = urlSafeBase64Encode(absoluteUrlObj.toString());
              const filename = absoluteUrlObj.pathname.split('/').pop() || 'segment.ts';
              return `/proxy/${encoded}/${filename}`;
            } catch (e) { return line; }
          });

          return new Response(textContent, { status: 200, headers: returnHeaders });
        }

        // Pass standard segments/keys preserving origin headers and status (e.g. 206 Partial Content)
        return new Response(upstreamResponse.body, {
          status: upstreamResponse.status,
          statusText: upstreamResponse.statusText,
          headers: returnHeaders
        });
      }

      return new Response("Invalid Route", { status: 404 });

    } catch (err) {
      console.error("Worker Error:", err);
      return new Response("Service Error", { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
    }
  }
};
