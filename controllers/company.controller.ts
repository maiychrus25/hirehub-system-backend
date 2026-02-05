import { Request, Response } from "express";
import AccountCompany from "../models/account-company.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AccountRequest } from "../interfaces/request.interface";
import Job from "../models/job.model";
import City from "../models/city.model";
import CV from "../models/cv.model";

export const registerPost = async (req: Request, res: Response) => {
  const existAccount = await AccountCompany.findOne({
    email: req.body.email
  });

  if(existAccount) {
    return res.status(400).json({
      code: "error",
      message: "Email đã tồn tại trong hệ thống!"
    })
  }

  // Mã hóa mật khẩu
  const salt = await bcrypt.genSalt(10);
  req.body.password = await bcrypt.hash(req.body.password, salt);

  const newAccount = new AccountCompany(req.body);
  await newAccount.save();

  res.status(200).json({
    code: "success",
    message: "Đăng ký tài khoản thành công!"
  })
}

export const loginPost = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  const existAccount = await AccountCompany.findOne({
    email: email
  });

  if(!existAccount) {
    res.status(404).json({
      code: "error",
      message: "Email không tồn tại trong hệ thống!"
    })
    return;
  }

  const isPasswordValid = await bcrypt.compare(password, `${existAccount.password}`);

  if(!isPasswordValid) {
    res.status(400).json({
      code: "error",
      message: "Mật khẩu không đúng!"
    })
    return;
  }

  const token = jwt.sign(
    {
      id: existAccount.id,
      email: existAccount.email
    },
    `${process.env.JWT_SECRET}`,
    {
      expiresIn: "1d"
    }
  );

  res.cookie("token", token, {
    maxAge: 24 * 60 * 60 * 1000, // 1 ngày
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // https để true, http để fasle
    sameSite: "lax" // Cho phép gửi cookie giữa các tên miền
  });

  res.status(200).json({
    code: "success",
    message: "Đăng nhập thành công!"
  })
}

export const profilePatch = async (req: AccountRequest, res: Response) => {
  if(req.file) {
    req.body.logo = req.file.path;
  } else {
    delete req.body.logo;
  }

  await AccountCompany.updateOne({
    _id: req.account.id
  }, req.body);

  res.status(200).json({
    code: "success",
    message: "Cập nhật thành công!"
  })
}

export const createJobPost = async (req: AccountRequest, res: Response) => {
  try {
    req.body.companyId = req.account.id;
    req.body.salaryMin = req.body.salaryMin ? parseInt(req.body.salaryMin) : 0;
    req.body.salaryMax = req.body.salaryMax ? parseInt(req.body.salaryMax) : 0;
    req.body.technologies = req.body.technologies ? req.body.technologies.split(", ") : [];
    req.body.images = [];

    // Xử lý mảng images
    if(req.files) {
      for (const file of req.files as any[]) {
        req.body.images.push(file.path);
      }
    }
    // Hết Xử lý mảng images

    const newRecord = new Job(req.body);
    await newRecord.save();

    res.status(200).json({
      code: "success",
      message: "Tạo công việc thành công!"
    })
  } catch (error) {
    res.status(400).json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    })
  }
}

export const listJob = async (req: AccountRequest, res: Response) => {
  try {
    const companyId = req.account.id;

    const find = {
      companyId: companyId
    }

    // Phân trang
    const limitItems = 2;
    let page = 1;
    if(req.query.page && parseInt(`${req.query.page}`) > 0) {
      page = parseInt(`${req.query.page}`);
    }
    const skip = (page - 1) * limitItems;
    const totalRecord = await Job.countDocuments(find);
    const totalPage = Math.ceil(totalRecord/limitItems);
    // Hết Phân trang

    const jobs = await Job
      .find(find)
      .sort({
        createdAt: "desc"
      })
      .limit(limitItems)
      .skip(skip)

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
    })
  } catch (error) {
    res.status(400).json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    })
  }
}

export const editJob = async (req: AccountRequest, res: Response) => {
  try {
    const id = req.params.id;
    const companyId = req.account.id;

    const jobDetail = await Job.findOne({
      _id: id,
      companyId: companyId
    })

    if(!jobDetail) {
      return res.status(404).json({
        code: "error",
        message: "Không tồn tại!"
      })
    }

    res.status(200).json({
      code: "success",
      message: "Thành công!",
      jobDetail: jobDetail
    })
  } catch (error) {
    res.status(400).json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    })
  }
}

export const editJobPatch = async (req: AccountRequest, res: Response) => {
  try {
    const id = req.params.id;
    const companyId = req.account.id;

    const jobDetail = await Job.findOne({
      _id: id,
      companyId: companyId
    })

    if(!jobDetail) {
      return res.status(404).json({
        code: "error",
        message: "Không tồn tại!"
      })
    }

    req.body.companyId = req.account.id;
    req.body.salaryMin = req.body.salaryMin ? parseInt(req.body.salaryMin) : 0;
    req.body.salaryMax = req.body.salaryMax ? parseInt(req.body.salaryMax) : 0;
    req.body.technologies = req.body.technologies ? req.body.technologies.split(", ") : [];
    req.body.images = [];

    // Xử lý mảng images
    if(req.files) {
      for (const file of req.files as any[]) {
        req.body.images.push(file.path);
      }
    }
    // Hết Xử lý mảng images

    await Job.updateOne({
      _id: id,
      companyId: companyId
    }, req.body);

    res.status(200).json({
      code: "success",
      message: "Cập nhật thành công!"
    })
  } catch (error) {
    res.status(400).json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    })
  }
}

