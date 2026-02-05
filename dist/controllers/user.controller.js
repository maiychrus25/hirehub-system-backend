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
exports.listCV = exports.profilePatch = exports.loginPost = exports.registerPost = void 0;
const account_user_model_1 = __importDefault(require("../models/account-user.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cv_model_1 = __importDefault(require("../models/cv.model"));
const job_model_1 = __importDefault(require("../models/job.model"));
const account_company_model_1 = __importDefault(require("../models/account-company.model"));
const registerPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const existAccount = yield account_user_model_1.default.findOne({
        email: req.body.email
    });
    if (existAccount) {
        return res.status(400).json({
            code: "error",
            message: "Email đã tồn tại trong hệ thống!"
        });
    }
    // Mã hóa mật khẩu
    const salt = yield bcryptjs_1.default.genSalt(10);
    req.body.password = yield bcryptjs_1.default.hash(req.body.password, salt);
    const newAccount = new account_user_model_1.default(req.body);
    yield newAccount.save();
    res.status(200).json({
        code: "success",
        message: "Đăng ký tài khoản thành công!"
    });
});
exports.registerPost = registerPost;
const loginPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const existAccount = yield account_user_model_1.default.findOne({
        email: email
    });
    if (!existAccount) {
        return res.status(400).json({
            code: "error",
            message: "Email không tồn tại trong hệ thống!"
        });
    }
    const isPasswordValid = yield bcryptjs_1.default.compare(password, `${existAccount.password}`);
    if (!isPasswordValid) {
        return res.status(400).json({
            code: "error",
            message: "Mật khẩu không đúng!"
        });
    }
    const token = jsonwebtoken_1.default.sign({
        id: existAccount.id,
        email: existAccount.email
    }, `${process.env.JWT_SECRET}`, {
        expiresIn: "1d"
    });
    res.cookie("token", token, {
        maxAge: 24 * 60 * 60 * 1000, // 1 ngày
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // https để true, http để fasle
        sameSite: "lax" // Cho phép gửi cookie giữa các tên miền
    });
    res.status(200).json({
        code: "success",
        message: "Đăng nhập thành công!"
    });
});
exports.loginPost = loginPost;
const profilePatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.file) {
        req.body.avatar = req.file.path;
    }
    else {
        delete req.body.avatar;
    }
    yield account_user_model_1.default.updateOne({
        _id: req.account.id
    }, req.body);
    res.status(200).json({
        code: "success",
        message: "Cập nhật thành công!"
    });
});
exports.profilePatch = profilePatch;
const listCV = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.account.email;
        const cvs = yield cv_model_1.default
            .find({
            email: email
        })
            .sort({
            createdAt: "desc"
        });
        const dataFinal = [];
        for (const item of cvs) {
            const jobDetail = yield job_model_1.default.findOne({
                _id: item.jobId
            });
            const companyDetail = yield account_company_model_1.default.findOne({
                _id: jobDetail === null || jobDetail === void 0 ? void 0 : jobDetail.companyId
            });
            if (jobDetail && companyDetail) {
                const itemFinal = {
                    id: item.id,
                    jobTitle: jobDetail.title,
                    companyName: companyDetail.companyName,
                    jobSalaryMin: jobDetail.salaryMin,
                    jobSalaryMax: jobDetail.salaryMax,
                    jobPosition: jobDetail.position,
                    jobWorkingForm: jobDetail.workingForm,
                    status: item.status,
                };
                dataFinal.push(itemFinal);
            }
        }
        res.status(200).json({
            code: "success",
            message: "Thành công!",
            cvs: dataFinal
        });
    }
    catch (error) {
        res.status(400).json({
            code: "error",
            message: "Dữ liệu không hợp lệ!"
        });
    }
});
exports.listCV = listCV;
