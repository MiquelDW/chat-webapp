import { Server, Socket } from "socket.io";
import db from "../config/db";
import { Message } from "@prisma/client";

export const messageHandler = (io: Server, socket: Socket) => {
  // listens for incoming "joinRoom" events to let a user join a given room where chat messages will be broadcasted to in real-time
  socket.on(`joinRoom`, (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });

  // listens for incoming "chat-message" events and processes the received message asynchronously
  socket.on(`chat-message`, async (room, content) => {
    console.log(`Received message: ${content} (${socket.id})`);
    const message: Message = await db.message.create({
      data: {
        content,
        senderSocketId: socket.id,
      },
    });
    // broadcast the added message to the users that are inside the same given room (conversation)
    io.to(room).emit("roomMessage", message);
  });
};
