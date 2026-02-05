"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load biến môi trường từ .env
dotenv_1.default.config();
const cors_1 = __importDefault(require("cors"));
const index_route_js_1 = __importDefault(require("./routes/index.route.js"));
const database_config_1 = require("./config/database.config");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
// Kết nối CSDL
(0, database_config_1.connectDB)();
// Cấu hình CORS
app.use((0, cors_1.default)({
    origin: "http://localhost:3000", // Phải chỉ định tên miền cụ thể
    credentials: true, // Cho phép gửi cookie
}));
// Cho phép gửi dữ liệu lên dạng json
app.use(express_1.default.json());
// Cấu hình lấy cookie
app.use((0, cookie_parser_1.default)());
// Thiết lập đường dẫn
app.use("/api/v1", index_route_js_1.default);
app.listen(port, () => {
    console.log(`Website đang chạy trên cổng ${port}`);
});
