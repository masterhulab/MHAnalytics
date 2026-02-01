export const dashboardCss = `
    <style>
        body { font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
        
        /* Mesh Background */
        .mesh-bg {
            background-color: #F2F2F7;
            background-image: 
                radial-gradient(at 40% 20%, hsla(253,100%,90%,0.5) 0px, transparent 50%),
                radial-gradient(at 80% 0%, hsla(189,100%,90%,0.5) 0px, transparent 50%),
                radial-gradient(at 0% 50%, hsla(341,100%,90%,0.5) 0px, transparent 50%),
                radial-gradient(at 80% 50%, hsla(250,100%,90%,0.5) 0px, transparent 50%),
                radial-gradient(at 0% 100%, hsla(253,16%,7%,0) 0, transparent 50%), 
                radial-gradient(at 50% 100%, hsla(225,39%,30%,0) 0, transparent 50%);
            position: relative;
        }
        .mesh-bg::before {
            content: ''; position: fixed; top: -50%; left: -50%; width: 200%; height: 200%;
            background: radial-gradient(circle at center, rgba(88, 86, 214, 0.05) 0%, transparent 50%);
            z-index: -1; animation: pulse-slow 8s infinite;
        }
        .dark .mesh-bg {
            background-color: #050505;
            background-image: 
                radial-gradient(at 40% 20%, rgba(88, 86, 214, 0.15) 0px, transparent 50%),
                radial-gradient(at 80% 0%, rgba(52, 199, 89, 0.1) 0px, transparent 50%),
                radial-gradient(at 0% 50%, rgba(255, 59, 48, 0.05) 0px, transparent 50%),
                radial-gradient(at 0% 0%, rgba(88, 86, 214, 0.15) 0, transparent 50%), 
                radial-gradient(at 100% 100%, rgba(52, 199, 89, 0.05) 0, transparent 50%);
        }

        /* Glass Panel */
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

        /* Stats Card */
        .stats-card {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.4);
            border-radius: 24px;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.02);
            transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .dark .stats-card {
            background: rgba(30, 30, 35, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
        }
        .stats-card:hover {
            transform: translateY(-4px) scale(1.005);
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
            border-color: rgba(88, 86, 214, 0.2);
            background: rgba(255, 255, 255, 0.85);
        }
        .dark .stats-card:hover {
            border-color: rgba(255, 255, 255, 0.15);
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
            background: rgba(40, 40, 45, 0.8);
        }

        /* Animations */
        @keyframes breathe {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
        }
        .animate-breathe { animation: breathe 3s ease-in-out infinite; }

        /* Overlays */
        #dbErrorOverlay, #loadingOverlay {
            position: fixed; inset: 0; z-index: 100; display: flex;
            justify-content: center; align-items: center; backdrop-filter: blur(10px);
            transition: opacity 0.3s;
        }
        #dbErrorOverlay { background: rgba(255,255,255,0.8); z-index: 200; opacity: 0; pointer-events: none; }
        .dark #dbErrorOverlay { background: rgba(0,0,0,0.8); }
        #dbErrorOverlay.show { opacity: 1; pointer-events: auto; }
        #loadingOverlay { background: rgba(255,255,255,0.3); }
        .dark #loadingOverlay { background: rgba(0,0,0,0.3); }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.3); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(156, 163, 175, 0.5); }

        /* Utilities */
        .hidden { display: none !important; }
        .fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; transform: translateY(20px); }
        @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
        
        .bar-bg {
            position: absolute; top: 0; bottom: 0; left: 0; z-index: 0;
            background: linear-gradient(90deg, rgba(88, 86, 214, 0.08), rgba(88, 86, 214, 0.18));
            border-radius: 0 8px 8px 0; transition: width 1.2s ease;
        }
        .dark .bar-bg { background: linear-gradient(90deg, rgba(94, 92, 230, 0.1), rgba(94, 92, 230, 0.25)); }
        
        /* Table */
        tbody tr { transition: all 0.2s ease; position: relative; }
        tbody tr:hover { background-color: rgba(88, 86, 214, 0.03); transform: translateX(2px); }
        .dark tbody tr:hover { background-color: rgba(94, 92, 230, 0.05); }
        tbody tr::before {
            content: ''; position: absolute; left: 0; top: 2px; bottom: 2px; width: 3px;
            background: #5856D6; opacity: 0; transition: opacity 0.2s; border-radius: 0 4px 4px 0;
        }
        tbody tr:hover::before { opacity: 1; }
        .sticky-header th { position: sticky; top: 0; z-index: 10; background: rgba(255,255,255,0.9); backdrop-filter: blur(8px); }
        .dark .sticky-header th { background: rgba(30,30,35,0.9); }

        /* Theme Icons Logic - Explicitly override display to ensure visibility */
        #theme-moon { display: block !important; }
        #theme-sun { display: none !important; }
        :root.dark #theme-moon { display: none !important; }
        :root.dark #theme-sun { display: block !important; }

        /* Toast */
        #securityToast { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); transform-origin: left center; }
        
        #securityToast.minimized {
            width: auto;
            padding: 0;
            border-radius: 9999px;
            cursor: pointer;
            background: transparent;
            border-color: transparent;
            box-shadow: none;
        }
        
        #securityToast.minimized:hover {
            transform: scale(1.1);
        }

        #securityToast.minimized .flex-1 { 
            display: none; 
        }
        
        #securityToast.minimized .flex-shrink-0 {
            margin: 0;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .dark #securityToast.minimized .flex-shrink-0 {
             box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
    </style>
`;
