import { Request, Response } from "express";
import Job from "../models/job.model";
import AccountCompany from "../models/account-company.model";
import CV from "../models/cv.model";

export const detail = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const record = await Job.findOne({
      _id: id
    })

    if(!record) {
      return res.status(404).json({
        code: "error",
        message: "Không tồn tài bản ghi!",
        data: null
      })
    }

    const companyInfo = await AccountCompany.findOne({
      _id: record.companyId
    })

    if(!companyInfo) {
      return res.status(404).json({
        code: "error",
        message: "Không tồn tài bản ghi!",
        data: null
      })
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
  } catch (error) {
    res.status(500).json({
      code: "error",
      message: "Có lỗi gì đó đã xảy ra. Vui lòng thử lại!",
      data: null
    })
  }
}

export const applyPost = async (req: Request, res: Response) => {
  try {
    req.body.fileCV = req.file ? req.file.path : "";

    const newRecord = new CV(req.body);
    await newRecord.save();

    res.status(200).json({
      code: "success",
      message: "Gửi CV thành công!",
      data: null
    });
  } catch (error) {
    res.status(400).json({
      code: "success",
      message: "Dữ liệu không hợp lệ!",
      data: null
    });
   }
}
