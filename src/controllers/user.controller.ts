import { Request, Response } from "express";
import AccountUser from "../models/account-user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AccountRequest } from "../interfaces/request.interface";
import CV from "../models/cv.model";
import Job from "../models/job.model";
import AccountCompany from "../models/account-company.model";

export const registerPost = async (req: Request, res: Response) => {
  const existAccount = await AccountUser.findOne({
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

  const newAccount = new AccountUser(req.body);
  await newAccount.save();

  res.status(200).json({
    code: "success",
    message: "Đăng ký tài khoản thành công!"
  })
}

export const loginPost = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  const existAccount = await AccountUser.findOne({
    email: email
  });

  if(!existAccount) {
    return res.status(400).json({
      code: "error",
      message: "Email không tồn tại trong hệ thống!"
    })
  }

  const isPasswordValid = await bcrypt.compare(password, `${existAccount.password}`);

  if(!isPasswordValid) {
    return res.status(400).json({
      code: "error",
      message: "Mật khẩu không đúng!"
    })
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
    sameSite: "none" // Cho phép gửi cookie giữa các tên miền
  });

  res.status(200).json({
    code: "success",
    message: "Đăng nhập thành công!"
  })
}

export const profilePatch = async (req: AccountRequest, res: Response) => {
  if(req.file) {
    req.body.avatar = req.file.path;
  } else {
    delete req.body.avatar;
  }

  await AccountUser.updateOne({
    _id: req.account.id
  }, req.body);

  res.status(200).json({
    code: "success",
    message: "Cập nhật thành công!"
  })
}

export const listCV = async (req: AccountRequest, res: Response) => {
  try {
    const email = req.account.email;

    const cvs = await CV
      .find({
        email: email
      })
      .sort({
        createdAt: "desc"
      });

    const dataFinal = [];

    for (const item of cvs) {
      const jobDetail = await Job.findOne({
        _id: item.jobId
      })

      const companyDetail = await AccountCompany.findOne({
        _id: jobDetail?.companyId
      })

      if(jobDetail && companyDetail) {
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
    })
  } catch (error) {
    res.status(400).json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    })
  }
}
