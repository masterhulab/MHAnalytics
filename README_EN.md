# MHAnalytics

<div align="center">

![MHAnalytics](https://socialify.git.ci/masterhulab/mhanalytics/image?description=1&font=Inter&language=1&name=1&owner=1&pattern=Circuit%20Board&theme=Auto)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-orange.svg?logo=cloudflare)](https://pages.cloudflare.com)
[![D1 Database](https://img.shields.io/badge/Cloudflare-D1-orange.svg?logo=cloudflare)](https://developers.cloudflare.com/d1/)
[![Hono](https://img.shields.io/badge/Framework-Hono-E36002.svg?logo=hono)](https://hono.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg?logo=typescript)](https://www.typescriptlang.org/)

[English](README_EN.md) | [中文](README.md)

</div>

**MHAnalytics** is a lightweight, privacy-friendly website analytics tool built on **Cloudflare Pages Functions** and **D1 Database**.

Designed to be deployed easily via GitHub and configured entirely through the Cloudflare Dashboard, requiring **zero code changes** for the end user.

## ✨ Features

- **🚀 Serverless & Free Tier Friendly**: Runs on Cloudflare's global network (Pages Functions) with minimal latency, fitting perfectly within free tier limits.
- **🔒 Privacy-First**: No cookies, no PII collected. Uses daily session hashing to count unique visitors without cross-day tracking.
- **🛡️ Anti-Adblock**: Uses generic endpoint names (`/api/event`) by default to minimize blocking.
- **📊 Built-in Dashboard**: View real-time stats directly from your Pages URL, supporting multiple time ranges (24h, 7d, 30d, 3m, 6m, 1y, All).
- **🎨 Modern UI & UX**: Designed with dark/light modes, glassmorphism, smooth loading animations, and intuitive empty states.
- **🌍 I18n Support**: Built-in English/Chinese switching, automatically adapting to visitor preferences.
- **🚩 Privacy-Friendly Icons**: Integrated `flag-icons` and `bootstrap-icons` for locally rendered icons, without external CDN dependencies.
- **⚙️ Zero-Code Config**: Customize everything (Timezone, Allowed Origins, Ignore Lists) via standard environment variables.
- **🛠️ Modular Architecture**: Adopts Router-Controller-Service layered architecture, built with TypeScript and Hono for maintainability and extensibility.
- **⚡ High Performance**: Optimized for Cloudflare Edge with parallel database queries and aggressive caching strategies.
- **🔒 Security Hardened**: Built-in Content Security Policy (CSP), strict input sanitization, and CORS validation.

## ⚙️ Environment Variables

Configure these in the Cloudflare Dashboard under **Settings** -> **Environment variables**. No code changes required.


| Variable          | Description                                                                            | Example / Default                        |
| :---------------- | :------------------------------------------------------------------------------------- | :--------------------------------------- |
| `API_KEY`         | **(Recommended)** Secret key to protect your dashboard. If unset, dashboard is public. | `my-secret-password`                     |
| `ALLOWED_ORIGINS` | List of domains allowed to report data (CORS). Supports`*` wildcard.                   | `https://example.com,https://*.blog.com` |
| `TZ_OFFSET`       | Timezone offset (in hours) for dashboard and stats.                                    | `8` (Default, UTC+8)                     |
| `IGNORE_IPS`      | List of IPs to ignore (e.g., your own IP).                                             | `127.0.0.1, 192.168.1.1`                 |
| `IGNORE_PATHS`    | List of path prefixes to ignore (e.g., admin panels).                                  | `/admin, /preview`                       |
| `SITE_NAME`       | Site name displayed on the dashboard.                                                  | `My Awesome Blog`                        |
| `AUTHOR_NAME`     | Author name displayed in the footer.                                                   | `John Doe`                               |

> **Note**: After changing environment variables, you must **redeploy** (or click "Retry deployment") for changes to take effect.

## 📦 Client Integration

### Quick Start

Add the following script to the `<head>` or `<body>` of your website:

```html
<script defer src="https://your-analytics-project.pages.dev/tracker.js"></script>
```

- Replace `https://your-analytics-project.pages.dev` with your actual Cloudflare Pages domain.
- The script automatically reports to `/api/event` by default.

### Custom Endpoint (Optional)

If you need to customize the reporting endpoint (e.g., using a custom domain), add the `data-endpoint` attribute:

```html
<script
  defer
  src="https://your-analytics-project.pages.dev/tracker.js"
  data-endpoint="https://your-custom-domain.com/api/event">
</script>
```

## 📊 Public Stats Display

If you want to display visit counts on your page:

### Method 1: Using Data Attributes (Recommended)

```html
<!-- Display current page PV -->
<span data-mh-stat="pv">...</span>

<!-- Display current page UV -->
<span data-mh-stat="uv">...</span>

<!-- Display site total PV -->
<span data-mh-stat="site_pv">...</span>

<!-- Display site total UV -->
<span data-mh-stat="site_uv">...</span>
```

### Method 2: Using ID Attributes (Legacy Support)

The script also supports filling data into elements with specific IDs:

```html
<!-- Display site total PV -->
<span id="mh_site_pv">...</span>

<!-- Display site total UV -->
<span id="mh_site_uv">...</span>

<!-- Display current page PV -->
<span id="mh_page_pv">...</span>

<!-- Display current page UV -->
<span id="mh_page_uv">...</span>
```

## 🔌 API Documentation

You can also use the API directly for custom integrations:

### 1. Collect Data

- **Endpoint**: `POST /api/event` (Recommended) or `GET /api/event`
- **Function**: Record a visit.
- **Params (JSON)**:
  - `url`: Current page URL
  - `referrer`: Referrer URL
  - `userAgent`: User Agent string

### 2. Get Counts

- **Endpoint**: `GET /api/info`
- **Params**:
  - `url`: (Required) The page URL to query
- **Returns**:
  ```json
  {
    "page": { "pv": 100, "uv": 50, "todayPv": 10, "todayUv": 5 },
    "site": { "pv": 10000, "uv": 5000, "todayPv": 100, "todayUv": 50 }
  }
  ```

### 3. Dashboard Stats

- **Endpoint**: `GET /api/stats`
- **Header**: `x-api-key: <your-api-key>` (If `API_KEY` is set)
- **Params**:
  - `range`: Time range (24h, 7d, 30d, 3m, 6m, 1y, all)
  - `domain`: (Optional) Filter by domain
- **Returns**: Detailed stats including trends, sources, browsers, OS, geography, etc.

## 🛠️ Local Development

This project supports local development using Cloudflare Wrangler CLI.

### 1. Install Dependencies

```bash
npm install
```

### 2. Generate Test Data (Optional)

To preview the full dashboard functionality during development:

```bash
# Generate seed.sql with 500+ random visits
node scripts/generate_seed.js

# Import into local D1 database
npx wrangler d1 execute analytics-db --local --file=./seed.sql
```

### 3. Start Server

```bash
npm run dev
```

Visit `http://localhost:8788` to see the analytics service running locally.

## 🚀 Deployment Guide

### 1. Preparation

1. **Fork** this repository.
2. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/).
3. Go to **Workers & Pages** -> **Create Application** -> **Pages** -> **Connect to Git**.

### 2. Create Pages Project

1. Select repository, click **Begin setup**.
2. **Framework preset**: `None`.
3. **Build output directory**: `public`.
4. Click **Save and Deploy**.

### 3. Bind Database (D1)

1. Create a new D1 database (e.g., `analytics-db`) in Cloudflare dashboard.
2. Go to Pages Project -> **Settings** -> **Functions**.
3. Add **D1 Database Binding**: Variable name `DB`, select your database.
4. **Important**: Redeploy for changes to take effect.

### 4. Initialize Table

Run locally (requires login):

```bash
npx wrangler d1 execute analytics-db --remote --file=./schema.sql
```

Or manually execute `schema.sql` content in the Cloudflare D1 console.

## 📂 Project Structure

```
├── functions/
│   └── [[path]].ts      # Cloudflare Pages Functions Entry (Hono Adapter)
├── scripts/             # Utility Scripts
│   ├── find_icons.js    # Scan used icons
│   ├── generate_seed.js # Generate test data
│   └── update_icons.js  # Update icon set
├── src/                 # Source Code
│   ├── analytics.ts     # [Service] Analytics Service & DB Logic
│   ├── controllers.ts   # [Controller] Request Handlers
│   ├── dashboard.ts     # [View] Dashboard HTML Rendering (SSR)
│   ├── dashboard-css.ts # [View] Dashboard Styles (CSS in JS)
│   ├── dashboard-js.ts  # [View] Dashboard Client-side Logic
│   ├── icons.ts         # SVG Icon Collection (Local, No CDN)
│   ├── index.ts         # [Router] App Entry & Route Dispatch
│   ├── tracker.ts       # Client-side Tracking Script (tracker.js)
│   ├── types.ts         # TypeScript Definitions
│   └── utils.ts         # Utility Functions
├── schema.sql           # Database Schema
├── wrangler.toml        # Cloudflare Configuration
└── package.json         # Project Dependencies
```

## 📄 License

MIT License © 2026 [masterhulab](https://github.com/masterhulab)
