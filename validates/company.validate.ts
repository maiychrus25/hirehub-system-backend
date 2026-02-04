import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';

export const registerPost = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  const schema = Joi.object({
    companyName: Joi.string()
      .max(200)
      .required()
      .messages({
        "string.empty": "Vui lòng nhập tên công ty!",
        "string.max": "Tên công ty không được vượt quá 200 ký tự!",
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        "string.empty": "Vui lòng nhập email!",
        "string.email": "Email không đúng định dạng!",
      }),
    password: Joi.string()
      .min(8)
      .custom((value, helpers) => {
        if(!/[A-Z]/.test(value)) {
          return helpers.error('password.uppercase');
        }

        if(!/[a-z]/.test(value)) {
          return helpers.error('password.lowercase');
        }

        if(!/\d/.test(value)) {
          return helpers.error('password.number');
        }

        if(!/[@$!%*?&]/.test(value)) {
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
  if(error) {
    const errorMessage = error.details[0].message;

    res.json({
      code: "error",
      message: errorMessage
    })
    return;
  }

  next();
}

export const loginPost = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        "string.empty": "Vui lòng nhập email!",
        "string.email": "Email không đúng định dạng!",
      }),
    password: Joi.string()
      .required()
      .messages({
        "string.empty": "Vui lòng nhập mật khẩu!",
      }),
  });

  const { error } = schema.validate(req.body);
  if(error) {
    const errorMessage = error.details[0].message;

    res.json({
      code: "error",
      message: errorMessage
    })
    return;
  }

  next();
}
