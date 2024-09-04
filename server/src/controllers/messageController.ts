import { Request, Response } from "express";
import db from "../config/db";

// define GET request handler for the /api/messages endpoint
export const getMessages = async (_: Request, res: Response) => {
  const messages = await db.message.findMany();
  res.json(messages);
};
