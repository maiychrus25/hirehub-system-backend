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
exports.deleteCVDel = exports.changeStatusCVPatch = exports.detailCV = exports.listCV = exports.detail = exports.list = exports.deleteJobDel = exports.editJobPatch = exports.editJob = exports.listJob = exports.createJobPost = exports.profilePatch = exports.loginPost = exports.registerPost = void 0;
const account_company_model_1 = __importDefault(require("../models/account-company.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const job_model_1 = __importDefault(require("../models/job.model"));
const city_model_1 = __importDefault(require("../models/city.model"));
const cv_model_1 = __importDefault(require("../models/cv.model"));
const registerPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const existAccount = yield account_company_model_1.default.findOne({
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
    const newAccount = new account_company_model_1.default(req.body);
    yield newAccount.save();
    res.status(200).json({
        code: "success",
        message: "Đăng ký tài khoản thành công!"
    });
});
exports.registerPost = registerPost;
const loginPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const existAccount = yield account_company_model_1.default.findOne({
        email: email
    });
    if (!existAccount) {
        res.status(404).json({
            code: "error",
            message: "Email không tồn tại trong hệ thống!"
        });
        return;
    }
    const isPasswordValid = yield bcryptjs_1.default.compare(password, `${existAccount.password}`);
    if (!isPasswordValid) {
        res.status(400).json({
            code: "error",
            message: "Mật khẩu không đúng!"
        });
        return;
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
        req.body.logo = req.file.path;
    }
    else {
        delete req.body.logo;
    }
    yield account_company_model_1.default.updateOne({
        _id: req.account.id
    }, req.body);
    res.status(200).json({
        code: "success",
        message: "Cập nhật thành công!"
    });
});
exports.profilePatch = profilePatch;
const createJobPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        req.body.companyId = req.account.id;
        req.body.salaryMin = req.body.salaryMin ? parseInt(req.body.salaryMin) : 0;
        req.body.salaryMax = req.body.salaryMax ? parseInt(req.body.salaryMax) : 0;
        req.body.technologies = req.body.technologies ? req.body.technologies.split(", ") : [];
        req.body.images = [];
        // Xử lý mảng images
        if (req.files) {
            for (const file of req.files) {
                req.body.images.push(file.path);
            }
        }
        // Hết Xử lý mảng images
        const newRecord = new job_model_1.default(req.body);
        yield newRecord.save();
        res.status(200).json({
            code: "success",
            message: "Tạo công việc thành công!"
        });
    }
    catch (error) {
        res.status(400).json({
            code: "error",
            message: "Dữ liệu không hợp lệ!"
        });
    }
});
exports.createJobPost = createJobPost;
const listJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const companyId = req.account.id;
        const find = {
            companyId: companyId
        };
        // Phân trang
        const limitItems = 2;
        let page = 1;
        if (req.query.page && parseInt(`${req.query.page}`) > 0) {
            page = parseInt(`${req.query.page}`);
        }
        const skip = (page - 1) * limitItems;
        const totalRecord = yield job_model_1.default.countDocuments(find);
        const totalPage = Math.ceil(totalRecord / limitItems);
        // Hết Phân trang
        const jobs = yield job_model_1.default
            .find(find)
            .sort({
            createdAt: "desc"
        })
            .limit(limitItems)
            .skip(skip);
        const dataFinal = [];
        for (const item of jobs) {
            dataFinal.push({
                id: item.id,
                companyLogo: req.account.logo,
                title: item.title,
                companyName: req.account.companyName,
                salaryMin: item.salaryMin,
                salaryMax: item.salaryMax,
                position: item.position,
                workingForm: item.workingForm,
                companyCity: req.account.companyCity,
                technologies: item.technologies,
            });
        }
        res.status(200).json({
            code: "success",
            message: "Thành công!",
            jobs: dataFinal,
            totalPage: totalPage
        });
    }
    catch (error) {
        res.status(400).json({
            code: "error",
            message: "Dữ liệu không hợp lệ!"
        });
    }
});
exports.listJob = listJob;
const editJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const companyId = req.account.id;
        const jobDetail = yield job_model_1.default.findOne({
            _id: id,
            companyId: companyId
        });
        if (!jobDetail) {
            return res.status(404).json({
                code: "error",
                message: "Không tồn tại!"
            });
        }
        res.status(200).json({
            code: "success",
            message: "Thành công!",
            jobDetail: jobDetail
        });
    }
    catch (error) {
        res.status(400).json({
            code: "error",
            message: "Dữ liệu không hợp lệ!"
        });
    }
});
exports.editJob = editJob;
const editJobPatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const companyId = req.account.id;
        const jobDetail = yield job_model_1.default.findOne({
            _id: id,
            companyId: companyId
        });
        if (!jobDetail) {
            return res.status(404).json({
                code: "error",
                message: "Không tồn tại!"
            });
        }
        req.body.companyId = req.account.id;
        req.body.salaryMin = req.body.salaryMin ? parseInt(req.body.salaryMin) : 0;
        req.body.salaryMax = req.body.salaryMax ? parseInt(req.body.salaryMax) : 0;
        req.body.technologies = req.body.technologies ? req.body.technologies.split(", ") : [];
        req.body.images = [];
        // Xử lý mảng images
        if (req.files) {
            for (const file of req.files) {
                req.body.images.push(file.path);
            }
        }
        // Hết Xử lý mảng images
        yield job_model_1.default.updateOne({
            _id: id,
            companyId: companyId
        }, req.body);
        res.status(200).json({
            code: "success",
            message: "Cập nhật thành công!"
        });
    }
    catch (error) {
        res.status(400).json({
            code: "error",
            message: "Dữ liệu không hợp lệ!"
        });
    }
});
exports.editJobPatch = editJobPatch;
const deleteJobDel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const companyId = req.account.id;
        const jobDetail = yield job_model_1.default.findOne({
            _id: id,
            companyId: companyId
        });
        if (!jobDetail) {
            return res.status(404).json({
                code: "error",
                message: "Không tồn tại!"
            });
        }
        yield job_model_1.default.deleteOne({
            _id: id,
            companyId: companyId
        });
        res.status(204).json({
            code: "success",
            message: "Đã xóa công việc!"
        });
    }
    catch (error) {
        res.status(400).json({
            code: "error",
            message: "Dữ liệu không hợp lệ!"
        });
    }
});
exports.deleteJobDel = deleteJobDel;
const list = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const find = {};
    let limitItems = 12;
    if (req.query.limitItems) {
        limitItems = parseInt(`${req.query.limitItems}`);
    }
    // Phân trang
    let page = 1;
    if (req.query.page && parseInt(`${req.query.page}`) > 0) {
        page = parseInt(`${req.query.page}`);
    }
    const skip = (page - 1) * limitItems;
    const totalRecord = yield job_model_1.default.countDocuments(find);
    const totalPage = Math.ceil(totalRecord / limitItems);
    // Hết Phân trang
    const companyList = yield account_company_model_1.default
        .find(find)
        .limit(limitItems)
        .skip(skip);
    const companyListFinal = [];
    for (const item of companyList) {
        const dataItem = {
            id: item.id,
            logo: item.logo,
            companyName: item.companyName,
            cityName: "",
            totalJob: 0
        };
        // Thành phố
        const city = yield city_model_1.default.findOne({
            _id: item.city
        });
        dataItem.cityName = `${city ? city.name : ""}`;
        // Tổng số việc làm
        const totalJob = yield job_model_1.default.countDocuments({
            companyId: item.id
        });
        dataItem.totalJob = totalJob;
        companyListFinal.push(dataItem);
    }
    res.status(200).json({
        code: "success",
        message: "Thành công",
        companyList: companyListFinal,
        totalPage: totalPage
    });
});
exports.list = list;
const detail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const record = yield account_company_model_1.default.findOne({
            _id: id
        });
        if (!record) {
            res.status(404).json({
                code: "error",
                message: "Không tồn tại!"
            });
            return;
        }
        const companyDetail = {
            id: record.id,
            logo: record.logo,
            companyName: record.companyName,
            address: record.address,
            companyModel: record.companyModel,
            companyEmployees: record.companyEmployees,
            workingTime: record.workingTime,
            workOvertime: record.workOvertime,
            description: record.description,
        };
        // Danh sách công việc của công ty
        const dataFinal = [];
        const jobs = yield job_model_1.default
            .find({
            companyId: record.id
        })
            .sort({
            createdAt: "desc"
        });
        const city = yield city_model_1.default.findOne({
            _id: record.city
        });
        for (const item of jobs) {
            const itemFinal = {
                id: item.id,
                companyLogo: record.logo,
                title: item.title,
                companyName: record.companyName,
                salaryMin: item.salaryMin,
                salaryMax: item.salaryMax,
                position: item.position,
                workingForm: item.workingForm,
                cityName: city === null || city === void 0 ? void 0 : city.name,
                technologies: item.technologies
            };
            dataFinal.push(itemFinal);
        }
        res.status(200).json({
            code: "success",
            message: "Thành công!",
            companyDetail: companyDetail,
            jobs: dataFinal,
        });
    }
    catch (error) {
        res.status(400).json({
            code: "error",
            message: "Dữ liệu không hợp lệ!"
        });
    }
});
exports.detail = detail;
const listCV = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const companyId = req.account.id;
        const jobList = yield job_model_1.default.find({
            companyId: companyId
        });
        const jobListId = jobList.map(item => item.id);
        const cvs = yield cv_model_1.default
            .find({
            jobId: { $in: jobListId }
        })
            .sort({
            createdAt: "desc"
        });
        const dataFinal = [];
        for (const item of cvs) {
            const jobDetail = yield job_model_1.default.findOne({
                _id: item.jobId
            });
            if (jobDetail) {
                const itemFinal = {
                    id: item.id,
                    jobTitle: jobDetail.title,
                    fullName: item.fullName,
                    email: item.email,
                    phone: item.phone,
                    jobSalaryMin: jobDetail.salaryMin,
                    jobSalaryMax: jobDetail.salaryMax,
                    jobPosition: jobDetail.position,
                    jobWorkingForm: jobDetail.workingForm,
                    viewed: item.viewed,
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
const detailCV = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cvId = req.params.id;
        const companyId = req.account.id;
        const infoCV = yield cv_model_1.default.findOne({
            _id: cvId
        });
        if (!infoCV) {
            return res.status(404).json({
                code: "error",
                message: "Bản ghi không tồn tại!"
            });
        }
        const infoJob = yield job_model_1.default.findOne({
            _id: infoCV.jobId,
            companyId: companyId
        });
        if (!infoJob) {
            return res.status(404).json({
                code: "error",
                message: "Bản ghi không tồn tại!"
            });
        }
        const dataFinalCV = {
            fullName: infoCV.fullName,
            email: infoCV.email,
            phone: infoCV.phone,
            fileCV: infoCV.fileCV,
        };
        const dataFinalJob = {
            id: infoJob.id,
            title: infoJob.title,
            salaryMin: infoJob.salaryMin,
            salaryMax: infoJob.salaryMax,
            position: infoJob.position,
            workingForm: infoJob.workingForm,
            technologies: infoJob.technologies,
        };
        yield cv_model_1.default.updateOne({
            _id: cvId
        }, {
            viewed: true
        });
        res.status(200).json({
            code: "success",
            message: "Thành công!",
            cvDetail: dataFinalCV,
            jobDetail: dataFinalJob
        });
    }
    catch (error) {
        res.status(400).json({
            code: "error",
            message: "Dữ liệu không hợp lệ!"
        });
    }
});
exports.detailCV = detailCV;
const changeStatusCVPatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cvId = req.params.id;
        const companyId = req.account.id;
        const statusCV = req.body.status;
        const infoCV = yield cv_model_1.default.findOne({
            _id: cvId
        });
        if (!infoCV) {
            return res.status(404).json({
                code: "error",
                message: "Không tồn tại!"
            });
        }
        const infoJob = yield job_model_1.default.findOne({
            _id: infoCV.jobId,
            companyId: companyId
        });
        if (!infoJob) {
            return res.status(404).json({
                code: "error",
                message: "Không tồn tại!"
            });
        }
        yield cv_model_1.default.updateOne({
            _id: cvId
        }, {
            status: statusCV
        });
        res.status(200).json({
            code: "success",
            message: "Đã cập nhật trạng thái!"
        });
    }
    catch (error) {
        res.status(400).json({
            code: "error",
            message: "Dữ liệu không hợp lệ!"
        });
    }
});
exports.changeStatusCVPatch = changeStatusCVPatch;
const deleteCVDel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cvId = req.params.id;
        const companyId = req.account.id;
        const infoCV = yield cv_model_1.default.findOne({
            _id: cvId
        });
        if (!infoCV) {
            return res.status(404).json({
                code: "error",
                message: "Không tồn tại!"
            });
        }
        const infoJob = yield job_model_1.default.findOne({
            _id: infoCV.jobId,
            companyId: companyId
        });
        if (!infoJob) {
            return res.status(404).json({
                code: "error",
                message: "Không tồn tại!"
            });
        }
        yield cv_model_1.default.deleteOne({
            _id: cvId
        });
        res.status(204).json({
            code: "success",
            message: "Đã xóa CV!"
        });
    }
    catch (error) {
        res.status(400).json({
            code: "error",
            message: "Dữ liệu không hợp lệ!"
        });
    }
});
exports.deleteCVDel = deleteCVDel;
