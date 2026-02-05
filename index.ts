import express from "express";
import dotenv from "dotenv";

// Load biến môi trường từ .env
dotenv.config();

import cors from "cors";
import routes from "./routes/index.route";
import { connectDB } from "./config/database.config";
import cookieParser from "cookie-parser";

const app = express();
const port = 4000;

// Kết nối CSDL
connectDB();

// Cấu hình CORS
app.use(cors({
  origin: "http://localhost:3000", // Phải chỉ định tên miền cụ thể
  credentials: true, // Cho phép gửi cookie
}));

// Cho phép gửi dữ liệu lên dạng json
app.use(express.json());

// Cấu hình lấy cookie
app.use(cookieParser());

// Thiết lập đường dẫn
app.use("/api/v1", routes);

app.listen(port, () => {
  console.log(`Website đang chạy trên cổng ${port}`);
});
