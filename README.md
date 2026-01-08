# Pornse.org - Video Search & Management System

A high-performance Next.js application for searching and displaying video content, featuring an advanced keyword management dashboard, optimized caching, and dynamic sitemap generation.

## 🚀 Features

*   **Video Search & Streaming**: Efficient scaffolding and streaming of video content (xVideos source).
*   **Admin Dashboard**: comprehensive keyword management at `/dashboard/keywords`.
    *   **Bulk Upload**: Support for uploading 10,000+ keywords instantly using optimized SQL transactions.
    *   **Search & Filter**: Real-time management of keyword database.
*   **Performance Optimization**:
    *   **Stale-While-Revalidate Caching**: JSON file caching (`lib/repository.ts`) with background revalidation.
    *   **Request Memoization**: React `cache()` to deduplicate data fetching within single requests.
    *   **Optimized Embeds**: Minified and deferred `embed.html` for instant player loading.
*   **SEO Ready**:
    *   **Dynamic Sitemaps**: Auto-split sitemaps (10k URLs/file) at `/sitemap/main.xml`.
    *   **Robots.txt**: Configured for SEO and security.
    *   **Social Sharing**: Integrated ShareThis support.

## 🛠️ Installation & Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/kjsslv/xvideos-search.git
    cd xvideos-search
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Database Setup**:
    The project uses SQLite (`better-sqlite3`). The database file `keywords.db` is automatically created/checked in the root directory.

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Access the site at `http://localhost:3000`.

## 🔐 Admin Access

Access the dashboard at: http://localhost:3000/login

*   **Username**: `admin`
*   **Password**: `password` (Default - Change in `app/actions/auth.ts`)

## 🏗️ Architecture Highlights

### 1. Data Caching (`lib/repository.ts`)
The application uses a file-based cache with a **Stale-While-Revalidate** strategy:
*   **Reads**: If a cache file exists (even expired), it is returned immediately (Fast).
*   **Revalidation**: If the file is older than 7 days, a background fetch is triggered to update it for the next user.
*   **Storage**: Cached JSON files are sharded in `data/xx/yy/filename.json` to prevent directory bloat.

### 2. Sitemap Generation (`app/sitemap/`)
Sitemaps are generated dynamically via Route Handlers to bypass standard Next.js build limits:
*   **Index**: `/sitemap/main.xml` lists all child sitemaps.
*   **Partitions**: `/sitemap/[id]` (e.g., `0.xml`) serves chunks of 10,000 URLs.
*   **Source**: Derived directly from the `keywords` database.

### 3. Embed Player (`public/embed.html`)
An optimized wrapper for JWPlayer:
*   **Defer**: Scripts are deferred to avoid blocking rendering.
*   **Minified**: HTML/CSS/JS are compressed.
*   **Preconnect**: Connections to CDNs are established early.

## 🧹 Maintenance

### Cache Cleanup
To free up disk space from unused cache files, run the cleanup script manually or via Cron:

```bash
# Deletes files not accessed in the last 7 days
node scripts/clean-cache.js
```

## 📄 License
Private / Proprietary.
