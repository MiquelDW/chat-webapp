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
    socket.on(`chat-message`, async (room, content) => {
      console.log(`Received message: ${content} (${socket.id})`);
      await db.message.create({
        data: {
          content,
          senderSocketId: socket.id,
        },
      });
    });

    // listens for incoming "joinRoom" events to let a user join a given room where chat messages will be broadcasted to in real-time
    // socket.on(`joinRoom`, (room) => {
    //   socket.join(room);
    //   console.log(`Socket ${socket.id} joined room ${room}`);
    // });

    // listens for incoming "send-notification" events and processes the received notification asynchronously
    // socket.on("send-notification", (notification: string) => {
    //   console.log(`Notification from ${socket.id}: ${notification}`);
    // });
  });
};
