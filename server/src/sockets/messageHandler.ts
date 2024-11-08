import { Server, Socket } from "socket.io";

export const messageHandler = (io: Server, socket: Socket) => {
  // listens for incoming "joinRoom" events to let a user join a given room where chat messages will be broadcasted to in real-time
  socket.on(`joinRoom`, (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });
};
