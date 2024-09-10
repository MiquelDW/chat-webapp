import { Server } from "socket.io";
import db from "../config/db";

// ==================== CONVERSATIONS ====================

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

// set up a stream for updated Conversations and make them available in real-time
export async function streamUpdatedConversations(io: Server) {
  try {
    console.log(`Stream updated Conversations with Prisma Client ...`);
    // stream() returns async iterable that receives all db change events related to the table
    const stream = await db.conversation.stream({ update: {} });

    // handle Prisma stream events
    for await (const event of stream) {
      console.log(`New updated conversation event:`, event);
      // send the updated conversation object to all connected users in real-time
      io.sockets.emit("updated-conversation", event.after);
    }
  } catch (err) {
    console.error("Error while streaming updated Conversations: ", err);
  }
}

// ==================== CONVERSATION MEMBERS ====================

// set up a stream for updated Conversations and make them available in real-time
export async function streamUpdatedConversationMembers(io: Server) {
  try {
    console.log(`Stream updated Conversation Members with Prisma Client ...`);
    // stream() returns async iterable that receives all db change events related to the table
    const stream = await db.conversationMember.stream({ update: {} });

    // handle Prisma stream events
    for await (const event of stream) {
      console.log(`New updated conversation member event:`, event);
      // send the updated conversation member object to all connected users in real-time
      io.sockets.emit("updated-conversation-member", event.after);
    }
  } catch (err) {
    console.error("Error while streaming updated Conversation Members: ", err);
  }
}
