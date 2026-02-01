import { dashboardCss } from './dashboard-css';
import { getDashboardJs, tailwindConfig } from './dashboard-js';
import { Icons } from './icons';

export const getDashboardHtml = (props: {
    appTitle: string;
    footerText: string;
    faviconSvg: string;
    startYear?: number;
    requireAuth?: boolean;
}) => `
<!DOCTYPE html>
<html lang="en" class="h-full antialiased">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${props.appTitle}</title>
    <link rel="icon" href="data:image/svg+xml,${encodeURIComponent(props.faviconSvg)}">
    <meta name="theme-color" content="#F2F2F7" media="(prefers-color-scheme: light)">
    <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/flag-icons@7.2.3/css/flag-icons.min.css" rel="stylesheet">
    ${tailwindConfig}
    ${dashboardCss}
</head>
<body class="h-full mesh-bg transition-colors duration-300 text-gray-900 dark:text-white">

    ${!props.requireAuth ? `
    <!-- Security Warning Toast -->
    <div id="securityToast" class="fixed top-24 left-4 md:left-6 z-40 w-auto max-w-sm bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-xl border border-yellow-200 dark:border-yellow-900/50 p-4 flex items-start gap-3 transition-all hover:scale-[1.02] fade-in-up">
        <div class="flex-shrink-0 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full text-yellow-600 dark:text-yellow-500">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
        </div>
        <div class="flex-1 pt-0.5">
            <div class="flex justify-between items-start mb-1">
                <h3 class="font-bold text-gray-900 dark:text-white text-sm" data-i18n="configNeeded">Security Alert</h3>
                <button id="minimizeToastBtn" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-0.5 -mr-1 -mt-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title="Minimize">
                    <div class="transform rotate-180 scale-75">${Icons.ui.chevronRight}</div>
                </button>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-2 leading-relaxed" data-i18n="configNeededDesc">
                API Key is not configured. Your dashboard is currently <strong>publicly accessible</strong>.
            </p>
            <button onclick="document.getElementById('securityToast').remove()" class="text-xs font-bold text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 uppercase tracking-wide" data-i18n="dismiss">
                Dismiss
            </button>
        </div>
    </div>
    ` : ''}

    <!-- DB Error Overlay -->
    <div id="dbErrorOverlay">
        <div class="text-center max-w-md px-8 py-10 bg-white/80 dark:bg-gray-900/80 rounded-3xl shadow-2xl border border-red-100 dark:border-red-900/30 backdrop-blur-xl">
            <div class="mb-6 flex justify-center">
                <div class="p-4 bg-red-100 dark:bg-red-900/30 rounded-full animate-bounce">
                    ${Icons.ui.error}
                </div>
            </div>
            <h2 class="text-2xl font-bold mb-3">Database Connection Failed</h2>
            <p class="text-gray-500 dark:text-gray-400 mb-8">Please check your D1 binding and configuration.</p>
            <div class="space-y-3">
                <a href="/setup" target="_blank" class="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all">Initialize Database</a>
                <a href="/" class="block w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold py-3.5 px-4 rounded-xl">Retry</a>
            </div>
        </div>
    </div>

    <!-- Loading Overlay -->
    <div id="loadingOverlay">
        <div class="flex flex-col items-center justify-center p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
            <div class="relative w-16 h-16 mb-4">
                <div class="absolute inset-0 border-4 border-gray-200/30 dark:border-gray-700/30 rounded-full"></div>
                ${Icons.ui.loading}
            </div>
            <span class="text-sm font-bold tracking-widest text-indigo-500 uppercase animate-pulse">Loading</span>
        </div>
    </div>

    <!-- Auth Modal -->
    <div id="authModal" class="hidden fixed inset-0 z-[60] bg-gray-900/60 backdrop-blur-md flex items-center justify-center fade-in-up">
        <div class="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-2xl w-full max-w-sm mx-4 border border-gray-100 dark:border-gray-800">
            <h3 class="text-xl font-bold text-center mb-6 text-gray-900 dark:text-white" data-i18n="enterKey">Enter Access Key</h3>
            <input type="password" id="authKey" class="w-full px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none mb-5" placeholder="API Key">
            <button id="authBtn" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all">Unlock</button>
        </div>
    </div>

    <div class="min-h-full flex flex-col">
        <!-- Navbar -->
        <div class="fixed top-6 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pointer-events-none">
            <nav class="mx-auto max-w-7xl glass-panel rounded-2xl shadow-xl pointer-events-auto">
                <div class="flex h-16 justify-between items-center px-6">
                    <div class="flex items-center gap-3 cursor-pointer group" id="navLogo">
                        <div class="relative w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                            ${Icons.ui.logo}
                            <div class="absolute top-2 right-2 w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-75"></div>
                            <div class="absolute top-2 right-2 w-1.5 h-1.5 bg-white rounded-full shadow-sm"></div>
                        </div>
                        <div>
                            <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">${props.footerText}</div>
                            <h1 class="text-xl font-black text-gray-900 dark:text-white leading-none" data-i18n="navTitle">${props.appTitle}</h1>
                        </div>
                    </div>

                    <div class="flex items-center gap-2">
                        <!-- Domain Filter -->
                        <div class="relative" id="domainFilterContainer">
                            <input type="hidden" id="domainFilter" value="">
                            <button id="domainFilterBtn" class="flex items-center justify-between min-w-[140px] px-3 py-2 bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 backdrop-blur-md rounded-xl border border-gray-200/50 dark:border-gray-700/50 text-sm font-bold transition-all">
                                <span id="domainFilterLabel" class="truncate max-w-[120px]" data-i18n="allDomains">All Domains</span>
                                ${Icons.ui.chevronDown.replace('<svg', '<svg id="domainFilterIcon"')}
                            </button>
                            <div id="domainFilterMenu" class="hidden absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 p-1 z-50 transition-all origin-top-right scale-95 opacity-0">
                                <div id="domainListContent" class="max-h-64 overflow-y-auto custom-scrollbar"></div>
                            </div>
                        </div>

                        <!-- Time Range -->
                        <div class="relative">
                            <input type="hidden" id="timeRange" value="all">
                            <button id="timeRangeBtn" class="flex items-center justify-between min-w-[120px] px-3 py-2 bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 backdrop-blur-md rounded-xl border border-gray-200/50 dark:border-gray-700/50 text-sm font-bold transition-all">
                                <span id="timeRangeLabel" data-i18n="all">All Time</span>
                                ${Icons.ui.chevronDown.replace('<svg', '<svg id="timeRangeIcon"')}
                            </button>
                            <div id="timeRangeMenu" class="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 p-1 z-50 transition-all origin-top-right scale-95 opacity-0">
                                <button class="time-option w-full text-left px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 flex justify-between items-center selected bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600" data-value="all"><span data-i18n="all">All Time</span>${Icons.ui.check.replace('class="', 'class="opacity-100 ')}</button>
                                <button class="time-option w-full text-left px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 flex justify-between items-center text-gray-700 dark:text-gray-200" data-value="24h"><span data-i18n="24h">Last 24h</span>${Icons.ui.check.replace('class="', 'class="opacity-0 ')}</button>
                                <button class="time-option w-full text-left px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 flex justify-between items-center text-gray-700 dark:text-gray-200" data-value="7d"><span data-i18n="7d">Last 7 Days</span>${Icons.ui.check.replace('class="', 'class="opacity-0 ')}</button>
                                <button class="time-option w-full text-left px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 flex justify-between items-center text-gray-700 dark:text-gray-200" data-value="30d"><span data-i18n="30d">Last 30 Days</span>${Icons.ui.check.replace('class="', 'class="opacity-0 ')}</button>
                                <button class="time-option w-full text-left px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 flex justify-between items-center text-gray-700 dark:text-gray-200" data-value="3m"><span data-i18n="3m">Last 3 Months</span>${Icons.ui.check.replace('class="', 'class="opacity-0 ')}</button>
                                <button class="time-option w-full text-left px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 flex justify-between items-center text-gray-700 dark:text-gray-200" data-value="6m"><span data-i18n="6m">Last 6 Months</span>${Icons.ui.check.replace('class="', 'class="opacity-0 ')}</button>
                                <button class="time-option w-full text-left px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 flex justify-between items-center text-gray-700 dark:text-gray-200" data-value="1y"><span data-i18n="1y">Last 1 Year</span>${Icons.ui.check.replace('class="', 'class="opacity-0 ')}</button>
                            </div>
                        </div>

                        <!-- Controls -->
                        <div class="flex items-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-1">
                            <button id="langToggle" class="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300 font-bold text-xs w-9 h-9 flex items-center justify-center">EN</button>
                            <div class="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                            <button id="themeToggle" class="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300">
                                <!-- Moon Icon (Visible in Light Mode -> Switch to Dark) -->
                                ${Icons.ui.moon.replace('<svg', '<svg id="theme-moon"')}
                                <!-- Sun Icon (Visible in Dark Mode -> Switch to Light) -->
                                ${Icons.ui.sun.replace('<svg', '<svg id="theme-sun"')}
                            </button>
                            <div class="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                            <button id="refreshToggle" class="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300 relative group">
                                ${Icons.ui.refresh}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
        </div>

        <!-- Main Content -->
        <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-10 fade-in-up">

            <!-- Global No Data -->
            <div id="globalNoData" class="hidden flex flex-col items-center justify-center py-20 text-center">
                <div class="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6 animate-float">
                    ${Icons.ui.empty}
                </div>
                <h2 class="text-3xl font-black text-gray-900 dark:text-white mb-4" data-i18n="welcomeTitle">Welcome to Analytics</h2>
                <p class="text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto mb-8" data-i18n="welcomeDesc">No data available yet. Add the tracking code to your website to get started.</p>
                <div class="bg-gray-900 dark:bg-black rounded-xl p-4 max-w-2xl w-full shadow-2xl relative group">
                    <button id="copyScriptBtn" class="absolute top-4 right-4 bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-gray-700" data-i18n="copyScript">Copy Script</button>
                    <code class="font-mono text-sm text-indigo-400 block text-left overflow-x-auto p-2">
                        &lt;script defer src="https://<span id="scriptDomain">...</span>/tracker.js" data-endpoint="https://.../api/event"&gt;&lt;/script&gt;
                    </code>
                </div>
            </div>

            <div id="dashboardContent" class="space-y-6">
                <!-- KPI Cards -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="stats-card p-6 relative overflow-hidden group">
                        <div class="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                        <div class="flex items-center gap-2 mb-2">
                            <div class="p-1.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-500">
                                ${Icons.stats.pv}
                            </div>
                            <h3 class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider" data-i18n="pageViews">Page Views</h3>
                        </div>
                        <div class="flex items-baseline gap-2">
                            <span class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400" id="totalPv" data-value="0">0</span>
                        </div>
                        <div class="mt-4 flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
                            <span class="flex items-center text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full text-xs mr-2">
                                ${Icons.stats.trendUp}
                                <span id="todayPv">0</span>
                            </span>
                            <span data-i18n="today">Today</span>
                        </div>
                    </div>

                    <div class="stats-card p-6 relative overflow-hidden group">
                        <div class="absolute right-0 top-0 w-32 h-32 bg-purple-500/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                        <div class="flex items-center gap-2 mb-2">
                            <div class="p-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-500">
                                ${Icons.stats.uv}
                            </div>
                            <h3 class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider" data-i18n="uniqueVisitors">Unique Visitors</h3>
                        </div>
                        <div class="flex items-baseline gap-2">
                            <span class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400" id="totalUv" data-value="0">0</span>
                        </div>
                        <div class="mt-4 flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
                            <span class="flex items-center text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full text-xs mr-2">
                                ${Icons.stats.trendUp}
                                <span id="todayUv">0</span>
                            </span>
                            <span data-i18n="today">Today</span>
                        </div>
                    </div>

                    <div class="stats-card p-6 relative overflow-hidden group">
                        <div class="absolute right-0 top-0 w-32 h-32 bg-pink-500/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                        <div class="flex items-center gap-2 mb-2">
                            <div class="p-1.5 bg-pink-50 dark:bg-pink-900/20 rounded-lg text-pink-500">
                                ${Icons.stats.bounce}
                            </div>
                            <h3 class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider" data-i18n="bounceRate">Bounce Rate</h3>
                        </div>
                        <div class="flex items-baseline gap-2">
                            <span class="text-4xl font-black text-gray-900 dark:text-white" id="bounceRate">0%</span>
                        </div>
                        <div class="mt-4 flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
                             <span data-i18n="singlePageSessions" class="text-xs">Single Page Visits</span>
                        </div>
                    </div>
                </div>

                <!-- Chart -->
                <div class="ios-card p-6 h-96 flex flex-col">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white" data-i18n="trends">Trends</h3>
                    </div>
                    <div class="flex-1 relative w-full min-h-0">
                        <canvas id="visitsChart"></canvas>
                        <div id="chartNoData" class="hidden absolute inset-0 flex items-center justify-center text-gray-400">
                            <span data-i18n="noData">No Data</span>
                        </div>
                    </div>
                </div>

                <!-- Tables Grid -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Top Pages -->
                    <div class="ios-card flex flex-col h-[500px]">
                        <div class="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-t-2xl">
                            <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <svg class="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                <span data-i18n="topPages">Top Pages</span>
                            </h3>
                        </div>
                        <div class="overflow-auto flex-1 custom-scrollbar relative">
                            <div class="sticky-header text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 grid grid-cols-[3rem_minmax(0,1fr)_6rem]">
                                <div class="px-3 py-2">#</div>
                                <div class="px-3 py-2" data-i18n="url">URL</div>
                                <div class="px-3 py-2 text-right" data-i18n="views">Views</div>
                            </div>
                            <div id="topPages-list"></div>
                        </div>
                    </div>

                    <!-- Referrers -->
                    <div class="ios-card flex flex-col h-[500px]">
                        <div class="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-t-2xl">
                            <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                ${Icons.ui.externalLink.replace('w-4 h-4 text-gray-400', 'w-5 h-5 text-purple-500')}
                                <span data-i18n="topReferrers">Referrers</span>
                            </h3>
                        </div>
                        <div class="overflow-auto flex-1 custom-scrollbar relative">
                            <div class="sticky-header text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 grid grid-cols-[3rem_minmax(0,1fr)_6rem]">
                                <div class="px-3 py-2">#</div>
                                <div class="px-3 py-2" data-i18n="referrer">Source</div>
                                <div class="px-3 py-2 text-right" data-i18n="views">Views</div>
                            </div>
                            <div id="topReferrers-list"></div>
                        </div>
                    </div>

                    <!-- Countries -->
                    <div class="ios-card flex flex-col h-[400px]">
                        <div class="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-t-2xl">
                            <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                ${Icons.ui.globe}
                                <span data-i18n="topCountries">Countries</span>
                            </h3>
                        </div>
                        <div class="overflow-auto flex-1 custom-scrollbar relative">
                            <div class="sticky-header text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 grid grid-cols-[3rem_minmax(0,1fr)_6rem]">
                                <div class="px-3 py-2">#</div>
                                <div class="px-3 py-2" data-i18n="country">Country</div>
                                <div class="px-3 py-2 text-right" data-i18n="views">Views</div>
                            </div>
                            <div id="topCountries-list"></div>
                        </div>
                    </div>

                    <!-- OS & Browser (Split) -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 h-[400px]">
                         <div class="ios-card flex flex-col h-full">
                            <div class="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-t-2xl">
                                <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    ${Icons.ui.os}
                                    <span data-i18n="topOS">OS</span>
                                </h3>
                            </div>
                            <div class="overflow-auto flex-1 custom-scrollbar relative">
                                <div class="sticky-header text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 grid grid-cols-[3rem_minmax(0,1fr)_6rem]">
                                    <div class="px-3 py-2">#</div>
                                    <div class="px-3 py-2" data-i18n="os">OS</div>
                                    <div class="px-3 py-2 text-right" data-i18n="views">Views</div>
                                </div>
                                <div id="topOS-list"></div>
                            </div>
                         </div>
                         <div class="ios-card flex flex-col h-full">
                            <div class="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-t-2xl">
                                <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    ${Icons.ui.browser}
                                    <span data-i18n="topBrowser">Browser</span>
                                </h3>
                            </div>
                            <div class="overflow-auto flex-1 custom-scrollbar relative">
                                <div class="sticky-header text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 grid grid-cols-[3rem_minmax(0,1fr)_6rem]">
                                    <div class="px-3 py-2">#</div>
                                    <div class="px-3 py-2" data-i18n="browser">Browser</div>
                                    <div class="px-3 py-2 text-right" data-i18n="views">Views</div>
                                </div>
                                <div id="topBrowsers-list"></div>
                            </div>
                         </div>
                    </div>
                </div>
            </div>

        </main>

        <!-- Footer -->
        <footer class="mt-auto py-6 text-center text-sm text-gray-400 dark:text-gray-600 transition-colors">
            <p>&copy; <span id="footerYear">${props.startYear || 2026}</span> <span data-i18n="navTitle">${props.appTitle}</span>. Powered by <a href="https://github.com/masterhulab/MHAnalytics" target="_blank" class="hover:text-indigo-500 transition-colors font-medium">${props.appTitle}</a>.</p>
        </footer>
    </div>
    ${getDashboardJs(props.appTitle, props.startYear || 2026, props.footerText)}
</body>
</html>
`;
