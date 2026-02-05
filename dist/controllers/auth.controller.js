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
exports.logout = exports.check = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const account_user_model_1 = __importDefault(require("../models/account-user.model"));
const account_company_model_1 = __importDefault(require("../models/account-company.model"));
const check = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies.token;
        if (!token) {
            res.status(400).json({
                code: "error",
                message: "Token không tồn tại!"
            });
            return;
        }
        var decoded = jsonwebtoken_1.default.verify(token, `${process.env.JWT_SECRET}`);
        const { id, email } = decoded;
        // Tìm user
        const existAccountUser = yield account_user_model_1.default.findOne({
            _id: id,
            email: email,
        });
        if (existAccountUser) {
            const infoUser = {
                id: existAccountUser.id,
                fullName: existAccountUser.fullName,
                email: existAccountUser.email,
                phone: existAccountUser.phone,
                avatar: existAccountUser.avatar,
            };
            res.status(200).json({
                code: "success",
                message: "Token hợp lệ!",
                infoUser: infoUser
            });
            return;
        }
        // Tìm company
        const existAccountCompany = yield account_company_model_1.default.findOne({
            _id: id,
            email: email,
        });
        if (existAccountCompany) {
            const infoCompany = {
                id: existAccountCompany.id,
                companyName: existAccountCompany.companyName,
                email: existAccountCompany.email,
                address: existAccountCompany.address,
                companyModel: existAccountCompany.companyModel,
                companyEmployees: existAccountCompany.companyEmployees,
                workingTime: existAccountCompany.workingTime,
                workOvertime: existAccountCompany.workOvertime,
                phone: existAccountCompany.phone,
                description: existAccountCompany.description,
                logo: existAccountCompany.logo,
                city: existAccountCompany.city,
            };
            res.status(200).json({
                code: "success",
                message: "Token hợp lệ!",
                infoCompany: infoCompany
            });
            return;
        }
        if (!existAccountUser && !existAccountCompany) {
            res.clearCookie("token");
            res.status(400).json({
                code: "error",
                message: "Token không hợp lệ!"
            });
        }
    }
    catch (error) {
        res.clearCookie("token");
        res.status(400).json({
            code: "error",
            message: "Token không hợp lệ!"
        });
    }
});
exports.check = check;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie("token");
    res.status(200).json({
        code: "success",
        message: "Đã đăng xuất!"
    });
});
exports.logout = logout;
