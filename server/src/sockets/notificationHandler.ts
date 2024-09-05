import { Server, Socket } from "socket.io";
import db from "../config/db";
import { Request } from "@prisma/client";

export const notificationHandler = (io: Server, socket: Socket) => {
  // listens for incoming "friend-request" events and processes the received notification asynchronously
  socket.on(
    `friend-request`,
    async (currentUserId: string, receiverUserId: string) => {
      console.log(
        `currentUserId: ${currentUserId} & receiverUserId: ${receiverUserId}`
      );

      // add a request to db all the checks
      await db.request.create({
        data: { senderId: currentUserId, receiverId: receiverUserId },
      });

      // broadcast the added message to the users that are inside the same given room (conversation)
      // io.to(room).emit("roomMessage", message);
    }
  );
};
