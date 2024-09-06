import { Server } from "socket.io";
import db from "../config/db";

// set up a stream for new Conversations and make them available in real-time
export async function streamNewConversations(io: Server) {
  try {
    console.log(`Stream new Conversations with Prisma Client ...`);
    // stream() returns async iterable that receives all db change events related to the table
    const stream = await db.conversation.stream({ create: {} });

    // handle Prisma stream events
    for await (const event of stream) {
      console.log(`New created conversation event:`, event);
      // send the created conversations to all connected users in real-time
      io.sockets.emit("new-conversation", event.created);
    }
  } catch (err) {
    console.error("Error while streaming new Conversations: ", err);
  }
}
