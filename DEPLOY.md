# Hướng Dẫn Deploy Lên VPS

Tài liệu này hướng dẫn cách đưa website lên VPS (Ubuntu/CentOS). Có 2 cách phổ biến: **Docker** (khuyên dùng) và **PM2**.

---

## Cách 1: Sử dụng Docker (Khuyên dùng)
Cách này đơn giản, ổn định, không lo xung đột phiên bản Node.js.

### Bước 1: Cài đặt Docker
Nếu VPS chưa có Docker, hãy chạy lệnh sau:
```bash
# Cài đặt nhanh Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Cài đặt docker-compose (nếu chưa có)
sudo apt install docker-compose -y
```

### Bước 2: Upload Source Code
Upload toàn bộ source code lên VPS (dùng SFTP hoặc Git clone). Vd: `/var/www/my-web`.

### Bước 3: Chạy Website
Tại thư mục chứa source code, chạy:
```bash
# Tạo file db rỗng nếu chưa có (để Docker mount vào)
touch keywords.db

# Chạy container
docker-compose up -d --build
```
Website sẽ chạy tại `http://IP_VPS:3000`.

---

## Cách 2: Sử dụng PM2 (Thủ công)
Cách này chạy trực tiếp trên Node.js của VPS.

### Bước 1: Cài đặt môi trường
Bạn cần Node.js v18 trở lên.
```bash
# Cài Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Bước 2: Cài đặt Dependencies và Build
```bash
# Vào thư mục project
cd /path/to/project

# Cài thư viện
npm install

# Build ứng dụng
npm run build
```

### Bước 3: Chạy với PM2
```bash
# Cài PM2
sudo npm install -g pm2

# Chạy app
pm2 start npm --name "xvideos-search" -- start

# Lưu cấu hình để tự chạy lại khi khởi động VPS
pm2 save
pm2 startup
```

---

## Cấu hình Cache & Database
*   **Database**: File `keywords.db` lưu trữ keywords. Hãy backup file này định kỳ.
*   **Cache**: Thư mục `data/` chứa cache JSON.

### Dọn dẹp cache
Chạy lệnh sau để xóa cache cũ > 7 ngày:
```bash
node scripts/clean-cache.js
```
Hoặc cài cron job chạy tự động hàng tuần.

---

## Cấu hình Tên Miền & SSL (Nginx)
Để chạy domain `pornse.org` với HTTPS, bạn cần cài Nginx làm Proxy ngược.

1.  **Cài Nginx**: `sudo apt install nginx`
2.  **Cấu hình**: Tạo file `/etc/nginx/sites-available/pornse.org`:
    ```nginx
    server {
        server_name pornse.org;
        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```
3.  **Kích hoạt**:
    ```bash
    ln -s /etc/nginx/sites-available/pornse.org /etc/nginx/sites-enabled/
    nginx -t
    systemctl restart nginx
    ```
4.  **Cài SSL (Certbot)**:
    ```bash
    sudo apt install certbot python3-certbot-nginx
    sudo certbot --nginx -d pornse.org
    ```
