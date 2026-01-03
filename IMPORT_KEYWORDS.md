# Hướng Dẫn Import Keywords

Tài liệu này hướng dẫn cách thêm từ khóa vào cơ sở dữ liệu (`keywords.db`) để hiển thị dưới footer hoặc sử dụng cho SEO.

## 1. Chuẩn bị file từ khóa

1.  Truy cập thư mục: `lib/keywords/data/`
2.  Tạo một file `.txt` mới (ví dụ: `new_keys.txt`, `thang1_2026.txt`). Tên file không quan trọng, miễn là đuôi `.txt`.
3.  Nhập danh sách từ khóa vào file, **mỗi từ khóa nằm trên một dòng riêng biệt**.

**Ví dụ nội dung file `lib/keywords/data/my-keys.txt`:**
```text
phim hành động
phim tình cảm
phim chiếu rạp 2026
review phim hay
```

## 2. Chạy lệnh Import

Mở terminal (CMD/PowerShell) tại thư mục gốc của dự án và chạy lệnh sau:

```bash
npm run import:keywords
```

Hoặc nếu bạn dùng `yarn`:

```bash
yarn import:keywords
```

## 3. Cơ chế hoạt động

*   Script sẽ quét tất cả các file `.txt` trong thư mục `lib/keywords/data/`.
*   Nó sẽ đọc từng dòng và thêm vào bảng `keywords` trong `keywords.db`.
*   **Trùng lặp**: Nếu từ khóa đã tồn tại trong database, script sẽ tự động bỏ qua (không tạo bản sao).
*   Sau khi chạy xong, script sẽ báo cáo số lượng từ khóa mới được thêm vào và số lượng bị bỏ qua.

## 4. Kiểm tra

Sau khi import thành công, bạn có thể kiểm tra trên trang web (khu vực Footer) hoặc dùng phần mềm quản lý SQLite để mở file `keywords.db` và kiểm tra bảng `keywords`.
