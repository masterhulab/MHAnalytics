# MHAnalytics

[English](README_EN.md) | [中文](README.md)

一个基于 **Cloudflare Pages Functions** 和 **D1 Database** 构建的轻量级、隐私友好的网站分析工具。

本项目旨在通过 GitHub 轻松部署，并完全通过 Cloudflare 仪表盘进行配置，最终用户**无需修改任何代码**。

## ✨ 特性

- **🚀 无服务器 & 快速**：运行在 Cloudflare 全球网络 (Pages Functions) 上，延迟极低。
- **🔒 隐私优先**：无 Cookie，不收集个人数据。使用每日会话哈希 (Session Hash) 统计唯一访客，无法跨天追踪用户。
- **📊 内置仪表盘**：直接从你的 Pages URL 查看实时统计数据，支持多种时间范围（24小时、7天、30天、3个月、6个月、1年、全部）。
- **🎨 现代 UI & 交互**：精心设计的暗色/亮色模式，玻璃拟态效果，以及平滑的加载动画和空状态引导。
- **🌍 国际化支持**：内置中英文一键切换，自动适配访客语言偏好。
- **🚩 隐私友好图标**：集成 `flag-icons` 和 `bootstrap-icons`，本地渲染图标，不依赖第三方 CDN。
- **⚙️ 零代码配置**：通过标准环境变量自定义一切（时区、允许的来源、忽略列表）。
- **🛠️ 模块化架构**：使用 TypeScript、Hono 和模块化服务构建的清晰代码结构。
- **🆓 免费层友好**：非常适合中小型站点，完全在 Cloudflare 免费层限制范围内。

## ⚙️ 环境变量配置

无需修改代码，直接在 Cloudflare Dashboard 的 **Settings** -> **Environment variables** 中添加以下变量即可：

| 变量名 | 描述 | 示例 / 默认值 |
| :--- | :--- | :--- |
| `API_KEY` | **(推荐)** 用于保护仪表盘访问的密钥。若未设置，仪表盘将公开访问。 | `my-secret-password` |
| `ALLOWED_ORIGINS` | 允许上报数据的域名列表（CORS）。支持通配符 `*`。 | `https://example.com,https://*.blog.com` |
| `TZ_OFFSET` | 仪表盘和统计数据的时区偏移量（小时）。 | `8` (默认，即北京时间 UTC+8) |
| `IGNORE_IPS` | 不统计的 IP 地址列表（如你自己的 IP）。 | `127.0.0.1, 192.168.1.1` |
| `IGNORE_PATHS` | 不统计的路径前缀列表（如后台管理路径）。 | `/admin, /preview` |
| `SITE_NAME` | 仪表盘显示的站点名称。 | `My Awesome Blog` |
| `AUTHOR_NAME` | 仪表盘页脚显示的作者名称。 | `John Doe` |

> **注意**：修改环境变量后，需要**重新部署**（或在 Deployment 列表点击 "Retry deployment"）才会生效。

## 📦 客户端集成

### 1. 基础统计 (PV/UV)

在你的网站 HTML 的 `<head>` 或 `<body>` 中引入以下脚本：

```html
<script defer src="https://your-analytics-project.pages.dev/tracker.js"></script>
```

- 将 `https://your-analytics-project.pages.dev` 替换为你实际部署的 Cloudflare Pages 域名。
- 脚本加载后会自动上报一次访问 (PV/UV)。

### 方式 2：使用 ID（兼容旧版）

如果您已有的页面使用了特定的 ID，脚本也会自动填充数据：

```html
<!-- 页面访问量 (Page PV) -->
<span id="mh_page_pv">...</span>

<!-- 页面访客数 (Page UV) -->
<span id="mh_page_uv">...</span>

<!-- 全站访问量 (Site PV) -->
<span id="mh_site_pv">...</span>

<!-- 全站访客数 (Site UV) -->
<span id="mh_site_uv">...</span>
```

### 方式 3：自定义数据属性 (推荐)

如果你想在页面底部显示当前页面的访问量（类似“不蒜子”）：

```html
<!-- 显示当前页面 PV -->
<span data-mh-stat="pv">...</span>

<!-- 显示当前页面 UV -->
<span data-mh-stat="uv">...</span>

<!-- 显示全站总 PV -->
<span data-mh-stat="site_pv">...</span>

<!-- 显示全站总 UV -->
<span data-mh-stat="site_uv">...</span>
```

脚本会自动查找带有 `data-mh-stat` 属性的元素，并填入对应的数据。

## 🔌 API 文档

如果你想开发自己的前端或在其他地方使用数据，可以直接调用 API：

### 1. 上报数据
- **Endpoint**: `POST /api/collect` (推荐) 或 `GET /api/collect`
- **功能**: 记录一次访问。
- **参数 (JSON)**:
  - `url`: 当前页面 URL
  - `referrer`: 来源页面
  - `userAgent`: 用户代理字符串

### 2. 获取计数
- **Endpoint**: `GET /api/counts`
- **参数**:
  - `url`: (必填) 需要查询的页面 URL
- **返回**:
  ```json
  {
    "page": { "pv": 100, "uv": 50, "todayPv": 10, "todayUv": 5 },
    "site": { "pv": 10000, "uv": 5000, "todayPv": 100, "todayUv": 50 }
  }
  ```

### 3. 仪表盘数据
- **Endpoint**: `GET /api/stats`
- **Header**: `x-api-key: <your-api-key>` (如果配置了 `API_KEY`)
- **参数**:
  - `range`: 时间范围 (24h, 7d, 30d, 3m, 6m, 1y, all)
  - `domain`: (可选) 过滤特定域名
- **返回**: 包含趋势图、来源、浏览器、系统、地理位置等详细统计数据。

## 💻 本地开发

本项目完全支持使用 Cloudflare Wrangler CLI 进行本地开发和测试。

### 1. 安装依赖
```bash
npm install
```

### 2. 生成测试数据 (可选)
为了在开发过程中能够预览仪表盘的完整功能，建议生成测试数据：

```bash
# 生成包含 500+ 条随机访问记录的 seed.sql
node scripts/generate_seed.js

# 导入到本地 D1 数据库
npx wrangler d1 execute analytics-db --local --file=./seed.sql
```

### 3. 启动开发服务器
```bash
npm run dev
```
访问 `http://localhost:8788` 即可查看本地运行的分析服务。

## 🚀 部署指南

### 1. 准备工作
1. **Fork** 此仓库。
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)。
3. 进入 **Workers & Pages** -> **Create Application** -> **Pages** -> **Connect to Git**。

### 2. 创建 Pages 项目
1. 选择仓库，点击 **Begin setup**。
2. **Framework preset**: 选择 `None`。
3. **Build output directory**: `public`。
4. 点击 **Save and Deploy**。

### 3. 绑定数据库 (D1)
1. 在 Cloudflare 左侧菜单 **D1** 中创建一个新数据库（如 `analytics-db`）。
2. 回到 Pages 项目 -> **Settings** -> **Functions**。
3. 添加 **D1 Database Binding**：变量名为 `DB`，选择刚才创建的数据库。
4. **重要**：重新部署一次以生效。

### 4. 初始化数据库表
在本地项目根目录运行（需要先登录 wrangler）：
```bash
npx wrangler d1 execute analytics-db --remote --file=./schema.sql
```
或者在 Cloudflare D1 控制台手动执行 `schema.sql` 的内容。

## 📄 开源协议

MIT License
