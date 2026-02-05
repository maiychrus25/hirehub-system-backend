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
exports.applyPost = exports.detail = void 0;
const job_model_1 = __importDefault(require("../models/job.model"));
const account_company_model_1 = __importDefault(require("../models/account-company.model"));
const cv_model_1 = __importDefault(require("../models/cv.model"));
const detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const record = yield job_model_1.default.findOne({
            _id: id
        });
        if (!record) {
            return res.status(404).json({
                code: "error",
                message: "Không tồn tài bản ghi!",
                data: null
            });
        }
        const companyInfo = yield account_company_model_1.default.findOne({
            _id: record.companyId
        });
        if (!companyInfo) {
            return res.status(404).json({
                code: "error",
                message: "Không tồn tài bản ghi!",
                data: null
            });
        }
        const jobDetail = {
            id: record.id,
            title: record.title,
            companyName: companyInfo.companyName,
            salaryMin: record.salaryMin,
            salaryMax: record.salaryMax,
            images: record.images,
            position: record.position,
            workingForm: record.workingForm,
            companyAddress: companyInfo.address,
            technologies: record.technologies,
            description: record.description,
            companyLogo: companyInfo.logo,
            companyId: record.companyId,
            companyModel: companyInfo.companyModel,
            companyEmployees: companyInfo.companyEmployees,
            workingTime: companyInfo.workingTime,
            workOvertime: companyInfo.workOvertime
        };
        return res.status(200).json({
            code: 'success',
            message: 'Lấy chi tiết công việc thành công!',
            jobDetail: jobDetail
        });
    }
    catch (error) {
        res.status(500).json({
            code: "error",
            message: "Có lỗi gì đó đã xảy ra. Vui lòng thử lại!",
            data: null
        });
    }
});
exports.detail = detail;
const applyPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        req.body.fileCV = req.file ? req.file.path : "";
        const newRecord = new cv_model_1.default(req.body);
        yield newRecord.save();
        res.status(200).json({
            code: "success",
            message: "Gửi CV thành công!",
            data: null
        });
    }
    catch (error) {
        res.status(400).json({
            code: "success",
            message: "Dữ liệu không hợp lệ!",
            data: null
        });
    }
});
exports.applyPost = applyPost;
