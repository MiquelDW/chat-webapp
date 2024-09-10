import { Server } from "socket.io";
import db from "../config/db";

// set up a stream for new Requests and make them available in real-time
export async function streamNewRequests(io: Server) {
  try {
    console.log(`Stream new Requests with Prisma Client ...`);
    // stream() returns async iterable that receives all db change events related to the table
    const stream = await db.request.stream({ create: {} });

    // handle Prisma stream events
    for await (const event of stream) {
      console.log(`New create request event:`, event);
      // send the created friend request to all connected users in real-time
      io.sockets.emit("friend-request", event.created);
    }
  } catch (err) {
    console.error("Error while streaming new Requests: ", err);
  }
}

export async function streamDeletedRequests(io: Server) {
  try {
    console.log(`Stream deleted Requests with Prisma Client ...`);
    const stream = await db.request.stream({ delete: {} });

    // handle Prisma stream events
    for await (const event of stream) {
      console.log(`New delete request event:`, event);
      // send the deleted friend request to all connected users in real-time
      io.sockets.emit("delete-friend-request", event.deleted);
    }
  } catch (err) {
    console.error("Error while streaming deleted Requests: ", err);
  }
}
