import { Server, Socket } from "socket.io";
import db from "../config/db";

export const notificationHandler = (io: Server, socket: Socket) => {
  // listens for incoming "friend-request" events and processes the received notification asynchronously
  socket.on(`friend-request`, async (currentUserId, receiverUserId) => {
    console.log(
      `received currentUserId: ${currentUserId} & receiverUserId: ${receiverUserId}`
    );

    // add a request to db all the checks
    await db.request.create({
      data: { senderId: currentUserId, receiverId: receiverUserId },
    });
  });
};
