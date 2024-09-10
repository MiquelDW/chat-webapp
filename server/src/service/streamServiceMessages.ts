import { Server } from "socket.io";
import db from "../config/db";

// set up a stream for chat messages and make them available in real-time
export async function streamNewChatMessages(io: Server) {
  try {
    console.log(`Stream new Messages with Prisma Client ...`);
    // stream() returns async iterable that receives all db change events related to the table
    const stream = await db.message.stream({ create: {} });

    // handle Prisma stream events
    for await (const event of stream) {
      console.log(`New create Message event from Pulse: `, event);
      const { created } = event;
      io.sockets.to(created.conversationId).emit("roomMessage", created);
    }
  } catch (err) {
    console.error("Error while streaming new Messages: ", err);
  }
}
