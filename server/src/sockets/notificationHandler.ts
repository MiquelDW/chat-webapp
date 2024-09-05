import { Server, Socket } from "socket.io";

export const notificationHandler = (io: Server, socket: Socket) => {
  // listens for incoming "send-notification" events and processes the received notification asynchronously
  socket.on("send-notification", (notification: string) => {
    console.log(`Notification from ${socket.id}: ${notification}`);
  });
};
