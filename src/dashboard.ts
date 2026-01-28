export const dashboardHtml = `
<!DOCTYPE html>
<html lang="en" class="h-full antialiased">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Analytics</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📊</text></svg>">
    <meta name="theme-color" content="#F2F2F7" media="(prefers-color-scheme: light)">
    <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
                    },
                    colors: {
                        ios: {
                            bg: '#F2F2F7',
                            card: '#FFFFFF',
                            blue: '#007AFF',
                            green: '#34C759',
                            indigo: '#5856D6',
                            orange: '#FF9500',
                            red: '#FF3B30',
                            teal: '#30B0C7',
                            gray: '#8E8E93',
                            lightGray: '#E5E5EA',
                            separator: '#C6C6C8'
                        }
                    },
                    boxShadow: {
                        'ios': '0 2px 8px rgba(0, 0, 0, 0.04), 0 8px 16px rgba(0, 0, 0, 0.04)',
                        'ios-hover': '0 4px 12px rgba(0, 0, 0, 0.08), 0 12px 24px rgba(0, 0, 0, 0.08)',
                        'glow': '0 0 20px rgba(88, 86, 214, 0.15)',
                        'glow-lg': '0 0 30px rgba(88, 86, 214, 0.25)',
                    },
                    animation: {
                        'float': 'float 6s ease-in-out infinite',
                        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                        'fade-in': 'fadeIn 0.5s ease-out forwards',
                        'shimmer': 'shimmer 2s infinite linear',
                        'gradient-x': 'gradient-x 3s ease infinite',
                    },
                    keyframes: {
                        float: {
                            '0%, 100%': { transform: 'translateY(0)' },
                            '50%': { transform: 'translateY(-5px)' },
                        },
                        fadeIn: {
                            '0%': { opacity: '0', transform: 'translateY(10px)' },
                            '100%': { opacity: '1', transform: 'translateY(0)' },
                        },
                        shimmer: {
                            '0%': { backgroundPosition: '-1000px 0' },
                            '100%': { backgroundPosition: '1000px 0' }
                        },
                        'gradient-x': {
                            '0%, 100%': {
                                'background-size': '200% 200%',
                                'background-position': 'left center'
                            },
                            '50%': {
                                'background-size': '200% 200%',
                                'background-position': 'right center'
                            },
                        },
                    }
                }
            }
        }
    </script>
    <style>
        body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        .text-gradient {
            background: linear-gradient(to right, #30CFD0 0%, #330867 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .dark .text-gradient {
            background: linear-gradient(to right, #a18cd1 0%, #fbc2eb 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        /* Vibrant Mesh Gradient */
        .mesh-bg {
            background-color: #F2F2F7;
            background-image: 
                radial-gradient(at 0% 0%, hsla(253,16%,7%,0) 0, transparent 50%), 
                radial-gradient(at 50% 100%, hsla(225,39%,30%,0) 0, transparent 50%);
            position: relative;
        }
        
        .mesh-bg::before {
            content: '';
            position: fixed;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle at center, rgba(88, 86, 214, 0.03) 0%, transparent 50%);
            z-index: -1;
            animation: pulse-slow 8s infinite;
        }
        
        .dark .mesh-bg {
            background-color: #050505;
            background-image: 
                radial-gradient(at 0% 0%, rgba(88, 86, 214, 0.15) 0, transparent 50%), 
                radial-gradient(at 100% 100%, rgba(52, 199, 89, 0.05) 0, transparent 50%);
        }

        .glass-panel {
            background: rgba(255, 255, 255, 0.65);
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.5);
        }
        
        .dark .glass-panel {
            background: rgba(28, 28, 30, 0.65);
            border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .ios-card {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.4);
            border-radius: 24px;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.02);
            transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
            position: relative;
            overflow: hidden;
        }
        
        .dark .ios-card {
            background: rgba(30, 30, 35, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
        }

        .ios-card:hover {
            transform: translateY(-4px) scale(1.005);
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
            border-color: rgba(88, 86, 214, 0.2);
            background: rgba(255, 255, 255, 0.85);
        }
        
        .dark .ios-card:hover {
            border-color: rgba(255, 255, 255, 0.15);
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
            background: rgba(40, 40, 45, 0.8);
        }

        /* Loading & Error Overlays */
        #dbErrorOverlay, #loadingOverlay {
            position: fixed;
            inset: 0;
            z-index: 100;
            display: flex;
            justify-content: center;
            align-items: center;
            backdrop-filter: blur(10px);
            transition: opacity 0.3s;
        }
        
        #dbErrorOverlay {
            background: rgba(255, 255, 255, 0.8);
            z-index: 200;
            opacity: 0;
            pointer-events: none;
        }
        .dark #dbErrorOverlay { background: rgba(0, 0, 0, 0.8); }
        
        #dbErrorOverlay.show { opacity: 1; pointer-events: auto; }
        
        #loadingOverlay { background: rgba(255, 255, 255, 0.3); }
        .dark #loadingOverlay { background: rgba(0, 0, 0, 0.3); }
        .hidden { opacity: 0; pointer-events: none; }

        /* Skeleton Loading */
        .skeleton {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 1000px 100%;
            animation: shimmer 2s infinite linear;
            border-radius: 8px;
        }
        .dark .skeleton {
            background: linear-gradient(90deg, #1f1f1f 25%, #2a2a2a 50%, #1f1f1f 75%);
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.3); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(156, 163, 175, 0.5); }

        .fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; transform: translateY(20px); }
        @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
        
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
        .delay-500 { animation-delay: 500ms; }

        /* Progress Bar Animation */
        .bar-bg {
            position: absolute;
            top: 0; bottom: 0; left: 0;
            background: linear-gradient(90deg, rgba(88, 86, 214, 0.08), rgba(88, 86, 214, 0.18));
            z-index: 0;
            border-radius: 0 8px 8px 0;
            transition: width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .dark .bar-bg { background: linear-gradient(90deg, rgba(94, 92, 230, 0.1), rgba(94, 92, 230, 0.25)); }
        
        /* Table Row Hover */
        tbody tr { transition: all 0.2s ease; position: relative; }
        tbody tr:hover { 
            background-color: rgba(88, 86, 214, 0.03); 
            transform: translateX(2px);
        }
        .dark tbody tr:hover { 
            background-color: rgba(94, 92, 230, 0.05); 
        }

        tbody tr::before {
            content: '';
            position: absolute;
            left: 0; top: 2px; bottom: 2px;
            width: 3px;
            background: #5856D6;
            opacity: 0;
            transition: opacity 0.2s;
            border-radius: 0 4px 4px 0;
        }
        .dark tbody tr::before { background: #5E5CE6; }
        tbody tr:hover::before { opacity: 1; }

        .sticky-header th {
            position: sticky;
            top: 0;
            z-index: 10;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(8px);
        }
        .dark .sticky-header th {
            background: rgba(30, 30, 35, 0.9);
        }

        .icon-box {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            border-radius: 10px;
            transition: transform 0.3s ease;
        }
        .ios-card:hover .icon-box {
            transform: scale(1.1) rotate(5deg);
        }
    </style>
</head>
<body class="h-full mesh-bg transition-colors duration-300 text-gray-900 dark:text-white">
    <!-- DB Error Overlay -->
    <div id="dbErrorOverlay">
        <div class="text-center max-w-md px-8 py-10 bg-white/80 dark:bg-gray-900/80 rounded-3xl shadow-2xl border border-red-100 dark:border-red-900/30 backdrop-blur-xl animate-fade-in">
            <div class="mb-6 flex justify-center">
                <div class="p-4 bg-red-100 dark:bg-red-900/30 rounded-full animate-bounce">
                    <svg class="h-10 w-10 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
            </div>
            <h2 class="text-2xl font-bold mb-3">Database Not Configured</h2>
            <p class="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                The database connection failed. This usually means the D1 database is not bound correctly.
            </p>
            <div class="space-y-3">
                <a href="/setup" target="_blank" class="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transform hover:-translate-y-0.5">
                    Initialize Database
                </a>
                <a href="/" class="block w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold py-3.5 px-4 rounded-xl transition-colors">
                    Retry / Refresh
                </a>
            </div>
        </div>
    </div>

    <!-- Loading Overlay -->
    <div id="loadingOverlay">
        <div class="relative flex flex-col items-center justify-center">
            <!-- Glow Effect -->
            <div class="absolute inset-0 rounded-full blur-2xl bg-indigo-500/20 animate-pulse-slow"></div>
            
            <!-- Spinner Container -->
            <div class="relative w-24 h-24">
                <!-- Track -->
                <div class="absolute inset-0 border-[3px] border-gray-100 dark:border-gray-800 rounded-full"></div>
                
                <!-- Main Spinner (Fast) -->
                <div class="absolute inset-0 border-[3px] border-indigo-500 border-t-transparent border-r-transparent rounded-full animate-[spin_0.8s_linear_infinite] shadow-[0_0_15px_rgba(99,102,241,0.4)]"></div>
                
                <!-- Inner Spinner (Slow Reverse) -->
                <div class="absolute inset-3 border-[3px] border-purple-500/50 border-b-transparent border-l-transparent rounded-full animate-[spin_3s_linear_infinite_reverse]"></div>
                
                <!-- Center Icon -->
                <div class="absolute inset-0 flex items-center justify-center">
                    <div class="relative">
                        <div class="absolute inset-0 bg-indigo-500 blur-lg opacity-20 animate-pulse"></div>
                        <svg class="h-8 w-8 text-indigo-600 dark:text-indigo-400 animate-pulse drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                </div>
            </div>
            
            <!-- Loading Text -->
            <div class="mt-8 flex flex-col items-center gap-2">
                <span class="text-sm font-bold tracking-[0.3em] text-indigo-600 dark:text-indigo-400 animate-pulse uppercase">Analytics</span>
                <span class="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest">Loading Data...</span>
            </div>
        </div>
    </div>

    <!-- Auth Modal -->
    <div id="authModal" class="hidden fixed inset-0 z-[60] bg-gray-900/60 backdrop-blur-md flex items-center justify-center fade-in-up">
        <div class="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-2xl w-full max-w-sm mx-4 border border-gray-100 dark:border-gray-800 transform transition-all scale-100">
            <div class="text-center mb-6">
                <div class="mx-auto w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
                    <svg class="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white" data-i18n="enterKey">Enter Access Key</h3>
            </div>
            <input type="password" id="authKey" class="w-full px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-5 outline-none transition-all placeholder-gray-400" placeholder="API Key">
            <button id="authBtn" class="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50">Unlock Dashboard</button>
        </div>
    </div>

    <div class="min-h-full flex flex-col">
        <!-- Floating Navbar -->
        <div class="fixed top-6 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pointer-events-none">
            <nav class="mx-auto max-w-7xl glass-panel rounded-2xl shadow-xl transition-all duration-300 pointer-events-auto">
                <div class="flex h-16 justify-between items-center px-6">
                    <div class="flex items-center gap-3.5 cursor-pointer group" id="navLogo">
                        <!-- Logo Container -->
                        <div class="relative w-10 h-10">
                            <!-- Background Glow (Animated Color) -->
                            <div class="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-500 rounded-xl animate-pulse-slow"></div>
                            
                            <!-- Main Box -->
                            <div class="relative w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 border border-white/20 group-hover:scale-105 transition-transform duration-300">
                                
                                <!-- Icon -->
                                <svg class="h-5 w-5 text-white drop-shadow-md transition-transform duration-500 group-hover:rotate-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>

                            <!-- Status Dot -->
                            <span class="absolute -top-1 -right-1 flex h-3 w-3">
                                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 duration-1000"></span>
                                <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-white dark:border-gray-900 shadow-sm"></span>
                            </span>
                        </div>

                        <!-- Text -->
                        <div class="flex flex-col">
                            <span id="navAuthor" class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none mb-0.5 group-hover:text-indigo-500 transition-colors duration-300">Master Hu</span>
                            <h1 class="text-xl font-black tracking-tight text-gray-900 dark:text-white leading-none group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-300" data-i18n="navTitle">MH Analytics</h1>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-1.5 sm:gap-3">
                        <!-- Domain Selector -->
                         <div class="relative hidden sm:block" id="domainFilterContainer">
                            <input type="hidden" id="domainFilter" value="">
                            
                            <button id="domainFilterBtn" class="flex items-center justify-between min-w-[160px] px-3.5 py-2 bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 backdrop-blur-md text-gray-700 dark:text-gray-200 text-sm font-bold rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm transition-all active:scale-95 outline-none group hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900/50">
                                <div class="flex items-center">
                                    <div class="p-1 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400 mr-2.5 group-hover:scale-110 transition-transform">
                                        <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                                    </div>
                                    <span id="domainFilterLabel" class="truncate max-w-[100px]" data-i18n="allDomains">All Domains</span>
                                </div>
                                <svg class="h-4 w-4 text-gray-400 transition-transform duration-300 group-hover:rotate-180 flex-shrink-0" id="domainFilterIcon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                            </button>

                            <div id="domainFilterMenu" class="hidden absolute top-full right-0 mt-2 w-64 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 transform origin-top-right transition-all duration-200 opacity-0 scale-95 ring-1 ring-black/5">
                                <div class="p-1.5 space-y-0.5 max-h-80 overflow-y-auto custom-scrollbar" id="domainListContent">
                                    <!-- Options injected via JS -->
                                </div>
                            </div>
                        </div>

                        <!-- Time Range -->
                         <div class="relative" id="timeRangeContainer">
                            <input type="hidden" id="timeRange" value="24h">
                            
                            <button id="timeRangeBtn" class="flex items-center justify-between min-w-[150px] px-3.5 py-2 bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 backdrop-blur-md text-gray-700 dark:text-gray-200 text-sm font-bold rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm transition-all active:scale-95 outline-none group hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900/50">
                                <div class="flex items-center">
                                    <div class="p-1 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400 mr-2.5 group-hover:scale-110 transition-transform">
                                        <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                    </div>
                                    <span id="timeRangeLabel" data-i18n="last24h">Last 24h</span>
                                </div>
                                <svg class="h-4 w-4 ml-2 text-gray-400 transition-transform duration-300 group-hover:rotate-180" id="timeRangeIcon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                            </button>

                            <div id="timeRangeMenu" class="hidden absolute top-full right-0 mt-2 w-48 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 transform origin-top-right transition-all duration-200 opacity-0 scale-95 ring-1 ring-black/5">
                                <div class="p-1.5 space-y-0.5">
                                    <button class="time-option w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center justify-between group selected" data-value="24h">
                                        <span data-i18n="last24h">Last 24h</span>
                                        <svg class="h-4 w-4 text-indigo-600 opacity-0 group-[.selected]:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                                    </button>
                                    <button class="time-option w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center justify-between group" data-value="7d">
                                        <span data-i18n="last7d">Last 7 Days</span>
                                        <svg class="h-4 w-4 text-indigo-600 opacity-0 group-[.selected]:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                                    </button>
                                    <button class="time-option w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center justify-between group" data-value="30d">
                                        <span data-i18n="last30d">Last 30 Days</span>
                                        <svg class="h-4 w-4 text-indigo-600 opacity-0 group-[.selected]:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="h-8 w-px bg-gray-200/50 dark:bg-gray-700/50 hidden sm:block mx-1"></div>

                        <!-- Theme Toggle -->
                        <button id="themeToggle" class="relative p-2.5 rounded-xl text-gray-500 hover:bg-yellow-50 dark:hover:bg-gray-800 hover:text-yellow-600 dark:text-gray-400 dark:hover:text-yellow-400 transition-all active:scale-95 group overflow-hidden">
                            <div class="absolute inset-0 bg-yellow-100/50 dark:bg-yellow-900/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
                            <svg id="sunIcon" class="relative h-5 w-5 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <svg id="moonIcon" class="relative h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        </button>

                        <!-- Language Toggle -->
                        <button id="langToggle" class="group relative px-3 py-2 flex items-center justify-center rounded-xl text-gray-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-all font-bold text-sm active:scale-95" title="Switch Language">
                             <div class="flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg>
                                <span id="langLabel" class="text-xs">EN</span>
                             </div>
                        </button>

                        <!-- Auto Refresh -->
                        <button id="refreshToggle" class="relative p-2.5 rounded-full text-gray-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-all duration-300 active:scale-90 group hover:shadow-[0_0_15px_rgba(99,102,241,0.5)]" title="Auto Refresh">
                            <svg class="h-5 w-5 transition-all duration-500 ease-out group-hover:rotate-[360deg] group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>
        </div>

        <main class="pt-32 pb-12 flex-grow">
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                
                <!-- Stats Grid -->
                <div class="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-3 mb-8">
                    <!-- Total PV -->
                    <div class="ios-card p-6 fade-in-up hover:shadow-glow group">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider" data-i18n="totalPv">Total Views</h3>
                            <div class="icon-box bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400">
                                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </div>
                        </div>
                        <div class="flex items-baseline gap-2">
                            <div class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight tabular-nums group-hover:scale-105 transition-transform origin-left" id="totalPv">0</div>
                        </div>
                        <div class="mt-4 flex items-center">
                            <div class="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center">
                                <span data-i18n="today">Today</span>
                                <span class="mx-1">:</span>
                                <span class="tabular-nums" id="todayPv">0</span>
                            </div>
                        </div>
                    </div>

                    <!-- Total UV -->
                    <div class="ios-card p-6 fade-in-up delay-100 hover:shadow-glow group">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider" data-i18n="uniqueVisitors">Unique Visitors</h3>
                            <div class="icon-box bg-green-50 dark:bg-green-900/20 text-green-500 dark:text-green-400">
                                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                        <div class="flex items-baseline gap-2">
                            <div class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight tabular-nums group-hover:scale-105 transition-transform origin-left" id="totalUv">0</div>
                        </div>
                        <div class="mt-4 flex items-center">
                            <div class="px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold flex items-center">
                                <span data-i18n="today">Today</span>
                                <span class="mx-1">:</span>
                                <span class="tabular-nums" id="todayUv">0</span>
                            </div>
                        </div>
                    </div>

                    <!-- Bounce Rate -->
                    <div class="ios-card p-6 fade-in-up delay-200 hover:shadow-glow group">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider" data-i18n="bounceRate">Bounce Rate</h3>
                            <div class="icon-box bg-orange-50 dark:bg-orange-900/20 text-orange-500 dark:text-orange-400">
                                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                        </div>
                        <div class="flex items-baseline gap-2">
                            <div class="text-4xl font-black text-gradient tracking-tight tabular-nums group-hover:scale-105 transition-transform origin-left" id="bounceRate">0%</div>
                        </div>
                         <div class="mt-4 text-xs font-medium text-gray-400 dark:text-gray-500 flex items-center">
                             <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <span data-i18n="singlePageSessions">Single page sessions</span>
                        </div>
                    </div>
                </div>

                <!-- Chart -->
                <div class="ios-card p-6 mb-8 fade-in-up delay-300">
                     <div class="flex justify-between items-center mb-6">
                        <div class="flex items-center gap-3">
                            <div class="h-8 w-1.5 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full shadow-lg shadow-indigo-500/30"></div>
                            <h3 class="text-lg font-bold text-gray-900 dark:text-white" data-i18n="trafficOverview">Traffic Overview</h3>
                        </div>
                     </div>
                     <div class="relative h-80 w-full">
                        <canvas id="visitsChart"></canvas>
                        <!-- Chart Skeleton -->
                        <div id="chartSkeleton" class="absolute inset-0 skeleton hidden"></div>
                     </div>
                </div>

                <!-- Tables Grid -->
                <div class="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-8">
                    <!-- Top Pages -->
                    <div class="ios-card overflow-hidden fade-in-up delay-100 flex flex-col h-[500px]">
                        <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30 backdrop-blur-sm">
                             <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                <span data-i18n="topPages">Top Pages</span>
                             </h3>
                        </div>
                        <!-- Table Header (Fixed) -->
                        <div class="grid grid-cols-[3rem_minmax(0,1fr)_6rem] border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-md z-10">
                            <div class="py-3 pl-3 pr-2 text-left text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">#</div>
                            <div class="py-3 pl-2 pr-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500" data-i18n="url">URL</div>
                            <div class="py-3 px-3 pr-6 text-right text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500" data-i18n="views">Views</div>
                        </div>
                        <div class="overflow-y-auto flex-grow custom-scrollbar relative" id="topPages-container">
                            <div id="topPages-list" class="divide-y divide-gray-50 dark:divide-gray-800/50"></div>
                            <!-- Table Skeleton -->
                             <div class="absolute inset-0 bg-white dark:bg-gray-900 z-10 p-4 space-y-3 hidden" id="topPagesSkeleton">
                                <div class="h-8 skeleton w-full"></div>
                                <div class="h-8 skeleton w-full"></div>
                                <div class="h-8 skeleton w-full"></div>
                                <div class="h-8 skeleton w-full"></div>
                                <div class="h-8 skeleton w-full"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Top Referrers -->
                    <div class="ios-card overflow-hidden fade-in-up delay-200 flex flex-col h-[500px]">
                        <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30 backdrop-blur-sm">
                             <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <svg class="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                                <span data-i18n="topReferrers">Top Referrers</span>
                             </h3>
                        </div>
                        <!-- Table Header (Fixed) -->
                        <div class="grid grid-cols-[3rem_minmax(0,1fr)_6rem] border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-md z-10">
                            <div class="py-3 pl-3 pr-2 text-left text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">#</div>
                            <div class="py-3 pl-2 pr-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500" data-i18n="referrer">Referrer</div>
                            <div class="py-3 px-3 pr-6 text-right text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500" data-i18n="views">Views</div>
                        </div>
                        <div class="overflow-y-auto flex-grow custom-scrollbar relative" id="topReferrers-container">
                            <div id="topReferrers-list" class="divide-y divide-gray-50 dark:divide-gray-800/50"></div>
                        </div>
                    </div>
                </div>

                <!-- Row 4: Countries / OS / Browser -->
                <div class="grid grid-cols-1 gap-8 lg:grid-cols-3 mb-8">
                    
                    <!-- Countries -->
                    <div class="ios-card overflow-hidden fade-in-up delay-300 flex flex-col h-[400px]">
                        <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
                                <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    <span data-i18n="topCountries">Top Countries</span>
                                </h3>
                        </div>
                        <!-- Table Header (Fixed) -->
                        <div class="grid grid-cols-[3rem_minmax(0,1fr)_6rem] border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-md z-10">
                            <div class="py-3 pl-3 pr-2 text-left text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">#</div>
                            <div class="py-3 pl-2 pr-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500" data-i18n="country">Country</div>
                            <div class="py-3 px-3 pr-6 text-right text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500" data-i18n="visitors">Visitors</div>
                        </div>
                        <div class="overflow-y-auto flex-grow custom-scrollbar relative" id="topCountries-container">
                            <div id="topCountries-list" class="divide-y divide-gray-50 dark:divide-gray-800/50"></div>
                        </div>
                    </div>

                    <!-- OS -->
                    <div class="ios-card overflow-hidden fade-in-up delay-400 flex flex-col h-[400px]">
                        <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
                                <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                    <span data-i18n="topOS">Operating System</span>
                                </h3>
                        </div>
                        <!-- Table Header (Fixed) -->
                        <div class="grid grid-cols-[3rem_minmax(0,1fr)_6rem] border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-md z-10">
                            <div class="py-3 pl-3 pr-2 text-left text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">#</div>
                            <div class="py-3 pl-2 pr-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500" data-i18n="os">OS</div>
                            <div class="py-3 px-3 pr-6 text-right text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500" data-i18n="users">Users</div>
                        </div>
                        <div class="overflow-y-auto flex-grow custom-scrollbar relative" id="topOS-container">
                            <div id="topOS-list" class="divide-y divide-gray-50 dark:divide-gray-800/50"></div>
                        </div>
                    </div>

                    <!-- Browser -->
                    <div class="ios-card overflow-hidden fade-in-up delay-500 flex flex-col h-[400px]">
                        <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
                                <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                                    <span data-i18n="topBrowser">Browser</span>
                                </h3>
                        </div>
                        <!-- Table Header (Fixed) -->
                        <div class="grid grid-cols-[3rem_minmax(0,1fr)_6rem] border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-md z-10">
                            <div class="py-3 pl-3 pr-2 text-left text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">#</div>
                            <div class="py-3 pl-2 pr-3 text-left text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500" data-i18n="browser">Browser</div>
                            <div class="py-3 px-3 pr-6 text-right text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500" data-i18n="users">Users</div>
                        </div>
                        <div class="overflow-y-auto flex-grow custom-scrollbar relative" id="topBrowsers-container">
                            <div id="topBrowsers-list" class="divide-y divide-gray-50 dark:divide-gray-800/50"></div>
                        </div>
                    </div>

                </div>

            </div>
        </main>

        <!-- Footer -->
        <footer class="text-center pb-8 text-gray-400 dark:text-gray-600 text-sm fade-in-up delay-500">
            <p data-i18n="footer">Copyright &copy; 2026 <a href="https://github.com/masterhulab" target="_blank" class="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors">masterhulab</a></p>
        </footer>
    </div>

    <script>
        // --- Internationalization (i18n) ---
        const translations = {
            en: {
                title: 'MH Analytics',
                navTitle: 'MH Analytics',
                last24h: 'Last 24h',
                last7d: 'Last 7 Days',
                last30d: 'Last 30 Days',
                totalPv: 'Total Views',
                uniqueVisitors: 'Unique Visitors',
                bounceRate: 'Bounce Rate',
                trafficOverview: 'Traffic Overview',
                topPages: 'Top Pages',
                topReferrers: 'Top Referrers',
                topCountries: 'Top Countries',
                topOS: 'Operating System',
                topBrowser: 'Browser',
                url: 'URL',
                views: 'Views',
                referrer: 'Referrer',
                country: 'Country',
                os: 'System',
                browser: 'App',
                visitors: 'Visitors',
                users: 'Users',
                noData: 'No data available',
                unknown: '(Direct/Unknown)',
                chartLabel: 'Page Views',
                today: 'Today',
                footer: 'Copyright © 2026 ',
                allDomains: 'All Domains',
                enterKey: 'Enter Access Key',
                singlePageSessions: 'Single page sessions'
            },
            zh: {
                title: 'MH Analytics',
                navTitle: 'MH Analytics',
                last24h: '24 小时',
                last7d: '最近 7 天',
                last30d: '最近 30 天',
                totalPv: '总浏览量',
                uniqueVisitors: '独立访客',
                bounceRate: '跳出率',
                trafficOverview: '流量趋势',
                topPages: '热门页面',
                topReferrers: '来源分析',
                topCountries: '访客地区',
                topOS: '操作系统',
                topBrowser: '浏览器',
                url: '页面地址',
                views: '浏览次数',
                referrer: '来源地址',
                country: '国家/地区',
                os: '系统',
                browser: '软件',
                visitors: '访客数',
                users: '用户数',
                noData: '暂无数据',
                unknown: '(直接访问/未知)',
                chartLabel: '浏览量',
                today: '今日',
                footer: 'Copyright © 2026 ',
                allDomains: '全部域名',
                enterKey: '请输入访问密钥',
                singlePageSessions: '单页访问 (跳出)'
            }
        };

        let currentLang = 'en';
        let chartInstance = null;
        let lastChartData = null;
        let autoRefreshInterval = null;

        function detectLanguage() {
            const storedLang = localStorage.getItem('lang');
            if (storedLang) return storedLang;
            
            const browserLang = navigator.language || navigator.userLanguage;
            if (browserLang.toLowerCase().startsWith('zh')) {
                return 'zh';
            }
            return 'en';
        }

        function setLanguage(lang) {
            currentLang = lang;
            localStorage.setItem('lang', lang);
            
            const langLabel = document.getElementById('langLabel');
            if (langLabel) {
                langLabel.textContent = lang === 'en' ? 'EN' : '中';
            }

            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (translations[lang][key]) {
                    if (key === 'footer') {
                        const link = el.querySelector('a');
                        el.firstChild.textContent = translations[lang][key];
                        if(link) el.appendChild(link);
                    } else {
                        el.textContent = translations[lang][key];
                    }
                }
            });

            if (translations[lang]['title']) {
                document.title = translations[lang]['title'];
            }

            if (lastChartData) {
                updateChart(lastChartData);
                const currentData = window.lastFetchedData;
                if (currentData) {
                    renderAllTables(currentData);
                }
            }
        }

        function getFlagEmoji(countryCode) {
            if (!countryCode || countryCode === 'unknown' || countryCode.length !== 2) return '<i class="fas fa-globe text-gray-400"></i>';
            const code = countryCode.toLowerCase();
            return '<img src="https://flagcdn.com/w40/' + code + '.png" srcset="https://flagcdn.com/w80/' + code + '.png 2x" width="24" height="18" alt="' + countryCode + '" class="rounded-sm shadow-sm object-cover inline-block">';
        }

        // --- Icon Helpers ---
        function getOSIcon(os) {
            if (!os) return '<i class="fas fa-desktop text-gray-400"></i>';
            os = os.toLowerCase();
            if (os.includes('win')) return '<i class="fab fa-windows text-blue-500"></i>';
            if (os.includes('mac') || os.includes('osx')) return '<i class="fab fa-apple text-gray-900 dark:text-gray-100"></i>';
            if (os.includes('iphone') || os.includes('ipad') || os.includes('ios')) return '<i class="fab fa-apple text-gray-900 dark:text-gray-100"></i>';
            if (os.includes('android')) return '<i class="fab fa-android text-green-500"></i>';
            if (os.includes('linux') || os.includes('ubuntu') || os.includes('debian') || os.includes('fedora') || os.includes('redhat') || os.includes('suse')) return '<i class="fab fa-linux text-yellow-600"></i>';
            if (os.includes('cros') || os.includes('chrome os')) return '<i class="fab fa-chrome text-blue-400"></i>';
            return '<i class="fas fa-desktop text-gray-400"></i>';
        }

        function getBrowserIcon(browser) {
            if (!browser) return '<i class="fas fa-globe text-gray-400"></i>';
            browser = browser.toLowerCase();
            if (browser.includes('chrome') || browser.includes('crios')) return '<i class="fab fa-chrome text-blue-500"></i>';
            if (browser.includes('firefox') || browser.includes('fxios')) return '<i class="fab fa-firefox-browser text-orange-500"></i>';
            if (browser.includes('safari')) return '<i class="fab fa-safari text-blue-400"></i>';
            if (browser.includes('edge') || browser.includes('edg')) return '<i class="fab fa-edge text-blue-600"></i>';
            if (browser.includes('opera') || browser.includes('opr')) return '<i class="fab fa-opera text-red-500"></i>';
            if (browser.includes('ie') || browser.includes('msie') || browser.includes('trident')) return '<i class="fab fa-internet-explorer text-blue-400"></i>';
            if (browser.includes('samsung')) return '<i class="fas fa-mobile-alt text-purple-500"></i>';
            return '<i class="fas fa-globe text-gray-400"></i>';
        }

        function getFavicon(url) {
            try {
                if (!url.startsWith('http')) return '';
                const domain = new URL(url).hostname;
            return 'https://www.google.com/s2/favicons?domain=' + domain + '&sz=32';
        } catch (e) {
                return '';
            }
        }

        currentLang = detectLanguage();
        setLanguage(currentLang);

        document.getElementById('langToggle').addEventListener('click', () => {
            const newLang = currentLang === 'en' ? 'zh' : 'en';
            setLanguage(newLang);
        });

        // Auto Refresh
        const refreshToggle = document.getElementById('refreshToggle');
        
        // Add a status dot dynamically if it doesn't exist
        if (!document.getElementById('refreshStatusDot')) {
            const dot = document.createElement('span');
            dot.id = 'refreshStatusDot';
            dot.className = 'absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white dark:border-gray-900 opacity-0 transition-opacity duration-300';
            refreshToggle.appendChild(dot);
        }
        const refreshStatusDot = document.getElementById('refreshStatusDot');

        refreshToggle.addEventListener('click', () => {
            if (autoRefreshInterval) {
                // Turn OFF
                clearInterval(autoRefreshInterval);
                autoRefreshInterval = null;
                
                // Visual State: OFF
                refreshToggle.classList.remove('bg-indigo-100', 'dark:bg-indigo-900/50', 'text-indigo-600', 'dark:text-indigo-400', 'ring-2', 'ring-indigo-500/50');
                refreshToggle.classList.add('text-gray-500', 'dark:text-gray-400');
                refreshStatusDot.classList.remove('opacity-100');
                refreshStatusDot.classList.add('opacity-0');
                
                refreshToggle.setAttribute('title', 'Auto Refresh: OFF');
            } else {
                // Turn ON
                loadData(false); 
                autoRefreshInterval = setInterval(() => loadData(false), 30000); 
                
                // Visual State: ON
                refreshToggle.classList.remove('text-gray-500', 'dark:text-gray-400');
                refreshToggle.classList.add('bg-indigo-100', 'dark:bg-indigo-900/50', 'text-indigo-600', 'dark:text-indigo-400', 'ring-2', 'ring-indigo-500/50');
                refreshStatusDot.classList.remove('opacity-0');
                refreshStatusDot.classList.add('opacity-100');
                
                refreshToggle.setAttribute('title', 'Auto Refresh: ON (30s)');
            }
        });

        // Theme Logic
        const themeToggle = document.getElementById('themeToggle');
        const sunIcon = document.getElementById('sunIcon');
        const moonIcon = document.getElementById('moonIcon');
        
        function updateTheme() {
            if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
                sunIcon.classList.remove('hidden');
                moonIcon.classList.add('hidden');
            } else {
                document.documentElement.classList.remove('dark');
                sunIcon.classList.add('hidden');
                moonIcon.classList.remove('hidden');
            }
        }

        themeToggle.addEventListener('click', () => {
            if (document.documentElement.classList.contains('dark')) {
                localStorage.theme = 'light';
            } else {
                localStorage.theme = 'dark';
            }
            updateTheme();
            updateChartTheme(); 
        });

        updateTheme();

        async function loadData(showLoading = true) {
            const overlay = document.getElementById('loadingOverlay');
            if (showLoading) overlay.classList.remove('hidden');

            const refreshBtn = document.getElementById('refreshToggle');
            const refreshIcon = refreshBtn ? refreshBtn.querySelector('svg') : null;
            
            if(refreshBtn) {
                refreshBtn.classList.add('animate-pulse');
                // Only modify text color if not in active state
                if (!autoRefreshInterval) {
                     refreshBtn.classList.add('text-indigo-600', 'dark:text-indigo-400');
                }
            }

            if(refreshIcon) {
                 refreshIcon.classList.add('animate-spin');
                 // Remove custom rotation if present to let spin animation take over
                 refreshIcon.classList.remove('group-hover:rotate-[360deg]', 'group-hover:scale-110'); 
            }

            const range = document.getElementById('timeRange').value;
            const domain = document.getElementById('domainFilter').value;
            
            try {
                // --- MOCK DATA FOR LOCAL DEV ---
                const USE_MOCK_DATA = false; // Set to true to see fake data
                
                if (USE_MOCK_DATA) {
                    await new Promise(r => setTimeout(r, 500)); // Simulate network delay
                    const data = {
                        summary: { pv: 12345, uv: 5678, bounceRate: 42, todayPv: 150, todayUv: 80 },
                        topPages: [
                            { key: '/', count: 5000 },
                            { key: '/blog/tech/2024/new-features-and-improvements', count: 3000 },
                            { key: '/about', count: 1000 },
                            { key: '/very/long/url/path/that/should/be/truncated/because/it/exceeds/the/column/width/limit/and/we/want/to/test/css/overflow-behavior', count: 500 },
                            { key: '/contact', count: 100 },
                            { key: '/pricing', count: 50 },
                            { key: '/login', count: 20 },
                            { key: '/signup', count: 10 }
                        ],
                        topReferrers: [
                            { key: 'google.com', count: 3000 },
                            { key: 'direct', count: 2000 },
                            { key: 't.co', count: 500 },
                            { key: 'github.com/very/long/repository/name/that/might/overflow/the/container', count: 300 },
                            { key: 'bing.com', count: 100 }
                        ],
                        topCountries: [
                            { key: 'CN', count: 2000 },
                            { key: 'US', count: 1500 },
                            { key: 'JP', count: 500 },
                            { key: 'GB', count: 300 },
                            { key: 'DE', count: 200 },
                            { key: 'FR', count: 150 },
                            { key: 'BR', count: 100 },
                            { key: 'RU', count: 50 }
                        ],
                        topOS: [
                            { key: 'Windows', count: 3000 },
                            { key: 'iOS', count: 2000 },
                            { key: 'Android', count: 1000 },
                            { key: 'macOS', count: 800 },
                            { key: 'Linux', count: 200 }
                        ],
                        topBrowsers: [
                            { key: 'Chrome', count: 4000 },
                            { key: 'Safari', count: 2000 },
                            { key: 'Firefox', count: 1000 },
                            { key: 'Edge', count: 500 },
                            { key: 'Opera', count: 100 }
                        ],
                        chartData: Array.from({length: 24}, (_, i) => ({
                            time: '2024-01-01 ' + String(i).padStart(2, '0') + ':00',
                            count: Math.floor(Math.random() * 500)
                        })),
                        domains: ['masterhu.com.cn', 'demo.com']
                    };
                    
                    window.lastFetchedData = data;
                    updateDomainList(data.domains, domain);
                    
                    const pvEl = document.getElementById('totalPv');
                    const uvEl = document.getElementById('totalUv');
                    if (pvEl) {
                        animateValue('totalPv', parseInt(pvEl.dataset.value || '0'), data.summary.pv);
                        pvEl.dataset.value = String(data.summary.pv);
                    }
                    if (uvEl) {
                        animateValue('totalUv', parseInt(uvEl.dataset.value || '0'), data.summary.uv);
                        uvEl.dataset.value = String(data.summary.uv);
                    }

                    document.getElementById('todayPv').textContent = (data.summary.todayPv || 0).toLocaleString();
                    document.getElementById('todayUv').textContent = (data.summary.todayUv || 0).toLocaleString();
                    document.getElementById('bounceRate').textContent = data.summary.bounceRate + '%';
                    
                    renderAllTables(data);
                    lastChartData = data.chartData;
                    updateChart(data.chartData);
                    
                    // Cleanup loading state
                    if (showLoading) setTimeout(() => overlay.classList.add('hidden'), 300);
                    if (refreshBtn) {
                        setTimeout(() => {
                            refreshBtn.classList.remove('animate-pulse');
                            if (!autoRefreshInterval) refreshBtn.classList.remove('text-indigo-600', 'dark:text-indigo-400');
                        }, 500);
                    }
                    if (refreshIcon) refreshIcon.classList.remove('animate-spin');
                    return;
                }
                // --- END MOCK DATA ---

                const timestamp = new Date().getTime();
                let url = domain ? '/api/stats?range=' + range + '&domain=' + encodeURIComponent(domain) : '/api/stats?range=' + range;
                url += '&_t=' + timestamp;
                
                const headers = {};
                const apiKey = localStorage.getItem('analytics_api_key');
                if (apiKey) {
                    headers['Authorization'] = 'Bearer ' + apiKey;
                }

                const res = await fetch(url, { headers });
                
                if (res.status === 401) {
                    showAuthModal();
                    return;
                }

                if (res.status === 500) {
                    const text = await res.text();
                    let errorMsg = text;
                    try {
                        const json = JSON.parse(text);
                        if (json.error) errorMsg = json.error;
                    } catch(e) {}

                    if (errorMsg.includes('D1') || errorMsg.includes('database') || errorMsg.includes('no such table') || errorMsg.includes('SQLITE_ERROR')) {
                        document.getElementById('dbErrorOverlay').classList.add('show');
                        return;
                    }
                }

                if (!res.ok) throw new Error(await res.text());
                const data = await res.json();
                
                window.lastFetchedData = data;
                updateDomainList(data.domains, domain);

                animateValue('totalPv', parseInt(document.getElementById('totalPv').dataset.value || 0), data.summary.pv);
                animateValue('totalUv', parseInt(document.getElementById('totalUv').dataset.value || 0), data.summary.uv);
                
                document.getElementById('totalPv').dataset.value = data.summary.pv;
                document.getElementById('totalUv').dataset.value = data.summary.uv;

                document.getElementById('todayPv').textContent = (data.summary.todayPv || 0).toLocaleString();
                document.getElementById('todayUv').textContent = (data.summary.todayUv || 0).toLocaleString();
                document.getElementById('bounceRate').textContent = data.summary.bounceRate + '%';

                renderAllTables(data);
                
                lastChartData = data.chartData;
                updateChart(data.chartData);
            } catch (e) {
                console.error('Failed to load data', e);
            } finally {
                if (showLoading) {
                    setTimeout(() => overlay.classList.add('hidden'), 300); 
                }
                
                const refreshBtn = document.getElementById('refreshToggle');
                const refreshIcon = refreshBtn ? refreshBtn.querySelector('svg') : null;

                if (refreshBtn) {
                     setTimeout(() => {
                        refreshBtn.classList.remove('animate-pulse');
                        
                        // Only remove text color if NOT in auto-refresh mode
                        if (!autoRefreshInterval) {
                            refreshBtn.classList.remove('text-indigo-600', 'dark:text-indigo-400');
                        }
                     }, 500);
                }

                if (refreshIcon) {
                    setTimeout(() => {
                        refreshIcon.classList.remove('animate-spin');
                        refreshIcon.classList.add('group-hover:rotate-[360deg]', 'group-hover:scale-110'); // Restore hover effect
                    }, 500);
                }
            }
        }

        // Nav Logo Logic
        document.getElementById('navLogo').addEventListener('click', () => {
             window.location.reload();
        });

        // Auth Logic
        const authModal = document.getElementById('authModal');
        const authKeyInput = document.getElementById('authKey');
        const authBtn = document.getElementById('authBtn');

        function showAuthModal() {
            authModal.classList.remove('hidden');
            authKeyInput.focus();
        }

        function hideAuthModal() {
            authModal.classList.add('hidden');
        }

        authBtn.addEventListener('click', () => {
            const key = authKeyInput.value.trim();
            if (key) {
                localStorage.setItem('analytics_api_key', key);
                hideAuthModal();
                loadData(true);
            }
        });

        authKeyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                authBtn.click();
            }
        });

        // Domain Dropdown Logic
        const domainFilterBtn = document.getElementById('domainFilterBtn');
        const domainFilterMenu = document.getElementById('domainFilterMenu');
        const domainFilterIcon = document.getElementById('domainFilterIcon');
        const domainFilterInput = document.getElementById('domainFilter');
        const domainFilterLabel = document.getElementById('domainFilterLabel');

        function toggleDomainMenu() {
            const isHidden = domainFilterMenu.classList.contains('hidden');
            if (isHidden) {
                if(typeof closeTimeMenu === 'function') closeTimeMenu();
                
                domainFilterMenu.classList.remove('hidden');
                requestAnimationFrame(() => {
                    domainFilterMenu.classList.remove('opacity-0', 'scale-95');
                    domainFilterMenu.classList.add('opacity-100', 'scale-100');
                    domainFilterIcon.classList.add('rotate-180');
                });
            } else {
                closeDomainMenu();
            }
        }

        function closeDomainMenu() {
            domainFilterMenu.classList.remove('opacity-100', 'scale-100');
            domainFilterMenu.classList.add('opacity-0', 'scale-95');
            domainFilterIcon.classList.remove('rotate-180');
            setTimeout(() => {
                domainFilterMenu.classList.add('hidden');
            }, 200);
        }

        if (domainFilterBtn) {
            domainFilterBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleDomainMenu();
            });
        }

        document.addEventListener('click', (e) => {
            if (domainFilterBtn && !domainFilterBtn.contains(e.target) && !domainFilterMenu.contains(e.target)) {
                closeDomainMenu();
            }
        });

        function createDomainOption(value, label, isSelected) {
            const btn = document.createElement('button');
            const bgClass = isSelected 
                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                : 'text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400';
            btn.className = 'w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between group ' + bgClass;
            
            const opacityClass = isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-50';
            btn.innerHTML = 
                '<span class="truncate">' + label + '</span>' +
                '<svg class="h-4 w-4 text-indigo-600 flex-shrink-0 transition-opacity ' + opacityClass + '" fill="none" viewBox="0 0 24 24" stroke="currentColor">' +
                    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>' +
                '</svg>';

            btn.addEventListener('click', () => {
                domainFilterInput.value = value;
                domainFilterLabel.textContent = label;
                if (value === '') {
                    domainFilterLabel.setAttribute('data-i18n', 'allDomains');
                    if (translations[currentLang]['allDomains']) {
                        domainFilterLabel.textContent = translations[currentLang]['allDomains'];
                    }
                } else {
                    domainFilterLabel.removeAttribute('data-i18n');
                }
                
                closeDomainMenu();
                loadData(true);
            });

            return btn;
        }

        function updateDomainList(domains, currentSelection) {
            const container = document.getElementById('domainFilterContainer');
            const listContent = document.getElementById('domainListContent');
            
            if (!domains || domains.length === 0) {
                container.classList.add('hidden');
                return;
            }
            container.classList.remove('hidden');

            listContent.innerHTML = '';

            const allDomainsLabel = translations[currentLang]['allDomains'] || 'All Domains';
            const isAllSelected = !currentSelection;
            listContent.appendChild(createDomainOption('', allDomainsLabel, isAllSelected));

            domains.forEach(d => {
                const isSelected = currentSelection === d;
                listContent.appendChild(createDomainOption(d, d, isSelected));
            });

            if (currentSelection && domains.includes(currentSelection)) {
                domainFilterInput.value = currentSelection;
                domainFilterLabel.textContent = currentSelection;
                domainFilterLabel.removeAttribute('data-i18n');
            } else {
                domainFilterInput.value = '';
                domainFilterLabel.textContent = allDomainsLabel;
                domainFilterLabel.setAttribute('data-i18n', 'allDomains');
            }
        }

        function renderAllTables(data) {
            renderTable('topPages-list', data.topPages, ['key', 'count'], 'link');
            renderTable('topReferrers-list', data.topReferrers, ['key', 'count']);
            renderTable('topCountries-list', data.topCountries, ['key', 'count'], 'country');
            renderTable('topOS-list', data.topOS, ['key', 'count'], 'os');
            renderTable('topBrowsers-list', data.topBrowsers, ['key', 'count'], 'browser');
        }

        function renderTable(listId, data, columns, type = null) {
            const list = document.getElementById(listId);
            if (!list) return;
            const parent = list.parentElement; // div.overflow-auto
            
            // Find or create no-data placeholder
            let noDataEl = parent.querySelector('.no-data-placeholder');
            
            if (!data || data.length === 0) {
                // Hide list
                list.style.display = 'none';
                
                if (!noDataEl) {
                    noDataEl = document.createElement('div');
                    noDataEl.className = 'no-data-placeholder flex flex-col items-center justify-center absolute inset-0 text-gray-400 dark:text-gray-500';
                    noDataEl.innerHTML = 
                        '<svg class="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>' +
                        '<span class="text-sm font-medium">' + translations[currentLang].noData + '</span>';
                    parent.appendChild(noDataEl);
                }
                noDataEl.style.display = 'flex';
                return;
            }

            // Show list, hide no-data
            list.style.display = ''; 
            if (noDataEl) noDataEl.style.display = 'none';
            list.innerHTML = '';

            const maxVal = Math.max(...data.map(d => d[columns[1]]));

            data.forEach((row, index) => {
                const div = document.createElement('div');
                div.className = 'grid grid-cols-[3rem_minmax(0,1fr)_6rem] items-center group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-50 dark:border-gray-800/50 last:border-0';
                const key = row[columns[0]] || translations[currentLang].unknown;
                const count = row[columns[1]];
                const percent = ((count / maxVal) * 100).toFixed(1);

                let displayKey = key;
                let iconHtml = '';

                if (type === 'country') {
                    const flag = getFlagEmoji(key);
                    iconHtml = '<span class="mr-2">' + flag + '</span>';
                } else if (type === 'os') {
                    const osIcon = getOSIcon(key);
                    iconHtml = '<span class="text-xl mr-2">' + osIcon + '</span>';
                } else if (type === 'browser') {
                    const browserIcon = getBrowserIcon(key);
                    iconHtml = '<span class="text-xl mr-2">' + browserIcon + '</span>';
                } else if (type === 'link' && key.startsWith('http')) {
                    const favicon = getFavicon(key);
                    if (favicon) {
                        iconHtml = '<img src="' + favicon + '" class="w-4 h-4 mr-2 rounded-sm opacity-80" loading="lazy" />';
                    } else {
                         iconHtml = '<svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>';
                    }
                    displayKey = '<a href="' + key + '" target="_blank" class="hover:text-indigo-500 hover:underline truncate transition-colors">' + key + '</a>';
                }

                div.innerHTML = 
                    '<div class="py-3 pl-3 pr-2 text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">' +
                        '<span class="font-mono text-xs">' + (index + 1) + '</span>' +
                    '</div>' +
                    '<div class="py-3 pl-2 pr-3 text-sm font-medium text-gray-900 dark:text-gray-100 overflow-hidden relative h-full flex items-center">' +
                        '<div class="bar-bg absolute left-0 top-0 bottom-0 bg-indigo-50 dark:bg-indigo-900/20 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800/40 transition-all duration-500" style="width: ' + percent + '%"></div>' +
                        '<div class="flex items-center relative z-10 w-full min-w-0">' +
                            iconHtml +
                            '<div class="truncate flex-1 min-w-0" title="' + key + '">' + displayKey + '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="px-3 py-3 text-right text-sm text-gray-500 dark:text-gray-400 font-mono whitespace-nowrap relative z-10 pr-6">' +
                        count.toLocaleString() +
                    '</div>';
                list.appendChild(div);
            });
        }

        function animateValue(id, start, end) {
            if (start === end) return;
            const obj = document.getElementById(id);
            const range = end - start;
            const duration = 1500;
            let startTime = null;
            
            function step(timestamp) {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);
                
                // Ease out quart
                const ease = 1 - Math.pow(1 - progress, 4);
                
                const current = Math.floor(start + range * ease);
                obj.innerHTML = current.toLocaleString();
                
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                } else {
                    obj.innerHTML = end.toLocaleString();
                }
            }
            
            window.requestAnimationFrame(step);
        }

        function updateChartTheme() {
            if (!chartInstance) return;
            const isDark = document.documentElement.classList.contains('dark');
            const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
            const textColor = isDark ? '#9CA3AF' : '#6B7280';
            
            chartInstance.options.scales.x.grid.color = gridColor;
            chartInstance.options.scales.y.grid.color = gridColor;
            chartInstance.options.scales.x.ticks.color = textColor;
            chartInstance.options.scales.y.ticks.color = textColor;
            chartInstance.update();
        }

        function updateChart(data) {
            const ctx = document.getElementById('visitsChart').getContext('2d');
            const isDark = document.documentElement.classList.contains('dark');
            
            // Create Gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(99, 102, 241, 0.5)'); // Indigo 500
            gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

            const config = {
                type: 'line',
                data: {
                    labels: data.map(d => d.time),
                    datasets: [{
                        label: translations[currentLang].chartLabel,
                        data: data.map(d => d.count),
                        borderColor: '#6366F1', // Indigo 500
                        backgroundColor: gradient,
                        borderWidth: 3,
                        pointBackgroundColor: '#ffffff',
                        pointBorderColor: '#6366F1',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            backgroundColor: isDark ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                            titleColor: isDark ? '#F3F4F6' : '#111827',
                            bodyColor: isDark ? '#D1D5DB' : '#374151',
                            borderColor: isDark ? 'rgba(75, 85, 99, 0.4)' : 'rgba(229, 231, 235, 1)',
                            borderWidth: 1,
                            padding: 12,
                            cornerRadius: 12,
                            displayColors: false,
                            callbacks: {
                                label: function(context) {
                                    return context.parsed.y + ' ' + translations[currentLang].views;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                drawBorder: false
                            },
                            ticks: {
                                color: isDark ? '#9CA3AF' : '#6B7280',
                                font: { family: 'Inter', size: 11 },
                                maxTicksLimit: 5
                            },
                            border: { display: false }
                        },
                        x: {
                            grid: { display: false },
                            ticks: {
                                color: isDark ? '#9CA3AF' : '#6B7280',
                                font: { family: 'Inter', size: 11 },
                                maxTicksLimit: 8,
                                maxRotation: 0
                            },
                            border: { display: false }
                        }
                    },
                    interaction: {
                        mode: 'nearest',
                        axis: 'x',
                        intersect: false
                    }
                }
            };

            if (chartInstance) {
                chartInstance.destroy();
            }
            chartInstance = new Chart(ctx, config);
        }

        // Custom Time Range Dropdown Logic
        const timeRangeBtn = document.getElementById('timeRangeBtn');
        const timeRangeMenu = document.getElementById('timeRangeMenu');
        const timeRangeInput = document.getElementById('timeRange');
        const timeRangeLabel = document.getElementById('timeRangeLabel');
        const timeRangeIcon = document.getElementById('timeRangeIcon');
        const timeOptions = document.querySelectorAll('.time-option');

        function toggleTimeMenu() {
            const isHidden = timeRangeMenu.classList.contains('hidden');
            if (isHidden) {
                timeRangeMenu.classList.remove('hidden');
                // Small delay to allow display:block to apply before opacity transition
                requestAnimationFrame(() => {
                    timeRangeMenu.classList.remove('opacity-0', 'scale-95');
                    timeRangeMenu.classList.add('opacity-100', 'scale-100');
                    timeRangeIcon.classList.add('rotate-180');
                });
            } else {
                closeTimeMenu();
            }
        }

        function closeTimeMenu() {
            timeRangeMenu.classList.remove('opacity-100', 'scale-100');
            timeRangeMenu.classList.add('opacity-0', 'scale-95');
            timeRangeIcon.classList.remove('rotate-180');
            
            // Wait for transition to finish before hiding
            setTimeout(() => {
                timeRangeMenu.classList.add('hidden');
            }, 200);
        }

        timeRangeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleTimeMenu();
        });

        document.addEventListener('click', (e) => {
            if (!timeRangeBtn.contains(e.target) && !timeRangeMenu.contains(e.target)) {
                closeTimeMenu();
            }
        });

        timeOptions.forEach(option => {
            option.addEventListener('click', () => {
                const value = option.dataset.value;
                const labelText = option.querySelector('span').textContent; // Get text from span, not data-i18n directly to support current lang
                
                // Update hidden input
                timeRangeInput.value = value;
                
                // Update label
                timeRangeLabel.textContent = labelText;
                timeRangeLabel.setAttribute('data-i18n', option.querySelector('span').getAttribute('data-i18n'));

                // Update visual selection state
                timeOptions.forEach(opt => {
                    opt.classList.remove('selected', 'bg-indigo-50', 'dark:bg-indigo-900/30', 'text-indigo-600', 'dark:text-indigo-400');
                    opt.classList.add('text-gray-700', 'dark:text-gray-200');
                    // Reset check icon
                    const check = opt.querySelector('svg');
                    if(check) check.classList.remove('opacity-100');
                });

                option.classList.add('selected', 'bg-indigo-50', 'dark:bg-indigo-900/30', 'text-indigo-600', 'dark:text-indigo-400');
                option.classList.remove('text-gray-700', 'dark:text-gray-200');
                
                const check = option.querySelector('svg');
                if(check) check.classList.add('opacity-100');

                closeTimeMenu();
                loadData(true);
            });
        });

        // Initial Load
        loadData(true);

    </script>
</body>
</html>
`;
