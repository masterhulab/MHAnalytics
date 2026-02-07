
import { Icons } from './icons';

export const tailwindConfig = `
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
                    colors: {
                        ios: {
                            bg: '#F2F2F7', card: '#FFFFFF', blue: '#007AFF', green: '#34C759',
                            indigo: '#5856D6', orange: '#FF9500', red: '#FF3B30', gray: '#8E8E93'
                        }
                    },
                    animation: {
                        'float': 'float 6s ease-in-out infinite',
                        'fade-in': 'fadeIn 0.5s ease-out forwards',
                        'shimmer': 'shimmer 2s infinite linear',
                        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    },
                    keyframes: {
                        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-5px)' } },
                        fadeIn: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
                        shimmer: { '0%': { backgroundPosition: '-1000px 0' }, '100%': { backgroundPosition: '1000px 0' } }
                    }
                }
            }
        }
    </script>
`;

export const getDashboardJs = (appTitle: string, startYear: number, footerText: string) => `
    <script>
        // --- Constants & Translations ---
        const translations = {
            en: {
                pageViews: 'Page Views',
                uniqueVisitors: 'Unique Visitors',
                bounceRate: 'Bounce Rate',
                trends: 'Trends',
                topPages: 'Top Pages',
                topReferrers: 'Top Referrers',
                topCountries: 'Top Countries',
                topOS: 'Operating Systems',
                topBrowser: 'Browsers',
                url: 'URL',
                views: 'Views',
                referrer: 'Source',
                country: 'Country',
                os: 'OS',
                browser: 'Browser',
                noData: 'No Data Available',
                unknown: 'Direct / Unknown',
                chartLabel: 'Views',
                chartLabelUv: 'Visitors',
                today: 'Today',
                footer: 'Copyright © ${startYear} ${footerText}',
                allDomains: 'All Domains',
                enterKey: 'Enter Access Key',
                singlePageSessions: 'Single Page Visits',
                welcomeTitle: 'Welcome to ${appTitle}',
                welcomeDesc: 'No data available yet. Add tracking code to start.',
                copyScript: 'Copy Script',
                scriptCopied: 'Copied!',
                configNeeded: 'Security Alert',
                configNeededDesc: 'API Key is not configured. Your dashboard is currently <strong>publicly accessible</strong>.',
                dismiss: 'Dismiss',
                '24h': 'Last 24h',
                '7d': 'Last 7 Days',
                '30d': 'Last 30 Days',
                '3m': 'Last 3 Months',
                '6m': 'Last 6 Months',
                '1y': 'Last 1 Year',
                'all': 'All Time'
            },
            zh: {
                pageViews: '浏览量 (PV)',
                uniqueVisitors: '访客数 (UV)',
                bounceRate: '跳出率',
                trends: '流量趋势',
                topPages: '热门页面',
                topReferrers: '来源分析',
                topCountries: '地区分布',
                topOS: '操作系统',
                topBrowser: '浏览器',
                url: '页面地址',
                views: '浏览次数',
                referrer: '来源',
                country: '国家/地区',
                os: '系统',
                browser: '软件',
                noData: '暂无数据',
                unknown: '直接访问 / 未知',
                chartLabel: '浏览量',
                chartLabelUv: '访客数',
                today: '今日',
                footer: 'Copyright © ${startYear} ${footerText}',
                allDomains: '全部域名',
                enterKey: '请输入访问密钥',
                singlePageSessions: '单页访问 (跳出)',
                welcomeTitle: '欢迎使用 ${appTitle}',
                welcomeDesc: '暂无数据。请将统计代码添加到您的网站以开始使用。',
                copyScript: '复制统计代码',
                scriptCopied: '已复制!',
                configNeeded: '安全提醒',
                configNeededDesc: '未配置 API Key，您的仪表盘当前 <strong>对外公开</strong>。',
                dismiss: '忽略',
                '24h': '最近 24 小时',
                '7d': '最近 7 天',
                '30d': '最近 30 天',
                '3m': '最近 3 个月',
                '6m': '最近 6 个月',
                '1y': '最近 1 年',
                'all': '所有时间'
            }
        };

        const safeLocalStorage = {
            getItem: (k) => { try { return localStorage.getItem(k); } catch(e) { return null; } },
            setItem: (k, v) => { try { localStorage.setItem(k, v); } catch(e) {} }
        };

        // --- Icons ---
        const Icons = ${JSON.stringify(Icons)};

        // --- State ---
        let state = {
            lang: 'en',
            chartInstance: null,
            lastData: null,
            autoRefreshTimer: null
        };

        // --- Init ---
        function init() {
            // Lang
            const storedLang = safeLocalStorage.getItem('lang');
            state.lang = storedLang || (navigator.language.startsWith('zh') ? 'zh' : 'en');
            updateLangUI();

            // Footer Year
            const currentYear = new Date().getFullYear();
            const yearStr = currentYear > ${startYear} ? \`${startYear}-\${currentYear}\` : '${startYear}';
            const footerEl = document.getElementById('footerYear');
            if(footerEl) footerEl.textContent = yearStr;

            // Theme
            const storedTheme = safeLocalStorage.getItem('theme');
            if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
            }

            // Events
            setupEventListeners();

            // Toast Check
            const toast = document.getElementById('securityToast');
            const minimizeBtn = document.getElementById('minimizeToastBtn');

            if (toast) {
                toast.classList.remove('hidden');

                // Init state
                if (safeLocalStorage.getItem('toast_minimized') === 'true') {
                    toast.classList.add('minimized');
                }

                // Minimize
                if (minimizeBtn) {
                    minimizeBtn.onclick = (e) => {
                        e.stopPropagation();
                        toast.classList.add('minimized');
                        safeLocalStorage.setItem('toast_minimized', 'true');
                    };
                }

                // Expand
                toast.onclick = (e) => {
                    if (toast.classList.contains('minimized')) {
                        toast.classList.remove('minimized');
                        safeLocalStorage.setItem('toast_minimized', 'false');
                    }
                };
            }

            // Initial Load
            loadData(true);
        }

        // --- Data Fetching ---
        async function loadData(showLoading = true) {
            if (showLoading) document.getElementById('loadingOverlay').classList.remove('hidden');

            // Add spin animation to refresh icon
            const refreshIcon = document.querySelector('#refreshToggle svg');
            if (refreshIcon) refreshIcon.classList.add('animate-spin');

            const range = document.getElementById('timeRange').value;
            const domain = document.getElementById('domainFilter').value;
            const apiKey = safeLocalStorage.getItem('analytics_api_key');

            const params = new URLSearchParams({ range, _t: Date.now() });
            if (domain) params.append('domain', domain);

            try {
                const headers = apiKey ? { 'Authorization': 'Bearer ' + apiKey } : {};
                const res = await fetch('/api/stats?' + params.toString(), { headers });

                if (res.status === 401) return showAuthModal();
                if (res.status === 500) {
                    const text = await res.text();
                    if (text.includes('D1') || text.includes('SQLITE_ERROR')) {
                        document.getElementById('dbErrorOverlay').classList.add('show');
                        return;
                    }
                }

                const data = await res.json();
                state.lastData = data;
                renderDashboard(data);

            } catch (e) {
                console.error('Load Error:', e);
            } finally {
                if (showLoading) setTimeout(() => document.getElementById('loadingOverlay').classList.add('hidden'), 300);
                // Remove spin animation
                if (refreshIcon) setTimeout(() => refreshIcon.classList.remove('animate-spin'), 1000); // Keep spinning a bit longer for visibility
            }
        }

        // --- Rendering ---
        function renderDashboard(data) {
            // Global Empty Check
            const isGlobalEmpty = data.summary.pv === 0 && document.getElementById('timeRange').value === 'all' && !document.getElementById('domainFilter').value;
            const content = document.getElementById('dashboardContent');
            const noData = document.getElementById('globalNoData');

            if (isGlobalEmpty) {
                content.classList.add('hidden');
                noData.classList.remove('hidden');
                document.getElementById('scriptDomain').textContent = window.location.host;
                return;
            }

            content.classList.remove('hidden');
            noData.classList.add('hidden');

            // KPI
            animateValue('totalPv', data.summary.pv);
            animateValue('totalUv', data.summary.uv);
            document.getElementById('todayPv').textContent = (data.summary.todayPv || 0).toLocaleString();
            document.getElementById('todayUv').textContent = (data.summary.todayUv || 0).toLocaleString();
            document.getElementById('bounceRate').textContent = data.summary.bounceRate + '%';

            // Domains
            updateDomainList(data.domains);

            // Chart
            renderChart(data.chartData);

            // Tables
            renderTable('topPages-list', data.topPages, ['key', 'count'], 'link');
            renderTable('topReferrers-list', data.topReferrers, ['key', 'count']);
            renderTable('topCountries-list', data.topCountries, ['key', 'count'], 'country');
            renderTable('topOS-list', data.topOS, ['key', 'count'], 'os');
            renderTable('topBrowsers-list', data.topBrowsers, ['key', 'count'], 'browser');
        }

        function renderChart(data) {
            const ctx = document.getElementById('visitsChart').getContext('2d');
            const isDark = document.documentElement.classList.contains('dark');
            // Check if data is empty (checking both pv and uv)
            // const isEmpty = !data || data.length === 0 || data.every(d => d.pv === 0 && d.uv === 0);
            const isEmpty = !data || data.length === 0; // Render even if all zeros

            document.getElementById('chartNoData').classList.toggle('hidden', !isEmpty);

            if (state.chartInstance) state.chartInstance.destroy();
            if (isEmpty) return;

            // Gradient for PV (Indigo)
            const gradientPV = ctx.createLinearGradient(0, 0, 0, 300);
            gradientPV.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
            gradientPV.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

            // Gradient for UV (Teal)
            const gradientUV = ctx.createLinearGradient(0, 0, 0, 300);
            gradientUV.addColorStop(0, 'rgba(20, 184, 166, 0.4)');
            gradientUV.addColorStop(1, 'rgba(20, 184, 166, 0.0)');

            state.chartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.map(d => d.time),
                    datasets: [
                        {
                            label: translations[state.lang].chartLabel || 'Views',
                            data: data.map(d => d.pv),
                            borderColor: '#6366f1', // Indigo-500
                            backgroundColor: gradientPV,
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            pointRadius: 3,
                            pointHoverRadius: 6,
                            pointHoverBackgroundColor: '#6366f1',
                            pointHoverBorderColor: '#ffffff',
                            yAxisID: 'y'
                        },
                        {
                            label: translations[state.lang].chartLabelUv || 'Visitors',
                            data: data.map(d => d.uv),
                            borderColor: '#14b8a6', // Teal-500
                            backgroundColor: gradientUV,
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            pointRadius: 3,
                            pointHoverRadius: 6,
                            pointHoverBackgroundColor: '#14b8a6',
                            pointHoverBorderColor: '#ffffff',
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    plugins: {
                        legend: {
                            display: true,
                            labels: {
                                color: isDark ? '#9ca3af' : '#4b5563',
                                usePointStyle: true,
                                boxWidth: 8,
                                font: { family: "'Inter', sans-serif", size: 12 }
                            }
                        },
                        tooltip: {
                            backgroundColor: isDark ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                            titleColor: isDark ? '#f3f4f6' : '#111827',
                            bodyColor: isDark ? '#d1d5db' : '#4b5563',
                            borderColor: isDark ? '#374151' : '#e5e7eb',
                            borderWidth: 1,
                            padding: 12,
                            displayColors: true,
                            callbacks: {
                                label: function(context) {
                                    return context.dataset.label + ': ' + context.parsed.y;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                display: false,
                                drawBorder: false
                            },
                            ticks: {
                                color: isDark ? '#9ca3af' : '#6b7280',
                                maxTicksLimit: 8,
                                font: { family: "'Inter', sans-serif", size: 11 }
                            }
                        },
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            beginAtZero: true,
                            grid: {
                                color: isDark ? '#374151' : '#e5e7eb',
                                borderDash: [4, 4],
                                drawBorder: false
                            },
                            ticks: {
                                color: '#6366f1', // Indigo for PV
                                maxTicksLimit: 5,
                                font: { family: "'Inter', sans-serif", size: 11 }
                            }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            beginAtZero: true,
                            grid: {
                                drawOnChartArea: false, // only want the grid lines for one axis to show up
                            },
                            ticks: {
                                color: '#14b8a6', // Teal for UV
                                maxTicksLimit: 5,
                                font: { family: "'Inter', sans-serif", size: 11 }
                            }
                        }
                    }
                }
            });
        }

        function renderTable(id, data, cols, type) {
            const el = document.getElementById(id);
            if (!data || data.length === 0) {
                el.innerHTML = '<div class="p-4 text-center text-gray-400 text-sm">' + translations[state.lang].noData + '</div>';
                return;
            }

            const max = Math.max(...data.map(d => d[cols[1]]));
            el.innerHTML = data.map((row, i) => {
                const val = row[cols[1]];
                const pct = ((val / max) * 100).toFixed(1);
                let key = row[cols[0]] || translations[state.lang].unknown;
                let displayKey = escapeHtml(key);
                let icon = '';

                if (type === 'country') icon = getFlagEmoji(key);
                else if (type === 'os') icon = getOSIcon(key);
                else if (type === 'browser') icon = getBrowserIcon(key);
                else if (type === 'link') {
                    if (key.startsWith('http')) {
                         displayKey = '<a href="' + escapeHtml(key) + '" target="_blank" class="hover:text-indigo-500 hover:underline truncate">' + escapeHtml(key) + '</a>';
                         icon = Icons.ui.externalLink;
                    }
                }

                return '<div class="grid grid-cols-[3rem_minmax(0,1fr)_6rem] items-center group hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b border-gray-50 dark:border-gray-800/50">' +
                       '<div class="py-3 px-3 text-sm text-gray-500 font-mono text-xs">' + (i + 1) + '</div>' +
                       '<div class="py-3 px-2 relative h-full flex items-center overflow-hidden">' +
                           '<div class="bar-bg" style="width: ' + pct + '%"></div>' +
                           '<div class="relative z-10 flex items-center w-full min-w-0 gap-2">' +
                               (icon ? '<span class="flex-shrink-0">' + icon + '</span>' : '') +
                               '<span class="truncate text-sm font-medium text-gray-900 dark:text-gray-100">' + displayKey + '</span>' +
                           '</div>' +
                       '</div>' +
                       '<div class="py-3 px-3 text-right text-sm font-mono text-gray-500">' + val.toLocaleString() + '</div>' +
                       '</div>';
            }).join('');
        }

        // --- Helpers ---
        function escapeHtml(unsafe) {
            if (typeof unsafe !== 'string') return unsafe;
            return unsafe
                 .replace(/&/g, "&amp;")
                 .replace(/</g, "&lt;")
                 .replace(/>/g, "&gt;")
                 .replace(/"/g, "&quot;")
                 .replace(/'/g, "&#039;");
        }

        function getFlagEmoji(code) {
            if (!code || code.length !== 2) return Icons.ui.globe;
            return '<span class="fi fi-' + code.toLowerCase() + ' rounded shadow-sm"></span>';
        }

        function getOSIcon(os) {
            os = (os || '').toLowerCase();
            if (os.includes('win')) return Icons.os.win;
            if (/mac|ios/.test(os)) return Icons.os.mac;
            if (/android/.test(os)) return Icons.os.android;
            if (/ubuntu/.test(os)) return Icons.os.ubuntu;
            if (/linux/.test(os)) return Icons.os.linux;
            return Icons.os.other;
        }

        function getBrowserIcon(b) {
            b = (b || '').toLowerCase();
            if (/chrome|chromium/.test(b)) return Icons.browser.chrome;
            if (/firefox/.test(b)) return Icons.browser.firefox;
            if (/safari/.test(b)) return Icons.browser.safari;
            if (/edge/.test(b)) return Icons.browser.edge;
            return Icons.browser.other;
        }

        function animateValue(id, end) {
            const el = document.getElementById(id);
            if (!el) return;
            const start = parseInt(el.getAttribute('data-value') || 0);
            if (start === end) return;

            el.setAttribute('data-value', end);
            const duration = 1000;
            const startTime = performance.now();

            requestAnimationFrame(function animate(time) {
                let progress = (time - startTime) / duration;
                if (progress > 1) progress = 1;
                const val = Math.floor(start + (end - start) * (1 - Math.pow(1 - progress, 4))); // Ease out quart
                el.textContent = val.toLocaleString();
                if (progress < 1) requestAnimationFrame(animate);
            });
        }

        function updateLangUI() {
            document.getElementById('langToggle').textContent = state.lang === 'en' ? 'EN' : '中';
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (translations[state.lang][key]) {
                    // Handle nodes with children (like buttons with icons)
                    if (el.children.length > 0 && el.tagName === 'BUTTON') {
                        // Very specific for this dashboard buttons
                         const span = el.querySelector('span');
                         if(span) span.innerHTML = translations[state.lang][key];
                    } else {
                        el.innerHTML = translations[state.lang][key];
                    }
                }
            });
            if (state.lastData) renderDashboard(state.lastData);
        }

        function showAuthModal() {
            document.getElementById('authModal').classList.remove('hidden');
        }

        function updateDomainList(domains) {
            const list = document.getElementById('domainListContent');
            const current = document.getElementById('domainFilter').value;

            list.innerHTML = '';

            // "All" option
            const allBtn = document.createElement('button');
            allBtn.className = 'w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex justify-between items-center ' + (!current ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30');
            allBtn.innerHTML = '<span data-i18n="allDomains">' + translations[state.lang].allDomains + '</span>' + (!current ? '<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>' : '');
            allBtn.onclick = () => selectDomain('');
            list.appendChild(allBtn);

            (domains || []).forEach(d => {
                const btn = document.createElement('button');
                btn.className = 'w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex justify-between items-center ' + (current === d ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30');
                btn.innerHTML = '<span class="truncate">' + escapeHtml(d) + '</span>' + (current === d ? '<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>' : '');
                btn.onclick = () => selectDomain(d);
                list.appendChild(btn);
            });

            document.getElementById('domainFilterLabel').textContent = current || translations[state.lang].allDomains;
        }

        function selectDomain(d) {
            document.getElementById('domainFilter').value = d;
            document.getElementById('domainFilterMenu').classList.add('hidden');
            loadData(true);
        }

        function setupEventListeners() {
            // Dropdowns
            const setupDropdown = (btnId, menuId) => {
                const btn = document.getElementById(btnId);
                const menu = document.getElementById(menuId);
                if(!btn || !menu) return;

                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isHidden = menu.classList.contains('hidden');
                    document.querySelectorAll('[id$="Menu"]').forEach(m => m.classList.add('hidden')); // Close others
                    if (isHidden) {
                        menu.classList.remove('hidden');
                        requestAnimationFrame(() => {
                            menu.classList.remove('opacity-0', 'scale-95');
                            menu.classList.add('opacity-100', 'scale-100');
                        });
                    }
                });
            };

            setupDropdown('domainFilterBtn', 'domainFilterMenu');
            setupDropdown('timeRangeBtn', 'timeRangeMenu');

            // Close dropdowns on click outside
            document.addEventListener('click', () => {
                document.querySelectorAll('[id$="Menu"]').forEach(menu => {
                    menu.classList.remove('opacity-100', 'scale-100');
                    menu.classList.add('opacity-0', 'scale-95');
                    setTimeout(() => menu.classList.add('hidden'), 200);
                });
            });

            // Time Selection
            document.querySelectorAll('.time-option').forEach(opt => {
                opt.addEventListener('click', () => {
                    const val = opt.getAttribute('data-value');
                    document.getElementById('timeRange').value = val;

                    // Update UI
                    document.querySelectorAll('.time-option').forEach(o => {
                        o.classList.remove('selected', 'bg-indigo-50', 'text-indigo-600', 'dark:bg-indigo-900/30');
                        o.classList.add('text-gray-700', 'dark:text-gray-200');
                        o.querySelector('svg').classList.remove('opacity-100');
                        o.querySelector('svg').classList.add('opacity-0');
                    });

                    opt.classList.remove('text-gray-700', 'dark:text-gray-200');
                    opt.classList.add('selected', 'bg-indigo-50', 'text-indigo-600', 'dark:bg-indigo-900/30');
                    opt.querySelector('svg').classList.remove('opacity-0');
                    opt.querySelector('svg').classList.add('opacity-100');

                    document.getElementById('timeRangeLabel').setAttribute('data-i18n', val);
                    updateLangUI();

                    loadData(true);
                });
            });

            // Toggles
            document.getElementById('langToggle').addEventListener('click', () => {
                state.lang = state.lang === 'en' ? 'zh' : 'en';
                safeLocalStorage.setItem('lang', state.lang);
                updateLangUI();
            });

            document.getElementById('themeToggle').addEventListener('click', () => {
                const isDark = document.documentElement.classList.toggle('dark');
                safeLocalStorage.setItem('theme', isDark ? 'dark' : 'light');
                if(state.chartInstance) renderChart(state.lastData.chartData); // Re-render chart for colors
            });

            document.getElementById('refreshToggle').addEventListener('click', function() {
                if (state.autoRefreshTimer) {
                    clearInterval(state.autoRefreshTimer);
                    state.autoRefreshTimer = null;
                    this.classList.remove('text-indigo-600', 'bg-indigo-50');
                    this.classList.add('text-gray-600');
                } else {
                    loadData(false);
                    state.autoRefreshTimer = setInterval(() => loadData(false), 30000);
                    this.classList.add('text-indigo-600', 'bg-indigo-50');
                    this.classList.remove('text-gray-600');
                }
            });

            // Auth
            document.getElementById('authBtn').addEventListener('click', () => {
                const key = document.getElementById('authKey').value;
                if (key) {
                    safeLocalStorage.setItem('analytics_api_key', key);
                    document.getElementById('authModal').classList.add('hidden');
                    loadData(true);
                }
            });

            // Copy Script
            const copyBtn = document.getElementById('copyScriptBtn');
            if(copyBtn) {
                copyBtn.addEventListener('click', () => {
                     const code = '<script defer src="https://' + window.location.host + '/tracker.js" data-endpoint="https://' + window.location.host + '/api/event"><\\/script>';
                     navigator.clipboard.writeText(code);
                     copyBtn.textContent = translations[state.lang].scriptCopied;
                     setTimeout(() => copyBtn.textContent = translations[state.lang].copyScript, 2000);
                });
            }
        }

        // Start
        init();
    </script>
`;
