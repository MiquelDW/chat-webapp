import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

// create single WebSockets connection
export const getSocket = () => {
  const url = `http://localhost:8080`;

  if (!socket) {
    console.log("Starting WebSockets connection...");
    socket = io(url);
  }

  return socket;
};