export const deleteJobDel = async (req: AccountRequest, res: Response) => {
  try {
    const id = req.params.id;
    const companyId = req.account.id;

    const jobDetail = await Job.findOne({
      _id: id,
      companyId: companyId
    })

    if(!jobDetail) {
      return res.status(404).json({
        code: "error",
        message: "Không tồn tại!"
      })
    }

    await Job.deleteOne({
      _id: id,
      companyId: companyId
    })

    res.status(204).json({
      code: "success",
      message: "Đã xóa công việc!"
    })
  } catch (error) {
    res.status(400).json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    })
  }
}

export const list = async (req: Request, res: Response) => {
  const find = {};

  let limitItems = 12;
  if(req.query.limitItems) {
    limitItems = parseInt(`${req.query.limitItems}`);
  }

  // Phân trang
  let page = 1;
  if(req.query.page && parseInt(`${req.query.page}`) > 0) {
    page = parseInt(`${req.query.page}`);
  }
  const skip = (page - 1) * limitItems;
  const totalRecord = await Job.countDocuments(find);
  const totalPage = Math.ceil(totalRecord/limitItems);
  // Hết Phân trang

  const companyList = await AccountCompany
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
    const city = await City.findOne({
      _id: item.city
    })
    dataItem.cityName = `${city ? city.name : ""}`;

    // Tổng số việc làm
    const totalJob = await Job.countDocuments({
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
  })
}

export const detail = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const record = await AccountCompany.findOne({
      _id: id
    })

    if(!record) {
      res.status(404).json({
        code: "error",
        message: "Không tồn tại!"
      })
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

    const jobs = await Job
      .find({
        companyId: record.id
      })
      .sort({
        createdAt: "desc"
      });

    const city = await City.findOne({
      _id: record.city
    })

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
        cityName: city?.name,
        technologies: item.technologies
      };

      dataFinal.push(itemFinal);
    }

    res.status(200).json({
      code: "success",
      message: "Thành công!",
      companyDetail: companyDetail,
      jobs: dataFinal,
    })
  } catch (error) {
    res.status(400).json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    })
  }
}

export const listCV = async (req: AccountRequest, res: Response) => {
  try {
    const companyId = req.account.id;

    const jobList = await Job.find({
      companyId: companyId
    })
    const jobListId = jobList.map(item => item.id);

    const cvs = await CV
      .find({
        jobId: { $in: jobListId }
      })
      .sort({
        createdAt: "desc"
      });

    const dataFinal = [];

    for (const item of cvs) {
      const jobDetail = await Job.findOne({
        _id: item.jobId
      })

      if(jobDetail) {
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
    })
  } catch (error) {
    res.status(400).json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    })
  }
}

export const detailCV = async (req: AccountRequest, res: Response) => {  
  try {
    const cvId = req.params.id;
    const companyId = req.account.id;

    const infoCV = await CV.findOne({
      _id: cvId
    })

    if(!infoCV) {
      return res.status(404).json({
        code: "error",
        message: "Bản ghi không tồn tại!"
      })
    }

    const infoJob = await Job.findOne({
      _id: infoCV.jobId,
      companyId: companyId
    });

    if(!infoJob) {
      return res.status(404).json({
        code: "error",
        message: "Bản ghi không tồn tại!"
      })
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

    await CV.updateOne({
      _id: cvId
    }, {
      viewed: true
    })

    res.status(200).json({
      code: "success",
      message: "Thành công!",
      cvDetail: dataFinalCV,
      jobDetail: dataFinalJob
    })
  } catch (error) {
    res.status(400).json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    })
  }
}

export const changeStatusCVPatch = async (req: AccountRequest, res: Response) => {  
  try {
    const cvId = req.params.id;
    const companyId = req.account.id;
    const statusCV = req.body.status;

    const infoCV = await CV.findOne({
      _id: cvId
    })

    if(!infoCV) {
      return res.status(404).json({
        code: "error",
        message: "Không tồn tại!"
      })
    }

    const infoJob = await Job.findOne({
      _id: infoCV.jobId,
      companyId: companyId
    });

    if(!infoJob) {
      return res.status(404).json({
        code: "error",
        message: "Không tồn tại!"
      })
    }

    await CV.updateOne({
      _id: cvId
    }, {
      status: statusCV
    })

    res.status(200).json({
      code: "success",
      message: "Đã cập nhật trạng thái!"
    })
  } catch (error) {
    res.status(400).json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    })
  }
}

export const deleteCVDel = async (req: AccountRequest, res: Response) => {  
  try {
    const cvId = req.params.id;
    const companyId = req.account.id;

    const infoCV = await CV.findOne({
      _id: cvId
    })

    if(!infoCV) {
      return res.status(404).json({
        code: "error",
        message: "Không tồn tại!"
      })
    }

    const infoJob = await Job.findOne({
      _id: infoCV.jobId,
      companyId: companyId
    });

    if(!infoJob) {
       return res.status(404).json({
        code: "error",
        message: "Không tồn tại!"
      })
    }

    await CV.deleteOne({
      _id: cvId
    })

    res.status(204).json({
      code: "success",
      message: "Đã xóa CV!"
    })
  } catch (error) {
    res.status(400).json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    })
  }
}
