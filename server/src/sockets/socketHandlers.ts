import { Server, Socket } from "socket.io";
import { messageHandler } from "./messageHandler";

export const socketHandlers = (io: Server) => {
  // listen for new socket (TCP) connections and disconnections
  // this is basically like an incoming HTTP request, but for WebSockets
  io.on("connection", async (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });

    // handle messages
    messageHandler(io, socket);
  });
};
