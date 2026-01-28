# MHAnalytics

[English](README_EN.md) | [中文](README.md)

A lightweight, privacy-friendly website analytics tool built on **Cloudflare Pages Functions** and **D1 Database**.

Designed to be deployed easily via GitHub and configured entirely through the Cloudflare Dashboard, requiring **zero code changes** for the end user.

## ✨ Features

- **🚀 Serverless & Fast**: Runs on Cloudflare's global network (Pages Functions) with minimal latency.
- **🔒 Privacy-First**: No cookies, no PII collected. Uses daily session hashing to count unique visitors without cross-day tracking.
- **📊 Built-in Dashboard**: View real-time stats directly from your Pages URL, supporting multiple time ranges (24h, 7d, 30d).
- **⚙️ Zero-Code Config**: Customize everything (Timezone, Allowed Origins, Ignore Lists) via standard environment variables.
- **🛠️ Modular Architecture**: Clean code structure using TypeScript, Hono, and modular services.
- **🆓 Free Tier Friendly**: Fits perfectly within Cloudflare's free tier limits for small to medium sites.

## 💻 Local Development

This project fully supports local development and testing using the Cloudflare Wrangler CLI.

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Local Database (Optional)
By default, local development uses Wrangler's simulated SQLite database.
You can import seed data to verify the dashboard:
```bash
npx wrangler d1 execute analytics-db --local --file=./seed.sql
```

### 3. Configure Remote D1 (Optional)
If you want your local environment to connect to the real D1 database on Cloudflare (or use a consistent UUID), modify `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "analytics-db"
# database_id = "your-real-d1-id" # Uncomment to connect remote or fix ID
```

*   **Note**: `database_id` links to the remote DB. If enabled during development, `wrangler d1 execute --local` uses the local file corresponding to that ID.

### 4. Start Development Server
```bash
npm run dev
```
Visit `http://localhost:8788` to view your locally running analytics service.

## 🚀 Deployment Guide

### 1. Preparation

1.  **Fork** this repository to your GitHub account.
2.  Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
3.  Go to **Workers & Pages** -> **Overview** -> **Create Application** -> **Pages** -> **Connect to Git**.

### 2. Create Pages Project

1.  Select your forked `analytics` repository and click **Begin setup**.
2.  **Project name**: Choose a name for your analytics service (e.g., `my-analytics`).
3.  **Production branch**: `main`.
4.  **Framework preset**: Select `None`.
5.  **Build command**: `npm run deploy` (or leave empty, as we are mainly deploying Functions).
6.  **Build output directory**: `public` (even if this folder doesn't exist, just don't leave it empty).
7.  Click **Save and Deploy**.

### 3. Configure Database (Crucial Step)

The first deployment might succeed but will fail to connect to the database. You need to manually bind the D1 database.

1.  In the Cloudflare Dashboard left menu, find **D1** and create a new database (e.g., `analytics-db`).
2.  Go back to your Pages project page.
3.  Click **Settings** -> **Functions**.
4.  Scroll down to find **D1 Database Bindings**.
5.  Click **Add binding**:
    *   **Variable name**: `DB` (Must be uppercase `DB`).
    *   **D1 database**: Select the database you just created.
6.  Click **Save**.

### 4. Redeploy

For the database binding to take effect, you need to redeploy once.

1.  Go to the **Deployments** tab.
2.  Find the latest deployment, click the three-dot menu on the right -> **Retry deployment**.
3.  Wait for the deployment to complete.

### 5. Initialize Database

Visit `https://your-project-name.pages.dev/setup` (if you set an API_KEY, append `?key=YOUR_KEY`) to create the database tables.
Seeing "Database initialized successfully" means success.

## ⚙️ Configuration

You can customize the behavior by setting **Environment Variables** in your Cloudflare Worker settings (Settings -> Variables). **No code edits required.**

| Variable | Description | Example |
|----------|-------------|---------|
| `API_KEY` | Protects the `/setup` endpoint and (optionally) stats. | `s3cr3t-k3y` |
| `ALLOWED_ORIGINS` | CORS allowed domains. Supports wildcards (`*`). | `https://blog.com, *.mysite.com` |
| `SITE_NAME` | Custom title for the analytics dashboard. | `My Tech Blog` |
| `AUTHOR_NAME` | Custom author name displayed in the navbar. | `Master Hu` |
| `TZ_OFFSET` | Timezone offset in hours for "Today" stats. | `8` (UTC+8), `-5` (UTC-5) |
| `IGNORE_IPS` | Comma-separated list of IPs to exclude from stats. | `1.2.3.4, 192.168.1.1` |
| `IGNORE_PATHS` | Comma-separated list of URL paths to exclude. | `/admin, /preview` |

## 📦 Usage

### 1. Add Tracking Script
Add this snippet to your website's `<head>` or `<body>`. Replace the URL with your Worker's URL.

```html
<script 
  src="https://your-worker.workers.dev/lib/core.js" 
  data-endpoint="https://your-worker.workers.dev/api/event"
  async defer>
</script>
```

> **Tip**: `data-endpoint` is optional. If omitted, the script automatically tries to derive the API address from `src`. However, explicit specification is recommended for stability.

### 2. Display Statistics (Optional)
If you want to display visit counts on your page footer or elsewhere, simply add `<span>` tags with specific IDs. The script will automatically fill in the data (supports SPAs like Vue/React).

```html
<!-- Today's Data -->
Today's Views: <span id="mh_today_pv">...</span>
Today's Visitors: <span id="mh_today_uv">...</span>

<!-- Total Site Data -->
Total Views: <span id="mh_site_pv">...</span>
Total Visitors: <span id="mh_site_uv">...</span>

<!-- Current Page Data -->
Page Views: <span id="mh_page_pv">...</span>
Page Visitors: <span id="mh_page_uv">...</span>
```

You don't need to add all of them; just combine as needed. The script detects existing IDs and requests only the necessary data.

### 3. View Dashboard
Simply visit your Worker's root URL: `https://your-worker.workers.dev/`

## 🔒 Security & Privacy

- **No Cookies**: This project does not use any persistent cookies to track users.
- **Data Anonymization**: User identification is based on a hash of IP + UserAgent + Date. The hash salt rotates daily, meaning user behavior cannot be correlated across days.
- **Data Ownership**: All data is stored in your own Cloudflare D1 database, which you can export or delete at any time.
- **Access Control**: Sensitive management endpoints can be protected via `API_KEY`.

## 📂 Project Structure

- `src/index.ts`: Main entry point and router (Hono App).
- `src/analytics.ts`: Core business logic, database operations, and stats aggregation (parallel query optimization).
- `src/types.ts`: TypeScript interfaces and type definitions.
- `src/utils.ts`: Helper functions (Bot detection, CORS, Parsing, HTML escaping).
- `src/dashboard.ts`: HTML template for the frontend dashboard.
- `src/tracker.ts`: Source code for the client-side tracking script.
- `functions/[[path]].ts`: Entry adapter for Cloudflare Pages Functions.

## 🤝 Contributing

Issues and Pull Requests are welcome! If you find a bug or have a feature suggestion, feel free to reach out.

## 🛡️ License

MIT License. See [LICENSE](./LICENSE) file.

## 👤 Author

**masterhulab**
- GitHub: [@masterhulab](https://github.com/masterhulab)
