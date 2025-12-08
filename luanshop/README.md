## LTL Shop (React + Vite + Tailwind)

Một web tĩnh hiển thị danh sách sản phẩm từ `public/products.json`. Không có đăng nhập công khai. Có công cụ quản trị ẩn để xuất file JSON (không ghi server).

### Chạy dự án

1. Cài Node.js bản LTS
2. Cài dependencies:
```bash
npm install
```
3. Chạy dev:
```bash
npm start
```
Mở `http://localhost:5173`.

### Gộp frontend + backend (Node.js + Express)

Backend Express để phục vụ file tĩnh (build React) và API trong cùng một service.

1) Build frontend:
```bash
npm run build
```
2) Chạy server Express:
```bash
npm run serve
```
Server sẽ chạy tại `http://localhost:3000`.

- API mẫu: `GET /api/hello` trả về `{ message: "Hello from Express API" }`.
- API đọc JSON tĩnh: `GET /api/products` (đọc `public/products.json`).
- Mọi route khác sẽ trả về `dist/index.html` để hỗ trợ SPA.

### API, Auth và Swagger

- Swagger UI: `http://localhost:3000/api/docs`

Auth (JWT đơn giản, in-memory users):
- Đăng ký: `POST /api/auth/register` body `{ "username": "admin", "password": "secret" }`
  - Người dùng đầu tiên sẽ có role `admin`.
- Đăng nhập: `POST /api/auth/login` body tương tự → trả về `{ token, role }`.
- Gửi JWT trong header: `Authorization: Bearer <token>`

Admin CRUD (ghi vào `public/products.json`):
- Tạo: `POST /api/admin/products` body là object sản phẩm.
- Sửa: `PUT /api/admin/products/:id`
- Xoá: `DELETE /api/admin/products/:id`

Lưu ý: Demo ghi file đơn giản, phù hợp môi trường tự host. Với hosting read-only, hãy giữ cơ chế export JSON như phần Admin ẩn trên frontend.

### Biến môi trường

Tạo file `.env` (cùng cấp `package.json`) nếu cần:
```
PORT=3000
JWT_SECRET=change_me_strong_secret
CORS_ORIGIN=http://localhost:3000
VITE_API_URL=
```

### Chat khách ↔ Admin

- Gửi tin nhắn không cần đăng nhập: `POST /api/chat` body `{ text, name?, contact? }`.
- Admin xem: `GET /api/admin/chat` (JWT admin)
- Admin trả lời: `POST /api/admin/chat/reply` (JWT admin)
- Frontend có nút chat nổi ở góc phải; tin nhắn lưu tại `data/chat.json`.
- Realtime: Socket.IO phát `chat:new` và `chat:reply` → UI cập nhật tức thì và có âm báo nhẹ (`public/notify.mp3`).

### Lưu trữ người dùng (persistent)

- Người dùng được lưu tại `data/users.json`. Lần đầu chạy file sẽ tự tạo.
- Người đăng ký đầu tiên có role `admin`. Các tài khoản sau là `user`.
- Sao lưu đơn giản: copy toàn bộ thư mục `data/` trước khi deploy.

Triển khai 1 service duy nhất:
```bash
npm start
```
Script này sẽ build frontend rồi chạy `server.js`.

Triển khai trên hosting/VPS/Docker:
- Yêu cầu Node.js 18+.
- Thiết lập biến môi trường `PORT` nếu cần (mặc định 3000).
- Reverse proxy (tuỳ chọn) qua Nginx/Caddy tới `localhost:3000`.

### Admin UI

- `/admin/login`: đăng nhập/đăng ký (JWT), lưu token vào localStorage.
- `/admin`: Dashboard gồm 2 tab: Products (CRUD) và Chat (thread list + hội thoại realtime).
- Nút "Đăng nhập" hiển thị trên Header (topbar).

### Sử dụng MockAPI (tuỳ chọn)

- Tạo file `.env` ở thư mục gốc với nội dung:
```env
VITE_API_URL=https://68c8133f5d8d9f51473435a7.mockapi.io/product
```
- Nếu không cấu hình, app sẽ mặc định đọc `public/products.json`.

### Cấu trúc chính

- `public/products.json`: dữ liệu sản phẩm (read-only khi deploy, người dùng không thể sửa trên web).
- `src/modules/data/useProducts.ts`: fetch dữ liệu từ `products.json`.
- `src/modules/components/*`: Header, Footer, ProductCard, Admin.

### Quản trị ẩn (chỉ bạn biết)

- Mở hộp đăng nhập admin bằng tổ hợp phím: `Ctrl + Alt + A`
- Tài khoản: `admin`
- Mật khẩu: `123123`

Sau khi đăng nhập, bạn có thể chỉnh sửa JSON và bấm Export để tải file `products.json`. Hãy thay thế file trong thư mục `public/` của dự án trước khi build/deploy. Không có thao tác ghi dữ liệu lên server, đảm bảo người dùng bên ngoài không sửa được.

### Build production

```bash
npm run build
npm run preview
```

### Gợi ý cập nhật dữ liệu

1. Dùng admin ẩn để chỉnh sửa và export JSON.
2. Ghi đè `public/products.json` bằng file vừa export.
3. Commit và deploy lại site tĩnh của bạn.

### Seed dữ liệu dịch vụ bản quyền cho MockAPI

- Tạo collection trong MockAPI với các trường: `id (string)`, `name (string)`, `price (number)`, `image (string)`, `category (string)`.
- Import mẫu từ `public/products.json` hoặc dán JSON này và Save.
- App sẽ đọc các trường trên và hiển thị theo danh mục.


