import { Request, Response } from "express";
import db from "../config/db";

// define GET request handler to get all received requests of current user (/requests)
export const getRequests = async (req: Request, res: Response) => {
  // access dynamic parameter
  const id = req.params.id;
  // retrieve all received friend requests of current user
  const requests = await db.request.findMany({
    where: { receiverId: id },
    orderBy: { createdAt: "desc" },
  });

  // create a Promise that is resolved with an array of results when all of the provided Promises resolve, or rejected when any Promise is rejected
  // all given async functions to the Promise.all() run in parallel
  // creates an array of senders that have sent a friend request to the current user
  // each object inside the array holds information about the sender and the sent friend request
  const requestsWithSender = await Promise.all(
    requests.map(async (request) => {
      // find the sender of each friend request to the current user
      const sender = await db.user.findUnique({
        where: { id: request.senderId },
      });

      // throw error if user that sended friend request doesn't exist
      if (!sender) throw new Error("Friend Request sender could not be found");

      return { sender, request };
    })
  );

  res.json(requestsWithSender);
};

// define GET request handler get count of all requests of current user (/requestsCount)
export const getRequestsCount = async (req: Request, res: Response) => {
  // access dynamic parameter
  const id = req.params.id;
  // count the number of received requests of current user
  const requestsCount = await db.request.count({
    where: { receiverId: id },
    orderBy: { createdAt: "desc" },
  });
  res.json(requestsCount);
};
