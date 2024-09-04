import { Server } from "socket.io";
import db from "../config/db";

export async function streamChatMessages(io: Server) {
  console.log(`Stream new messages with Prisma Client ...`);
  // stream() returns async iterable that receives all db change events related to the table
  const stream = await db.message.stream({ create: {} });

  // Handle Prisma stream events
  for await (const event of stream) {
    console.log(`New event from Pulse: `, event);
    // send the created message to all connected users in real-time
    io.sockets.emit("chat-message", event.created);
  }
}
