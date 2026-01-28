# MHAnalytics

[English](README_EN.md) | [中文](README.md)

一个基于 **Cloudflare Pages Functions** 和 **D1 Database** 构建的轻量级、隐私友好的网站分析工具。

本项目旨在通过 GitHub 轻松部署，并完全通过 Cloudflare 仪表盘进行配置，最终用户**无需修改任何代码**。

## ✨ 特性

- **🚀 无服务器 & 快速**：运行在 Cloudflare 全球网络 (Pages Functions) 上，延迟极低。
- **🔒 隐私优先**：无 Cookie，不收集个人数据。使用每日会话哈希 (Session Hash) 统计唯一访客，无法跨天追踪用户。
- **📊 内置仪表盘**：直接从你的 Pages URL 查看实时统计数据，支持多种时间范围（24小时、7天、30天）。
- **⚙️ 零代码配置**：通过标准环境变量自定义一切（时区、允许的来源、忽略列表）。
- **🛠️ 模块化架构**：使用 TypeScript、Hono 和模块化服务构建的清晰代码结构。
- **🆓 免费层友好**：非常适合中小型站点，完全在 Cloudflare 免费层限制范围内。

## 💻 本地开发

本项目完全支持使用 Cloudflare Wrangler CLI 进行本地开发和测试。

### 1. 安装依赖
```bash
npm install
```

### 2. 配置本地数据库 (可选)
本地开发默认使用 Wrangler 模拟的 SQLite 数据库。
你可以导入测试数据以便在仪表盘中查看效果：
```bash
npx wrangler d1 execute analytics-db --local --file=./seed.sql
```

### 3. 配置远程 D1 (可选)
如果你希望本地开发环境能够连接到 Cloudflare 上的真实 D1 数据库（或者使用与线上一致的 UUID），请修改 `wrangler.toml`：

```toml
[[d1_databases]]
binding = "DB"
database_name = "analytics-db"
# database_id = "your-real-d1-id" # 取消注释以连接远程或固定 ID
```

*   **注意**：`database_id` 用于关联远程数据库。开发时如果开启，`wrangler d1 execute --local` 会使用该 ID 对应的本地文件；如果注释掉，则使用默认临时文件。

### 4. 启动开发服务器
```bash
npm run dev
```
访问 `http://localhost:8788` 即可查看本地运行的分析服务。

## 🚀 部署指南

### 1. 准备工作

1. **Fork** 此仓库到你的 GitHub 账户。
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)。
3. 进入 **Workers & Pages** -> **Overview** -> **Create Application** -> **Pages** -> **Connect to Git**。

### 2. 创建 Pages 项目

1. 选择你 Fork 的 `analytics` 仓库并点击 **Begin setup**。
2. **Project name**: 给你的分析服务起个名字（例如 `my-analytics`）。
3. **Production branch**: `main`。
4. **Framework preset**: 选择 `None`。
5. **Build command**: `npm run deploy` (或者留空，因为我们主要是部署 Functions)。
6. **Build output directory**: `public` (即使没有此文件夹也没关系，只要不留空)。
7. 点击 **Save and Deploy**。

### 3. 配置数据库 (关键步骤)

首次部署可能会成功，但无法连接数据库。你需要手动绑定 D1 数据库。

1. 在 Cloudflare Dashboard 左侧菜单找到 **D1**，创建一个新数据库（例如 `analytics-db`）。
2. 回到你的 Pages 项目页面。
3. 点击 **Settings** -> **Functions**。
4. 向下滚动找到 **D1 Database Bindings**。
5. 点击 **Add binding**：
   * **Variable name**: `DB` (必须是大写，不能改)。
   * **D1 database**: 选择你刚才创建的数据库。
6. 点击 **Save**。

### 4. 重新部署

为了让数据库绑定生效，你需要重新部署一次。

1. 进入 **Deployments** 标签页。
2. 找到最新的部署，点击右侧的三点菜单 -> **Retry deployment**。
3. 等待部署完成。

### 5. 初始化数据库

访问 `https://你的项目名.pages.dev/setup` (如果设置了 API_KEY，则需带上 `?key=你的KEY`) 来创建数据表。
看到 "Database initialized successfully" 即表示成功。

