-- 插入模拟访问数据
-- 注意：本地 SQLite 时间函数可能与标准 SQL 略有不同，这里使用简单的字符串格式

INSERT INTO visits (url, referrer, user_agent, ip, country, domain, session_id, timestamp) VALUES 
-- 今天的数据
('http://localhost:8788/', 'https://google.com', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', '127.0.0.1', 'US', 'localhost', 'sess-001', datetime('now')),
('http://localhost:8788/', 'https://twitter.com', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)', '192.168.1.2', 'CN', 'localhost', 'sess-002', datetime('now', '-1 hour')),
('http://localhost:8788/blog/post-1', 'https://google.com', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '10.0.0.1', 'US', 'localhost', 'sess-003', datetime('now', '-2 hours')),
('http://localhost:8788/blog/post-1', '', 'Mozilla/5.0 (X11; Linux x86_64)', '10.0.0.2', 'DE', 'localhost', 'sess-004', datetime('now', '-3 hours')),
('http://localhost:8788/about', 'http://localhost:8788/', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', '127.0.0.1', 'US', 'localhost', 'sess-001', datetime('now', '-5 minutes')),

-- 昨天的数据
('http://localhost:8788/', 'https://bing.com', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '127.0.0.1', 'US', 'localhost', 'sess-old-1', datetime('now', '-1 day')),
('http://localhost:8788/blog/post-2', 'https://google.com', 'Mozilla/5.0', '1.2.3.4', 'JP', 'localhost', 'sess-old-2', datetime('now', '-1 day', '-2 hours')),

-- 前天的数据
('http://localhost:8788/', 'direct', 'Mozilla/5.0', '5.6.7.8', 'CN', 'localhost', 'sess-old-3', datetime('now', '-2 days')),
('http://localhost:8788/', 'direct', 'Mozilla/5.0', '5.6.7.9', 'CN', 'localhost', 'sess-old-4', datetime('now', '-2 days', '-1 hour'));
