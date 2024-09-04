import { Request, Response } from "express";
import db from "../config/db";

// define GET requests handler for the /messages endpoint
export const getMessages = async (_: Request, res: Response) => {
  const messages = await db.message.findMany();
  res.json(messages);
};
