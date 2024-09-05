import { Request, Response } from "express";
import db from "../config/db";

// define GET request handler to get all messages of given convo (/messages/:id)
export const getMessages = async (req: Request, res: Response) => {
  // access dynamic parameter
  const id = req.params.id;
  // const messages = await db.message.findMany({ where: { conversationId: id } });
  const messages = await db.message.findMany();
  res.json(messages);
};
