import { Request, Response } from "express";

export const imagePost = async (req: Request, res: Response) => {
  res.status(200).json({
    location: req?.file?.path
  });
}
