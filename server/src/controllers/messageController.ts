import { Request, Response } from "express";
import db from "../config/db";

// define GET request handler to get all messages ..of given convo.. (/messages)
export const getMessages = async (_: Request, res: Response) => {
  const messages = await db.message.findMany();
  res.json(messages);
};
