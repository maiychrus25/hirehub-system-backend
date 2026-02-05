"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const schema = new mongoose_1.default.Schema({
    companyName: String,
    email: String,
    password: String,
    address: String,
    companyModel: String,
    companyEmployees: String,
    workingTime: String,
    workOvertime: String,
    phone: String,
    description: String,
    logo: String,
    city: String,
}, {
    timestamps: true,
});
const AccountCompany = mongoose_1.default.model('AccountCompany', schema, "accounts-company");
exports.default = AccountCompany;
