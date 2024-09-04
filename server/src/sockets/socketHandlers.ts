import { Server, Socket } from "socket.io";
import db from "../config/db";

export const socketHandlers = (io: Server) => {
  // listen for new socket (TCP) connections and disconnections
  // this is basically like an incoming HTTP request, but for WebSockets
  io.on(`connection`, async (socket: Socket) => {
    // logic to handle when a WebSockets client connects to the server
    console.log(`User connected: ${socket.id}`);

    socket.on(`disconnect`, () => {
      console.log(`User disconnected: ${socket.id}`);
    });

    // listens for incoming "chat-message" events and processes the received message asynchronously
    socket.on(`chat-message`, async (text) => {
      console.log(`Received message: ${text} (${socket.id})`);
      await db.message.create({
        data: {
          text,
          senderSocketId: socket.id,
        },
      });
    });

    // listens for incoming "send-notification" events and processes the received notification asynchronously
    socket.on("send-notification", (notification: string) => {
      console.log(`Notification from ${socket.id}: ${notification}`);
    });
  });
};
