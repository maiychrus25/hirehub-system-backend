# Backend - HireHub

## 1. Giới thiệu

Backend của HireHub là máy chủ ứng dụng cung cấp các API cho hệ thống tuyển dụng trực tuyến. Backend xử lý toàn bộ logic kinh doanh, xác thực người dùng, quản lý dữ liệu và các tính năng phía máy chủ.

Backend đóng vai trò quan trọng:

- Quản lý xác thực & phân quyền (Authentication & Authorization)
- Xử lý logic tìm kiếm, lọc công việc
- Quản lý dữ liệu công ty, công việc, ứng viên
- Lưu trữ & quản lý CV ứng viên
- Xử lý upload file (ảnh, CV)
- Đảm bảo bảo mật dữ liệu

---

## 2. Công nghệ sử dụng

| Công nghệ             | Mô tả                                                  |
| --------------------- | ------------------------------------------------------ |
| **Node.js**           | Runtime JavaScript phía máy chủ                        |
| **Express.js**        | Framework web nhẹ cho Node.js, xây dựng REST API       |
| **TypeScript**        | Ngôn ngữ lập trình cung cấp type safety cho JavaScript |
| **MongoDB, Mongoose** | Database lưu trữ dữ liệu ứng dụng              |
| **Cloudinary**        | Dịch vụ cloud lưu trữ & quản lý file (ảnh, CV)         |
| **yarn**              | Package manager quản lý dependencies                   |
| **Middleware**        | Xử lý xác thực, logging, CORS, v.v.                    |

---

## 3. Cấu trúc thư mục

```
backend/
├── index.ts                          # Entry point của ứng dụng
├── package.json                      # Dependencies & scripts
├── tsconfig.json                     # Cấu hình TypeScript
├── search.controller.ts              # (deprecated hoặc backup) Controller tìm kiếm
│
├── config/
│   └── database.config.ts            # Cấu hình kết nối MySQL database
│
├── controllers/                      # Xử lý request & response
│   ├── auth.controller.ts            # Đăng nhập, đăng ký, refresh token
│   ├── city.controller.ts            # Quản lý danh sách thành phố
│   ├── company.controller.ts         # Quản lý công ty
│   ├── job.controller.ts             # Quản lý tin tuyển dụng
│   ├── search.controller.ts          # Tìm kiếm công việc
│   ├── upload.controller.ts          # Upload file/hình ảnh
│   └── user.controller.ts            # Quản lý ứng viên
│
├── models/                           # Database models (ORM)
│   ├── account-company.model.ts      # Model tài khoản công ty
│   ├── account-user.model.ts         # Model tài khoản ứng viên
│   ├── city.model.ts                 # Model thành phố
│   ├── cv.model.ts                   # Model CV ứng viên
│   ├── job.model.ts                  # Model tin tuyển dụng
│   └── model.ts                      # Base model (class cha)
│
├── routes/                           # Định nghĩa API routes
│   ├── auth.route.ts                 # Routes xác thực
│   ├── city.route.ts                 # Routes thành phố
│   ├── company.route.ts              # Routes công ty
│   ├── job.route.ts                  # Routes tin tuyển dụng
│   ├── search.route.ts               # Routes tìm kiếm
│   ├── upload.route.ts               # Routes upload file
│   ├── user.route.ts                 # Routes ứng viên
│   └── index.route.ts                # Tổng hợp tất cả routes
│
├── middlewares/                      # Middleware xử lý request
│   └── auth.middleware.ts            # Middleware xác thực token JWT
│
├── helpers/                          # Hàm hỗ trợ
│   └── cloudinary.helper.ts          # Config & helper upload lên Cloudinary
│
├── interfaces/                       # TypeScript interfaces
│   └── request.interface.ts          # Interface cho custom request object
│
└── validates/                        # Validation logic
    ├── company.validate.ts           # Validate dữ liệu công ty
    ├── job.validate.ts               # Validate dữ liệu tin tuyển dụng
    └── user.validate.ts              # Validate dữ liệu ứng viên
```

---

## 4. Cách cài đặt & chạy dự án

### 4.1 Yêu cầu môi trường

- **Node.js**: Phiên bản 16.0 trở lên (khuyến nghị 18+)
- **npm**: Package manager (đi kèm Node.js)
- **MongooDB**: Database server (phiên bản 5.7+)
- **Git**: Để clone repo (nếu cần)

Kiểm tra phiên bản:

```bash
node --version
yarn --version
```

### 4.2 Các bước cài đặt

1. **Clone hoặc vào thư mục dự án**

   ```bash
   cd backend
   ```

2. **Cài đặt dependencies**

   ```bash
   yarn install
   ```

3. **Cấu hình biến môi trường** (xem mục 5)

4. **Chạy development server**

   ```bash
   yarn start
   ```

   Server sẽ chạy tại: `http://localhost:8000`

### 4.3 Build & Deploy

- **Build TypeScript**:

  ```bash
  npm run build
  ```

- **Chạy production**:
  ```bash
  npm start
  ```

---

## 5. Cấu hình môi trường

### 5.1 File .env

Tạo file `.env` trong thư mục `backend/` để cấu hình:

```bash
# Server
PORT=8000
NODE_ENV=development

# Database MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hirehub

# JWT Authentication
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d

# Cloudinary (upload file)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:3000
```

**Lưu ý:**

- Không commit file `.env` lên Git (thêm vào `.gitignore`)
- Mỗi developer cần tạo file `.env` riêng với giá trị của họ
- Production sử dụng environment variables khác

### 7.2 Bảo mật quan trọng

1. **Authentication & Authorization**
   - Mọi route nhạy cảm phải bảo vệ bằng middleware `auth`
   - Sử dụng JWT token để xác thực
   - Kiểm tra quyền user trước khi thực hiện hành động

2. **Validate Input**
   - Luôn validate dữ liệu từ client trước khi xử lý
   - Sử dụng các file trong thư mục `validates/`
   - Kiểm tra type, format, độ dài dữ liệu

3. **Hash Password**
   - Không bao giờ lưu password plaintext
   - Sử dụng bcrypt để hash password
   - Luôn verify password trước khi cho phép đăng nhập

4. **CORS Configuration**
   - Chỉ allow frontend URL trong whitelist
   - Ví dụ: `FRONTEND_URL=http://localhost:3000`

5. **Error Handling**
   - Không return stack trace công khai
   - Log error chi tiết cho debugging
   - Return thông báo lỗi thân thiện cho client


