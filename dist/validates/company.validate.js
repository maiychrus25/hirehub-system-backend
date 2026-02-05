"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginPost = exports.registerPost = void 0;
const joi_1 = __importDefault(require("joi"));
const registerPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const schema = joi_1.default.object({
        companyName: joi_1.default.string()
            .max(200)
            .required()
            .messages({
            "string.empty": "Vui lòng nhập tên công ty!",
            "string.max": "Tên công ty không được vượt quá 200 ký tự!",
        }),
        email: joi_1.default.string()
            .email()
            .required()
            .messages({
            "string.empty": "Vui lòng nhập email!",
            "string.email": "Email không đúng định dạng!",
        }),
        password: joi_1.default.string()
            .min(8)
            .custom((value, helpers) => {
            if (!/[A-Z]/.test(value)) {
                return helpers.error('password.uppercase');
            }
            if (!/[a-z]/.test(value)) {
                return helpers.error('password.lowercase');
            }
            if (!/\d/.test(value)) {
                return helpers.error('password.number');
            }
            if (!/[@$!%*?&]/.test(value)) {
                return helpers.error('password.special');
            }
            return value;
        })
            .required()
            .messages({
            "string.empty": "Vui lòng nhập mật khẩu!",
            "string.min": "Mật khẩu phải chứa ít nhất 8 ký tự!",
            "password.uppercase": "Mật khẩu phải chứa ít nhất một chữ cái in hoa!",
            "password.lowercase": "Mật khẩu phải chứa ít nhất một chữ cái thường!",
            "password.number": "Mật khẩu phải chứa ít nhất một chữ số!",
            "password.special": "Mật khẩu phải chứa ít nhất một ký tự đặc biệt!",
        }),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        const errorMessage = error.details[0].message;
        res.json({
            code: "error",
            message: errorMessage
        });
        return;
    }
    next();
});
exports.registerPost = registerPost;
const loginPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const schema = joi_1.default.object({
        email: joi_1.default.string()
            .email()
            .required()
            .messages({
            "string.empty": "Vui lòng nhập email!",
            "string.email": "Email không đúng định dạng!",
        }),
        password: joi_1.default.string()
            .required()
            .messages({
            "string.empty": "Vui lòng nhập mật khẩu!",
        }),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        const errorMessage = error.details[0].message;
        res.json({
            code: "error",
            message: errorMessage
        });
        return;
    }
    next();
});
exports.loginPost = loginPost;