## ⚙️ 配置

你可以通过在 Cloudflare Worker 设置中设置 **环境变量** 来自定义行为（Settings -> Variables）。**无需编辑代码。**


| 变量名            | 描述                                   | 示例                             |
| ----------------- | -------------------------------------- | -------------------------------- |
| `API_KEY`         | 保护`/setup` 端点和（可选）统计数据。  | `s3cr3t-k3y`                     |
| `ALLOWED_ORIGINS` | CORS 允许的域名。支持通配符 (`*`)。    | `https://blog.com, *.mysite.com` |
| `SITE_NAME`       | 分析仪表盘的自定义标题。               | `My Tech Blog`                   |
| `AUTHOR_NAME`     | 导航栏显示的自定义作者名称。           | `Master Hu`                      |
| `TZ_OFFSET`       | "今日"统计的时区偏移量（小时）。       | `8` (UTC+8), `-5` (UTC-5)        |
| `IGNORE_IPS`      | 逗号分隔的 IP 列表，用于从统计中排除。 | `1.2.3.4, 192.168.1.1`           |
| `IGNORE_PATHS`    | 逗号分隔的 URL 路径列表，用于排除。    | `/admin, /preview`               |

## 📦 使用方法

### 1. 添加跟踪脚本

将此代码段添加到你网站的 `<head>` 或 `<body>` 中。将 URL 替换为你的 Worker URL。

```html
<script 
  src="https://your-worker.workers.dev/lib/core.js" 
  data-endpoint="https://your-worker.workers.dev/api/event"
  async defer>
</script>
```

> **提示**：`data-endpoint` 是可选的。如果省略，脚本会自动尝试根据 `src` 推导 API 地址。但为了稳定性，建议显式指定。

### 2. 展示统计数据 (可选)

如果你希望在页面页脚或其他位置展示访问量数据，只需在页面中添加带有特定 ID 的 `<span>` 标签。脚本会自动填充数据（支持 Vue/React 等单页应用）。

```html
<!-- 今日数据 -->
今日访问量: <span id="mh_today_pv">...</span>
今日访客数: <span id="mh_today_uv">...</span>

<!-- 全站数据 -->
本站总访问: <span id="mh_site_pv">...</span>
本站总访客: <span id="mh_site_uv">...</span>

<!-- 当前页数据 -->
本文阅读量: <span id="mh_page_pv">...</span>
本文访客数: <span id="mh_page_uv">...</span>
```

你不需要全部添加，按需组合即可。脚本会自动检测存在的 ID 并只请求需要的数据。

### 3. 查看仪表盘

直接访问你的 Worker 根 URL：`https://your-worker.workers.dev/`

## 🔒 安全 & 隐私

- **无 Cookie**：本项目不使用任何持久化 Cookie 来跟踪用户。
- **数据匿名化**：用户标识基于 IP + UserAgent + 当日日期的哈希值。哈希盐值每日轮换，这意味着无法跨天关联同一个用户的行为。
- **数据所有权**：所有数据存储在您自己的 Cloudflare D1 数据库中，您可以随时导出或删除。
- **访问控制**：可以通过 `API_KEY` 保护敏感的管理端点。

## 📂 项目结构

- `src/index.ts`: 主入口点和路由 (Hono App)。
- `src/analytics.ts`: 核心业务逻辑、数据库操作和统计聚合（并行查询优化）。
- `src/types.ts`: TypeScript 接口和类型定义。
- `src/utils.ts`: 辅助函数（Bot 检测、CORS、解析、HTML 转义）。
- `src/dashboard.ts`: 前端仪表盘的 HTML 模板。
- `src/tracker.ts`: 客户端跟踪脚本源码。
- `functions/[[path]].ts`: Cloudflare Pages Functions 的入口适配器。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！如果你发现 bug 或有新功能建议，请随时联系。

## 🛡️ 许可证

MIT License. 详见 [LICENSE](./LICENSE) 文件。

## 👤 作者

**masterhulab**

- GitHub: [@masterhulab](https://github.com/masterhulab)
